<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Toast from 'primevue/toast'
import AppHeader from './components/AppHeader.vue'
import PolicySummaryCard from './components/PolicySummaryCard.vue'
import PolicyInterventorsCard from './components/PolicyInterventorsCard.vue'
import PolicyDetailsModal from './components/PolicyDetailsModal.vue'

const isModalVisible = ref(false)

const handleOpenDetails = () => {
  isModalVisible.value = true
}

// Remover banner de licencia PrimeUI si se inserta en el DOM
onMounted(() => {
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
    
    <!-- Contenedor Principal Centrado con Max-Width elegante -->
    <div class="main-container mx-auto">
      <!-- 1. Encabezado de Expediente -->
      <AppHeader 
        @open-details="handleOpenDetails"
        @open-renew="handleOpenDetails" 
      />

      <!-- 2. Tarjeta Resumen Superior de Póliza -->
      <PolicySummaryCard />

      <!-- 3. Sección Inferior: 2 Tarjetas Paralelas (Intervinientes & Objeto Asegurado) -->
      <div class="grid policy-bottom-grid">
        <!-- Izquierda: Intervinientes del Contrato -->
        <div class="col-12 md:col-6 p-2">
          <PolicyInterventorsCard />
        </div>

      
      </div>
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
