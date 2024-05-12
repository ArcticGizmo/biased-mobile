<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onSaveKv()">Save KV</IonButton>
      <IonButton @click="onLoadKv()">Load KV</IonButton>
      <br />
      <br />
      <IonButton @click="onSaveFile()">Save File</IonButton>
      <IonButton :disabled="!filePath" @click="onLoadFile()">Load file</IonButton>
      <IonButton :disabled="!filePath" @click="onDeleteFile()">Delete File</IonButton>
      <div>Filepath: {{ filePath }}</div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { KvStore } from '@/composables/kvStore';
import { FileStore } from '@/composables/fileStore';
import { ref } from 'vue';

type MyKvData = { egg: number } | { duck: string };

const data = [{ egg: 7 }, { duck: 'lettuce' }];
const filePath = ref('');

const onSaveKv = async () => {
  await KvStore.saveJson<MyKvData[]>('my-data', data);
};

const onLoadKv = async () => {
  const resp = await KvStore.loadJson<MyKvData[]>('my-data');
  console.dir(resp);
};

const onSaveFile = async () => {
  const saveResp = await FileStore.save('my-file.txt', 'my fun message');
  if (!saveResp.ok) {
    console.error('cannot save file', saveResp.error);
    return;
  }

  filePath.value = saveResp.path;
};

const onLoadFile = async () => {
  const loadResp = await FileStore.load(filePath.value);
  console.log('loaded', loadResp);
};

const onDeleteFile = async () => {
  await FileStore.remove(filePath.value);
  filePath.value = '';
};
</script>
