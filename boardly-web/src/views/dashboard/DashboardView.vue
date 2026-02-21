<script setup lang="ts">
import DashboardLayout from "@/layouts/DashboardLayout.vue"
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>
<template>
  <DashboardLayout>
    <h1 class="text-3xl font-bold mb-4">{{ t('nav.dashboard') }}</h1>
    <p>{{ t('dashboard.welcome') }}</p>
  </DashboardLayout>
</template>
