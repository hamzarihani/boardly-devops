<script setup lang="ts">
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const companyName = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')

function handleRegister() {
  console.log(companyName.value, email.value, password.value)
}
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <input
        v-model="companyName"
        type="text"
        placeholder="Company Name"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />

      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        Sign Up
      </button>
    </form>
    <div class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <RouterLink to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign In
          </RouterLink>
        </div>
  </AuthLayout>
</template>
