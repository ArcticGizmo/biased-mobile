<template>
  <IonPage :class="{ 'has-toolbar': hasToolbar }">
    <IonHeader v-if="title || slots['header']">
      <IonToolbar>
        <slot name="header">
          <IonButtons v-if="defaultBackHref" slot="start">
            <IonBackButton :defaultHref="defaultBackHref" />
          </IonButtons>
          <IonTitle>{{ title }}</IonTitle>
        </slot>
      </IonToolbar>
    </IonHeader>
    <IonLoading :is-open="loading" class="transparent-loading" />
    <IonContent>
      <div class="content" :class="{ 'h-full': fixedContentHeight }" :style="{ maxWidth }">
        <slot></slot>
      </div>
    </IonContent>
    <IonFooter :style="{ maxWidth, margin: 'auto' }">
      <slot name="footer"></slot>
    </IonFooter>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonFooter, IonLoading } from '@ionic/vue';
import { computed, useSlots } from 'vue';

const props = defineProps<{
  title?: string;
  defaultBackHref?: string;
  loading?: boolean;
  maxWidth?: string;
  fixedContentHeight?: boolean;
}>();

const hasToolbar = computed(() => !!props.title);

const slots = useSlots();
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
