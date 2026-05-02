<script setup lang="ts">
import { reactive, ref } from 'vue'

import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import PageHeader from '../components/PageHeader.vue'
import { useExpenseTracker } from '../composables/useExpenseTracker'

const { state, exportState, importState, resetDemoData } = useExpenseTracker()
const importMessage = ref('')

const settingsModel = reactive({
  currency: state.settings.currency,
  currencySymbol: state.settings.currencySymbol,
  monthlyIncomeGoal: String(state.settings.monthlyIncomeGoal),
  monthlySavingsGoal: String(state.settings.monthlySavingsGoal),
})

const saveSettings = () => {
  state.settings.currency = settingsModel.currency
  state.settings.currencySymbol = settingsModel.currencySymbol
  state.settings.monthlyIncomeGoal = Number(settingsModel.monthlyIncomeGoal)
  state.settings.monthlySavingsGoal = Number(settingsModel.monthlySavingsGoal)
  importMessage.value = 'Settings saved locally on this device.'
}

const downloadExport = () => {
  const blob = new Blob([exportState()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `avion-expense-tracker-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

const onImportFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  const text = await file.text()
  importState(text)
  settingsModel.currency = state.settings.currency
  settingsModel.currencySymbol = state.settings.currencySymbol
  settingsModel.monthlyIncomeGoal = String(state.settings.monthlyIncomeGoal)
  settingsModel.monthlySavingsGoal = String(state.settings.monthlySavingsGoal)
  importMessage.value = 'Backup imported successfully.'
}
</script>

<template>
  <section>
    <PageHeader
      eyebrow="Settings & backups"
      title="Keep your tracker under control"
      copy="Because this app is local-first, you can export backups, import them later, and reset the demo data whenever you want."
    >
      <template #actions>
        <BaseButton variant="secondary" @click="downloadExport">
          <span class="material-symbols-outlined">download</span>
          <span>Export JSON</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="importMessage" class="inline-alert inline-alert-success">
      <span class="material-symbols-outlined">task_alt</span>
      <span>{{ importMessage }}</span>
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
              <h2 class="panel-title">Backups</h2>
              <p class="panel-copy">Export your full data state or import a backup file later.</p>
            </div>
          </div>

          <div class="settings-list">
            <div class="setting-item">
              <div>
                <p class="meta-title">Download JSON backup</p>
                <p class="meta-copy">Everything is saved in one portable file.</p>
              </div>
              <BaseButton variant="secondary" @click="downloadExport">Export</BaseButton>
            </div>
            <div class="setting-item">
              <div>
                <p class="meta-title">Import from backup</p>
                <p class="meta-copy">Restore categories, accounts, budgets, and transactions.</p>
              </div>
              <input class="field settings-file-input" type="file" accept="application/json" @change="onImportFile" />
            </div>
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
