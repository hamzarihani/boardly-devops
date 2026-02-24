export type BillingStatus = 'Paid' | 'Pending' | 'Failed'

export interface Plan {
  id: 'freelancer' | 'startup' | 'enterprise'
  name: string
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

export type BillingPeriod = 'monthly' | 'yearly'

export interface CurrentSubscription {
  planId: Plan['id']
  billingPeriod: BillingPeriod
  startedAt: string
  expiredAt: string
}

export interface BillingOverview {
  plans: Plan[]
  currentSubscription: CurrentSubscription
  history: BillingRow[]
}

export interface BillingRow {
  id: string
  date: string
  plan: string
  amount: number
  status: BillingStatus
  method: string
}
