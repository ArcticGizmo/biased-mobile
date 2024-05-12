<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onSaveKv()">Save KV</IonButton>
      <IonButton @click="onLoadKv()">Load KV</IonButton>
      <br />
      <br />
      <IonButton @click="onSaveFile()">Save File</IonButton>
      <IonButton @click="onLoadFile()">Load File</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { KvStore } from '@/composables/kvStore';

type MyKvData = { egg: number } | { duck: string };

const data = [{ egg: 7 }, { duck: 'lettuce' }];

const onSaveKv = async () => {
  await KvStore.saveJson<MyKvData[]>('my-data', data);
};

const onLoadKv = async () => {
  const resp = await KvStore.loadJson<MyKvData[]>('my-data');
  console.dir(resp);
};

const onSaveFile = async () => {};

const onLoadFile = async () => {};
</script>
