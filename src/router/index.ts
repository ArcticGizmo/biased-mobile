import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import TabsPage from '@/views/TabsPage.vue';
import CreatorPage from '@/views/CreatorPage.vue';
import TestPage from '@/views/TestPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: '/home',
        component: HomePage
      }
    ]
  },
  {
    path: '/creator',
    component: CreatorPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue')
  }
];

if (import.meta.env.DEV) {
  routes.push({
    path: '/test',
    component: TestPage
  });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
