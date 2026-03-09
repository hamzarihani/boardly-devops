<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useI18n } from '@/i18n'
import { useAgileStore, type Story } from '@/stores/agile'
import { useTeamStore } from '@/stores/team'
import BaseSelectField from '@/components/ui/BaseSelectField.vue'
import BaseDataTable, { type DataTableColumn } from '@/components/ui/BaseDataTable.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

const { t } = useI18n()
const agileStore = useAgileStore()
const teamStore = useTeamStore()

onMounted(async () => {
  await Promise.all([
    agileStore.fetchSprints(),
    agileStore.fetchStories(),
    teamStore.fetchMembers()
  ])
})

const teamMembers = computed(() => teamStore.memberOptions)

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

// Derived options for sprints
const sprintOptions = computed(() => {
  return [
    { label: 'Unassigned (Backlog)', value: '' },
    ...agileStore.sprints.map(s => ({
      label: `${s.name} (${s.status})`,
      value: s.id
    })) // Use ID string, empty string mapped to null
  ]
})

const columns: DataTableColumn[] = [
  { key: 'type', label: 'Type', cellClass: 'w-10' },
  { key: 'title', label: 'Story Title', cellClass: 'font-medium text-text min-w-[300px]' },
  { key: 'sprint', label: 'Sprint' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'estimation', label: 'Est.', cellClass: 'text-center' },
  { key: 'actions', label: '', cellClass: 'text-right' },
]

// Expose all stories to the table since the backlog can include sprint planning.
const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return agileStore.stories.filter((item) => {
    const matchesStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'ALL' || item.priority === priorityFilter.value
    const matchesAssignee = assigneeFilter.value === 'ALL' || item.assignee === assigneeFilter.value
    const matchesSearch = !keyword || item.title.toLowerCase().includes(keyword)
    return matchesStatus && matchesPriority && matchesSearch && matchesAssignee
  })
})

function getSprintBadgeFormat(sprintId: string | null) {
  if (!sprintId) return { label: 'Backlog', colors: 'text-text/60 bg-background border border-border/50' }
  const sp = agileStore.sprints.find(s => s.id === sprintId)
  if (!sp) return { label: 'Unknown', colors: 'text-text/60 bg-background' }
  if (sp.status === 'ACTIVE') return { label: sp.name.split(':')[0] || 'Active', colors: 'text-primary bg-primary/10 border border-primary/20' }
  if (sp.status === 'PLANNED') return { label: sp.name.split(':')[0] || 'Planned', colors: 'text-blue-500 bg-blue-500/10 border border-blue-500/20' }
  return { label: 'Completed', colors: 'text-emerald-500 bg-emerald-500/10' }
}

// Modal & Form State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingItemId = ref<string | null>(null)
const formItem = ref<Partial<Story & { sprintIdStr: string }>>({
  title: '',
  type: 'STORY',
  priority: 'MEDIUM',
  status: 'BACKLOG',
  estimation: null,
  assignee: '',
  dueDate: '',
  sprintIdStr: '', // UI model mapping
})

// Confirmation State
const isConfirmDeleteOpen = ref(false)
const itemToDelete = ref<Story | null>(null)

function openModal(item?: Story) {
  if (item) {
    isEditing.value = true
    editingItemId.value = item.id
    formItem.value = { 
      ...item,
      sprintIdStr: item.sprintId || '' 
    }
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
      sprintIdStr: '',
    }
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function saveItem() {
  if (!formItem.value.title) return
  
  isSubmitting.value = true
  
  const mappedData: Partial<Story> = {
    title: formItem.value.title,
    type: formItem.value.type as any,
    priority: formItem.value.priority as any,
    status: formItem.value.status as any,
    estimation: formItem.value.estimation,
    assignee: formItem.value.assignee || null,
    dueDate: formItem.value.dueDate || null,
    sprintId: formItem.value.sprintIdStr || null
  }

  try {
    if (isEditing.value && editingItemId.value) {
      await agileStore.updateStory(editingItemId.value, mappedData)
    } else {
      await agileStore.addStory(mappedData as any)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save story:', error)
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(item: Story) {
  itemToDelete.value = item
  isConfirmDeleteOpen.value = true
}

async function deleteItem() {
  if (itemToDelete.value) {
    await agileStore.deleteStory(itemToDelete.value.id)
    isConfirmDeleteOpen.value = false
    itemToDelete.value = null
  }
}

// Helpers
const typeIcons: Record<Story['type'], string> = {
  STORY: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  BUG: 'M12 22a7 7 0 0 0 7-7M5 15a7 7 0 0 1 7-7m0 0a7 7 0 0 1 7 7M5 15V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10'
}

const typeColors: Record<Story['type'], string> = {
  STORY: 'text-blue-500',
  BUG: 'text-red-500'
}

const priorityColors: Record<Story['priority'], string> = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusColors: Record<Story['status'], string> = {
  BACKLOG: 'bg-background text-text/60 border border-border',
  TODO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  IN_PROGRESS: 'bg-primary/15 text-primary',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full pb-10">
      <section class="flex justify-between items-center rounded-xl border border-border bg-card p-5">
        <div>
          <h1 class="text-2xl font-bold text-text flex items-center gap-3">
            {{ t('backlog.title') }}
            <span v-if="agileStore.isLoading" class="text-sm font-normal text-text/50 flex items-center gap-1.5 break-normal">
              <i class="pi pi-spinner animate-spin"></i> Syncing...
            </span>
            <span v-else-if="agileStore.error" class="text-sm font-normal text-red-500">
              Error loading data
            </span>
          </h1>
          <p class="mt-1 text-sm text-text/70">
            {{ t('backlog.description') }} (View & Manage Stories)
          </p>
        </div>
        <button 
          @click="agileStore.forceRefresh()" 
          class="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text/70 hover:bg-card hover:text-text transition h-10 cursor-pointer"
          title="Force sync data"
        >
          <i class="pi pi-sync" :class="{ 'animate-spin': agileStore.isLoading }"></i>
          <span class="hidden sm:inline">Sync</span>
        </button>
      </section>

      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 max-w-4xl">
          <input
            v-model="search"
            type="text"
            placeholder="Search stories..."
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
          />
          <BaseSelectField v-model="statusFilter" :options="statusOptions" />
          <BaseSelectField v-model="priorityFilter" :options="priorityOptions" />
          <BaseSelectField v-model="assigneeFilter" :options="[{ label: 'All Assignees', value: 'ALL' }, ...teamMembers]" />
        </div>
        <button
          @click="openModal()"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition shadow-sm h-10 shrink-0 cursor-pointer"
        >
          Add Story
        </button>
      </div>

      <section class="rounded-xl border border-border bg-card overflow-hidden">
        <BaseDataTable
          :columns="columns"
          :rows="filteredItems"
          :paginate="true"
          :page-size="15"
          empty-text="No stories found in backlog/sprints."
        >
          <template #cell-type="{ row }">
            <svg class="w-5 h-5 flex-shrink-0" :class="typeColors[(row as any).type as keyof typeof typeColors]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="typeIcons[(row as any).type as keyof typeof typeIcons]" />
            </svg>
          </template>

          <template #cell-sprint="{ row }">
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
              :class="getSprintBadgeFormat((row as any).sprintId).colors"
            >
              {{ getSprintBadgeFormat((row as any).sprintId).label }}
            </span>
          </template>

          <template #cell-assignee="{ value }">
            <div class="flex items-center gap-2">
              <div v-if="value" class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30 shrink-0">
                {{ (value as string).split(' ').map(n => n[0]).join('') }}
              </div>
              <span v-if="value" class="text-sm truncate max-w-[100px]">{{ value }}</span>
              <span v-else class="text-xs font-bold text-text/40 tracking-wider uppercase">Unassigned</span>
            </div>
          </template>

          <template #cell-priority="{ row }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[10px]" :class="priorityColors[(row as any).priority as keyof typeof priorityColors]">
              {{ (row as any).priority }}
            </span>
          </template>

          <template #cell-status="{ row }">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap" :class="statusColors[(row as any).status as keyof typeof statusColors]">
              {{ ((row as any).status as string).replace('_', ' ') }}
            </span>
          </template>

          <template #cell-estimation="{ value }">
            <span v-if="value" class="text-sm font-bold opacity-80 rounded bg-background px-1.5 py-0.5 border border-border">{{ value }}</span>
            <span v-else class="opacity-30">—</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-2 pr-1">
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

      <!-- Add/Edit Story Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-xl font-bold bg-gradient-to-r from-text to-text/60 bg-clip-text text-transparent">
              {{ isEditing ? 'Refine Story' : 'Draft New Story' }}
            </h3>
            <button @click="closeModal" class="text-text/50 hover:text-text transition cursor-pointer p-1">
               <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="saveItem" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Story Title</label>
              <input v-model="formItem.title" type="text" required placeholder="As a user, I want..." class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 font-medium" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Type</label>
                <BaseSelectField v-model="formItem.type!" :options="[
                  { label: 'User Story', value: 'STORY' },
                  { label: 'Bug', value: 'BUG' },
                ]" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Priority</label>
                <BaseSelectField v-model="formItem.priority!" :options="[
                  { label: 'Low', value: 'LOW' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'High', value: 'HIGH' },
                  { label: 'Critical', value: 'CRITICAL' },
                ]" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 border-y border-border/50 py-4 my-2">
               <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Sprint Assignment</label>
                <BaseSelectField v-model="(formItem as any).sprintIdStr" :options="sprintOptions" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Story Points</label>
                <input v-model.number="formItem.estimation" type="number" min="0" placeholder="e.g. 5" class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
               <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Overall Status</label>
                <BaseSelectField v-model="formItem.status!" :options="[
                  { label: 'Backlog', value: 'BACKLOG' },
                  { label: 'To Do', value: 'TODO' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Done', value: 'DONE' },
                ]" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-text/50">Owner</label>
                <BaseSelectField v-model="formItem.assignee!" :options="teamMembers" />
              </div>
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition cursor-pointer">Discard</button>
              <button type="submit" :disabled="isSubmitting" class="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50 cursor-pointer">
                {{ isSubmitting ? 'Syncing...' : (isEditing ? 'Commit Changes' : 'Draft Story') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <BaseConfirmDialog
        :show="isConfirmDeleteOpen"
        title="Destroy Story"
        :message="`Are you sure you want to annihilate '${itemToDelete?.title}'? This action cannot be undone and will erase all associated tasks.`"
        confirm-text="Erase Forever"
        variant="danger"
        @confirm="deleteItem"
        @cancel="isConfirmDeleteOpen = false"
      />
    </div>
  </DashboardLayout>
</template>
