<template>
  <BasePage title="Extractor" default-back-href="/settings">
    <div class="page">
      <div class="nav-bar mt-6">
        <div class="grid grid-cols-2">
          <IonInput v-model="selectionData.x" label="x" fill="outline" mode="md" type="number" @ion-change="setDimension($event, 'x')" />
          <IonInput v-model="selectionData.y" label="y" fill="outline" mode="md" type="number" @ion-change="setDimension($event, 'y')" />
          <IonInput
            v-model="selectionData.width"
            label="w"
            fill="outline"
            mode="md"
            type="number"
            @ion-change="setDimension($event, 'width')"
          />
          <IonInput
            v-model="selectionData.height"
            label="h"
            fill="outline"
            mode="md"
            type="number"
            @ion-change="setDimension($event, 'height')"
          />
        </div>
        <div class="mt-4">
          <IonButton expand="block" fill="outline" @click="onGetFromGallery()"> Get Image </IonButton>
          <!-- ======= who ======== -->
          <!-- artist -->
          <IonInput class="mt-4" v-model="artist" mode="md" label="Artist*" label-placement="stacked" fill="outline" inputmode="text" />

          <!-- is soloist selection -->
          <ArtistTypeInput class="mt-4" v-model="artistType" />

          <VTransition :show="artistType === 'group'">
            <IonInput
              class="mt-4"
              v-model="groupName"
              mode="md"
              label="Group Name*"
              label-placement="stacked"
              fill="outline"
              inputmode="text"
            />
          </VTransition>

          <!-- ======= where from ======== -->
          <WhereFromInput class="mt-4" v-model="whereFrom" />

          <!-- album -->
          <IonInput
            class="mt-4"
            v-model="whereFromName"
            mode="md"
            :label="whereFromNameLabel"
            label-placement="stacked"
            fill="outline"
            inputmode="text"
          />

          <!-- album version (optional) -->
          <VTransition :show="whereFrom === 'album'">
            <IonInput
              class="mt-4"
              v-model="albumVersion"
              mode="md"
              label="Album Version"
              label-placement="stacked"
              fill="outline"
              inputmode="text"
            />
          </VTransition>

          <!-- year -->
          <PickerInput class="mt-4" v-model="year" :options="dateOptions" label="Released" label-placement="stacked" fill="outline" />

          <IonButton class="mt-6 h-12" expand="block" type="submit" :disabled="!canSubmit" @click="onSubmit()">Add</IonButton>
          <IonButton class="mt-6" expand="block" @click="reset()">Reset</IonButton>
        </div>
      </div>
      <div class="image-region">
        <div class="editor">
          <cropper-canvas v-if="show" ref="cropperCanvas" background @actionstart="onActionStart" @actionend="onActionEnd">
            <cropper-image ref="cropperImage" :src="imageSrc" alt="image to edit" crossOrigin="anonymous" translatable scalable />
            <cropper-shade />
            <cropper-handle id="image-handle" action="move" plain />
            <cropper-selection
              ref="cropperSelection"
              initial-coverage="0.5"
              initial-aspect-ratio="0.7"
              outlined
              movable
              resizable
              linked
              keyboard
              zoomable
              @change="onSelectionChange"
            >
              <cropper-grid role="grid" covered />
              <cropper-crosshair centered />
              <cropper-handle id="selection-handle" action="move" theme-color="rgba(255, 255, 255, 0.35)" />
              <cropper-handle action="n-resize" />
              <cropper-handle action="e-resize" />
              <cropper-handle action="s-resize" />
              <cropper-handle action="w-resize" />
              <cropper-handle action="ne-resize" />
              <cropper-handle action="nw-resize" />
              <cropper-handle action="se-resize" />
              <cropper-handle action="sw-resize" />
            </cropper-selection>
          </cropper-canvas>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import 'cropperjs';
import BasePage from './BasePage.vue';
import { IonButton, IonInput } from '@ionic/vue';
import { CropperImage, CropperCanvas, CropperShade, CropperGrid, CropperCrosshair, CropperSelection, CropperHandle } from 'cropperjs';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ArtistType, KPopCard, OwnershipType, WhereFrom } from '@/types';
import VTransition from '@/components/VTransition.vue';
import ArtistTypeInput from '@/components/ArtistTypeInput.vue';
import PickerInput from '@/components/PickerInput.vue';
import WhereFromInput from '@/components/WhereFromInput.vue';
import { Base64Uri } from '@/composables/base64';
import { useImageImport } from '@/composables/imageImport';
import { FileStore } from '@/composables/fileStore';
import { useKPopCards } from '@/composables/kPopCards';
import { useToast } from '@/composables/toast';
import { useImageCompare } from '@/composables/imageCompare';
import { dialogController } from '@/composables/dialogController';
import ImageCompareDialog from '@/components/ImageCompareDialog.vue';

interface SelectionData {
  x: number;
  y: number;
  width: number;
  height: number;
}

const show = ref(false);

const cropperCanvas = ref<CropperCanvas>();
const cropperImage = ref<CropperImage>();
const cropperSelection = ref<CropperSelection>();
const { findPossibleMatches } = useImageCompare();

const selectionData = ref<SelectionData>({
  x: 0,
  y: 0,
  width: 0,
  height: 0
});

const thisYear = new Date().getFullYear();

const dateOptions = Array.from({ length: 50 }, (_, i) => {
  const value = `${thisYear - i}`;
  return { text: value, value };
});

const imageSrc = ref('');
const artist = ref('');
const artistType = ref<ArtistType>('group');
const groupName = ref('');

const whereFrom = ref<WhereFrom>('album');
const whereFromName = ref('');
const albumVersion = ref('');

const year = ref(`${thisYear}`);

const { photoFromGallery } = useImageImport();
const { cards, addCard, updateCard, generateId } = useKPopCards();
const { showToast } = useToast();

const resetForm = () => {
  imageSrc.value = '';
  artist.value = '';
  artistType.value = 'group';
  groupName.value = '';
  whereFrom.value = 'album';
  whereFromName.value = '';
  albumVersion.value = '';
  year.value = `${thisYear}`;
};

const reset = () => {
  resetForm();
  setTimeout(() => {
    show.value = true;
    setTimeout(() => {
      cropperSelection.value?.$reset();
      cropperImage.value?.$resetTransform();
      cropperImage.value?.$center('contain');
    }, 10);
  }, 500);
};

const whereFromNameLabel = computed(() => {
  return whereFrom.value === 'album' ? 'Album*' : 'Event*';
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

let yLock: number | undefined;

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Shift') {
    const selection = cropperSelection.value!;

    if (!selection.linked) {
      yLock ??= selection.y;
      selection.y = yLock!;
    }
  }
};

const onKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Shift') {
    yLock = undefined;
  }
};

onMounted(() => {
  reset();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
});

const onActionStart = (event: any) => {
  const id = event.detail.relatedEvent.target?.id;
  const selection = cropperSelection.value;

  if (!selection) {
    return;
  }

  if (id === 'image-handle') {
    selection.linked = true;
  } else if (id === 'selection-handle') {
    selection.linked = false;
  }
};

const onActionEnd = (event: any) => {
  const id = event.detail.relatedEvent.target?.id;
  const selection = cropperSelection.value;

  if (!selection) {
    return;
  }

  if (id === 'image-handle' || id === 'selection-handle') {
    selection.linked = true;
  }
};

const onSelectionChange = (event: any) => {
  selectionData.value = event.detail as SelectionData;
};

const setDimension = (e: any, key: string) => {
  (cropperSelection.value as any)![key] = Number(e.detail.value);
};

const onGetFromGallery = async () => {
  const resp = await photoFromGallery();
  if (resp.ok) {
    imageSrc.value = resp.base64Uri.toString();
  }
};

const onSubmit = async () => {
  const canvas = await cropperSelection.value!.$toCanvas({ width: 1024, height: 1024 });
  const scaledImage = Base64Uri.fromUri(canvas.toDataURL());

  const filteredCards = cards.value.filter(c => {
    return (
      insensitiveCompare(c.artist, artist.value) &&
      insensitiveCompare(c.groupName, groupName.value) &&
      insensitiveCompare(c.whereFromName, whereFromName.value)
    );
  });

  const possibleMatches = await findPossibleMatches(scaledImage.toString(), filteredCards);

  if (!possibleMatches.length) {
    await createNewCard(scaledImage);
    return;
  }

  const duplicateAction = await dialogController.create({
    component: ImageCompareDialog,
    componentProps: {
      src: scaledImage,
      cards: possibleMatches
    }
  });

  if (duplicateAction.role === 'add') {
    await createNewCard(scaledImage);
    return;
  }

  if (duplicateAction.role === 'replace') {
    const replaceId = duplicateAction.data as string;
    const fileResult = await FileStore.saveImage(`photo-cards/${replaceId}.${scaledImage.type()}`, scaledImage.toString());

    if (fileResult.ok) {
      updateCard(replaceId, { imageFilePath: fileResult.path });
      showToast({ message: 'Image replaced', color: 'success' });
    } else {
      showToast({ message: 'Could not replace file', color: 'danger' });
    }

    return;
  }
};

const createNewCard = async (scaledImage: Base64Uri) => {
  const id = generateId();

  const fileResult = await FileStore.saveImage(`photo-cards/${id}.${scaledImage.type()}`, scaledImage.toString());

  if (!fileResult.ok) {
    console.error('[create] could not save file to disk', fileResult.error);
    return;
  }

  const data: KPopCard = {
    id,
    imageFilePath: fileResult.path,
    artist: artist.value,
    artistType: artistType.value,
    groupName: groupName.value,
    whereFrom: whereFrom.value,
    whereFromName: whereFromName.value,
    albumVersion: albumVersion.value,
    year: year.value,
    ownershipType: 'none'
  };

  addCard(data);
  showToast({ message: 'Added!', color: 'success' });
};

const insensitiveCompare = (a: string | undefined, b: string | undefined) => {
  return (a || '').toUpperCase() === (b || '').toUpperCase();
};
</script>

<style>
.page {
  display: grid;
  grid-template-columns: 25rem 1fr;
  height: calc(100vh - 3rem);
  width: 100%;
}

.nav-bar {
  overflow-y: scroll;
}

.editor {
  width: 100%;
  height: 100%;
  padding: 1.5rem;
}

cropper-canvas {
  height: 100%;
  width: 100%;
}
</style>
