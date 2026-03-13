<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import LoadingScreen from '@/components/common/LoadingScreen.vue'

const authStore = useAuthStore()
</script>

<template>
  <LoadingScreen :loading="authStore.loading" title="Boardly is loading..." />
  <RouterView v-if="!authStore.loading" />
</template>
