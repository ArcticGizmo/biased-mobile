<template>
  <BasePage title="Home" pad>
    <!-- List of idols -->
    <div class="p-4">egg</div>
    <IonButton @click="onSaveFile()">Save File</IonButton>
    <IonButton @click="onReadFile()">Read File</IonButton>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import BasePage from './BasePage.vue';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const onSaveFile = async () => {
  try {
    const a = await Filesystem.writeFile({
      path: 'example/text.txt',
      data: 'this is some data',
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    console.dir(a);
  } catch (error) {
    console.error('write', error);
  }
};

const onReadFile = async () => {
  try {
    const data = await Filesystem.readFile({
      path: 'example/text.txt',
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    console.dir(data);
  } catch (error) {
    console.error('read', error);
  }
};
</script>
