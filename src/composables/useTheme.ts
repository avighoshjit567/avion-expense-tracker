import { computed, ref } from 'vue'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'avion-dashboard-theme'
const theme = ref<ThemeMode>('light')
const initialized = ref(false)

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (nextTheme: ThemeMode) => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = nextTheme
  document.documentElement.style.colorScheme = nextTheme
}

const ensureTheme = () => {
  if (initialized.value) {
    return
  }

  theme.value = resolveInitialTheme()
  applyTheme(theme.value)
  initialized.value = true
}

export const useTheme = () => {
  ensureTheme()

  const setTheme = (nextTheme: ThemeMode) => {
    theme.value = nextTheme
    applyTheme(nextTheme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
  }
}
