<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onGo()">Go</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { useViteMessaging } from '@/vite/messaging';

const { sendData } = useViteMessaging('store');

const onGo = async () => {
  try {
    const resp = await sendData('eggplant');
    console.dir(resp);
  } catch (error) {
    console.error(error);
  }
};
</script>
