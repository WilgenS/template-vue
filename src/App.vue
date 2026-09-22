<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import AppHeader from './components/AppHeader.vue'
import PolicySummaryCard from './components/PolicySummaryCard.vue'
import PolicyInterventorsCard from './components/PolicyInterventorsCard.vue'
import PolicyBondCard from './components/PolicyBondCard.vue'
import PolicyDetailsModal from './components/PolicyDetailsModal.vue'
import { usePolicyStore } from './stores/policyStore'

const policyStore = usePolicyStore()
const isModalVisible = ref(false)

const handleOpenDetails = () => {
  isModalVisible.value = true
}

const handleReloadData = () => {
  policyStore.fetchPolicyDetails()
}

onMounted(() => {
  // Cargar expedientes desde la API al montar el componente
  policyStore.fetchPolicyDetails()

  // Remover banner de licencia PrimeUI si se inserta en el DOM
  const removeLicenseBanner = () => {
    const el = document.getElementById('p-license-host')
    if (el) el.remove()
  }

  removeLicenseBanner()

  const observer = new MutationObserver(() => {
    removeLicenseBanner()
  })

  observer.observe(document.body, { childList: true, subtree: true })
})
</script>

<template>
  <div class="app-wrapper min-h-screen py-4 md:py-6 px-3 sm:px-5 lg:px-8">
    <Toast position="top-right" />
    
    <!-- Contenedor Principal Centrado con Max-Width -->
    <div class="main-container mx-auto">
      <!-- Banner de Estado de API -->
      <div 
        v-if="policyStore.error" 
        class="bg-amber-50 border-1 border-amber-300 border-round-xl p-3 mb-4 flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 text-amber-900"
      >
        <div class="flex align-items-center gap-2 text-sm">
          <i class="pi pi-exclamation-circle text-amber-600 text-lg"></i>
          <span><strong>Aviso API:</strong> {{ policyStore.error }}</span>
        </div>
        <Button 
          label="Reintentar Conexión API" 
          icon="pi pi-refresh" 
          severity="warn" 
          size="small" 
          :loading="policyStore.loading" 
          @click="handleReloadData" 
        />
      </div>

      <!-- 1. Encabezado de Expediente -->
      <AppHeader 
        @open-details="handleOpenDetails"
        @open-renew="handleOpenDetails" 
      />

      <!-- 2. Tarjeta Resumen Superior de Póliza -->
      <PolicySummaryCard 
        :policy-data="policyStore.policy" 
        :loading="policyStore.loading" 
      />

      <!-- 3. Sección Inferior: Tarjetas de Intervinientes -->
      <div class="grid policy-bottom-grid mb-4">
        <div class="col-12 md:col-6 p-2">
          <PolicyInterventorsCard 
            :interventors="policyStore.interventors" 
            :loading="policyStore.loading" 
          />
        </div>
      </div>

      <!-- 4. Sección Datos de la Fianza -->
      <PolicyBondCard 
        :bond-data="policyStore.bond" 
        :loading="policyStore.loading" 
      />
    </div>

    <!-- Modal de Detalles y Renovación de PrimeVue -->
    <PolicyDetailsModal v-model:visible="isModalVisible" />
  </div>
</template>

<style scoped>
.app-wrapper {
  background-color: #f4f6fa;
  min-height: 100vh;
}

.main-container {
  max-width: 1080px;
}

.policy-bottom-grid {
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

@media print {
  .app-wrapper {
    background: white !important;
    padding: 0 !important;
  }
  .main-container {
    max-width: 100% !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
