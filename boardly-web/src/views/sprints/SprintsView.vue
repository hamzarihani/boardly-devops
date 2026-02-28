<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import { useAgileStore } from '@/stores/agile'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseDatePickerField from '@/components/ui/BaseDatePickerField.vue'

const { t } = useI18n()
const agileStore = useAgileStore()

const columns: DataTableColumn[] = [
  { key: 'title', label: 'Story Title', cellClass: 'font-medium text-text' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'assignee', label: 'Owner' },
  { key: 'estimation', label: 'Est.', cellClass: 'text-center' },
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
    agileStore.addSprint({
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
  BACKLOG: 'bg-background text-text/60 border border-border',
  TODO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IN_PROGRESS: 'bg-primary/15 text-primary',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const priorityColors = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500 font-bold',
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full pb-10">
      <section class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text">{{ t('sprints.title') }}</h1>
            <p class="mt-1 text-sm text-text/70">{{ t('sprints.description') }} (View & Manage Sprint Cycles)</p>
          </div>
          <button @click="openModal" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10 cursor-pointer">
            Create Sprint
          </button>
        </div>
      </section>

      <!-- Active Sprint Card -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div v-if="agileStore.activeSprint" class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div class="flex items-start justify-between mb-6">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary animate-pulse">
                    ACTIVE
                  </span>
                  <h2 class="text-xl font-bold text-text">{{ agileStore.activeSprint.name }}</h2>
                </div>
                <p class="text-sm text-text/60">{{ agileStore.activeSprint.startDate }} — {{ agileStore.activeSprint.endDate }}</p>
              </div>
              <div class="text-right">
                <span class="text-3xl font-bold text-primary">{{ agileStore.getSprintProgress(agileStore.activeSprint.id).value }}%</span>
                <p class="text-xs font-semibold uppercase tracking-wider text-text/40">Task Completion</p>
              </div>
            </div>

            <div class="w-full bg-background rounded-full h-2.5 mb-8 border border-border overflow-hidden">
              <div class="bg-primary h-full transition-all duration-1000 ease-out" :style="{ width: `${agileStore.getSprintProgress(agileStore.activeSprint.id).value}%` }"></div>
            </div>

            <h3 class="font-bold text-text mb-3">Stories inside Sprint</h3>
            <BaseDataTable :columns="columns" :rows="agileStore.getStoriesForSprint(agileStore.activeSprint.id).value" empty-text="No stories assigned to this sprint yet. Check Backlog.">
              <template #cell-status="{ value }">
                <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[value as keyof typeof statusColors] || statusColors.TODO">
                  {{ (value as string).replace('_', ' ') }}
                </span>
              </template>
              <template #cell-priority="{ value }">
                <span class="uppercase tracking-wide text-[10px] font-bold" :class="priorityColors[value as keyof typeof priorityColors]">
                  {{ value }}
                </span>
              </template>
               <template #cell-estimation="{ value }">
                  <span v-if="value" class="text-sm font-bold opacity-80 rounded bg-background px-1.5 py-0.5 border border-border">{{ value }}</span>
                  <span v-else class="opacity-30">—</span>
              </template>
            </BaseDataTable>
          </div>
          
          <div v-else class="rounded-xl border border-border border-dashed bg-card/50 p-10 flex items-center justify-center flex-col shadow-sm">
             <div class="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 text-text/40 border border-border">
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <p class="font-bold text-text">No Active Sprint</p>
             <p class="text-sm text-text/60 mt-1 max-w-sm text-center">Start a planned sprint to see active tracking here.</p>
          </div>
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
              <div v-if="agileStore.plannedSprints.length === 0" class="text-center py-4 bg-background rounded-lg border border-border/50 text-text/50 text-sm">
                No planned sprints pending.
              </div>
              <div v-for="sprint in agileStore.plannedSprints" :key="sprint.id" class="p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition cursor-default">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-bold text-text">{{ sprint.name }}</p>
                  <span class="text-[10px] uppercase font-black tracking-widest bg-blue-500/10 text-blue-500 px-2 rounded">Planned</span>
                </div>
                <p class="text-[11px] text-text/50 font-mono tracking-wide">{{ sprint.startDate }} to {{ sprint.endDate }}</p>
                <div class="mt-3 text-xs text-text/60 border-t border-border/50 pt-2 flex items-center gap-2">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <span>{{ agileStore.getStoriesForSprint(sprint.id).value.length }} Assigned Stories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Create Sprint Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-xl font-bold bg-gradient-to-r from-text to-text/60 bg-clip-text text-transparent">Plan New Sprint</h3>
            <button @click="closeModal" class="text-text/50 hover:text-text transition cursor-pointer p-1">
               <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="createSprint" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Sprint Name</label>
              <input v-model="formSprint.name" type="text" required placeholder="e.g. Sprint 6: Profiles" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <BaseDatePickerField v-model="formSprint.startDate" label="Start Date" />
              <BaseDatePickerField v-model="formSprint.endDate" label="End Date" />
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition cursor-pointer">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50 cursor-pointer">
                {{ isSubmitting ? 'Planning...' : 'Plan Sprint' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
