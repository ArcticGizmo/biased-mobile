<template>
  <BasePage title="Home" hide-back-ref>
    <div class="grid gap-0 py-4" :class="colsClass">
      <KCard
        v-for="(card, index) of cards"
        :key="index"
        :title="card.artist"
        :subtitle="card.whereFromName"
        :src="FileStore.toHref(card.imageFilePath)"
        :status="card.ownershipType"
        @click="onOpenCard(card.id)"
      />
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

  return 'grid-cols-5';
});

const router = useSimpleRouter();
const { cards } = useKPopCards();

const onOpenCard = (id: string) => {
  router.push(`/cards/${id}`);
};
</script>
