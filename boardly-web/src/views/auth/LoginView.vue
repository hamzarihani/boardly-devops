<script setup lang="ts">
import { ref } from 'vue'
import AuthLayout from "@/layouts/AuthLayout.vue"
import { useI18n } from '@/i18n'

const email = ref<string>('')
const password = ref<string>('')
const { t } = useI18n()

function handleLogin() {
  console.log(email.value, password.value)
}
</script>

<template>
  <AuthLayout>
    
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">{{ t('auth.signIn') }}</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
            <input
              v-model="email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.password') }}</label>
            <input
              v-model="password"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="ml-2 text-sm text-gray-600">{{ t('auth.rememberMe') }}</span>
            </label>
            <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500">{{ t('auth.forgotPassword') }}</a>
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {{ t('auth.signIn') }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          {{ t('auth.noAccount') }}
          <RouterLink to="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">
            {{ t('auth.signUp') }}
          </RouterLink>
        </div>

  </AuthLayout>
</template>
