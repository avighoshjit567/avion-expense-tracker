<script setup lang="ts">
import { computed } from 'vue'

import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const icon = computed(() => (isDark.value ? 'light_mode' : 'dark_mode'))
const label = computed(() => (isDark.value ? 'Light mode' : 'Dark mode'))
</script>

<template>
  <button class="theme-toggle" type="button" :aria-label="label" @click="toggleTheme">
    <span class="material-symbols-outlined">{{ icon }}</span>
    <span class="theme-toggle-label">{{ label }}</span>
  </button>
</template>
