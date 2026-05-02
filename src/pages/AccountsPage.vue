<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import PageHeader from '../components/PageHeader.vue'
import { useExpenseTracker } from '../composables/useExpenseTracker'
import type { AccountType, ExpenseAccount } from '../types/expense'

const { state, accountBalance, addAccount, updateAccount, deleteAccount, formatCurrencyValue } = useExpenseTracker()

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<ExpenseAccount | null>(null)

const form = reactive({
  name: '',
  type: 'bank' as AccountType,
  openingBalance: '0',
  color: '#4f46e5',
})

const accountCards = computed(() =>
  state.accounts.map((account) => ({
    ...account,
    balance: accountBalance(account.id),
    transactionCount: state.transactions.filter(
      (item) => item.accountId === account.id || item.transferAccountId === account.id,
    ).length,
  })),
)

const resetForm = () => {
  form.name = ''
  form.type = 'bank'
  form.openingBalance = '0'
  form.color = '#4f46e5'
}

const openCreateModal = () => {
  editingId.value = null
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (account: ExpenseAccount) => {
  editingId.value = account.id
  form.name = account.name
  form.type = account.type
  form.openingBalance = String(account.openingBalance)
  form.color = account.color
  isModalOpen.value = true
}

const saveAccount = () => {
  const payload = {
    name: form.name,
    type: form.type,
    openingBalance: Number(form.openingBalance),
    color: form.color,
  }

  if (editingId.value) {
    updateAccount(editingId.value, payload)
  } else {
    addAccount(payload)
  }

  isModalOpen.value = false
}

const requestDelete = (account: ExpenseAccount) => {
  pendingDelete.value = account
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (!pendingDelete.value) {
    return
  }

  deleteAccount(pendingDelete.value.id)
  pendingDelete.value = null
  isDeleteModalOpen.value = false
}
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Accounts"
      title="Manage where your money lives"
      copy="Set up wallets, bank accounts, and mobile money balances so every transaction has a real home."
    >
      <template #actions>
        <BaseButton @click="openCreateModal">
          <span class="material-symbols-outlined">add</span>
          <span>Add account</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div class="account-card-grid">
      <article v-for="account in accountCards" :key="account.id" class="card account-balance-card">
        <div class="account-balance-head">
          <div class="account-color-chip" :style="{ background: account.color }"></div>
          <span class="badge primary">{{ account.type.replace('_', ' ') }}</span>
        </div>
        <div class="meta-title" style="margin-top: 0.8rem">{{ account.name }}</div>
        <h3 class="kpi-value" style="margin-top: 0.5rem">{{ formatCurrencyValue(account.balance) }}</h3>
        <p class="stats-card-helper">Opening balance {{ formatCurrencyValue(account.openingBalance) }}</p>
        <p class="stats-card-helper">{{ account.transactionCount }} linked transactions</p>
        <div class="action-button-row" style="margin-top: 1rem">
          <BaseButton variant="ghost" class="action-pill" @click="openEditModal(account)">Edit</BaseButton>
          <BaseButton variant="ghost" class="action-pill action-pill-danger" @click="requestDelete(account)">Delete</BaseButton>
        </div>
      </article>
    </div>

    <BaseModal v-model="isModalOpen" :title="editingId ? 'Edit account' : 'Add account'" description="Use shared form primitives so every account setup stays consistent." width="lg">
      <form class="modal-form-grid" @submit.prevent="saveAccount">
        <BaseInput v-model="form.name" label="Account name" placeholder="Main bank account" />
        <BaseInput v-model="form.type" label="Account type" as="select" :options="['cash', 'bank', 'mobile_wallet']" />
        <BaseInput v-model="form.openingBalance" label="Opening balance" type="number" placeholder="0.00" />
        <BaseInput v-model="form.color" label="Accent color" type="color" />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="isModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveAccount">Save account</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="isDeleteModalOpen" title="Delete account" description="Deleting an account also removes its linked transactions in this tracker.">
      <div class="delete-confirm-copy">
        <span class="material-symbols-outlined">warning</span>
        <p>Remove <strong>{{ pendingDelete?.name }}</strong> and all money movements connected to it?</p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteModalOpen = false">Keep it</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
