<script setup lang="ts">
import type { BillingRow } from '@/types/billing'

const props = defineProps<{
  invoice: BillingRow | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<template>
  <div
    v-if="props.invoice"
    class="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-md rounded-xl border border-border bg-card p-5">
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-lg font-semibold text-text">Invoice Details</h3>
        <button type="button" @click="emit('close')" class="text-text/70 hover:text-text">✕</button>
      </div>
      <div class="space-y-2 text-sm text-text">
        <p><span class="text-text/70">Invoice:</span> {{ props.invoice.id }}</p>
        <p><span class="text-text/70">Date:</span> {{ props.invoice.date }}</p>
        <p><span class="text-text/70">Plan:</span> {{ props.invoice.plan }}</p>
        <p><span class="text-text/70">Amount:</span> ${{ props.invoice.amount.toFixed(2) }}</p>
        <p><span class="text-text/70">Status:</span> {{ props.invoice.status }}</p>
        <p><span class="text-text/70">Payment Method:</span> {{ props.invoice.method }}</p>
      </div>
    </div>
  </div>
</template>

