<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useI18n } from '@/i18n'

const companyName = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const errorMsg = ref<string | null>(null)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

async function handleRegister() {
  try {
    loading.value = true
    errorMsg.value = null
    
    await authStore.signup(email.value, password.value, companyName.value)

    alert("Signup successful! Please confirm your email and then log in.")
    router.push('/login')
  } catch (error: any) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div v-if="errorMsg" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <input
        v-model="companyName"
        type="text"
        :disabled="loading"
        :placeholder="t('auth.companyName')"
        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
        required
      />

      <input
        v-model="email"
        type="email"
        :disabled="loading"
        :placeholder="t('auth.email')"
        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
        required
      />

      <input
        v-model="password"
        type="password"
        :disabled="loading"
        :placeholder="t('auth.password')"
        class="w-full px-4 py-2 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50"
        required
      />

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? t('common.loading') : t('auth.signUp') }}
      </button>
    </form>
    <div class="mt-6 text-center text-sm text-text/60">
          {{ t('auth.haveAccount') }}
          <RouterLink to="/login" class="text-primary hover:text-primary/80 font-medium">
            {{ t('auth.signIn') }}
          </RouterLink>
        </div>
  </AuthLayout>
</template>
