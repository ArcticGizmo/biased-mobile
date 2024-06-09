<template>
  <BasePage title="My Cards" hide-back-ref fixed-content-height>
    <template #header>
      <div class="flex items-center justify-between w-100 mx-4">
        <h4 class="my-2">My Cards</h4>
        <CardSummary v-if="cards.length" v-bind="cardSummary" />
        <IonButton fill="clear" color="dark" @click="onOpenFilter()">
          <IonIcon slot="icon-only" :icon="filter" />
        </IonButton>
      </div>
    </template>

    <KCardList :items="cards" :loading="isLoading" @select="onOpenCard">
      <template #empty>
        <div class="text-center p-3">
          <div>
            <IonText>Looks like you are about to start your journey!</IonText>
          </div>
          <div>
            <IonButton class="mt-4" router-link="/creator">Add first card!</IonButton>
          </div>
        </div>
      </template>
    </KCardList>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { useSimpleRouter } from '@/composables/router';
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { IonButton, IonIcon, IonText, modalController } from '@ionic/vue';
import { KPopCard, OwnershipType } from '@/types';
import CardSummary from '@/components/CardSummary.vue';
import { filter } from '@/icons';
import FilterModal from '@/components/FilterModal.vue';
import KCardList from '@/components/KCardList.vue';

const router = useSimpleRouter();
const { cards, isLoading } = useKPopCards();

const ownershipCount = (cards: Readonly<KPopCard[]>, type: OwnershipType) => cards.filter(c => c.ownershipType === type).length;

const cardSummary = computed(() => {
  return {
    have: ownershipCount(cards.value, 'have'),
    want: ownershipCount(cards.value, 'want'),
    missing: ownershipCount(cards.value, 'none')
  };
});

const onOpenCard = (card: KPopCard) => {
  router.push(`/cards/${card.id}`);
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

<style scoped></style>
