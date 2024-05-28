<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button v-for="(item, index) in items" :key="index" :tab="item.tab" :href="item.href">
          <ion-icon aria-hidden="true" :icon="item.icon" />
          <ion-label>{{ item.text }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { imageAlbum } from '@/icons';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { settings, addCircle } from 'ionicons/icons';

interface NavItem {
  tab: string;
  href: string;
  icon: string;
  text?: string;
}

const items: NavItem[] = [
  {
    tab: 'create',
    href: '/creator',
    icon: addCircle,
    text: 'Create'
  },
  {
    tab: 'home',
    href: '/home',
    icon: imageAlbum,
    text: 'My Cards'
  },
  {
    tab: 'settings',
    href: '/settings',
    icon: settings,
    text: 'Settings'
  }
];
</script>

<style>
.tab-selected {
  color: var(--ion-color-primary-shade);
}
</style>
