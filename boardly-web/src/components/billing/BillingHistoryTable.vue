<script setup lang="ts">
import type { BillingRow } from '@/types/billing'

defineProps<{
  rows: BillingRow[]
}>()

const emit = defineEmits<{
  (event: 'view-details', value: BillingRow): void
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-border">
    <table class="min-w-full text-sm">
      <thead class="bg-background text-text/80">
        <tr>
          <th class="px-3 py-2 text-start">Invoice</th>
          <th class="px-3 py-2 text-start">Date</th>
          <th class="px-3 py-2 text-start">Plan</th>
          <th class="px-3 py-2 text-start">Amount</th>
          <th class="px-3 py-2 text-start">Status</th>
          <th class="px-3 py-2 text-start">Payment Method</th>
          <th class="px-3 py-2 text-start">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="border-t border-border text-text"
        >
          <td class="px-3 py-2 font-medium">{{ row.id }}</td>
          <td class="px-3 py-2">{{ row.date }}</td>
          <td class="px-3 py-2">{{ row.plan }}</td>
          <td class="px-3 py-2">${{ row.amount.toFixed(2) }}</td>
          <td class="px-3 py-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
              :class="{
                'bg-emerald-100 text-emerald-700': row.status === 'Paid',
                'bg-amber-100 text-amber-700': row.status === 'Pending',
                'bg-red-100 text-red-700': row.status === 'Failed',
              }"
            >
              {{ row.status }}
            </span>
          </td>
          <td class="px-3 py-2">{{ row.method }}</td>
          <td class="px-3 py-2">
            <button
              type="button"
              @click="emit('view-details', row)"
              class="text-primary hover:underline font-medium"
            >
              View details
            </button>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="7" class="px-3 py-6 text-center text-text/70">
            No billing records match your filters.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

