<template>
  <IonPage :class="{ 'fill-height': centered, 'has-toolbar': hasToolbar }">
    <IonHeader v-if="pageTitle">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton color="light" :defaultHref="defaultBackHref"></IonBackButton>
        </IonButtons>
        <IonTitle color="light">{{ pageTitle }}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonLoading :is-open="loading" class="transparent-loading" />
    <IonContent :fullscreen="true">
      <div v-if="centered" class="centered-content" :class="{ 'content-padding': pad }">
        <slot></slot>
      </div>
      <slot v-else></slot>
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
  pageTitle?: string;
  centered?: boolean;
  defaultBackHref?: string;
  pad?: boolean;
  loading?: boolean;
}>();

const hasToolbar = computed(() => !!props.pageTitle);
</script>

<style scoped>
ion-toolbar {
  --background: transparent;
}

.ion-page {
  justify-content: unset;
}

.ion-page.fill-height {
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr;
}

.ion-page.fill-height.has-toolbar {
  grid-template-rows: auto 1fr;
}

.centered-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.content-padding {
  padding: 3rem;
}
</style>
