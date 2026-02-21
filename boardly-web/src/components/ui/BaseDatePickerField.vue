<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
  }>(),
  {
    label: '',
    placeholder: 'Select date',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const popoverStyle = ref<Record<string, string>>({})

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const selectedDate = computed(() => parseIsoDate(props.modelValue))

const viewDate = ref(selectedDate.value ?? new Date())

watch(selectedDate, (value) => {
  if (value) {
    viewDate.value = new Date(value)
  }
})

const headerLabel = computed(() => {
  return `${monthNames[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
})

const calendarDays = computed(() => {
  const startOfMonth = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1)
  const startDay = startOfMonth.getDay()
  const daysInMonth = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0).getDate()

  const days: Date[] = []
  const gridStart = new Date(startOfMonth)
  gridStart.setDate(startOfMonth.getDate() - startDay)

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    days.push(day)
  }

  if (daysInMonth <= 0) return []
  return days
})

function closePicker() {
  isOpen.value = false
}

function togglePicker() {
  const nextOpenState = !isOpen.value
  isOpen.value = nextOpenState
  if (!nextOpenState) return
  void nextTick(() => {
    updatePlacement()
  })
}

function goToPreviousMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}

function goToNextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

function selectDate(date: Date) {
  emit('update:modelValue', toIsoDate(date))
  closePicker()
}

function clearValue() {
  emit('update:modelValue', '')
  closePicker()
}

function setToday() {
  const today = new Date()
  emit('update:modelValue', toIsoDate(today))
  viewDate.value = new Date(today)
  closePicker()
}

function isCurrentMonth(date: Date) {
  return date.getMonth() === viewDate.value.getMonth() && date.getFullYear() === viewDate.value.getFullYear()
}

function isSelected(date: Date) {
  return selectedDate.value ? sameDate(date, selectedDate.value) : false
}

function isToday(date: Date) {
  return sameDate(date, new Date())
}

function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return
  const target = event.target as Node | null
  if (!target || !rootRef.value) return
  if (!rootRef.value.contains(target)) {
    closePicker()
  }
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePicker()
  }
}

function updatePlacement() {
  if (!triggerRef.value || !popoverRef.value) return
  const viewportMargin = 8
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const desiredWidth = Math.max(triggerRect.width, 288)
  const maxWidth = Math.max(0, window.innerWidth - viewportMargin * 2)
  const popoverWidth = Math.min(desiredWidth, maxWidth)

  popoverRef.value.style.width = `${popoverWidth}px`

  let left = triggerRect.left
  if (left + popoverWidth > window.innerWidth - viewportMargin) {
    left = window.innerWidth - viewportMargin - popoverWidth
  }
  left = Math.max(viewportMargin, left)

  const popoverHeight = popoverRef.value.offsetHeight
  const bottomSpace = window.innerHeight - triggerRect.bottom - viewportMargin
  const topSpace = triggerRect.top - viewportMargin
  const shouldOpenUp = bottomSpace < popoverHeight && topSpace > bottomSpace

  let top = shouldOpenUp
    ? triggerRect.top - popoverHeight - viewportMargin
    : triggerRect.bottom + viewportMargin

  const maxTop = Math.max(viewportMargin, window.innerHeight - popoverHeight - viewportMargin)
  top = Math.min(Math.max(viewportMargin, top), maxTop)

  popoverStyle.value = {
    width: `${popoverWidth}px`,
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  }
}

function onViewportChange() {
  if (!isOpen.value) return
  updatePlacement()
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onEscape)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onEscape)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>

<template>
  <label ref="rootRef" class="relative block group">
    <span v-if="label" class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text/60">
      {{ label }}
    </span>

    <button
      ref="triggerRef"
      type="button"
      @click="togglePicker"
      class="relative flex w-full items-center rounded-xl border border-border bg-background/80 px-10 py-2.5 text-left text-sm text-text outline-none transition-colors group-focus-within:border-primary/50 group-focus-within:bg-background"
      :class="isOpen ? 'border-primary/50 bg-background' : ''"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="dialog"
    >
      <span class="pointer-events-none absolute left-3 text-text/60">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        </svg>
      </span>
      <span :class="displayValue ? 'text-text' : 'text-text/50'">
        {{ displayValue || props.placeholder }}
      </span>
      <span class="pointer-events-none absolute right-3 text-text/60">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </button>

    <button
      v-if="props.modelValue"
      type="button"
      @click.stop="clearValue"
      class="absolute right-9 bottom-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-text/60 hover:bg-card hover:text-text"
      aria-label="Clear date"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      ref="popoverRef"
      class="fixed z-30 rounded-xl border border-border bg-card p-3 shadow-lg"
      :style="popoverStyle"
      role="dialog"
      aria-label="Date picker"
    >
      <div class="mb-3 flex items-center justify-between">
        <button
          type="button"
          @click="goToPreviousMonth"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text/70 hover:bg-background hover:text-text"
          aria-label="Previous month"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p class="text-sm font-semibold text-text">{{ headerLabel }}</p>
        <button
          type="button"
          @click="goToNextMonth"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text/70 hover:bg-background hover:text-text"
          aria-label="Next month"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="mb-2 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-text/60">
        <span v-for="day in dayNames" :key="day">{{ day }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in calendarDays"
          :key="toIsoDate(day)"
          type="button"
          @click="selectDate(day)"
          class="inline-flex h-9 items-center justify-center rounded-md text-sm transition-colors"
          :class="[
            isSelected(day) ? 'bg-primary text-white hover:bg-primary/90' : '',
            !isSelected(day) && isCurrentMonth(day) ? 'text-text hover:bg-background' : '',
            !isSelected(day) && !isCurrentMonth(day) ? 'text-text/35 hover:bg-background/60' : '',
            !isSelected(day) && isToday(day) ? 'ring-1 ring-primary/50' : '',
          ]"
        >
          {{ day.getDate() }}
        </button>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <button
          type="button"
          @click="clearValue"
          class="rounded-md px-2.5 py-1.5 text-xs font-medium text-text/70 hover:bg-background hover:text-text"
        >
          Clear
        </button>
        <button
          type="button"
          @click="setToday"
          class="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
        >
          Today
        </button>
      </div>
    </div>
  </label>
</template>
