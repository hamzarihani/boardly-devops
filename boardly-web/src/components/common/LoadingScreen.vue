<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Loading...'
  }
})

const isVisible = computed(() => props.loading)
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div class="relative flex items-center justify-center">
        <div class="absolute h-24 w-24 rounded-full border-4 border-primary/20 animate-pulse"></div>
        <div class="h-16 w-16 rounded-full border-t-4 border-r-4 border-primary animate-spin shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"></div>
        <div class="absolute h-8 w-8 rounded-full bg-primary/10 animate-pulse"></div>
      </div>
      
      <div class="mt-8 flex flex-col items-center gap-2">
        <h3 class="text-xl font-semibold text-text/80 tracking-tight animate-pulse">
          {{ title }}
        </h3>
        <p class="text-sm text-text/50 font-medium">Please wait a moment</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.bg-background\/80 {
  background-color: rgb(var(--color-background) / 0.8);
}

.text-primary {
  color: rgb(var(--color-primary));
}

.border-primary {
  border-color: rgb(var(--color-primary));
}

.border-primary\/20 {
  border-color: rgb(var(--color-primary) / 0.2);
}

.bg-primary\/10 {
  background-color: rgb(var(--color-primary) / 0.1);
}
</style>
