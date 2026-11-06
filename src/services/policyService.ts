import { apiFetch, ApiError } from './api'
import type { Interventor, Coverage, PolicyDetailsResponse, RenewalResponse, BondData } from '../types/policy'

// Datos predeterminados de respaldo (Fallback si el backend local aún no está activo)
const MOCK_POLICY_RESPONSE: PolicyDetailsResponse = {
  policy: {
    id: '1',
    policyNumber: 'RCO1-3535431',
    status: 'NO VIGENTE',
    product: 'RCO-Responsabilidad Civil',
    validity: '13-08-2026 (5:22 PM) / 12-08-2027 (24:00 Hrs)',
    currency: 'US',
    insuredUnit: 'SERPENTO / 125',
    plateNumber: 'SP-10293'
  },
  interventors: [
    {
      id: 1,
      role: 'TENEDOR',
      name: 'SENEYDA DEL ROSARIO REYES',
      idNumber: '40307110780001R'
    },
    {
      id: 2,
      role: 'ASEGURADO',
      name: 'SENEYDA DEL ROSARIO REYES',
      idNumber: '40307110780001R'
    }
  ],
  coverages: [
    { id: 1, name: 'Daños a Terceros (Responsabilidad Civil)', limit: 'US$ 10,000.00', deductible: 'US$ 0.00', status: 'Incluido' },
    { id: 2, name: 'Lesiones Corporales a Terceros', limit: 'US$ 15,000.00', deductible: 'US$ 0.00', status: 'Incluido' },
    { id: 3, name: 'Gastos Médicos a Ocupantes', limit: 'US$ 2,500.00', deductible: 'US$ 50.00', status: 'Incluido' },
    { id: 4, name: 'Asistencia Legal y Fianza', limit: 'US$ 5,000.00', deductible: 'US$ 0.00', status: 'Incluido' }
  ],
  bond: {
    bondNumber: 'RCO1-3535431',
    bondType: 'Plan',
    bondTypeDescription: 'Mantenimiento de oferta, anticipo, cumplimiento, vicios ocultos…',
    amount: 'US$ 10,000.00',
    currency: 'US',
    period: '365 días',
    validFrom: '13-08-2026 (5:22 PM)',
    validTo: '12-08-2027 (24:00 Hrs)',
    validity: 'Desde 13-08-2026 (5:22 PM) — Hasta 12-08-2027 (24:00 Hrs)',
    bondedParty: 'SENEYDA DEL ROSARIO REYES',
    beneficiary: '—',
    guaranteedContract: 'Datos particulares en sistema: @produccion(DA1PARFI:B03.codasegurado-datos_fianza_asegurados-NEIV)',
    bondPurpose: 'Incluir primer párrafo de las condiciones particulares de la fianza (PER por cada plan)'
  }
}

/**
 * Normaliza y mapea los datos de la fianza provenientes del API (soporta llaves en inglés o español,
 * tanto anidadas en `bond` / `fianza` como en la raíz de `policy` o `interventors`).
 */
export function normalizeBondFromApi(rawData: any): BondData {
  const rawBond = rawData?.bond || rawData?.fianza || rawData?.datosFianza || {}
  const rawPolicy = rawData?.policy || rawData?.poliza || rawData || {}
  const rawInterventors: Interventor[] = Array.isArray(rawData?.interventors)
    ? rawData.interventors
    : Array.isArray(rawData?.intervinientes)
      ? rawData.intervinientes
      : []

  const afianzadoInterventor = rawInterventors.find((i) =>
    ['AFIANZADO', 'ASEGURADO', 'TENEDOR'].includes(i.role?.toUpperCase?.() || '')
  )
  const beneficiarioInterventor = rawInterventors.find(
    (i) => i.role?.toUpperCase?.() === 'BENEFICIARIO'
  )

  const validFrom =
    rawBond.validFrom ||
    rawBond.desde ||
    rawBond.fechaInicio ||
    rawPolicy.validFrom ||
    rawPolicy.desde ||
    rawPolicy.fechaInicio ||
    ''

  const validTo =
    rawBond.validTo ||
    rawBond.hasta ||
    rawBond.fechaFin ||
    rawPolicy.validTo ||
    rawPolicy.hasta ||
    rawPolicy.fechaFin ||
    ''

  return {
    bondNumber:
      rawBond.bondNumber ||
      rawBond.numeroFianza ||
      rawPolicy.policyNumber ||
      rawPolicy.numeroPoliza ||
      '',
    bondType:
      rawBond.bondType ||
      rawBond.tipoFianza ||
      rawBond.plan ||
      rawPolicy.product ||
      rawPolicy.producto ||
      '',
    bondTypeDescription:
      rawBond.bondTypeDescription ||
      rawBond.descripcionTipoFianza ||
      rawBond.modalidad ||
      '',
    amount:
      rawBond.amount ||
      rawBond.monto ||
      rawBond.montoFianza ||
      rawPolicy.amount ||
      rawPolicy.monto ||
      '',
    currency:
      rawBond.currency ||
      rawBond.moneda ||
      rawPolicy.currency ||
      rawPolicy.moneda ||
      '',
    period:
      rawBond.period ||
      rawBond.periodo ||
      rawBond.periodoFianza ||
      rawBond.dias ||
      rawPolicy.period ||
      rawPolicy.periodo ||
      '',
    validFrom,
    validTo,
    validity:
      rawBond.validity ||
      rawBond.vigencia ||
      (validFrom || validTo ? `Desde ${validFrom} — Hasta ${validTo}` : rawPolicy.validity || ''),
    bondedParty:
      rawBond.bondedParty ||
      rawBond.afianzado ||
      rawPolicy.bondedParty ||
      rawPolicy.afianzado ||
      afianzadoInterventor?.name ||
      '',
    beneficiary:
      rawBond.beneficiary ||
      rawBond.beneficiario ||
      rawPolicy.beneficiary ||
      rawPolicy.beneficiario ||
      beneficiarioInterventor?.name ||
      '',
    guaranteedContract:
      rawBond.guaranteedContract ||
      rawBond.contratoGarantizado ||
      rawBond.datosParticulares ||
      rawPolicy.guaranteedContract ||
      rawPolicy.contratoGarantizado ||
      '',
    bondPurpose:
      rawBond.bondPurpose ||
      rawBond.objetoFianza ||
      rawBond.condicionesParticulares ||
      rawPolicy.bondPurpose ||
      rawPolicy.objetoFianza ||
      ''
  }
}

export const policyService = {
  /**
   * Obtiene la información completa del expediente de la póliza
   */
  async getPolicyDetails(policyNumber: string = 'RCO1-3535431'): Promise<PolicyDetailsResponse> {
    try {
      const response = await apiFetch<PolicyDetailsResponse>(`/policies/${policyNumber}`)
      return {
        ...response,
        bond: normalizeBondFromApi(response)
      }
    } catch (error: any) {
      console.warn('Fallback a datos mock por desconexión de backend:', error.message)
      // Si ocurre error de red (backend offline), devolvemos datos fallback estructurados
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE
      }
      throw error
    }
  },

  /**
   * Obtiene los intervinientes asociados a una póliza
   */
  async getInterventors(policyNumber: string = 'RCO1-3535431'): Promise<Interventor[]> {
    try {
      return await apiFetch<Interventor[]>(`/policies/${policyNumber}/interventors`)
    } catch (error: any) {
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE.interventors
      }
      throw error
    }
  },

  /**
   * Obtiene las coberturas contratadas de una póliza
   */
  async getCoverages(policyNumber: string = 'RCO1-3535431'): Promise<Coverage[]> {
    try {
      return await apiFetch<Coverage[]>(`/policies/${policyNumber}/coverages`)
    } catch (error: any) {
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE.coverages
      }
      throw error
    }
  },

  /**
   * Obtiene los datos de la fianza asociada a una póliza
   */
  async getBondDetails(policyNumber: string = 'RCO1-3535431'): Promise<BondData | undefined> {
    try {
      return await apiFetch<BondData>(`/policies/${policyNumber}/bond`)
    } catch (error: unknown) {
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE.bond
      }
      throw error
    }
  },

  /**
   * Envía la solicitud de renovación de póliza al backend
   */
  async requestRenewal(policyNumber: string, notes?: string): Promise<RenewalResponse> {
    try {
      return await apiFetch<RenewalResponse>(`/policies/${policyNumber}/renew`, {
        method: 'POST',
        body: JSON.stringify({ policyNumber, notes })
      })
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 0) {
        // Simulación exitosa si no hay backend activo
        return {
          success: true,
          message: `Solicitud de renovación para la póliza ${policyNumber} enviada correctamente.`,
          referenceNumber: `REN-${Math.floor(100000 + Math.random() * 900000)}`
        }
      }
      throw error
    }
  }
}
