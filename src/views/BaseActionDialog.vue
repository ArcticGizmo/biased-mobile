<template>
  <BaseDialog class="aaaa" justify-content="flex-end" @backdrop="onBackdrop()">
    <div class="sheet slide-up">
      <div><slot name="header"></slot></div>
      <div><slot>Content</slot></div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue';

const emits = defineEmits<{
  (e: 'backdrop'): void;
}>();

const onBackdrop = () => emits('backdrop');
</script>

<style scoped>
.sheet {
  background-color: white;
}

.slide-up {
  animation: slideInUp ease-in-out 0.3s;
}

@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
}
</style>
