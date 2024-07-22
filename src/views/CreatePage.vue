<template>
  <BasePage max-width="500px">
    <div class="p-8">
      <CardCreator @submit="onSubmit" />
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { alertController } from '@ionic/vue';
import CardCreator, { type CreatorForm } from '@/components/CardCreator.vue';
import type { KPopCard } from '@/types';
import { FileStore } from '@/composables/fileStore';
import { Base64Uri } from '@/composables/base64';
import { useKPopCards } from '@/composables/kPopCards';
import { useSimpleRouter } from '@/composables/router';

const { addCard, generateId } = useKPopCards();
const router = useSimpleRouter();

const onSubmit = async (formValues: CreatorForm) => {
  const scaledImage = await Base64Uri.fromUri(formValues.imageSrc).compress({ quality: 0.75, maxHeight: 1024, maxWidth: 1024 });
  const fileResult = await FileStore.saveImage(`photo-cards/${generateId()}.${scaledImage.type()}`, scaledImage.toString());
  if (!fileResult.ok) {
    console.error('[create] could not save file to disk', fileResult.error);
    return;
  }
  const data: KPopCard = {
    id: generateId(),
    imageFilePath: fileResult.path,
    artist: formValues.artist,
    artistType: formValues.artistType,
    groupName: formValues.groupName,
    whereFrom: formValues.whereFrom,
    whereFromName: formValues.whereFromName,
    albumVersion: formValues.albumVersion,
    year: formValues.year,
    ownershipType: formValues.ownershipType,
    tags: formValues.tags
  };
  addCard(data);
  const alert = await alertController.create({
    header: 'Added!',
    message: 'Do you still have more to add?',
    buttons: [
      { role: 'more', text: 'Add more' },
      { role: 'done', text: 'Done' }
    ]
  });
  alert.present();
  const resp = await alert.onWillDismiss<void>();
  if (resp.role === 'done') {
    router.back({ fallback: '/home' });
  }
};
</script>
