<script setup lang="ts">
const segments = [
  { title: 'Total Users', value: '42,891', trend: '12%', positive: true },
  { title: 'Conversion Rate', value: '3.42%', trend: '0.8%', positive: false },
]

const channels = [
  { label: 'Direct', sessions: '18,420', share: '43%' },
  { label: 'Referral', sessions: '12,200', share: '29%' },
  { label: 'Search', sessions: '8,940', share: '21%' },
  { label: 'Campaigns', sessions: '3,331', share: '7%' },
]

const funnel = [
  { title: 'Visitors', value: '128.4K' },
  { title: 'Qualified Leads', value: '31.8K' },
  { title: 'Checkout Starts', value: '12.2K' },
  { title: 'Converted Orders', value: '4.4K' },
]
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <div class="eyebrow">Performance</div>
        <h1 class="page-title">Analytics Overview</h1>
        <p class="page-copy">Traffic, conversion, and channel performance in the same restrained enterprise frame.</p>
      </div>
      <div style="display:flex; gap:0.75rem">
        <button class="secondary-button">
          <span class="material-symbols-outlined">calendar_today</span>
          <span>Last 30 Days</span>
        </button>
        <button class="primary-button">
          <span class="material-symbols-outlined">download</span>
          <span>Export Report</span>
        </button>
      </div>
    </div>

    <div class="analytics-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Traffic Trends</h2>
            <p class="panel-copy">Daily unique visitors and referral quality over the last month.</p>
          </div>
          <div style="display:flex; gap:1rem; color:var(--muted)">
            <span><span class="badge primary" style="margin-right:0.35rem">●</span>Direct</span>
            <span><span class="badge warning" style="margin-right:0.35rem">●</span>Referral</span>
          </div>
        </div>
        <div class="mock-chart" style="height: 20rem; align-items: flex-end;">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%">
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.24" />
                <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <path d="M0 86 Q 15 76, 28 52 T 54 38 T 76 61 T 100 20 V 100 H 0 Z" fill="url(#trafficGradient)" />
            <path d="M0 86 Q 15 76, 28 52 T 54 38 T 76 61 T 100 20" fill="none" stroke="#4f46e5" stroke-width="2.3" />
          </svg>
        </div>
      </article>

      <div class="stack-grid">
        <article v-for="segment in segments" :key="segment.title" class="card">
          <div class="kpi-label">{{ segment.title }}</div>
          <h2 class="kpi-value" style="margin-top: 0.45rem">{{ segment.value }}</h2>
          <span class="trend" :class="segment.positive ? 'positive' : 'negative'" style="margin-top: 0.6rem; width:max-content">
            <span class="material-symbols-outlined" style="font-size:0.9rem">{{ segment.positive ? 'trending_up' : 'trending_down' }}</span>
            {{ segment.trend }}
          </span>
        </article>
      </div>
    </div>

    <div class="content-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Channel Mix</h2>
            <p class="panel-copy">Where users are discovering and returning to the platform.</p>
          </div>
        </div>
        <div class="stat-list">
          <div v-for="item in channels" :key="item.label" class="stat-item">
            <div>
              <p class="meta-title">{{ item.label }}</p>
              <p class="meta-copy">{{ item.sessions }} sessions</p>
            </div>
            <div class="badge primary">{{ item.share }}</div>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Conversion Funnel</h2>
            <p class="panel-copy">A simplified path from acquisition to order completion.</p>
          </div>
        </div>
        <div class="stat-list">
          <div v-for="item in funnel" :key="item.title" class="stat-item">
            <div>
              <p class="meta-title">{{ item.title }}</p>
            </div>
            <div class="meta-title">{{ item.value }}</div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
