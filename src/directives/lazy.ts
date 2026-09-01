import type { Directive } from 'vue'

interface LazyHTMLImageElement extends HTMLImageElement {
  _lazyCleanup?: () => void
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as LazyHTMLImageElement
        const src = img.dataset.src
        if (src) {
          const handleLoad = () => {
            img.classList.remove('lazy-loading')
            cleanup()
          }
          const handleError = () => {
            img.classList.remove('lazy-loading')
            cleanup()
          }
          const cleanup = () => {
            img.removeEventListener('load', handleLoad)
            img.removeEventListener('error', handleError)
            if (img._lazyCleanup === cleanup) {
              delete img._lazyCleanup
            }
          }
          img._lazyCleanup = cleanup
          img.addEventListener('load', handleLoad)
          img.addEventListener('error', handleError)
          img.src = src
          img.removeAttribute('data-src')
        }
        observer.unobserve(img)
      }
    })
  },
  {
    rootMargin: '200px', // Pre-load images 200px before they enter the viewport
  },
)

type LazyBindingValue = LazyValue | string

interface LazyValue {
  placeholder?: string
  src: string
}

function resolveBinding(value: LazyBindingValue): { placeholder?: string; src: string } {
  if (typeof value === 'string') {
    return { src: value }
  }
  return value || { src: '' }
}

const lazyDirective: Directive<LazyHTMLImageElement, LazyBindingValue> = {
  beforeUnmount(el) {
    observer.unobserve(el)
    if (el._lazyCleanup) {
      el._lazyCleanup()
    }
  },
  mounted(el, binding) {
    if (binding.value) {
      const { placeholder, src } = resolveBinding(binding.value)
      el.dataset.src = src
      if (placeholder) {
        el.src = placeholder
      } else {
        el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      }
      el.classList.add('lazy-loading')
      observer.observe(el)
    }
  },
  updated(el, binding) {
    if (binding.value) {
      const { placeholder, src } = resolveBinding(binding.value)
      const oldVal = binding.oldValue ? resolveBinding(binding.oldValue) : null

      if (src && (!oldVal || src !== oldVal.src)) {
        if (el._lazyCleanup) {
          el._lazyCleanup()
        }
        el.dataset.src = src
        if (placeholder) {
          el.src = placeholder
        } else {
          el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        }
        el.classList.add('lazy-loading')
        observer.observe(el)
      }
    }
  },
}

export default lazyDirective
