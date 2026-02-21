<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { useI18n, type Locale } from '@/i18n'

const isUserMenuOpen = ref(false)
const isLanguageMenuOpen = ref(false)
const isDark = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const languageMenuRef = ref<HTMLElement | null>(null)
const { t, locale, setLocale } = useI18n()

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
  if (isUserMenuOpen.value) isLanguageMenuOpen.value = false
}

function toggleLanguageMenu() {
  isLanguageMenuOpen.value = !isLanguageMenuOpen.value
  if (isLanguageMenuOpen.value) isUserMenuOpen.value = false
}
function toggleChangeMode(){
  isDark.value = !isDark.value
  if(isDark.value) {
    document.documentElement.classList.add("dark")
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove("dark")
    localStorage.setItem('theme', 'light')
  }
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (!target) return

  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(target)) {
    isUserMenuOpen.value = false
  }

  if (isLanguageMenuOpen.value && languageMenuRef.value && !languageMenuRef.value.contains(target)) {
    isLanguageMenuOpen.value = false
  }
}

function onLocaleChange(value: Locale) {
  setLocale(value)
  isLanguageMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  const savedTheme = localStorage.getItem("theme")

  if(savedTheme === "dark") {
    isDark.value = true
    document.documentElement.classList.add("dark")
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="flex min-h-screen text-text">
    <!-- Sidebar -->


    <nav class="fixed top-0 z-50 w-full bg-background border border-border">
      <div class="px-3 py-3 lg:px-5 lg:pl-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-start rtl:justify-end">
            <button data-drawer-target="top-bar-sidebar" data-drawer-toggle="top-bar-sidebar"
              aria-controls="top-bar-sidebar" type="button"
              class="sm:hidden text-text bg-transparent box-border border border-transparent hover:bg-card/80 focus:ring-4 focus:ring-primary/40 font-medium leading-5 rounded-lg text-sm p-2 focus:outline-none">
              <span class="sr-only">{{ t('common.openSidebar') }}</span>
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h10" />
              </svg>
            </button>
            <a href="/dashboard" class="flex ms-2 md:me-24">
              <img src="/logo.svg" class="h-6 w-6 me-3" alt="Boardly Logo" />
              <span class="self-center text-lg font-semibold whitespace-nowrap dark:text-white">{{ t('app.name') }}</span>
            </a>
          </div>
          <div class="flex items-center">
            <div ref="languageMenuRef" class="relative me-2">
              <button
                type="button"
                @click="toggleLanguageMenu"
                :aria-expanded="isLanguageMenuOpen"
                aria-controls="dropdown-language"
                class="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-blue-600/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <span class="sr-only">{{ t('common.language') }}</span>
                <span class="pi pi-language text-base"></span>
              </button>
              <div
                v-show="isLanguageMenuOpen"
                id="dropdown-language"
                class="absolute [inset-inline-end:0] top-10 z-50 bg-card border border-border rounded-lg shadow-lg w-24 p-1"
              >
                <button
                  type="button"
                  @click="onLocaleChange('en')"
                  class="w-full px-2 py-1.5 text-sm text-start rounded hover:bg-background/80"
                  :class="locale === 'en' ? 'text-primary font-semibold' : 'text-text/80'"
                >
                  EN
                </button>
                <button
                  type="button"
                  @click="onLocaleChange('fr')"
                  class="w-full px-2 py-1.5 text-sm text-start rounded hover:bg-background/80"
                  :class="locale === 'fr' ? 'text-primary font-semibold' : 'text-text/80'"
                >
                  FR
                </button>
                <button
                  type="button"
                  @click="onLocaleChange('ar')"
                  class="w-full px-2 py-1.5 text-sm text-start rounded hover:bg-background/80"
                  :class="locale === 'ar' ? 'text-primary font-semibold' : 'text-text/80'"
                >
                  AR
                </button>
              </div>
            </div>
            <div @click="toggleChangeMode" class="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-blue-600/30">
              <span v-show="isDark" class="pi pi-sun"></span>
              <span v-show="!isDark" class="pi pi-moon"></span>
            </div>
            <div ref="userMenuRef" class="relative flex items-center ms-3">
              <div>
                <button type="button"
                  @click="toggleUserMenu"
                  :aria-expanded="isUserMenuOpen"
                  class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  aria-controls="dropdown-user">
                  <span class="sr-only">{{ t('common.openUserMenu') }}</span>
                  <img class="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                    alt="user photo">
                </button>
              </div>
              <div
                v-show="isUserMenuOpen"
                class="absolute [inset-inline-end:0] top-10 z-50 bg-card border border-border rounded-lg shadow-lg w-44"
                id="dropdown-user">
                <div class="px-4 py-3 border-b border-border" role="none">
                  <p class="text-sm font-medium text-text" role="none">
                    Neil Sims
                  </p>
                  <p class="text-sm text-text/80 truncate" role="none">
                    neil.sims@flowbite.com
                  </p>
                </div>
                <ul class="p-2 text-sm text-text/80 font-medium" role="none">
                  <li>
                    <a href="#"
                      class="inline-flex items-center w-full p-2 hover:bg-background/80 hover:text-text rounded"
                      role="menuitem">{{ t('menu.dashboard') }}</a>
                  </li>
                  <li>
                    <a href="#"
                      class="inline-flex items-center w-full p-2 hover:bg-background/80 hover:text-text rounded"
                      role="menuitem">{{ t('menu.settings') }}</a>
                  </li>
                  <li>
                    <a href="#"
                      class="inline-flex items-center w-full p-2 hover:bg-background/80 hover:text-text rounded"
                      role="menuitem">{{ t('menu.earnings') }}</a>
                  </li>
                  <li>
                    <a href="#"
                      class="inline-flex items-center w-full p-2 hover:bg-background/80 hover:text-text rounded"
                      role="menuitem">{{ t('menu.signOut') }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <AppSidebar></AppSidebar>
    
    <!-- Main -->
    <div class="p-4 sm:ms-64 mt-14 w-full overflow-auto h-[calc(100vh-56px)]">
      <slot />
    </div>
  </div>
</template>
