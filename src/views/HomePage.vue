<template>
  <BasePage title="Home" pad>
    <!-- List of idols -->
    <IonButton router-link="/creator">Creator</IonButton>

    <div class="p-4">
      <div v-for="(card, index) of cards" :key="index">{{ index }} {{ card.artist }}</div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonButton } from '@ionic/vue';
import { useKPopCards } from '@/composables/kPopCards';

const { cards } = useKPopCards();
</script>
