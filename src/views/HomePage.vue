<template>
  <BasePage title="Home" pad>
    <!-- List of idols -->
    <IonButton router-link="/creator">Creator</IonButton>
    <IonButton @click="clear()">Clear</IonButton>

    <div class="p-4">
      <div v-for="(card, index) of cards" :key="index">
        {{ index }} {{ card.artist }}

        <IonImg :src="card.imageSrc" />
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton, IonImg } from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';

const { cards, clear } = useKPopCards();
</script>
