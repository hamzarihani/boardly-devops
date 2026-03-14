import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isSidebarOpen = ref(false)

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function closeSidebar() {
    isSidebarOpen.value = false
  }

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar
  }
})
