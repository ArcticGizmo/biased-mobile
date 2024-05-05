<template>
  <IonPage :class="{ 'has-toolbar': hasToolbar }">
    <IonHeader v-if="title">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton :defaultHref="defaultBackHref"></IonBackButton>
        </IonButtons>
        <IonTitle>{{ title }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonLoading :is-open="loading" class="transparent-loading" />
    <IonContent>
      <slot></slot>
    </IonContent>
    <IonFooter>
      <slot name="footer"></slot>
    </IonFooter>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonFooter, IonLoading } from '@ionic/vue';
import { computed } from 'vue';

const props = defineProps<{
  title?: string;
  centered?: boolean;
  defaultBackHref?: string;
  pad?: boolean;
  loading?: boolean;
}>();

const hasToolbar = computed(() => !!props.title);
</script>

<style scoped>
ion-toolbar {
  --background: transparent;
}

.ion-page {
  justify-content: unset;
}

.ion-page.fill-height.has-toolbar {
  grid-template-rows: auto 1fr;
}
</style>
