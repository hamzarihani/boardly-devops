<script setup lang="ts">
import DashboardLayout from "@/layouts/DashboardLayout.vue"
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const kpis = [
  {
    id: 'sprints',
    titleKey: 'dashboard.activeSprints',
    value: '3',
    trend: '+1 This week',
    isPositive: true,
    icon: 'pi pi-refresh',
    color: 'text-indigo-500 bg-indigo-500/10'
  },
  {
    id: 'tasks',
    titleKey: 'dashboard.tasksInProgress',
    value: '24',
    trend: '-5 Since yesterday',
    isPositive: true,
    icon: 'pi pi-list',
    color: 'text-amber-500 bg-amber-500/10'
  },
  {
    id: 'completion',
    titleKey: 'dashboard.completionRate',
    value: '87%',
    trend: '+2.4% This month',
    isPositive: true,
    icon: 'pi pi-check-circle',
    color: 'text-emerald-500 bg-emerald-500/10'
  }
]

const recentActivity = [
  { id: 1, user: 'Alex K.', avatar: 'A', actionKey: 'dashboard.activity.completed', target: 'DEV-1043 - API Auth', time: '2 mins ago', type: 'complete' },
  { id: 2, user: 'Jane D.', avatar: 'J', actionKey: 'dashboard.activity.created', target: 'DEV-1055 - Sidebar Bug', time: '1 hour ago', type: 'create' },
  { id: 3, user: 'Hamza R.', avatar: 'H', actionKey: 'dashboard.activity.commented', target: 'DEV-1021 - Docker Setup', time: '3 hours ago', type: 'comment' },
  { id: 4, user: 'Sarah M.', avatar: 'S', actionKey: 'dashboard.activity.joined', target: 'Frontend Titans', time: 'Yesterday', type: 'join' }
]

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
      <section class="shrink-0">
        <h1 class="text-3xl font-black text-text">{{ t('nav.dashboard') }}</h1>
        <p class="text-text/60 mt-1 font-medium">{{ t('dashboard.welcome') }}</p>
      </section>

      <!-- KPI Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div 
          v-for="kpi in kpis" 
          :key="kpi.id" 
          class="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
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
          <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-text">Productivity Metrics</h2>
              <button class="p-2 hover:bg-background rounded-lg text-text/50 transition">
                <i class="pi pi-ellipsis-v"></i>
              </button>
            </div>
            <div class="w-full rounded-xl bg-background/50 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden group mb-2">
              <div class="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.03]">
                <div v-for="i in 24" :key="i" class="border border-text"></div>
              </div>
              <svg class="w-full h-48 px-10 relative z-10 opacity-70 group-hover:opacity-100 transition duration-500" viewBox="0 0 400 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" stroke-width="0.5" class="text-border" stroke-dasharray="4" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" stroke-width="0.5" class="text-border" stroke-dasharray="4" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="currentColor" stroke-width="0.5" class="text-border" stroke-dasharray="4" />
                <defs>
                  <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgb(var(--color-primary))" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="rgb(var(--color-primary))" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path class="text-primary fill-current transition-all duration-1000 delay-100" style="fill: url(#primaryGradient);" 
                  d="M0,80 C40,40 80,70 120,40 C160,10 200,50 240,30 C280,10 320,60 360,20 L400,10 L400,100 L0,100 Z" />
                <path class="text-primary stroke-current fill-none transition-all duration-1000 delay-100" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                  d="M0,80 C40,40 80,70 120,40 C160,10 200,50 240,30 C280,10 320,60 360,20 L400,10" />
                <circle cx="120" cy="40" r="4" class="fill-card stroke-primary" stroke-width="2" />
                <circle cx="240" cy="30" r="4" class="fill-card stroke-primary" stroke-width="2" />
                <circle cx="360" cy="20" r="4" class="fill-card stroke-primary" stroke-width="2" />
              </svg>
            </div>
          </div>

          <!-- Mini Charts Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
              <h2 class="text-lg font-bold text-text mb-6">{{ t('dashboard.tasksByStatus') }}</h2>
              <div class="flex-1 flex items-end justify-between px-4 pb-2 relative min-h-[140px]">
                <div class="w-full absolute bottom-4 border-b border-border/80"></div>
                <!-- Bars -->
                <div class="flex flex-col items-center gap-2 z-10 w-1/4 group cursor-pointer">
                  <div class="w-full max-w-[32px] bg-slate-400 rounded-t-sm h-[60px] opacity-80 group-hover:opacity-100 transition-all hover:scale-x-110"></div>
                  <span class="text-xs font-bold text-text/60">To Do</span>
                </div>
                <!-- In Progress -->
                <div class="flex flex-col items-center gap-2 z-10 w-1/4 group cursor-pointer">
                  <div class="w-full max-w-[32px] bg-amber-500 rounded-t-sm h-[110px] shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] opacity-90 group-hover:opacity-100 transition-all hover:scale-x-110"></div>
                  <span class="text-xs font-bold text-text/60">In Prog</span>
                </div>
                <!-- Done -->
                <div class="flex flex-col items-center gap-2 z-10 w-1/4 group cursor-pointer">
                  <div class="w-full max-w-[32px] bg-emerald-500 rounded-t-sm h-[85px] opacity-80 group-hover:opacity-100 transition-all hover:scale-x-110"></div>
                  <span class="text-xs font-bold text-text/60">Done</span>
                </div>
              </div>
            </div>

            <!-- Workload Donut -->
            <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
              <h2 class="text-lg font-bold text-text mb-6 self-start w-full">{{ t('dashboard.workload') }}</h2>
              <div class="relative w-36 h-36 flex items-center justify-center group cursor-pointer">
                <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="12" />
                  <!-- Frontend 60% -->
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgb(var(--color-primary))" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="100.48" class="transition-all duration-1000 opacity-90 group-hover:opacity-100 hover:stroke-width-[14px]" />
                  <!-- Backend 25% -->
                  <circle cx="50" cy="50" r="40" fill="transparent" class="stroke-emerald-500 transition-all duration-1000 opacity-90 group-hover:opacity-100 hover:stroke-width-[14px]" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="188.4" stroke-dashoffset-base="-150.72" style="transform: rotate(216deg); transform-origin: center;" />
                  <!-- DevOps 15% -->
                  <circle cx="50" cy="50" r="40" fill="transparent" class="stroke-amber-500 transition-all duration-1000 opacity-90 group-hover:opacity-100 hover:stroke-width-[14px]" stroke-width="12" stroke-dasharray="251.2" stroke-dashoffset="213.52" style="transform: rotate(306deg); transform-origin: center;" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span class="text-2xl font-black text-text">60%</span>
                  <span class="text-[9px] font-bold text-text/50 uppercase tracking-widest">FE</span>
                </div>
              </div>
              <div class="flex gap-4 mt-6 text-xs font-bold text-text/60">
                 <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-primary/80"></div>Front</div>
                 <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400"></div>Back</div>
                 <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>DevOps</div>
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
               <button @click="go('boards')" class="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                 <i class="pi pi-plus-circle text-2xl mb-2 text-text/40 group-hover:text-primary transition-colors"></i>
                 <span class="text-xs font-bold">{{ t('dashboard.createTask') }}</span>
               </button>
               <button @click="go('sprints')" class="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                 <i class="pi pi-bolt text-2xl mb-2 text-text/40 group-hover:text-primary transition-colors"></i>
                 <span class="text-xs font-bold">{{ t('dashboard.newSprint') }}</span>
               </button>
               <button @click="go('team-members')" class="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-sm shadow-md">
                 <i class="pi pi-user-plus"></i>
                 <span>{{ t('dashboard.inviteMember') }}</span>
               </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex-1 flex flex-col">
            <h2 class="text-lg font-bold text-text mb-4">{{ t('dashboard.recentActivity') }}</h2>
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
              <div v-for="activity in recentActivity" :key="activity.id" class="flex gap-3 group">
                <!-- Avatar / Line -->
                <div class="relative flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center font-bold text-xs z-10 group-hover:ring-2 ring-primary/30 transition-all">
                    {{ activity.avatar }}
                  </div>
                  <!-- Timeline line connecting items (hidden on last item via CSS if desired, using a hack here) -->
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
