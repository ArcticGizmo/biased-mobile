<template>
  <div class="page" style="border: 1px solid orange">
    <div class="nav-bar">
      <IonButton @click="reset()">Reset</IonButton>
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
    <div class="image-region">
      <div class="editor">
        <cropper-canvas v-if="show" ref="cropperCanvas" background @actionstart="onActionStart" @actionend="onActionEnd">
          <cropper-image ref="cropperImage" :src="src" alt="image to edit" crossOrigin="anonymous" translatable scalable />
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
</template>

<script setup lang="ts">
import 'cropperjs';
import { IonButton, IonInput } from '@ionic/vue';
import { CropperImage, CropperCanvas, CropperShade, CropperGrid, CropperCrosshair, CropperSelection, CropperHandle } from 'cropperjs';
import { onMounted, onUnmounted, ref } from 'vue';

interface SelectionData {
  x: number;
  y: number;
  width: number;
  height: number;
}

const show = ref(false);
const src = ref('https://media.karousell.com/media/photos/products/2022/6/20/bts_jimin_pc_1655706038_59617c25_progressive.jpg');

const cropperCanvas = ref<CropperCanvas>();
const cropperImage = ref<CropperImage>();
const cropperSelection = ref<CropperSelection>();

const selectionData = ref<SelectionData>({
  x: 0,
  y: 0,
  width: 0,
  height: 0
});

const reset = () => {
  setTimeout(() => {
    show.value = true;
    setTimeout(() => {
      cropperSelection.value?.$reset();
      cropperImage.value?.$resetTransform();
      cropperImage.value?.$center('contain');
    }, 10);
  }, 500);
};

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
</script>

<style>
.page {
  display: grid;
  grid-template-columns: 20rem 1fr;
  height: 100%;
  width: 100%;
}

.nav-bar {
  background-color: rgb(223, 223, 223);
}

.editor {
  border: 1px solid blue;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
}

cropper-canvas {
  height: 100%;
  width: 100%;
}
</style>
