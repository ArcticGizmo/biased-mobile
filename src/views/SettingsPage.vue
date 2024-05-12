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
import { saveFile, pickFile, loadFile } from '@/composables/localFileSystem';
import { Directory } from '@capacitor/filesystem';
import { useKPopCards } from '@/composables/kPopCards';
import { showLoading } from '@/composables/modals';
import { KPopCardPackable } from '@/types';

const { cards } = useKPopCards();

// const data = [{ egg: 7 }, { cat: 87 }];

// const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

// const a = {
//   filePath: 'file:///data/user/0/io.arcticgizmo.kpop.cards/files/my-json.json',
//   webviewPath: 'http://192.168.1.15:8100/_capacitor_file_/data/user/0/io.arcticgizmo.kpop.cards/files/my-json.json'
// };

const onCreateBackup = async () => {
  const loading = await showLoading();

  try {
    const backup = await buildBackup();
    console.dir(backup);
    const filename = `kpop-cards-backup-${getBackupName()}.txt`;
    await saveFile(filename, JSON.stringify(backup), Directory.Documents);
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
    const imageSrc = (await loadFile(card.imageFile)) as string;

    packedCards.push({
      id: card.id,
      imageSrc,
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
