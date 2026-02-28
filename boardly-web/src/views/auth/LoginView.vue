<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from "@/layouts/AuthLayout.vue"
import { useI18n } from '@/i18n'

const email = ref<string>('')
const password = ref<string>('')
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
            <input
              v-model="password"
              type="password"
              :disabled="loading"
              class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
              placeholder="••••••••"
              required
            />
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

        <div class="mt-6 text-center text-sm text-text/60">
          {{ t('auth.noAccount') }}
          <RouterLink to="/register" class="text-primary hover:text-primary/80 font-medium">
            {{ t('auth.signUp') }}
          </RouterLink>
        </div>

  </AuthLayout>
</template>
