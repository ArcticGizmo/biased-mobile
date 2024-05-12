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
import { Directory } from '@capacitor/filesystem';
import { useKPopCards } from '@/composables/kPopCards';
import { showLoading } from '@/composables/modals';
import { KPopCardPackable } from '@/types';
import { FileStore } from '@/composables/fileStore';

const { cards } = useKPopCards();

const onCreateBackup = async () => {
  const loading = await showLoading();

  try {
    const backup = await buildBackup();
    console.dir(backup);
    const filename = `kpop-cards-backup-${getBackupName()}.txt`;
    await FileStore.save(filename, JSON.stringify(backup), { directory: Directory.Documents });
    console.dir(filename);
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};

const padNumber = (num: number) => `${num}`.padStart(2, '0');

const getBackupName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = padNumber(now.getMonth() + 1);
  const date = padNumber(now.getDate());
  const hour = padNumber(now.getHours());
  const minutes = padNumber(now.getMinutes());
  const seconds = padNumber(now.getSeconds());
  return `${year}${month}${date}-${hour}${minutes}${seconds}`;
};

const buildBackup = async () => {
  const packedCards: KPopCardPackable[] = [];

  for (const card of cards.value) {
    const loadResult = await FileStore.loadImage(card.imageFilePath);
    if (!loadResult.ok) {
      console.error('could not load file', card.imageFilePath, loadResult.error);
      return;
    }

    packedCards.push({
      id: card.id,
      imageSrc: loadResult.data || '',
      artist: card.artist,
      artistType: card.artistType,
      groupName: card.groupName,
      whereFrom: card.whereFrom,
      whereFromName: card.whereFromName,
      albumVersion: card.albumVersion,
      year: card.year,
      ownershipType: card.ownershipType
    });
  }

  return packedCards;
};

const onLoadBackup = async () => {
  await pickFile();
};

// const onDownload = async () => {
//   const resp = await saveFile('egg.json', JSON.stringify(data), Directory.Documents);
//   console.dir(resp);
// };

// const onPickFile = async () => {
//   const resp = await pickFile();
// };
</script>
