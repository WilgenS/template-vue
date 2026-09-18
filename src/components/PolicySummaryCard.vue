<script setup lang="ts">
import type { PolicySummaryData } from '../types/policy'

withDefaults(
  defineProps<{
    policyData?: PolicySummaryData | null
    loading?: boolean
  }>(),
  {
    policyData: () => ({
      policyNumber: 'RCO1-3535431',
      status: 'NO VIGENTE',
      product: 'RCO-Responsabilidad Civil',
      validity: '13-08-2026 (5:22 PM) / 12-08-2027 (24:00 Hrs)',
      currency: 'US',
    }),
    loading: false
  }
)
</script>

<template>
  <div class="card-custom policy-card p-4 md:p-5 mb-5">
    <!-- Fila Superior: Número de póliza y Estado -->
    <div class="top-row flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-4 pb-4">
      <div class="left-section flex align-items-center gap-3">
        <!-- Contenedor Icono Rosa Colisión -->
        <div class="policy-icon-box flex align-items-center justify-content-center">
          <span class="mini-crash font-bold text-sm">💥</span>
          <i class="pi pi-car text-rose-600 text-lg"></i>
        </div>
        <div class="flex flex-column gap-1">
          <span class="label-title">NÚMERO DE PÓLIZA</span>
          <h2 class="policy-number font-extrabold m-0 text-slate-800 text-xl md:text-2xl tracking-tight">
            <span v-if="loading" class="opacity-50">Cargando póliza...</span>
            <span v-else>{{ policyData?.policyNumber || 'N/D' }}</span>
          </h2>
        </div>
      </div>

      <div class="right-section flex flex-column sm:align-items-end gap-1">
        <span class="label-title">ESTADO DE PÓLIZA</span>
        <div 
          :class="policyData?.status?.toUpperCase() === 'VIGENTE' ? 'badge-vigente' : 'badge-no-vigente'"
        >
          <span class="dot"></span>
          <span>{{ loading ? 'CARGANDO...' : (policyData?.status || 'N/D') }}</span>
        </div>
      </div>
    </div>

    <!-- Divisor sutil horizontal -->
    <div class="divider-line my-3"></div>

    <!-- Fila Inferior: Grid de Atributos Principal -->
    <div class="policy-grid-4 grid pt-2">
      <!-- 1. PRODUCTO -->
      <div class="col-12 sm:col-6 md:col-3 flex flex-column gap-2 border-slate-100 pr-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-file text-sm text-slate-400"></i>
          <span class="label-title">PRODUCTO</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (policyData?.product || 'N/D') }}
        </div>
      </div>

      <!-- 2. VIGENCIA -->
      <div class="col-12 sm:col-6 md:col-5 flex flex-column gap-2 border-slate-100 px-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <i class="pi pi-calendar text-sm text-slate-400"></i>
          <span class="label-title">VIGENCIA</span>
        </div>
        <div class="value-text font-bold text-slate-800 leading-tight">
          {{ loading ? '---' : (policyData?.validity || 'N/D') }}
        </div>
      </div>

      <!-- 3. MONEDA -->
      <div class="col-12 sm:col-6 md:col-4 flex flex-column gap-2 border-slate-100 px-3">
        <div class="flex align-items-center gap-2 text-slate-500">
          <span class="text-xs font-black text-slate-400">$</span>
          <span class="label-title">MONEDA</span>
        </div>
        <div class="value-text font-bold text-slate-800">
          {{ loading ? '---' : (policyData?.currency || 'N/D') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.policy-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.03);
}

.policy-icon-box {
  width: 52px;
  height: 52px;
  background-color: #fce7f3;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  box-shadow: inset 0 0 0 1px rgba(244, 114, 182, 0.2);
}

.mini-crash {
  font-size: 0.75rem;
  margin-right: -2px;
}

.policy-number {
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

.badge-vigente {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #dcfce7;
  color: #15803d;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #86efac;
}

.badge-vigente .dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
}
</style>
