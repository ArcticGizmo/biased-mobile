<template>
  <BasePage title="Creator">
    <div class="content p-8">
      <div class="upload-pic">
        <KImg height="50vh" :src="imageSrc" background>
          <template #fallback>
            <template v-if="imageSrc">
              <IonIcon class="bad-image-icon" :icon="sadOutline" />
              <p>That image did not appear to work!</p>
              <p>Maybe try a different one?</p>
            </template>
            <template v-else>
              <p>Upload your PC!</p>
            </template>
          </template>
        </KImg>
        <IonButton @click="onTakePicture()">Camera</IonButton>
        <IonButton @click="onGetFromGallery()">Gallery</IonButton>
        <IonButton @click="onGetFromUrl()">From URL</IonButton>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import BasePage from './BasePage.vue';
import KImg from '@/components/KImg.vue';
import { KPhotoResponse, useImageImport } from '@/composables/imageImport';
import { ref } from 'vue';
import { sadOutline } from 'ionicons/icons';

const { takePhoto, photoFromGallery, photoFromUrl } = useImageImport();

const imageSrc = ref('');

const setImage = (resp: KPhotoResponse) => {
  if (resp.ok) {
    imageSrc.value = resp.photo.base64Uri;
  }
};

const onTakePicture = async () => {
  const resp = await takePhoto();
  setImage(resp);
};

const onGetFromGallery = async () => {
  const resp = await photoFromGallery();
  setImage(resp);
};

const onGetFromUrl = async () => {
  const resp = await photoFromUrl();
  setImage(resp);
};
</script>

<style scoped>
.bad-image-icon {
  width: 100%;
  height: 100%;
  max-width: 3rem;
  max-height: 3rem;
  margin-bottom: 1rem;
}
</style>
