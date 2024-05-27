<template>
  <BasePage :title="card?.artist">
    <div v-if="card" class="card-view p-4">
      <KImg :src="FileStore.toHref(card.imageFilePath)" style="margin: auto" max-width="350px" />
      <OwnershipInput :model-value="card.ownershipType" @change="onOwnershipChange" />
      <!-- ======= who ======== -->
      <IonInput
        v-if="card.artistType === 'group'"
        class="mt-4"
        :model-value="card.groupName"
        label="Group"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
        readonly
      />

      <!-- where from -->
      <IonInput
        class="mt-4"
        :model-value="card.whereFromName"
        :label="whereFromNameLabel"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
        readonly
      />

      <!-- album version (optional) -->
      <IonInput
        v-if="card.albumVersion"
        class="mt-4"
        :model-value="card.albumVersion"
        label="Album Version"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
        readonly
      />

      <!-- year -->
      <IonInput class="mt-4" :model-value="card.year" label="Released" label-placement="stacked" fill="outline" inputmode="text" readonly />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue';
import KImg from '@/components/KImg.vue';
import BasePage from './BasePage.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { OwnershipType } from '@/types';
import { FileStore } from '@/composables/fileStore';

const props = defineProps<{
  id: string;
}>();

const { cards, update } = useKPopCards();

const card = computed(() => cards.value.find(c => c.id === props.id));

const whereFromNameLabel = computed(() => {
  return card.value?.whereFrom === 'album' ? 'Album' : 'Event';
});

const onOwnershipChange = (ownershipType: OwnershipType) => {
  update(props.id, { ownershipType });
};
</script>

<style scoped></style>
