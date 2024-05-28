<template>
  <IonPage :class="{ 'has-toolbar': hasToolbar }">
    <IonHeader v-if="title">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton v-if="!hideBackRef" :defaultHref="defaultBackHref || '/home'"></IonBackButton>
        </IonButtons>
        <IonTitle>{{ title }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonLoading :is-open="loading" class="transparent-loading" />
    <IonContent>
      <div class="content" :style="{ maxWidth }">
        <slot></slot>
      </div>
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
  hideBackRef?: boolean;
  loading?: boolean;
  maxWidth?: string;
}>();

const hasToolbar = computed(() => !!props.title);
</script>

<style scoped>
.ion-page {
  justify-content: unset;
}

.content {
  margin: 0 auto;
}

.ion-page.fill-height.has-toolbar {
  grid-template-rows: auto 1fr;
}
</style>
