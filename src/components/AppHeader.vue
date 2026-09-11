<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

const toast = useToast()

const emit = defineEmits(['open-details', 'open-renew'])
</script>

<template>
  <header class="header-container flex flex-column md:flex-row md:align-items-center justify-content-between gap-4 mb-6">
    <div class="header-left flex flex-column gap-1">
      <div class="title-row flex align-items-center gap-2 flex-wrap">
        <h1 class="title-text text-2xl md:text-3xl font-extrabold text-slate-800 m-0">
          Expediente de Póliza
        </h1>
        
        <!-- Badge Verificado Verde -->
        <span class="verified-badge flex align-items-center justify-content-center" title="Póliza Autenticada y Verificada">
          <i class="pi pi-check text-xs font-bold text-white"></i>
        </span>

        <!-- Icono Coche / Choque -->
        <span class="crash-icon-badge flex align-items-center gap-1 px-2 py-1" title="Responsabilidad Civil Vehicular">
          <span class="crash-emoji">💥</span>
          <i class="pi pi-car text-slate-700 text-sm"></i>
        </span>
      </div>

      <p class="subtitle-text text-sm md:text-base text-slate-500 font-medium m-0">
        Detalle técnico y legal de su contrato de seguro.
      </p>
    </div>

   
  </header>
</template>

<style scoped>
.header-container {
  padding: 0.5rem 0.25rem;
}

.title-text {
  color: #1e293b;
  letter-spacing: -0.02em;
}

.verified-badge {
  width: 22px;
  height: 22px;
  background: #10b981;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.crash-icon-badge {
  background-color: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: inline-flex;
  align-items: center;
}

.crash-emoji {
  font-size: 0.85rem;
  line-height: 1;
}

.subtitle-text {
  color: #64748b;
}

.custom-btn {
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
}

.custom-btn-primary {
  border-radius: 10px;
  background-color: #2563eb;
  border-color: #2563eb;
  font-weight: 600;
  font-size: 0.85rem;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
