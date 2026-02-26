<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    @click.self="onCancel"
  >
    <div
      class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      role="alertdialog"
      aria-modal="true"
    >
      <h3 class="text-xl font-bold text-text mb-2">{{ title }}</h3>
      <p class="text-sm text-text/70 mb-8">{{ message }}</p>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="onCancel"
          class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-background transition"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          @click="onConfirm"
          class="rounded-lg px-6 py-2 text-sm font-semibold text-white transition shadow-md"
          :class="variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
