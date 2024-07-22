<template>
  <!-- <div class="upload-pic">
    <KImg :src="imageSrc" background height="50vh">
      <template #fallback>
        <p>Upload your PC!</p>
      </template>
      <template #error>
        <IonIcon class="bad-image-icon" :icon="imageBroken" />
        <p>That image did not appear to work!</p>
        <p>Maybe try a different one?</p>
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
        <IonIcon slot="icon-only" :icon="web" />
      </IonButton>
      <IonButton fill="outline" :disabled="!imageSrc" @click="onEditImage()">
        <IonIcon slot="icon-only" :icon="pencil" />
      </IonButton>
    </div>
  </div> -->

  <!-- ======= who ======== -->
  <!-- artist -->
  <IonFormInput name="artist" label="Artist" />
  <!-- <IonInput
    name="artist"
    :value="artistField.value.value"
    class="mt-4 ion-touched ion-invalid"
    mode="md"
    label="Artist*"
    label-placement="stacked"
    fill="outline"
    inputmode="text"
    :error-text="artistField.errorMessage.value"
    @ion-change="artistField.handleChange"
  /> -->

  <!-- is soloist selection -->
  <!-- <ArtistTypeInput class="mt-4" v-model="artistType" /> -->

  <VTransition :show="artistType === 'group'">
    <!-- <IonInput class="mt-4" v-model="groupName" mode="md" label="Group Name*" label-placement="stacked" fill="outline" inputmode="text" /> -->
  </VTransition>

  <!-- ======= where from ======== -->
  <!-- <WhereFromInput class="mt-4" v-model="whereFrom" /> -->

  <!-- album -->
  <!-- <IonInput
    class="mt-4"
    v-model="whereFromName"
    mode="md"
    :label="whereFromNameLabel"
    label-placement="stacked"
    fill="outline"
    inputmode="text"
  /> -->

  <!-- album version (optional) -->
  <VTransition :show="whereFrom === 'album'">
    <!-- <IonInput
      class="mt-4"
      v-model="albumVersion"
      mode="md"
      label="Album Version"
      label-placement="stacked"
      fill="outline"
      inputmode="text"
    /> -->
  </VTransition>

  <!-- year -->
  <!-- <PickerInput class="mt-4" v-model="year" :options="dateOptions" label="Released" label-placement="stacked" fill="outline" /> -->

  <!-- Ownership -->
  <div class="mt-4">Ownership</div>
  <!-- <OwnershipInput v-model="ownershipType" /> -->

  <!-- tags -->
  <div class="mt-4">Tags</div>
  <!-- <TagInput v-model="tags" /> -->

  <IonButton class="mt-6 h-12" expand="block" type="submit" :disabled="!meta.valid" @click="onSubmit()">Add</IonButton>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonInput, alertController, modalController, onIonViewDidEnter } from '@ionic/vue';
import { useSimpleRouter } from '@/composables/router';
import KImg from '@/components/KImg.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import TagInput from '@/components/TagInput.vue';
import ArtistTypeInput from '@/components/ArtistTypeInput.vue';
import WhereFromInput from '@/components/WhereFromInput.vue';
import { KPhotoResponse, useImageImport } from '@/composables/imageImport';
import { ref, watch, computed, onMounted } from 'vue';
import { cameraOutline, imagesOutline } from 'ionicons/icons';
import VTransition from '@/components/VTransition.vue';
import PickerInput from '@/components/PickerInput.vue';
import ImageEditorModal from '@/components/ImageEditorModal.vue';
import type { ArtistType, WhereFrom, OwnershipType, KPopCard } from '@/types';
import type { TagId } from '@/types/tags';
import { useKPopCards } from '@/composables/kPopCards';
import { FileStore } from '@/composables/fileStore';
import { Base64Uri } from '@/composables/base64';
import { imageBroken, pencil, web } from '@/icons';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import IonFormInput from './form/IonFormInput.vue';

const { takePhoto, photoFromGallery, photoFromUrl } = useImageImport();
const { addCard, generateId } = useKPopCards();
const router = useSimpleRouter();

const thisYear = new Date().getFullYear();

const dateOptions = Array.from({ length: 50 }, (_, i) => {
  const value = `${thisYear - i}`;
  return { text: value, value };
});

const schema = yup.object({
  // imageSrc: yup.string().required(),
  artist: yup.string().required().min(4).max(10).label('Artist')
  // artistType: yup.string<ArtistType>().required(),
  // // do conditional typing here
  // groupName: yup.string(),
  // whereFrom: yup.string<WhereFrom>().required(),
  // whereFromName: yup.string().required(),
  // albumVersion: yup.string(),
  // year: yup.string(),
  // ownershipType: yup.string<OwnershipType>().required(),
  // tags: yup.array<TagId[]>().required()
});

type CreatorForm = yup.InferType<typeof schema>;

const defaultForm = (): Partial<CreatorForm> => {
  // TODO: allow defaults from props
  return {
    artist: 'egg'
    // artistType: 'group',
    // whereFrom: 'album',
    // ownershipType: 'none',
    // tags: []
  };
};

const { values, handleSubmit, meta, resetForm } = useForm<CreatorForm>({
  validationSchema: schema,
  // use field initial values might make this redundant
  initialValues: defaultForm()
});

const artistField = useField<string>('artist', undefined, { validateOnValueUpdate: true });

const imageSrc = ref('');
const originalImgSrc = ref('');
const artist = ref('');
const artistType = ref<ArtistType>('group');
const groupName = ref('');

const whereFrom = ref<WhereFrom>('album');
const whereFromName = ref('');
const albumVersion = ref('');

const year = ref(`${thisYear}`);
const ownershipType = ref<OwnershipType>('none');
const tags = ref<TagId[]>([]);

onIonViewDidEnter(() => {
  resetForm();
});

onMounted(() => {
  resetForm();
});

const whereFromNameLabel = computed(() => {
  return whereFrom.value === 'album' ? 'Album*' : 'Where From*';
});

const canSubmit = computed(() => {
  if (artistType.value === 'group' && !groupName.value) {
    return false;
  }
  return imageSrc.value && artist.value && whereFromName.value;
});

watch(artistType, type => {
  if (type === 'solo') {
    groupName.value = '';
  }
});

const setImage = async (resp: KPhotoResponse) => {
  if (resp.ok) {
    imageSrc.value = resp.base64Uri.toString();
    originalImgSrc.value = resp.base64Uri.toString();
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
    componentProps: { src: originalImgSrc.value },
    cssClass: 'modal-fullscreen'
  });

  modal.present();

  const resp = await modal.onWillDismiss<string>();
  if (resp.role === 'accept') {
    imageSrc.value = resp.data!;
  }
};

const onSubmit = handleSubmit(async () => {
  // const scaledImage = await Base64Uri.fromUri(imageSrc.value).compress({ quality: 0.75, maxHeight: 1024, maxWidth: 1024 });
  // const fileResult = await FileStore.saveImage(`photo-cards/${generateId()}.${scaledImage.type()}`, scaledImage.toString());
  // if (!fileResult.ok) {
  //   console.error('[create] could not save file to disk', fileResult.error);
  //   return;
  // }
  // const data: KPopCard = {
  //   id: generateId(),
  //   imageFilePath: fileResult.path,
  //   artist: artist.value,
  //   artistType: artistType.value,
  //   groupName: groupName.value,
  //   whereFrom: whereFrom.value,
  //   whereFromName: whereFromName.value,
  //   albumVersion: albumVersion.value,
  //   year: year.value,
  //   ownershipType: ownershipType.value,
  //   tags: tags.value
  // };
  // addCard(data);
  // resetForm();
  // const alert = await alertController.create({
  //   header: 'Added!',
  //   message: 'Do you still have more to add?',
  //   buttons: [
  //     { role: 'more', text: 'Add more' },
  //     { role: 'done', text: 'Done' }
  //   ]
  // });
  // alert.present();
  // const resp = await alert.onWillDismiss<void>();
  // if (resp.role === 'done') {
  //   router.back({ fallback: '/home' });
  // }
});
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
