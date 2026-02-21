export type BillingStatus = 'Paid' | 'Pending' | 'Failed'

export interface Plan {
  id: 'freelancer' | 'startup' | 'enterprise'
  name: string
  startedAt: string
  expiredAt: string
  monthlyPrice: number
  yearlyPrice: number
  yearlySavingsLabel: string
  description: string
  seats: string
  storage: string
  apiCalls: string
  supportSla: string
  highlight?: boolean
  ctaLabel?: string
  features: string[]
}

export interface BillingRow {
  id: string
  date: string
  plan: string
  amount: number
  status: BillingStatus
  method: string
}
