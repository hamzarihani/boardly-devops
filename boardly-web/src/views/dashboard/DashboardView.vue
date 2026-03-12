<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import DashboardLayout from "@/layouts/DashboardLayout.vue"
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import { useAgileStore } from '@/stores/agile'
import { useTeamStore } from '@/stores/team'

const { t } = useI18n()
const router = useRouter()
const agileStore = useAgileStore()
const teamStore = useTeamStore()

const showDummyVelocity = ref(true)
const dummyVelocityData = [
  { name: 'Sprint 1', points: 42 },
  { name: 'Sprint 2', points: 58 },
  { name: 'Sprint 3', points: 45 },
  { name: 'Sprint 4', points: 65 },
  { name: 'Sprint 5', points: 52 },
  { name: 'Sprint 6', points: 78 }
]

onMounted(async () => {
  await Promise.all([
    agileStore.fetchData(),
    teamStore.fetchMembers()
  ])
})

const kpis = computed(() => {
  const activeSprintsCount = agileStore.sprints.filter(s => s.status === 'ACTIVE').length
  const tasksInProgressCount = agileStore.tasks.filter(t => t.status === 'IN_PROGRESS').length
  
  // Simple completion rate based on all tasks in active/completed sprints
  const relevantTasks = agileStore.tasks
  const completedTasks = relevantTasks.filter(t => t.status === 'DONE').length
  const completionRate = relevantTasks.length > 0 
    ? Math.round((completedTasks / relevantTasks.length) * 100) 
    : 0

  return [
    {
      id: 'sprints',
      titleKey: 'dashboard.activeSprints',
      value: activeSprintsCount.toString(),
      trend: activeSprintsCount > 0 ? '+1 Local' : 'No active',
      isPositive: activeSprintsCount > 0,
      icon: 'pi pi-refresh',
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      id: 'tasks',
      titleKey: 'dashboard.tasksInProgress',
      value: tasksInProgressCount.toString(),
      trend: 'Live updates',
      isPositive: true,
      icon: 'pi pi-list',
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'completion',
      titleKey: 'dashboard.completionRate',
      value: `${completionRate}%`,
      trend: 'Total progress',
      isPositive: completionRate > 50,
      icon: 'pi pi-check-circle',
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ]
})

const tasksByStatus = computed(() => {
  const todo = agileStore.tasks.filter(t => t.status === 'TODO').length
  const inProgress = agileStore.tasks.filter(t => t.status === 'IN_PROGRESS').length
  const done = agileStore.tasks.filter(t => t.status === 'DONE').length
  const total = agileStore.tasks.length || 1

  return [
    { label: 'To Do', count: todo, height: (todo / total) * 120, color: 'bg-slate-400' },
    { label: 'In Prog', count: inProgress, height: (inProgress / total) * 120, color: 'bg-amber-500' },
    { label: 'Done', count: done, height: (done / total) * 120, color: 'bg-emerald-500' }
  ]
})

const workloadData = computed(() => {
  const defaultVal = { high: 0, medium: 0, low: 0, top: 0, topLabel: 'High' }
  if (agileStore.tasks.length === 0) return defaultVal
  
  const high = agileStore.tasks.filter(t => {
    const story = agileStore.stories.find(s => s.id === t.storyId)
    return story?.priority === 'HIGH' || story?.priority === 'CRITICAL'
  }).length
  const medium = agileStore.tasks.filter(t => {
    const story = agileStore.stories.find(s => s.id === t.storyId)
    return story?.priority === 'MEDIUM'
  }).length
  const low = agileStore.tasks.filter(t => {
    const story = agileStore.stories.find(s => s.id === t.storyId)
    return story?.priority === 'LOW'
  }).length
  
  const total = agileStore.tasks.length
  return {
    high: Math.round((high / total) * 100),
    medium: Math.round((medium / total) * 100),
    low: Math.round((low / total) * 100),
    top: Math.round((high / total) * 100),
    topLabel: 'High'
  }
})



const velocityData = computed(() => {
  if (showDummyVelocity.value) return dummyVelocityData

  const completedSprints = agileStore.sprints
    .filter(s => s.status === 'COMPLETED')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(-6)

  return completedSprints.map(sprint => {
    const sprintStories = agileStore.stories.filter(s => s.sprintId === sprint.id)
    const points = sprintStories
      .filter(s => s.status === 'DONE')
      .reduce((sum, s) => sum + (s.estimation || 0), 0)
    return { name: sprint.name, points }
  })
})

const velocityChartPoints = computed(() => {
  if (velocityData.value.length === 0) return [80, 80, 80, 80, 80, 80]
  const max = Math.max(...velocityData.value.map(d => d.points), 10)
  return velocityData.value.map(d => 100 - (d.points / max) * 80)
})

const velocityChartPath = computed(() => {
  const points = velocityChartPoints.value
  if (points.length === 0) return ''
  let d = `M0,${points[0]}`
  const step = 400 / Math.max(points.length - 1, 1)
  for (let i = 1; i < points.length; i++) {
    const x = i * step
    const prevX = (i - 1) * step
    const cpX = (prevX + x) / 2
    d += ` C${cpX},${points[i-1]} ${cpX},${points[i]} ${x},${points[i]}`
  }
  return d
})

const teamWorkload = computed(() => {
  return teamStore.members.map(member => {
    const memberTasks = agileStore.tasks.filter(t => t.assignee === member.email && t.status !== 'DONE')
    return {
      name: member.full_name || member.email.split('@')[0],
      count: memberTasks.length,
      avatar: (member.full_name?.[0] || member.email?.[0] || 'U').toUpperCase()
    }
  }).sort((a, b) => b.count - a.count).slice(0, 5)
})

const activeSprintHealth = computed(() => {
  const sprint = agileStore.activeSprint
  if (!sprint) return null

  const start = new Date(sprint.startDate).getTime()
  const end = new Date(sprint.endDate).getTime()
  const now = Date.now()
  
  const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24))
  const timeProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100))

  const sprintStories = agileStore.stories.filter(s => s.sprintId === sprint.id)
  const totalPoints = sprintStories.reduce((sum, s) => sum + (s.estimation || 0), 0)
  const donePoints = sprintStories.filter(s => s.status === 'DONE').reduce((sum, s) => sum + (s.estimation || 0), 0)
  const pointsProgress = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0

  return {
    name: sprint.name,
    timeProgress,
    pointsProgress,
    daysRemaining: Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24))),
    isOnTrack: pointsProgress >= timeProgress
  }
})

const recentActivity = computed(() => {
  // Sort tasks by some ID or timestamp if available, for now just taking last 4
  return agileStore.tasks.slice(-4).map((task, index) => {
    const story = agileStore.stories.find(s => s.id === task.storyId)
    return {
      id: task.id,
      user: task.assignee || 'Unassigned',
      avatar: (task.assignee?.[0] || 'U').toUpperCase(),
      actionKey: task.status === 'DONE' ? 'dashboard.activity.completed' : 'dashboard.activity.created',
      target: `${story?.title || 'Task'} - ${task.title}`,
      time: 'Recently',
      type: task.status === 'DONE' ? 'complete' : 'create'
    }
  }).reverse()
})

const iconMap: Record<string, string> = {
  complete: 'pi pi-check text-emerald-500',
  create: 'pi pi-plus text-blue-500',
  comment: 'pi pi-comment text-amber-500',
  join: 'pi pi-user-plus text-purple-500'
}

function go(routeEntry: string) {
  router.push({ name: routeEntry })
}
</script>

<template>
  <DashboardLayout>
    <div class="h-full flex flex-col gap-6 pb-10 overflow-y-auto custom-scrollbar pr-2">
      <!-- Header -->
      <!-- <section class="shrink-0">
        <h1 class="text-3xl font-black text-text">{{ t('nav.dashboard') }}</h1>
        <p class="text-text/60 mt-1 font-medium">{{ t('dashboard.welcome') }}</p>
      </section> -->

      <!-- KPI Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div 
          v-for="(kpi, index) in kpis" 
          :key="kpi.id" 
          class="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group animate-fade-in-up"
          :style="{ animationDelay: `${index * 150}ms` }"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-text/70 uppercase tracking-widest">{{ t(kpi.titleKey as any) }}</h3>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" :class="kpi.color">
              <i :class="kpi.icon" class="text-lg"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-text tracking-tight">{{ kpi.value }}</span>
          </div>
          <div class="mt-3 flex items-center gap-1.5 text-xs font-bold" :class="kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'">
            <i class="pi" :class="kpi.isPositive ? 'pi-arrow-up-right' : 'pi-arrow-down-right'"></i>
            <span>{{ kpi.trend }}</span>
          </div>
        </div>
      </section>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Charts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sprint Velocity (Full Width in this column) -->
            <div class="md:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
              <div class="flex items-center justify-between mb-6">
                <div class="flex flex-col">
                  <h2 class="text-lg font-bold text-text">Sprint Velocity</h2>
                  <span class="text-xs font-medium text-text/40">Story points completed per sprint</span>
                </div>
                <button class="p-2 hover:bg-background rounded-lg text-text/50 cursor-pointer transition">
                  <i class="pi pi-ellipsis-v"></i>
                </button>
              </div>
              <div class="flex items-center gap-2 mb-6 px-1">
                <button 
                  @click="showDummyVelocity = false"
                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-all cursor-pointer"
                  :class="!showDummyVelocity ? 'bg-primary text-white shadow-sm' : 'bg-background text-text/40 hover:text-text/60'"
                >
                  Live
                </button>
                <button 
                  @click="showDummyVelocity = true"
                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-all cursor-pointer"
                  :class="showDummyVelocity ? 'bg-indigo-500 text-white shadow-sm' : 'bg-background text-text/40 hover:text-text/60'"
                >
                  Demo
                </button>
                <div class="ml-auto flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full" :class="showDummyVelocity ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400 animate-pulse'"></div>
                  <span class="text-[9px] font-bold text-text/30 uppercase tracking-tighter">
                    {{ showDummyVelocity ? 'Previewing Mock Data' : 'Real-time Analytics' }}
                  </span>
                </div>
              </div>
              <div class="w-full rounded-xl bg-background/50 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden group mb-4 animate-fade-in-up" style="animation-delay: 300ms">
                <div class="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.03]">
                  <div v-for="i in 24" :key="i" class="border border-text"></div>
                </div>
                <svg class="w-full h-48 px-10 relative z-10 opacity-70 group-hover:opacity-100 transition duration-500" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <!-- Grid Lines -->
                  <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" stroke-width="0.5" class="text-border" stroke-dasharray="4" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" stroke-width="0.5" class="text-border" stroke-dasharray="4" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="currentColor" stroke-width="0.5" class="text-border" stroke-dasharray="4" />
                  
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="rgb(var(--color-primary))" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="rgb(var(--color-primary))" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <path v-if="velocityChartPath" class="text-primary fill-current transition-all duration-1000 delay-100" style="fill: url(#velocityGradient);" 
                    :d="`${velocityChartPath} L400,100 L0,100 Z`" />
                  <path v-if="velocityChartPath" class="text-primary stroke-current fill-none transition-all duration-1000 delay-100" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                    :d="velocityChartPath" />
                  <circle 
                    v-for="(point, i) in velocityChartPoints" 
                    :key="i"
                    :cx="i * (400 / Math.max(velocityChartPoints.length - 1, 1))" 
                    :cy="point" 
                    r="4" 
                    class="fill-card stroke-primary transition-all duration-500" 
                    stroke-width="2" 
                  />
                </svg>
                <div class="absolute bottom-2 left-10 right-10 flex justify-between">
                  <span v-for="data in velocityData" :key="data.name" class="text-[8px] font-bold text-text/30 uppercase tracking-tighter">
                    {{ data.name }}
                  </span>
                  <span v-if="velocityData.length === 0" class="text-[10px] text-text/40">No sprint data available</span>
                </div>
              </div>
            </div>

            <!-- 1. Tasks by Status -->
            <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col h-full animate-fade-in-up" style="animation-delay: 450ms">
              <h2 class="text-lg font-bold text-text mb-6">{{ t('dashboard.tasksByStatus') }}</h2>
              <div class="flex-1 flex items-end justify-between px-4 pb-2 relative min-h-[140px]">
                <div class="w-full absolute bottom-4 border-b border-border/80"></div>
                <div v-for="bar in tasksByStatus" :key="bar.label" class="flex flex-col items-center gap-2 z-10 w-1/4 group cursor-pointer">
                  <div 
                    class="w-full max-w-[32px] rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out hover:scale-x-110 origin-bottom"
                    :class="bar.color"
                    :style="{ height: `${bar.height}px` }"
                  ></div>
                  <span class="text-[10px] font-bold text-text/60 whitespace-nowrap">{{ bar.label }}</span>
                </div>
              </div>
            </div>

            <!-- 2. Workload Donut (Priority) -->
            <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center animate-fade-in-up" style="animation-delay: 600ms">
              <h2 class="text-lg font-bold text-text mb-6 self-start w-full">{{ t('dashboard.workload') }}</h2>
              <div class="relative w-32 h-32 flex items-center justify-center group cursor-pointer">
                <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgb(var(--color-primary))" stroke-width="12" 
                    :stroke-dasharray="251.2" 
                    :stroke-dashoffset="251.2 - (2.512 * workloadData.high)" 
                    class="transition-all duration-1000 opacity-90 group-hover:opacity-100" />
                  <circle cx="50" cy="50" r="40" fill="transparent" class="stroke-emerald-500 transition-all duration-1000 opacity-90 group-hover:opacity-100" stroke-width="12" 
                    :stroke-dasharray="251.2" 
                    :stroke-dashoffset="251.2 - (2.512 * workloadData.medium)" 
                    :style="{ transform: `rotate(${(workloadData.high * 360) / 100}deg)`, transformOrigin: 'center' }" />
                  <circle cx="50" cy="50" r="40" fill="transparent" class="stroke-amber-500 transition-all duration-1000 opacity-90 group-hover:opacity-100" stroke-width="12" 
                    :stroke-dasharray="251.2" 
                    :stroke-dashoffset="251.2 - (2.512 * workloadData.low)" 
                    :style="{ transform: `rotate(${((workloadData.high + workloadData.medium) * 360) / 100}deg)`, transformOrigin: 'center' }" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span class="text-2xl font-black text-text">{{ workloadData.top }}%</span>
                  <span class="text-[9px] font-bold text-text/50 uppercase tracking-widest">{{ workloadData.topLabel }}</span>
                </div>
              </div>
              <div class="flex gap-4 mt-6 text-[10px] font-bold text-text/60">
                 <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-primary/80"></div>High</div>
                 <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Med</div>
                 <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Low</div>
              </div>
            </div>

            <!-- 3. Active Sprint Progress -->
            <div v-if="activeSprintHealth" class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col animate-fade-in-up" style="animation-delay: 700ms">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-text">Active Sprint</h2>
                <div class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tighter ring-1 ring-emerald-500/20">
                  {{ activeSprintHealth.isOnTrack ? 'On Track' : 'Delayed' }}
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-bold text-text/60 uppercase tracking-widest">
                    <span>Time Elapsed</span>
                    <span>{{ activeSprintHealth.timeProgress }}%</span>
                  </div>
                  <div class="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div class="h-full bg-text transition-all duration-1000" :style="{ width: `${activeSprintHealth.timeProgress}%` }"></div>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-bold text-text/60 uppercase tracking-widest">
                    <span>Scope Completed</span>
                    <span>{{ activeSprintHealth.pointsProgress }}%</span>
                  </div>
                  <div class="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div class="h-full bg-primary transition-all duration-1000" :style="{ width: `${activeSprintHealth.pointsProgress}%` }"></div>
                  </div>
                </div>
                <div class="mt-auto pt-2 flex items-center justify-between">
                   <div class="flex flex-col">
                      <span class="text-[10px] font-bold text-text/40 uppercase tracking-widest">Remaining</span>
                      <span class="text-xl font-black text-text tracking-tighter">{{ activeSprintHealth.daysRemaining }} Days</span>
                   </div>
                   <div @click="go('sprints')" class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group cursor-pointer hover:bg-primary hover:text-white transition-all border border-primary/10">
                      <i class="pi pi-bolt text-lg group-hover:animate-pulse"></i>
                   </div>
                </div>
              </div>
            </div>
            
            <div v-else class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center animate-fade-in-up opacity-60" style="animation-delay: 700ms">
               <i class="pi pi-calendar-times text-4xl text-text/20 mb-3"></i>
               <h3 class="text-sm font-bold text-text/50 uppercase tracking-widest">No Active Sprint</h3>
               <button @click="go('sprints')" class="mt-4 text-xs font-black text-primary hover:underline cursor-pointer uppercase tracking-widest">Start a Sprint</button>
            </div>

            <!-- 4. Team Workload -->
            <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col animate-fade-in-up" style="animation-delay: 850ms">
              <h2 class="text-lg font-bold text-text mb-6">Team Workload</h2>
              <div class="flex flex-col gap-4">
                 <div v-for="member in teamWorkload" :key="member.name" class="flex flex-col gap-1.5 group cursor-pointer">
                    <div class="flex items-center justify-between text-[10px] font-bold text-text/60">
                       <div class="flex items-center gap-2">
                          <div class="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary border border-primary/20">
                            {{ member.avatar }}
                          </div>
                          <span class="group-hover:text-primary transition-colors">{{ member.name }}</span>
                       </div>
                       <span>{{ member.count }} tasks</span>
                    </div>
                    <div class="h-1.5 w-full bg-background rounded-full overflow-hidden">
                       <div class="h-full bg-primary/40 group-hover:bg-primary transition-all duration-1000 origin-left" :style="{ width: `${Math.min(100, (member.count / 10) * 100)}%` }"></div>
                    </div>
                 </div>
                 <div v-if="teamWorkload.length === 0" class="text-center py-4 text-xs font-bold text-text/30 uppercase tracking-widest">No team members</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Quick Actions & Activity -->
        <div class="flex flex-col gap-6">
          <!-- Quick Actions -->
          <div class="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-4">{{ t('dashboard.quickActions') }}</h2>
            <div class="grid grid-cols-2 gap-3">
               <button @click="go('boards')" class="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all group">
                 <i class="pi pi-plus-circle text-2xl mb-2 text-text/40 group-hover:text-primary transition-colors"></i>
                 <span class="text-xs font-bold">{{ t('dashboard.createTask') }}</span>
               </button>
               <button @click="go('sprints')" class="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all group">
                 <i class="pi pi-bolt text-2xl mb-2 text-text/40 group-hover:text-primary transition-colors"></i>
                 <span class="text-xs font-bold">{{ t('dashboard.newSprint') }}</span>
               </button>
               <button @click="go('team-members')" class="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white hover:bg-primary/90 cursor-pointer transition-all font-bold text-sm shadow-md">
                 <i class="pi pi-user-plus"></i>
                 <span>{{ t('dashboard.inviteMember') }}</span>
               </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex-1 flex flex-col animate-fade-in-up" style="animation-delay: 750ms">
            <h2 class="text-lg font-bold text-text mb-4">{{ t('dashboard.recentActivity') }}</h2>
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <TransitionGroup name="list" tag="div" class="space-y-5">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex gap-3 group">
                  <!-- Avatar / Line -->
                  <div class="relative flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center font-bold text-xs z-10 group-hover:ring-2 ring-primary/30 transition-all">
                      {{ activity.avatar }}
                    </div>
                    <!-- Timeline line connecting items -->
                    <div class="w-px h-full bg-border absolute top-8 bottom-[-20px] group-last:hidden"></div>
                  </div>
                  <!-- Content -->
                  <div class="pt-1.5 flex-1 min-w-0">
                    <p class="text-sm text-text leading-tight">
                      <span class="font-bold cursor-pointer hover:text-primary transition-colors">{{ activity.user }}</span> 
                      <span class="text-text/60"> {{ t(activity.actionKey as any) }} </span> 
                      <span class="font-semibold">{{ activity.target }}</span>
                    </p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <i :class="iconMap[activity.type]" class="text-[10px]"></i>
                      <span class="text-[10px] font-bold text-text/40 uppercase tracking-wider">{{ activity.time }}</span>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--color-text), 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-text), 0.2);
}
</style>
