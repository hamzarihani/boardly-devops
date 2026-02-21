<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const form = reactive({
  companyName: 'Boardly Labs',
  email: 'ops@boardly.dev',
  workStart: '09:00',
  workEnd: '18:00',
  workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as string[],
  primaryColor: '#6366F1',
})

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const primaryColorOptions = [
  '#6366F1',
  '#2563EB',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
]

function hexToRgbValue(hex: string) {
  const safeHex = hex.replace('#', '')
  if (safeHex.length !== 6) return null
  const red = Number.parseInt(safeHex.slice(0, 2), 16)
  const green = Number.parseInt(safeHex.slice(2, 4), 16)
  const blue = Number.parseInt(safeHex.slice(4, 6), 16)
  if ([red, green, blue].some((value) => Number.isNaN(value))) return null
  return `${red} ${green} ${blue}`
}

function applyPrimaryColor(hex: string) {
  const rgbValue = hexToRgbValue(hex)
  if (!rgbValue) return
  document.documentElement.style.setProperty('--color-primary', rgbValue)
}

function toggleWorkDay(day: string) {
  if (form.workDays.includes(day)) {
    form.workDays = form.workDays.filter((currentDay) => currentDay !== day)
    return
  }
  form.workDays = [...form.workDays, day]
}

function selectPrimaryColor(color: string) {
  form.primaryColor = color
  applyPrimaryColor(color)
}

function saveSettings() {
  localStorage.setItem('company_settings', JSON.stringify(form))
  applyPrimaryColor(form.primaryColor)
  console.log('Company settings saved', { ...form })
}

onMounted(() => {
  const storedSettings = localStorage.getItem('company_settings')
  if (!storedSettings) {
    applyPrimaryColor(form.primaryColor)
    return
  }

  const parsedSettings = JSON.parse(storedSettings) as Partial<typeof form>
  form.companyName = parsedSettings.companyName ?? form.companyName
  form.email = parsedSettings.email ?? form.email
  form.workStart = parsedSettings.workStart ?? form.workStart
  form.workEnd = parsedSettings.workEnd ?? form.workEnd
  form.workDays = parsedSettings.workDays ?? form.workDays
  form.primaryColor = parsedSettings.primaryColor ?? form.primaryColor
  applyPrimaryColor(form.primaryColor)
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6 w-full">
      <section class="rounded-xl border border-border bg-card p-5">
        <h1 class="text-2xl font-bold text-text">Company Settings</h1>
        <p class="mt-1 text-sm text-text/70">
          Manage your company profile and defaults used across your workspace.
        </p>
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <h2 class="text-lg font-semibold text-text">Company Profile</h2>
        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text/60">Company name</span>
            <input
              v-model="form.companyName"
              type="text"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text/60">Email</span>
            <input
              v-model="form.email"
              type="email"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
        </div>
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <h2 class="text-lg font-semibold text-text">Work Schedule</h2>
        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text/60">Work start</span>
            <input
              v-model="form.workStart"
              type="time"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text/60">Work end</span>
            <input
              v-model="form.workEnd"
              type="time"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
        </div>

        <div class="mt-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-text/60">Work days</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in weekdays"
              :key="day"
              type="button"
              @click="toggleWorkDay(day)"
              class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
              :class="form.workDays.includes(day) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-text hover:bg-background/80'"
            >
              {{ day }}
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <h2 class="text-lg font-semibold text-text">Theme Primary Color</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            v-for="color in primaryColorOptions"
            :key="color"
            type="button"
            @click="selectPrimaryColor(color)"
            class="relative h-9 w-9 rounded-full border-2 transition-transform hover:scale-105"
            :style="{ backgroundColor: color }"
            :class="form.primaryColor === color ? 'border-text' : 'border-transparent'"
            :aria-label="`Set primary color ${color}`"
          >
            <span
              v-if="form.primaryColor === color"
              class="absolute inset-0 flex items-center justify-center text-white"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
              </svg>
            </span>
          </button>
        </div>

        <div class="mt-5 flex justify-end">
          <button
            type="button"
            @click="saveSettings"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Save changes
          </button>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>
