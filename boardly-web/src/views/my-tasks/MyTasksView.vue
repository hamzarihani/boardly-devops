<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'

interface Task {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate: string
  category: string
}

const { t } = useI18n()

// Mock Data
const myTasks = ref<Task[]>([
  { id: '1', title: 'Implement JWT validation', priority: 'HIGH', status: 'DONE', dueDate: '2026-02-25', category: 'Backend' },
  { id: '2', title: 'Add social login providers', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-03-05', category: 'Backend' },
  { id: '3', title: 'Fix session timeout bug', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-02-28', category: 'Bug' },
  { id: '4', title: 'Design system documentation', priority: 'LOW', status: 'TODO', dueDate: '2026-03-10', category: 'Design' },
  { id: '5', title: 'Setup CI/CD pipeline for web', priority: 'CRITICAL', status: 'IN_PROGRESS', dueDate: '2026-02-27', category: 'DevOps' },
  { id: '6', title: 'User profile edit form', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-03-02', category: 'Frontend' },
  { id: '7', title: 'Integrate i18n with dynamic keys', priority: 'HIGH', status: 'DONE', dueDate: '2026-02-24', category: 'Frontend' },
])

// Filters
const search = ref('')
const statusFilter = ref('ALL')
const priorityFilter = ref('ALL')

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
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
  { key: 'title', label: 'Task Name', cellClass: 'font-medium text-text' },
  { key: 'category', label: 'Category' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'dueDate', label: 'Due Date' },
]

const filteredTasks = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return myTasks.value.filter((task) => {
    const matchesStatus = statusFilter.value === 'ALL' || task.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'ALL' || task.priority === priorityFilter.value
    const matchesSearch = !keyword || task.title.toLowerCase().includes(keyword)
    return matchesStatus && matchesPriority && matchesSearch
  })
})

const priorityColors = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusColors = {
  TODO: 'bg-background text-text/60 border border-border',
  IN_PROGRESS: 'bg-primary/15 text-primary',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full pb-10">
      <section class="rounded-xl border border-border bg-card p-5">
        <h1 class="text-2xl font-bold text-text">{{ t('tasks.title') }}</h1>
        <p class="mt-1 text-sm text-text/70">
          {{ t('tasks.description') }}
        </p>
      </section>

      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 max-w-3xl">
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks..."
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <BaseSelectField v-model="statusFilter" :options="statusOptions" />
          <BaseSelectField v-model="priorityFilter" :options="priorityOptions" />
        </div>
      </div>

      <section class="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <BaseDataTable
          :columns="columns"
          :rows="filteredTasks"
          :paginate="true"
          :page-size="10"
          empty-text="No tasks assigned to you."
        >
          <template #cell-priority="{ value }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="priorityColors[value as keyof typeof priorityColors]">
              {{ value }}
            </span>
          </template>

          <template #cell-status="{ value }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[value as keyof typeof statusColors]">
              {{ (value as string).replace('_', ' ') }}
            </span>
          </template>

          <template #cell-dueDate="{ value }">
            <span class="text-sm opacity-70">{{ value }}</span>
          </template>
          
          <template #cell-category="{ value }">
            <span class="text-xs font-medium px-2 py-1 rounded bg-background border border-border text-text/60">
                {{ value }}
            </span>
          </template>
        </BaseDataTable>
      </section>
    </div>
  </DashboardLayout>
</template>
