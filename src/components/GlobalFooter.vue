<template>
  <footer
    data-sync="footer"
    class="text-light/75 relative flex w-screen flex-col items-center justify-center gap-20 bg-gray-950 pt-20 pb-0 dark:bg-zinc-950"
  >
    <!-- Github Code -->
    <button
      class="text-mono bg-light/10 text-light hover:bg-light/20 focus:bg-light/20 absolute inset-x-0 top-0 mx-auto flex w-fit flex-row items-center justify-center gap-2 rounded-b-xl px-4 py-1.5 transition-colors duration-200 focus:outline-none"
      @click="openLink(`https://github.com/psiderman/website/commit/${commit}`)"
    >
      <div class="flex size-4 items-center justify-center">
        <FA class="size-4" :icon="['fab', 'github']" />
      </div>
      <span class="h-3">
        {{ commit }}
      </span>
    </button>

    <!-- Footer Links -->
    <div class="text-ui flex flex-col items-center justify-center gap-4">
      <div class="flex w-full flex-row gap-3">
        <router-link to="/terms" class="rounded-full px-2 outline-gray-400! dark:outline-zinc-400!"
          >terms</router-link
        >
        <span class="text-light/50">✦</span>
        <router-link
          to="/privacy"
          class="rounded-full px-2 outline-gray-400! dark:outline-zinc-400!"
          >privacy</router-link
        >
      </div>
      <p>© 2026 Karan Sanas</p>
    </div>

    <!-- Logo -->
    <div ref="logoContainer" class="w-full">
      <div
        class="desktop:flex pointer-events-none hidden h-57.5 w-full items-start justify-center overflow-hidden"
      >
        <img src="@/assets/svg/wordmark.svg" alt="psiderman wordmark" width="1040" height="300" />
      </div>
      <div
        class="desktop:hidden pointer-events-none flex w-full items-start justify-center overflow-hidden"
      >
        <img
          src="@/assets/svg/wordmark_mobile.svg"
          alt="psiderman wordmark"
          width="1040"
          height="300"
        />
      </div>
    </div>

    <!-- Nothing to see -->
    <div
      class="text-mono text-text-tertiary border-light/15 relative z-0 -mt-20 flex h-80 max-h-80 w-full items-end justify-center overflow-hidden border-t pb-10"
    >
      <p
        class="z-20 bg-gray-950 transition-all duration-500 dark:bg-zinc-950"
        :class="showThwip ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-1 opacity-0'"
      >
        {{ randomQuip }}
      </p>

      <img
        src="@/assets/svg/thwip.svg"
        width="80"
        height="320"
        alt="thwip"
        class="absolute bottom-0 z-10 h-full w-auto transition-all ease-out"
        :class="[
          showThwip
            ? 'translate-y-0 scale-100 delay-500 duration-500'
            : 'duration-100ms translate-y-full scale-0',
        ]"
      />
      <div
        class="text-h1 text-surface-primary absolute bottom-0 z-0 -mb-2 ml-1 transition-transform ease-out"
        :class="[
          showThwip ? 'translate-y-0 delay-500 duration-500' : 'translate-y-full duration-100',
        ]"
      >
        🤟
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { openLink } from '@/utils'

const commit = __COMMIT_HASH__
const logoContainer = ref<HTMLElement | null>(null)
const showThwip = ref(false)

const quips = ['thwip', 'go web go', 'fly', 'shazam', 'up up and away web', 'web... stop...', '']

const randomQuip = ref('')

const getRandomQuip = () => {
  const availableQuips = quips.filter((q) => q !== randomQuip.value)
  return availableQuips[Math.floor(Math.random() * availableQuips.length)]
}

randomQuip.value = getRandomQuip()

watch(showThwip, (newVal) => {
  if (newVal) {
    randomQuip.value = getRandomQuip()
  }
})

let isSnapping = false
let userCanScrollPast = false
let lastWheelTime = 0
let touchStartY = 0
let scrollTimeout: null | number = null
let animationFrameId: null | number = null

const cancelBounce = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  isSnapping = false
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
    scrollTimeout = null
  }
}

const bounceBack = (targetY: number) => {
  isSnapping = true
  const startY = window.scrollY
  const distance = targetY - startY
  const duration = 300 // how quickly to pull back
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3) // easeOutCubic

    window.scrollTo(0, startY + distance * ease)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      animationFrameId = null
      isSnapping = false
      userCanScrollPast = false
      showThwip.value = false
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

const handleScroll = () => {
  if (!logoContainer.value || isSnapping) return

  const currentScrollY = window.scrollY
  const logoRect = logoContainer.value.getBoundingClientRect()
  const logoBottomOffset = logoRect.bottom + window.scrollY
  const logoBoundaryScrollTop = Math.max(0, logoBottomOffset - window.innerHeight)

  if (currentScrollY > logoBoundaryScrollTop + 1) {
    showThwip.value = true
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = window.setTimeout(() => {
      bounceBack(logoBoundaryScrollTop)
    }, 1500) // when to pull back
  } else {
    if (currentScrollY < logoBoundaryScrollTop - 10) {
      showThwip.value = false
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
        scrollTimeout = null
      }
    }
  }
}

const handleWheel = (e: WheelEvent) => {
  if (!logoContainer.value) return

  const now = Date.now()
  const logoRect = logoContainer.value.getBoundingClientRect()
  const logoBottomOffset = logoRect.bottom + window.scrollY
  const logoBoundaryScrollTop = Math.max(0, logoBottomOffset - window.innerHeight)

  if (now - lastWheelTime > 150) {
    userCanScrollPast = window.scrollY >= logoBoundaryScrollTop - 4
  }
  lastWheelTime = now

  if (isSnapping) {
    return
  }

  if (e.deltaY > 0 && !userCanScrollPast && window.scrollY >= logoBoundaryScrollTop - 1) {
    window.scrollTo(0, logoBoundaryScrollTop)
    e.preventDefault()
  }
}

const handleTouchStart = (e: TouchEvent) => {
  cancelBounce()
  if (e.touches.length > 0) {
    touchStartY = e.touches[0].clientY

    if (logoContainer.value) {
      const logoRect = logoContainer.value.getBoundingClientRect()
      const logoBottomOffset = logoRect.bottom + window.scrollY
      const logoBoundaryScrollTop = Math.max(0, logoBottomOffset - window.innerHeight)
      userCanScrollPast = window.scrollY >= logoBoundaryScrollTop - 4
    } else {
      userCanScrollPast = false
    }
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!logoContainer.value || userCanScrollPast || isSnapping) return

  const currentY = e.touches[0].clientY
  const deltaY = touchStartY - currentY

  const logoRect = logoContainer.value.getBoundingClientRect()
  const logoBottomOffset = logoRect.bottom + window.scrollY
  const logoBoundaryScrollTop = Math.max(0, logoBottomOffset - window.innerHeight)

  if (deltaY > 0 && window.scrollY >= logoBoundaryScrollTop - 1) {
    window.scrollTo(0, logoBoundaryScrollTop)
    e.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchmove', handleTouchMove)
  if (scrollTimeout) clearTimeout(scrollTimeout)
  cancelBounce()
})
</script>
