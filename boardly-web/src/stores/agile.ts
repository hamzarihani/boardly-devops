import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/lib/api'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type WorkflowStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  storyId: string
  title: string
  status: WorkflowStatus
  assignee: string | null
  storyTitle?: string
}

export interface Story {
  id: string
  sprintId: string | null
  title: string
  priority: Priority
  status: 'BACKLOG' | WorkflowStatus
  estimation: number | null
  assignee: string | null
  dueDate: string | null
  type: 'STORY' | 'BUG' // Keep bug for varied backlog
}

export interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED'
}

export const useAgileStore = defineStore('agile', () => {
  const sprints = ref<Sprint[]>([])
  const stories = ref<Story[]>([])
  const tasks = ref<Task[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Record<string, number | null>>({
    sprints: null,
    stories: null,
    tasks: null,
    tasks_detailed: null
  })

  // --- GETTERS ---
  const backlogItems = computed(() => stories.value.filter((s) => !s.sprintId || s.status === 'BACKLOG'))
  const activeSprint = computed(() => sprints.value.find((s) => s.status === 'ACTIVE'))
  const plannedSprints = computed(() => sprints.value.filter((s) => s.status === 'PLANNED'))
  
  const getStoriesForSprint = (sprintId: string) => computed(() => stories.value.filter((s) => s.sprintId === sprintId))
  const getTasksForStory = (storyId: string) => computed(() => tasks.value.filter((t) => t.storyId === storyId))
  
  const getTasksForSprint = (sprintId: string) => computed(() => {
    const sprintStoryIds = stories.value.filter((s) => s.sprintId === sprintId).map(s => s.id)
    return tasks.value.filter((t) => sprintStoryIds.includes(t.storyId))
  })

  const activeSprintTasks = computed(() => {
    if (!activeSprint.value) return []
    return getTasksForSprint(activeSprint.value.id).value
  })

  const getSprintProgress = (sprintId: string) => computed(() => {
    const sprintTasks = getTasksForSprint(sprintId).value
    if (sprintTasks.length === 0) return 0
    const done = sprintTasks.filter((t: any) => t.status === 'DONE').length
    const inProgress = sprintTasks.filter((t: any) => t.status === 'IN_PROGRESS').length
    return Math.round(((done + inProgress * 0.5) / sprintTasks.length) * 100)
  })

  // --- API FETCH ---
  const isCacheValid = (key: string) => {
    const entry = (lastFetched.value as any)[key]
    return entry && (Date.now() - entry < 60000)
  }

  async function fetchSprints(force = false) {
    if (!force && isCacheValid('sprints')) return
    isLoading.value = true
    try {
      const data = await apiFetch('/agile/sprints')
      sprints.value = (data || []).map((s: any) => ({ ...s, startDate: s.start_date, endDate: s.end_date }))
      lastFetched.value.sprints = Date.now()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch sprints'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStories(force = false) {
    if (!force && isCacheValid('stories')) return
    isLoading.value = true
    try {
      const data = await apiFetch('/agile/stories')
      stories.value = (data || []).map((s: any) => ({ ...s, sprintId: s.sprint_id, dueDate: s.due_date }))
      lastFetched.value.stories = Date.now()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch stories'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTasks(force = false, detailed = false) {
    const cacheKey = detailed ? 'tasks_detailed' : 'tasks'
    if (!force && isCacheValid(cacheKey)) return
    
    isLoading.value = true
    try {
      const endpoint = detailed ? '/agile/tasks-detailed' : '/agile/tasks'
      const data = await apiFetch(endpoint)
      tasks.value = (data || []).map((t: any) => ({ 
        ...t, 
        storyId: t.story_id,
        storyTitle: t.storyTitle // This comes from joined query
      }))
      ;(lastFetched.value as any)[cacheKey] = Date.now()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch tasks'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchData(force = false) {
    await Promise.all([
      fetchSprints(force),
      fetchStories(force),
      fetchTasks(force)
    ])
  }

  async function forceRefresh() {
    await fetchData(true)
  }

  function forceRefreshEntity(key: string) {
    if (key === 'sprints') return fetchSprints(true)
    if (key === 'stories') return fetchStories(true)
    if (key === 'tasks') return fetchTasks(true)
  }

  // --- ACTIONS ---
  async function addSprint(sprint: Omit<Sprint, 'id'>) {
    const payload = { ...sprint, start_date: sprint.startDate, end_date: sprint.endDate }
    delete (payload as any).startDate
    delete (payload as any).endDate
    const added = await apiFetch('/agile/sprints', { method: 'POST', body: JSON.stringify(payload) })
    sprints.value.unshift({ ...added, startDate: added.start_date, endDate: added.end_date })
  }

  async function updateSprint(id: string, updates: Partial<Sprint>) {
    const payload: any = { ...updates }
    if (payload.startDate) { payload.start_date = payload.startDate; delete payload.startDate }
    if (payload.endDate) { payload.end_date = payload.endDate; delete payload.endDate }
    
    const up = await apiFetch(`/agile/sprints/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
    const index = sprints.value.findIndex(s => s.id === id)
    if (index !== -1) {
      sprints.value[index] = { ...sprints.value[index], ...up, startDate: up.start_date, endDate: up.end_date }
    }
  }

  async function deleteSprint(id: string) {
    await apiFetch(`/agile/sprints/${id}`, { method: 'DELETE' })
    sprints.value = sprints.value.filter(s => s.id !== id)
  }

  async function startSprint(id: string) {
    // Optional: Complete current active sprint before starting new one
    if (activeSprint.value) {
      await updateSprint(activeSprint.value.id, { status: 'COMPLETED' })
    }
    await updateSprint(id, { status: 'ACTIVE' })
  }

  async function completeSprint(id: string) {
    await updateSprint(id, { status: 'COMPLETED' })
  }

  async function addStory(story: Omit<Story, 'id'>) {
    const payload = { ...story, sprint_id: story.sprintId, due_date: story.dueDate }
    delete (payload as any).sprintId
    delete (payload as any).dueDate
    const added = await apiFetch('/agile/stories', { method: 'POST', body: JSON.stringify(payload) })
    stories.value.unshift({ ...added, sprintId: added.sprint_id, dueDate: added.due_date })
  }

  async function updateStory(id: string, updates: Partial<Story>) {
    const payload: any = { ...updates }
    if (payload.hasOwnProperty('sprintId')) { payload.sprint_id = payload.sprintId; delete payload.sprintId }
    if (payload.hasOwnProperty('dueDate')) { payload.due_date = payload.dueDate; delete payload.dueDate }
    
    const up = await apiFetch(`/agile/stories/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
    const index = stories.value.findIndex(s => s.id === id)
    if (index !== -1) {
      stories.value[index] = { ...stories.value[index], ...up, sprintId: up.sprint_id, dueDate: up.due_date }
    }
  }

  async function deleteStory(id: string) {
    await apiFetch(`/agile/stories/${id}`, { method: 'DELETE' })
    stories.value = stories.value.filter(s => s.id !== id)
    tasks.value = tasks.value.filter(t => t.storyId !== id)
  }

  async function addTask(task: Omit<Task, 'id'>) {
    const payload = { ...task, story_id: task.storyId }
    delete (payload as any).storyId
    const added = await apiFetch('/agile/tasks', { method: 'POST', body: JSON.stringify(payload) })
    tasks.value.push({ ...added, storyId: added.story_id })
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const payload: any = { ...updates }
    if (payload.hasOwnProperty('storyId')) { payload.story_id = payload.storyId; delete payload.storyId }
    
    const up = await apiFetch(`/agile/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...up, storyId: up.story_id }
    }
  }

  async function deleteTask(id: string) {
    await apiFetch(`/agile/tasks/${id}`, { method: 'DELETE' })
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  return {
    sprints,
    stories,
    tasks,
    isLoading,
    error,
    lastFetched,
    backlogItems,
    activeSprint,
    plannedSprints,
    activeSprintTasks,
    fetchData,
    forceRefresh,
    fetchSprints,
    fetchStories,
    fetchTasks,
    forceRefreshEntity,
    getStoriesForSprint,
    getTasksForStory,
    getTasksForSprint,
    getSprintProgress,
    addSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    addStory,
    updateStory,
    deleteStory,
    addTask,
    updateTask,
    deleteTask,
  }
})
