<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
const isOpen = ref(false)

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue) ?? null
})

function toggleMenu() {
  isOpen.value = !isOpen.value
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

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <label ref="rootRef" class="relative block">
    <span v-if="label" class="mb-1 block text-xs font-medium text-text/70">{{ label }}</span>

    <button
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
      class="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
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
