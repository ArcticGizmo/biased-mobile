<template>
  <BasePage title="My Cards" hide-back-ref>
    <template #header>
      <div class="flex items-center justify-between w-100 mx-4">
        <h4 class="my-2">My Cards</h4>
        <CardSummary v-if="cards.length" v-bind="cardSummary" />
        <IonButton fill="clear" color="dark" @click="onOpenFilter()">
          <IonIcon slot="icon-only" :icon="filter" />
        </IonButton>
      </div>
    </template>

    <template v-if="cards.length">
      <div class="grid gap-0 py-4" :class="colsClass">
        <KCard
          v-for="(card, index) of cards"
          :key="index"
          :title="card.artist"
          :subtitle="cardSubtitle(card)"
          :src="FileStore.toHref(card.imageFilePath)"
          :status="card.ownershipType"
          @click="onOpenCard(card.id)"
        />
      </div>
    </template>
    <div v-else class="placeholder text-center m-3">
      <div>
        <IonText>Looks like you are about to start your journey!</IonText>
      </div>
      <div>
        <IonButton class="mt-4" router-link="/creator">Add first card!</IonButton>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { useSimpleRouter } from '@/composables/router';
import { useKPopCards } from '@/composables/kPopCards';
import KCard from '@/components/KCard.vue';
import { FileStore } from '@/composables/fileStore';
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';
import { IonButton, IonIcon, IonText, IonTitle, modalController } from '@ionic/vue';
import { KPopCard, OwnershipType } from '@/types';
import CardSummary from '@/components/CardSummary.vue';
import { filter } from '@/icons';
import FilterModal from '@/components/FilterModal.vue';

const { width } = useWindowSize();

const colsClass = computed(() => {
  const w = width.value;

  if (w < 300) {
    return 'grid-cols-2';
  }

  if (w < 450) {
    return 'grid-cols-3';
  }

  if (w < 900) {
    return 'grid-cols-4';
  }

  if (w < 1350) {
    return 'grid-cols-5';
  }

  return 'grid-cols-6';
});

const router = useSimpleRouter();
const { cards } = useKPopCards();

const ownershipCount = (cards: Readonly<KPopCard[]>, type: OwnershipType) => cards.filter(c => c.ownershipType === type).length;

const cardSummary = computed(() => {
  return {
    have: ownershipCount(cards.value, 'have'),
    want: ownershipCount(cards.value, 'want'),
    missing: ownershipCount(cards.value, 'none')
  };
});

const onOpenCard = (id: string) => {
  router.push(`/cards/${id}`);
};

const cardSubtitle = (card: KPopCard) => {
  if (card.albumVersion) {
    return `${card.whereFromName} (${card.albumVersion})`;
  }

  return card.whereFromName;
};

const onOpenFilter = async () => {
  const modal = await modalController.create({
    component: FilterModal,
    cssClass: 'modal-fullscreen'
  });

  modal.present();

  const resp = await modal.onWillDismiss();
  console.dir(resp);
};
</script>

<style scoped>
:deep(.grid-cols-4 .icon-want),
:deep(.grid-cols-4 .icon-have) {
  font-size: 2rem;
}

:deep(.grid-cols-5 .icon-want),
:deep(.grid-cols-5 .icon-have) {
  font-size: 2rem;
}

:deep(.grid-cols-6 .icon-want),
:deep(.grid-cols-6 .icon-have) {
  font-size: 3rem;
}
</style>
