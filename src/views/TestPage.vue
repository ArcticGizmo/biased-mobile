<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onSaveKv()">Save KV</IonButton>
      <IonButton @click="onLoadKv()">Load KV</IonButton>
      <br />
      <br />
      <IonButton @click="onSaveAndLoadFile()">Save and Load file</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { KvStore } from '@/composables/kvStore';
import { FileStore } from '@/composables/fileStore';

type MyKvData = { egg: number } | { duck: string };

const data = [{ egg: 7 }, { duck: 'lettuce' }];

const onSaveKv = async () => {
  await KvStore.saveJson<MyKvData[]>('my-data', data);
};

const onLoadKv = async () => {
  const resp = await KvStore.loadJson<MyKvData[]>('my-data');
  console.dir(resp);
};

const onSaveAndLoadFile = async () => {
  const saveResp = await FileStore.save('my-file.txt', 'my fun message');
  if (!saveResp.ok) {
    return;
  }
  console.log('saved', saveResp);
  const loadResp = await FileStore.load(saveResp.path);
  console.log('loaded', loadResp);
};
</script>
