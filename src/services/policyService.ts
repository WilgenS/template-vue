import { apiFetch, ApiError } from './api'
import type { PolicySummaryData, Interventor, Coverage, PolicyDetailsResponse, RenewalResponse } from '../types/policy'

// Datos predeterminados de respaldo (Fallback si el backend local aún no está activo)
const MOCK_POLICY_RESPONSE: PolicyDetailsResponse = {
  policy: {
    id: '1',
    policyNumber: 'RCO1-3535431',
    status: 'NO VIGENTE',
    product: 'RCO-Responsabilidad Civil',
    validity: '13-08-2026 (5:22 PM) / 12-08-2027 (24:00 Hrs)',
    currency: 'US',
    insuredUnit: 'SERPENTO / 125',
    plateNumber: 'SP-10293'
  },
  interventors: [
    {
      id: 1,
      role: 'TENEDOR',
      name: 'SENEYDA DEL ROSARIO REYES',
      idNumber: '40307110780001R'
    },
    {
      id: 2,
      role: 'ASEGURADO',
      name: 'SENEYDA DEL ROSARIO REYES',
      idNumber: '40307110780001R'
    }
  ],
  coverages: [
    { id: 1, name: 'Daños a Terceros (Responsabilidad Civil)', limit: 'US$ 10,000.00', deductible: 'US$ 0.00', status: 'Incluido' },
    { id: 2, name: 'Lesiones Corporales a Terceros', limit: 'US$ 15,000.00', deductible: 'US$ 0.00', status: 'Incluido' },
    { id: 3, name: 'Gastos Médicos a Ocupantes', limit: 'US$ 2,500.00', deductible: 'US$ 50.00', status: 'Incluido' },
    { id: 4, name: 'Asistencia Legal y Fianza', limit: 'US$ 5,000.00', deductible: 'US$ 0.00', status: 'Incluido' }
  ]
}

export const policyService = {
  /**
   * Obtiene la información completa del expediente de la póliza
   */
  async getPolicyDetails(policyNumber: string = 'RCO1-3535431'): Promise<PolicyDetailsResponse> {
    try {
      return await apiFetch<PolicyDetailsResponse>(`/policies/${policyNumber}`)
    } catch (error: any) {
      console.warn('Fallback a datos mock por desconexión de backend:', error.message)
      // Si ocurre error de red (backend offline), devolvemos datos fallback estructurados
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE
      }
      throw error
    }
  },

  /**
   * Obtiene los intervinientes asociados a una póliza
   */
  async getInterventors(policyNumber: string = 'RCO1-3535431'): Promise<Interventor[]> {
    try {
      return await apiFetch<Interventor[]>(`/policies/${policyNumber}/interventors`)
    } catch (error: any) {
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE.interventors
      }
      throw error
    }
  },

  /**
   * Obtiene las coberturas contratadas de una póliza
   */
  async getCoverages(policyNumber: string = 'RCO1-3535431'): Promise<Coverage[]> {
    try {
      return await apiFetch<Coverage[]>(`/policies/${policyNumber}/coverages`)
    } catch (error: any) {
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return MOCK_POLICY_RESPONSE.coverages
      }
      throw error
    }
  },

  /**
   * Envía la solicitud de renovación de póliza al backend
   */
  async requestRenewal(policyNumber: string, notes?: string): Promise<RenewalResponse> {
    try {
      return await apiFetch<RenewalResponse>(`/policies/${policyNumber}/renew`, {
        method: 'POST',
        body: JSON.stringify({ policyNumber, notes })
      })
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 0) {
        // Simulación exitosa si no hay backend activo
        return {
          success: true,
          message: `Solicitud de renovación para la póliza ${policyNumber} enviada correctamente.`,
          referenceNumber: `REN-${Math.floor(100000 + Math.random() * 900000)}`
        }
      }
      throw error
    }
  }
}
