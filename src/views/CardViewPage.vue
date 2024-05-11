<template>
  <BasePage :title="card?.artist">
    <div v-if="card" class="card-view p-4">
      <KImg :src="card.imageFile.webviewPath" />
      <OwnershipInput :model-value="card.ownershipType" @change="onOwnershipChange" />
      <!-- ======= who ======== -->
      <!-- artist -->
      <IonInput class="mt-4" :model-value="card.artist" label="Artist" label-placement="stacked" fill="outline" inputmode="text" readonly />

      <!-- is soloist selection -->
      <ArtistTypeInput class="mt-4" :model-value="card.artistType" readonly />

      <VTransition :show="card.artistType === 'group'">
        <IonInput
          class="mt-4"
          :model-value="card.groupName"
          label="Group Name"
          label-placement="stacked"
          fill="outline"
          inputmode="text"
          readonly
        />
      </VTransition>

      <!-- ======= where from ======== -->
      <WhereFromInput class="mt-4" :model-value="card.whereFrom" />

      <!-- album -->
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
      <VTransition :show="card.whereFrom === 'album'">
        <IonInput
          class="mt-4"
          :model-value="card.albumVersion"
          label="Album Version"
          label-placement="stacked"
          fill="outline"
          inputmode="text"
          readonly
        />
      </VTransition>

      <!-- year -->
      <IonInput class="mt-4" :model-value="card.year" label="Year" label-placement="stacked" fill="outline" inputmode="text" readonly />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue';
import KImg from '@/components/KImg.vue';
import BasePage from './BasePage.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import ArtistTypeInput from '@/components/ArtistTypeInput.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { OwnershipType } from '@/types';
import VTransition from '@/components/VTransition.vue';

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
