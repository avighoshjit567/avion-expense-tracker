import { createRouter, createWebHistory } from 'vue-router'

import AccountsPage from './pages/AccountsPage.vue'
import BudgetsPage from './pages/BudgetsPage.vue'
import CategoriesPage from './pages/CategoriesPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import TransactionsPage from './pages/TransactionsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage },
    { path: '/transactions', name: 'transactions', component: TransactionsPage },
    { path: '/accounts', name: 'accounts', component: AccountsPage },
    { path: '/categories', name: 'categories', component: CategoriesPage },
    { path: '/budgets', name: 'budgets', component: BudgetsPage },
    { path: '/settings', name: 'settings', component: SettingsPage },
  ],
})

export default router
