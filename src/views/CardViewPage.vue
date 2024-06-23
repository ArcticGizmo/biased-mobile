<template>
  <BasePage :title="card?.artist" max-width="500px">
    <div v-if="card" class="card-view p-4">
      <IonIcon class="top-5 right-5 absolute" :icon="trash" size="large" color="danger" @click="onDelete()" />
      <KImg :src="FileStore.toHref(card.imageFilePath)" :aspect-ratio="0.7" style="margin: auto" max-width="350px" />
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
import { IonIcon, IonInput } from '@ionic/vue';
import KImg from '@/components/KImg.vue';
import BasePage from './BasePage.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { OwnershipType } from '@/types';
import { FileStore } from '@/composables/fileStore';
import { trash } from '@/icons';
import { showSimpleAlert } from '@/composables/modals';
import { useToast } from '@/composables/toast';
import { useSimpleRouter } from '@/composables/router';

const props = defineProps<{
  id: string;
}>();

const { cards, update, deleteCard } = useKPopCards();
const { showToast } = useToast();
const router = useSimpleRouter();

const card = computed(() => cards.value.find(c => c.id === props.id));

const whereFromNameLabel = computed(() => {
  return card.value?.whereFrom === 'album' ? 'Album' : 'Event';
});

const onOwnershipChange = (ownershipType: OwnershipType) => {
  update(props.id, { ownershipType });
};

const onDelete = async () => {
  const resp = await showSimpleAlert({
    header: 'Remove Card',
    message: 'Once the card is gone, its gone',
    okName: 'delete',
    okClass: 'danger'
  });

  if (resp !== 'delete') {
    return;
  }

  try {
    await deleteCard(props.id);
    await showToast({ color: 'success', message: 'Card deleted!' });
    router.back({ fallback: '/' });
  } catch (error) {
    console.error('unable to remove card', error);
  }
};
</script>

<style scoped></style>
