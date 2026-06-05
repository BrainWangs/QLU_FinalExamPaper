<template>
  <Teleport to="body">
    <Transition name="contribute-modal">
      <div v-if="visible" class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">投稿</h2>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <p>欢迎投稿！ヽ( ^ω^ ゞ ) <br>请将试卷发送至：</p>
          <p style="margin-top:12px">📧 <a href="mailto:brianwangx@163.com">brianwangx@163.com</a></p>
          <p style="margin-top:8px;color:var(--color-text-secondary);font-size:0.85rem">邮件标题为：QLU期末试卷投稿+考试学期+适用专业等信息</p>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: var(--space-lg);
}
.modal {
  background: rgba(255, 255, 255, 0.5); backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm); width: 100%; max-width: 560px; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-lg); border-bottom: 1px solid var(--glass-border);
}
.modal-title { font-size: 1.2rem; font-weight: 800; }
.btn-close { padding: 4px 10px; background: rgba(255,255,255,0.5); border-radius: var(--radius-sm); font-size: 1.2rem; color: var(--color-text); }
.btn-close:hover { background: rgba(50,130,184,0.1); }
.modal-body { padding: var(--space-xl); min-height: 200px; text-align: center; font-size: 1.05rem; line-height: 1.8; font-weight: 700; }

/* ── Mobile (< 641px): full-width modal ── */
@media (max-width: 640px) {
  .overlay {
    padding: var(--space-sm);
    align-items: flex-end;
  }

  .modal {
    max-width: 100%;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .modal-header {
    padding: var(--space-md);
  }

  .modal-title {
    font-size: 1.05rem;
  }

  .modal-body {
    padding: var(--space-lg);
    font-size: 0.95rem;
    min-height: 160px;
  }
}

/* ── Tablet (641px - 1024px) ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .modal {
    max-width: 90vw;
  }
}
</style>
