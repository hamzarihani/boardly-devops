<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseDatePickerField from '@/components/ui/BaseDatePickerField.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

interface BacklogItem {
  id: string
  title: string
  type: 'STORY' | 'TASK' | 'BUG'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE'
  estimation: number | null
  assignee: string | null
  dueDate: string | null
}

const { t } = useI18n()

// Mock Data
const backlogItems = ref<BacklogItem[]>([
  { id: '1', title: 'Implement user authentication flow', type: 'STORY', priority: 'HIGH', status: 'IN_PROGRESS', estimation: 5, assignee: 'Hamza R.', dueDate: '2026-03-05' },
  { id: '2', title: 'Fix sidebar navigation bug on mobile', type: 'BUG', priority: 'MEDIUM', status: 'TODO', estimation: 2, assignee: 'Jane D.', dueDate: '2026-02-28' },
  { id: '3', title: 'Draft API documentation', type: 'TASK', priority: 'LOW', status: 'BACKLOG', estimation: 3, assignee: null, dueDate: '2026-03-15' },
  { id: '4', title: 'Refactor database schema for scalability', type: 'STORY', priority: 'CRITICAL', status: 'BACKLOG', estimation: 8, assignee: 'Alex K.', dueDate: '2026-04-10' },
  { id: '5', title: 'Add unit tests for payment service', type: 'TASK', priority: 'MEDIUM', status: 'TODO', estimation: 5, assignee: 'Hamza R.', dueDate: '2026-03-01' },
  { id: '6', title: 'UI glitch in dark mode settings', type: 'BUG', priority: 'LOW', status: 'BACKLOG', estimation: 1, assignee: null, dueDate: '2026-02-27' },
  { id: '7', title: 'Research OAuth 2.0 integration', type: 'STORY', priority: 'HIGH', status: 'TODO', estimation: 3, assignee: 'Jane D.', dueDate: '2026-03-20' },
])

const teamMembers = [
  { label: 'Unassigned', value: '' },
  { label: 'Hamza R.', value: 'Hamza R.' },
  { label: 'Jane D.', value: 'Jane D.' },
  { label: 'Alex K.', value: 'Alex K.' },
]

// Filters
const search = ref('')
const statusFilter = ref('ALL')
const priorityFilter = ref('ALL')
const assigneeFilter = ref('ALL')

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
  { key: 'title', label: 'Title', cellClass: 'font-medium text-text min-w-[300px]' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'estimation', label: 'Est.', cellClass: 'text-center' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'actions', label: '', cellClass: 'text-right' },
]

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return backlogItems.value.filter((item) => {
    const matchesStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'ALL' || item.priority === priorityFilter.value
    const matchesAssignee = assigneeFilter.value === 'ALL' || item.assignee === assigneeFilter.value
    const matchesSearch = !keyword || item.title.toLowerCase().includes(keyword)
    return matchesStatus && matchesPriority && matchesSearch && matchesAssignee
  })
})

// Modal & Form State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingItemId = ref<string | null>(null)
const formItem = ref<Partial<BacklogItem>>({
  title: '',
  type: 'STORY',
  priority: 'MEDIUM',
  status: 'BACKLOG',
  estimation: null,
  assignee: '',
  dueDate: '',
})

// Confirmation State
const isConfirmDeleteOpen = ref(false)
const itemToDelete = ref<BacklogItem | null>(null)

function openModal(item?: BacklogItem) {
  if (item) {
    isEditing.value = true
    editingItemId.value = item.id
    formItem.value = { ...item }
  } else {
    isEditing.value = false
    editingItemId.value = null
    formItem.value = {
      title: '',
      type: 'STORY',
      priority: 'MEDIUM',
      status: 'BACKLOG',
      estimation: null,
      assignee: '',
      dueDate: '',
    }
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
    if (isEditing.value && editingItemId.value) {
      const index = backlogItems.value.findIndex(i => i.id === editingItemId.value)
      if (index !== -1) {
        backlogItems.value[index] = {
          ...backlogItems.value[index],
          ...formItem.value,
          id: editingItemId.value, // Ensure ID doesn't change
        } as BacklogItem
      }
    } else {
      backlogItems.value.unshift({
        id: Math.random().toString(36).substr(2, 9),
        title: formItem.value.title!,
        type: formItem.value.type as any,
        priority: formItem.value.priority as any,
        status: formItem.value.status as any,
        estimation: formItem.value.estimation as any,
        assignee: formItem.value.assignee || null,
        dueDate: formItem.value.dueDate || null,
      })
    }
    isSubmitting.value = false
    closeModal()
  }, 500)
}

function confirmDelete(item: BacklogItem) {
  itemToDelete.value = item
  isConfirmDeleteOpen.value = true
}

function deleteItem() {
  if (itemToDelete.value) {
    backlogItems.value = backlogItems.value.filter(i => i.id !== itemToDelete.value?.id)
    isConfirmDeleteOpen.value = false
    itemToDelete.value = null
  }
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 max-w-4xl">
          <input
            v-model="search"
            type="text"
            placeholder="Search items..."
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <BaseSelectField v-model="statusFilter" :options="statusOptions" />
          <BaseSelectField v-model="priorityFilter" :options="priorityOptions" />
          <BaseSelectField v-model="assigneeFilter" :options="[{ label: 'All Assignees', value: 'ALL' }, ...teamMembers]" />
        </div>
        <button
          @click="openModal()"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10 shrink-0"
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
            <svg class="w-5 h-5" :class="typeColors[(row as any).type as keyof typeof typeColors]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="typeIcons[(row as any).type as keyof typeof typeIcons]" />
            </svg>
          </template>

          <template #cell-assignee="{ value }">
            <div class="flex items-center gap-2">
              <div v-if="value" class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
                {{ (value as string).split(' ').map(n => n[0]).join('') }}
              </div>
              <span v-if="value" class="text-sm">{{ value }}</span>
              <span v-else class="text-sm text-text/40 italic">Unassigned</span>
            </div>
          </template>

          <template #cell-priority="{ row }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[10px]" :class="priorityColors[(row as any).priority as keyof typeof priorityColors]">
              {{ (row as any).priority }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusColors[(row as any).status as keyof typeof statusColors]">
              {{ ((row as any).status as string).replace('_', ' ') }}
            </span>
          </template>

          <template #cell-estimation="{ value }">
            <span v-if="value" class="opacity-70 text-sm font-mono">{{ value }} pts</span>
            <span v-else class="opacity-30">—</span>
          </template>

          <template #cell-dueDate="{ value }">
            <span v-if="value" class="text-xs opacity-70">{{ value }}</span>
            <span v-else class="opacity-30">—</span>
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

      <!-- Add/Edit Item Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-xl font-bold text-text">
              {{ isEditing ? 'Edit Backlog Item' : 'Create Backlog Item' }}
            </h3>
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
                  { label: 'Done', value: 'DONE' },
                ]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Estimation (Points)</label>
                <input v-model.number="formItem.estimation" type="number" min="0" placeholder="1, 2, 3, 5, 8..." class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Assignee</label>
                <BaseSelectField v-model="formItem.assignee!" :options="teamMembers" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wider text-text/50">Due Date</label>
                <BaseDatePickerField v-model="formItem.dueDate!" placeholder="Select due date" />
              </div>
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50">
                {{ isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Item') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <BaseConfirmDialog
        :show="isConfirmDeleteOpen"
        title="Delete Backlog Item"
        :message="`Are you sure you want to delete '${itemToDelete?.title}'? This action cannot be undone.`"
        confirm-text="Delete"
        variant="danger"
        @confirm="deleteItem"
        @cancel="isConfirmDeleteOpen = false"
      />
    </div>
  </DashboardLayout>
</template>
