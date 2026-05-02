<script setup lang="ts">
import { computed } from 'vue'

import { useExpenseTracker } from '../composables/useExpenseTracker'
import PageHeader from '../components/PageHeader.vue'
import SummaryCard from '../components/SummaryCard.vue'
import BaseButton from '../components/BaseButton.vue'

const { state, formatCurrencyValue, totalBalance, accountBalance } = useExpenseTracker()

const currentMonth = new Date().toISOString().slice(0, 7)

const currentMonthTransactions = computed(() =>
  state.transactions.filter((item) => item.date.startsWith(currentMonth)),
)

const monthIncome = computed(() =>
  currentMonthTransactions.value
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0),
)

const monthExpenses = computed(() =>
  currentMonthTransactions.value
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0),
)

const monthTransfers = computed(() =>
  currentMonthTransactions.value
    .filter((item) => item.type === 'transfer')
    .reduce((sum, item) => sum + item.amount, 0),
)

const netFlow = computed(() => monthIncome.value - monthExpenses.value)
const savingsRate = computed(() => (monthIncome.value === 0 ? 0 : Math.round((netFlow.value / monthIncome.value) * 100)))

const summaryCards = computed(() => [
  {
    label: 'This month income',
    value: formatCurrencyValue(monthIncome.value),
    helper: `Goal ${formatCurrencyValue(state.settings.monthlyIncomeGoal)}`,
    icon: 'trending_up',
    trend: `${Math.max(savingsRate.value, 0)}% saved`,
    positive: true,
  },
  {
    label: 'This month expense',
    value: formatCurrencyValue(monthExpenses.value),
    helper: `${currentMonthTransactions.value.filter((item) => item.type === 'expense').length} expense entries`,
    icon: 'payments',
    trend: monthIncome.value === 0 ? '0% of income' : `${Math.round((monthExpenses.value / monthIncome.value) * 100)}% of income`,
    positive: false,
  },
  {
    label: 'Net cash flow',
    value: formatCurrencyValue(netFlow.value),
    helper: `${formatCurrencyValue(monthTransfers.value)} moved between accounts`,
    icon: 'monitoring',
    trend: `${savingsRate.value}% savings rate`,
    positive: netFlow.value >= 0,
  },
  {
    label: 'Total balance',
    value: formatCurrencyValue(totalBalance.value),
    helper: `${state.accounts.length} active accounts`,
    icon: 'account_balance_wallet',
    trend: `${formatCurrencyValue(state.settings.monthlySavingsGoal)} target`,
    positive: totalBalance.value >= state.settings.monthlySavingsGoal,
  },
])

const recentTransactions = computed(() =>
  [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((transaction) => ({
      ...transaction,
      accountName: state.accounts.find((account) => account.id === transaction.accountId)?.name ?? 'Unknown account',
      categoryName:
        transaction.type === 'transfer'
          ? `Transfer to ${state.accounts.find((account) => account.id === transaction.transferAccountId)?.name ?? 'another account'}`
          : state.categories.find((category) => category.id === transaction.categoryId)?.name ?? 'Uncategorized',
    })),
)

const budgetHighlights = computed(() =>
  state.budgets.map((budget) => {
    const category = state.categories.find((item) => item.id === budget.categoryId)
    const spent = state.transactions
      .filter(
        (item) =>
          item.type === 'expense' &&
          item.categoryId === budget.categoryId &&
          item.date.startsWith(budget.month),
      )
      .reduce((sum, item) => sum + item.amount, 0)

    const percent = budget.amount === 0 ? 0 : Math.min(100, Math.round((spent / budget.amount) * 100))

    return {
      id: budget.id,
      label: category?.name ?? 'Unknown category',
      spent,
      amount: budget.amount,
      percent,
      over: spent > budget.amount,
    }
  }),
)

const accountCards = computed(() =>
  state.accounts.map((account) => ({
    ...account,
    balance: accountBalance(account.id),
  })),
)
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Money overview"
      title="Personal finance dashboard"
      copy="Track income, expenses, transfers, and budget pressure from a single local-first workspace."
    >
      <template #actions>
        <BaseButton variant="secondary">
          <span class="material-symbols-outlined">download</span>
          <span>Local-first data</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div class="users-grid">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :helper="card.helper"
        :icon="card.icon"
        :trend="card.trend"
        :positive="card.positive"
      />
    </div>

    <div class="content-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Budget watch</h2>
            <p class="panel-copy">See which categories are staying on plan and which ones need attention this month.</p>
          </div>
        </div>

        <div class="budget-list">
          <div v-for="item in budgetHighlights" :key="item.id" class="budget-item">
            <div class="budget-head-row">
              <div>
                <p class="meta-title">{{ item.label }}</p>
                <p class="meta-copy">{{ formatCurrencyValue(item.spent) }} of {{ formatCurrencyValue(item.amount) }}</p>
              </div>
              <span class="badge" :class="item.over ? 'warning' : 'success'">{{ item.percent }}%</span>
            </div>
            <div class="budget-bar-track">
              <div class="budget-bar-fill" :class="item.over ? 'budget-bar-fill-warning' : ''" :style="{ width: `${Math.min(item.percent, 100)}%` }"></div>
            </div>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Recent activity</h2>
            <p class="panel-copy">The latest money movements across your accounts.</p>
          </div>
        </div>

        <div class="activity-list">
          <div v-for="item in recentTransactions" :key="item.id" class="activity-item">
            <div>
              <p class="meta-title">{{ item.note || item.categoryName }}</p>
              <p class="meta-copy">{{ item.accountName }} · {{ item.categoryName }}</p>
            </div>
            <div class="transaction-amount-stack">
              <div class="meta-title" :class="item.type === 'expense' ? 'amount-expense' : 'amount-income'">
                {{ item.type === 'expense' ? '-' : '+' }}{{ formatCurrencyValue(item.amount) }}
              </div>
              <div class="meta-note">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <section class="panel" style="margin-top: 1.5rem">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">Accounts snapshot</h2>
          <p class="panel-copy">Keep an eye on cash, bank, and wallet balances without opening each page.</p>
        </div>
      </div>

      <div class="account-card-grid">
        <article v-for="account in accountCards" :key="account.id" class="card account-balance-card">
          <div class="account-balance-head">
            <div class="account-color-chip" :style="{ background: account.color }"></div>
            <span class="badge primary">{{ account.type.replace('_', ' ') }}</span>
          </div>
          <div class="meta-title" style="margin-top: 0.8rem">{{ account.name }}</div>
          <h3 class="kpi-value" style="margin-top: 0.5rem">{{ formatCurrencyValue(account.balance) }}</h3>
          <p class="stats-card-helper">Opening balance {{ formatCurrencyValue(account.openingBalance) }}</p>
        </article>
      </div>
    </section>
  </section>
</template>
