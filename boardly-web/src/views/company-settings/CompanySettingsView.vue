<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { apiFetch } from '@/lib/api'

const themeStore = useThemeStore()
const loading = ref(true)
const saving = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const form = reactive({
  companyName: 'Boardly Labs',
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
  themeStore.setPrimaryColor(rgbValue)
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
  void persistSettings()
}

async function persistSettings() {
  try {
    saving.value = true
    errorMsg.value = null
    successMsg.value = null

    const payload = {
      companyName: form.companyName,
      workStart: form.workStart,
      workEnd: form.workEnd,
      workDays: [...form.workDays],
      primaryColor: form.primaryColor,
    }

    const response = await apiFetch('/settings/company', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    const updated = response as typeof payload
    form.companyName = updated.companyName
    form.workStart = updated.workStart
    form.workEnd = updated.workEnd
    form.workDays = updated.workDays
    form.primaryColor = updated.primaryColor

    localStorage.setItem('company_settings', JSON.stringify(updated))
    applyPrimaryColor(form.primaryColor)
    successMsg.value = 'Settings saved successfully.'
  } catch (error: unknown) {
    errorMsg.value =
      error instanceof Error ? error.message : 'Failed to save settings.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    errorMsg.value = null
    successMsg.value = null

    const response = await apiFetch('/settings/company')
    const data = response as Partial<typeof form>

    form.companyName = data.companyName ?? form.companyName
    form.workStart = data.workStart ?? form.workStart
    form.workEnd = data.workEnd ?? form.workEnd
    form.workDays = data.workDays ?? form.workDays
    form.primaryColor = data.primaryColor ?? form.primaryColor

    localStorage.setItem('company_settings', JSON.stringify(form))
  } catch (error: unknown) {
    errorMsg.value =
      error instanceof Error ? error.message : 'Failed to load company settings.'
  } finally {
    loading.value = false
    applyPrimaryColor(form.primaryColor)
  }
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

      <section
        v-if="loading"
        class="rounded-xl border border-border bg-card p-4 text-sm text-text/70"
      >
        Loading settings...
      </section>

      <section
        v-if="errorMsg"
        class="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMsg }}
      </section>

      <section
        v-if="successMsg"
        class="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700"
      >
        {{ successMsg }}
      </section>

      <section class="rounded-xl border border-border bg-card p-5">
        <h2 class="text-lg font-semibold text-text">Company Profile</h2>
        <div class="mt-4 grid grid-cols-1 gap-4">
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text/60">Company name</span>
            <input
              v-model="form.companyName"
              type="text"
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
            :disabled="saving"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ saving ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>
