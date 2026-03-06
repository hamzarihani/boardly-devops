<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import { useAgileStore, type Task, type WorkflowStatus } from '@/stores/agile'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

const { t } = useI18n()
const agileStore = useAgileStore()

onMounted(() => {
  agileStore.fetchData()
})

// Mock current user
const currentUserOptions = [
  { label: 'Hamza R.', value: 'Hamza R.' },
  { label: 'Jane D.', value: 'Jane D.' },
  { label: 'Alex K.', value: 'Alex K.' }
]
const currentUser = ref('Hamza R.')

// Filters
const search = ref('')
const statusFilter = ref('ALL')

const statusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

const columns: DataTableColumn[] = [
  { key: 'title', label: 'Task Name', cellClass: 'font-medium text-text' },
  { key: 'storyTitle', label: 'Parent Story' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', cellClass: 'text-right' },
]

const myTasks = computed(() => {
  return agileStore.tasks.filter(t => t.assignee === currentUser.value)
})

const getStoryTitle = (storyId: string) => {
  return agileStore.stories.find(s => s.id === storyId)?.title || 'Unassigned Story'
}

const filteredTasks = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return myTasks.value.filter((task) => {
    const matchesStatus = statusFilter.value === 'ALL' || task.status === statusFilter.value
    const matchesSearch = !keyword || task.title.toLowerCase().includes(keyword)
    return matchesStatus && matchesSearch
  })
})

// Modal & Form State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<string | null>(null)

interface TaskForm {
  title: string
  status: WorkflowStatus
  storyId: string
}

const formTask = ref<TaskForm>({
  title: '',
  status: 'TODO',
  storyId: '',
})

// Story Dropdown
const availableStoriesOptions = computed(() => {
  return agileStore.stories.map(s => ({
    label: s.title,
    value: s.id
  }))
})

// Confirmation State
const isConfirmDeleteOpen = ref(false)
const taskToDelete = ref<Task | null>(null)

function openModal(task?: Task) {
  if (task) {
    isEditing.value = true
    editingTaskId.value = task.id
    formTask.value = { 
       title: task.title,
       status: task.status,
       storyId: task.storyId
    }
  } else {
    isEditing.value = false
    editingTaskId.value = null
    const firstOp = availableStoriesOptions.value[0]
    formTask.value = {
      title: '',
      status: 'TODO',
      storyId: firstOp ? firstOp.value : '',
    }
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  setTimeout(() => editingTaskId.value = null, 200)
}

async function saveTask() {
  if (!formTask.value.title || !formTask.value.storyId) return
  
  isSubmitting.value = true
  
  const idToEdit = editingTaskId.value
  const isEdit = isEditing.value

  const payload = {
    title: formTask.value.title,
    status: formTask.value.status,
    assignee: currentUser.value, // Always assign to self from this view
    storyId: formTask.value.storyId,
  }
  
  try {
    if (isEdit && idToEdit) {
       await agileStore.updateTask(idToEdit, payload)
    } else {
       await agileStore.addTask(payload)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save task:', error)
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(task: Task) {
  taskToDelete.value = task
  isConfirmDeleteOpen.value = true
}

async function deleteTask() {
  if (taskToDelete.value) {
    await agileStore.deleteTask(taskToDelete.value.id)
    isConfirmDeleteOpen.value = false
    taskToDelete.value = null
  }
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
             <div class="flex items-center gap-2 mb-1">
               <h1 class="text-2xl font-bold text-text flex items-center gap-3">
                 {{ t('tasks.title') }}
                 <span v-if="agileStore.isLoading" class="text-sm font-normal text-text/50 flex items-center gap-1.5 break-normal">
                  <i class="pi pi-spinner animate-spin"></i> Syncing...
                 </span>
                 <span v-else-if="agileStore.error" class="text-sm font-normal text-red-500">
                  Error loading data
                 </span>
               </h1>
               <span class="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest hidden sm:inline-block">
                 {{ currentUser }}
               </span>
             </div>
            <p class="mt-1 text-sm text-text/70">
              {{ t('tasks.description') }}
            </p>
          </div>
          <button
            @click="openModal()"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10 shrink-0 cursor-pointer"
          >
            Add Task
          </button>
        </div>
      </section>

      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 max-w-2xl">
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks..."
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <BaseSelectField v-model="statusFilter" :options="statusOptions" />
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
          <template #cell-storyTitle="{ row }">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-background border border-border text-text/50">
                {{ getStoryTitle((row as any).storyId) }}
            </span>
          </template>

          <template #cell-status="{ value }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[value as keyof typeof statusColors]">
              {{ (value as string).replace('_', ' ') }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <button @click="openModal(row as any)" class="p-1.5 rounded-md hover:bg-background text-text/50 hover:text-primary transition cursor-pointer" title="Edit">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button @click="confirmDelete(row as any)" class="p-1.5 rounded-md hover:bg-red-500/10 text-text/50 hover:text-red-500 transition cursor-pointer" title="Delete">
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
            <button @click="closeModal" class="text-text/50 hover:text-text transition cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="saveTask" class="space-y-4">
            
            <div class="space-y-1">
              <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Task Title</label>
              <input v-model="formTask.title" type="text" required placeholder="Enter task title" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Parent Story</label>
              <div v-if="availableStoriesOptions.length > 0">
                 <BaseSelectField v-model="formTask.storyId" :options="availableStoriesOptions" />
              </div>
              <div v-else class="text-sm text-red-500 font-medium">No stories exist. Add some to the backlog.</div>
            </div>

            <div class="space-y-1">
                <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Status</label>
                <BaseSelectField v-model="formTask.status!" :options="statusOptions.slice(1)" />
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition cursor-pointer">Cancel</button>
              <button type="submit" :disabled="isSubmitting || !formTask.storyId" class="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50 cursor-pointer">
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
