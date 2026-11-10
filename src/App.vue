<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import AppHeader from './components/AppHeader.vue'
import PolicySummaryCard from './components/PolicySummaryCard.vue'
import PolicyDetailsModal from './components/PolicyDetailsModal.vue'
import { usePolicyStore } from './stores/policyStore'
import PolicyBondCard from './components/PolicyBondCard.vue'
import { downloadBondConfirmationPdf } from './utils/bondPdfGenerator.vue'

const policyStore = usePolicyStore()
const isModalVisible = ref(false)
const isDownloadingPdf = ref(false)

const hasData = computed(() => {
  return !policyStore.loading && Boolean(policyStore.policy || policyStore.bond)
})
// Guardamos el código en una referencia por si se necesita reintentar la conexión
const policyCode = ref<string | undefined>(undefined)

const handleOpenDetails = () => {
  isModalVisible.value = true
}

const handleDownloadPdf = async () => {
  if (!hasData.value) return
  isDownloadingPdf.value = true
  try {
    await downloadBondConfirmationPdf({
      policy: policyStore.policy,
      bond: policyStore.bond,
      interventors: policyStore.interventors
    })
  } finally {
    isDownloadingPdf.value = false
  }
}

onMounted(() => {
  // 1. Obtener el parámetro 'codigo' de la URL de forma nativa
  const urlParams = new URLSearchParams(window.location.search)
  policyCode.value = urlParams.get('codigo') ?? '';

  // 2. Cargar expedientes desde la API pasando el código obtenido
  policyStore.fetchPolicyDetails(policyCode.value)

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
   
   <!-- 1. Encabezado de Expediente y Botón Descargar PDF -->
      <AppHeader 
        @open-details="handleOpenDetails"
        @open-renew="handleOpenDetails" 
      >
        <template #actions>
          <Button 
            v-if="hasData"
            label="Descargar PDF" 
            icon="pi pi-file-pdf" 
            class="download-pdf-btn"
            :loading="isDownloadingPdf" 
            @click="handleDownloadPdf" 
          />
        </template>
      </AppHeader>
      <!-- 2. Tarjeta Resumen Superior de Póliza -->
      <PolicySummaryCard 
        :policy-data="policyStore.policy" 
        :loading="policyStore.loading" 
      />


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

.download-pdf-btn {
  border-radius: 12px;
  background-color: #2563eb;
  border-color: #2563eb;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.65rem 1.15rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.download-pdf-btn:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
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
