<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <h5>KV/Preferences</h5>
      <IonButton @click="onSaveKv()">Save KV</IonButton>
      <IonButton @click="onLoadKv()">Load KV</IonButton>

      <!-- saving/loading a image -->
      <h4>Images</h4>
      <IonButton @click="onSaveImage()">Save Image</IonButton>
      <IonButton :disabled="!imagePath" @click="onLoadImage()">Load Image</IonButton>
      <IonButton :disabled="!imagePath" @click="onRemoveImage()">Remove Image</IonButton>
      <div>{{ imagePath }}</div>
      <div>{{ FileStore.toHref(imagePath) }}</div>
      <img style="width: 100px; height: 100px" :src="FileStore.toHref(imagePath)" />

      <!-- saveing/loading a json file -->
      <h5>File</h5>
      <IonButton @click="onSaveFile()">Save File</IonButton>
      <IonButton :disabled="!filePath" @click="onLoadFile()">Load File</IonButton>
      <IonButton :disabled="!filePath" @click="onRemoveFile()">Remove File</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { KvStore } from '@/composables/kvStore';
import { FileStore } from '@/composables/fileStore';
import { ref } from 'vue';
import { useImageImport } from '@/composables/imageImport';
import { Directory } from '@capacitor/filesystem';

const { photoFromGallery } = useImageImport();

type MyKvData = { egg: number } | { duck: string };

const data = [{ egg: 7 }, { duck: 'lettuce' }];
const imagePath = ref('');
const filePath = ref('');

const onSaveKv = async () => {
  await KvStore.saveJson<MyKvData[]>('my-data', data);
};

const onLoadKv = async () => {
  const resp = await KvStore.loadJson<MyKvData[]>('my-data');
  console.dir(resp);
};

const onSaveImage = async () => {
  const photoResp = await photoFromGallery();
  if (!photoResp.ok) {
    return;
  }

  // TODO: fix
  const saveResp = await FileStore.saveImage('face-2.png', photoResp.image.b64Data);

  if (!saveResp.ok) {
    return;
  }

  imagePath.value = saveResp.path;
};

const onLoadImage = async () => {
  const data = await FileStore.loadImage(imagePath.value);
  console.dir(data);
};

const onRemoveImage = async () => {
  await FileStore.remove(imagePath.value);
  imagePath.value = '';
};

const onSaveFile = async () => {
  const resp = await FileStore.save('example/bacon.txt', 'bacon', { directory: Directory.Documents });
  if (!resp.ok) {
    return;
  }
  console.dir(resp);
  filePath.value = resp.path;
};

const onLoadFile = async () => {
  const resp = await FileStore.load(filePath.value);
  console.dir(resp);
};

const onRemoveFile = async () => {
  await FileStore.remove(filePath.value);
  filePath.value = '';
};
</script>
