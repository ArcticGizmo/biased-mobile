<template>
  <BasePage title="Home">
    <!-- List of idols -->
    <IonButton router-link="/creator">Creator</IonButton>
    <IonButton @click="clearCards()">Clear</IonButton>
    <IonButton @click="onLog()">Log</IonButton>

    <div class="grid gap-0 grid-cols-3 py-4">
      <KCard
        v-for="(card, index) of cards"
        :key="index"
        :title="card.artist"
        :subtitle="card.whereFromName"
        :src="card.imageFile.webviewPath"
        :status="card.ownershipType"
      />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';
import KCard from '@/components/KCard.vue';

const { cards, clearCards } = useKPopCards();

const onLog = () => console.dir(cards.value);

console.dir(cards);
</script>
