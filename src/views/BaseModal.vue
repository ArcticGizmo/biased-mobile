<template>
  <BasePage :title="title" :loading="loading" :max-width="maxWidth">
    <template #header>
      <slot name="header">
        <IonButtons slot="start">
          <IonButton @click="onClose()">
            <IonIcon slot="icon-only" :icon="close" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ title }}</IonTitle>
      </slot>
    </template>
    <slot></slot>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from './BasePage.vue';
import { IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { close } from 'ionicons/icons';

defineProps<{
  title: string;
  loading?: boolean;
  maxWidth?: string;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const onClose = () => {
  emits('close');
};
</script>

<style scoped></style>
