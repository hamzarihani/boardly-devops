<script setup lang="ts">
// import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'

interface MenuItem {
  labelKey: 'nav.dashboard' | 'nav.boards' | 'nav.tasks' | 'nav.team' | 'nav.settings'
  to: string
  roles: ('ADMIN' | 'MEMBER')[]
  icon: 'dashboard' | 'boards' | 'tasks' | 'team' | 'settings'
}

const authStore = useAuthStore()
const route = useRoute()
const { t } = useI18n()

const menuItems: MenuItem[] = [
  { labelKey: 'nav.dashboard', to: '/dashboard', roles: ['ADMIN', 'MEMBER'], icon: 'dashboard' },
  { labelKey: 'nav.boards', to: '/boards', roles: ['ADMIN', 'MEMBER'], icon: 'boards' },
  { labelKey: 'nav.tasks', to: '/my-tasks', roles: ['ADMIN', 'MEMBER'], icon: 'tasks' },
  { labelKey: 'nav.team', to: '/team', roles: ['ADMIN'], icon: 'team' },
  { labelKey: 'nav.settings', to: '/settings', roles: ['ADMIN'], icon: 'settings' }
]

const iconPaths: Record<MenuItem['icon'], string> = {
  dashboard: 'M3 12l9-9 9 9M5 10v10h14V10',
  boards: 'M4 5h16v14H4zM9 5v14M15 5v14',
  tasks: 'M9 11l3 3L20 6M4 6h3M4 12h3M4 18h10',
  team: 'M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2M11 19H4a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1zM9 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4-2.1.7a7.8 7.8 0 0 1-.5 1.3l1 2-2 2-2-1a7.8 7.8 0 0 1-1.3.5L12 20l-1.1-2.1a7.8 7.8 0 0 1-1.3-.5l-2 1-2-2 1-2a7.8 7.8 0 0 1-.5-1.3L4 12l2.1-1.1c.1-.5.3-.9.5-1.3l-1-2 2-2 2 1c.4-.2.8-.4 1.3-.5L12 4l1.1 2.1c.5.1.9.3 1.3.5l2-1 2 2-1 2c.2.4.4.8.5 1.3L20 12z'
}

// const filteredMenu = computed(() =>
//   menuItems.filter(item =>
//     item.roles.includes(authStore.user?.role as 'ADMIN' | 'MEMBER')
//   )
// )

function isActive(path: string) {
  return route.path.startsWith(path)
}

function logout() {
  authStore.logout()
}
</script>
<template>
  <aside id="top-bar-sidebar"
      class="fixed top-0 [inset-inline-start:0] z-40 w-64 h-full transition-transform -translate-x-full rtl:translate-x-0 sm:translate-x-0"
      aria-label="Sidebar">
    <div class="flex flex-col justify-between h-full px-3 py-4 pt-20 overflow-y-auto bg-background border-e border-border">

    <nav class="flex-1 space-y-2">
      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-2 rounded-lg transition"
        :class="isActive(item.to) ? 'bg-primary text-amber-50' : 'hover:bg-primary/30'"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="iconPaths[item.icon]" />
        </svg>
        {{ t(item.labelKey) }}
      </RouterLink>
    </nav>

    <button
      @click="logout"
      class="mt-6 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-amber-50 cursor-pointer"
    >
      {{ t('common.logout') }}
    </button>
    </div>
  </aside>
</template>
