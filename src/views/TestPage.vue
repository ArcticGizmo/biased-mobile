<template>
  <BasePage title="Test Page">
    <div class="m-8">
      <IonButton @click="onSave()">Save</IonButton>
      <IonButton @click="onLoad()">Load</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { useStorage } from '@/composables/storage';

interface MyData {
  id: string;
  count: number;
}

const { saveValue, loadValue } = useStorage<MyData[]>('my-data');

const onSave = async () => {
  await saveValue([{ id: 'aaaa', count: 10 }]);
};

const onLoad = async () => {
  const resp = await loadValue();
  console.dir(resp);
};
</script>
