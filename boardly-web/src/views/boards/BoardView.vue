```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import { useAgileStore, type Task, type WorkflowStatus } from '@/stores/agile'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

interface Column {
  id: WorkflowStatus
  title: string
  color: string
}

const { t } = useI18n()
const agileStore = useAgileStore()

onMounted(async () => {
  await agileStore.fetchData()
})

const columns: Column[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-text/5 text-text/70' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-primary/10 text-primary' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-500/10 text-emerald-600' },
]

// Team members for mock assignment
const teamMembers = [
  { label: 'Unassigned', value: '' },
  { label: 'Hamza R.', value: 'Hamza R.' },
  { label: 'Jane D.', value: 'Jane D.' },
  { label: 'Alex K.', value: 'Alex K.' },
]

// Assignee Filter
const currentAssigneeFilter = ref('ALL')
const assigneeOptions = [
  { label: 'All Assignees', value: 'ALL' },
  ...teamMembers.filter((m: any) => m.label !== 'Unassigned')
]

// Computed tasks for the board
const boardTasks = computed(() => {
  let tasks = agileStore.activeSprintTasks
  if (currentAssigneeFilter.value !== 'ALL') {
    tasks = tasks.filter((t: Task) => t.assignee === currentAssigneeFilter.value)
  }
  return tasks
})

const getTasksByStatus = (status: WorkflowStatus) => {
  return boardTasks.value.filter((task) => task.status === status)
}

// Parent Story Lookup
const getStoryTitle = (storyId: string) => {
  const story = agileStore.stories.find(s => s.id === storyId)
  return story ? story.title : 'Unknown Story'
}

// Drag & Drop State
const draggedTaskId = ref<string | null>(null)
const dragOverColumn = ref<WorkflowStatus | null>(null)

// Drag Handlers
const onDragStart = (event: DragEvent, task: Task) => {
  draggedTaskId.value = task.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('taskId', task.id)
    
    // Ghost image logic
    const ghost = document.createElement('div')
    ghost.classList.add('bg-card', 'border', 'border-primary', 'rounded-xl', 'p-4', 'shadow-2xl', 'opacity-90', 'w-64')
    ghost.innerHTML = `<p class="font-bold text-sm text-text">${task.title}</p>`
    document.body.appendChild(ghost)
    event.dataTransfer.setDragImage(ghost, 20, 20)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }
}

const onDragOver = (event: DragEvent, columnId: WorkflowStatus) => {
  event.preventDefault()
  if (draggedTaskId.value) {
    dragOverColumn.value = columnId
  }
}

const onDragLeave = (event: DragEvent) => {
  dragOverColumn.value = null
}

const onDrop = (event: DragEvent, columnId: WorkflowStatus) => {
  const taskId = draggedTaskId.value || event.dataTransfer?.getData('taskId')
  dragOverColumn.value = null
  draggedTaskId.value = null

  if (taskId) {
    const task = agileStore.tasks.find((t) => t.id === taskId)
    if (task && task.status !== columnId) {
      agileStore.updateTask(taskId, { status: columnId })
    }
  }
}

const onDragEnd = () => {
  draggedTaskId.value = null
  dragOverColumn.value = null
}

// Quick Movement Buttons
const moveTask = (task: Task, direction: 'next' | 'prev') => {
  const currentIdx = columns.findIndex(c => c.id === task.status)
  if (direction === 'next' && currentIdx < columns.length - 1) {
    const nextCol = columns[currentIdx + 1]
    if (nextCol) agileStore.updateTask(task.id, { status: nextCol.id })
  } else if (direction === 'prev' && currentIdx > 0) {
    const prevCol = columns[currentIdx - 1]
    if (prevCol) agileStore.updateTask(task.id, { status: prevCol.id })
  }
}

// Modal State & Logic
interface TaskForm {
  title: string
  status: WorkflowStatus
  assignee: string
  storyId: string
}

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<string | null>(null)
const isSubmitting = ref(false)
const formTask = ref<TaskForm>({
  title: '',
  status: 'TODO',
  assignee: '',
  storyId: '',
})

// Story Dropdown
const activeStoriesOptions = computed(() => {
  if (!agileStore.activeSprint) return []
  return agileStore.getStoriesForSprint(agileStore.activeSprint.id).value.map(s => ({
    label: s.title,
    value: s.id
  }))
})

const openModal = (task?: Task, defaultStatus: WorkflowStatus = 'TODO') => {
  if (task) {
    isEditing.value = true
    editingTaskId.value = task.id
    formTask.value = { 
      title: task.title, 
      status: task.status, 
      assignee: task.assignee || '', 
      storyId: task.storyId 
    }
  } else {
    isEditing.value = false
    editingTaskId.value = null
    const firstOp = activeStoriesOptions.value[0]
    formTask.value = {
      title: '',
      status: defaultStatus,
      assignee: '',
      storyId: firstOp ? firstOp.value : '',
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    editingTaskId.value = null
  }, 200)
}

async function saveTask() {
  if (!formTask.value.title || !formTask.value.storyId) return
  isSubmitting.value = true
  
  const idToEdit = editingTaskId.value
  const isEdit = isEditing.value

  const payload = {
    title: formTask.value.title,
    status: formTask.value.status,
    assignee: formTask.value.assignee || null,
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

// Delete Confirmation
const isConfirmDeleteOpen = ref(false)
const taskToDelete = ref<Task | null>(null)

const confirmDelete = (task: Task) => {
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
</script>

<template>
  <DashboardLayout>
    <div class="h-[calc(100vh-6rem)] flex flex-col w-full min-w-0 pb-4">
      
      <!-- Top Header & Filters -->
      <section class="rounded-xl border border-border bg-card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div>
           <div class="flex items-center gap-2 mb-1">
             <h1 class="text-2xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent flex items-center gap-3">
               {{ t('boards.title') }}
               <span v-if="agileStore.isLoading" class="text-sm font-normal text-text/50 flex items-center gap-1.5 break-normal">
                <i class="pi pi-spinner animate-spin"></i> Syncing...
               </span>
               <span v-else-if="agileStore.error" class="text-sm font-normal text-red-500">
                Error loading data
               </span>
             </h1>
             <span class="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest hidden sm:inline-block">
               {{ agileStore.activeSprint ? agileStore.activeSprint.name : 'No Active Sprint' }}
             </span>
           </div>
          <p class="text-sm text-text/60 font-medium">Sprint execution and task tracking.</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="agileStore.forceRefresh()" 
            class="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text/70 hover:bg-card hover:text-text transition h-10 cursor-pointer"
            title="Force sync data"
          >
            <i class="pi pi-sync" :class="{ 'animate-spin': agileStore.isLoading }"></i>
            <span class="hidden sm:inline">Sync</span>
          </button>
          <div class="w-48 hidden sm:block">
            <BaseSelectField v-model="currentAssigneeFilter" :options="assigneeOptions" />
          </div>
          <button
            v-if="agileStore.activeSprint"
            @click="openModal()"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md h-10 shrink-0 cursor-pointer"
          >
            Add Task
          </button>
        </div>
      </section>

      <div v-if="!agileStore.activeSprint" class="flex-1 rounded-xl border border-border border-dashed bg-card/50 p-10 flex items-center justify-center flex-col shadow-sm">
        <div class="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 text-text/40 border border-border">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <p class="font-bold text-text text-lg">Board Offline</p>
        <p class="text-sm text-text/60 mt-1 max-w-sm text-center">There is no currently active sprint. Start a sprint from the Sprints page.</p>
      </div>

      <!-- Kanban Board Layout -->
      <div v-else class="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar-h flex items-start h-full px-1">
        <div class="flex gap-6 h-full pb-4 items-stretch min-w-max">
          
          <!-- Column Iteration -->
          <div
            v-for="column in columns"
            :key="column.id"
            class="w-[340px] flex flex-col bg-background/50 border border-border/80 rounded-2xl h-full transition-colors duration-200"
            :class="dragOverColumn === column.id ? 'ring-2 ring-primary/40 bg-card/80' : ''"
            @dragover="onDragOver($event, column.id)"
            @dragleave="onDragLeave"
            @drop="onDrop($event, column.id)"
          >
            <!-- Column Header -->
            <div class="p-4 border-b border-border/50 flex items-center justify-between shrink-0 pb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full" :class="column.color.split(' ')[0]"></span>
                <h2 class="font-display font-bold text-sm uppercase tracking-wider text-text/80">
                  {{ column.title }}
                </h2>
                <span class="ml-1 bg-card border border-border text-text/50 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {{ getTasksByStatus(column.id).length }}
                </span>
              </div>
              <button @click="openModal(undefined, column.id)" class="p-1 rounded-md hover:bg-white/10 text-text/40 hover:text-text transition cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            <!-- Task List Area -->
            <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
              <!-- Empty State -->
              <div v-if="getTasksByStatus(column.id).length === 0" class="h-32 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center text-text/30 text-sm font-medium">
                Drop tasks here
              </div>

              <!-- Draggable Task Card -->
              <div
                v-for="task in getTasksByStatus(column.id)"
                :key="task.id"
                :id="'task-' + task.id"
                draggable="true"
                class="group bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-lg hover:ring-1 hover:ring-primary/20 transition-all duration-300 transform hover:-translate-y-1 relative cursor-grab border-l-4 border-l-primary/50"
                :class="[draggedTaskId === task.id ? 'opacity-40 scale-95' : '']"
                @dragstart="onDragStart($event, task)"
                @dragend="onDragEnd()"
              >
                  <!-- Quick Move Actions -->
                 <div class="absolute -left-3 top-1/2 -translate-y-1/2 flex-col gap-1 hidden group-hover:flex z-10">
                   <button 
                     v-if="column.id !== 'TODO'"
                     @click="moveTask(task, 'prev')"
                     class="p-1.5 bg-background border border-border rounded-lg shadow-sm text-text/60 hover:text-primary hover:border-primary/40 transition cursor-pointer"
                   >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                   </button>
                   <button 
                     v-if="column.id !== 'DONE'"
                     @click="moveTask(task, 'next')"
                     class="p-1.5 bg-background border border-border rounded-lg shadow-sm text-text/60 hover:text-primary hover:border-primary/40 transition cursor-pointer"
                   >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                   </button>
                 </div>

                <!-- Type & Parent Story -->
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-text/50 truncate pr-2">
                    {{ getStoryTitle(task.storyId) }}
                  </span>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button @click="openModal(task)" class="p-1 rounded hover:bg-background text-text/40 hover:text-primary transition cursor-pointer"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button @click="confirmDelete(task)" class="p-1 rounded hover:bg-red-500/10 text-text/40 hover:text-red-500 transition cursor-pointer"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg></button>
                  </div>
                </div>
                
                <!-- Title -->
                <h3 class="text-sm font-semibold text-text leading-tight mb-3">
                   {{ task.title }}
                </h3>
                
                <!-- Assignee Footer -->
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                  <div v-if="task.assignee" class="flex items-center gap-1.5" :title="'Assigned to ' + task.assignee">
                    <div class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary border border-primary/30 shrink-0">
                      {{ task.assignee.split(' ').map((n: string) => n[0]).join('') }}
                    </div>
                    <span class="text-xs text-text/60 truncate max-w-[120px]">{{ task.assignee.split(' ')[0] }}</span>
                  </div>
                  <div v-else class="text-[10px] font-bold text-text/30 tracking-wider">
                    UNASSIGNED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex justify-end bg-black/40 backdrop-blur-[2px] mb:p-4" @click.self="closeModal">
        <div class="w-full md:w-[480px] h-full md:h-auto md:max-h-full bg-card border-l md:border border-border/50 md:rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right-8 duration-300">
          
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-border/50 flex items-center justify-between shrink-0 bg-background/30">
            <div>
              <h3 class="text-lg font-black text-text bg-gradient-to-r from-text to-text/60 bg-clip-text text-transparent">
                {{ isEditing ? 'Edit Task' : 'New Task' }}
              </h3>
            </div>
            <button @click="closeModal" class="p-2 rounded-full hover:bg-background text-text/40 hover:text-text transition-all rotate-0 hover:rotate-90">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="saveTask" class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div class="space-y-1.5">
              <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Sprint Story</label>
              <div v-if="activeStoriesOptions.length > 0">
                 <BaseSelectField v-model="formTask.storyId" :options="activeStoriesOptions" />
              </div>
              <div v-else class="text-sm text-red-500 font-medium">Please add stories to this sprint before creating tasks.</div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Task Title</label>
              <textarea 
                v-model="formTask.title" 
                required 
                rows="3"
                placeholder="Describe the atomic task..." 
                class="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all resize-none shadow-inner"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Stage</label>
                <BaseSelectField v-model="(formTask as any).status" :options="[
                  { label: 'To Do', value: 'TODO' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Done', value: 'DONE' },
                ]" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] uppercase font-black tracking-widest text-text/40">Assign To</label>
                <BaseSelectField v-model="formTask.assignee" :options="teamMembers" />
              </div>
            </div>

          </form>

           <!-- Modal Footer -->
           <div class="px-6 py-4 border-t border-border/50 bg-background/30 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
              <button type="button" @click="closeModal" class="px-6 py-2.5 text-sm font-bold text-text/40 hover:text-text hover:bg-background rounded-xl transition-all">Abort</button>
              <button type="submit" :disabled="isSubmitting || !formTask.storyId" class="relative overflow-hidden group px-8 py-2.5 bg-primary rounded-xl text-sm font-black text-primary-foreground shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_15px_25px_-5px_rgba(var(--primary-rgb),0.6)] active:scale-95 transition-all disabled:opacity-50">
                <span class="relative z-10">{{ isSubmitting ? 'Syncing...' : (isEditing ? 'Commit Changes' : 'Create Task') }}</span>
              </button>
           </div>
        </div>
      </div>

       <!-- Delete Confirmation -->
      <BaseConfirmDialog
        :show="isConfirmDeleteOpen"
        title="Delete Task"
        :message="`Are you sure you want to remove '${taskToDelete?.title}'?`"
        confirm-text="Eradicate"
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
