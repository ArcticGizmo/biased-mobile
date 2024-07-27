import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import TabsPage from '@/views/TabsPage.vue';
import { ENV } from '@/env';
import { wireUpRouteLifecycles } from '@/composables/lifecycle';

const routes: RouteRecordRaw[] = [
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
        path: '/packs',
        component: () => import('@/views/PacksPage.vue')
      },
      {
        path: '/settings',
        component: () => import('@/views/SettingsPage.vue')
      }
    ]
  },
  {
    path: '/cards',
    component: () => import('@/views/CardsListPage.vue')
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
    path: '/extractor',
    component: () => import('@/views/ExtractorPage.vue')
  });
}

wireUpRouteLifecycles(routes);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
