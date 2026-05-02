<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { useExpenseTracker } from '../composables/useExpenseTracker'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const { formatCurrencyValue, totalBalance } = useExpenseTracker()

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
  { name: 'Transactions', path: '/transactions', icon: 'receipt_long' },
  { name: 'Accounts', path: '/accounts', icon: 'account_balance_wallet' },
  { name: 'Categories', path: '/categories', icon: 'category' },
  { name: 'Budgets', path: '/budgets', icon: 'target' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
]

const activeTitle = computed(() => navItems.find((item) => route.path.startsWith(item.path))?.name ?? 'Dashboard')
const todayLabel = computed(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
</script>

<template>
  <div class="page-shell">
    <div class="page-layout">
      <aside class="sidebar">
        <div>
          <div class="brand-title">Avion Expense Tracker</div>
          <div class="brand-subtitle">Personal money OS</div>
        </div>

        <nav class="nav-group">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: route.path.startsWith(item.path) }"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-theme-card">
            <div>
              <div class="meta-title">Current balance</div>
              <div class="meta-copy">{{ formatCurrencyValue(totalBalance) }}</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <section class="main-panel">
        <header class="topbar">
          <div class="topbar-left">
            <div>
              <div class="topbar-title">{{ activeTitle }}</div>
              <div class="meta-copy">Keep your income, spending, and budgets aligned.</div>
            </div>
          </div>

          <div class="topbar-right">
            <div class="topbar-chip">
              <span class="material-symbols-outlined">calendar_today</span>
              <span>{{ todayLabel }}</span>
            </div>
            <ThemeToggle />
            <div class="avatar">AE</div>
          </div>
        </header>

        <main class="page-content">
          <RouterView />
        </main>
      </section>
    </div>
  </div>
</template>
