<template>
  <BasePage title="Settings">
    <div class="content m-4">
      <IonButton @click="onCreateBackup()">Create Backup</IonButton>
      <IonButton @click="onLoadBackup()">Load Backup</IonButton>
      <IonButton router-link="/test">test</IonButton>
      <!-- <IonButton :href="a.webviewPath" download="my-file.json" >Download</IonButton> -->
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import BasePage from './BasePage.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { showLoading } from '@/composables/modals';
import { createBackup, loadBackup } from '@/composables/backup';

const { cards, importBackup } = useKPopCards();

const onCreateBackup = async () => {
  const loading = await showLoading();

  try {
    const resp = await createBackup([...cards.value]);
    if (resp.ok) {
      console.log('backup created at', resp.path);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};

const onLoadBackup = async () => {
  const resp = await loadBackup();

  if (!resp.ok) {
    console.error('could not load backup');
    return;
  }

  await importBackup(resp.cards);
  console.log('backup import complete');
};
</script>
