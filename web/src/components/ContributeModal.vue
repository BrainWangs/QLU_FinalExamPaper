<template>
  <Teleport to="body">
    <Transition name="contribute-modal">
      <div v-if="visible" class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">投稿</h2>
          <button class="btn-close" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">欢迎分享试卷资源，请发送至以下邮箱：</p>
          <a href="mailto:brianwangx@163.com" class="email-link">brianwangx@163.com</a>
          <p class="modal-hint">邮件标题注明：考试学期 + 适用专业等信息</p>
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
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: var(--space-lg);
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%; max-width: 440px; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-lg); border-bottom: 1px solid var(--color-border-light);
}
.modal-title { font-size: 1.1rem; font-weight: 700; }
.btn-close {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; border: none;
  color: var(--color-text-secondary); transition: all var(--transition-fast);
}
.btn-close:hover { background: #e2e8f0; color: var(--color-text); }
.modal-body { padding: var(--space-xl); text-align: center; }
.modal-desc { font-size: .95rem; color: var(--color-text-secondary); margin-bottom: 16px; }
.email-link {
  display: inline-block;
  padding: 12px 28px;
  font-size: 1rem; font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  color: var(--color-accent);
  background: var(--color-accent-subtle);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  margin-bottom: 12px;
}
.email-link:hover { background: var(--color-accent); color: #fff; }
.modal-hint { font-size: .8rem; color: var(--color-text-muted); }

@media (max-width: 640px) {
  .overlay { padding: var(--space-sm); align-items: flex-end; }
  .modal { max-width: 100%; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .modal-header { padding: var(--space-md); }
  .modal-title { font-size: 1.05rem; }
  .modal-body { padding: var(--space-lg); }
  .email-link { font-size: .9rem; padding: 10px 20px; }
}
</style>
