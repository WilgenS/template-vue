export interface PolicySummaryData {
  id?: string
  policyNumber: string
  status: 'VIGENTE' | 'NO VIGENTE' | 'SUSPENDIDA' | 'CANCELADA' | string
  product: string
  validity: string
  validFrom?: string
  validTo?: string
  currency: string
  paymentStatus?: string
  insuredUnit?: string
  plateNumber?: string
}

export interface Interventor {
  id?: string | number
  role: 'TENEDOR' | 'ASEGURADO' | 'BENEFICIARIO' | string
  name: string
  idNumber: string
  email?: string
  phone?: string
}

export interface Coverage {
  id: string | number
  name: string
  limit: string
  deductible: string
  status: 'Incluido' | 'Opcional' | 'Excluido' | string
}

export interface BondData {
  bondType: string
  bondTypeDescription?: string
  amount?: string
  currency?: string
  period?: string
  validity?: string
  bondedParty?: string
  beneficiary?: string
  guaranteedContract?: string
  bondPurpose?: string
}

export interface PolicyDetailsResponse {
  policy: PolicySummaryData
  interventors: Interventor[]
  coverages: Coverage[]
  bond?: BondData
}

export interface RenewalRequest {
  policyNumber: string
  notes?: string
}

export interface RenewalResponse {
  success: boolean
  message: string
  referenceNumber?: string
}
