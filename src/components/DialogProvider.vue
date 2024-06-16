<template>
  <div v-if="DIALOGS.length" class="dialog-provider">
    <div class="dialog" v-for="(dialog, index) of DIALOGS" :key="index" :style="{ zIndex: 5 + DIALOGS.length - index }">
      <component :is="dialog.component" :class="{ closing: dialog.closing, open: !dialog.closing }" v-bind="dialog.componentProps" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DIALOGS } from '@/composables/dialogController';
</script>

<style scoped>
.dialog-provider {
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 500;
}

.dialog {
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
