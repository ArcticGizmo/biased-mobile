<template>
  <BasePage title="Creator">
    <div class="content p-8">
      <div class="upload-pic">
        <!-- <KImg aspect-ratio="1" width="25%" /> -->
        <!-- <KImg aspect-ratio="1" width="25%" src="https://pbs.twimg.com/media/FuXgrrjWe" /> -->
        <KImg aspect-ratio="1" width="25%" src="https://pbs.twimg.com/media/FuXgrrjWIAAH9_l?format=jpg&name=4096x4096" />
        <!-- placeholde rimage here -->
        <IonButton @click="onTakePicture()">Camera</IonButton>
        <IonButton @click="onGetFromGallery()">Gallery</IonButton>
        <IonButton @click="onGetFromUrl()">From URL</IonButton>
        <!-- <IonTex -->
      </div>

      content
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import BasePage from './BasePage.vue';
import KImg from '@/components/KImg.vue';
import { useImageImport } from '@/composables/imageImport';

const { takePhoto, photoFromGallery } = useImageImport();

const onTakePicture = async () => {
  const resp = await takePhoto();

  if (!resp.ok) {
    console.log('--- could not take picture');
    return;
  }

  console.log('photo', resp.photo);
};

const onGetFromGallery = async () => {
  const resp = await photoFromGallery();
  console.log(resp);
};

const onGetFromUrl = async () => {
  console.log('url');
};
</script>
