<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from "@/layouts/AuthLayout.vue"
import { useI18n } from '@/i18n'

const email = ref<string>('')
const password = ref<string>('')
const showPassword = ref(false)
const errorMsg = ref<string | null>(null)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

async function handleLogin() {
  try {
    loading.value = true
    errorMsg.value = null
    
    await authStore.login(email.value, password.value)

    router.push('/dashboard')
  } catch (error: unknown) {
    errorMsg.value = error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
  } finally {
    loading.value = false
  }
}

function useDemo() {
  email.value = 'demo@upliftz.com'
  password.value = 'Boardly!4wjs3rtlA1'
}
</script>

<template>
  <AuthLayout>
    
        <h2 class="text-2xl font-bold text-text mb-6 text-center">{{ t('auth.signIn') }}</h2>

        <div v-if="errorMsg" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text/80 mb-1">{{ t('auth.email') }}</label>
            <input
              v-model="email"
              type="email"
              :disabled="loading"
              class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text/80 mb-1">{{ t('auth.password') }}</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :disabled="loading"
                class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text/60 transition-colors cursor-pointer"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.12 13.12 0 0 1-1.19 2.15"></path><path d="M3 3l18 18"></path><path d="M17.06 17.06A8.5 8.5 0 0 1 12 19c-7 0-10-7-10-7a13.13 13.13 0 0 1 1.66-2.04"></path></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="rounded border-border text-primary focus:ring-primary"
              />
              <span class="ml-2 text-sm text-text/60">{{ t('auth.rememberMe') }}</span>
            </label>
            <a href="#" class="text-sm text-primary hover:text-primary/80">{{ t('auth.forgotPassword') }}</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ loading ? t('common.loading') : t('auth.signIn') }}
          </button>
        </form>

        <!-- Demo Account Section -->
        <div class="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-primary flex items-center gap-2">
              <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              {{ t('auth.demoAccount') }}
            </h3>
            <button 
              @click="useDemo"
              class="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {{ t('auth.useDemo') }}
            </button>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-text/60">{{ t('auth.demoEmail') }}:</span>
              <span class="font-mono text-text/90 select-all">demo@upliftz.com</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-text/60">{{ t('auth.demoPassword') }}:</span>
              <span class="font-mono text-text/90 select-all">Boardly!4wjs3rtlA1</span>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center text-sm text-text/60">
          {{ t('auth.noAccount') }}
          <RouterLink to="/register" class="text-primary hover:text-primary/80 font-medium">
            {{ t('auth.signUp') }}
          </RouterLink>
        </div>

  </AuthLayout>
</template>
