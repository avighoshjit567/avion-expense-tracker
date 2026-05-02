<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import PageHeader from '../components/PageHeader.vue'
import { useExpenseTracker } from '../composables/useExpenseTracker'
import type { CategoryType, ExpenseCategory } from '../types/expense'

const { state, addCategory, updateCategory, deleteCategory } = useExpenseTracker()

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingId = ref<string | null>(null)
const pendingDelete = ref<ExpenseCategory | null>(null)

const form = reactive({
  name: '',
  type: 'expense' as CategoryType,
  icon: 'sell',
  color: '#4f46e5',
})

const groupedCategories = computed(() => ({
  income: state.categories.filter((item) => item.type === 'income'),
  expense: state.categories.filter((item) => item.type === 'expense'),
}))

const resetForm = () => {
  form.name = ''
  form.type = 'expense'
  form.icon = 'sell'
  form.color = '#4f46e5'
}

const openCreateModal = () => {
  editingId.value = null
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (category: ExpenseCategory) => {
  editingId.value = category.id
  form.name = category.name
  form.type = category.type
  form.icon = category.icon
  form.color = category.color
  isModalOpen.value = true
}

const saveCategory = () => {
  const payload = {
    name: form.name,
    type: form.type,
    icon: form.icon,
    color: form.color,
  }

  if (editingId.value) {
    updateCategory(editingId.value, payload)
  } else {
    addCategory(payload)
  }

  isModalOpen.value = false
}

const requestDelete = (category: ExpenseCategory) => {
  pendingDelete.value = category
  isDeleteModalOpen.value = true
}

const confirmDelete = () => {
  if (!pendingDelete.value) {
    return
  }

  deleteCategory(pendingDelete.value.id)
  pendingDelete.value = null
  isDeleteModalOpen.value = false
}
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Categories"
      title="Keep spending and income organized"
      copy="Use reusable component patterns to manage labels that power every chart, budget, and summary card."
    >
      <template #actions>
        <BaseButton @click="openCreateModal">
          <span class="material-symbols-outlined">add</span>
          <span>Add category</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div class="settings-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Expense categories</h2>
            <p class="panel-copy">Everyday costs, essentials, and habits that shape your monthly cash flow.</p>
          </div>
        </div>

        <div class="category-grid">
          <div v-for="category in groupedCategories.expense" :key="category.id" class="category-card">
            <div class="category-icon" :style="{ background: category.color }">
              <span class="material-symbols-outlined">{{ category.icon }}</span>
            </div>
            <div>
              <p class="meta-title">{{ category.name }}</p>
              <p class="meta-copy">Expense category</p>
            </div>
            <div class="action-button-row">
              <BaseButton variant="ghost" class="action-pill" @click="openEditModal(category)">Edit</BaseButton>
              <BaseButton variant="ghost" class="action-pill action-pill-danger" @click="requestDelete(category)">Delete</BaseButton>
            </div>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Income categories</h2>
            <p class="panel-copy">Track where money is coming from so earning patterns stay visible.</p>
          </div>
        </div>

        <div class="category-grid">
          <div v-for="category in groupedCategories.income" :key="category.id" class="category-card">
            <div class="category-icon" :style="{ background: category.color }">
              <span class="material-symbols-outlined">{{ category.icon }}</span>
            </div>
            <div>
              <p class="meta-title">{{ category.name }}</p>
              <p class="meta-copy">Income category</p>
            </div>
            <div class="action-button-row">
              <BaseButton variant="ghost" class="action-pill" @click="openEditModal(category)">Edit</BaseButton>
              <BaseButton variant="ghost" class="action-pill action-pill-danger" @click="requestDelete(category)">Delete</BaseButton>
            </div>
          </div>
        </div>
      </article>
    </div>

    <BaseModal v-model="isModalOpen" :title="editingId ? 'Edit category' : 'Add category'" description="These shared categories drive filters, budgets, tables, and dashboard summaries." width="lg">
      <form class="modal-form-grid" @submit.prevent="saveCategory">
        <BaseInput v-model="form.name" label="Category name" placeholder="Groceries" />
        <BaseInput v-model="form.type" label="Category type" as="select" :options="['income', 'expense']" />
        <BaseInput v-model="form.icon" label="Material icon" placeholder="payments" />
        <BaseInput v-model="form.color" label="Accent color" type="color" />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="isModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveCategory">Save category</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="isDeleteModalOpen" title="Delete category" description="Deleting a category keeps existing transactions but moves them to uncategorized.">
      <div class="delete-confirm-copy">
        <span class="material-symbols-outlined">warning</span>
        <p>Delete <strong>{{ pendingDelete?.name }}</strong>? Budget entries using it will also be removed.</p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteModalOpen = false">Keep it</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
