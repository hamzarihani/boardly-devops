<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

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
  { key: 'actions', label: '', cellClass: 'text-right' },
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

// Modal & Form State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<string | null>(null)
const formTask = ref<Partial<Task>>({
  title: '',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: '',
  category: 'General',
})

// Confirmation State
const isConfirmDeleteOpen = ref(false)
const taskToDelete = ref<Task | null>(null)

function openModal(task?: Task) {
  if (task) {
    isEditing.value = true
    editingTaskId.value = task.id
    formTask.value = { ...task }
  } else {
    isEditing.value = false
    editingTaskId.value = null
    formTask.value = {
      title: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'General',
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
  // Mock save
  setTimeout(() => {
    if (isEditing.value && editingTaskId.value) {
      const index = myTasks.value.findIndex(t => t.id === editingTaskId.value)
      if (index !== -1) {
        myTasks.value[index] = {
          ...myTasks.value[index],
          ...formTask.value,
          id: editingTaskId.value,
        } as Task
      }
    } else {
      myTasks.value.unshift({
        id: Math.random().toString(36).substr(2, 9),
        title: formTask.value.title!,
        priority: formTask.value.priority as any,
        status: formTask.value.status as any,
        dueDate: formTask.value.dueDate!,
        category: formTask.value.category!,
      })
    }
    isSubmitting.value = false
    closeModal()
  }, 500)
}

function confirmDelete(task: Task) {
  taskToDelete.value = task
  isConfirmDeleteOpen.value = true
}

function deleteTask() {
  if (taskToDelete.value) {
    myTasks.value = myTasks.value.filter(t => t.id !== taskToDelete.value?.id)
    isConfirmDeleteOpen.value = false
    taskToDelete.value = null
  }
}

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
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text">{{ t('tasks.title') }}</h1>
            <p class="mt-1 text-sm text-text/70">
              {{ t('tasks.description') }}
            </p>
          </div>
          <button
            @click="openModal()"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10 shrink-0"
          >
            Add Task
          </button>
        </div>
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
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase font-mono tracking-wider text-[10px]" :class="priorityColors[value as keyof typeof priorityColors]">
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
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-background border border-border text-text/50">
                {{ value }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <button @click="openModal(row as any)" class="p-1.5 rounded-md hover:bg-background text-text/50 hover:text-primary transition" title="Edit">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button @click="confirmDelete(row as any)" class="p-1.5 rounded-md hover:bg-red-500/10 text-text/50 hover:text-red-500 transition" title="Delete">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          </template>
        </BaseDataTable>
      </section>

      <!-- Add/Edit Task Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-xl font-bold text-text">
              {{ isEditing ? 'Edit Task' : 'Add New Task' }}
            </h3>
            <button @click="closeModal" class="text-text/50 hover:text-text transition">✕</button>
          </div>

          <form @submit.prevent="saveTask" class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Task Title</label>
              <input v-model="formTask.title" type="text" required placeholder="Enter task title" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Priority</label>
                <BaseSelectField v-model="formTask.priority!" :options="priorityOptions.slice(1)" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Category</label>
                <input v-model="formTask.category" type="text" placeholder="e.g. Frontend" class="w-full rounded-lg border border-border bg-background px-4 py-2.25 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 h-[42px]" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Status</label>
                <BaseSelectField v-model="formTask.status!" :options="statusOptions.slice(1)" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Due Date</label>
                <input v-model="formTask.dueDate" type="date" class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 h-[42px]" />
              </div>
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50">
                {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <BaseConfirmDialog
        :show="isConfirmDeleteOpen"
        title="Delete Task"
        :message="`Are you sure you want to delete '${taskToDelete?.title}'? This action cannot be undone.`"
        confirm-text="Delete Task"
        variant="danger"
        @confirm="deleteTask"
        @cancel="isConfirmDeleteOpen = false"
      />
    </div>
  </DashboardLayout>
</template>
