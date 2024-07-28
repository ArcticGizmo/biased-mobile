<template>
  <BasePage :title="card?.artists.join(', ')" max-width="500px" default-back-href="/">
    <div v-if="card" class="card-view p-4">
      <div class="absolute top-5 right-5 flex flex-col">
        <IonIcon :icon="trash" size="large" color="danger" @click="onDelete()" />
        <IonIcon class="mt-3" :icon="pencil" size="large" color="primary" @click="onEdit()" />
      </div>

      <KImg :src="FileStore.toHref(card.imageFilePath)" :aspect-ratio="0.7" style="margin: auto" max-width="350px" />
      <OwnershipInput :model-value="card.ownershipType" @change="onOwnershipChange" />
      <!-- ======= who ======== -->
      <IonInput
        v-if="card.artists.length === 1"
        class="mt-4"
        :model-value="card.artists[0]"
        mode="md"
        label="Artist"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
        readonly
      />
      <template v-else>
        <IonLabel class="mt-4">{{ card.artists.length === 1 ? 'Artist' : 'Artists' }}</IonLabel>
        <IonInput
          v-for="(artist, index) of card.artists"
          :key="index"
          :model-value="artist"
          mode="md"
          fill="outline"
          inputmode="text"
          readonly
        />
      </template>

      <IonInput
        v-if="card.artistType === 'group'"
        class="mt-4"
        :model-value="card.groupName"
        mode="md"
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
        mode="md"
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
        mode="md"
        label="Album Version"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
        readonly
      />

      <!-- year -->
      <IonInput
        class="mt-4"
        :model-value="card.year"
        mode="md"
        label="Released"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
        readonly
      />

      <!-- tags -->
      <div class="mt-4">Tags</div>
      <div v-if="!selectedTags.length" class="italic opacity-50">--none--</div>
      <div v-else>
        <ion-chip v-for="(tag, index) in selectedTags" :key="index">
          <IonIcon :icon="tag.icon" />
          <span>{{ tag.text }}</span>
        </ion-chip>
      </div>

      <!-- Debug information about the packs -->
      <div v-if="ENV.IS_DEV" class="mt-4">
        <IonLabel>Packs</IonLabel>
        <div v-if="!packIds.length" class="italic opacity-50">--none--</div>
        <ul v-else>
          <li v-for="packId of packIds" :key="packId" class="pl-4">- {{ packId }}</li>
        </ul>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonIcon, IonInput, IonChip, modalController, IonLabel } from '@ionic/vue';
import KImg from '@/components/KImg.vue';
import BasePage from './BasePage.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import { useKPopCards } from '@/composables/kPopCards';
import { computed } from 'vue';
import { OwnershipType } from '@/types';
import { FileStore } from '@/composables/fileStore';
import { trash, pencil } from '@/icons';
import { showSimpleAlert } from '@/composables/modals';
import { useToast } from '@/composables/toast';
import { useSimpleRouter } from '@/composables/router';
import { getFilteredTags } from '@/types/tags';
import EditCardModal from '@/components/EditCardModal.vue';
import { ENV } from '@/env';
import { usePackHistory } from '@/composables/packs';

const props = defineProps<{
  id: string;
}>();

const { cards, updateCard, deleteCard } = useKPopCards();
const { packHistories } = usePackHistory();
const { showToast } = useToast();
const router = useSimpleRouter();

const card = computed(() => cards.value.find(c => c.id === props.id));

const whereFromNameLabel = computed(() => {
  return card.value?.whereFrom === 'album' ? 'Album' : 'Event';
});

const selectedTags = computed(() => getFilteredTags(card.value?.tags || []));
const packIds = computed(() => packHistories.value.filter(p => p.cardIds.includes(props.id)).map(p => p.id));

const onOwnershipChange = (ownershipType: OwnershipType) => {
  updateCard(props.id, { ownershipType });
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

const onEdit = async () => {
  const modal = await modalController.create({
    component: EditCardModal,
    componentProps: { card: card.value },
    cssClass: 'modal-fullscreen'
  });

  modal.present();

  await modal.onWillDismiss();
};
</script>
