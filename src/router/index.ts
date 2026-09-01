import { createRouter, createWebHistory } from 'vue-router'

import { ensureUserRole, isAuthModalOpen } from '@/composables/useAuth'
import { trackPageView } from '@/composables/useEvents'
import { isLightBoxOpen, isPhotoLightBoxOpen, isWorkModalOpen } from '@/composables/useGlobal'

const SITE_URL = 'https://psiderman.com'
const DEFAULT_TITLE = 'Karan Sanas | Personal Website'
const DEFAULT_DESCRIPTION =
  "What's the difference between a good joke and a bad joke timing. This website has no description. But you did get a solid joke. Win-win, I'd say."

interface RouteMeta extends Record<number | string | symbol, unknown> {
  description?: string
  noindex?: boolean
  title?: string
}

function applyRouteMeta(to: { meta: unknown; path: string }) {
  if (typeof document === 'undefined') return

  const meta = (to.meta || {}) as RouteMeta
  const title = meta.title || DEFAULT_TITLE
  const description = meta.description || DEFAULT_DESCRIPTION
  const url = `${SITE_URL}${to.path}`

  document.title = title

  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow')

  setCanonical(to.path)
}

function setCanonical(path: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = `${SITE_URL}${path}`
}

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  const selector =
    attrName === 'property'
      ? `meta[property="${attrValue}"], meta[name="${attrValue}"]`
      : `meta[name="${attrValue}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: () => import('../views/HomeView.vue'),
      meta: {
        description: DEFAULT_DESCRIPTION,
        title: DEFAULT_TITLE,
      },
      name: 'Home',
      path: '/',
    },
    {
      component: () => import('../views/SuitladyView.vue'),
      meta: {
        layout: 'blank',
        noindex: true,
        requiresAdmin: true,
        title: 'Suitlady · Admin | Karan Sanas',
      },
      name: 'Suitlady',
      path: '/suitlady',
    },
    {
      component: () => import('../views/NowView.vue'),
      meta: {
        description: 'What I’m up to right now, in my own words.',
        title: 'Now | Karan Sanas',
      },
      name: 'Now',
      path: '/now',
    },
    {
      component: () => import('../views/TravelView.vue'),
      meta: {
        description: 'Trips, photos, and the story behind each one.',
        title: 'Travel | Karan Sanas',
      },
      name: 'Travel',
      path: '/travel',
    },
    {
      component: () => import('../views/WritingView.vue'),
      meta: {
        description: 'Essays, poems, recaps, and everything else I write.',
        title: 'Words | Karan Sanas',
      },
      name: 'Words',
      path: '/words',
    },
    {
      component: () => import('../views/PostView.vue'),
      meta: {
        description: 'A piece of writing.',
        title: 'Writing | Karan Sanas',
      },
      name: 'Post',
      path: '/words/:slug',
    },
    {
      component: () => import('../views/TermsView.vue'),
      meta: {
        description: 'Terms of use for psiderman.com.',
        title: 'Terms | Karan Sanas',
      },
      name: 'Terms',
      path: '/terms',
    },
    {
      component: () => import('../views/PrivacyView.vue'),
      meta: {
        description: 'How psiderman.com handles your data.',
        title: 'Privacy | Karan Sanas',
      },
      name: 'Privacy',
      path: '/privacy',
    },
    {
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        description: 'That page doesn’t exist.',
        layout: 'blank',
        noindex: true,
        title: 'Page Not Found | Karan Sanas',
      },
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

router.afterEach((to) => {
  applyRouteMeta(to)
  trackPageView(to.path)

  // Reset any open modals on navigation
  ;[isLightBoxOpen, isPhotoLightBoxOpen, isWorkModalOpen, isAuthModalOpen].forEach((modal) => {
    modal.value = false
  })
})

router.onError((error) => {
  console.error('[router] Navigation error:', error)
})

export default router
