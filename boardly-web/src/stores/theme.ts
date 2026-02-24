import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<'light' | 'dark'>('light')
  const primaryColor = ref<string>('') // Empty means use CSS default
  const initialized = ref(false)

  function isValidMode(value: string | null): value is 'light' | 'dark' {
    return value === 'light' || value === 'dark'
  }

  function hexToRgbValue(hex: string) {
    const safeHex = hex.replace('#', '')
    if (safeHex.length !== 6) return null
    const red = Number.parseInt(safeHex.slice(0, 2), 16)
    const green = Number.parseInt(safeHex.slice(2, 4), 16)
    const blue = Number.parseInt(safeHex.slice(4, 6), 16)
    if ([red, green, blue].some((value) => Number.isNaN(value))) return null
    return `${red} ${green} ${blue}`
  }

  function normalizePrimaryColor(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return ''
    if (value.startsWith('#')) return hexToRgbValue(value) ?? ''
    return value
  }

  function applyMode(newMode: 'light' | 'dark') {
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark')
      return
    }
    document.documentElement.classList.remove('dark')
  }

  function applyPrimaryColor(newColor: string) {
    if (newColor) {
      document.documentElement.style.setProperty('--primary-custom', newColor)
      return
    }
    document.documentElement.style.removeProperty('--primary-custom')
  }

  function initialize() {
    if (initialized.value) return

    const savedMode = localStorage.getItem('theme')
    const savedPrimaryColor = localStorage.getItem('primary_color')
    let settingsPrimaryColor = ''

    const storedSettings = localStorage.getItem('company_settings')
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings) as { primaryColor?: string }
        settingsPrimaryColor = normalizePrimaryColor(parsedSettings.primaryColor)
      } catch {
        // Ignore malformed localStorage values and continue with defaults.
      }
    }

    if (isValidMode(savedMode)) mode.value = savedMode
    primaryColor.value = normalizePrimaryColor(savedPrimaryColor) || settingsPrimaryColor

    applyMode(mode.value)
    applyPrimaryColor(primaryColor.value)
    initialized.value = true
  }

  // Watchers to apply changes to the DOM automatically
  watch(mode, (newMode) => {
    if (!initialized.value) return
    localStorage.setItem('theme', newMode)
    applyMode(newMode)
  })

  watch(primaryColor, (newColor) => {
    if (!initialized.value) return
    if (newColor) {
      localStorage.setItem('primary_color', newColor)
    } else {
      localStorage.removeItem('primary_color')
    }
    applyPrimaryColor(newColor)
  })

  function setMode(newMode: 'light' | 'dark') {
    mode.value = newMode
  }

  function toggleMode() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function setPrimaryColor(color: string) {
    primaryColor.value = color
  }

  function resetPrimaryColor() {
    primaryColor.value = ''
  }

  return {
    mode,
    primaryColor,
    initialize,
    setMode,
    toggleMode,
    setPrimaryColor,
    resetPrimaryColor
  }
})
