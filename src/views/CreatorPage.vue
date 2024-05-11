<template>
  <BasePage title="Creator" default-back-href="/home">
    <div class="content p-8">
      <div class="upload-pic">
        <KImg height="50vh" :src="imageSrc" background>
          <template #fallback>
            <template v-if="imageSrc">
              <IonIcon class="bad-image-icon" :icon="sadOutline" />
              <p>That image did not appear to work!</p>
              <p>Maybe try a different one?</p>
            </template>
            <template v-else>
              <p>Upload your PC!</p>
            </template>
          </template>
        </KImg>
        <div class="pic-actions">
          <IonButton fill="outline" @click="onTakePicture()">
            <IonIcon slot="icon-only" :icon="cameraOutline" />
          </IonButton>
          <IonButton fill="outline" @click="onGetFromGallery()">
            <IonIcon slot="icon-only" :icon="imagesOutline" />
          </IonButton>
          <IonButton fill="outline" @click="onGetFromUrl()">
            <IonIcon slot="icon-only" :icon="globeOutline" />
          </IonButton>
          <IonButton fill="outline" :disabled="!imageSrc" @click="onEditImage()">
            <IonIcon slot="icon-only" :icon="pencilOutline" />
          </IonButton>
        </div>
      </div>

      <!-- ======= who ======== -->
      <!-- artist -->
      <IonInput class="mt-4" v-model="artist" label="Artist*" label-placement="stacked" fill="outline" inputmode="text" />

      <!-- is soloist selection -->
      <ArtistTypeInput class="mt-4" v-model="artistType" />

      <VTransition :show="artistType === 'group'">
        <IonInput class="mt-4" v-model="groupName" label="Group Name" label-placement="stacked" fill="outline" inputmode="text" />
      </VTransition>

      <!-- ======= where from ======== -->
      <WhereFromInput class="mt-4" v-model="whereFrom" />

      <!-- album -->
      <IonInput
        class="mt-4"
        v-model="whereFromName"
        :label="whereFromNameLabel"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
      />

      <!-- album version (optional) -->
      <VTransition :show="whereFrom === 'album'">
        <IonInput class="mt-4" v-model="albumVersion" label="Album Version" label-placement="stacked" fill="outline" inputmode="text" />
      </VTransition>

      <!-- year -->
      <PickerInput class="mt-4" v-model="year" :options="dateOptions" label="Year" label-placement="stacked" fill="outline" />

      <!-- Ownership -->
      <OwnershipInput class="mt-4" v-model="ownershipType" />

      <IonButton class="mt-6 h-12" expand="block" type="submit" :disabled="!canSubmit" @click="onSubmit()">Add</IonButton>
      <IonButton class="mt-6 h-12" expand="block" router-link="/home">Home</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonInput, modalController } from '@ionic/vue';
import BasePage from './BasePage.vue';
import KImg from '@/components/KImg.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import ArtistTypeInput from '@/components/ArtistTypeInput.vue';
import WhereFromInput from '@/components/WhereFromInput.vue';
import { KPhotoResponse, useImageImport } from '@/composables/imageImport';
import { ref, watch, computed } from 'vue';
import { sadOutline, musicalNotes, calendar, cameraOutline, imagesOutline, globeOutline, pencilOutline } from 'ionicons/icons';
import VTransition from '@/components/VTransition.vue';
import PickerInput from '@/components/PickerInput.vue';
import ImageEditorModal from '@/components/ImageEditorModal.vue';
import type { ArtistType, WhereFrom, OwnershipType, KPopCard } from '@/types';
import { useKPopCards } from '@/composables/kPopCards';

import { newBase64Image } from '@/composables/localFileSystem';

const { takePhoto, photoFromGallery, photoFromUrl, resizeMaxDimension } = useImageImport();
const { addCard, generateId } = useKPopCards();

const thisYear = new Date().getFullYear();
const dateOptions = Array.from({ length: 50 }, (_, i) => {
  const value = `${thisYear - i}`;
  return { text: value, value };
});

const imageSrc = ref('');
const originalImgSrc = ref('');
const artist = ref('J');
const artistType = ref<ArtistType>('group');
const groupName = ref('');

const whereFrom = ref<WhereFrom>('album');
const whereFromName = ref('J');
const albumVersion = ref('');

const year = ref(`${thisYear}`);
const ownershipType = ref<OwnershipType>('none');

const resetForm = () => {
  imageSrc.value = '';
  originalImgSrc.value = '';
  artist.value = '';
  artistType.value = 'group';
  groupName.value = '';
  whereFrom.value = 'album';
  whereFromName.value = '';
  albumVersion.value = '';
  year.value = `${thisYear}`;
  ownershipType.value = 'none';
};

const whereFromNameLabel = computed(() => {
  return whereFrom.value === 'album' ? 'Album*' : 'Event*';
});

const canSubmit = computed(() => {
  return imageSrc.value && artist.value && whereFromName.value;
});

watch(artistType, type => {
  if (type === 'solo') {
    groupName.value = '';
  }
});

const setImage = async (resp: KPhotoResponse) => {
  if (resp.ok) {
    imageSrc.value = resp.photo.base64Uri;
    originalImgSrc.value = resp.photo.base64Uri;
  }
};

const onTakePicture = async () => {
  const resp = await takePhoto();
  await setImage(resp);
};

const onGetFromGallery = async () => {
  const resp = await photoFromGallery();
  await setImage(resp);
};

const onGetFromUrl = async () => {
  const resp = await photoFromUrl();
  await setImage(resp);
};

const onEditImage = async () => {
  const modal = await modalController.create({
    component: ImageEditorModal,
    componentProps: { src: originalImgSrc.value }
  });

  modal.present();

  const resp = await modal.onWillDismiss<string>();
  if (resp.role === 'accept') {
    imageSrc.value = resp.data!;
  }
};

const onSubmit = async () => {
  const scaledImage = await resizeMaxDimension(imageSrc.value, 500);
  const imageFile = await newBase64Image(scaledImage);

  const data: KPopCard = {
    id: generateId(),
    imageFile,
    artist: artist.value,
    artistType: artistType.value,
    groupName: groupName.value,
    whereFrom: whereFrom.value,
    whereFromName: whereFromName.value,
    albumVersion: albumVersion.value,
    year: year.value,
    ownershipType: ownershipType.value
  };

  console.dir(data);

  addCard(data);
  resetForm();
};
</script>

<style scoped>
.bad-image-icon {
  width: 100%;
  height: 100%;
  max-width: 3rem;
  max-height: 3rem;
  margin-bottom: 1rem;
}

.pic-actions {
  display: flex;
}

.pic-actions > * {
  width: 100%;
}
</style>
