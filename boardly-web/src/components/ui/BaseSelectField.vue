<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface SelectOption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: SelectOption[]
    label?: string
  }>(),
  {
    label: '',
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

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue) ?? null
})

function toggleMenu() {
  const nextOpenState = !isOpen.value
  isOpen.value = nextOpenState
  if (!nextOpenState) return
  void nextTick(() => {
    updatePlacement()
  })
}

function closeMenu() {
  isOpen.value = false
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  closeMenu()
}

function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return
  const target = event.target as Node | null
  if (!target || !rootRef.value) return
  if (!rootRef.value.contains(target)) closeMenu()
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

function updatePlacement() {
  if (!triggerRef.value || !popoverRef.value) return
  const viewportMargin = 8
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const desiredWidth = triggerRect.width
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
  <label ref="rootRef" class="relative block">
    <span v-if="label" class="mb-1 block text-xs font-medium text-text/70">{{ label }}</span>

    <button
      ref="triggerRef"
      type="button"
      @click="toggleMenu"
      class="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none transition-colors hover:bg-card/60 focus:ring-2 focus:ring-primary/40"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="listbox"
    >
      <span class="truncate">{{ selectedOption?.label ?? 'Select option' }}</span>
      <svg class="h-4 w-4 shrink-0 text-text/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      ref="popoverRef"
      class="fixed z-50 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      :style="popoverStyle"
      role="listbox"
    >
      <button
        v-for="option in props.options"
        :key="option.value"
        type="button"
        @click="selectOption(option.value)"
        class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors"
        :class="option.value === props.modelValue ? 'bg-primary/10 text-primary' : 'text-text hover:bg-background'"
      >
        <span class="truncate">{{ option.label }}</span>
        <svg
          v-if="option.value === props.modelValue"
          class="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      </button>
    </div>
  </label>
</template>
