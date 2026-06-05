<template>
  <footer class="page-footer">
    <div class="counter-card">
      <div class="counter-item">
        <svg class="counter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="counter-label">今日浏览</span>
        <span class="counter-value" :key="todayCount">{{ animatedToday }}</span>
      </div>
      <div class="counter-divider" />
      <div class="counter-item">
        <svg class="counter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span class="counter-label">累计访问</span>
        <span class="counter-value" :key="totalCount">{{ animatedTotal }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const todayCount = ref(0)
const totalCount = ref(0)

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function animateValue(target: number, setter: (v: number) => void, duration = 600) {
  const start = 0
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(Math.round(start + (target - start) * eased))
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

const animatedToday = computed(() => todayCount.value.toLocaleString())
const animatedTotal = computed(() => totalCount.value.toLocaleString())

onMounted(async () => {
  const today = new Date()
  const todayStr = formatDate(today)

  try {
    // Increment today's counter and get count
    const todayHitRes = await fetch(`https://api.countapi.xyz/hit/qlu-papers/${todayStr}`)
    if (todayHitRes.ok) {
      const todayHit = await todayHitRes.json()
      todayCount.value = todayHit.value
      animateValue(todayHit.value, (v) => { todayCount.value = v })
    }

    // Increment total counter and get count
    const totalHitRes = await fetch('https://api.countapi.xyz/hit/qlu-papers/total')
    if (totalHitRes.ok) {
      const totalHit = await totalHitRes.json()
      totalCount.value = totalHit.value
      animateValue(totalHit.value, (v) => { totalCount.value = v })
    }
  } catch {
    // Fallback: silently fail if API is unreachable
    todayCount.value = -1
    totalCount.value = -1
  }
})
</script>

<style scoped>
.page-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  margin-top: auto;
}

.counter-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: 10px 24px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 2px 12px rgba(15, 76, 117, 0.08);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.counter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.counter-icon {
  opacity: 0.6;
  flex-shrink: 0;
}

.counter-label {
  white-space: nowrap;
}

.counter-value {
  font-weight: 700;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
}

.counter-divider {
  width: 1px;
  height: 20px;
  background: var(--glass-border);
}

@media (max-width: 480px) {
  .counter-card {
    flex-direction: column;
    gap: 8px;
    padding: 10px 18px;
  }
  .counter-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
