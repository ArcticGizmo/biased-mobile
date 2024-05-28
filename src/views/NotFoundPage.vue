<template>
  <BasePage>
    <div class="flex items-center justify-center h-screen flex-col">
      <p>You look a bit lost!</p>
      <p>Lets get you home</p>
      <IonButton class="mt-4" router-link="/">Back to My Cards</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
</script>
