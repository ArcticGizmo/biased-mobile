<template>
  <BaseDialog class="justify-center" max-width="90vw">
    <div class="area p-4">
      <div class="flex justify-center flex-col w-full">
        <KImg :src="src" aspect-ratio="0.7" />
        <IonButton expand="block" @click="onAdd()">Add Anyway</IonButton>
        <IonButton expand="block" :disabled="!selected" @click="onReplace()">Replace</IonButton>
        <IonButton expand="block" @click="onCancel()">Cancel</IonButton>
      </div>
      <div class="matches flex flex-wrap overflow-y-scroll gap-4">
        <KImg
          v-for="card of cards"
          :key="card.id"
          :src="FileStore.toHref(card.imageFilePath)"
          aspect-ratio="0.7"
          :class="{ selected: card.id === selected }"
          @click="onSelect(card.id)"
        />
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@/views/BaseDialog.vue';
import type { KPopCard } from '@/types';
import KImg from './KImg.vue';
import { FileStore } from '@/composables/fileStore';
import { ref } from 'vue';
import { IonButton } from '@ionic/vue';
import { dialogController } from '@/composables/dialogController';

defineProps<{ src: string; cards: KPopCard[] }>();

const selected = ref('');

const onSelect = (id: string) => {
  if (selected.value === id) {
    selected.value = '';
  } else {
    selected.value = id;
  }
};

const onCancel = () => {
  dialogController.dismiss({ role: 'cancel' });
};

const onReplace = () => {
  dialogController.dismiss({ role: 'replace', data: selected.value });
};

const onAdd = () => {
  dialogController.dismiss({ role: 'add' });
};
</script>

<style scoped>
.area {
  width: 100%;
  height: 90vh;
  background-color: rgb(235, 235, 235);
  display: grid;
  grid-template-columns: 20rem 1fr;
}

.k-img {
  max-width: 20rem;
}

.matches .k-img {
  border: 4px solid transparent;
  opacity: 0.7;
}

.matches .selected {
  border-color: orange;
  opacity: 1;
  padding: 1rem;
}
</style>
