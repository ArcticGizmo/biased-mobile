<template>
  <BaseDialog justify-content="flex-end">
    <div class="sheet">
      <div><slot name="header"></slot></div>
      <div><slot>Content</slot></div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue';

defineProps<{
  persistent?: boolean;
}>();
</script>

<style scoped></style>

<style scoped>
.sheet {
  background-color: white;
}

.open .sheet {
  animation: slideInUp ease 0.3s 1 forwards;
}

@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
}

.closing .sheet {
  animation: slideOutDown ease 0.3s 1 forwards;
}

@keyframes slideOutDown {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(0, 100%, 0);
  }
}
</style>
