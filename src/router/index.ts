import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import TabsPage from '@/views/TabsPage.vue';
import { ENV } from '@/env';

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
      },
      {
        path: '/create',
        component: () => import('@/views/CreatePage.vue')
      },
      {
        path: '/settings',
        component: () => import('@/views/SettingsPage.vue')
      }
    ]
  },
  {
    path: '/cards',
    component: () => import('@/views/CardListPage.vue')
  },
  {
    path: '/cards/:id',
    props: true,
    component: () => import('@/views/CardViewPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue')
  }
];

if (ENV.IS_DEV) {
  routes.push({
    path: '/test',
    component: () => import('@/views/TestPage.vue')
  });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
