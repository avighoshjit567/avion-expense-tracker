<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    helper?: string
    icon?: string
    trend?: string
    positive?: boolean
  }>(),
  {
    helper: '',
    icon: 'insights',
    trend: '',
    positive: true,
  },
)
</script>

<template>
  <article class="card kpi-card">
    <div class="kpi-head">
      <div class="kpi-icon"><span class="material-symbols-outlined">{{ icon }}</span></div>
      <span v-if="trend" class="trend" :class="positive ? 'positive' : 'negative'">
        <span class="material-symbols-outlined" style="font-size: 0.9rem">{{ positive ? 'arrow_upward' : 'arrow_downward' }}</span>
        {{ trend }}
      </span>
    </div>
    <div class="kpi-label">{{ label }}</div>
    <h2 class="kpi-value">{{ value }}</h2>
    <p v-if="helper" class="stats-card-helper">{{ helper }}</p>
  </article>
</template>
