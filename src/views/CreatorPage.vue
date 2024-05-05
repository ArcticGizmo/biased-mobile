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
        <IonButton @click="onTakePicture()">Camera</IonButton>
        <IonButton @click="onGetFromGallery()">Gallery</IonButton>
        <IonButton @click="onGetFromUrl()">From URL</IonButton>
      </div>

      <!-- ======= who ======== -->
      <!-- artist -->
      <IonInput class="mt-4" v-model="artist" label="Artist" label-placement="stacked" fill="outline" inputmode="text" />

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
      <IonSegment class="mt-4" v-model="whereType" mode="ios">
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
        v-model="albumOrEventName"
        :label="albumbOrEventNameLabel"
        label-placement="stacked"
        fill="outline"
        inputmode="text"
      />

      <!-- album version (optional) -->
      <VTransition :show="whereType === 'album'">
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
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonInput, IonLabel, IonSegment, IonSegmentButton } from '@ionic/vue';
import BasePage from './BasePage.vue';
import KImg from '@/components/KImg.vue';
import { KPhotoResponse, useImageImport } from '@/composables/imageImport';
import { ref, watch, computed } from 'vue';
import { sadOutline, people, person, musicalNotes, calendar, heart, book, checkbox, closeCircle, checkmarkCircle } from 'ionicons/icons';
import VTransition from '@/components/VTransition.vue';
import PickerInput from '@/components/PickerInput.vue';

type ArtistType = 'group' | 'solo';
type WhereType = 'album' | 'event';
type OwnershipType = 'have' | 'want' | 'none';

const { takePhoto, photoFromGallery, photoFromUrl } = useImageImport();

const thisYear = new Date().getFullYear();
const dateOptions = Array.from({ length: 50 }, (_, i) => {
  const value = `${thisYear - i}`;
  return { text: value, value };
});

const imageSrc = ref('');
const artist = ref('');
const artistType = ref<ArtistType>('group');
const groupName = ref('');

const whereType = ref<WhereType>('album');
const albumOrEventName = ref('');
const albumVersion = ref('');

const year = ref(`${thisYear}`);
const ownershipType = ref<OwnershipType>('none');

const albumbOrEventNameLabel = computed(() => {
  return whereType.value === 'album' ? 'Album' : 'Event';
});

watch(artistType, type => {
  if (type === 'solo') {
    groupName.value = '';
  }
});

const setImage = (resp: KPhotoResponse) => {
  if (resp.ok) {
    imageSrc.value = resp.photo.base64Uri;
  }
};

const onTakePicture = async () => {
  const resp = await takePhoto();
  setImage(resp);
};

const onGetFromGallery = async () => {
  const resp = await photoFromGallery();
  setImage(resp);
};

const onGetFromUrl = async () => {
  const resp = await photoFromUrl();
  setImage(resp);
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
</style>
