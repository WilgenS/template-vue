<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import { usePolicyStore } from '../stores/policyStore'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible'])

const toast = useToast()
const policyStore = usePolicyStore()

const handleRenewAction = async () => {
  try {
    const result = await policyStore.requestRenewal()
    toast.add({
      severity: 'success',
      summary: 'Solicitud Registrada en API',
      detail: result.message || `Un asesor se pondrá en contacto para renovar su póliza ${policyStore.policy?.policyNumber}.`,
      life: 5000
    })
    emit('update:visible', false)
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error en la solicitud',
      detail: err.message || 'No se pudo procesar la solicitud de renovación.',
      life: 5000
    })
  }
}
</script>

<template>
  <Dialog 
    :visible="visible" 
    @update:visible="(val) => emit('update:visible', val)"
    header="Detalles de Expediente y Renovación" 
    modal 
    :style="{ width: '90vw', maxWidth: '680px' }"
    class="custom-dialog"
  >
    <div class="p-2">
      <!-- Status Box -->
      <div 
        class="border-1 border-round-xl p-3 mb-4 flex align-items-center justify-content-between"
        :class="policyStore.isPolicyActive ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'"
      >
        <div class="flex align-items-center gap-3">
          <div 
            class="w-2rem h-2rem border-circle flex align-items-center justify-content-center"
            :class="policyStore.isPolicyActive ? 'bg-emerald-100' : 'bg-rose-100'"
          >
            <i 
              class="pi"
              :class="policyStore.isPolicyActive ? 'pi-check-circle text-emerald-600' : 'pi-exclamation-triangle text-rose-600'"
            ></i>
          </div>
          <div>
            <div class="font-bold text-slate-800 text-sm">
              Estado de la Póliza: {{ policyStore.policy?.status || 'NO VIGENTE' }}
            </div>
            <div class="text-xs text-slate-500">
              Vigencia: {{ policyStore.policy?.validity || 'Sin información' }}
            </div>
          </div>
        </div>
        <Tag 
          :value="policyStore.policy?.status || 'Expirado'" 
          :severity="policyStore.isPolicyActive ? 'success' : 'danger'" 
          class="uppercase text-xs" 
        />
      </div>

      <!-- Coberturas Contratadas -->
      <h4 class="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex align-items-center justify-content-between">
        <span>Coberturas de Responsabilidad Civil</span>
        <span v-if="policyStore.loading" class="text-xs text-slate-400 font-normal">Cargando coberturas desde API...</span>
      </h4>
      
      <DataTable 
        :value="policyStore.coverages" 
        size="small" 
        class="p-datatable-sm mb-4 border-round-lg overflow-hidden border-1 border-slate-200"
        :loading="policyStore.loading"
      >
        <Column field="name" header="Cobertura"></Column>
        <Column field="limit" header="Límite Max"></Column>
        <Column field="status" header="Estado">
          <template #body="{ data }">
            <span class="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 border-round">
              {{ data.status }}
            </span>
          </template>
        </Column>
      </DataTable>

      <div class="bg-slate-50 p-3 border-round-xl border-1 border-slate-200 text-xs text-slate-600 mb-2">
        <span class="font-bold text-slate-700">Nota Legal:</span> Información sincronizada desde la API para la unidad {{ policyStore.policy?.insuredUnit || 'SERPENTO / 125' }} {{ policyStore.policy?.plateNumber ? `placa ${policyStore.policy.plateNumber}` : '' }}.
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2 pt-2">
        <Button label="Cerrar" icon="pi pi-times" severity="secondary" text @click="emit('update:visible', false)" />
        <Button 
          label="Solicitar Renovación (API)" 
          icon="pi pi-check-circle" 
          severity="primary" 
          :loading="policyStore.isRenewing"
          @click="handleRenewAction" 
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-dialog-header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
}

:deep(.p-dialog-footer) {
  border-top: 1px solid #f1f5f9;
  padding: 1rem 1.5rem;
}
</style>
