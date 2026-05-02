import { computed, reactive, watch } from 'vue'

import type {
  ExpenseAccount,
  ExpenseBudget,
  ExpenseCategory,
  ExpenseSettings,
  ExpenseTrackerState,
  ExpenseTransaction,
} from '../types/expense'

const STORAGE_KEY = 'avion-expense-tracker-state'

const now = new Date()
const thisMonth = now.toISOString().slice(0, 7)
const today = now.toISOString().slice(0, 10)

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const seedSettings = (): ExpenseSettings => ({
  currency: 'USD',
  currencySymbol: '$',
  monthlyIncomeGoal: 4200,
  monthlySavingsGoal: 1200,
})

const seedAccounts = (): ExpenseAccount[] => [
  { id: createId(), name: 'Cash Wallet', type: 'cash', openingBalance: 180, color: '#f97316' },
  { id: createId(), name: 'City Bank', type: 'bank', openingBalance: 2450, color: '#4f46e5' },
  { id: createId(), name: 'bKash', type: 'mobile_wallet', openingBalance: 320, color: '#0f766e' },
]

const seedCategories = (): ExpenseCategory[] => [
  { id: createId(), name: 'Salary', type: 'income', icon: 'payments', color: '#4f46e5' },
  { id: createId(), name: 'Freelance', type: 'income', icon: 'laptop_mac', color: '#0f766e' },
  { id: createId(), name: 'Groceries', type: 'expense', icon: 'shopping_cart', color: '#16a34a' },
  { id: createId(), name: 'Transport', type: 'expense', icon: 'directions_car', color: '#f59e0b' },
  { id: createId(), name: 'Rent', type: 'expense', icon: 'home', color: '#dc2626' },
  { id: createId(), name: 'Dining', type: 'expense', icon: 'restaurant', color: '#f97316' },
  { id: createId(), name: 'Bills', type: 'expense', icon: 'receipt_long', color: '#0284c7' },
  { id: createId(), name: 'Subscriptions', type: 'expense', icon: 'subscriptions', color: '#7c3aed' },
]

const buildSeedState = (): ExpenseTrackerState => {
  const settings = seedSettings()
  const accounts = seedAccounts()
  const categories = seedCategories()

  const salary = categories.find((item) => item.name === 'Salary')!
  const freelance = categories.find((item) => item.name === 'Freelance')!
  const groceries = categories.find((item) => item.name === 'Groceries')!
  const transport = categories.find((item) => item.name === 'Transport')!
  const rent = categories.find((item) => item.name === 'Rent')!
  const dining = categories.find((item) => item.name === 'Dining')!
  const bills = categories.find((item) => item.name === 'Bills')!
  const subscriptions = categories.find((item) => item.name === 'Subscriptions')!

  const bank = accounts.find((item) => item.name === 'City Bank')!
  const wallet = accounts.find((item) => item.name === 'Cash Wallet')!
  const mobileWallet = accounts.find((item) => item.name === 'bKash')!

  const transactions: ExpenseTransaction[] = [
    { id: createId(), type: 'income', accountId: bank.id, categoryId: salary.id, amount: 3500, date: `${thisMonth}-01`, note: 'Monthly salary', createdAt: new Date().toISOString() },
    { id: createId(), type: 'income', accountId: bank.id, categoryId: freelance.id, amount: 620, date: `${thisMonth}-07`, note: 'Landing page project', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: bank.id, categoryId: rent.id, amount: 950, date: `${thisMonth}-03`, note: 'Apartment rent', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: wallet.id, categoryId: groceries.id, amount: 86, date: `${thisMonth}-05`, note: 'Weekly groceries', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: mobileWallet.id, categoryId: transport.id, amount: 42, date: `${thisMonth}-08`, note: 'Ride sharing', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: bank.id, categoryId: bills.id, amount: 120, date: `${thisMonth}-10`, note: 'Electricity and internet', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: wallet.id, categoryId: dining.id, amount: 34, date: `${thisMonth}-12`, note: 'Coffee and lunch', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: mobileWallet.id, categoryId: subscriptions.id, amount: 18, date: `${thisMonth}-14`, note: 'Streaming services', createdAt: new Date().toISOString() },
    { id: createId(), type: 'transfer', accountId: bank.id, transferAccountId: wallet.id, amount: 150, date: `${thisMonth}-15`, note: 'Cash withdrawal', createdAt: new Date().toISOString() },
    { id: createId(), type: 'expense', accountId: wallet.id, categoryId: groceries.id, amount: 57, date: today, note: 'Fresh produce and snacks', createdAt: new Date().toISOString() },
  ]

  const budgets: ExpenseBudget[] = [
    { id: createId(), categoryId: groceries.id, month: thisMonth, amount: 360 },
    { id: createId(), categoryId: transport.id, month: thisMonth, amount: 120 },
    { id: createId(), categoryId: dining.id, month: thisMonth, amount: 180 },
    { id: createId(), categoryId: subscriptions.id, month: thisMonth, amount: 40 },
    { id: createId(), categoryId: bills.id, month: thisMonth, amount: 180 },
  ]

  return {
    settings,
    accounts,
    categories,
    transactions,
    budgets,
    lastUpdatedAt: new Date().toISOString(),
  }
}

const readState = (): ExpenseTrackerState => {
  if (typeof window === 'undefined') {
    return buildSeedState()
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return buildSeedState()
  }

  try {
    return JSON.parse(stored) as ExpenseTrackerState
  } catch {
    return buildSeedState()
  }
}

const state = reactive<ExpenseTrackerState>(readState())
let watching = false

const persist = () => {
  state.lastUpdatedAt = new Date().toISOString()
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

const ensureWatch = () => {
  if (watching) {
    return
  }

  watch(
    () => state,
    () => {
      persist()
    },
    { deep: true },
  )

  watching = true
}

const formatCurrencyValue = (value: number) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: state.settings.currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${state.settings.currencySymbol}${value.toFixed(2)}`
  }
}

const replaceState = (next: ExpenseTrackerState) => {
  state.settings = next.settings
  state.accounts = next.accounts
  state.categories = next.categories
  state.transactions = next.transactions
  state.budgets = next.budgets
  state.lastUpdatedAt = new Date().toISOString()
  persist()
}

const accountBalance = (accountId: string) => {
  const account = state.accounts.find((item) => item.id === accountId)
  if (!account) {
    return 0
  }

  let balance = account.openingBalance

  for (const transaction of state.transactions) {
    if (transaction.type === 'income' && transaction.accountId === accountId) {
      balance += transaction.amount
    }

    if (transaction.type === 'expense' && transaction.accountId === accountId) {
      balance -= transaction.amount
    }

    if (transaction.type === 'transfer') {
      if (transaction.accountId === accountId) {
        balance -= transaction.amount
      }

      if (transaction.transferAccountId === accountId) {
        balance += transaction.amount
      }
    }
  }

  return balance
}

export const useExpenseTracker = () => {
  ensureWatch()

  const addAccount = (payload: Omit<ExpenseAccount, 'id'>) => {
    state.accounts.unshift({ ...payload, id: createId() })
  }

  const updateAccount = (accountId: string, payload: Omit<ExpenseAccount, 'id'>) => {
    state.accounts = state.accounts.map((item) => (item.id === accountId ? { ...payload, id: accountId } : item))
  }

  const deleteAccount = (accountId: string) => {
    state.accounts = state.accounts.filter((item) => item.id !== accountId)
    state.transactions = state.transactions.filter(
      (item) => item.accountId !== accountId && item.transferAccountId !== accountId,
    )
  }

  const addCategory = (payload: Omit<ExpenseCategory, 'id'>) => {
    state.categories.unshift({ ...payload, id: createId() })
  }

  const updateCategory = (categoryId: string, payload: Omit<ExpenseCategory, 'id'>) => {
    state.categories = state.categories.map((item) => (item.id === categoryId ? { ...payload, id: categoryId } : item))
  }

  const deleteCategory = (categoryId: string) => {
    state.categories = state.categories.filter((item) => item.id !== categoryId)
    state.transactions = state.transactions.map((item) =>
      item.categoryId === categoryId ? { ...item, categoryId: null } : item,
    )
    state.budgets = state.budgets.filter((item) => item.categoryId !== categoryId)
  }

  const addTransaction = (payload: Omit<ExpenseTransaction, 'id' | 'createdAt'>) => {
    state.transactions.unshift({
      ...payload,
      id: createId(),
      createdAt: new Date().toISOString(),
    })
  }

  const updateTransaction = (transactionId: string, payload: Omit<ExpenseTransaction, 'id' | 'createdAt'>) => {
    state.transactions = state.transactions.map((item) =>
      item.id === transactionId
        ? {
            ...item,
            ...payload,
          }
        : item,
    )
  }

  const deleteTransaction = (transactionId: string) => {
    state.transactions = state.transactions.filter((item) => item.id !== transactionId)
  }

  const upsertBudget = (payload: Omit<ExpenseBudget, 'id'> & { id?: string }) => {
    if (payload.id) {
      state.budgets = state.budgets.map((item) => (item.id === payload.id ? { id: payload.id, categoryId: payload.categoryId, month: payload.month, amount: payload.amount } : item))
      return
    }

    state.budgets.unshift({ id: createId(), categoryId: payload.categoryId, month: payload.month, amount: payload.amount })
  }

  const deleteBudget = (budgetId: string) => {
    state.budgets = state.budgets.filter((item) => item.id !== budgetId)
  }

  const exportState = () => JSON.stringify(clone(state), null, 2)

  const importState = (payload: string) => {
    const parsed = JSON.parse(payload) as ExpenseTrackerState
    replaceState(parsed)
  }

  const resetDemoData = () => {
    replaceState(buildSeedState())
  }

  const totalBalance = computed(() => state.accounts.reduce((sum, account) => sum + accountBalance(account.id), 0))

  return {
    state,
    formatCurrencyValue,
    accountBalance,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    upsertBudget,
    deleteBudget,
    exportState,
    importState,
    resetDemoData,
    totalBalance,
  }
}
