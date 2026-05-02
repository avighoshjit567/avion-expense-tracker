export type TransactionType = 'income' | 'expense' | 'transfer'
export type CategoryType = 'income' | 'expense'
export type AccountType = 'cash' | 'bank' | 'mobile_wallet'

export type ExpenseAccount = {
  id: string
  name: string
  type: AccountType
  openingBalance: number
  color: string
}

export type ExpenseCategory = {
  id: string
  name: string
  type: CategoryType
  icon: string
  color: string
}

export type ExpenseTransaction = {
  id: string
  type: TransactionType
  accountId: string
  transferAccountId?: string | null
  categoryId?: string | null
  amount: number
  date: string
  note: string
  createdAt: string
}

export type ExpenseBudget = {
  id: string
  categoryId: string
  month: string
  amount: number
}

export type ExpenseSettings = {
  currency: string
  currencySymbol: string
  monthlyIncomeGoal: number
  monthlySavingsGoal: number
}

export type ExpenseTrackerState = {
  settings: ExpenseSettings
  accounts: ExpenseAccount[]
  categories: ExpenseCategory[]
  transactions: ExpenseTransaction[]
  budgets: ExpenseBudget[]
  lastUpdatedAt: string
}
