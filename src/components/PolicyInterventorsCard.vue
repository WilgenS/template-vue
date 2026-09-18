<script setup lang="ts">
import type { Interventor } from '../types/policy'

withDefaults(
  defineProps<{
    interventors?: Interventor[]
    loading?: boolean
  }>(),
  {
    interventors: () => [
      {
        role: 'TENEDOR',
        name: 'SENEYDA DEL ROSARIO REYES',
        idNumber: '40307110780001R'
      },
      {
        role: 'ASEGURADO',
        name: 'SENEYDA DEL ROSARIO REYES',
        idNumber: '40307110780001R'
      }
    ],
    loading: false
  }
)
</script>

<template>
  <div class="card-custom interventors-card p-4 md:p-5 h-full flex flex-column">
    <!-- Header de la sección -->
    <div class="flex align-items-center justify-content-between mb-4">
      <h3 class="card-title text-base md:text-lg font-bold text-slate-800 m-0">
        Intervinientes del Contrato
      </h3>
      <span v-if="loading" class="text-xs text-slate-400">
        <i class="pi pi-spin pi-spinner mr-1"></i> Cargando...
      </span>
    </div>

    <div v-if="loading" class="flex flex-column gap-3 py-4">
      <div class="p-3 bg-slate-100 border-round text-slate-400 text-xs text-center">
        Cargando lista de intervinientes...
      </div>
    </div>

    <div v-else-if="!interventors || interventors.length === 0" class="py-4 text-center text-slate-400 text-sm">
      No se encontraron intervinientes registrados.
    </div>

    <div v-else class="flex flex-column gap-4 flex-grow-1 justify-content-center">
      <!-- Item TENEDOR / ASEGURADO -->
      <div 
        v-for="(item, index) in interventors" 
        :key="item.id || index"
        class="interventor-item flex align-items-start gap-3"
      >
        <!-- Icono con color variante -->
        <div 
          class="icon-wrapper flex align-items-center justify-content-center mt-1"
          :class="item.role?.toUpperCase() === 'TENEDOR' ? 'role-tenedor-bg' : 'role-asegurado-bg'"
        >
          <i 
            class="pi"
            :class="item.role?.toUpperCase() === 'TENEDOR' ? 'pi-user text-rose-600' : 'pi-id-card text-blue-600'"
            style="font-size: 0.85rem;"
          ></i>
        </div>

        <!-- Información -->
        <div class="flex flex-column gap-1">
          <span 
            class="label-title font-bold"
            :class="item.role?.toUpperCase() === 'TENEDOR' ? 'text-rose-700' : 'text-blue-700'"
          >
            {{ item.role }}
          </span>
          <span class="value-text font-bold text-slate-800 text-sm md:text-base">
            {{ item.name }}
          </span>
          <span class="sub-value-text text-xs text-slate-400 font-semibold tracking-wider">
            ID: {{ item.idNumber }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interventors-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.card-title {
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.icon-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}

.role-tenedor-bg {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
}

.role-asegurado-bg {
  background-color: #dbeafe;
  border: 1px solid #93c5fd;
}

.label-title {
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.value-text {
  color: #1e293b;
  line-height: 1.35;
}

.sub-value-text {
  color: #94a3b8;
}
</style>
