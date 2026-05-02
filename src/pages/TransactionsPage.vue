<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { IColumnDefinition } from '@bhplugin/vue3-datatable'

import AppDataTable from '../components/AppDataTable.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import PageHeader from '../components/PageHeader.vue'
import { useExpenseTracker } from '../composables/useExpenseTracker'
import type { ExpenseTransaction, TransactionType } from '../types/expense'

const { state, addTransaction, updateTransaction, deleteTransaction, formatCurrencyValue } = useExpenseTracker()

const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const search = ref('')
const pageSize = ref(10)
const typeFilter = ref<'All' | TransactionType>('All')
const editingId = ref<string | null>(null)
const feedback = ref('')
const pendingDelete = ref<ExpenseTransaction | null>(null)

const form = reactive({
  type: 'expense' as TransactionType,
  amount: '0',
  date: new Date().toISOString().slice(0, 10),
  accountId: '',
  transferAccountId: '',
  categoryId: '',
  note: '',
})

const columns = ref<IColumnDefinition[]>([
  { field: 'date', title: 'Date', sort: true },
  { field: 'type', title: 'Type', sort: true },
  { field: 'account', title: 'Account', sort: true },
  { field: 'category', title: 'Category', sort: true },
  { field: 'amount', title: 'Amount', sort: true },
  { field: 'note', title: 'Note', sort: true },
  { field: 'actions', title: 'Actions', sort: false, filter: false },
])

const accountOptions = computed(() => state.accounts.map((item) => ({ label: item.name, value: item.id })))
const categoryOptions = computed(() =>
  state.categories
    .filter((item) => item.type === (form.type === 'income' ? 'income' : 'expense'))
    .map((item) => ({ label: item.name, value: item.id })),
)

const mappedRows = computed(() =>
  [...state.transactions]
    .filter((item) => (typeFilter.value === 'All' ? true : item.type === typeFilter.value))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => ({
      id: item.id,
      raw: item,
      date: item.date,
      type: item.type,
      account: state.accounts.find((account) => account.id === item.accountId)?.name ?? 'Unknown account',
      category:
        item.type === 'transfer'
          ? `Transfer to ${state.accounts.find((account) => account.id === item.transferAccountId)?.name ?? 'another account'}`
          : state.categories.find((category) => category.id === item.categoryId)?.name ?? 'Uncategorized',
      amount: item.amount,
      amountLabel: formatCurrencyValue(item.amount),
      note: item.note || 'No note',
    })),
)

const resultsLabel = computed(() => `${mappedRows.value.length} transactions in view`)

const resetForm = () => {
  form.type = 'expense'
  form.amount = '0'
  form.date = new Date().toISOString().slice(0, 10)
  form.accountId = state.accounts[0]?.id ?? ''
  form.transferAccountId = state.accounts[1]?.id ?? state.accounts[0]?.id ?? ''
  form.categoryId = state.categories.find((item) => item.type === 'expense')?.id ?? ''
  form.note = ''
}

resetForm()

const openCreateModal = () => {
  editingId.value = null
  feedback.value = ''
  resetForm()
  isFormModalOpen.value = true
}

const openEditModal = (transaction: ExpenseTransaction) => {
  editingId.value = transaction.id
  feedback.value = ''
  form.type = transaction.type
  form.amount = String(transaction.amount)
  form.date = transaction.date
  form.accountId = transaction.accountId
  form.transferAccountId = transaction.transferAccountId ?? ''
  form.categoryId = transaction.categoryId ?? ''
  form.note = transaction.note
  isFormModalOpen.value = true
}

const saveTransaction = () => {
  const amount = Number(form.amount)
  if (!form.accountId || Number.isNaN(amount) || amount <= 0) {
    feedback.value = 'Please choose an account and a valid amount.'
    return
  }

  const payload = {
    type: form.type,
    amount,
    date: form.date,
    accountId: form.accountId,
    transferAccountId: form.type === 'transfer' ? form.transferAccountId : null,
    categoryId: form.type === 'transfer' ? null : form.categoryId,
    note: form.note,
  }

  if (editingId.value) {
    updateTransaction(editingId.value, payload)
  } else {
    addTransaction(payload)
  }

  isFormModalOpen.value = false
}

const requestDelete = (transaction: ExpenseTransaction) => {
  pendingDelete.value = transaction
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (!pendingDelete.value) {
    return
  }

  deleteTransaction(pendingDelete.value.id)
  pendingDelete.value = null
  isDeleteModalOpen.value = false
}

const currentTransactionLabel = computed(() => (editingId.value ? 'Edit transaction' : 'Add transaction'))
const modalDescription = computed(() =>
  editingId.value
    ? 'Update the amount, category, or destination account for this money movement.'
    : 'Capture income, expenses, or transfers without leaving the tracker.',
)
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Transactions"
      title="Capture every money movement"
      copy="Track income, expenses, and transfers in one reusable table powered by the shared component layer."
    >
      <template #actions>
        <BaseButton @click="openCreateModal">
          <span class="material-symbols-outlined">add</span>
          <span>Add transaction</span>
        </BaseButton>
      </template>
    </PageHeader>

    <AppDataTable
      :rows="mappedRows"
      :columns="columns"
      :search="search"
      :pageSize="pageSize"
      :resultsLabel="resultsLabel"
      :pageSizeOptions="[10, 20, 50]"
      searchPlaceholder="Search notes, accounts, or categories..."
      paginationInfo="Showing {0}-{1} of {2} transactions"
      @update:search="search = $event"
      @update:pageSize="pageSize = $event"
    >
      <template #filters>
        <BaseInput v-model="typeFilter" label="Type" as="select" :options="['All', 'income', 'expense', 'transfer']" />
      </template>

      <template #type="{ value }">
        <span class="badge" :class="value.type === 'income' ? 'success' : value.type === 'expense' ? 'warning' : 'primary'">
          {{ value.type }}
        </span>
      </template>

      <template #amount="{ value }">
        <div :class="value.type === 'expense' ? 'amount-expense' : 'amount-income'">
          {{ value.type === 'expense' ? '-' : '+' }}{{ value.amountLabel }}
        </div>
      </template>

      <template #actions="{ value }">
        <div class="action-button-row">
          <BaseButton variant="ghost" class="action-pill" @click="openEditModal(value.raw)">
            <span class="material-symbols-outlined">edit</span>
            <span>Edit</span>
          </BaseButton>
          <BaseButton variant="ghost" class="action-pill action-pill-danger" @click="requestDelete(value.raw)">
            <span class="material-symbols-outlined">delete</span>
            <span>Delete</span>
          </BaseButton>
        </div>
      </template>
    </AppDataTable>

    <BaseModal v-model="isFormModalOpen" :title="currentTransactionLabel" :description="modalDescription" width="lg">
      <div v-if="feedback" class="inline-alert inline-alert-danger" style="margin-top: 0; margin-bottom: 1rem">
        <span class="material-symbols-outlined">error</span>
        <span>{{ feedback }}</span>
      </div>

      <form class="modal-form-grid" @submit.prevent="saveTransaction">
        <BaseInput v-model="form.type" label="Transaction type" as="select" :options="['income', 'expense', 'transfer']" />
        <BaseInput v-model="form.amount" label="Amount" type="number" placeholder="0.00" />
        <BaseInput v-model="form.date" label="Date" type="date" />
        <BaseInput v-model="form.accountId" label="Account" as="select" :options="accountOptions" />

        <BaseInput
          v-if="form.type === 'transfer'"
          v-model="form.transferAccountId"
          label="Destination account"
          as="select"
          :options="accountOptions.filter((item) => item.value !== form.accountId)"
          full-width
        />

        <BaseInput
          v-else
          v-model="form.categoryId"
          label="Category"
          as="select"
          :options="categoryOptions"
          full-width
        />

        <BaseInput v-model="form.note" label="Note" as="textarea" full-width placeholder="Salary payout, coffee, transfer to wallet..." />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="isFormModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveTransaction">Save transaction</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="isDeleteModalOpen" title="Delete transaction" description="This will permanently remove the selected transaction from the tracker.">
      <div class="delete-confirm-copy">
        <span class="material-symbols-outlined">warning</span>
        <p>Delete this transaction? This action updates totals, account balances, and budget progress immediately.</p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteModalOpen = false">Keep it</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
