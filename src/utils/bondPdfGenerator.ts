<template>
  <!-- Contenedor desplazado fuera de la pantalla para que el usuario no lo vea -->
  <div class="pdf-offscreen-container">
    <div ref="pdfElement" class="pdf-content">
      
      <!-- Encabezado -->
      <div class="header">
        <div>
          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo" />
        </div>
        <div class="contact-info">
          <div>
            Centro BAC<br>
            Km. 4 ½ C. Masaya,<br>
            Managua, Nicaragua
          </div>
          <div>
            PBX: (505) 2274-4200<br>
            Fax: (505) 2274-4202<br>
            Apdo. Postal: 6114
          </div>
        </div>
      </div>

      <!-- Título -->
      <div class="title">
        CONFIRMACIÓN DE FIANZA N° {{ bondNumber }}
      </div>

      <!-- Introducción -->
      <div class="intro">
        <strong>SEGUROS AMÉRICA, S.A. confirma que ha emitido la fianza N° {{ bondNumber }}</strong>, la cual es auténtica, cuenta con nuestro respaldo y se encuentra registrada de la siguiente manera:
      </div>

      <!-- Subtítulo -->
      <div class="subtitle">DATOS DE LA FIANZA:</div>

      <!-- Datos -->
      <div class="data-grid">
        <div><strong>TIPO DE FIANZA:</strong> {{ tipoFianzaDisplay }}</div>
        <div><strong>MONTO DE LA FIANZA:</strong> {{ cleanValue(bond?.amount) }}</div>
        <div><strong>MONEDA:</strong> {{ cleanValue(bond?.currency) || cleanValue(policy?.currency) }}</div>
        <div><strong>PERÍODO DE LA FIANZA:</strong> <span v-html="periodoDisplay"></span></div>
        
        <div class="vigencia-row">
          <strong>VIGENCIA:</strong>
          <div class="vigencia-dates">
            <div>Desde {{ vigencia.desde }}</div>
            <div>Hasta {{ vigencia.hasta }}</div>
          </div>
        </div>

        <div><strong>AFIANZADO:</strong> {{ afianzadoDisplay }}</div>
        <div><strong>BENEFICIARIO:</strong> {{ beneficiarioDisplay }}</div>
        <div><strong>CONTRATO GARANTIZADO:</strong> {{ cleanValue(bond?.guaranteedContract) }}</div>
        <div><strong>OBJETO DE LA FIANZA:</strong> {{ cleanValue(bond?.bondPurpose) }}</div>
      </div>

      <!-- Footer -->
      <div class="footer">
        Para cualquier información puede contactarse a la Unidad de Fianzas de Seguros América, S.A. al Teléfono 2274-4200, extensiones 2603 y/o 2652 o bien al correo electrónico 
        <a href="mailto:unidad.fianzas@segurosamerica.com.ni">unidad.fianzas@segurosamerica.com.ni</a>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { BondData, Interventor, PolicySummaryData } from '../types/policy';

const props = defineProps<{
  policy?: PolicySummaryData | null;
  bond?: BondData | null;
  interventors?: Interventor[];
}>();

const pdfElement = ref<HTMLElement | null>(null);

// Importar Logo
const logoAssets = import.meta.glob<string>('../assets/*logo*.{png,jpg,jpeg,webp,svg}', { eager: true, import: 'default' });
const logoUrl = computed(() => Object.values(logoAssets)[0] || null);

// Lógica de formateo (Computeds)
const cleanValue = (val?: string | null) => (val?.trim() === '—' || val?.trim() === '-' || val?.trim() === 'N/D' || !val) ? '' : val.trim();

const bondNumber = computed(() => cleanValue(props.bond?.policyNumber) || cleanValue(props.policy?.policyNumber) || '');

const tipoFianzaDisplay = computed(() => {
  const type = cleanValue(props.bond?.bondType);
  const desc = cleanValue(props.bond?.bondTypeDescription);
  return type && desc ? `${type} (${desc})` : (type || desc || '');
});

const periodoDisplay = computed(() => {
  const raw = cleanValue(props.bond?.period);
  return raw ? (/d[ií]a/i.test(raw) ? raw : `${raw} días`) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;días';
});

const vigencia = computed(() => {
  const raw = props.bond?.validity?.trim() || '';
  if (/^Del\s+/i.test(raw)) {
    const match = raw.match(/Del\s+(.*?)\s+Al\s+(.*)/i);
    if (match) return { desde: match[1].trim(), hasta: match[2].trim() };
  }
  return {
    desde: props.policy?.validFrom || '',
    hasta: props.policy?.validTo || ''
  };
});

const afianzadoDisplay = computed(() => {
  const fallback = props.interventors?.find(i => ['ASEGURADO', 'TENEDOR'].includes(i.role?.toUpperCase() || ''))?.name || '';
  return cleanValue(props.bond?.bondedParty) || cleanValue(fallback);
});

const beneficiarioDisplay = computed(() => {
  const fallback = props.interventors?.find(i => i.role?.toUpperCase() === 'BENEFICIARIO')?.name || '';
  return cleanValue(props.bond?.beneficiary) || cleanValue(fallback);
});

// Función exportada para generar el PDF
const generatePdf = async () => {
  if (!pdfElement.value) return;

  const fileSuffix = bondNumber.value ? `_${bondNumber.value.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const options = {
    margin: [20, 20, 20, 20],
    filename: `Confirmacion_Fianza${fileSuffix}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  await html2pdf().set(options).from(pdfElement.value).save();
};

// Exponer la función para poder llamarla desde el componente padre usando un ref
defineExpose({ generatePdf });
</script>

<style scoped>
.pdf-offscreen-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
}
.pdf-content {
  width: 170mm; /* Ancho utilizable en formato Carta con 20mm de margen */
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  font-size: 12pt;
  line-height: 1.4;
}
.header { display: flex; justify-content: space-between; margin-bottom: 40px; }
.logo { max-width: 165px; max-height: 54px; }
.contact-info { display: flex; gap: 20px; font-size: 8pt; font-weight: bold; text-align: left; }
.title { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 30px; }
.intro { margin-bottom: 20px; }
.subtitle { font-weight: bold; text-decoration: underline; margin-bottom: 15px; }
.data-grid { display: flex; flex-direction: column; gap: 8px; }
.vigencia-row { display: flex; gap: 5px; }
.footer { margin-top: 60px; font-size: 10pt; }
.footer a { color: rgb(13, 64, 204); text-decoration: underline; }
</style>
  
