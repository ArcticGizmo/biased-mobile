<template>
  <BasePage title="Settings">
    <div class="content m-4">
      <IonButton expand="full" @click="onCreateBackup()">Create Backup</IonButton>
      <IonButton expand="full" @click="onLoadBackup()">Load Backup</IonButton>
      <IonButton expand="full" @click="onClearAllCards()">Clear All Cards</IonButton>
      <IonButton v-if="ENV.DEV" expand="full" router-link="/test">test</IonButton>
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

const { cards, importBackup, clearCards } = useKPopCards();
const { showToast } = useToast();

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

    await withDelay(importBackup(resp.backup), 2000);
    await showToast({ color: 'success', message: 'Backup imported successfully!', icon: happyOutline });
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
</script>

<style scoped>
ion-button {
  margin-bottom: 1rem;
}
</style>
