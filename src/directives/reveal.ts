import type { Directive } from 'vue'

interface RevealHTMLImageElement extends HTMLElement {
  _revealCleanup?: () => void
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as RevealHTMLImageElement
        el.classList.add('reveal-visible')
        observer.unobserve(el)
      }
    })
  },
  { rootMargin: '0px 0px 20% 0px' },
)

const reveal: Directive<RevealHTMLImageElement, number | string | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion) return

    const delay = binding.value
    if (delay !== undefined && delay !== null && delay !== '') {
      el.style.setProperty(
        '--reveal-delay',
        `${typeof delay === 'number' ? delay : parseInt(delay, 10)}ms`,
      )
    }

    el.classList.add('reveal')
    observer.observe(el)
    const cleanup = () => observer.unobserve(el)
    el._revealCleanup = cleanup
  },
  unmounted(el) {
    el._revealCleanup?.()
    delete el._revealCleanup
  },
}

export default reveal
