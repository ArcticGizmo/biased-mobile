<template>
  <BasePage title="Packs" max-width="500px">
    <template #header>
      <IonSearchbar class="px-2" :style="{ paddingTop: 0, paddingBottom: 0 }" v-model="search" mode="ios" />
    </template>

    <div v-if="packsQuery.isLoading.value" class="flex items-center justify-center h-full">
      <IonSpinner name="dots" />
    </div>

    <div v-else-if="!packs.length" class="text-center p-3">
      <div>
        <IonText>Looks like there are no packs available right now. <br />Try again later!</IonText>
      </div>
    </div>

    <div v-else-if="!filteredPacks.length" class="text-center p-3">No matches</div>

    <div v-else class="grouping-list">
      <IonCard v-for="(pack, index) of filteredPacks" :key="index" @click="onPackSelect(pack)">
        <IonCardHeader>
          <IonLabel class="text-2xl" color="medium">{{ pack.artist }}</IonLabel>
        </IonCardHeader>
        <IonCardContent>
          <IonLabel class="text-sm">{{ pack.group }}</IonLabel>
        </IonCardContent>
      </IonCard>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonSearchbar, IonSpinner, IonText, IonLabel, IonCard, IonCardHeader, IonCardContent, actionSheetController } from '@ionic/vue';
import BasePage from './BasePage.vue';
import { type AvailablePack, usePacksQuery, fetchPack } from '@/composables/packs';
import { computed, ref } from 'vue';
import { multiSort } from '@/util/sort';
import { executeWithLoading } from '@/composables/modals';
import { useToast } from '@/composables/toast';
import { alert, happyOutline, sadOutline } from 'ionicons/icons';
import { withDelay } from '@/util/delay';
import { useKPopCards } from '@/composables/kPopCards';

// TODO: add packsIds to export so we can check for updates later on

const { showToast } = useToast();

const packsQuery = usePacksQuery();
const { importBackup } = useKPopCards();

const packs = computed(() => packsQuery.data.value || []);

const filteredPacks = computed(() => {
  const items = [...packs.value];
  items.sort((a, b) => a.artist.localeCompare(b.artist));
  return multiSort(items, ['artist', 'group'], search.value);
});

const search = ref('');

const onPackSelect = async (pack: AvailablePack) => {
  console.log(pack);
  const actionSheet = await actionSheetController.create({
    buttons: [
      {
        text: 'Download',
        data: 'download'
      },
      {
        text: 'Update',
        data: 'update'
      },
      {
        text: 'Delete',
        data: 'delete',
        role: 'destructive'
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ]
  });

  actionSheet.present();

  const resp = await actionSheet.onWillDismiss();

  switch (resp.data) {
    case 'download':
      await downloadPack(pack);
      return;

    case 'update':
      await updatePack(pack);
      return;

    case 'delete':
      await deletePack(pack);
      return;
  }
};

const downloadPack = async (pack: AvailablePack) => {
  const packResp = await executeWithLoading(async () => await fetchPack(pack.url), 'Downloading');

  if (!packResp.ok) {
    console.error(packResp.error);
    await showToast({ color: 'danger', message: 'Could not download pack', icon: sadOutline });
    return;
  }

  const backupResp = await executeWithLoading(async () => await withDelay(importBackup(packResp.result), 2000), 'Importing');

  if (!backupResp.ok) {
    console.error(backupResp.error);
    await showToast({ color: 'danger', message: 'Could not import back', icon: sadOutline });
    return;
  }

  const { imported, skipped } = backupResp.result;

  if (imported === 0 && skipped === 0) {
    await showToast({ color: 'warning', message: 'That pack appears to be empty', icon: alert });
    return;
  }

  if (imported === 0 && skipped > 0) {
    await showToast({ color: 'success', message: 'Pack is up to date', icon: happyOutline });
    return;
  }

  if (imported > 0 && skipped === 0) {
    await showToast({ color: 'success', message: `${imported} cards imported`, icon: happyOutline });
    return;
  }

  await showToast({ color: 'success', message: `${imported} new cards imported`, icon: happyOutline });
};

const updatePack = async (pack: AvailablePack) => {};

const deletePack = async (pack: AvailablePack) => {};
</script>
