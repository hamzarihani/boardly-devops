import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/lib/api'

export interface TeamMember {
  id: string
  full_name: string
  email: string
  role?: string
}

export const useTeamStore = defineStore('team', () => {
  const members = ref<TeamMember[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  const memberOptions = computed(() => [
    { label: 'Unassigned', value: '' },
    ...members.value.map(m => ({
      label: m.full_name,
      value: m.full_name // Existing logic uses name string as assignee, following that pattern for now
    }))
  ])

  const memberOptionsById = computed(() => [
    { label: 'Unassigned', value: '' },
    ...members.value.map(m => ({
      label: m.full_name,
      value: m.id
    }))
  ])

  async function fetchMembers(force = false) {
    if (!force && lastFetched.value && (Date.now() - lastFetched.value < 600000)) { // 10 min cache
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch('/team/members')
      members.value = data || []
      lastFetched.value = Date.now()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch team members'
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function createMember(payload: { name: string; email: string; role: string }) {
    isLoading.value = true
    try {
      const data = await apiFetch('/team/members', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      await fetchMembers(true)
      return data
    } finally {
      isLoading.value = false
    }
  }

  async function updateMember(id: string, payload: { name: string; email: string; role: string }) {
    isLoading.value = true
    try {
      await apiFetch(`/team/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      await fetchMembers(true)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteMember(id: string) {
    isLoading.value = true
    try {
      await apiFetch(`/team/members/${id}`, {
        method: 'DELETE'
      })
      await fetchMembers(true)
    } finally {
      isLoading.value = false
    }
  }

  return {
    members,
    isLoading,
    error,
    memberOptions,
    memberOptionsById,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember
  }
})
