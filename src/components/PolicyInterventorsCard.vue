<script setup lang="ts">
export interface Interventor {
  role: 'TENEDOR' | 'ASEGURADO'
  name: string
  idNumber: string
}

withDefaults(defineProps<{
  interventors?: Interventor[]
}>(), {
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
  ]
})
</script>

<template>
  <div class="card-custom interventors-card p-4 md:p-5 h-full flex flex-column">
    <!-- Header de la sección -->
    <h3 class="card-title text-base md:text-lg font-bold text-slate-800 m-0 mb-4">
      Intervinientes del Contrato
    </h3>

    <div class="flex flex-column gap-4 flex-grow-1 justify-content-center">
      <!-- Item TENEDOR / ASEGURADO -->
      <div 
        v-for="(item, index) in interventors" 
        :key="index"
        class="interventor-item flex align-items-start gap-3"
      >
        <!-- Icono con color variante -->
        <div 
          class="icon-wrapper flex align-items-center justify-content-center mt-1"
          :class="item.role === 'TENEDOR' ? 'role-tenedor-bg' : 'role-asegurado-bg'"
        >
          <i 
            class="pi"
            :class="item.role === 'TENEDOR' ? 'pi-user text-rose-600' : 'pi-id-card text-blue-600'"
            style="font-size: 0.85rem;"
          ></i>
        </div>

        <!-- Información -->
        <div class="flex flex-column gap-1">
          <span 
            class="label-title font-bold"
            :class="item.role === 'TENEDOR' ? 'text-rose-700' : 'text-blue-700'"
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
