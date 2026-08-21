import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: () => import('../views/HomeView.vue'),
      name: 'Home',
      path: '/',
    },
    {
      component: () => import('../views/NowView.vue'),
      name: 'Now',
      path: '/now',
    },
    {
      component: () => import('../views/NotFoundView.vue'),
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
