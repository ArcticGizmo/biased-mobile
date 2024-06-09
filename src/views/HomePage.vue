<template>
  <BasePage title="My Cards" hide-back-ref>
    <template #header>
      <IonSearchbar class="px-2" :style="{ paddingTop: 0, paddingBottom: 0 }" v-model="search" mode="ios" />
      <div class="filter-items mx-2">
        <FilterItem :icon="people" text="Group" :model-value="grouping === 'group'" @click="grouping = 'group'" />
        <FilterItem :icon="person" text="Artist" :model-value="grouping === 'artist'" @click="grouping = 'artist'" />
        <FilterItem text="All" @click="onSelectEverything()" />
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <IonSpinner name="dots" />
    </div>

    <div v-else-if="!cards.length" class="text-center p-3">
      <div>
        <IonText>Looks like you are about to start your journey!</IonText>
      </div>
      <div>
        <IonButton class="mt-4" router-link="/creator">Add your first card!</IonButton>
      </div>
    </div>

    <div v-else-if="!items.length" class="text-center p-3">No matches</div>

    <div v-else class="grouping-list">
      <IonCard v-for="(item, index) of items" :key="index" @click="onItemGroupSelect(item)">
        <IonCardHeader>
          <IonCardTitle>{{ item.title }}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div class="summary flex flex-cols gap-4">
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="starBox" color="warning" />
              <IonText>{{ item.summary.have }}</IonText>
            </div>
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="heart" color="danger" />
              <IonText>{{ item.summary.want }}</IonText>
            </div>
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="noCard" color="medium" />
              <IonText>{{ item.summary.missing }}</IonText>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { useSimpleRouter } from '@/composables/router';
import { useKPopCards } from '@/composables/kPopCards';
import { computed, ref } from 'vue';
import { IonButton, IonSearchbar, IonText, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonSpinner, IonIcon } from '@ionic/vue';
import FilterItem from '@/components/FilterItem.vue';
import { heart, people, person } from 'ionicons/icons';
import { sort } from '@/util/sort';
import { KPopCard, OwnershipType } from '@/types';
import { noCard, starBox } from '@/icons';

type Grouping = 'group' | 'artist';

interface ItemGroup {
  title: string;
  summary: CardSummary;
  value: string;
  type: Grouping;
}

interface CardSummary {
  have: number;
  want: number;
  missing: number;
}

const search = ref('');
const grouping = ref<Grouping>('group');

const router = useSimpleRouter();
const { cards, isLoading } = useKPopCards();

const ownershipCount = (cards: KPopCard[], type: OwnershipType) => cards.filter(c => c.ownershipType === type).length;

const getCardSummary = (cards: KPopCard[]): CardSummary => {
  return {
    have: ownershipCount(cards, 'have'),
    want: ownershipCount(cards, 'want'),
    missing: ownershipCount(cards, 'none')
  };
};

function groupBy<T>(items: T[], grouper: (item: T) => any) {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const key = grouper(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
  }

  return groups;
}

const artistItems = computed<ItemGroup[]>(() => {
  const groups = groupBy(cards.value, c => c.artist);

  return Object.entries(groups).map(([artist, cards]) => {
    return {
      title: artist,
      summary: getCardSummary(cards),
      value: artist,
      type: 'artist'
    };
  });
});

const groupItems = computed<ItemGroup[]>(() => {
  const groups = groupBy(cards.value, c => c.groupName);

  return Object.entries(groups).map(([group, cards]) => {
    return {
      title: group,
      summary: getCardSummary(cards),
      value: group,
      type: 'group'
    };
  });
});

const items = computed(() => {
  const items = grouping.value === 'group' ? [...groupItems.value] : [...artistItems.value];
  items.sort((a, b) => a.title.localeCompare(b.title));
  return sort(items, x => x.title, search.value);
});

const onItemGroupSelect = (item: ItemGroup) => {
  const query = item.type === 'group' ? { group: item.value } : { artist: item.value };
  router.push({ path: '/cards', query });
};

const onSelectEverything = () => {
  router.push('/cards');
};
</script>

<style scoped></style>
