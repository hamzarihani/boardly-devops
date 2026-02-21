<script setup lang="ts">
import type { Plan } from '@/types/billing'

const props = defineProps<{
  plans: Plan[]
  billingPeriod: 'monthly' | 'yearly'
  activePlan: Plan['id']
}>()

const emit = defineEmits<{
  (event: 'update:billingPeriod', value: 'monthly' | 'yearly'): void
  (event: 'select-plan', value: Plan['id']): void
}>()

function priceForPlan(plan: Plan) {
  return props.billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-text">Billing & Subscription</h1>
      <div class="inline-flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          @click="emit('update:billingPeriod', 'monthly')"
          class="px-3 py-1.5 text-sm cursor-pointer"
          :class="props.billingPeriod === 'monthly' ? 'bg-primary text-white' : 'bg-card text-text'"
        >
          Monthly
        </button>
        <button
          type="button"
          @click="emit('update:billingPeriod', 'yearly')"
          class="px-3 py-1.5 text-sm cursor-pointer"
          :class="props.billingPeriod === 'yearly' ? 'bg-primary text-white' : 'bg-card text-text'"
        >
          Yearly
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article
        v-for="plan in props.plans"
        :key="plan.id"
        class="relative rounded-xl border p-5 bg-card"
        :class="[
          props.activePlan === plan.id ? 'border-primary shadow-md' : 'border-border',
          plan.highlight ? 'ring-2 ring-primary/30' : '',
        ]"
      >
        <span
          v-if="plan.highlight"
          class="absolute top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white"
        >
          Most popular
        </span>

        <div class="mb-3">
          <h2 class="text-lg font-semibold text-text">{{ plan.name }}</h2>
          <p class="text-sm text-text/70">{{ plan.description }}</p>
        </div>

        <p class="text-3xl font-bold text-text mb-1">
          ${{ priceForPlan(plan) }}
          <span class="text-base font-medium text-text/70">/{{ props.billingPeriod === 'monthly' ? 'mo' : 'yr' }}</span>
        </p>
        <p v-if="props.billingPeriod === 'yearly'" class="mb-4 text-xs font-medium text-emerald-600">
          {{ plan.yearlySavingsLabel }}
        </p>

        <div class="mb-4 grid grid-cols-2 gap-2 text-xs text-text/75">
          <div class="rounded-md bg-background px-2 py-1.5">{{ plan.seats }}</div>
          <div class="rounded-md bg-background px-2 py-1.5">{{ plan.storage }}</div>
          <div class="rounded-md bg-background px-2 py-1.5">{{ plan.apiCalls }}</div>
          <div class="rounded-md bg-background px-2 py-1.5">{{ plan.supportSla }}</div>
        </div>

        <ul class="space-y-1 mb-4 text-sm text-text/80">
          <li v-for="feature in plan.features" :key="feature">
            <span class="text-primary">•</span> {{ feature }}
          </li>
        </ul>

        <button
          type="button"
          @click="emit('select-plan', plan.id)"
          class="w-full rounded-lg px-3 py-2 text-sm font-medium border"
          :class="props.activePlan === plan.id ? 'bg-primary text-white border-primary' : 'bg-background text-text border-border hover:bg-background/80'"
        >
          {{ props.activePlan === plan.id ? 'Current plan' : (plan.ctaLabel ?? 'Choose plan') }}
        </button>
      </article>
    </div>
  </div>
</template>
