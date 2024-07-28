<template>
  <div class="upload-pic" :class="{ 'image-error': imageSrcField.errorMessage.value }">
    <KImg :src="imageSrcField.value.value" background height="50vh">
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
      <IonButton fill="outline" :disabled="!imageSrcField.value.value" @click="onEditImage()">
        <IonIcon slot="icon-only" :icon="pencil" />
      </IonButton>
    </div>

    <div v-if="imageSrcField.errorMessage.value" class="error-text pb-2">{{ imageSrcField.errorMessage.value }}</div>
  </div>

  <!-- ======= who ======== -->
  <!-- artists -->
  <IonArrayFormInput class="mt-4" name="artists" :label="values.artists.length === 1 ? 'Artist*' : 'Artists*'" />

  <!-- is soloist selection -->
  <ArtistTypeInput class="mt-4" v-model="artistTypeField.value.value" />

  <VTransition :show="values.artistType === 'group'">
    <IonFormInput class="mt-4" name="groupName" label="Group Name*" />
  </VTransition>

  <!-- ======= where from ======== -->
  <WhereFromInput class="mt-4" v-model="whereFromField.value.value" />

  <!-- album/name -->
  <IonFormInput class="mt-4" name="whereFromName" :label="whereFromNameLabel" />

  <!-- album version (optional) -->
  <VTransition :show="values.whereFrom === 'album'">
    <IonFormInput class="mt-4" name="albumVersion" label="Album Version" />
  </VTransition>

  <!-- year -->
  <PickerFormInput class="mt-4" name="year" :options="dateOptions" label="Released" />

  <!-- Ownership -->
  <div class="mt-4">Ownership</div>
  <OwnershipInput v-model="ownershipTypeField.value.value" />

  <!-- tags -->
  <div class="mt-4">Tags</div>
  <TagInput v-model="tagsField.value.value" />

  <IonButton class="mt-6 h-12" expand="block" type="submit" @click="onSubmit()">{{ submitText || 'Add' }}</IonButton>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, modalController } from '@ionic/vue';
import KImg from '@/components/KImg.vue';
import OwnershipInput from '@/components/OwnershipInput.vue';
import TagInput from '@/components/TagInput.vue';
import ArtistTypeInput from '@/components/ArtistTypeInput.vue';
import WhereFromInput from '@/components/WhereFromInput.vue';
import { KPhotoResponse, useImageImport } from '@/composables/imageImport';
import { ref, watch, computed } from 'vue';
import { cameraOutline, imagesOutline } from 'ionicons/icons';
import VTransition from '@/components/VTransition.vue';
import ImageEditorModal from '@/components/ImageEditorModal.vue';
import type { ArtistType, WhereFrom, OwnershipType } from '@/types';
import type { TagId } from '@/types/tags';
import { onPageWillEnter } from '@/composables/lifecycle';

import { imageBroken, pencil, web } from '@/icons';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import IonFormInput from './form/IonFormInput.vue';
import PickerFormInput from './form/PickerFormInput.vue';
import IonArrayFormInput from '@/components/form/IonArrayFormInput.vue';

const { takePhoto, photoFromGallery, photoFromUrl } = useImageImport();

const thisYear = new Date().getFullYear();

const dateOptions = Array.from({ length: 50 }, (_, i) => {
  const value = `${thisYear - i}`;
  return { text: value, value };
});

const originalImgSrc = ref('');

const schema = yup.object({
  imageSrc: yup.string().required('Image is required').label('Image'),
  artists: yup
    .array<string[]>()
    .compact(v => !v || !v.trim())
    .required()
    .min(1, v => {
      if (v.originalValue.length === 1) return 'Artist is required';
      return 'At least 1 entry must be filled';
    })
    .label('Artists'),
  artistType: yup.string<ArtistType>().required().label('Artist Type'),
  groupName: yup
    .string()
    .when('artistType', { is: 'group', then: s => s.required() })
    .label('Group Name'),
  whereFrom: yup.string<WhereFrom>().required().label('Where From'),
  whereFromName: yup.string().required().label('Where From Name'),
  albumVersion: yup.string().label('Album Version'),
  year: yup.string().label('Released'),
  ownershipType: yup.string<OwnershipType>().required().label('Ownership'),
  tags: yup.array<TagId[]>().required().label('Tags')
});

export type CreatorForm = yup.InferType<typeof schema>;

const props = defineProps<{ initial?: Partial<CreatorForm>; submitText?: string }>();

const emits = defineEmits<{
  (e: 'submit', form: CreatorForm): void;
}>();

const defaultForm = (): Partial<CreatorForm> => {
  // take in initials and remove all undefineds
  const initial: any = { ...(props.initial || {}) };
  Object.keys(initial).forEach(key => initial[key] === undefined && delete initial[key]);

  return {
    artists: [],
    artistType: 'group',
    whereFrom: 'album',
    year: dateOptions[0].value,
    ownershipType: 'none',
    tags: [],
    ...initial
  };
};

const { values, handleSubmit, resetForm, setFieldValue } = useForm<CreatorForm>({
  validationSchema: schema,
  initialValues: defaultForm()
});

const imageSrcField = useField<string>('imageSrc');
const artistTypeField = useField<ArtistType>('artistType');
const whereFromField = useField<WhereFrom>('whereFrom');
const ownershipTypeField = useField<OwnershipType>('ownershipType');
const tagsField = useField<TagId[]>('tags');

onPageWillEnter(() => {
  resetForm({ values: defaultForm() });
});

const whereFromNameLabel = computed(() => {
  return values.whereFrom === 'album' ? 'Album*' : 'Where From*';
});

watch(
  () => values.artistType,
  type => {
    if (type === 'solo') {
      setFieldValue('groupName', '');
    }
  }
);

const setImage = async (resp: KPhotoResponse) => {
  if (resp.ok) {
    originalImgSrc.value = resp.base64Uri.toString();
    imageSrcField.setValue(originalImgSrc.value);
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
    imageSrcField.setValue(resp.data!);
  }
};

const onSubmit = handleSubmit(formValues => {
  emits('submit', { ...formValues, artists: formValues.artists.filter(a => a) });
  resetForm();
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

.error-text {
  color: var(--ion-color-danger);
  font-size: 0.75rem;
  padding-left: 1rem;
}

.image-error {
  border: 1px solid var(--ion-color-danger);
}

.image-error .k-img {
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
}
</style>
