<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import BaseDatePickerField from '@/components/ui/BaseDatePickerField.vue'

interface BoardTask {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  assignee: string | null
  type: 'STORY' | 'TASK' | 'BUG'
  dueDate: string | null
  description?: string
}

interface Column {
  id: BoardTask['status']
  title: string
}

const { t } = useI18n()

const columns: Column[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
]

const teamMembers = [
  { label: 'Unassigned', value: '' },
  { label: 'Hamza R.', value: 'Hamza R.' },
  { label: 'Jane D.', value: 'Jane D.' },
  { label: 'Alex K.', value: 'Alex K.' },
]

// Mock Data
const tasks = ref<BoardTask[]>([
  { id: '1', title: 'Implement user authentication flow', type: 'STORY', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'Hamza R.', dueDate: '2026-03-05' },
  { id: '2', title: 'Fix sidebar navigation bug on mobile', type: 'BUG', priority: 'MEDIUM', status: 'TODO', assignee: 'Jane D.', dueDate: '2026-02-28' },
  { id: '3', title: 'Draft API documentation', type: 'TASK', priority: 'LOW', status: 'TODO', assignee: null, dueDate: '2026-03-15' },
  { id: '4', title: 'Refactor database schema for scalability', type: 'STORY', priority: 'CRITICAL', status: 'TODO', assignee: 'Alex K.', dueDate: '2026-04-10' },
  { id: '5', title: 'Add unit tests for payment service', type: 'TASK', priority: 'MEDIUM', status: 'IN_PROGRESS', assignee: 'Hamza R.', dueDate: '2026-03-01' },
  { id: '7', title: 'Research OAuth 2.0 integration', type: 'STORY', priority: 'HIGH', status: 'DONE', assignee: 'Jane D.', dueDate: '2026-03-20' },
  { id: '8', title: 'API performance optimization', type: 'TASK', priority: 'HIGH', status: 'DONE', assignee: 'Hamza R.', dueDate: '2026-02-27' },
])

// Filters
const search = ref('')
const priorityFilter = ref('ALL')

const priorityOptions = [
  { label: 'All Priorities', value: 'ALL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
]

const filteredTasks = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return tasks.value.filter((task) => {
    const matchesPriority = priorityFilter.value === 'ALL' || task.priority === priorityFilter.value
    const matchesSearch = !keyword || task.title.toLowerCase().includes(keyword)
    return matchesPriority && matchesSearch
  })
})

function getTasksByStatus(status: BoardTask['status']) {
  return filteredTasks.value.filter(task => task.status === status)
}

// Modal & Form State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<string | null>(null)

interface TaskForm {
  title: string
  type: BoardTask['type']
  priority: BoardTask['priority']
  status: BoardTask['status']
  assignee: string
  dueDate: string
}

const formTask = ref<TaskForm>({
  title: '',
  type: 'STORY',
  priority: 'MEDIUM',
  status: 'TODO',
  assignee: '',
  dueDate: '',
})

// Confirmation State
const isConfirmDeleteOpen = ref(false)
const taskToDelete = ref<BoardTask | null>(null)

function openModal(task?: BoardTask, initialStatus?: BoardTask['status']) {
  if (task) {
    isEditing.value = true
    editingTaskId.value = task.id
    formTask.value = {
      title: task.title,
      type: task.type,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee || '',
      dueDate: task.dueDate || '',
    }
  } else {
    isEditing.value = false
    editingTaskId.value = null
    formTask.value = {
      title: '',
      type: 'STORY',
      priority: 'MEDIUM',
      status: initialStatus || 'TODO',
      assignee: '',
      dueDate: '',
    }
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function saveTask() {
  if (!formTask.value.title) return
  
  isSubmitting.value = true
  setTimeout(() => {
    if (isEditing.value && editingTaskId.value) {
      const index = tasks.value.findIndex(t => t.id === editingTaskId.value)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...formTask.value } as BoardTask
      }
    } else {
      tasks.value.push({
        id: Math.random().toString(36).substr(2, 9),
        title: formTask.value.title!,
        type: formTask.value.type as any,
        priority: formTask.value.priority as any,
        status: formTask.value.status as any,
        assignee: formTask.value.assignee || null,
        dueDate: formTask.value.dueDate || null,
      })
    }
    isSubmitting.value = false
    closeModal()
  }, 500)
}

function confirmDelete(task: BoardTask) {
  taskToDelete.value = task
  isConfirmDeleteOpen.value = true
}

function deleteTask() {
  if (taskToDelete.value) {
    tasks.value = tasks.value.filter(t => t.id !== taskToDelete.value?.id)
    isConfirmDeleteOpen.value = false
    taskToDelete.value = null
  }
}

function moveTask(task: BoardTask, direction: 'next' | 'prev') {
  const statusOrder: BoardTask['status'][] = ['TODO', 'IN_PROGRESS', 'DONE']
  const currentIndex = statusOrder.indexOf(task.status)
  let nextIndex = currentIndex + (direction === 'next' ? 1 : -1)
  
  if (nextIndex >= 0 && nextIndex < statusOrder.length) {
    task.status = statusOrder[nextIndex] as BoardTask['status']
  }
}

// Visual Helpers
const priorityColors: Record<BoardTask['priority'], string> = {
  LOW: 'border-l-4 border-slate-400',
  MEDIUM: 'border-l-4 border-blue-400',
  HIGH: 'border-l-4 border-orange-400',
  CRITICAL: 'border-l-4 border-red-500',
}

const typeColors: Record<BoardTask['type'], string> = {
  STORY: 'text-blue-500',
  TASK: 'text-green-500',
  BUG: 'text-red-500'
}

const typeIcons: Record<BoardTask['type'], string> = {
  STORY: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  TASK: 'M9 11l3 3L20 6M4 6h3M4 12h3M4 18h10',
  BUG: 'M12 22a7 7 0 0 0 7-7M5 15a7 7 0 0 1 7-7m0 0a7 7 0 0 1 7 7M5 15V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10'
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 h-full flex flex-col pb-10">
      <!-- Header -->
      <section class="rounded-xl border border-border bg-card p-5 shrink-0 flex items-center justify-between shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-text">{{ t('boards.title') }}</h1>
          <p class="mt-1 text-sm text-text/70">{{ t('boards.description') }}</p>
        </div>
        <button
          @click="openModal()"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md h-10 shrink-0"
        >
          Add Task
        </button>
      </section>

      <!-- Toolbar -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between shrink-0 mb-2 px-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 max-w-2xl">
          <div class="relative group">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 group-focus-within:text-primary transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              v-model="search"
              type="text"
              placeholder="Search tasks on board..."
              class="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
          <BaseSelectField v-model="priorityFilter" :options="priorityOptions" />
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex-1 overflow-x-auto pb-4 custom-scrollbar-h">
        <div class="flex gap-6 min-h-full">
          <div
            v-for="column in columns"
            :key="column.id"
            class="flex-1 min-w-[320px] max-w-[400px] flex flex-col bg-background/30 rounded-2xl border border-border/40 p-3 shadow-inner"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between px-2 mb-4">
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-6 rounded-full" :class="{
                  'bg-amber-500': column.id === 'TODO',
                  'bg-primary': column.id === 'IN_PROGRESS',
                  'bg-emerald-500': column.id === 'DONE'
                }"></div>
                <h3 class="font-bold text-text/80 uppercase tracking-widest text-xs">{{ column.title }}</h3>
                <span class="px-2 py-0.5 rounded-full bg-border text-[10px] font-bold text-text/60">
                  {{ getTasksByStatus(column.id).length }}
                </span>
              </div>
              <button @click="openModal(undefined, column.id)" class="p-1 rounded-md hover:bg-white/10 text-text/40 hover:text-text transition">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            <!-- Task Cards -->
            <div class="flex-1 overflow-y-auto overflow-x-hidden space-y-3 px-1 custom-scrollbar">
              <!-- Empty State -->
              <div v-if="getTasksByStatus(column.id).length === 0" class="flex flex-col items-center justify-center py-10 opacity-30 border border-dashed border-border rounded-xl">
                 <svg class="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 11V6m0 0L9 9m3-3 3 3m-9 5v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/></svg>
                 <span class="text-xs">No tasks here</span>
              </div>

              <div
                v-for="task in getTasksByStatus(column.id)"
                :key="task.id"
                class="group bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-lg hover:ring-1 hover:ring-primary/20 transition-all duration-300 transform hover:-translate-y-1 relative"
                :class="priorityColors[task.priority]"
              >
                <!-- Quick Move Controls (Hover only) -->
                <div class="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition duration-200 z-10 translate-x-2 group-hover:translate-x-0">
                   <button 
                     v-if="column.id !== 'TODO'"
                     @click="moveTask(task, 'prev')"
                     class="p-1.5 bg-background border border-border rounded-lg shadow-sm text-text/60 hover:text-primary hover:border-primary/40 transition"
                   >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                   </button>
                   <button 
                     v-if="column.id !== 'DONE'"
                     @click="moveTask(task, 'next')"
                     class="p-1.5 bg-background border border-border rounded-lg shadow-sm text-text/60 hover:text-primary hover:border-primary/40 transition"
                   >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                </div>

                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" :class="typeColors[task.type]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path :d="typeIcons[task.type]" />
                    </svg>
                    <span class="text-[10px] font-bold text-text/40 tracking-wider">DEV-{{ task.id.slice(0,4) }}</span>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                    <button @click="openModal(task)" class="p-1 rounded hover:bg-background text-text/40 hover:text-primary transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button @click="confirmDelete(task)" class="p-1 rounded hover:bg-red-500/10 text-text/40 hover:text-red-500 transition"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg></button>
                  </div>
                </div>
                
                <h4 class="text-sm font-bold text-text mb-3 line-clamp-2 leading-snug">
                  {{ task.title }}
                </h4>

                <div v-if="task.dueDate" class="flex items-center gap-1 text-[10px] text-text/50 mb-4 bg-background px-2 py-1 rounded w-fit border border-border/50">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span>{{ task.dueDate }}</span>
                </div>

                <div class="flex items-center justify-between pt-1 mt-auto">
                  <div class="flex -space-x-1.5 translate-x-1 group-hover:translate-x-0 transition-transform">
                     <div v-if="task.assignee" class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border-2 border-card z-10" :title="task.assignee">
                        {{ task.assignee.split(' ').map(n => n[0]).join('') }}
                     </div>
                     <div v-else class="w-7 h-7 rounded-full bg-background border border-dashed border-border flex items-center justify-center text-text/20 z-10 shadow-inner">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     </div>
                  </div>
                  <span 
                    class="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ring-1 ring-inset shadow-sm"
                    :class="{
                       'bg-red-500/10 text-red-500 ring-red-500/20': task.priority === 'CRITICAL',
                       'bg-orange-500/10 text-orange-500 ring-orange-500/20': task.priority === 'HIGH',
                       'bg-blue-500/10 text-blue-500 ring-blue-500/20': task.priority === 'MEDIUM',
                       'bg-slate-500/10 text-slate-400 ring-slate-500/10': task.priority === 'LOW'
                    }"
                  >
                    {{ task.priority }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
       <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300" @click.self="closeModal">
        <div class="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300 ring-1 ring-white/5">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-2xl font-bold bg-gradient-to-r from-text to-text/60 bg-clip-text text-transparent italic">
              {{ isEditing ? 'Refine Task' : 'Propel New Task' }}
            </h3>
            <button @click="closeModal" class="p-2 rounded-full hover:bg-background text-text/40 hover:text-text transition-all rotate-0 hover:rotate-90">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="saveTask" class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Core Objective</label>
              <input v-model="formTask.title" type="text" required placeholder="Ex: Revolutionize user onboarding" class="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-medium" />
            </div>

            <div class="grid grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Type</label>
                <BaseSelectField v-model="formTask.type" :options="[
                  { label: 'Story', value: 'STORY' },
                  { label: 'Task', value: 'TASK' },
                  { label: 'Bug', value: 'BUG' },
                ]" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Impact Level</label>
                <BaseSelectField v-model="formTask.priority" :options="[
                  { label: 'Low', value: 'LOW' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'High', value: 'HIGH' },
                  { label: 'Critical', value: 'CRITICAL' },
                ]" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-5">
               <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Workflow Stage</label>
                <BaseSelectField v-model="formTask.status" :options="[
                  { label: 'To Do', value: 'TODO' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Done', value: 'DONE' },
                ]" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Target Date</label>
                <BaseDatePickerField v-model="formTask.dueDate!" placeholder="Select milestone" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-text/40 ml-1">Executor</label>
                <BaseSelectField v-model="formTask.assignee" :options="teamMembers" />
            </div>

            <div class="mt-10 flex justify-end gap-4 pt-4 border-t border-border/50">
              <button type="button" @click="closeModal" class="px-6 py-2.5 text-sm font-bold text-text/40 hover:text-text hover:bg-background rounded-xl transition-all">Abort</button>
              <button type="submit" :disabled="isSubmitting" class="relative overflow-hidden group px-8 py-2.5 bg-primary rounded-xl text-sm font-black text-primary-foreground shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_15px_25px_-5px_rgba(var(--primary-rgb),0.6)] active:scale-95 transition-all disabled:opacity-50">
                <span class="relative z-10">{{ isSubmitting ? 'Syncing...' : (isEditing ? 'Commit Changes' : 'Initialize Task') }}</span>
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <BaseConfirmDialog
        :show="isConfirmDeleteOpen"
        title="Liquidate Task"
        :message="`Are you sure you want to erase '${taskToDelete?.title}'? This action will remove it from the digital workspace forever.`"
        confirm-text="Erase Forever"
        variant="danger"
        @confirm="deleteTask"
        @cancel="isConfirmDeleteOpen = false"
      />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-50); }

.custom-scrollbar-h::-webkit-scrollbar { height: 6px; }
.custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-h::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
</style>
