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
        <FilterItem v-model="filterHave" :icon="starBox" text="Have" />
        <FilterItem v-model="filterWant" :icon="heart" text="Want" />
        <FilterItem v-model="filterMissing" :icon="noCard" text="Missing" />
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

    <KCardList v-else :items="filteredCards" :loading="isLoading" @select="onOpenCard">
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
import { filter, noCard, starBox } from '@/icons';
import { heart } from 'ionicons/icons';
import { multiSort, sortBy } from '@/util/sort';
import FilterModal, { type Filter } from '@/components/FilterModal.vue';
import { useQueryParam } from '@/composables/useQueryParam';

const group = useQueryParam('group');
const artist = useQueryParam('artist');

const router = useSimpleRouter();

const search = ref('');
const filterHave = ref(false);
const filterWant = ref(false);
const filterMissing = ref(false);

const activeFilters = ref<Filter[]>([]);

const { cards, isLoading } = useKPopCards();

const onOpenCard = (card: KPopCard) => {
  router.push(`/cards/${card.id}`);
};

const initialCardFilter = computed(() => {
  let filteredCards = [...cards.value];
  if (group.value) filteredCards = filteredCards.filter(c => (c.groupName || '').toUpperCase() === group.value!.toUpperCase());
  if (artist.value) filteredCards = filteredCards.filter(c => c.artist.toUpperCase() === artist.value!.toUpperCase());

  return sortBy(filteredCards, [{ key: 'year', desc: true }, { key: 'whereFromName' }, { key: 'artist' }]);
});

const applyBasicFilter = (cards: KPopCard[]) => {
  if (!filterHave.value && !filterWant.value && !filterMissing.value) {
    return [...cards];
  }

  return cards.filter(c => {
    return (
      (filterHave.value && c.ownershipType === 'have') ||
      (filterWant.value && c.ownershipType === 'want') ||
      (filterMissing.value && c.ownershipType === 'none')
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
