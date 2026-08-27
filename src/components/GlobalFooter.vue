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
      ref="thwipContainer"
      class="text-mono text-text-tertiary border-light/15 relative z-0 -mt-20 flex h-80 max-h-80 w-full items-end justify-center overflow-hidden border-t pb-10"
    >
      <WebStrand
        :active="showThwip"
        :width="160"
        :height="322"
        :duration="TIMING.webDuration"
        :frame4-delay="TIMING.webHoldDelay"
        stroke-color="#94A3B8"
        :stroke-width="2"
        class="pointer-events-none absolute bottom-0 z-10 h-full w-auto transition-opacity duration-300"
        :class="showThwip ? 'opacity-100' : 'opacity-0'"
      />

      <div
        ref="handEl"
        class="text-h1 text-light pointer-events-none absolute bottom-0 -z-20 -mb-1 ml-1 select-none"
        style="transform: translateY(100%)"
      >
        🤟
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { animate } from 'animejs'
import { onMounted, onUnmounted, ref } from 'vue'

import WebStrand from '@/components/WebStrand.vue'
import { openLink } from '@/utils'

// ==========================================
// TIMING CONFIGURATION (edit values here)
// ==========================================
const TIMING = {
  // 4. Page Scroll Bounce-back
  bounceDelay: 2000, // Delay from trigger until footer pulls/bounces page back up
  bounceDuration: 350, // Duration of the page scroll snap-back

  // 2. Hand (🤟) emoji
  handEnterDuration: 500, // Time for hand to pop up
  handExitDuration: 350, // Time for hand to retreat

  // 3. Quip pill throw
  quipFadeDuration: 3000, // Quip opacity fadeout duration
  quipFlyDurationMax: 1500, // Slowest throw duration
  quipFlyDurationMin: 1000, // Fastest throw duration

  // 1. Web strand animation
  webDuration: 2000, // Total morph duration (75% upward to top, 25% pull down)
  webHoldDelay: 200, // Hold delay at apex (between frame 4 & 5)
}

const commit = __COMMIT_HASH__
const logoContainer = ref<HTMLElement | null>(null)
const thwipContainer = ref<HTMLElement | null>(null)
const handEl = ref<HTMLElement | null>(null)
const showThwip = ref(false)

const quips = ['thwip', 'go web go', 'fly', 'shazam', 'up up and away web', 'web... stop...']
let lastQuip = ''

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const getRandomQuip = () => {
  const availableQuips = quips.filter((q) => q !== lastQuip)
  const selected = availableQuips[Math.floor(Math.random() * availableQuips.length)]
  lastQuip = selected
  return selected
}

function dismissThwipAnimation() {
  if (handEl.value) {
    animate(handEl.value, {
      duration: TIMING.handExitDuration,
      ease: 'inQuad',
      translateY: '100%',
    })
  }
}

function spawnQuipThrow() {
  if (!thwipContainer.value) return

  const direction = random(0, 1) // 1 = right, 0 = left
  const plusminus = direction ? '+' : '-'
  const tailClass = direction ? 'speech-bubble-left' : 'speech-bubble-right'

  const quipMessage = document.createElement('span')
  quipMessage.textContent = getRandomQuip()
  quipMessage.ariaLive = 'polite'
  quipMessage.className = `speech-bubble ${tailClass} rounded-full bg-light px-2.5 py-0.5 text-ui-small font-medium text-gray-950 z-30 pointer-events-none absolute shadow-md whitespace-nowrap`

  thwipContainer.value.appendChild(quipMessage)

  const containerRect = thwipContainer.value.getBoundingClientRect()
  const startX = containerRect.width / 2 - quipMessage.offsetWidth / 2
  const startY = containerRect.height - 48

  quipMessage.style.position = 'absolute'
  quipMessage.style.left = `${startX}px`
  quipMessage.style.top = `${startY}px`

  const flingYLength = random(30, 60)
  const flingXLength = random(15, 55)
  const rotation = random(10, 20) * (flingXLength / 55)

  animate(quipMessage, {
    duration: random(TIMING.quipFlyDurationMin, TIMING.quipFlyDurationMax),
    ease: 'out(2)',
    onComplete: () => {
      if (quipMessage.parentNode === thwipContainer.value) {
        thwipContainer.value?.removeChild(quipMessage)
      }
    },
    opacity: [
      { duration: 200, to: 1 },
      { duration: TIMING.quipFadeDuration, ease: 'inOut(2)', to: 0 },
    ],
    rotate: `${plusminus}${rotation}deg`,
    x: `${plusminus}=${flingXLength}px`,
    y: `-=${flingYLength}px`,
  })
}

function triggerThwipAnimation() {
  if (handEl.value) {
    animate(handEl.value, {
      duration: TIMING.handEnterDuration,
      ease: 'outBack(1.5)',
      translateY: ['100%', '0%'],
    })
  }

  // Fling quip from hand as web launches
  spawnQuipThrow()
}

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
  const duration = TIMING.bounceDuration
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
      dismissThwipAnimation()
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

const handleScroll = () => {
  if (!logoContainer.value || isSnapping) return

  const currentScrollY = window.scrollY
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight
  const logoRect = logoContainer.value.getBoundingClientRect()
  const logoBottomOffset = logoRect.bottom + window.scrollY
  const logoBoundaryScrollTop = Math.max(0, logoBottomOffset - window.innerHeight)

  // Trigger ONLY when user scrolls to bottom (within 15px of max scroll)
  if (currentScrollY >= maxScrollTop - 15) {
    if (!showThwip.value) {
      showThwip.value = true
      triggerThwipAnimation()
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        bounceBack(logoBoundaryScrollTop)
      }, TIMING.bounceDelay)
    }
  } else {
    // If scrolled back up before bottom
    if (currentScrollY < logoBoundaryScrollTop - 10) {
      if (showThwip.value) {
        showThwip.value = false
        dismissThwipAnimation()
      }
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
  if (isSnapping) {
    cancelBounce()
  }
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

<style>
.speech-bubble::before {
  content: '';
  position: absolute;
  top: 95%;
  width: 0;
  height: 0;
  border-style: solid;
}

/* Flinging right -> tail on left pointing back toward hand */
.speech-bubble-left::before {
  left: 20%;
  border-width: 6px 6px 0 1px;
  border-color: var(--color-light, #ffffff) transparent transparent transparent;
}

/* Flinging left -> tail on right pointing back toward hand */
.speech-bubble-right::before {
  right: 20%;
  border-width: 6px 1px 0 6px;
  border-color: var(--color-light, #ffffff) transparent transparent transparent;
}
</style>
