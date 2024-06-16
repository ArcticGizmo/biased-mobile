<template>
  <div v-if="DIALOGS.length" class="dialog-provider">
    <IonBackdrop visible />
    <div class="dialog" v-for="(dialog, index) of DIALOGS" :key="index" :style="{ zIndex: 5 + DIALOGS.length - index }">
      <component :is="dialog.component" v-bind="dialog.componentProps" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonBackdrop } from '@ionic/vue';
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

@keyframes backgroundFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.5;
  }
}

ion-backdrop {
  background: var(--ion-color-dark);
  opacity: 0;
  animation: backgroundFadeIn ease 0.5s 1 forwards;
}
</style>
