<template>
  <BasePage title="Home" pad>
    <!-- List of idols -->
    <IonButton router-link="/creator">Creator</IonButton>
    <IonButton @click="clearCards()">Clear</IonButton>
    <IonButton @click="onLog()">Log</IonButton>

    <div class="p-4">
      <div v-for="(card, index) of cards" :key="index">
        {{ index }} {{ card.artist }}

        <IonImg :src="card.imageFile.webviewPath" />
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton, IonImg } from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';

const { cards, clearCards } = useKPopCards();

const onLog = () => console.dir(cards.value);
</script>
