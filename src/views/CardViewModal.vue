<template>
  <div class="card-view-modal">
    <IonButton @click="onClose()">Close</IonButton>
  </div>
</template>

<script setup lang="ts">
import { IonButton, modalController } from '@ionic/vue';

const onClose = () => {
  modalController.dismiss(undefined, 'cancel');
};
</script>
