import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => Boolean(user.value))

  async function initialize() {
    const token = localStorage.getItem('access_token')
    if (!token) {
      loading.value = false
      return
    }

    try {
      loading.value = true
      const userData = await apiFetch('/auth/me')
      user.value = userData
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      localStorage.removeItem('access_token')
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    try {
      loading.value = true
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken)
        }
        await initialize()
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function signup(email: string, password: string, companyName: string) {
    try {
      loading.value = true
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, companyName }),
      })
      return data
    } finally {
      loading.value = false
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    user.value = null
  }

  return { 
    user, 
    loading, 
    isAuthenticated, 
    initialize, 
    login,
    signup,
    logout 
  }
})
