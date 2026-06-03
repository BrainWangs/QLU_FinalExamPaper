<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">投稿</h2>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <!-- TODO: 待编辑内容 -->
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(15, 76, 117, 0.3);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: var(--space-lg);
}
.modal {
  background: rgba(255, 255, 255, 0.15); backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg); width: 100%; max-width: 560px; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-lg); border-bottom: 1px solid var(--glass-border);
}
.modal-title { font-size: 1.2rem; font-weight: 800; }
.btn-close { padding: 4px 10px; background: rgba(255,255,255,0.5); border-radius: var(--radius-sm); font-size: 1.2rem; color: var(--color-text); }
.btn-close:hover { background: rgba(50,130,184,0.1); }
.modal-body { padding: var(--space-lg); min-height: 200px; }
</style>
