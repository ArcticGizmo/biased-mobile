<template>
  <BasePage title="Settings" max-width="500px">
    <div class="content m-4">
      <IonButton expand="full" @click="onCreateBackup()">Create Backup</IonButton>
      <IonButton expand="full" @click="onLoadBackup()">Import Backup</IonButton>
      <IonButton expand="full" @click="onClearAllCards()">Clear All Cards</IonButton>
      <IonButton expand="full" @click="onCreateImage()">Create Image</IonButton>
      <IonButton v-if="ENV.DEV" expand="full" router-link="/test">test</IonButton>
      <img v-for="(src, index) of templateSrcs" :key="index" :src="src" style="width: 90vw; border: 1px solid orange" height="500px" />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import BasePage from './BasePage.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { showLoading, showSimpleAlert } from '@/composables/modals';
import { createBackup, loadBackup } from '@/composables/backup';
import { useToast } from '@/composables/toast';
import { alertOutline, happyOutline, sadOutline } from 'ionicons/icons';
import { ENV } from '@/env';
import { createImages } from '@/composables/imageShare';
import { ref } from 'vue';
import { FileStore } from '@/composables/fileStore';

const { cards, importBackup, clearCards } = useKPopCards();
const { showToast } = useToast();

const templateSrcs = ref<string[]>([]);

const delay = (duration: number) => new Promise(r => setTimeout(r, duration));

async function withDelay<T>(task: Promise<T>, minDuration: number) {
  const [resp] = await Promise.all([task, delay(minDuration)]);
  return resp;
}

const onCreateBackup = async () => {
  const loading = await showLoading('Creating Backup');

  try {
    const resp = await withDelay(createBackup([...cards.value]), 2_000);
    if (resp.ok) {
      console.log('backup created at', resp.path);
      await showToast({ message: 'Backup created!', color: 'success' });
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};

const onLoadBackup = async () => {
  const loading = await showLoading('Loading backup');

  try {
    const resp = await loadBackup();

    if (!resp.ok) {
      console.error('could not load backup', resp.error);
      await showToast({ color: 'danger', message: 'Could not import backup', icon: sadOutline });
      return;
    }

    const { imported, skipped } = await withDelay(importBackup(resp.backup), 2000);
    if (imported === 0 && skipped === 0) {
      await showToast({ color: 'warning', message: 'No items to import', icon: alertOutline });
      return;
    }

    if (imported === 0 && skipped > 0) {
      await showToast({ color: 'warning', message: 'Those cards already exist!', icon: alertOutline });
      return;
    }

    if (imported > 0 && skipped === 0) {
      await showToast({ color: 'success', message: `${imported} cards imported`, icon: happyOutline });
      return;
    }

    await showToast({ color: 'success', message: `${imported} cards imported. Skipped ${skipped} `, icon: happyOutline });
  } catch (error) {
    console.error(error);
    await showToast({ color: 'danger', message: 'Something went wrong :(', icon: alertOutline });
  } finally {
    loading.dismiss();
  }
};

const onClearAllCards = async () => {
  const resp = await showSimpleAlert({
    header: 'Remove all cards?',
    message: 'This will remove everything and cannot be undone',
    okName: 'delete'
  });

  if (resp !== 'delete') {
    return;
  }

  const loading = await showLoading('Deleting cards');

  try {
    await clearCards();
    await showToast({ color: 'success', message: 'All cards removed!' });
  } catch (error) {
    console.error('failed to delete cards', error);
    await showToast({ color: 'danger', message: "Unable to remove your cards :'(", icon: alertOutline });
  } finally {
    loading.dismiss();
  }
};

const onCreateImage = async () => {
  const loading = await showLoading('Creating Backup');

  const artist = 'Dino';
  const filename = `kpop-template-${Date.UTC}`;

  try {
    const toExport = cards.value.filter(c => c.artist === artist);

    if (!toExport.length) {
      await showToast({ message: 'There is nothing to export. Try a different filter', color: 'danger' });
      return;
    }

    const dataUrls = await createImages(toExport);
    templateSrcs.value = dataUrls;

    for (const [index, data] of dataUrls.entries()) {
      await FileStore.saveToGallery(`${filename}-${index}.jpg`, data);
    }

    await showToast({ message: 'Templates saved to gallery!', color: 'success' });
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};
</script>

<style scoped>
ion-button {
  margin-bottom: 1rem;
}
</style>
