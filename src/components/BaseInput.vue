<script setup lang="ts">
import { computed } from 'vue'

type InputOption = string | { label: string; value: string | number }

type InputValue = string | number | null

const props = withDefaults(
  defineProps<{
    modelValue?: InputValue
    label?: string
    placeholder?: string
    type?: string
    as?: 'input' | 'textarea' | 'select'
    options?: InputOption[]
    rows?: number
    fullWidth?: boolean
    labelClass?: string
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    type: 'text',
    as: 'input',
    options: () => [],
    rows: 4,
    fullWidth: false,
    labelClass: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const normalizedOptions = computed(() =>
  props.options.map((option) =>
    typeof option === 'string'
      ? { label: option, value: option }
      : option,
  ),
)

const model = computed({
  get: () => String(props.modelValue ?? ''),
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <label class="field-group" :style="fullWidth ? 'grid-column: 1 / -1' : undefined">
    <span v-if="label" class="field-label" :class="labelClass">{{ label }}</span>

    <textarea
      v-if="as === 'textarea'"
      v-model="model"
      class="textarea"
      :rows="rows"
      :placeholder="placeholder"
    />

    <select v-else-if="as === 'select'" v-model="model" class="select">
      <option v-for="option in normalizedOptions" :key="String(option.value)" :value="String(option.value)">
        {{ option.label }}
      </option>
    </select>

    <input
      v-else
      v-model="model"
      class="field"
      :type="type"
      :placeholder="placeholder"
    />

    <slot />
  </label>
</template>
