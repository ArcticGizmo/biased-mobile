<template>
  <BaseDialog justify-content="flex-end" @backdrop="onBackdrop()">
    <div class="sheet">
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
</style>
