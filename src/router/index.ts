import { createRouter, createWebHistory } from 'vue-router'

import { ensureUserRole, isAuthModalOpen } from '@/composables/useAuth'
import { isLightBoxOpen, isWorkModalOpen } from '@/composables/useGlobal'

import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: HomeView,
      name: 'Home',
      path: '/',
    },
    {
      component: () => import('../views/SuitladyView.vue'),
      meta: { layout: 'blank', requiresAdmin: true },
      name: 'Suitlady',
      path: '/suitlady',
    },
    {
      component: () => import('../views/NowView.vue'),
      name: 'Now',
      path: '/now',
    },
    {
      component: () => import('../views/TravelView.vue'),
      name: 'Travel',
      path: '/travel',
    },
    {
      component: () => import('../views/TermsView.vue'),
      name: 'Terms',
      path: '/terms',
    },
    {
      component: () => import('../views/PrivacyView.vue'),
      name: 'Privacy',
      path: '/privacy',
    },
    {
      component: () => import('../views/NotFoundView.vue'),
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAdmin) {
    const role = await ensureUserRole()
    if (role !== 'admin') {
      return { path: '/', replace: true }
    }
  }
})

router.afterEach(() => {
  ;[isLightBoxOpen, isWorkModalOpen, isAuthModalOpen].forEach((modal) => {
    modal.value = false
  })
})

export default router


