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
      children: [
        {
          component: () => import('../views/NowIndexView.vue'),
          name: 'NowIndex',
          path: '',
        },
        {
          component: () => import('../views/NowPostView.vue'),
          name: 'NowPost',
          path: ':slug',
        },
      ],
      component: () => import('../layout/NowLayout.vue'),
      path: '/now',
    },
    {
      component: () => import('../views/NotFoundView.vue'),
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
    },
  ],
})

export default router
