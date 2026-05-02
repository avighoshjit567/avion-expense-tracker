<script setup lang="ts">
import { reactive, ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import PageHeader from '../components/PageHeader.vue'
import { useExpenseTracker } from '../composables/useExpenseTracker'
import { decryptBackup, encryptBackup } from '../utils/secureBackup'

const { state, exportState, importState, resetDemoData } = useExpenseTracker()

const status = reactive({
  tone: 'success' as 'success' | 'danger',
  text: '',
})

const settingsModel = reactive({
  currency: state.settings.currency,
  currencySymbol: state.settings.currencySymbol,
  monthlyIncomeGoal: String(state.settings.monthlyIncomeGoal),
  monthlySavingsGoal: String(state.settings.monthlySavingsGoal),
})

const backupModel = reactive({
  exportPassphrase: '',
  exportConfirmPassphrase: '',
  importPassphrase: '',
})

const importFile = ref<File | null>(null)

const syncSettingsModel = () => {
  settingsModel.currency = state.settings.currency
  settingsModel.currencySymbol = state.settings.currencySymbol
  settingsModel.monthlyIncomeGoal = String(state.settings.monthlyIncomeGoal)
  settingsModel.monthlySavingsGoal = String(state.settings.monthlySavingsGoal)
}

const setStatus = (tone: 'success' | 'danger', text: string) => {
  status.tone = tone
  status.text = text
}

const saveSettings = () => {
  state.settings.currency = settingsModel.currency
  state.settings.currencySymbol = settingsModel.currencySymbol
  state.settings.monthlyIncomeGoal = Number(settingsModel.monthlyIncomeGoal)
  state.settings.monthlySavingsGoal = Number(settingsModel.monthlySavingsGoal)
  setStatus('success', 'Settings saved locally on this device.')
}

const downloadEncryptedBackup = async () => {
  if (backupModel.exportPassphrase.length < 8) {
    setStatus('danger', 'Use at least 8 characters for the backup passphrase.')
    return
  }

  if (backupModel.exportPassphrase !== backupModel.exportConfirmPassphrase) {
    setStatus('danger', 'The export passphrases do not match.')
    return
  }

  const encryptedPayload = await encryptBackup(exportState(), backupModel.exportPassphrase)
  const blob = new Blob([JSON.stringify(encryptedPayload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `avion-expense-tracker-${new Date().toISOString().slice(0, 10)}.aetbackup`
  anchor.click()
  URL.revokeObjectURL(url)

  backupModel.exportPassphrase = ''
  backupModel.exportConfirmPassphrase = ''
  setStatus('success', 'Encrypted backup exported. Keep the passphrase safe, it cannot be recovered later.')
}

const onImportFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  importFile.value = target.files?.[0] ?? null
}

const importEncryptedBackup = async () => {
  if (!importFile.value) {
    setStatus('danger', 'Choose an encrypted backup file first.')
    return
  }

  if (backupModel.importPassphrase.length < 8) {
    setStatus('danger', 'Enter the backup passphrase to decrypt your file.')
    return
  }

  try {
    const encryptedText = await importFile.value.text()
    const plainText = await decryptBackup(encryptedText, backupModel.importPassphrase)
    importState(plainText)
    syncSettingsModel()
    backupModel.importPassphrase = ''
    importFile.value = null
    setStatus('success', 'Encrypted backup imported successfully.')
  } catch {
    setStatus('danger', 'Could not decrypt the backup. Check the passphrase and file, then try again.')
  }
}
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Settings & backups"
      title="Keep your tracker private and recoverable"
      copy="This tracker stays local-first, but encrypted backup files protect you from accidental browser data loss."
    >
      <template #actions>
        <BaseButton variant="secondary" @click="downloadEncryptedBackup">
          <span class="material-symbols-outlined">encrypted</span>
          <span>Export encrypted backup</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="status.text" class="inline-alert" :class="status.tone === 'success' ? 'inline-alert-success' : 'inline-alert-danger'">
      <span class="material-symbols-outlined">{{ status.tone === 'success' ? 'task_alt' : 'error' }}</span>
      <span>{{ status.text }}</span>
    </div>

    <div class="settings-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Money preferences</h2>
            <p class="panel-copy">Set the currency and monthly targets used across cards, budgets, and reports.</p>
          </div>
        </div>

        <div class="form-grid">
          <BaseInput v-model="settingsModel.currency" label="Currency code" placeholder="USD" />
          <BaseInput v-model="settingsModel.currencySymbol" label="Currency symbol" placeholder="$" />
          <BaseInput v-model="settingsModel.monthlyIncomeGoal" label="Monthly income goal" type="number" full-width />
          <BaseInput v-model="settingsModel.monthlySavingsGoal" label="Monthly savings target" type="number" full-width />
        </div>

        <div class="page-actions" style="margin-top: 1.25rem">
          <BaseButton @click="saveSettings">Save settings</BaseButton>
        </div>
      </article>

      <div class="stack-grid">
        <article class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Encrypted backup vault</h2>
              <p class="panel-copy">Export your full tracker state into an encrypted file and restore it later with the same passphrase.</p>
            </div>
          </div>

          <div class="stack-grid backup-flow-grid">
            <section class="backup-card">
              <div>
                <p class="meta-title">Create encrypted backup</p>
                <p class="meta-copy">Use a strong passphrase. Without it, the backup cannot be restored.</p>
              </div>

              <div class="form-grid">
                <BaseInput
                  v-model="backupModel.exportPassphrase"
                  label="Backup passphrase"
                  type="password"
                  full-width
                  placeholder="At least 8 characters"
                />
                <BaseInput
                  v-model="backupModel.exportConfirmPassphrase"
                  label="Confirm passphrase"
                  type="password"
                  full-width
                  placeholder="Re-enter your passphrase"
                />
              </div>

              <BaseButton @click="downloadEncryptedBackup">Download encrypted backup</BaseButton>
            </section>

            <section class="backup-card">
              <div>
                <p class="meta-title">Import encrypted backup</p>
                <p class="meta-copy">Choose your `.aetbackup` file and enter the same passphrase used during export.</p>
              </div>

              <input class="field settings-file-input settings-file-input-wide" type="file" accept=".aetbackup,application/json" @change="onImportFileChange" />
              <BaseInput
                v-model="backupModel.importPassphrase"
                label="Backup passphrase"
                type="password"
                full-width
                placeholder="Enter the file passphrase"
              />
              <BaseButton variant="secondary" @click="importEncryptedBackup">Import encrypted backup</BaseButton>
            </section>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Reset demo data</h2>
              <p class="panel-copy">Quickly get back to a clean sample workspace for testing or screenshots.</p>
            </div>
          </div>

          <BaseButton variant="danger" @click="resetDemoData">Reset tracker</BaseButton>
        </article>
      </div>
    </div>
  </section>
</template>
