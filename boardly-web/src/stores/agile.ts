import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type WorkflowStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  storyId: string
  title: string
  status: WorkflowStatus
  assignee: string | null
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
  // --- MOCK DATA ---
  const sprints = ref<Sprint[]>([
    { id: 's5', name: 'Sprint 5: Core Authentication', startDate: '2026-02-23', endDate: '2026-03-08', status: 'ACTIVE' },
    { id: 's6', name: 'Sprint 6: User Profiles & Settings', startDate: '2026-03-09', endDate: '2026-03-22', status: 'PLANNED' },
  ])

  const stories = ref<Story[]>([
    { id: 'st1', sprintId: 's5', title: 'Implement user authentication flow', type: 'STORY', priority: 'HIGH', status: 'IN_PROGRESS', estimation: 5, assignee: 'Hamza R.', dueDate: '2026-03-05' },
    { id: 'st2', sprintId: null, title: 'Fix sidebar navigation bug on mobile', type: 'BUG', priority: 'MEDIUM', status: 'BACKLOG', estimation: 2, assignee: 'Jane D.', dueDate: '2026-02-28' },
    { id: 'st3', sprintId: 's5', title: 'Design login UI components', type: 'STORY', priority: 'MEDIUM', status: 'DONE', estimation: 3, assignee: 'Alex K.', dueDate: null },
    { id: 'st4', sprintId: null, title: 'Refactor database schema for scalability', type: 'STORY', priority: 'CRITICAL', status: 'BACKLOG', estimation: 8, assignee: 'Alex K.', dueDate: '2026-04-10' },
    { id: 'st5', sprintId: 's6', title: 'Add social login providers', type: 'STORY', priority: 'MEDIUM', status: 'TODO', estimation: 5, assignee: 'Hamza R.', dueDate: '2026-03-15' },
  ])

  const tasks = ref<Task[]>([
    { id: 't1', storyId: 'st1', title: 'Implement JWT validation', status: 'DONE', assignee: 'Hamza R.' },
    { id: 't2', storyId: 'st1', title: 'Setup refresh token rotation', status: 'IN_PROGRESS', assignee: 'Jane D.' },
    { id: 't3', storyId: 'st3', title: 'Create Figma prototypes', status: 'DONE', assignee: 'Alex K.' },
    { id: 't4', storyId: 'st3', title: 'Translate components to Vue', status: 'DONE', assignee: 'Alex K.' },
    { id: 't5', storyId: 'st1', title: 'Write unit tests for auth module', status: 'IN_PROGRESS', assignee: 'Hamza R.' },
    { id: 't6', storyId: 'st5', title: 'Register Google OAuth app', status: 'TODO', assignee: 'Hamza R.' },
  ])

  // --- GETTERS ---
  const backlogItems = computed(() => stories.value.filter((s) => !s.sprintId || s.status === 'BACKLOG'))
  const activeSprint = computed(() => sprints.value.find((s) => s.status === 'ACTIVE'))
  const plannedSprints = computed(() => sprints.value.filter((s) => s.status === 'PLANNED'))
  
  // Gets all stories associated with a given sprint
  const getStoriesForSprint = (sprintId: string) => computed(() => stories.value.filter((s) => s.sprintId === sprintId))
  
  // Gets all tasks associated with a given story
  const getTasksForStory = (storyId: string) => computed(() => tasks.value.filter((t) => t.storyId === storyId))

  // Gets all tasks inside a sprint (by gathering tasks from all stories in that sprint)
  const getTasksForSprint = (sprintId: string) => computed(() => {
    const sprintStoryIds = stories.value.filter((s) => s.sprintId === sprintId).map(s => s.id)
    return tasks.value.filter((t) => sprintStoryIds.includes(t.storyId))
  })

  // Kanban Board Tasks (usually just active sprint)
  const activeSprintTasks = computed(() => {
    if (!activeSprint.value) return []
    return getTasksForSprint(activeSprint.value.id).value
  })

  // Calculate sprint progress based on task completion
  const getSprintProgress = (sprintId: string) => computed(() => {
    const sprintTasks = getTasksForSprint(sprintId).value
    if (sprintTasks.length === 0) return 0
    const done = sprintTasks.filter((t) => t.status === 'DONE').length
    const inProgress = sprintTasks.filter((t) => t.status === 'IN_PROGRESS').length
    return Math.round(((done + inProgress * 0.5) / sprintTasks.length) * 100)
  })

  // --- ACTIONS ---
  function addSprint(sprint: Omit<Sprint, 'id'>) {
    sprints.value.push({ id: Math.random().toString(36).substr(2, 9), ...sprint })
  }

  function addStory(story: Omit<Story, 'id'>) {
    stories.value.unshift({ id: Math.random().toString(36).substr(2, 9), ...story })
  }

  function updateStory(id: string, updates: Partial<Story>) {
    const index = stories.value.findIndex(s => s.id === id)
    if (index !== -1) {
      stories.value[index] = { ...stories.value[index], ...updates } as Story
    }
  }

  function deleteStory(id: string) {
    stories.value = stories.value.filter(s => s.id !== id)
    // Cascade delete tasks
    tasks.value = tasks.value.filter(t => t.storyId !== id)
  }

  function addTask(task: Omit<Task, 'id'>) {
    tasks.value.push({ id: Math.random().toString(36).substr(2, 9), ...task })
  }

  function updateTask(id: string, updates: Partial<Task>) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates } as Task
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  return {
    sprints,
    stories,
    tasks,
    backlogItems,
    activeSprint,
    plannedSprints,
    activeSprintTasks,
    getStoriesForSprint,
    getTasksForStory,
    getTasksForSprint,
    getSprintProgress,
    addSprint,
    addStory,
    updateStory,
    deleteStory,
    addTask,
    updateTask,
    deleteTask,
  }
})
