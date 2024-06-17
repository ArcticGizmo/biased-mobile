<template>
  <template v-if="loading">
    <RecycleScroller
      class="p-4 h-full"
      :class="`cols-${gridInformation.count}`"
      :items="SKELETON_CARDS"
      :item-size="gridInformation.height"
      :item-secondary-size="gridInformation.width"
      :grid-items="gridInformation.count"
    >
      <template #default="{ index }">
        <KCard :key="index" skeleton />
      </template>
    </RecycleScroller>
  </template>

  <template v-else-if="items.length">
    <RecycleScroller
      class="p-4 h-full"
      :class="`cols-${gridInformation.count}`"
      :items="items"
      :item-size="gridInformation.height"
      :item-secondary-size="gridInformation.width"
      :grid-items="gridInformation.count"
    >
      <template #default="{ item: card, index }">
        <KCard
          :class="{ selected: selected?.includes(card.id) }"
          :key="index"
          :title="card.artist"
          :subtitle="cardSubtitle(card)"
          :src="FileStore.toHref(card.imageFilePath)"
          :status="card.ownershipType"
          @click="emits('select', card)"
          v-touch:hold="() => emits('long-hold', card)"
        />
      </template>
    </RecycleScroller>
  </template>

  <slot v-else name="empty"></slot>
</template>

<script setup lang="ts">
import { FileStore } from '@/composables/fileStore';
import { KPopCard } from '@/types';
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import KCard from './KCard.vue';

defineProps<{ items: KPopCard[]; selected?: string[]; loading?: boolean }>();

const emits = defineEmits<{
  (e: 'select', card: KPopCard): void;
  (e: 'long-hold', card: KPopCard): void;
}>();

const { width } = useWindowSize();

const SKELETON_CARDS = Array.from({ length: 30 }, (v, index) => ({ id: index }));

const getColumnCount = (w: number) => {
  if (w < 300) return 2;
  if (w < 450) return 3;
  if (w < 900) return 4;
  if (w < 1350) return 5;
  return 6;
};

const gridInformation = computed(() => {
  const columnCount = getColumnCount(width.value);
  const gridWidth = width.value / columnCount;

  return { count: columnCount, height: gridWidth / 0.7 + 56, width: gridWidth - 10 };
});

const cardSubtitle = (card: KPopCard) => {
  if (card.albumVersion) {
    return `${card.whereFromName} (${card.albumVersion})`;
  }

  return card.whereFromName;
};
</script>

<style scoped>
:deep(.cols-4 .icon-want),
:deep(.cols-4 .icon-have) {
  font-size: 2rem;
}

:deep(.cols-5 .icon-want),
:deep(.cols-5 .icon-have) {
  font-size: 2rem;
}

:deep(.cols-6 .icon-want),
:deep(.cols-6 .icon-have) {
  font-size: 3rem;
}

.k-card {
  transition: padding 0.1s ease-out;
}

.selected {
  background-color: orange;
  border-color: transparent;
  padding: 0.5rem;
}
</style>
