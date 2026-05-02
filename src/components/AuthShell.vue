<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'

import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
</script>

<template>
  <div class="auth-shell">
    <header class="auth-header">
      <div class="auth-brand">Avion Dashboard</div>
      <div class="topbar-right">
        <button class="icon-button"><span class="material-symbols-outlined">help_outline</span></button>
        <ThemeToggle />
      </div>
    </header>

    <main class="auth-main">
      <div class="auth-card-wrap">
        <RouterView />
      </div>
    </main>

    <footer class="auth-footer">
      <span>© 2026 Avion Dashboard. All rights reserved.</span>
      <div class="auth-footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Support</a>
      </div>
    </footer>

    <div class="auth-orb auth-orb-right"></div>
    <div class="auth-orb auth-orb-left"></div>
    <div class="auth-helper-copy">{{ route.meta.authSearchPlaceholder ?? 'Enterprise-grade admin experience' }}</div>
  </div>
</template>
