<template>
  <div class="image-editor-modal">
    <div class="editor">
      <cropper-canvas v-if="show" class="rounded-md" background>
        <cropper-image ref="cropperImage" :src="src" alt="image to edit" crossOrigin="anonymous" />
        <cropper-shade hidden />
        <cropper-handle action="select" plain />
        <cropper-handle action="move" plain />
        <cropper-selection ref="cropperSelection" initial-coverage="0.8" initial-aspect-ratio="0.7" outlined movable resizable>
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
    <div class="actions">
      <IonButton size="large" fill="clear" @click="onClose()">
        <IonIcon slot="icon-only" :icon="closeOutline" color="danger" />
      </IonButton>
      <IonButton size="large" fill="clear" @click="onReset()">
        <IonIcon slot="icon-only" :icon="refreshOutline" />
      </IonButton>
      <IonButton size="large" fill="clear" @click="onAccept()">
        <IonIcon slot="icon-only" :icon="checkmarkOutline" color="success" />
      </IonButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'cropperjs';
import { CropperSelection, CropperImage } from 'cropperjs';
import { IonButton, IonIcon, modalController } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { checkmarkOutline, closeOutline, refreshOutline } from 'ionicons/icons';

defineProps<{
  src: string;
}>();

const cropperImage = ref<CropperImage>();
const cropperSelection = ref<CropperSelection>();

const show = ref(false);

onMounted(() => {
  setTimeout(() => {
    show.value = true;
    setTimeout(() => {
      cropperImage.value?.$center('contain');
      cropperSelection.value?.$reset();
    }, 10);
  }, 500);
});

const onClose = () => {
  modalController.dismiss(undefined, 'cancel');
};

const onReset = () => {
  cropperSelection.value?.$reset();
  cropperImage.value?.$resetTransform();
  cropperImage.value?.$center('contain');
};

const onAccept = async () => {
  const canvas = await cropperSelection.value!.$toCanvas({ width: 1024, height: 1024 });
  modalController.dismiss(canvas.toDataURL(), 'accept');
};
</script>

<style scoped>
.image-editor-modal {
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-rows: 1fr auto;
}

.editor {
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  padding-bottom: 0;
  background-color: rgb(24, 24, 24);
}

.actions {
  background-color: rgb(24, 24, 24);
  display: flex;
  justify-content: space-around;
}

cropper-canvas {
  height: 100%;
  width: 100%;
}
</style>
