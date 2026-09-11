<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible'])

const toast = useToast()

const activeTab = ref(0)

const coverages = ref([
  { id: 1, name: 'Daños a Terceros (Responsabilidad Civil)', limit: 'US$ 10,000.00', deductible: 'US$ 0.00', status: 'Incluido' },
  { id: 2, name: 'Lesiones Corporales a Terceros', limit: 'US$ 15,000.00', deductible: 'US$ 0.00', status: 'Incluido' },
  { id: 3, name: 'Gastos Médicos a Ocupantes', limit: 'US$ 2,500.00', deductible: 'US$ 50.00', status: 'Incluido' },
  { id: 4, name: 'Asistencia Legal y Fianza', limit: 'US$ 5,000.00', deductible: 'US$ 0.00', status: 'Incluido' }
])

const handleRenewAction = () => {
  toast.add({
    severity: 'success',
    summary: 'Solicitud de Cotización',
    detail: 'Un asesor se pondrá en contacto para renovar su póliza RCO1-3535431.',
    life: 4000
  })
  emit('update:visible', false)
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
      <div class="bg-rose-50 border-1 border-rose-200 border-round-xl p-3 mb-4 flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-3">
          <div class="w-2rem h-2rem border-circle bg-rose-100 flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle text-rose-600"></i>
          </div>
          <div>
            <div class="font-bold text-slate-800 text-sm">Estado de la Póliza: NO VIGENTE</div>
            <div class="text-xs text-slate-500">Vencimiento transcurrido el 12-08-2027</div>
          </div>
        </div>
        <Tag value="Expirado" severity="danger" class="uppercase text-xs" />
      </div>

      <!-- Coberturas Contratadas -->
      <h4 class="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
        Coberturas de Responsabilidad Civil
      </h4>
      
      <DataTable :value="coverages" size="small" class="p-datatable-sm mb-4 border-round-lg overflow-hidden border-1 border-slate-200">
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
        <span class="font-bold text-slate-700">Nota Legal:</span> Esta vista previa contiene la información vigente registrada en el sistema de emisión de seguros para la unidad SERPENTO / 125 placa SP.
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2 pt-2">
        <Button label="Cerrar" icon="pi pi-times" severity="secondary" text @click="emit('update:visible', false)" />
        <Button label="Solicitar Renovación" icon="pi pi-check-circle" severity="primary" @click="handleRenewAction" />
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
