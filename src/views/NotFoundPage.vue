<template>
  <BasePage centered pad>
    404 Page not found
    <IonButton router-link="/">Back Home</IonButton>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
</script>
