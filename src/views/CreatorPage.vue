<template>
  <BasePage title="Creator">
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
      <IonSegment class="mt-4" v-model="artistType" mode="ios">
        <IonSegmentButton value="group" layout="icon-top">
          <IonLabel>Group</IonLabel>
          <IonIcon :icon="people" />
        </IonSegmentButton>
        <IonSegmentButton value="solo" layout="icon-top">
          <IonLabel>Solo</IonLabel>
          <IonIcon :icon="person" />
        </IonSegmentButton>
      </IonSegment>

      <VTransition :show="artistType === 'group'">
        <IonInput class="mt-4" v-model="groupName" label="Group Name" label-placement="stacked" fill="outline" inputmode="text" />
      </VTransition>

      <!-- ======= where from ======== -->
      <IonSegment class="mt-4" v-model="whereFrom" mode="ios">
        <IonSegmentButton value="album" layout="icon-top">
          <IonLabel>Album</IonLabel>
          <IonIcon :icon="musicalNotes" />
        </IonSegmentButton>
        <IonSegmentButton value="event" layout="icon-top">
          <IonLabel>Event</IonLabel>
          <IonIcon :icon="calendar" />
        </IonSegmentButton>
      </IonSegment>

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
      <IonSegment class="mt-4" v-model="ownershipType" mode="ios">
        <IonSegmentButton value="none" layout="icon-top">
          <IonLabel>Don't Have</IonLabel>
          <IonIcon :icon="closeCircle" color="dark" />
        </IonSegmentButton>

        <IonSegmentButton value="want" layout="icon-top">
          <IonLabel>Want</IonLabel>
          <IonIcon :icon="heart" color="danger" />
        </IonSegmentButton>
        <IonSegmentButton value="have" layout="icon-top">
          <IonLabel>Have</IonLabel>
          <IonIcon :icon="checkmarkCircle" color="success" />
        </IonSegmentButton>
      </IonSegment>

      <IonButton class="mt-6 h-12" expand="block" type="submit" :disabled="!canSubmit" @click="onSubmit()">Add</IonButton>
      <IonButton class="mt-6 h-12" expand="block" router-link="/home">Home</IonButton>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonInput, IonLabel, IonSegment, IonSegmentButton, modalController } from '@ionic/vue';
import BasePage from './BasePage.vue';
import KImg from '@/components/KImg.vue';
import { KPhotoResponse, useImageImport } from '@/composables/imageImport';
import { ref, watch, computed } from 'vue';
import {
  sadOutline,
  people,
  person,
  musicalNotes,
  calendar,
  heart,
  closeCircle,
  checkmarkCircle,
  cameraOutline,
  imagesOutline,
  globeOutline,
  pencilOutline
} from 'ionicons/icons';
import VTransition from '@/components/VTransition.vue';
import PickerInput from '@/components/PickerInput.vue';
import ImageEditorModal from '@/components/ImageEditorModal.vue';
import type { ArtistType, WhereFrom, OwnershipType, KPopCard } from '@/types';
import { useKPopCards } from '@/composables/kPopCards';

import { newBase64Image } from '@/composables/localFileSystem';

const { takePhoto, photoFromGallery, photoFromUrl, resizeMaxDimension } = useImageImport();
const { addCard } = useKPopCards();

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
  console.dir(imageFile);

  const data: KPopCard = {
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
