<template>
  <DebugMenu v-if="ENV.IS_DEV || true" />
  <IonApp>
    <DialogProvider />
    <IonRouterOutlet id="main"></IonRouterOutlet>
  </IonApp>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import DialogProvider from '@/components/DialogProvider.vue';
import DebugMenu from '@/components/DebugMenu.vue';
import { ENV } from '@/env';
</script>

<style scoped></style>
