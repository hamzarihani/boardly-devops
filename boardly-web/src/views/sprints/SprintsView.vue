<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseDatePickerField from '@/components/ui/BaseDatePickerField.vue'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'

interface SprintTask {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  assignee: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'PLANNED' | 'COMPLETED'
  tasks: SprintTask[]
}

const { t } = useI18n()

// Mock Active Sprint
const activeSprint = ref<Sprint>({
  id: 's5',
  name: 'Sprint 5: Core Authentication',
  startDate: '2026-02-23',
  endDate: '2026-03-08',
  status: 'ACTIVE',
  tasks: [
    { id: '1', title: 'Implement JWT validation', status: 'DONE', assignee: 'Hamza R.', priority: 'HIGH' },
    { id: '2', title: 'Setup refresh token rotation', status: 'IN_PROGRESS', assignee: 'Jane D.', priority: 'HIGH' },
    { id: '3', title: 'Design login UI components', status: 'DONE', assignee: 'Alex K.', priority: 'MEDIUM' },
    { id: '4', title: 'Add social login providers', status: 'TODO', assignee: 'Hamza R.', priority: 'MEDIUM' },
    { id: '5', title: 'Fix session timeout bug', status: 'IN_PROGRESS', assignee: 'Jane D.', priority: 'HIGH' },
  ],
})

// Mock Upcoming Sprints
const upcomingSprints = ref<Partial<Sprint>[]>([
  { id: 's6', name: 'Sprint 6: User Profiles & Settings', startDate: '2026-03-09', endDate: '2026-03-22', status: 'PLANNED' },
  { id: 's7', name: 'Sprint 7: Resource Management', startDate: '2026-03-23', endDate: '2026-04-05', status: 'PLANNED' },
])

const activeSprintProgress = computed(() => {
  const total = activeSprint.value.tasks.length
  if (total === 0) return 0
  const done = activeSprint.value.tasks.filter((t) => t.status === 'DONE').length
  const inProgress = activeSprint.value.tasks.filter((t) => t.status === 'IN_PROGRESS').length
  return Math.round(((done + inProgress * 0.5) / total) * 100)
})

const columns: DataTableColumn[] = [
  { key: 'title', label: 'Task Name', cellClass: 'font-medium text-text' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
]

// Modal & Form
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const formSprint = ref({
  name: '',
  startDate: '',
  endDate: '',
})

function openModal() {
  formSprint.value = { name: '', startDate: '', endDate: '' }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function createSprint() {
  if (!formSprint.value.name || !formSprint.value.startDate || !formSprint.value.endDate) return
  isSubmitting.value = true
  setTimeout(() => {
    upcomingSprints.value.push({
      id: Math.random().toString(36).substr(2, 9),
      name: formSprint.value.name,
      startDate: formSprint.value.startDate,
      endDate: formSprint.value.endDate,
      status: 'PLANNED',
    })
    isSubmitting.value = false
    closeModal()
  }, 500)
}

const statusColors = {
  TODO: 'bg-background text-text/60 border border-border',
  IN_PROGRESS: 'bg-primary/15 text-primary',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const priorityColors = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full pb-10">
      <section class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text">{{ t('sprints.title') }}</h1>
            <p class="mt-1 text-sm text-text/70">{{ t('sprints.description') }}</p>
          </div>
          <button @click="openModal" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10">
            Create Sprint
          </button>
        </div>
      </section>

      <!-- Active Sprint Card -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary animate-pulse">
                  ACTIVE
                </span>
                <h2 class="text-xl font-bold text-text">{{ activeSprint.name }}</h2>
              </div>
              <p class="text-sm text-text/60">{{ activeSprint.startDate }} — {{ activeSprint.endDate }}</p>
            </div>
            <div class="text-right">
              <span class="text-3xl font-bold text-primary">{{ activeSprintProgress }}%</span>
              <p class="text-xs font-semibold uppercase tracking-wider text-text/40">Overall Progress</p>
            </div>
          </div>

          <div class="w-full bg-background rounded-full h-2.5 mb-8 border border-border overflow-hidden">
            <div class="bg-primary h-full transition-all duration-1000 ease-out" :style="{ width: `${activeSprintProgress}%` }"></div>
          </div>

          <BaseDataTable :columns="columns" :rows="activeSprint.tasks" empty-text="No tasks in current sprint.">
            <template #cell-status="{ value }">
              <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[value as keyof typeof statusColors]">
                {{ (value as string).replace('_', ' ') }}
              </span>
            </template>
            <template #cell-priority="{ value }">
              <span class="uppercase tracking-wide text-[10px] font-bold" :class="priorityColors[value as keyof typeof priorityColors]">
                {{ value }}
              </span>
            </template>
          </BaseDataTable>
        </div>

        <div class="space-y-6">
          <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-text/50 mb-4">Sprint Goals</h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-sm text-text/80">
                <div class="mt-1 w-4 h-4 rounded-full border border-primary flex items-center justify-center shrink-0">
                  <div class="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                Complete secure authentication flow for members.
              </li>
              <li class="flex items-start gap-3 text-sm text-text/80">
                <div class="mt-1 w-4 h-4 rounded-full border border-primary flex items-center justify-center shrink-0">
                  <div class="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                Integrate JWT tokens with backend services.
              </li>
            </ul>
          </div>

          <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-text/50 mb-4">Upcoming Sprints</h3>
            <div class="space-y-4">
              <div v-for="sprint in upcomingSprints" :key="sprint.id" class="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition cursor-default">
                <p class="text-sm font-semibold text-text">{{ sprint.name }}</p>
                <p class="text-xs text-text/50 mt-1">{{ sprint.startDate }} to {{ sprint.endDate }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Create Sprint Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-xl font-bold text-text">Plan New Sprint</h3>
            <button @click="closeModal" class="text-text/50 hover:text-text transition">✕</button>
          </div>

          <form @submit.prevent="createSprint" class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Sprint Name</label>
              <input v-model="formSprint.name" type="text" required placeholder="e.g. Sprint 6: Profiles" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <BaseDatePickerField v-model="formSprint.startDate" label="Start Date" />
              <BaseDatePickerField v-model="formSprint.endDate" label="End Date" />
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50">
                {{ isSubmitting ? 'Planning...' : 'Plan Sprint' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
