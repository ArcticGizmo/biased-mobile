<template>
  <div class="page" style="border: 1px solid orange">
    <div class="nav-bar">
      <IonButton @click="reset()">Reset</IonButton>
      <IonButton @click="onRemoveAll()">Remove All</IonButton>
      <IonButton @click="addSelection()">Add Selection</IonButton>
      <IonButton @click="onDuplicate()">Duplicate</IonButton>
      <IonButton @click="onTest()">Test</IonButton>
    </div>
    <div class="image-region">
      <div class="editor">
        <cropper-canvas ref="cropperCanvas" background>
          <cropper-image ref="cropperImage" :src="src" alt="image to edit" crossOrigin="anonymous" />
          <cropper-shade hidden />
          <cropper-handle action="select" plain />
          <!-- used to move the background image -->
          <!-- <cropper-handle action="move" plain /> -->
          <cropper-selection initial-coverage="0.8" initial-aspect-ratio="0.7" outlined movable resizable multiple zoomable keyboard>
            <cropper-grid role="grid" covered />
            <cropper-crosshair centered />
            <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)" />
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
import { IonButton } from '@ionic/vue';
import { CropperImage, CropperCanvas } from 'cropperjs';
import { onMounted, onUnmounted, ref } from 'vue';
import { Extractor } from '@/composables/extractor';

interface CopiedSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

const src = ref('https://media.karousell.com/media/photos/products/2022/6/20/bts_jimin_pc_1655706038_59617c25_progressive.jpg');

const cropperCanvas = ref<CropperCanvas>();
const cropperImage = ref<CropperImage>();

const extractor = new Extractor();

let copiedSelection: CopiedSelection | undefined;

const reset = () => {
  setTimeout(() => {
    cropperImage.value?.$resetTransform();
    cropperImage.value?.$center('contain');
  }, 150);
};

const onRemoveAll = () => {
  extractor.clearSelections();
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'c') {
    const selected = extractor.getActiveSelection();
    if (selected) {
      copiedSelection = {
        x: selected.x,
        y: selected.y,
        width: selected.width,
        height: selected.height
      };
    }
  }

  if (event.ctrlKey && event.key === 'v') {
    if (copiedSelection) {
      extractor.addSelection(copiedSelection);
    }
  }
};

onMounted(() => {
  reset();
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

const addSelection = () => extractor.addSelection();

const onDuplicate = () => {
  const selected = extractor.getActiveSelection();
  if (selected) {
    extractor.duplicateSelection(selected);
  }
};

const onTest = () => {
  // const c = cropperCanvas.value!;
  // c.$
  // c.$setAction('selection');
  const selections = extractor.getSelections();
  console.dir(selections);

  console.log(extractor.getActiveSelection());
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
