<script setup lang="ts">
import BaseDatePickerField from '@/components/ui/BaseDatePickerField.vue'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'

const props = defineProps<{
  search: string
  statusFilter: string
  fromDate: string
  toDate: string
}>()

const emit = defineEmits<{
  (event: 'update:search', value: string): void
  (event: 'update:statusFilter', value: string): void
  (event: 'update:fromDate', value: string): void
  (event: 'update:toDate', value: string): void
  (event: 'export'): void
}>()

const statusOptions = [
  { label: 'All statuses', value: 'All' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
]
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-4">
    <div>
      <h2 class="text-lg font-semibold text-text">Billing History</h2>
      <p class="text-sm text-text/70">Filter invoices, export data, and inspect details.</p>
    </div>
    <button
      type="button"
      @click="emit('export')"
      class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90"
    >
      Export CSV
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
    <input
      :value="props.search"
      @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      type="text"
      placeholder="Search invoice, plan or method"
      class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
    />

    <BaseSelectField
      :model-value="props.statusFilter"
      :options="statusOptions"
      @update:model-value="emit('update:statusFilter', $event)"
    />

    <BaseDatePickerField
      :model-value="props.fromDate"
      @update:model-value="emit('update:fromDate', $event)"
    />

    <BaseDatePickerField
      :model-value="props.toDate"
      @update:model-value="emit('update:toDate', $event)"
    />
  </div>
</template>

