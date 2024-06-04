<template>
  <BaseModal title="Filters" max-width="500px">
    <template #header>
      <IonButtons slot="start">
        <IonButton @click="onClose()">
          <IonIcon :icon="arrowBack" slot="icon-only" />
        </IonButton>
      </IonButtons>
      <IonButtons class="mr-4" slot="end">
        <IonButton color="danger" @click="onReset()"> Reset </IonButton>
      </IonButtons>
      <IonTitle class="text-center">Filters</IonTitle>
    </template>
    <div class="p-4">cheese</div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/views/BaseModal.vue';
import { IonTitle, IonButtons, IonButton, IonIcon, modalController } from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';

const onClose = () => {
  modalController.dismiss(undefined, 'cancelled');
};

const onReset = () => {
  console.log('---- reset');
};
</script>

<style scoped></style>
