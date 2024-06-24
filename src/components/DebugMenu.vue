<template>
  <ion-fab slot="fixed" vertical="top" horizontal="center" edge>
    <ion-fab-button size="small">
      <ion-icon :icon="chevronDownCircle" />
    </ion-fab-button>

    <ion-fab-list side="bottom">
      <ion-card class="flex flex-col p-3">
        <div class="inline-flex">
          <span class="mt-3 mr-4">Change Style</span>
          <ion-button>Android</ion-button>
          <ion-button>iOS</ion-button>
        </div>
        <ion-button router-link="/test">Test Page</ion-button>
      </ion-card>
    </ion-fab-list>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonFab, IonFabList, IonFabButton, IonIcon, IonCard, IonButton } from '@ionic/vue';
import { chevronDownCircle } from 'ionicons/icons';
</script>

<style scoped>
ion-card {
  background-color: var(--ion-color-light);
}

ion-card > * {
  margin-bottom: 1rem;
}

ion-fab-list {
  position: fixed;
  top: 1.5rem;
  left: 0;
  margin: 0;
  width: 100%;
}
</style>
