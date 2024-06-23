import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Vue3TouchEvents, { type Vue3TouchEventsOptions } from 'vue3-touch-events';

import { IonicVue } from '@ionic/vue';

import './index.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Virtual scroll theming */
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

/* Theme variables */
import './theme/variables.css';
import './theme/style.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
defineCustomElements(window);

const app = createApp(App).use(IonicVue).use(router).use<Vue3TouchEventsOptions>(Vue3TouchEvents, {
  disableClick: false
});

router.isReady().then(() => {
  app.mount('#app');
});
