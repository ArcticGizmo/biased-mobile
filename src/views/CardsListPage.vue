<template>
  <BasePage fixed-content-height>
    <template #header>
      <div class="inline-flex w-full">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonSearchbar class="px-2" :style="{ paddingTop: 0, paddingBottom: 0 }" v-model="search" />
        <IonButtons slot="end">
          <IonButton fill="clear" color="dark" :disabled="!initialCardFilter.length" @click="onOpenFilter()">
            <IonIcon slot="icon-only" :icon="filter" />
          </IonButton>
        </IonButtons>
      </div>

      <div class="filter-list mx-2 mb-1">
        <FilterItem v-model="filterMissing" :icon="noCard" text="Missing" />
        <FilterItem v-model="filterWant" :icon="heart" text="Want" />
        <FilterItem v-model="filterInTransit" :icon="paperPlane" text="Coming" />
        <FilterItem v-model="filterHave" :icon="checkmarkCircle" text="Have" />
      </div>
    </template>

    <div v-if="!initialCardFilter.length" class="text-center p-3">
      <div>
        <IonText>Looks like you are about to start your journey!</IonText>
      </div>
      <div>
        <IonButton class="mt-4" router-link="/create">Add your first card!</IonButton>
      </div>
    </div>

    <KCardList
      v-else
      :items="filteredCards"
      :selected="selectedCardIds"
      :loading="isLoading"
      @select="onSelectCard"
      @long-hold="onHoldCard"
    >
      <template #empty>
        <div class="text-center p-3">No matches</div>
      </template>
    </KCardList>

    <template v-if="activeMultiSelect">
      <ion-fab slot="fixed" vertical="bottom" horizontal="center">
        <ion-fab-button color="primary" @click="onMultiSelectAction()">
          <ion-icon :icon="chevronUpCircle" color="dark" />
        </ion-fab-button>
        <IonChip class="select-count" @click="onMultiSelectAction()">{{ selectedCardIds.length }}</IonChip>
      </ion-fab>

      <ion-fab class="ml-10" slot="fixed" vertical="bottom" horizontal="start">
        <ion-fab-button color="dark" @click="selectedCardIds = []"> Done </ion-fab-button>
      </ion-fab>

      <ion-fab class="mr-10" slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="dark" @click="selectedCardIds = filteredCards.map(c => c.id)"> All </ion-fab-button>
      </ion-fab>

      <div class="action-region fixed bottom-0 w-full -z-1 pointer-events-none"></div>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import {
  IonSearchbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonText,
  IonIcon,
  modalController,
  IonFab,
  IonFabButton,
  alertController,
  IonChip,
  createAnimation
} from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';
import BasePage from './BasePage.vue';
import { computed, ref } from 'vue';
import KCardList from '@/components/KCardList.vue';
import { KPopCard } from '@/types';
import FilterItem from '@/components/FilterItem.vue';
import { useSimpleRouter } from '@/composables/router';
import { filter, noCard } from '@/icons';
import { checkmarkCircle, heart, paperPlane, chevronUpCircle } from 'ionicons/icons';
import { multiSort, sortBy } from '@/util/sort';
import FilterModal, { Sorter, type Filter } from '@/components/FilterModal.vue';
import { useQueryParam } from '@/composables/useQueryParam';
import { dialogController } from '@/composables/dialogController';
import KCardActionSheet from '@/components/KCardActionSheet.vue';
import { showLoading, showSimpleAlert } from '@/composables/modals';
import { useToast } from '@/composables/toast';
import { delay, withDelay } from '@/util/delay';
import { createBackup } from '@/composables/backup';
import { createImages } from '@/composables/imageShare';
import { FileStore } from '@/composables/fileStore';
import { getDateTimeFileName } from '@/util/datetime';
import { firstBy } from 'thenby';

const group = useQueryParam('group');
const artist = useQueryParam('artist');

const { showToast } = useToast();
const router = useSimpleRouter();

const search = ref('');
const filterMissing = ref(false);
const filterWant = ref(false);
const filterInTransit = ref(false);
const filterHave = ref(false);

const activeFilters = ref<Filter[]>([]);
const activeSorter = ref<Sorter>('new-to-old');

const { cards, deleteCard, deleteCards, isLoading } = useKPopCards();

const selectedCardIds = ref<string[]>([]);

const activeMultiSelect = computed(() => selectedCardIds.value.length > 0);

const onSelectCard = async (card: KPopCard) => {
  if (activeMultiSelect.value) {
    handleMultiSelectTap(card.id);
  } else {
    await handleNormalSelectTap(card.id);
  }
};

const handleMultiSelectTap = (cardId: string) => {
  if (selectedCardIds.value.includes(cardId)) {
    selectedCardIds.value = selectedCardIds.value.filter(c => c !== cardId);
  } else {
    selectedCardIds.value.push(cardId);
  }
};

const handleNormalSelectTap = async (cardId: string) => {
  const actionResp = await dialogController.create({
    component: KCardActionSheet,
    componentProps: {
      ids: [cardId],
      buttons: [
        {
          text: 'View',
          role: 'view'
        },
        {
          text: 'Delete',
          role: 'delete',
          color: 'danger'
        }
      ]
    }
  });

  if (actionResp.role === 'view') {
    router.push(`/cards/${cardId}`);
    return;
  }

  if (actionResp.role !== 'delete') {
    return;
  }

  const alertResp = await showSimpleAlert({ header: 'Remove Card', message: 'Once the card is gone, its gone', okName: 'delete' });

  if (alertResp !== 'delete') {
    return;
  }

  try {
    await deleteCard(cardId);
  } catch (error) {
    console.error('unable to remove card', error);
    await showToast({ color: 'danger', message: "Sorry, that didn't work" });
  }
};

const onHoldCard = (card: KPopCard) => {
  const id = card.id;

  if (!activeMultiSelect.value) {
    selectedCardIds.value = [id];
    return;
  }

  if (selectedCardIds.value.includes(id)) {
    selectedCardIds.value = [];
  } else {
    selectedCardIds.value = [id];
  }
};

const onMultiSelectAction = async () => {
  const actionResp = await dialogController.create({
    component: KCardActionSheet,
    componentProps: {
      ids: selectedCardIds.value,
      buttons: [
        {
          text: 'Create Collage',
          role: 'create-collage'
        },
        {
          text: 'Create Backup',
          role: 'create-backup'
        },
        {
          text: 'Delete All',
          role: 'delete-all',
          color: 'danger'
        }
      ]
    }
  });

  if (actionResp.role === 'backdrop') {
    return;
  }

  const ids = selectedCardIds.value;

  switch (actionResp.role) {
    case 'create-collage':
      await createCollageFromSelected(ids);
      break;

    case 'create-backup':
      await createBackupFromSelected(ids);
      break;

    case 'delete-all':
      await deleteSelectedCards(ids);
      break;
  }

  selectedCardIds.value = [];
};

const getBestCollageName = (ids: string[]) => {
  const matchingCards = cards.value.filter(c => ids.includes(c.id));

  const artistNames = [...new Set(matchingCards.map(c => c.artist))];
  if (artistNames.length === 1) {
    return artistNames[0];
  }

  return '';
};

const createCollageFromSelected = async (ids: string[]) => {
  // get a placeholder name for the collage

  const nameAlert = await alertController.create({
    header: 'Name your collage',
    buttons: [
      { text: 'cancel', role: 'cancel' },
      { text: 'ok', role: 'ok' }
    ],
    inputs: [
      {
        type: 'text',
        name: 'name',
        value: getBestCollageName(ids),
        placeholder: 'Title'
      }
    ]
  });

  nameAlert.present();

  const nameResp = await nameAlert.onDidDismiss();

  if (nameResp.role === 'cancel') {
    return;
  }

  const highlightAlert = await alertController.create({
    header: 'Pick a style',
    buttons: [
      { text: 'cancel', role: 'cancel' },
      { text: 'ok', role: 'ok' }
    ],
    inputs: [
      {
        name: 'style',
        type: 'radio',
        label: 'Plain',
        value: 'plain'
      },
      {
        name: 'style',
        type: 'radio',
        label: 'With Borders',
        value: 'border'
      }
    ]
  });

  highlightAlert.present();

  const higlightResp = await highlightAlert.onDidDismiss();

  if (higlightResp.role === 'cancel') {
    return;
  }

  const name = nameResp.data.values.name as string;
  const style = higlightResp.data.values as 'plain' | 'border';

  const loading = await showLoading('Creating Collage');

  const selectedCards = cards.value.filter(c => ids.includes(c.id));

  const filename = `kpop-collage-${getDateTimeFileName(new Date())}`;

  const minDuration = delay(2500);

  try {
    const dataUrls = await createImages(selectedCards, { title: name, style });

    const promises = dataUrls.map((data, index) => {
      FileStore.saveToGallery(`${filename}-${index}.jpg`, data);
    });

    await Promise.all(promises);

    await minDuration;

    await showToast({ message: 'Collage saved to gallery!', color: 'success' });
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};

const createBackupFromSelected = async (ids: string[]) => {
  const loading = await showLoading('Creating Backup');

  const selectedCards = cards.value.filter(c => ids.includes(c.id));

  try {
    const resp = await withDelay(createBackup(selectedCards), 2_000);
    if (resp.ok) {
      await showToast({ message: 'Backup created!', color: 'success' });
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};

const deleteSelectedCards = async (ids: string[]) => {
  const resp = await showSimpleAlert({
    header: 'Remove Cards',
    message: 'Once cards are gone, they are gone',
    okName: 'delete',
    okClass: 'danger'
  });

  if (resp !== 'delete') {
    return;
  }

  const loading = await showLoading('Deleting Cards');

  try {
    await deleteCards(ids);
  } catch (error) {
    console.error(error);
  } finally {
    loading.dismiss();
  }
};

const initialCardFilter = computed(() => {
  let filteredCards = [...cards.value];
  if (group.value) filteredCards = filteredCards.filter(c => (c.groupName || '').toUpperCase() === group.value!.toUpperCase());
  if (artist.value) filteredCards = filteredCards.filter(c => c.artist.toUpperCase() === artist.value!.toUpperCase());

  return sortBy(filteredCards, [{ key: 'year', desc: true }, { key: 'whereFromName' }, { key: 'artist' }]);
});

const applyBasicFilter = (cards: KPopCard[]) => {
  if (!filterMissing.value && !filterInTransit.value && !filterWant.value && !filterHave.value) {
    return [...cards];
  }

  return cards.filter(c => {
    return (
      (filterMissing.value && c.ownershipType === 'none') ||
      (filterWant.value && c.ownershipType === 'want') ||
      (filterInTransit.value && c.ownershipType === 'in-transit') ||
      (filterHave.value && c.ownershipType === 'have')
    );
  });
};

const applyAdvancedFilter = (cards: KPopCard[], filters: Filter[]) => {
  if (!filters.length) {
    return [...cards];
  }
  return cards.filter(c => {
    return filters.some(f => {
      const value = (c as any)[f.key];
      return f.values.includes(value);
    });
  });
};

const applyBasicSort = (cards: KPopCard[], sorter: Sorter) => {
  switch (sorter) {
    case 'a-to-z':
      cards.sort((a, b) => a.artist.localeCompare(b.artist));
      break;

    case 'z-to-a':
      cards.sort((a, b) => b.artist.localeCompare(a.artist));
      break;

    case 'old-to-new':
      cards.sort(firstBy('year'));
      break;

    case 'new-to-old':
      cards.sort(firstBy('year', -1));
      break;
  }
};

const filteredCards = computed(() => {
  let cards = applyBasicFilter(initialCardFilter.value);
  cards = applyAdvancedFilter(cards, activeFilters.value);
  applyBasicSort(cards, activeSorter.value);
  return multiSort(cards, ['artist', 'whereFromName', 'albumVersion', 'year'], search.value);
});

const enterAnimation = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot!;

  const backdropAnimation = createAnimation()
    .addElement(root.querySelector('ion-backdrop') as any)
    .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

  const wrapperAnimation = createAnimation()
    .addElement(root.querySelector('.modal-wrapper') as any)
    .keyframes([
      { offset: 0, transform: 'translateX(100%)' },
      { offset: 1, transform: 'translateX(0)' }
    ]);

  return createAnimation().addElement(baseEl).easing('ease-out').duration(250).addAnimation([backdropAnimation, wrapperAnimation]);
};

const leaveAnimation = (baseEl: HTMLElement) => {
  return enterAnimation(baseEl).direction('reverse');
};

const onOpenFilter = async () => {
  const modal = await modalController.create({
    component: FilterModal,
    componentProps: {
      cards: initialCardFilter.value,
      activeFilters: activeFilters.value,
      activeSorter: activeSorter.value
    },
    cssClass: 'modal-fullscreen',
    enterAnimation,
    leaveAnimation
  });

  modal.present();

  const resp = await modal.onWillDismiss<{ filters: Filter[]; sorter: Sorter }>();

  console.log(resp);
  if (resp.role !== 'accept') {
    return;
  }

  activeFilters.value = resp.data!.filters;
  activeSorter.value = resp.data!.sorter;
};
</script>

<style scoped>
.select-count {
  position: absolute;
  top: -1rem;
  left: 2rem;
}

ion-chip {
  --background: var(--ion-color-medium);
  --color: var(--ion-color-light);
}

@media screen and (max-width: 300px) {
  .filter-list > ion-button {
    font-size: 0.6rem;
  }
}

.action-region {
  background: transparent;
  background: linear-gradient(0, rgba(var(--ion-color-warning-rgb), 0.5) 0%, rgba(0, 0, 0, 0) 100%);
  height: 8rem;
}
</style>
