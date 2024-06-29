<template>
  <IonApp>
    <DialogProvider />
    <IonRouterOutlet id="main"></IonRouterOutlet>
  </IonApp>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import DialogProvider from '@/components/DialogProvider.vue';
</script>
