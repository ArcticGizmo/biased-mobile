<template>
  <BasePage title="My Cards" hide-back-ref>
    <CardSummary v-if="cards.length" class="mt-2" v-bind="cardSummary" />
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
    <div v-if="!cards.length" class="placeholder text-center m-3">
      <IonText>Looks like you are about to start your journey!</IonText>
      <IonButton class="mt-4" router-link="/creator">Add first card!</IonButton>
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
import { IonButton, IonText } from '@ionic/vue';
import { KPopCard, OwnershipType } from '@/types';
import CardSummary from '@/components/CardSummary.vue';

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
