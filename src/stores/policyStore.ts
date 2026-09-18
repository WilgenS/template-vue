import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { policyService } from '../services/policyService'
import type { PolicySummaryData, Interventor, Coverage } from '../types/policy'

export const usePolicyStore = defineStore('policy', () => {
  const policy = ref<PolicySummaryData | null>(null)
  const interventors = ref<Interventor[]>([])
  const coverages = ref<Coverage[]>([])
  const loading = ref<boolean>(false)
  const isRenewing = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isBackendConnected = ref<boolean>(false)

  const isPolicyActive = computed(() => {
    return policy.value?.status?.toUpperCase() === 'VIGENTE'
  })

  async function fetchPolicyDetails(policyNumber: string = 'RCO1-3535431') {
    loading.value = true
    error.value = null
    try {
      const data = await policyService.getPolicyDetails(policyNumber)
      policy.value = data.policy
      interventors.value = data.interventors
      coverages.value = data.coverages
      isBackendConnected.value = true
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los datos del expediente'
      console.error('Error fetching policy details from API:', err)
    } finally {
      loading.value = false
    }
  }

  async function requestRenewal(policyNumber?: string) {
    const targetPolicy = policyNumber || policy.value?.policyNumber || 'RCO1-3535431'
    isRenewing.value = true
    try {
      const response = await policyService.requestRenewal(targetPolicy)
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Error al enviar la solicitud de renovación')
    } finally {
      isRenewing.value = false
    }
  }

  return {
    policy,
    interventors,
    coverages,
    loading,
    isRenewing,
    error,
    isBackendConnected,
    isPolicyActive,
    fetchPolicyDetails,
    requestRenewal
  }
})
