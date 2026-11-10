<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import AppHeader from './components/AppHeader.vue'
import PolicySummaryCard from './components/PolicySummaryCard.vue'
import PolicyDetailsModal from './components/PolicyDetailsModal.vue'
import { usePolicyStore } from './stores/policyStore'
import PolicyBondCard from './components/PolicyBondCard.vue'

// 1. Importar el archivo como un componente de Vue (Asegúrate de que la ruta sea correcta)
import BondPdfGenerator from './utils/bondPdfGenerator.vue'

const policyStore = usePolicyStore()
const isModalVisible = ref(false)
const isDownloadingPdf = ref(false)

// 2. Crear una referencia para acceder al componente del PDF
const pdfGeneratorRef = ref<InstanceType<typeof BondPdfGenerator> | null>(null)

const hasData = computed(() => {
  return !policyStore.loading && Boolean(policyStore.policy || policyStore.bond)
})

const policyCode = ref<string | undefined>(undefined)

const handleOpenDetails = () => {
  isModalVisible.value = true
}

const handleDownloadPdf = async () => {
  if (!hasData.value) return
  isDownloadingPdf.value = true
  try {
    // 3. Llamar a la función expuesta por el componente Vue
    await pdfGeneratorRef.value?.generatePdf()
  } finally {
    isDownloadingPdf.value = false
  }
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  policyCode.value = urlParams.get('codigo') ?? '';

  policyStore.fetchPolicyDetails(policyCode.value)

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
    
    <div class="main-container mx-auto">
   
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

      <PolicySummaryCard 
        :policy-data="policyStore.policy" 
        :loading="policyStore.loading" 
      />

      <PolicyBondCard 
        :bond-data="policyStore.bond" 
        :loading="policyStore.loading" 
      />
    </div>

    <PolicyDetailsModal v-model:visible="isModalVisible" />

    <!-- 4. Renderizar el componente oculto del PDF al final de tu vista principal y pasarle los props -->
    <BondPdfGenerator 
      ref="pdfGeneratorRef" 
      :policy="policyStore.policy"
      :bond="policyStore.bond"
      :interventors="policyStore.interventors"
    />
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
