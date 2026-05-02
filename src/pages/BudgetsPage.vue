<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import PageHeader from '../components/PageHeader.vue'
import { useExpenseTracker } from '../composables/useExpenseTracker'
import type { ExpenseBudget } from '../types/expense'

const { state, upsertBudget, deleteBudget, formatCurrencyValue } = useExpenseTracker()

const currentMonth = new Date().toISOString().slice(0, 7)
const isModalOpen = ref(false)
const editingBudgetId = ref<string | null>(null)
const deleteTarget = ref<ExpenseBudget | null>(null)
const isDeleteModalOpen = ref(false)

const form = reactive({
  categoryId: '',
  month: currentMonth,
  amount: '0',
})

const categoryOptions = computed(() =>
  state.categories
    .filter((item) => item.type === 'expense')
    .map((item) => ({ label: item.name, value: item.id })),
)

const budgetRows = computed(() =>
  state.budgets
    .map((budget) => {
      const category = state.categories.find((item) => item.id === budget.categoryId)
      const spent = state.transactions
        .filter(
          (item) =>
            item.type === 'expense' &&
            item.categoryId === budget.categoryId &&
            item.date.startsWith(budget.month),
        )
        .reduce((sum, item) => sum + item.amount, 0)

      const remaining = budget.amount - spent
      const percent = budget.amount === 0 ? 0 : Math.round((spent / budget.amount) * 100)

      return {
        ...budget,
        categoryName: category?.name ?? 'Unknown category',
        spent,
        remaining,
        percent,
      }
    })
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName)),
)

const resetForm = () => {
  form.categoryId = categoryOptions.value[0]?.value ?? ''
  form.month = currentMonth
  form.amount = '0'
}

resetForm()

const openCreateModal = () => {
  editingBudgetId.value = null
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (budget: ExpenseBudget) => {
  editingBudgetId.value = budget.id
  form.categoryId = budget.categoryId
  form.month = budget.month
  form.amount = String(budget.amount)
  isModalOpen.value = true
}

const saveBudget = () => {
  upsertBudget({
    id: editingBudgetId.value ?? undefined,
    categoryId: form.categoryId,
    month: form.month,
    amount: Number(form.amount),
  })

  isModalOpen.value = false
}

const requestDelete = (budget: ExpenseBudget) => {
  deleteTarget.value = budget
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (!deleteTarget.value) {
    return
  }

  deleteBudget(deleteTarget.value.id)
  deleteTarget.value = null
  isDeleteModalOpen.value = false
}
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Budgets"
      title="Give every expense category a plan"
      copy="Inspired by modern trackers: set monthly limits, monitor progress, and spot overspending before the month is gone."
    >
      <template #actions>
        <BaseButton @click="openCreateModal">
          <span class="material-symbols-outlined">add</span>
          <span>Add budget</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div class="stack-grid">
      <article v-for="budget in budgetRows" :key="budget.id" class="panel">
        <div class="budget-head-row">
          <div>
            <h2 class="panel-title">{{ budget.categoryName }}</h2>
            <p class="panel-copy">{{ budget.month }} · {{ formatCurrencyValue(budget.amount) }} planned</p>
          </div>
          <div class="action-button-row">
            <BaseButton variant="ghost" class="action-pill" @click="openEditModal(budget)">Edit</BaseButton>
            <BaseButton variant="ghost" class="action-pill action-pill-danger" @click="requestDelete(budget)">Delete</BaseButton>
          </div>
        </div>

        <div class="budget-bar-track" style="margin-top: 1rem">
          <div class="budget-bar-fill" :class="budget.remaining < 0 ? 'budget-bar-fill-warning' : ''" :style="{ width: `${Math.min(Math.max(budget.percent, 6), 100)}%` }"></div>
        </div>

        <div class="budget-summary-row">
          <div>
            <div class="meta-title">Spent</div>
            <div class="meta-copy">{{ formatCurrencyValue(budget.spent) }}</div>
          </div>
          <div>
            <div class="meta-title">Remaining</div>
            <div class="meta-copy">{{ formatCurrencyValue(budget.remaining) }}</div>
          </div>
          <div>
            <div class="meta-title">Usage</div>
            <div class="meta-copy">{{ budget.percent }}%</div>
          </div>
        </div>
      </article>
    </div>

    <BaseModal v-model="isModalOpen" :title="editingBudgetId ? 'Edit budget' : 'Add budget'" description="Budgets work across reusable cards, dashboards, and transaction summaries." width="lg">
      <form class="modal-form-grid" @submit.prevent="saveBudget">
        <BaseInput v-model="form.categoryId" label="Expense category" as="select" :options="categoryOptions" />
        <BaseInput v-model="form.month" label="Month" type="month" />
        <BaseInput v-model="form.amount" label="Budget amount" type="number" placeholder="0.00" />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="isModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveBudget">Save budget</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="isDeleteModalOpen" title="Delete budget" description="This removes the monthly budget rule but keeps your transaction history intact.">
      <div class="delete-confirm-copy">
        <span class="material-symbols-outlined">warning</span>
        <p>Delete the budget for <strong>{{ deleteTarget?.month }}</strong>? You can recreate it anytime.</p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteModalOpen = false">Keep it</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
