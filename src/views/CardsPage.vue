<template>
  <BasePage title="My Cards" fixed-content-height>
    <template #header>
      <div class="inline-flex w-full">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonSearchbar class="px-2" :style="{ paddingTop: 0, paddingBottom: 0 }" v-model="search" mode="ios" />
        <IonButtons slot="end">
          <IonButton fill="clear" color="dark" @click="onOpenFilter()">
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

    <KCardList :items="filteredCards" :loading="isLoading" @select="onOpenCard">
      <template #empty>
        <div class="text-center p-3">
          <div>
            <IonText>Looks like there is nothing to see here</IonText>
          </div>
          <div>
            <IonButton class="mt-4" router-link="/home">Back to collection</IonButton>
          </div>
        </div>
      </template>
    </KCardList>
  </BasePage>
</template>

<script setup lang="ts">
import { IonSearchbar, IonButtons, IonBackButton, IonButton, IonText, IonIcon } from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';
import BasePage from './BasePage.vue';
import { computed, ref } from 'vue';
import KCardList from '@/components/KCardList.vue';
import { KPopCard } from '@/types';
import FilterItem from '@/components/FilterItem.vue';
import { useSimpleRouter } from '@/composables/router';
import { filter, noCard, starBox } from '@/icons';
import { heart } from 'ionicons/icons';
import { multiSort } from '@/util/sort';

const props = defineProps<{ group?: string; artist?: string }>();

const router = useSimpleRouter();

const search = ref('');
const filterHave = ref(false);
const filterWant = ref(false);
const filterMissing = ref(false);

const { cards, isLoading } = useKPopCards();

const onOpenCard = (card: KPopCard) => {
  router.push(`/cards/${card.id}`);
};

const initialCardFilter = computed(() => {
  if (props.group) {
    return cards.value.filter(c => (c.groupName || '').toUpperCase() === props.group!.toUpperCase());
  }
  if (props.artist) {
    return cards.value.filter(c => c.artist.toUpperCase() === props.artist!.toUpperCase());
  }

  return cards.value;
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

const applyAdvancedFilter = () => {};

const filteredCards = computed(() => {
  const cards = applyBasicFilter(initialCardFilter.value);

  return multiSort(cards, ['artist', 'whereFrom', 'albumVersion'], search.value);
});

const onOpenFilter = () => {
  console.log('--- filter');
};
</script>
