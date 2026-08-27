import { createRouter, createWebHistory } from 'vue-router'

import { ensureUserRole, isAuthModalOpen } from '@/composables/useAuth'
import { isLightBoxOpen, isWorkModalOpen } from '@/composables/useGlobal'

import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import NowView from '../views/NowView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import SuitladyView from '../views/SuitladyView.vue'
import TermsView from '../views/TermsView.vue'
import TravelView from '../views/TravelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: HomeView,
      name: 'Home',
      path: '/',
    },
    {
      component: SuitladyView,
      name: 'Suitlady',
      path: '/suitlady',
    },
    {
      component: NowView,
      name: 'Now',
      path: '/now',
    },
    {
      component: TravelView,
      name: 'Travel',
      path: '/travel',
    },
    {
      component: TermsView,
      name: 'Terms',
      path: '/terms',
    },
    {
      component: PrivacyView,
      name: 'Privacy',
      path: '/privacy',
    },
    {
      component: NotFoundView,
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.path === from.path) {
      return false
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach(async (to) => {
  if (to.path === '/suitlady') {
    const role = await ensureUserRole()
    if (role !== 'admin') {
      return { path: '/', replace: true }
    }
  }
})

router.afterEach(() => {
  isLightBoxOpen.value = false
  isWorkModalOpen.value = false
  isAuthModalOpen.value = false
})

export default router

