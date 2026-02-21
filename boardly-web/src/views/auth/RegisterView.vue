<script setup lang="ts">
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useI18n } from '@/i18n'

const companyName = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const { t } = useI18n()

function handleRegister() {
  console.log(companyName.value, email.value, password.value)
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">{{ t('auth.createAccount') }}</h2>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <input
        v-model="companyName"
        type="text"
        :placeholder="t('auth.companyName')"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />

      <input
        v-model="email"
        type="email"
        :placeholder="t('auth.email')"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />

      <input
        v-model="password"
        type="password"
        :placeholder="t('auth.password')"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />

      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {{ t('auth.signUp') }}
      </button>
    </form>
    <div class="mt-6 text-center text-sm text-gray-600">
          {{ t('auth.haveAccount') }}
          <RouterLink to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
            {{ t('auth.signIn') }}
          </RouterLink>
        </div>
  </AuthLayout>
</template>
