<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { IColumnDefinition } from '@bhplugin/vue3-datatable'

import AppDataTable from '../components/AppDataTable.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'

type UserStatus = 'Active' | 'Invited' | 'Inactive'
type UserTone = 'success' | 'warning' | 'muted'
type ModalMode = 'create' | 'edit'

type UserRow = {
  id: number
  name: string
  email: string
  role: string
  status: UserStatus
  statusClass: UserTone
  lastActive: string
  attachmentName: string
}

const statusClassMap: Record<UserStatus, UserTone> = {
  Active: 'success',
  Invited: 'warning',
  Inactive: 'muted',
}

const roleOptions = ['Admin', 'Manager', 'Analyst', 'Support']

const rows = ref<UserRow[]>([
  {
    id: 1,
    name: 'Mariam Rahman',
    email: 'mariam@bideshibazar.com',
    role: 'Admin',
    status: 'Active',
    statusClass: 'success',
    lastActive: '2 mins ago',
    attachmentName: 'nda-mariam.pdf',
  },
  {
    id: 2,
    name: 'Hasib Ahmed',
    email: 'hasib@sellerhub.io',
    role: 'Manager',
    status: 'Invited',
    statusClass: 'warning',
    lastActive: 'Pending setup',
    attachmentName: 'offer-letter-hasib.pdf',
  },
  {
    id: 3,
    name: 'Nadia Hasan',
    email: 'nadia@enterprise.co',
    role: 'Analyst',
    status: 'Active',
    statusClass: 'success',
    lastActive: '11 mins ago',
    attachmentName: 'analytics-brief.docx',
  },
  {
    id: 4,
    name: 'Shuvo Das',
    email: 'shuvo@ops.team',
    role: 'Support',
    status: 'Inactive',
    statusClass: 'muted',
    lastActive: 'Yesterday',
    attachmentName: 'offboarding-note.pdf',
  },
  {
    id: 5,
    name: 'Raisa Noor',
    email: 'raisa@growthlab.io',
    role: 'Admin',
    status: 'Active',
    statusClass: 'success',
    lastActive: '5 mins ago',
    attachmentName: 'security-pack.zip',
  },
])

const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const modalMode = ref<ModalMode>('create')
const editingUserId = ref<number | null>(null)
const pendingDeleteUser = ref<UserRow | null>(null)
const search = ref('')
const statusFilter = ref<'All' | UserStatus>('All')
const pageSize = ref(5)
const fileInput = ref<HTMLInputElement | null>(null)
const feedback = reactive({
  tone: 'success' as 'success' | 'danger',
  text: '',
})

const form = reactive({
  name: '',
  email: '',
  role: 'Manager',
  status: 'Invited' as UserStatus,
  attachment: null as File | null,
  existingAttachmentName: '',
})

const columns = ref<IColumnDefinition[]>([
  { field: 'name', title: 'User', sort: true },
  { field: 'role', title: 'Role', sort: true },
  { field: 'status', title: 'Status', sort: true },
  { field: 'lastActive', title: 'Last Active', sort: true },
  { field: 'attachmentName', title: 'Submitted File', sort: true },
  { field: 'actions', title: 'Actions', sort: false, filter: false },
])

const filteredRows = computed(() => {
  if (statusFilter.value === 'All') {
    return rows.value
  }

  return rows.value.filter((row) => row.status === statusFilter.value)
})

const stats = computed(() => {
  const total = rows.value.length
  const active = rows.value.filter((row) => row.status === 'Active').length
  const invited = rows.value.filter((row) => row.status === 'Invited').length
  const inactive = rows.value.filter((row) => row.status === 'Inactive').length
  const retention = total === 0 ? '0%' : `${Math.round((active / total) * 100)}%`

  return [
    { label: 'Total Users', value: String(total), helper: `${active} active right now` },
    { label: 'Active Now', value: String(active), badge: `${retention} retained`, badgeClass: 'success' as const },
    { label: 'Pending Invites', value: String(invited), helper: invited === 1 ? '1 teammate still onboarding' : `${invited} teammates still onboarding` },
    { label: 'Inactive', value: String(inactive), helper: 'Review access and re-engagement' },
  ]
})

const resultsLabel = computed(() => `${filteredRows.value.length} records ready for review`)

const modalTitle = computed(() => (modalMode.value === 'create' ? 'Create team member' : 'Edit team member'))
const modalDescription = computed(() =>
  modalMode.value === 'create'
    ? 'Add a user, attach one onboarding file, and submit it straight into the datatable.'
    : 'Update role, status, or file details without leaving the user-management view.',
)
const submitLabel = computed(() => (modalMode.value === 'create' ? 'Submit User' : 'Save Changes'))
const attachmentLabel = computed(() => form.attachment?.name ?? (form.existingAttachmentName || 'No file selected yet'))
const deleteTargetName = computed(() => pendingDeleteUser.value?.name ?? 'this user')

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.role = 'Manager'
  form.status = 'Invited'
  form.attachment = null
  form.existingAttachmentName = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const clearFeedback = () => {
  feedback.text = ''
}

const openCreateModal = () => {
  clearFeedback()
  modalMode.value = 'create'
  editingUserId.value = null
  resetForm()
  isFormModalOpen.value = true
}

const openEditModal = (user: UserRow) => {
  clearFeedback()
  modalMode.value = 'edit'
  editingUserId.value = user.id
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.status = user.status
  form.attachment = null
  form.existingAttachmentName = user.attachmentName

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  isFormModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
  resetForm()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.attachment = target.files?.[0] ?? null
}

const upsertUser = () => {
  if (!form.name || !form.email) {
    feedback.tone = 'danger'
    feedback.text = 'Please complete the name and email fields before submitting.'
    return
  }

  const nextAttachmentName = form.attachment?.name ?? (form.existingAttachmentName || 'No attachment')

  if (modalMode.value === 'edit' && editingUserId.value !== null) {
    rows.value = rows.value.map((row) =>
      row.id === editingUserId.value
        ? {
            ...row,
            name: form.name,
            email: form.email,
            role: form.role,
            status: form.status,
            statusClass: statusClassMap[form.status],
            lastActive: 'Updated just now',
            attachmentName: nextAttachmentName,
          }
        : row,
    )

    feedback.tone = 'success'
    feedback.text = `${form.name} was updated successfully.`
  } else {
    rows.value = [
      {
        id: Date.now(),
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        statusClass: statusClassMap[form.status],
        lastActive: 'Just now',
        attachmentName: nextAttachmentName,
      },
      ...rows.value,
    ]

    feedback.tone = 'success'
    feedback.text = `${form.name} was added with ${nextAttachmentName}.`
  }

  closeFormModal()
}

const openDeleteModal = (user: UserRow) => {
  clearFeedback()
  pendingDeleteUser.value = user
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  pendingDeleteUser.value = null
}

const deleteUser = () => {
  if (!pendingDeleteUser.value) {
    return
  }

  rows.value = rows.value.filter((row) => row.id !== pendingDeleteUser.value?.id)
  feedback.tone = 'success'
  feedback.text = `${pendingDeleteUser.value.name} was removed from the workspace.`
  closeDeleteModal()
}

const toUserRow = (value: unknown) => value as UserRow

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <div class="eyebrow">Organization</div>
        <h1 class="page-title">User Management</h1>
        <p class="page-copy">Manage team members, access tiers, and activity from a single clean workspace.</p>
      </div>
      <div class="page-actions">
        <BaseButton variant="secondary" @click="statusFilter = 'Invited'">
          <span class="material-symbols-outlined">mark_email_unread</span>
          <span>Review invites</span>
        </BaseButton>
        <BaseButton @click="openCreateModal">
          <span class="material-symbols-outlined">add</span>
          <span>Add User</span>
        </BaseButton>
      </div>
    </div>

    <div v-if="feedback.text" class="inline-alert" :class="feedback.tone === 'success' ? 'inline-alert-success' : 'inline-alert-danger'">
      <span class="material-symbols-outlined">{{ feedback.tone === 'success' ? 'task_alt' : 'error' }}</span>
      <span>{{ feedback.text }}</span>
    </div>

    <div class="users-grid">
      <article v-for="item in stats" :key="item.label" class="card stats-card-polish">
        <div class="kpi-label">{{ item.label }}</div>
        <h2 class="kpi-value" style="margin-top: 0.45rem">{{ item.value }}</h2>
        <span v-if="item.badge" class="badge" :class="item.badgeClass" style="margin-top: 0.6rem">{{ item.badge }}</span>
        <p v-else class="stats-card-helper">{{ item.helper }}</p>
      </article>
    </div>

    <AppDataTable
      :rows="filteredRows"
      :columns="columns"
      :search="search"
      :pageSize="pageSize"
      :resultsLabel="resultsLabel"
      :pageSizeOptions="[5, 10, 20]"
      searchPlaceholder="Search users, roles, or uploaded files..."
      paginationInfo="Showing {0}-{1} of {2} users"
      @update:search="search = $event"
      @update:pageSize="pageSize = $event"
    >
      <template #filters>
        <BaseInput
          v-model="statusFilter"
          label="Status"
          as="select"
          :options="['All', 'Active', 'Invited', 'Inactive']"
        />
      </template>

      <template #name="{ value }">
        <div class="user-cell">
          <div class="user-avatar">{{ initials(toUserRow(value).name) }}</div>
          <div>
            <div class="meta-title">{{ toUserRow(value).name }}</div>
            <div class="meta-copy">{{ toUserRow(value).email }}</div>
          </div>
        </div>
      </template>

      <template #role="{ value }">
        <span class="badge primary">{{ toUserRow(value).role }}</span>
      </template>

      <template #status="{ value }">
        <span class="badge" :class="toUserRow(value).statusClass">{{ toUserRow(value).status }}</span>
      </template>

      <template #attachmentName="{ value }">
        <div class="file-chip">
          <span class="material-symbols-outlined">attach_file</span>
          <span>{{ toUserRow(value).attachmentName }}</span>
        </div>
      </template>

      <template #actions="{ value }">
        <div class="action-button-row">
          <BaseButton variant="ghost" class="action-pill" @click="openEditModal(toUserRow(value))">
            <span class="material-symbols-outlined">edit</span>
            <span>Edit</span>
          </BaseButton>
          <BaseButton variant="ghost" class="action-pill action-pill-danger" @click="openDeleteModal(toUserRow(value))">
            <span class="material-symbols-outlined">delete</span>
            <span>Delete</span>
          </BaseButton>
        </div>
      </template>

      <template #noData>
        <div class="empty-datatable-state">No users matched this view.</div>
      </template>
    </AppDataTable>

    <BaseModal v-model="isFormModalOpen" :title="modalTitle" :description="modalDescription" width="lg">
      <form class="modal-form-grid" @submit.prevent="upsertUser">
        <BaseInput v-model="form.name" label="Full Name" placeholder="Enter full name" />

        <BaseInput v-model="form.email" label="Work Email" type="email" placeholder="name@company.com" />

        <BaseInput v-model="form.role" label="Role" as="select" :options="roleOptions" />

        <BaseInput v-model="form.status" label="Status" as="select" :options="['Invited', 'Active', 'Inactive']" />

        <div class="modal-preview-card">
          <div class="modal-preview-head">
            <div class="user-avatar user-avatar-large">{{ form.name ? initials(form.name) : 'AV' }}</div>
            <div>
              <div class="meta-title">{{ form.name || 'New teammate preview' }}</div>
              <div class="meta-copy">{{ form.email || 'No email provided yet' }}</div>
            </div>
          </div>
          <div class="modal-preview-meta">
            <span class="badge primary">{{ form.role }}</span>
            <span class="badge" :class="statusClassMap[form.status]">{{ form.status }}</span>
          </div>
        </div>

        <label class="field-group" style="grid-column: 1 / -1">
          <span class="field-label">Submit File</span>
          <div class="file-dropzone">
            <div class="file-dropzone-copy">
              <span class="material-symbols-outlined">upload_file</span>
              <div>
                <div class="meta-title">Upload onboarding or approval file</div>
                <div class="meta-copy">PDF, DOCX, ZIP, or image. One file is enough for this demo flow.</div>
              </div>
            </div>
            <input ref="fileInput" class="field" type="file" @change="onFileChange" />
            <div class="file-selected-note">{{ attachmentLabel }}</div>
          </div>
        </label>
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="closeFormModal">Cancel</BaseButton>
        <BaseButton @click="upsertUser">{{ submitLabel }}</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDeleteModalOpen"
      title="Remove team member"
      description="This will remove the user from the visible table in this demo experience."
    >
      <div class="delete-confirm-copy">
        <span class="material-symbols-outlined">warning</span>
        <p>
          Are you sure you want to remove <strong>{{ deleteTargetName }}</strong>? You can always re-add them later if needed.
        </p>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeDeleteModal">Keep user</BaseButton>
        <BaseButton variant="danger" @click="deleteUser">Delete user</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
