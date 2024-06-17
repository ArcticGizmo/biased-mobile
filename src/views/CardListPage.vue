<template>
  <BasePage title="My Cards" fixed-content-height>
    <template #header>
      <div class="inline-flex w-full">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonSearchbar class="px-2" :style="{ paddingTop: 0, paddingBottom: 0 }" v-model="search" mode="ios" />
        <IonButtons slot="end">
          <IonButton fill="clear" color="dark" :disabled="!initialCardFilter.length" @click="onOpenFilter()">
            <IonIcon slot="icon-only" :icon="filter" />
          </IonButton>
        </IonButtons>
      </div>

      <div class="filter-items mx-2">
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
        <IonButton class="mt-4" router-link="/creator">Add your first card!</IonButton>
      </div>
    </div>

    <KCardList v-else :items="filteredCards" :loading="isLoading" @select="onSelectCard" @long-select="onLongSelectCard">
      <template #empty>
        <div class="text-center p-3">No matches</div>
      </template>
    </KCardList>
  </BasePage>
</template>

<script setup lang="ts">
import { IonSearchbar, IonButtons, IonBackButton, IonButton, IonText, IonIcon, modalController } from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';
import BasePage from './BasePage.vue';
import { computed, ref } from 'vue';
import KCardList from '@/components/KCardList.vue';
import { KPopCard } from '@/types';
import FilterItem from '@/components/FilterItem.vue';
import { useSimpleRouter } from '@/composables/router';
import { filter, noCard } from '@/icons';
import { checkmarkCircle, heart, paperPlane } from 'ionicons/icons';
import { multiSort, sortBy } from '@/util/sort';
import FilterModal, { type Filter } from '@/components/FilterModal.vue';
import { useQueryParam } from '@/composables/useQueryParam';
import { dialogController } from '@/composables/dialogController';
import KCardActionSheet from '@/components/KCardActionSheet.vue';
import { showSimpleAlert } from '@/composables/modals';
import { useToast } from '@/composables/toast';

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

const { cards, deleteCard, isLoading } = useKPopCards();

const onSelectCard = async (card: KPopCard) => {
  const actionResp = await dialogController.create({
    component: KCardActionSheet,
    componentProps: { id: card.id }
  });

  if (actionResp.role === 'view') {
    router.push(`/cards/${card.id}`);
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
    await deleteCard(card.id);
  } catch (error) {
    console.error('unable to remove card', error);
    await showToast({ color: 'danger', message: "Sorry, that didn't work" });
  }
};

const onLongSelectCard = (card: KPopCard) => {
  console.log('--- long select');
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

const filteredCards = computed(() => {
  let cards = applyBasicFilter(initialCardFilter.value);
  cards = applyAdvancedFilter(cards, activeFilters.value);
  return multiSort(cards, ['artist', 'whereFromName', 'albumVersion', 'year'], search.value);
});

const onOpenFilter = async () => {
  const modal = await modalController.create({
    component: FilterModal,
    componentProps: { cards: initialCardFilter.value, activeFilters: activeFilters.value },
    cssClass: 'modal-fullscreen'
  });

  modal.present();

  const resp = await modal.onWillDismiss<Filter[]>();

  if (resp.role !== 'accept') {
    return;
  }

  activeFilters.value = resp.data!;
};
</script>
