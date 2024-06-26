<template>
  <BasePage max-width="500px" :class="{ 'show-background': section !== 'list' }" :fixed-content-height="section !== 'list'">
    <template #header>
      <IonSearchbar class="px-2 my-0.5" v-model="search" />
      <div class="mx-2 mb-1">
        <FilterItem :icon="progressTag" text="Status" :model-value="sorter === 'status'" @click="sorter = 'status'" />
        <FilterItem :icon="aToZ" text="A-Z" :model-value="sorter === 'a-to-z'" @click="sorter = 'a-to-z'" />
        <FilterItem :icon="zToA" text="Z-A" :model-value="sorter === 'z-to-a'" @click="sorter = 'z-to-a'" />
      </div>
    </template>

    <div v-if="section === 'list'" class="grouping-list">
      <IonCard v-for="(pack, index) of filteredPacks" :key="index" @click="onPackSelect(pack)">
        <IonCardHeader>
          <IonLabel class="text-2xl" color="medium">
            {{ pack.artist }}
            <IonIcon v-if="getPackStatus(pack) === 'up-to-date'" color="success" :icon="checkmarkCircle" />
            <IonIcon v-if="getPackStatus(pack) === 'outdated'" color="warning" :icon="updateIcon" />
          </IonLabel>
        </IonCardHeader>
        <IonCardContent>
          <IonLabel class="text-sm">{{ pack.group }}</IonLabel>
        </IonCardContent>
        <div class="absolute top-0 right-0 h-full w-16 flex items-center justify-end pr-4">
          <IonIcon :icon="chevronDown" size="large" color="secondary" />
        </div>
      </IonCard>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-full">
      <template v-if="section === 'loading'">
        <IonSpinner name="dots" />
      </template>
      <template v-else-if="section === 'no-packs'">
        <IonText class="text-center">No packs available at the moment!</IonText>
        <IonButton class="mt-4" expand="block" fill="outline" router-link="/create">Try create your own</IonButton>
      </template>
      <template v-else-if="section === 'no-match'"> No Matches </template>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import {
  IonSearchbar,
  IonSpinner,
  IonText,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardContent,
  actionSheetController,
  IonIcon,
  ActionSheetButton,
  IonButton
} from '@ionic/vue';
import BasePage from './BasePage.vue';
import { type AvailablePack, usePacksQuery, usePackHistory, fetchPack } from '@/composables/packs';
import { computed, ref } from 'vue';
import { multiSort } from '@/util/sort';
import { executeWithLoading, showSimpleAlert } from '@/composables/modals';
import { useToast } from '@/composables/toast';
import { alert, checkmarkCircle, chevronDown, happyOutline, sadOutline } from 'ionicons/icons';
import { withDelay } from '@/util/delay';
import { useKPopCards } from '@/composables/kPopCards';
import { aToZ, updateIcon, zToA, progressTag } from '@/icons';
import { firstBy } from 'thenby';
import FilterItem from '@/components/FilterItem.vue';

type PackStatus = 'up-to-date' | 'outdated' | 'not-downloaded';

type PackSorter = 'a-to-z' | 'z-to-a' | 'status';

const PACK_SORT_ORDER: Record<PackStatus, number> = {
  'not-downloaded': 2,
  'up-to-date': 1,
  outdated: 0
};

const { showToast } = useToast();

const packsQuery = usePacksQuery();
const { packHistory, addPack, deletePack } = usePackHistory();
const { cards, deleteCards, importBackup } = useKPopCards();

const packs = computed(() => packsQuery.data.value || []);

const sortPacks = (packs: AvailablePack[], packSorter: PackSorter) => {
  switch (packSorter) {
    case 'a-to-z':
      packs.sort(firstBy('artist', 1).thenBy('group'));
      break;

    case 'z-to-a':
      packs.sort(firstBy('artist', -1).thenBy('group'));
      break;

    case 'status':
      packs.sort(
        firstBy<AvailablePack>(c => PACK_SORT_ORDER[getPackStatus(c)])
          .thenBy('artist', 1)
          .thenBy('group')
      );
      break;
  }
};

const filteredPacks = computed(() => {
  const items = [...packs.value];
  sortPacks(items, sorter.value);
  return multiSort(items, ['artist', 'group'], search.value);
});

const search = ref('');
const sorter = ref<PackSorter>('status');

const getPackStatus = (pack: AvailablePack): PackStatus => {
  const timeOnDisk = packHistory.value[pack.packId];

  if (!timeOnDisk) {
    return 'not-downloaded';
  }

  if (timeOnDisk === pack.updatedAt) {
    return 'up-to-date';
  }

  return 'outdated';
};

const onPackSelect = async (pack: AvailablePack) => {
  const status = getPackStatus(pack);

  let buttons: ActionSheetButton[] = [];

  if (status === 'not-downloaded') {
    buttons = [
      {
        text: 'Download',
        data: 'download'
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
  } else {
    buttons = [
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
    ];
  }

  const actionSheet = await actionSheetController.create({ buttons });

  actionSheet.present();

  const resp = await actionSheet.onWillDismiss();

  switch (resp.data) {
    case 'download':
    case 'update':
      await onDownloadPack(pack);
      return;

    case 'delete':
      await onDeletePack(pack);
      return;
  }
};

const onDownloadPack = async (pack: AvailablePack) => {
  const packResp = await executeWithLoading(async () => await fetchPack(pack.url), 'Downloading');

  if (!packResp.ok) {
    console.error(packResp.error);
    await showToast({ color: 'danger', message: 'Could not download pack', icon: sadOutline });
    return;
  }

  const backupResp = await executeWithLoading(async () => await withDelay(importBackup(packResp.result, pack.packId), 2000), 'Importing');

  if (!backupResp.ok) {
    console.error(backupResp.error);
    await showToast({ color: 'danger', message: 'Could not import back', icon: sadOutline });
    return;
  }

  addPack(pack.packId, pack.updatedAt);

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

const onDeletePack = async (pack: AvailablePack) => {
  const proceed = await showSimpleAlert({
    header: 'Remove pack',
    message: 'All cards from this pack will be removed',
    okName: 'delete',
    okClass: 'danger'
  });

  if (proceed !== 'delete') {
    return;
  }

  const cardIdsToDelete = cards.value.filter(c => c.packId === pack.packId).map(c => c.id);

  const deleteResp = await executeWithLoading(async () => {
    await deleteCards(cardIdsToDelete);
    await deletePack(pack.packId);
  }, 'Deleting');

  if (!deleteResp.ok) {
    await showToast({ color: 'danger', message: `Could not remove cards`, icon: sadOutline });
    return;
  }

  await showToast({ color: 'success', message: 'Cards deleted', icon: happyOutline });
};

const section = computed(() => {
  if (packsQuery.isLoading.value) return 'loading';
  if (!packs.value.length) return 'no-packs';
  if (!filteredPacks.value.length) return 'no-match';
  return 'list';
});
</script>

<style scoped>
.show-background :deep(ion-content::part(background)) {
  background-image: url('@/assets/icon.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.025 !important;
}

ion-icon {
  margin-bottom: -0.2rem;
}
</style>
