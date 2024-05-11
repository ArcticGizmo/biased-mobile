<template>
  <BasePage title="Home" hide-back-ref>
    <!-- List of idols -->
    <IonButton router-link="/creator">Creator</IonButton>
    <IonButton @click="clearCards()">Clear</IonButton>

    <div class="grid gap-0 grid-cols-3 py-4">
      <KCard
        v-for="(card, index) of cards"
        :key="index"
        :title="card.artist"
        :subtitle="card.whereFromName"
        :src="card.imageFile.webviewPath"
        :status="card.ownershipType"
        @click="onOpenCard(card.id)"
      />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { useSimpleRouter } from '@/composables/router';
import { useKPopCards } from '@/composables/kPopCards';
import KCard from '@/components/KCard.vue';

const router = useSimpleRouter();
const { cards, clearCards } = useKPopCards();

const onOpenCard = (id: string) => {
  router.push(`/cards/${id}`);
};
</script>
