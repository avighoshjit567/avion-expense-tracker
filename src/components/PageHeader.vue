<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    copy: string
  }>(),
  {},
)
</script>

<template>
  <div class="page-header">
    <div>
      <div class="eyebrow">{{ eyebrow }}</div>
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-copy">{{ copy }}</p>
    </div>

    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
