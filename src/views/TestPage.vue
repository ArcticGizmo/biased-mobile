<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onGo()">Go</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton, modalController } from '@ionic/vue';
import ImageEditorModal from '@/components/ImageEditorModal.vue';
import { onMounted } from 'vue';

const URL = 'https://pbs.twimg.com/media/FuXgrrjWIAAH9_l?format=jpg&name=4096x4096';

const onGo = async () => {
  const modal = await modalController.create({
    component: ImageEditorModal,
    componentProps: { src: URL }
  });

  modal.present();

  const resp = await modal.onWillDismiss();
  console.dir(resp);
};

onMounted(() => onGo());
</script>
