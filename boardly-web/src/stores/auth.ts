import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type UserRole = 'ADMIN' | 'MEMBER'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))

  const isAuthenticated = computed(() => Boolean(token.value))

  function setUser(nextUser: AuthUser | null) {
    user.value = nextUser
  }

  function setToken(nextToken: string | null) {
    token.value = nextToken
    if (nextToken) {
      localStorage.setItem('access_token', nextToken)
      return
    }
    localStorage.removeItem('access_token')
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  return { user, token, isAuthenticated, setUser, setToken, logout }
})
