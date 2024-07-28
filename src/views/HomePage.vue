<template>
  <BasePage :class="{ 'show-background': section !== 'list' }" :fixed-content-height="section !== 'list'" max-width="500px">
    <template #header>
      <IonSearchbar class="px-2 my-0.5" v-model="search" />
      <div class="mx-2 mb-1">
        <FilterItem :icon="people" text="By Group" :model-value="grouping === 'group'" @click="grouping = 'group'" />
        <FilterItem :icon="person" text="By Artist" :model-value="grouping === 'artist'" @click="grouping = 'artist'" />
        <FilterItem text="All" @click="onSelectEverything()" />
      </div>
    </template>
    <div v-if="section === 'list'" class="grouping-list">
      <IonCard
        v-for="(item, index) of items"
        :key="index"
        v-touch:hold="onItemGroupLongSelectDelegate(index)"
        @click="onItemGroupSelect(item)"
      >
        <IonCardHeader>
          <ion-label class="text-2xl" color="medium">{{ item.title || 'Unknown' }}</ion-label>
        </IonCardHeader>
        <IonCardContent>
          <div class="summary flex flex-cols gap-4">
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="checkmarkCircle" color="owned" />
              <IonText>{{ item.summary.have }}</IonText>
            </div>
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="paperPlane" color="pending" />
              <IonText>{{ item.summary.inTransit }}</IonText>
            </div>
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="heart" color="love" />
              <IonText>{{ item.summary.want }}</IonText>
            </div>
            <div>
              <IonIcon class="mr-1" :style="{ marginBottom: '-2px' }" :icon="noCard" />
              <IonText>{{ item.summary.missing }}</IonText>
            </div>
          </div>
        </IonCardContent>
        <div class="absolute top-0 right-0 h-full w-16 flex items-center justify-end pr-4">
          <IonIcon :icon="chevronForward" size="large" color="secondary" />
        </div>
      </IonCard>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-full">
      <template v-if="section === 'loading'">
        <IonSpinner name="dots" />
      </template>
      <template v-else-if="section === 'getting-started'">
        <IonText>Looks like you are about to start your journey!</IonText>
        <div>
          <IonButton class="mt-4" expand="block" fill="outline" router-link="/packs">Open a pack!</IonButton>
          <IonButton class="mt-4" expand="block" fill="outline" router-link="/create">Create your own!</IonButton>
        </div>
      </template>
      <template v-else-if="section === 'no-match'"> No Matches </template>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { useSimpleRouter } from '@/composables/router';
import { useKPopCards } from '@/composables/kPopCards';
import { computed, ref } from 'vue';
import {
  IonButton,
  IonSearchbar,
  IonText,
  IonCard,
  IonLabel,
  IonCardHeader,
  IonCardContent,
  IonSpinner,
  IonIcon,
  actionSheetController
} from '@ionic/vue';
import FilterItem from '@/components/FilterItem.vue';
import { heart, paperPlane, people, person, checkmarkCircle, chevronForward } from 'ionicons/icons';
import { sort } from '@/util/sort';
import { KPopCard, OwnershipType } from '@/types';
import { noCard } from '@/icons';
import { groupBy } from '@/util/groupBy';
import { useInitialLoad } from '@/composables/initialLoad';
import { executeWithLoading, showSimpleAlert } from '@/composables/modals';
import { usePackHistory } from '@/composables/packs';

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
  inTransit: number;
  missing: number;
}

const search = ref('');
const grouping = ref<Grouping>('group');

const router = useSimpleRouter();
const { cards, isLoading, deleteCards } = useKPopCards();
const { deletePack } = usePackHistory();
const { loading: initialLoading } = useInitialLoad(1000);

const ownershipCount = (cards: KPopCard[], type: OwnershipType) => cards.filter(c => c.ownershipType === type).length;

const getCardSummary = (cards: KPopCard[]): CardSummary => {
  return {
    have: ownershipCount(cards, 'have'),
    want: ownershipCount(cards, 'want'),
    inTransit: ownershipCount(cards, 'in-transit'),
    missing: ownershipCount(cards, 'none')
  };
};

const artistItems = computed<ItemGroup[]>(() => {
  // TODO: I don't think this will work
  const artists = groupBy(cards.value, c => c.artists);

  return Object.entries(artists).map(([artist, cards]) => {
    return {
      title: artist,
      summary: getCardSummary(cards),
      value: artist,
      type: 'artist'
    };
  });
});

const groupItems = computed<ItemGroup[]>(() => {
  const groups = groupBy(
    cards.value.filter(c => !!c.groupName),
    c => c.groupName
  );

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

const section = computed(() => {
  if (initialLoading.value || isLoading.value) return 'loading';
  if (!cards.value.length) return 'getting-started';
  if (!items.value.length) return 'no-match';
  return 'list';
});

const onItemGroupSelect = (item: ItemGroup) => {
  const query = item.type === 'group' ? { group: item.value } : { artist: item.value };
  router.push({ path: '/cards', query });
};

const onSelectEverything = () => {
  router.push('/cards');
};

function onItemGroupLongSelectDelegate(index: number) {
  return () => {
    const item = items.value[index];
    if (!item) {
      return;
    }
    onItemGroupLongSelect(item);
  };
}

const onItemGroupLongSelect = async (item: ItemGroup) => {
  const actionSheet = await actionSheetController.create({
    buttons: [
      { text: 'View', data: 'view' },
      { text: 'Delete', data: 'delete', role: 'destructive' },
      { text: 'Cancel', role: 'cancel' }
    ]
  });

  actionSheet.present();

  const resp = await actionSheet.onWillDismiss();

  if (!resp.data) {
    return;
  }

  if (resp.data === 'view') {
    onItemGroupSelect(item);
    return;
  }

  const deleteResp = await showSimpleAlert({
    header: `Delete ${item.value}?`,
    message: `This will remove all your cards for this ${item.type === 'group' ? 'group' : 'artist'}`,
    okName: 'delete',
    okClass: 'danger'
  });

  if (deleteResp !== 'delete') {
    return;
  }

  if (item.type === 'group') {
    executeWithLoading(async () => {
      const groupName = item.value.toUpperCase();
      const cardsToDelete = cards.value.filter(c => c.groupName?.toUpperCase() === groupName);
      const packs = [...new Set(cardsToDelete.map(c => c.packId))].filter(c => !!c) as string[];

      await deleteCards(cardsToDelete.map(c => c.id));
      for (const pack of packs) {
        await deletePack(pack);
      }
    }, 'Deleting group');
  } else if (item.type === 'artist') {
    executeWithLoading(async () => {
      const artistUp = item.value.toUpperCase();
      const cardsToDelete = cards.value.filter(c => c.artists.some(a => a.toUpperCase() === artistUp));
      const packs = [...new Set(cardsToDelete.map(c => c.packId))].filter(c => !!c) as string[];

      await deleteCards(cardsToDelete.map(c => c.id));
      for (const pack of packs) {
        await deletePack(pack);
      }
    }, 'Deleting artist');
  }
};
</script>

<style scoped>
.show-background :deep(ion-content::part(background)) {
  background-image: url('@/assets/icon.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.025 !important;
}
</style>
