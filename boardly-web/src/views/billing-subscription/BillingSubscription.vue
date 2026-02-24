<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BillingPlans from '@/components/billing/BillingPlans.vue'
import BillingFilters from '@/components/billing/BillingFilters.vue'
import BillingHistoryTable from '@/components/billing/BillingHistoryTable.vue'
import InvoiceDetailsModal from '@/components/billing/InvoiceDetailsModal.vue'
import { apiFetch } from '@/lib/api'
import type {
  BillingOverview,
  BillingPeriod,
  BillingRow,
  BillingStatus,
  CurrentSubscription,
  Plan,
} from '@/types/billing'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const checkoutLoadingPlanId = ref<Plan['id'] | null>(null)
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)

const billingPeriod = ref<BillingPeriod>('monthly')
const activePlan = ref<Plan['id']>('startup')
const plans = ref<Plan[]>([])
const history = ref<BillingRow[]>([])
const currentSubscription = ref<CurrentSubscription | null>(null)

const statusFilter = ref<'All' | BillingStatus>('All')
const fromDate = ref('')
const toDate = ref('')
const search = ref('')
const selectedInvoice = ref<BillingRow | null>(null)
const activePlanDetails = computed<Plan | null>(() => {
  const selectedPlan = plans.value.find((plan) => plan.id === activePlan.value)
  if (selectedPlan) return selectedPlan
  return plans.value[0] ?? null
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
  void startCheckout(planId)
}

async function loadBillingOverview() {
  const response = await apiFetch('/billing/overview')
  const data = response as BillingOverview

  plans.value = data.plans
  history.value = data.history
  currentSubscription.value = data.currentSubscription

  if (data.currentSubscription?.planId) {
    activePlan.value = data.currentSubscription.planId
  }
  if (data.currentSubscription?.billingPeriod) {
    billingPeriod.value = data.currentSubscription.billingPeriod
  }
}

async function handleCheckoutConfirmation(sessionId: string) {
  await apiFetch('/billing/checkout-confirm', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
  actionSuccess.value = 'Payment confirmed successfully.'
}

async function startCheckout(planId: Plan['id']) {
  actionError.value = null
  actionSuccess.value = null

  if (planId === activePlan.value) {
    actionSuccess.value = 'This is already your current plan.'
    return
  }

  checkoutLoadingPlanId.value = planId
  try {
    const response = await apiFetch('/billing/checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        billingPeriod: billingPeriod.value,
      }),
    })

    const checkoutUrl = (response as { checkoutUrl?: string }).checkoutUrl
    if (!checkoutUrl) {
      throw new Error('Missing checkout URL from server.')
    }

    window.location.href = checkoutUrl
  } catch (error: unknown) {
    actionError.value =
      error instanceof Error ? error.message : 'Failed to start Stripe checkout.'
  } finally {
    checkoutLoadingPlanId.value = null
  }
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

onMounted(async () => {
  loading.value = true
  actionError.value = null
  actionSuccess.value = null

  try {
    const checkout = route.query.checkout
    const sessionId = route.query.session_id

    if (checkout === 'success' && typeof sessionId === 'string') {
      await handleCheckoutConfirmation(sessionId)
      await router.replace({ path: '/billing' })
    } else if (checkout === 'cancel') {
      actionError.value = 'Checkout was canceled before payment.'
      await router.replace({ path: '/billing' })
    }

    await loadBillingOverview()
  } catch (error: unknown) {
    actionError.value =
      error instanceof Error ? error.message : 'Failed to load billing data.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <BillingPlans
        :plans="plans"
        :billing-period="billingPeriod"
        :active-plan="activePlan"
        :loading-plan-id="checkoutLoadingPlanId"
        @update:billing-period="billingPeriod = $event"
        @select-plan="setPlan"
      />

      <div
        v-if="actionSuccess"
        class="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ actionSuccess }}
      </div>

      <div
        v-if="actionError"
        class="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ actionError }}
      </div>

      <section class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-text">Active Plan</h2>
            <p class="text-sm text-text/70">{{ currentSubscription ? (activePlanDetails?.name ?? 'Unknown plan') : 'No active subscription' }}</p>
          </div>
          <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {{ billingPeriod === 'monthly' ? 'Monthly billing' : 'Yearly billing' }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-border bg-background p-3">
            <p class="text-xs uppercase tracking-wide text-text/60">Started at</p>
            <p class="mt-1 text-sm font-medium text-text">{{ currentSubscription?.startedAt ?? 'N/A' }}</p>
          </div>
          <div class="rounded-lg border border-border bg-background p-3">
            <p class="text-xs uppercase tracking-wide text-text/60">Expired at</p>
            <p class="mt-1 text-sm font-medium text-text">{{ currentSubscription?.expiredAt ?? 'N/A' }}</p>
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

      <section
        v-if="loading"
        class="rounded-xl border border-border bg-card p-5 text-sm text-text/70"
      >
        Loading billing data...
      </section>
    </div>

    <InvoiceDetailsModal
      :invoice="selectedInvoice"
      @close="closeDetails"
    />
  </DashboardLayout>
</template>
