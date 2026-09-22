<script setup lang="ts">
import type { BondData } from '../types/policy'

withDefaults(
  defineProps<{
    bondData?: BondData | null
    loading?: boolean
  }>(),
  {
    bondData: () => ({
      bondType: 'Plan',
      bondTypeDescription: 'Mantenimiento de oferta, anticipo, cumplimiento, vicios ocultos…',
      amount: '—',
      currency: '—',
      period: '—',
      validity: 'Desde — Hasta',
      bondedParty: '—',
      beneficiary: '—',
      guaranteedContract: 'Datos particulares en sistema: @produccion(DA1PARFI:B03.codasegurado-datos_fianza_asegurados-NEIV)',
      bondPurpose: 'Incluir primer párrafo de las condiciones particulares de la fianza (PER por cada plan)'
    }),
    loading: false
  }
)
</script>

<template>
  <div class="card-custom bond-card p-4 md:p-5 mb-5">
    <!-- Fila Superior: Título de Sección y Badge de Modalidad -->
    <div class="top-row flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-4 pb-4">
      <div class="left-section flex align-items-center gap-3">
        <!-- Contenedor Icono Escudo / Fianza -->
        <div class="bond-icon-box flex align-items-center justify-content-center">
          <i class="pi pi-shield text-blue-600 text-xl"></i>
        </div>
        <div class="flex flex-column gap-1">
          <span class="label-title">GARANTÍA CONTRACTUAL</span>
          <h2 class="card-title font-extrabold m-0 text-slate-800 text-xl md:text-2xl tracking-tight">
            Datos de la Fianza
          </h2>
        </div>
      </div>

      <div class="right-section flex flex-column sm:align-items-end gap-1">
        <span class="label-title">MODALIDAD</span>
        <div class="badge-modalidad">
          <span class="dot"></span>
          <span>{{ loading ? 'CARGANDO...' : (bondData?.bondType || 'PLAN') }}</span>
        </div>
      </div>
    </div>

    <!-- Divisor sutil horizontal -->
    <div class="divider-line my-3"></div>

    <!-- Fila 1: TIPO DE FIANZA, MONTO DE LA FIANZA, MONEDA -->
    <div class="grid pt-2">
      <!-- 1. TIPO DE FIANZA -->
      <div class="col-12 md:col-6 flex flex-column gap-1 border-slate-100 pr-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-bookmark text-sm text-slate-400"></i>
          <span class="label-title">TIPO DE FIANZA</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.bondType || '—') }}
        </div>
        <div 
          v-if="bondData?.bondTypeDescription" 
          class="sub-value-text text-xs text-slate-500 font-medium leading-normal mt-1"
        >
          {{ bondData.bondTypeDescription }}
        </div>
      </div>

      <!-- 2. MONTO DE LA FIANZA -->
      <div class="col-6 md:col-3 flex flex-column gap-2 border-slate-100 px-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <span class="text-xs font-black text-slate-400">$</span>
          <span class="label-title">MONTO DE LA FIANZA</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.amount || '—') }}
        </div>
      </div>

      <!-- 3. MONEDA -->
      <div class="col-6 md:col-3 flex flex-column gap-2 border-slate-100 px-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-dollar text-sm text-slate-400"></i>
          <span class="label-title">MONEDA</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.currency || '—') }}
        </div>
      </div>
    </div>

    <!-- Divisor sutil horizontal entre filas -->
    <div class="divider-line my-3"></div>

    <!-- Fila 2: PERÍODO DE LA FIANZA, VIGENCIA -->
    <div class="grid pt-2">
      <!-- 1. PERÍODO DE LA FIANZA -->
      <div class="col-12 sm:col-6 flex flex-column gap-2 border-slate-100 pr-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-clock text-sm text-slate-400"></i>
          <span class="label-title">PERÍODO DE LA FIANZA</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.period || '—') }}
        </div>
      </div>

      <!-- 2. VIGENCIA -->
      <div class="col-12 sm:col-6 flex flex-column gap-2 border-slate-100 px-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-calendar text-sm text-slate-400"></i>
          <span class="label-title">VIGENCIA</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.validity || 'Desde — Hasta') }}
        </div>
      </div>
    </div>

    <!-- Divisor sutil horizontal entre filas -->
    <div class="divider-line my-3"></div>

    <!-- Fila 3: AFIANZADO, BENEFICIARIO -->
    <div class="grid pt-2">
      <!-- 1. AFIANZADO -->
      <div class="col-12 sm:col-6 flex flex-column gap-2 border-slate-100 pr-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-user text-sm text-slate-400"></i>
          <span class="label-title">AFIANZADO</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.bondedParty || '—') }}
        </div>
      </div>

      <!-- 2. BENEFICIARIO -->
      <div class="col-12 sm:col-6 flex flex-column gap-2 border-slate-100 px-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-building text-sm text-slate-400"></i>
          <span class="label-title">BENEFICIARIO</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (bondData?.beneficiary || '—') }}
        </div>
      </div>
    </div>

    <!-- Divisor sutil horizontal entre filas -->
    <div class="divider-line my-3"></div>

    <!-- Fila 4: CONTRATO GARANTIZADO (ocupando todo el ancho) -->
    <div class="grid pt-2">
      <div class="col-12 flex flex-column gap-2">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-file-check text-sm text-slate-400"></i>
          <span class="label-title">CONTRATO GARANTIZADO</span>
        </div>
        <div class="detail-box p-3 border-round-xl">
          <span class="detail-text font-medium text-slate-800 text-sm md:text-base">
            {{ loading ? '---' : (bondData?.guaranteedContract || '—') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Divisor sutil horizontal entre filas -->
    <div class="divider-line my-3"></div>

    <!-- Fila 5: OBJETO DE LA FIANZA (ocupando todo el ancho) -->
    <div class="grid pt-2">
      <div class="col-12 flex flex-column gap-2">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-align-left text-sm text-slate-400"></i>
          <span class="label-title">OBJETO DE LA FIANZA</span>
        </div>
        <div class="detail-box p-3 border-round-xl">
          <span class="detail-text font-medium text-slate-800 text-sm md:text-base">
            {{ loading ? '---' : (bondData?.bondPurpose || '—') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bond-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.03);
}

.bond-icon-box {
  width: 52px;
  height: 52px;
  background-color: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.2);
}

.card-title {
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.divider-line {
  height: 1px;
  background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 100%);
  border: none;
}

.label-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
  text-transform: uppercase;
}

.value-text {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
  word-break: break-word;
}

.sub-value-text {
  font-size: 0.8rem;
  color: #64748b;
  word-break: break-word;
}

.detail-box {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.detail-text {
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: anywhere;
  display: block;
}

.badge-modalidad {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #eff6ff;
  color: #1d4ed8;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #bfdbfe;
}

.badge-modalidad .dot {
  width: 6px;
  height: 6px;
  background-color: #2563eb;
  border-radius: 50%;
}
</style>
