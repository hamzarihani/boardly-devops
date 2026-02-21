<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BillingPlans from '@/components/billing/BillingPlans.vue'
import BillingFilters from '@/components/billing/BillingFilters.vue'
import BillingHistoryTable from '@/components/billing/BillingHistoryTable.vue'
import InvoiceDetailsModal from '@/components/billing/InvoiceDetailsModal.vue'
import type { BillingRow, BillingStatus, Plan } from '@/types/billing'

const billingPeriod = ref<'monthly' | 'yearly'>('monthly')
const activePlan = ref<Plan['id']>('startup')

const plans: Plan[] = [
  {
    id: 'freelancer',
    name: 'Freelancer',
    startedAt: '2026-01-10',
    expiredAt: '2026-02-10',
    monthlyPrice: 19,
    yearlyPrice: 190,
    yearlySavingsLabel: 'Save $38 yearly',
    description: 'Ideal for consultants and solo operators running client projects.',
    seats: '1 seat included',
    storage: '50 GB storage',
    apiCalls: '20k API calls / month',
    supportSla: 'Email support (48h SLA)',
    ctaLabel: 'Start Freelancer',
    features: ['Unlimited personal boards', 'Custom fields', 'Invoice-ready time tracking'],
  },
  {
    id: 'startup',
    name: 'Startup',
    startedAt: '2026-02-11',
    expiredAt: '2026-03-11',
    monthlyPrice: 79,
    yearlyPrice: 790,
    yearlySavingsLabel: 'Save $158 yearly',
    description: 'Best for product teams scaling delivery with agile and automation.',
    seats: 'Up to 15 seats',
    storage: '500 GB storage',
    apiCalls: '250k API calls / month',
    supportSla: 'Priority support (8h SLA)',
    highlight: true,
    ctaLabel: 'Upgrade to Startup',
    features: ['Sprint planning + burndown', 'Advanced roles and permissions', 'Slack + GitHub integrations'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    startedAt: '2026-02-21',
    expiredAt: '2026-03-21',
    monthlyPrice: 249,
    yearlyPrice: 2490,
    yearlySavingsLabel: 'Save $498 yearly',
    description: 'For large organizations with strict security, compliance, and governance.',
    seats: 'Unlimited seats',
    storage: 'Unlimited storage',
    apiCalls: 'Unlimited API calls',
    supportSla: 'Dedicated CSM + 1h critical SLA',
    ctaLabel: 'Contact Sales',
    features: ['SSO/SAML + SCIM provisioning', 'Audit logs + compliance exports', 'Custom onboarding and migration'],
  },
]

const history = ref<BillingRow[]>([
  { id: 'INV-1024', date: '2026-02-01', plan: 'Startup', amount: 39, status: 'Paid', method: 'Visa **** 4242' },
  { id: 'INV-1023', date: '2026-01-01', plan: 'Startup', amount: 39, status: 'Paid', method: 'Visa **** 4242' },
  { id: 'INV-1022', date: '2025-12-01', plan: 'Startup', amount: 39, status: 'Paid', method: 'Visa **** 4242' },
  { id: 'INV-1021', date: '2025-11-01', plan: 'Startup', amount: 39, status: 'Pending', method: 'Visa **** 4242' },
  { id: 'INV-1020', date: '2025-10-01', plan: 'Startup', amount: 39, status: 'Failed', method: 'Visa **** 4242' },
])

const statusFilter = ref<'All' | BillingStatus>('All')
const fromDate = ref('')
const toDate = ref('')
const search = ref('')
const selectedInvoice = ref<BillingRow | null>(null)
const activePlanDetails = computed<Plan>(() => {
  const selectedPlan = plans.find((plan) => plan.id === activePlan.value)
  if (selectedPlan) return selectedPlan
  return plans[0] as Plan
})

const filteredHistory = computed(() => {
  return history.value.filter((row) => {
    if (statusFilter.value !== 'All' && row.status !== statusFilter.value) return false
    if (fromDate.value && row.date < fromDate.value) return false
    if (toDate.value && row.date > toDate.value) return false
    if (search.value) {
      const haystack = `${row.id} ${row.plan} ${row.method} ${row.status}`.toLowerCase()
      if (!haystack.includes(search.value.toLowerCase())) return false
    }
    return true
  })
})

function setPlan(planId: Plan['id']) {
  activePlan.value = planId
}

function exportCsv() {
  const headers = ['Invoice ID', 'Date', 'Plan', 'Amount', 'Status', 'Method']
  const rows = filteredHistory.value.map((row) => [
    row.id,
    row.date,
    row.plan,
    row.amount.toFixed(2),
    row.status,
    row.method,
  ])
  const csv = [headers, ...rows]
    .map((cols) => cols.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'billing-history.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function openDetails(row: BillingRow) {
  selectedInvoice.value = row
}

function closeDetails() {
  selectedInvoice.value = null
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <BillingPlans
        :plans="plans"
        :billing-period="billingPeriod"
        :active-plan="activePlan"
        @update:billing-period="billingPeriod = $event"
        @select-plan="setPlan"
      />

      <section class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-text">Active Plan</h2>
            <p class="text-sm text-text/70">{{ activePlanDetails.name }}</p>
          </div>
          <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {{ billingPeriod === 'monthly' ? 'Monthly billing' : 'Yearly billing' }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-border bg-background p-3">
            <p class="text-xs uppercase tracking-wide text-text/60">Started at</p>
            <p class="mt-1 text-sm font-medium text-text">{{ activePlanDetails.startedAt }}</p>
          </div>
          <div class="rounded-lg border border-border bg-background p-3">
            <p class="text-xs uppercase tracking-wide text-text/60">Expired at</p>
            <p class="mt-1 text-sm font-medium text-text">{{ activePlanDetails.expiredAt }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <BillingFilters
          :search="search"
          :status-filter="statusFilter"
          :from-date="fromDate"
          :to-date="toDate"
          @update:search="search = $event"
          @update:status-filter="statusFilter = $event as 'All' | BillingStatus"
          @update:from-date="fromDate = $event"
          @update:to-date="toDate = $event"
          @export="exportCsv"
        />

        <BillingHistoryTable
          :rows="filteredHistory"
          @view-details="openDetails"
        />
      </section>
    </div>

    <InvoiceDetailsModal
      :invoice="selectedInvoice"
      @close="closeDetails"
    />
  </DashboardLayout>
</template>
