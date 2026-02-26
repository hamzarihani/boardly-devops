<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'

interface BacklogItem {
  id: string
  title: string
  type: 'STORY' | 'TASK' | 'BUG'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE'
  estimation: number | null
}

const { t } = useI18n()

// Mock Data
const backlogItems = ref<BacklogItem[]>([
  { id: '1', title: 'Implement user authentication flow', type: 'STORY', priority: 'HIGH', status: 'IN_PROGRESS', estimation: 5 },
  { id: '2', title: 'Fix sidebar navigation bug on mobile', type: 'BUG', priority: 'MEDIUM', status: 'TODO', estimation: 2 },
  { id: '3', title: 'Draft API documentation', type: 'TASK', priority: 'LOW', status: 'BACKLOG', estimation: 3 },
  { id: '4', title: 'Refactor database schema for scalability', type: 'STORY', priority: 'CRITICAL', status: 'BACKLOG', estimation: 8 },
  { id: '5', title: 'Add unit tests for payment service', type: 'TASK', priority: 'MEDIUM', status: 'TODO', estimation: 5 },
  { id: '6', title: 'UI glitch in dark mode settings', type: 'BUG', priority: 'LOW', status: 'BACKLOG', estimation: 1 },
  { id: '7', title: 'Research OAuth 2.0 integration', type: 'STORY', priority: 'HIGH', status: 'TODO', estimation: 3 },
])

// Filters
const search = ref('')
const statusFilter = ref('ALL')
const priorityFilter = ref('ALL')

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Backlog', value: 'BACKLOG' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

const priorityOptions = [
  { label: 'All Priorities', value: 'ALL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
]

const columns: DataTableColumn[] = [
  { key: 'type', label: 'Type', cellClass: 'w-10' },
  { key: 'title', label: 'Title', cellClass: 'font-medium text-text' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'estimation', label: 'Est.', cellClass: 'text-center' },
]

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return backlogItems.value.filter((item) => {
    const matchesStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'ALL' || item.priority === priorityFilter.value
    const matchesSearch = !keyword || item.title.toLowerCase().includes(keyword)
    return matchesStatus && matchesPriority && matchesSearch
  })
})

// Modal & Form
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const formItem = ref<Partial<BacklogItem>>({
  title: '',
  type: 'STORY',
  priority: 'MEDIUM',
  status: 'BACKLOG',
  estimation: null,
})

function openModal() {
  formItem.value = {
    title: '',
    type: 'STORY',
    priority: 'MEDIUM',
    status: 'BACKLOG',
    estimation: null,
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function saveItem() {
  if (!formItem.value.title) return
  
  isSubmitting.value = true
  // Mock save
  setTimeout(() => {
    backlogItems.value.unshift({
      id: Math.random().toString(36).substr(2, 9),
      title: formItem.value.title!,
      type: formItem.value.type as any,
      priority: formItem.value.priority as any,
      status: formItem.value.status as any,
      estimation: formItem.value.estimation as any,
    })
    isSubmitting.value = false
    closeModal()
  }, 500)
}

// Helpers
const typeIcons: Record<BacklogItem['type'], string> = {
  STORY: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  TASK: 'M9 11l3 3L20 6M4 6h3M4 12h3M4 18h10',
  BUG: 'M12 22a7 7 0 0 0 7-7M5 15a7 7 0 0 1 7-7m0 0a7 7 0 0 1 7 7M5 15V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10'
}

const typeColors: Record<BacklogItem['type'], string> = {
  STORY: 'text-blue-500',
  TASK: 'text-green-500',
  BUG: 'text-red-500'
}

const priorityColors: Record<BacklogItem['priority'], string> = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusColors: Record<BacklogItem['status'], string> = {
  BACKLOG: 'bg-background text-text/60 border border-border',
  TODO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IN_PROGRESS: 'bg-primary/15 text-primary',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full pb-10">
      <section class="rounded-xl border border-border bg-card p-5">
        <h1 class="text-2xl font-bold text-text">{{ t('backlog.title') }}</h1>
        <p class="mt-1 text-sm text-text/70">
          {{ t('backlog.description') }}
        </p>
      </section>

      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 max-w-3xl">
          <input
            v-model="search"
            type="text"
            placeholder="Search items..."
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <BaseSelectField v-model="statusFilter" :options="statusOptions" />
          <BaseSelectField v-model="priorityFilter" :options="priorityOptions" />
        </div>
        <button
          @click="openModal"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10"
        >
          Add Item
        </button>
      </div>

      <section class="rounded-xl border border-border bg-card overflow-hidden">
        <BaseDataTable
          :columns="columns"
          :rows="filteredItems"
          :paginate="true"
          :page-size="10"
          empty-text="No backlog items found."
        >
          <template #cell-type="{ row }">
            <svg class="w-5 h-5" :class="typeColors[row.type as BacklogItem['type']]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="typeIcons[row.type as BacklogItem['type']]" />
            </svg>
          </template>

          <template #cell-priority="{ row }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="priorityColors[row.priority as BacklogItem['priority']]">
              {{ row.priority }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[row.status as BacklogItem['status']]">
              {{ row.status.replace('_', ' ') }}
            </span>
          </template>

          <template #cell-estimation="{ value }">
            <span v-if="value" class="opacity-70 text-sm font-mono">{{ value }} pts</span>
            <span v-else class="opacity-30">—</span>
          </template>
        </BaseDataTable>
      </section>

      <!-- Add Item Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-xl font-bold text-text">Create Backlog Item</h3>
            <button @click="closeModal" class="text-text/50 hover:text-text transition">✕</button>
          </div>

          <form @submit.prevent="saveItem" class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Title</label>
              <input v-model="formItem.title" type="text" required placeholder="What needs to be done?" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Type</label>
                <BaseSelectField v-model="formItem.type!" :options="[
                  { label: 'User Story', value: 'STORY' },
                  { label: 'Task', value: 'TASK' },
                  { label: 'Bug', value: 'BUG' },
                ]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Priority</label>
                <BaseSelectField v-model="formItem.priority!" :options="[
                  { label: 'Low', value: 'LOW' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'High', value: 'HIGH' },
                  { label: 'Critical', value: 'CRITICAL' },
                ]" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
               <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Status</label>
                <BaseSelectField v-model="formItem.status!" :options="[
                  { label: 'Backlog', value: 'BACKLOG' },
                  { label: 'To Do', value: 'TODO' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                ]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Estimation (Points)</label>
                <input v-model.number="formItem.estimation" type="number" min="0" placeholder="1, 2, 3, 5, 8..." class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50">
                {{ isSubmitting ? 'Creating...' : 'Create Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
