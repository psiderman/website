import { createRouter, createWebHistory, type RouteComponent } from 'vue-router'

import { ensureUserRole, isAuthModalOpen } from '@/composables/useAuth'
import { trackPageView } from '@/composables/useEvents'
import { isLightBoxOpen, isPhotoLightBoxOpen, isWorkModalOpen } from '@/composables/useGlobal'

// Wrap lazy route components so a flaky chunk load retries the dynamic import
// once instead of silently aborting the navigation (which would leave the
// previously mounted page on screen until a manual refresh).
function makeLazy(loader: () => Promise<RouteComponent>): () => Promise<RouteComponent> {
  let promise: null | Promise<RouteComponent> = null
  return () => {
    if (!promise) {
      promise = loader().catch((error) => {
        promise = null
        throw error
      })
    }
    return promise
  }
}

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
      component: makeLazy(() => import('../views/HomeView.vue')),
      meta: {
        description: DEFAULT_DESCRIPTION,
        title: DEFAULT_TITLE,
      },
      name: 'Home',
      path: '/',
    },
    {
      component: makeLazy(() => import('../views/SuitladyView.vue')),
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
      component: makeLazy(() => import('../views/NowView.vue')),
      meta: {
        title: 'Now | Karan Sanas',
      },
      name: 'Now',
      path: '/now',
    },
    {
      component: makeLazy(() => import('../views/TravelView.vue')),
      meta: {
        title: 'Travel | Karan Sanas',
      },
      name: 'Travel',
      path: '/travel',
    },
    {
      component: makeLazy(() => import('../views/WritingView.vue')),
      meta: {
        title: 'Words | Karan Sanas',
      },
      name: 'Words',
      path: '/words',
    },
    {
      component: makeLazy(() => import('../views/PostView.vue')),
      meta: {
        title: 'Words | Karan Sanas',
      },
      name: 'Post',
      path: '/words/:slug',
    },
    {
      component: makeLazy(() => import('../views/GamingView.vue')),
      meta: {
        title: 'Gaming | Karan Sanas',
      },
      name: 'Gaming',
      path: '/gaming',
    },
    {
      component: makeLazy(() => import('../views/TermsView.vue')),
      meta: {
        title: 'Terms | Karan Sanas',
      },
      name: 'Terms',
      path: '/terms',
    },
    {
      component: makeLazy(() => import('../views/PrivacyView.vue')),
      meta: {
        title: 'Privacy | Karan Sanas',
      },
      name: 'Privacy',
      path: '/privacy',
    },
    {
      component: makeLazy(() => import('../views/NotFoundView.vue')),
      meta: {
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

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('chunk_reload_target')
  }

  // Reset any open modals on navigation
  ;[isLightBoxOpen, isPhotoLightBoxOpen, isWorkModalOpen, isAuthModalOpen].forEach((modal) => {
    modal.value = false
  })
})

router.onError((error, to) => {
  console.error('[router] Navigation error:', error)

  const msg = error instanceof Error ? error.message : String(error)
  const isChunkError =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('Loading chunk') ||
    msg.includes('Unexpected token') ||
    msg.includes('Unable to preload CSS')

  if (isChunkError && to?.fullPath && typeof window !== 'undefined') {
    const key = 'chunk_reload_target'
    if (sessionStorage.getItem(key) !== to.fullPath) {
      sessionStorage.setItem(key, to.fullPath)
      window.location.assign(to.fullPath)
    }
  }
})

export default router
