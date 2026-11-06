import type { BondData, Interventor, PolicySummaryData } from '../types/policy'

/**
 * Busca automáticamente un archivo de logo en `src/assets/` (ej. logo.png, logo.jpg, logo.jpeg, logo.svg, logo.webp).
 * Si aún no se ha colocado el archivo en `src/assets/`, simplemente deja el espacio reservado en el encabezado superior izquierdo.
 */
const logoAssets = import.meta.glob<string>('../assets/*logo*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default'
})

function getLogoAssetUrl(): string | null {
  const urls = Object.values(logoAssets)
  return urls.length > 0 ? (urls[0] ?? null) : null
}

interface LoadedLogoImage {
  jpegBytes: Uint8Array
  width: number
  height: number
}

/**
 * Convierte cualquier imagen del logo en bytes JPEG listos para incrustar como XObject en el PDF.
 */
async function loadLogoAsJpeg(url: string): Promise<LoadedLogoImage | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || img.width || 300
        const naturalHeight = img.naturalHeight || img.height || 100
        const canvas = document.createElement('canvas')
        canvas.width = naturalWidth
        canvas.height = naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        // Fondo blanco para evitar transparencias negras en JPEG
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        const base64 = dataUrl.split(',')[1]
        if (!base64) {
          resolve(null)
          return
        }
        const binaryStr = atob(base64)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i) & 0xff
        }
        resolve({
          jpegBytes: bytes,
          width: naturalWidth,
          height: naturalHeight
        })
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/**
 * Normaliza caracteres especiales Unicode a equivalentes compatibles con WinAnsiEncoding (ISO-8859-1 / Windows-1252).
 */
function sanitizeWinAnsi(text: string): string {
  return text
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
}

/**
 * Escapa paréntesis y barras invertidas para literales de texto PDF `(...)`.
 */
function escapePdfString(text: string): string {
  const clean = sanitizeWinAnsi(text)
  let out = ''
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!
    const code = clean.charCodeAt(i)
    if (ch === '\\' || ch === '(' || ch === ')') {
      out += '\\' + ch
    } else if (code >= 0x20 && code <= 0xff) {
      out += ch
    } else {
      out += ' '
    }
  }
  return out
}

/**
 * Estima el ancho en puntos (pt) de una cadena en Helvetica / Arial.
 */
function measureTextWidth(text: string, fontSize: number, bold = false): number {
  const clean = sanitizeWinAnsi(text)
  let totalUnits = 0
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!
    let w = 556
    if ('iIlj|!.,:;'.includes(ch)) w = 250
    else if (ch === ' ') w = 278
    else if ('ftrt()-/'.includes(ch)) w = 333
    else if ('sJczvxyk'.includes(ch)) w = 500
    else if ('mwMW@%'.includes(ch)) w = 833
    else if (ch >= 'A' && ch <= 'Z') w = bold ? 700 : 667
    else if ('ÁÉÍÓÚÑÜ'.includes(ch)) w = bold ? 700 : 667
    else if (ch >= '0' && ch <= '9') w = 556
    else w = bold ? 580 : 540
    totalUnits += w
  }
  return (totalUnits / 1000) * fontSize
}

interface TextSegment {
  text: string
  bold?: boolean
  underline?: boolean
  colorRgb?: [number, number, number]
}

interface PositionedToken {
  text: string
  bold: boolean
  underline: boolean
  colorRgb: [number, number, number]
  width: number
}

/**
 * Divide una lista de segmentos con estilo en líneas ajustadas a `maxWidth`.
 */
function wrapRichSegments(
  segments: TextSegment[],
  fontSize: number,
  maxWidth: number
): PositionedToken[][] {
  const words: PositionedToken[] = []

  for (const seg of segments) {
    const bold = Boolean(seg.bold)
    const underline = Boolean(seg.underline)
    const colorRgb: [number, number, number] = seg.colorRgb ?? [0, 0, 0]
    const parts = sanitizeWinAnsi(seg.text).split(/(\s+)/)

    for (const part of parts) {
      if (!part) continue
      words.push({
        text: part,
        bold,
        underline,
        colorRgb,
        width: measureTextWidth(part, fontSize, bold)
      })
    }
  }

  const lines: PositionedToken[][] = []
  let currentLine: PositionedToken[] = []
  let currentWidth = 0

  for (const token of words) {
    const isWhitespace = /^\s+$/.test(token.text)
    if (currentLine.length === 0 && isWhitespace) {
      continue
    }

    if (currentWidth + token.width > maxWidth && currentLine.length > 0 && !isWhitespace) {
      // Eliminar espacio final de la línea actual
      while (currentLine.length > 0 && /^\s+$/.test(currentLine[currentLine.length - 1]!.text)) {
        currentLine.pop()
      }
      lines.push(currentLine)
      currentLine = [token]
      currentWidth = token.width
    } else {
      currentLine.push(token)
      currentWidth += token.width
    }
  }

  if (currentLine.length > 0) {
    while (currentLine.length > 0 && /^\s+$/.test(currentLine[currentLine.length - 1]!.text)) {
      currentLine.pop()
    }
    if (currentLine.length > 0) {
      lines.push(currentLine)
    }
  }

  return lines
}

function parseValidityDates(
  bondData?: BondData | null,
  policyData?: PolicySummaryData | null
): { desde: string; hasta: string } {
  if (bondData?.validFrom || bondData?.validTo) {
    return {
      desde: bondData.validFrom || '',
      hasta: bondData.validTo || ''
    }
  }

  const rawBondValidity = bondData?.validity?.trim() || ''
  if (rawBondValidity && rawBondValidity !== 'Desde — Hasta' && rawBondValidity !== 'Desde - Hasta') {
    if (rawBondValidity.includes('/')) {
      const [fromPart, toPart] = rawBondValidity.split('/')
      return {
        desde: (fromPart || '').replace(/^Desde\s*:?\s*/i, '').trim(),
        hasta: (toPart || '').replace(/^Hasta\s*:?\s*/i, '').trim()
      }
    }
    const match = rawBondValidity.match(/Desde\s*(.*?)\s*Hasta\s*(.*)/i)
    if (match) {
      const d = (match[1] || '').replace(/^[—\-–\s]+|[—\-–\s]+$/g, '').trim()
      const h = (match[2] || '').replace(/^[—\-–\s]+|[—\-–\s]+$/g, '').trim()
      return { desde: d, hasta: h }
    }
  }

  if (policyData?.validFrom || policyData?.validTo) {
    return {
      desde: policyData.validFrom || '',
      hasta: policyData.validTo || ''
    }
  }

  if (policyData?.validity && policyData.validity.includes('/')) {
    const [fromPart, toPart] = policyData.validity.split('/')
    return {
      desde: (fromPart || '').trim(),
      hasta: (toPart || '').trim()
    }
  }

  return { desde: '', hasta: '' }
}

function cleanValue(val?: string | null): string {
  if (!val) return ''
  const trimmed = val.trim()
  if (trimmed === '—' || trimmed === '-' || trimmed === 'N/D') return ''
  return trimmed
}

/**
 * Construye y descarga el PDF de Confirmación de Fianza con el formato oficial de Seguros América.
 */
export async function downloadBondConfirmationPdf(params: {
  policy?: PolicySummaryData | null
  bond?: BondData | null
  interventors?: Interventor[]
}): Promise<void> {
  const { policy, bond, interventors } = params

  const logoUrl = getLogoAssetUrl()
  const loadedLogo = logoUrl ? await loadLogoAsJpeg(logoUrl) : null

  // Dimensiones Página Tamaño Carta (Letter: 612 x 792 pt)
  const pageWidth = 612
  const leftMargin = 56
  const rightMargin = 56
  const contentWidth = pageWidth - leftMargin - rightMargin

  const ops: string[] = []

  const drawText = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    options?: {
      bold?: boolean
      underline?: boolean
      colorRgb?: [number, number, number]
    }
  ) => {
    const bold = Boolean(options?.bold)
    const underline = Boolean(options?.underline)
    const [r, g, b] = options?.colorRgb ?? [0, 0, 0]
    const fontRef = bold ? '/F2' : '/F1'

    ops.push('q')
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`)
    ops.push('BT')
    ops.push(`${fontRef} ${fontSize} Tf`)
    ops.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`)
    ops.push(`(${escapePdfString(text)}) Tj`)
    ops.push('ET')

    if (underline) {
      const w = measureTextWidth(text, fontSize, bold)
      ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`)
      ops.push('0.75 w')
      ops.push(`${x.toFixed(2)} ${(y - 2).toFixed(2)} m ${(x + w).toFixed(2)} ${(y - 2).toFixed(2)} l S`)
    }
    ops.push('Q')
  }

  const drawRichParagraph = (
    segments: TextSegment[],
    startX: number,
    startY: number,
    fontSize: number,
    lineHeight: number,
    maxWidth: number
  ): number => {
    const lines = wrapRichSegments(segments, fontSize, maxWidth)
    let cursorY = startY

    for (const line of lines) {
      let cursorX = startX
      // Agrupar tokens contiguos con el mismo estilo para emitir un único comando Tj por tramo
      const mergedRuns: PositionedToken[] = []
      for (const token of line) {
        const prev = mergedRuns[mergedRuns.length - 1]
        if (
          prev &&
          prev.bold === token.bold &&
          prev.underline === token.underline &&
          prev.colorRgb[0] === token.colorRgb[0] &&
          prev.colorRgb[1] === token.colorRgb[1] &&
          prev.colorRgb[2] === token.colorRgb[2]
        ) {
          prev.text += token.text
          prev.width = measureTextWidth(prev.text, fontSize, prev.bold)
        } else {
          mergedRuns.push({ ...token })
        }
      }

      for (const run of mergedRuns) {
        drawText(run.text, cursorX, cursorY, fontSize, {
          bold: run.bold,
          underline: run.underline,
          colorRgb: run.colorRgb
        })
        cursorX += run.width
      }
      cursorY -= lineHeight
    }

    return cursorY
  }

  // =========================================================================
  // 1. ENCABEZADO SUPERIOR
  //    - Izquierda: Espacio reservado para el logo (se dibuja si existe en src/assets/)
  //    - Derecha: Dirección y teléfonos de Seguros América
  // =========================================================================
  if (loadedLogo) {
    const maxLogoW = 165
    const maxLogoH = 54
    const scale = Math.min(maxLogoW / loadedLogo.width, maxLogoH / loadedLogo.height)
    const drawW = loadedLogo.width * scale
    const drawH = loadedLogo.height * scale
    const logoX = leftMargin
    const logoY = 742 - drawH

    ops.push('q')
    ops.push(`${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${logoX.toFixed(2)} ${logoY.toFixed(2)} cm`)
    ops.push('/Im1 Do')
    ops.push('Q')
  }

  // Datos de contacto en esquina superior derecha
  const headerFontSize = 8
  const col1X = 348
  const col2X = 456

  drawText('Centro BAC', col1X, 732, headerFontSize, { bold: true })
  drawText('Km. 4 ½ C. Masaya,', col1X, 721, headerFontSize, { bold: true })
  drawText('Managua, Nicaragua', col1X, 710, headerFontSize, { bold: true })

  drawText('PBX: (505) 2274-4200', col2X, 732, headerFontSize, { bold: true })
  drawText('Fax: (505) 2274-4202', col2X, 721, headerFontSize, { bold: true })
  drawText('Apdo. Postal: 6114', col2X, 710, headerFontSize, { bold: true })

  // =========================================================================
  // 2. TÍTULO PRINCIPAL (Arial 14, Negrita y Centrado)
  // =========================================================================
  const bondNumber = cleanValue(bond?.bondNumber) || cleanValue(policy?.policyNumber) || ''
  const titleText = bondNumber
    ? `CONFIRMACIÓN DE FIANZA N° ${bondNumber}`
    : 'CONFIRMACIÓN DE FIANZA N°'
  const titleFontSize = 14
  const titleWidth = measureTextWidth(titleText, titleFontSize, true)
  const titleX = Math.max(leftMargin, (pageWidth - titleWidth) / 2)
  let currentY = 635

  drawText(titleText, titleX, currentY, titleFontSize, { bold: true })

  // =========================================================================
  // 3. PÁRRAFO INTRODUCTORIO (Arial 12)
  // =========================================================================
  currentY = 582
  const bodyFontSize = 12
  const bodyLineHeight = 16

  const introBoldPart = bondNumber
    ? `SEGUROS AMÉRICA, S.A. confirma que ha emitido la fianza N° ${bondNumber}`
    : 'SEGUROS AMÉRICA, S.A. confirma que ha emitido la fianza N°'

  currentY = drawRichParagraph(
    [
      { text: introBoldPart, bold: true },
      {
        text: ', la cual es auténtica, cuenta con nuestro respaldo y se encuentra registrada de la siguiente manera:',
        bold: false
      }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    bodyLineHeight,
    contentWidth
  )

  // =========================================================================
  // 4. SUBTÍTULO: DATOS DE LA FIANZA (Arial 12, Negrita, Subrayado y Alineado a la Izquierda)
  // =========================================================================
  currentY -= 16
  drawText('DATOS DE LA FIANZA:', leftMargin, currentY, bodyFontSize, {
    bold: true,
    underline: true
  })

  // =========================================================================
  // 5. CAMPOS DE DATOS DE LA FIANZA (Arial 12, Alineado a la Izquierda)
  // =========================================================================
  currentY -= 24
  const fieldLineHeight = 17

  // 5.1 TIPO DE FIANZA
  const bondType = cleanValue(bond?.bondType)
  const bondTypeDesc = cleanValue(bond?.bondTypeDescription)
  let tipoFianzaDisplay = bondType
  if (bondType && bondTypeDesc) {
    tipoFianzaDisplay = `${bondType} (${bondTypeDesc})`
  } else if (!bondType && bondTypeDesc) {
    tipoFianzaDisplay = bondTypeDesc
  }

  currentY = drawRichParagraph(
    [
      { text: 'TIPO DE FIANZA: ', bold: false },
      { text: tipoFianzaDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.2 MONTO DE LA FIANZA
  const montoDisplay = cleanValue(bond?.amount)
  currentY = drawRichParagraph(
    [
      { text: 'MONTO DE LA FIANZA: ', bold: false },
      { text: montoDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.3 MONEDA
  const monedaDisplay = cleanValue(bond?.currency) || cleanValue(policy?.currency)
  currentY = drawRichParagraph(
    [
      { text: 'MONEDA: ', bold: false },
      { text: monedaDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.4 PERÍODO DE LA FIANZA
  const rawPeriod = cleanValue(bond?.period)
  let periodoDisplay = '      días'
  if (rawPeriod) {
    periodoDisplay = /d[ií]a/i.test(rawPeriod) ? rawPeriod : `${rawPeriod} días`
  }
  currentY = drawRichParagraph(
    [
      { text: 'PERÍODO DE LA FIANZA: ', bold: false },
      { text: periodoDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.5 VIGENCIA (Desde / Hasta alineado verticalmente como en el formato)
  const { desde, hasta } = parseValidityDates(bond, policy)
  const vigenciaPrefix = 'VIGENCIA: '
  const vigenciaIndent = measureTextWidth(vigenciaPrefix, bodyFontSize, false)

  drawText(`${vigenciaPrefix}Desde${desde ? ` ${desde}` : ''}`, leftMargin, currentY, bodyFontSize)
  currentY -= fieldLineHeight
  drawText(`Hasta${hasta ? ` ${hasta}` : ''}`, leftMargin + vigenciaIndent, currentY, bodyFontSize)
  currentY -= fieldLineHeight

  // 5.6 AFIANZADO
  const fallbackAfianzado =
    interventors?.find((i) => i.role?.toUpperCase() === 'ASEGURADO' || i.role?.toUpperCase() === 'TENEDOR')
      ?.name || ''
  const afianzadoDisplay = cleanValue(bond?.bondedParty) || cleanValue(fallbackAfianzado)
  currentY = drawRichParagraph(
    [
      { text: 'AFIANZADO: ', bold: false },
      { text: afianzadoDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.7 BENEFICIARIO
  const fallbackBeneficiario =
    interventors?.find((i) => i.role?.toUpperCase() === 'BENEFICIARIO')?.name || ''
  const beneficiarioDisplay = cleanValue(bond?.beneficiary) || cleanValue(fallbackBeneficiario)
  currentY = drawRichParagraph(
    [
      { text: 'BENEFICIARIO: ', bold: false },
      { text: beneficiarioDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.8 CONTRATO GARANTIZADO
  const contratoDisplay = cleanValue(bond?.guaranteedContract)
  currentY = drawRichParagraph(
    [
      { text: 'CONTRATO GARANTIZADO: ', bold: false },
      { text: contratoDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // 5.9 OBJETO DE LA FIANZA
  const objetoDisplay = cleanValue(bond?.bondPurpose)
  currentY = drawRichParagraph(
    [
      { text: 'OBJETO DE LA FIANZA: ', bold: false },
      { text: objetoDisplay, bold: false }
    ],
    leftMargin,
    currentY,
    bodyFontSize,
    fieldLineHeight,
    contentWidth
  )

  // =========================================================================
  // 6. PIE DE PÁGINA (Arial 10)
  // =========================================================================
  const footerFontSize = 10
  const footerY1 = Math.min(currentY - 45, 115)
  const footerY2 = footerY1 - 13

  drawText(
    'Para cualquier información puede contactarse a la Unidad de Fianzas de Seguros América, S.A. al Teléfono',
    leftMargin,
    footerY1,
    footerFontSize
  )

  const footerLine2Prefix = '2274-4200, extensiones 2603 y/o 2652 o bien al correo electrónico '
  const footerEmail = 'unidad.fianzas@segurosamerica.com.ni'
  drawText(footerLine2Prefix, leftMargin, footerY2, footerFontSize)
  const emailX = leftMargin + measureTextWidth(footerLine2Prefix, footerFontSize, false)
  drawText(footerEmail, emailX, footerY2, footerFontSize, {
    underline: true,
    colorRgb: [0.05, 0.25, 0.8]
  })

  // =========================================================================
  // ENSAMBLAJE DEL ARCHIVO PDF 1.4
  // =========================================================================
  const contentStream = ops.join('\n')
  const pdfBinary = buildPdfDocument(contentStream, loadedLogo)

  const blob = new Blob([pdfBinary.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileSuffix = bondNumber ? `_${bondNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}` : ''
  link.href = url
  link.download = `Confirmacion_Fianza${fileSuffix}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function stringToLatin1Bytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff
  }
  return bytes
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0
  for (const arr of arrays) totalLength += arr.length
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

function buildPdfDocument(contentStream: string, logo: LoadedLogoImage | null): Uint8Array {
  const chunks: Uint8Array[] = []
  const offsets: number[] = []
  let currentLength = 0

  const pushString = (str: string) => {
    const bytes = stringToLatin1Bytes(str)
    chunks.push(bytes)
    currentLength += bytes.length
  }

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes)
    currentLength += bytes.length
  }

  const startObject = (objNum: number) => {
    offsets[objNum] = currentLength
    pushString(`${objNum} 0 obj\n`)
  }

  const endObject = () => {
    pushString('\nendobj\n')
  }

  // Cabecera PDF 1.4
  pushString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')

  // Objeto 1: Catalog
  startObject(1)
  pushString('<< /Type /Catalog /Pages 2 0 R >>')
  endObject()

  // Objeto 2: Pages
  startObject(2)
  pushString('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  endObject()

  // Objeto 3: Page (Letter 612 x 792)
  const xObjectDict = logo ? ' /XObject << /Im1 6 0 R >>' : ''
  startObject(3)
  pushString(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>${xObjectDict} >> /Contents 7 0 R >>`
  )
  endObject()

  // Objeto 4: Fuente Regular (Helvetica / Arial compatible con WinAnsiEncoding)
  startObject(4)
  pushString('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  endObject()

  // Objeto 5: Fuente Negrita (Helvetica-Bold / Arial Bold compatible con WinAnsiEncoding)
  startObject(5)
  pushString('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  endObject()

  // Objeto 6: Imagen de Logo opcional (o Null si no hay logo)
  startObject(6)
  if (logo) {
    pushString(
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.jpegBytes.length} >>\nstream\n`
    )
    pushBytes(logo.jpegBytes)
    pushString('\nendstream')
  } else {
    pushString('null')
  }
  endObject()

  // Objeto 7: Content Stream de la página
  const contentBytes = stringToLatin1Bytes(contentStream)
  startObject(7)
  pushString(`<< /Length ${contentBytes.length} >>\nstream\n`)
  pushBytes(contentBytes)
  pushString('\nendstream')
  endObject()

  // Tabla XREF
  const totalObjects = 7
  const xrefStart = currentLength
  pushString(`xref\n0 ${totalObjects + 1}\n`)
  pushString('0000000000 65535 f \n')
  for (let i = 1; i <= totalObjects; i++) {
    const offsetStr = String(offsets[i] ?? 0).padStart(10, '0')
    pushString(`${offsetStr} 00000 n \n`)
  }

  // Trailer
  pushString(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`)

  return concatUint8Arrays(chunks)
}

