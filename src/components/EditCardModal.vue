<template>
  <BaseModal title="Edit" max-width="500px" v-touch:swipe.right="onClose" @close="onClose()">
    <div class="p-4">
      <CardCreator :initial="inital" submit-text="Update" @submit="onSubmit" />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/views/BaseModal.vue';
import { modalController } from '@ionic/vue';
import CardCreator, { type CreatorForm } from './CardCreator.vue';
import { computed } from 'vue';
import type { KPopCard } from '@/types';
import { FileStore } from '@/composables/fileStore';
import { Base64Uri } from '@/composables/base64';

import { useKPopCards } from '@/composables/kPopCards';
import { useToast } from '@/composables/toast';

const props = defineProps<{
  card: KPopCard;
}>();

const { updateCard, generateId } = useKPopCards();
const { showToast } = useToast();

const inital = computed<CreatorForm>(() => {
  const c = props.card;
  return {
    imageSrc: FileStore.toHref(c.imageFilePath),
    artist: c.artist,
    artistType: c.artistType,
    groupName: c.groupName,
    whereFrom: c.whereFrom,
    whereFromName: c.whereFromName,
    albumVersion: c.albumVersion,
    year: c.year,
    ownershipType: c.ownershipType,
    tags: [...c.tags]
  };
});

const onClose = () => {
  modalController.dismiss(undefined, 'cancelled');
};

const onSubmit = async (values: CreatorForm) => {
  // need to save a new source if it has changed
  let imageFilePath = props.card.imageFilePath;
  if (values.imageSrc !== FileStore.toHref(props.card.imageFilePath)) {
    const scaledImage = await Base64Uri.fromUri(values.imageSrc).compress({ quality: 0.75, maxHeight: 1024, maxWidth: 1024 });
    const fileResult = await FileStore.saveImage(`photo-cards/${generateId()}.${scaledImage.type()}`, scaledImage.toString());
    if (!fileResult.ok) {
      showToast({ color: 'danger', message: 'Could not save file' });
      return;
    }

    FileStore.remove(props.card.imageFilePath);

    imageFilePath = fileResult.path;
  }

  updateCard(props.card.id, {
    packId: undefined,
    imageFilePath,
    artist: values.artist,
    artistType: values.artistType,
    groupName: values.groupName,
    whereFrom: values.whereFrom,
    whereFromName: values.whereFromName,
    albumVersion: values.albumVersion,
    year: values.year,
    ownershipType: values.ownershipType,
    tags: values.tags
  });
  showToast({ color: 'success', message: 'Card Updated!' });
  modalController.dismiss(undefined, 'updated');
};
</script>
