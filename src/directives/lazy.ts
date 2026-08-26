import type { Directive } from 'vue'

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.onload = () => {
            img.classList.remove('lazy-loading')
          }
          img.src = src
          img.removeAttribute('data-src')
        }
        observer.unobserve(img)
      }
    })
  },
  {
    rootMargin: '200px', // Pre-load images 200px before they enter the viewport
  }
)

const lazyDirective: Directive<HTMLImageElement, string> = {
  beforeUnmount(el) {
    observer.unobserve(el)
  },
  mounted(el, binding) {
    if (binding.value) {
      el.dataset.src = binding.value
      el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      el.classList.add('lazy-loading')
      observer.observe(el)
    }
  },
  updated(el, binding) {
    if (binding.value && binding.value !== binding.oldValue) {
      el.dataset.src = binding.value
      el.classList.add('lazy-loading')
      observer.observe(el)
    }
  },
}

export default lazyDirective
