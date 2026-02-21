<script setup lang="ts">
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

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-xs font-medium text-text/70">{{ label }}</span>
    <select
      :value="props.modelValue"
      @change="onChange"
      class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

