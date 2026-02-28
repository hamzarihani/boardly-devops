<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'

export interface DataTableColumn {
  key: string
  label: string
  headerClass?: string
  cellClass?: string
}

type TableRow = Record<string, unknown>

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: TableRow[]
    rowKey?: string
    paginate?: boolean
    pageSize?: number
    pageSizeOptions?: number[]
    emptyText?: string
  }>(),
  {
    rowKey: 'id',
    paginate: false,
    pageSize: 10,
    pageSizeOptions: () => [5, 10, 20],
    emptyText: 'No data found.',
  },
)

const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)
const currentPageSizeValue = computed({
  get: () => String(currentPageSize.value),
  set: (value: string) => {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) currentPageSize.value = parsed
  },
})
const pageSizeDropdownOptions = computed(() =>
  props.pageSizeOptions.map((option) => ({ label: String(option), value: String(option) })),
)

const totalItems = computed(() => props.rows.length)
const totalPages = computed(() => {
  if (!props.paginate) return 1
  return Math.max(1, Math.ceil(totalItems.value / currentPageSize.value))
})

const startIndex = computed(() => {
  if (!props.paginate) return 0
  return (currentPage.value - 1) * currentPageSize.value
})

const endIndex = computed(() => {
  if (!props.paginate) return totalItems.value
  return startIndex.value + currentPageSize.value
})

const visibleRows = computed(() => {
  if (!props.paginate) return props.rows
  return props.rows.slice(startIndex.value, endIndex.value)
})

const pageStart = computed(() => {
  if (totalItems.value === 0) return 0
  return startIndex.value + 1
})

const pageEnd = computed(() => Math.min(endIndex.value, totalItems.value))

watch(
  () => props.rows,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  },
  { deep: true },
)

watch(
  () => props.pageSize,
  (nextPageSize) => {
    currentPageSize.value = nextPageSize
    currentPage.value = 1
  },
)

watch(currentPageSize, () => {
  currentPage.value = 1
})

function previousPage() {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

function nextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}

function getRowKey(row: TableRow, index: number) {
  const value = row[props.rowKey]
  if (typeof value === 'string' || typeof value === 'number') return value
  return index
}
</script>

<template>
  <div class="rounded-lg overflow-hidden">
    <div class="overflow-auto">
      <table class="w-full text-sm">
        <thead class="bg-background text-text/80">
          <tr>
            <th
              v-for="column in props.columns"
              :key="column.key"
              class="px-4 py-3 text-left font-semibold"
              :class="column.headerClass"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in visibleRows"
            :key="getRowKey(row, index)"
            class="border-t border-border"
          >
            <td
              v-for="column in props.columns"
              :key="column.key"
              class="px-4 py-3 text-text/80"
              :class="column.cellClass"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="visibleRows.length === 0">
            <td :colspan="props.columns.length" class="px-4 py-8 text-center text-text/60">
              {{ props.emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="props.paginate && totalItems > 0"
      class="flex flex-col gap-3 border-t border-border bg-background/50 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
    >
      <p class="text-text/70">
        Showing {{ pageStart }}-{{ pageEnd }} of {{ totalItems }}
      </p>

      <div class="flex items-center gap-3">
        <label class="inline-flex items-center gap-2 text-text/70">
          <span>Rows</span>
          <BaseSelectField
            v-model="currentPageSizeValue"
            :options="pageSizeDropdownOptions"
          />
        </label>

        <div class="inline-flex items-center gap-1">
          <button
            type="button"
            class="rounded-md border border-border bg-card px-2.5 py-1.5 text-text disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            :disabled="currentPage <= 1"
            @click="previousPage"
          >
            Prev
          </button>
          <span class="px-2 text-text/70">{{ currentPage }} / {{ totalPages }}</span>
          <button
            type="button"
            class="rounded-md border border-border bg-card px-2.5 py-1.5 text-text disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
