<script setup lang="ts">
import { computed } from 'vue'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import type { IColumnDefinition } from '@bhplugin/vue3-datatable'

const props = withDefaults(
  defineProps<{
    rows: Array<Record<string, unknown>>
    columns: IColumnDefinition[]
    search: string
    pageSize: number
    resultsLabel: string
    searchPlaceholder?: string
    pageSizeOptions?: number[]
    skin?: string
    noDataText?: string
    paginationInfo?: string
  }>(),
  {
    searchPlaceholder: 'Search table data...',
    pageSizeOptions: () => [5, 10, 20],
    skin: 'bh-table-hover bh-table-striped',
    noDataText: 'No data found.',
    paginationInfo: 'Showing {0}-{1} of {2} rows',
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:pageSize': [value: number]
}>()

const slotColumns = computed(() => props.columns.filter((column) => typeof column.field === 'string' && column.field.length > 0))

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value: number) => emit('update:pageSize', Number(value)),
})
</script>

<template>
  <section class="panel user-table-wrap">
    <div class="table-toolbar table-toolbar-stack">
      <div class="table-tools-left table-tools-grow">
        <div class="search-box search-box-wide">
          <span class="material-symbols-outlined">search</span>
          <input v-model="searchModel" class="search-input" :placeholder="searchPlaceholder" />
        </div>

        <slot name="filters" />
      </div>

      <div class="table-tools-right datatable-meta-row">
        <span class="table-note">{{ resultsLabel }}</span>
        <label class="datatable-filter-field datatable-page-size-field">
          <span class="field-label">Rows</span>
          <select v-model="pageSizeModel" class="select">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </label>
      </div>
    </div>

    <div class="datatable-shell">
      <Vue3Datatable
        :rows="rows"
        :columns="columns"
        :search="search"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        :sortable="true"
        :showPageSize="false"
        :showFirstPage="false"
        :showLastPage="false"
        :paginationInfo="paginationInfo"
        :skin="skin"
      >
        <template v-for="column in slotColumns" :key="column.field" #[column.field]="slotProps">
          <slot :name="column.field as string" v-bind="slotProps">
            {{ slotProps.value?.[column.field as string] }}
          </slot>
        </template>

        <template #noData>
          <slot name="noData">
            <div class="empty-datatable-state">{{ noDataText }}</div>
          </slot>
        </template>
      </Vue3Datatable>
    </div>
  </section>
</template>
