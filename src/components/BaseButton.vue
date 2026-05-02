<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
    disabled: false,
  },
)

const className = computed(() => [
  `${props.variant}-button`,
  {
    'button-block': props.block,
  },
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="className">
    <slot />
  </button>
</template>
