<template>
  <footer
    ref="footerEl"
    data-sync="footer"
    class="text-light/75 relative flex w-full flex-col items-center justify-center gap-20 overflow-hidden bg-gray-950 pt-20 pb-0 dark:bg-zinc-950"
  >
    <!-- Github Code -->
    <a
      :href="`https://github.com/psiderman/website/commit/${commit}`"
      target="_blank"
      rel="noopener noreferrer"
      class="text-mono bg-light/10 text-light hover:bg-light/20 focus:bg-light/20 focus:outline-light absolute inset-x-0 top-0 mx-auto flex w-fit flex-row items-center justify-center gap-2 rounded-b-xl px-4 py-1.5 transition-colors duration-200 focus:outline-2 focus:outline-offset-2"
    >
      <div v-reveal class="flex size-4 items-center justify-center" aria-hidden="true">
        <FA class="size-4" :icon="['fab', 'github']" />
      </div>
      <span v-reveal="50" class="h-3">
        {{ commit }}
      </span>
    </a>

    <!-- Footer Links -->
    <div class="text-ui flex flex-col items-center justify-center gap-4">
      <div class="desktop:gap-3 flex w-full flex-row flex-wrap items-center justify-center gap-0">
        <router-link
          v-reveal="150"
          to="/terms"
          class="hover:bg-light-5p active:bg-light-10p hover:text-light -mx-2 -my-1 rounded-full px-4 py-1 outline-gray-400! dark:outline-zinc-400!"
          >terms</router-link
        >
        <span v-reveal="200" class="text-light/50">✦</span>
        <router-link
          v-reveal="250"
          to="/privacy"
          class="hover:bg-light-5p active:bg-light-10p hover:text-light -mx-2 -my-1 rounded-full px-4 py-1 outline-gray-400! dark:outline-zinc-400!"
          >privacy</router-link
        >
        <span v-reveal="300" class="text-light/50">✦</span>
        <a
          v-reveal="350"
          href="https://links.psiderman.com/resume"
          target="_blank"
          class="hover:bg-light-5p active:bg-light-10p hover:text-light -mx-2 -my-1 rounded-full px-4 py-1 outline-gray-400! dark:outline-zinc-400!"
          >résumé</a
        >
        <span v-reveal="400" class="text-light/50">✦</span>
        <a
          v-reveal="450"
          v-tooltip="'scroll down'"
          href="https://www.youtube.com/watch?v=6P65Y-q-ht4"
          target="_blank"
          class="ml-2 inline-block items-center tabular-nums"
          >thwips:&nbsp;<RollingNumber :value="thwips"
        /></a>
      </div>
      <div v-reveal="500" class="flex w-full flex-row items-center justify-center gap-3">
        <p>© {{ currentYear }} Karan Sanas</p>
      </div>
    </div>

    <!-- Logo -->
    <div ref="logoContainer" v-reveal="550" class="w-full">
      <div
        class="desktop:flex pointer-events-none hidden h-57.5 w-full items-start justify-center overflow-hidden"
      >
        <img src="@/assets/svg/wordmark.svg" alt="" aria-hidden="true" width="1040" height="300" />
      </div>
      <div
        class="desktop:hidden pointer-events-none flex w-full items-start justify-center overflow-hidden"
      >
        <img
          src="@/assets/svg/wordmark_mobile.svg"
          alt=""
          aria-hidden="true"
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
        :up-duration="TIMING.webUpDuration"
        :down-duration="TIMING.webDownDuration"
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

    <ThwipAchievementModal
      :is-open="isAchievementModalOpen"
      @close="isAchievementModalOpen = false"
    />
  </footer>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import RollingNumber from '@/components/RollingNumber.vue'
import ThwipAchievementModal from '@/components/ThwipAchievementModal.vue'
import WebStrand from '@/components/WebStrand.vue'
import { getEasterEggEmail, getEasterEggQuips } from '@/data/thwipEasterEgg'
import { queryKeys } from '@/queryKeys'
import { trackEvent } from '@/utils/analytics'

// ==========================================
// TIMING CONFIGURATION (edit values here)
// ==========================================

const TIMING = {
  // 4. Page Scroll Bounce-back
  bounceDelay: 1500, // Delay from trigger until footer pulls/bounces page back up
  bounceDuration: 700, // Duration of the page scroll snap-back

  // 2. Hand (🤟) emoji
  handEnterDuration: 300, // Time for hand to pop up
  handExitDuration: 200, // Time for hand to retreat

  // 3. Quip pill throw
  quipFadeDelay: 1500, // Delay before quip fades out
  quipFadeDuration: 300, // Quick fadeout duration
  quipFlyDurationMax: 1500, // Slowest throw duration
  quipFlyDurationMin: 1000, // Fastest throw duration

  webDownDuration: 300, // Pull down morph duration (Frame 4 -> 5)
  webHoldDelay: 500, // Hold delay at apex (between frame 4 & 5)
  // 1. Web strand animation
  webUpDuration: 700, // Upward morph duration to apex (Frame 1 -> 4)
}

const commit = __COMMIT_HASH__
const currentYear = new Date().getFullYear()
const footerEl = ref<HTMLElement | null>(null)
const logoContainer = ref<HTMLElement | null>(null)
const thwipContainer = ref<HTMLElement | null>(null)
const handEl = ref<HTMLElement | null>(null)
const showThwip = ref(false)

const isAchievementModalOpen = ref(false)
const isFooterVisible = ref(false)
const LOCAL_THWIP_KEY = 'local_thwip_count'
const localThwips = ref<number>(parseInt(localStorage.getItem(LOCAL_THWIP_KEY) || '0', 10) || 0)
const thwips = ref<null | number>(null)
let pendingDelta = 0
let sessionThwips = 0
let hasTrackedFirstThwip = false
let debounceTimer: null | number = null
let footerObserver: IntersectionObserver | null = null

const { data: thwipData } = useQuery<{ count: number }>({
  enabled: isFooterVisible,
  gcTime: 0,
  queryFn: async () => {
    const res = await fetch('/api/thwip', { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to fetch thwips: ${res.status}`)
    return res.json()
  },
  queryKey: queryKeys.thwips,
  staleTime: 0,
})

watch(
  thwipData,
  (data) => {
    if (data && typeof data.count === 'number') {
      thwips.value = data.count + pendingDelta
    }
  },
  { immediate: true },
)

function handleThwipComplete() {
  thwips.value = (thwips.value ?? 0) + 1
  pendingDelta += 1
  localThwips.value += 1
  sessionThwips += 1

  if (!hasTrackedFirstThwip) {
    hasTrackedFirstThwip = true
    trackEvent('thwip_first')
  }

  try {
    localStorage.setItem(LOCAL_THWIP_KEY, localThwips.value.toString())
  } catch {
    // ignore storage errors
  }

  if (localThwips.value === 91) {
    triggerEasterEggEmail()
  } else if (localThwips.value === 100) {
    isAchievementModalOpen.value = true
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = window.setTimeout(() => {
    const deltaToFlush = pendingDelta
    pendingDelta = 0
    debounceTimer = null
    void persistThwipDelta(deltaToFlush)
    trackEvent(
      'thwip_session_total',
      {
        local_total: localThwips.value,
        session_thwips: sessionThwips,
      },
      { force: true },
    )
  }, 2500)
}

async function persistThwipDelta(delta: number) {
  if (delta <= 0) return
  try {
    const res = await fetch('/api/thwip', {
      body: JSON.stringify({ delta }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    if (!res.ok) {
      console.error('Failed to increment thwips', res.statusText)
    } else {
      const data = (await res.json()) as { count?: number }
      if (typeof data.count === 'number') {
        thwips.value = data.count + pendingDelta
      }
    }
  } catch (err) {
    console.error('Failed to persist thwips counter', err)
  }
}

function triggerEasterEggEmail() {
  const { body, subject, to } = getEasterEggEmail()
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoUrl
}

const quips = getEasterEggQuips()

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const getNextQuip = () => {
  return quips[localThwips.value % quips.length]
}

function dismissThwipAnimation() {
  const el = handEl.value
  if (el) {
    void import('animejs').then(({ animate }) => {
      animate(el, {
        duration: TIMING.handExitDuration,
        ease: 'inQuad',
        translateY: '100%',
      })
    })
  }
}

function spawnQuipThrow() {
  if (!thwipContainer.value) return

  const direction = random(0, 1) // 1 = right, 0 = left
  const plusminus = direction ? '+' : '-'
  const tailClass = direction ? 'speech-bubble-left' : 'speech-bubble-right'

  const quipMessage = document.createElement('span')
  quipMessage.textContent = getNextQuip()
  quipMessage.ariaLive = 'polite'
  quipMessage.className = `speech-bubble ${tailClass} rounded-full bg-light px-2.5 py-0.5 text-ui-small font-medium text-gray-950 z-30 pointer-events-none absolute shadow-md whitespace-nowrap`

  thwipContainer.value.appendChild(quipMessage)

  const containerRect = thwipContainer.value.getBoundingClientRect()
  const startX = containerRect.width / 2 - quipMessage.offsetWidth / 2
  const startY = containerRect.height - 48

  quipMessage.style.position = 'absolute'
  quipMessage.style.left = `${startX}px`
  quipMessage.style.top = `${startY}px`

  const flingYLength = random(10, 20)
  const flingXLength = random(40, 60)
  const rotation = random(10, 20) * (flingXLength / 55)

  void import('animejs').then(({ animate }) => {
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
        { delay: TIMING.quipFadeDelay, duration: TIMING.quipFadeDuration, ease: 'inOut(2)', to: 0 },
      ],
      rotate: `${plusminus}${rotation}deg`,
      x: `${plusminus}=${flingXLength}px`,
      y: `-=${flingYLength}px`,
    })
  })
}

function triggerThwipAnimation() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  const el = handEl.value
  if (el) {
    void import('animejs').then(({ animate }) => {
      animate(el, {
        duration: TIMING.handEnterDuration,
        ease: 'outBack(1.5)',
        translateY: ['100%', '0%'],
      })
    })
  }

  // Fling quip from hand as web launches
  spawnQuipThrow()
}

let isSnapping = false
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
      showThwip.value = false
      dismissThwipAnimation()
      handleThwipComplete()
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

const handleScroll = () => {
  if (!logoContainer.value || isSnapping) return

  // Honor reduced-motion: skip the thwip/web/bounce animation entirely
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const currentScrollY = window.scrollY
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight
  const logoRect = logoContainer.value.getBoundingClientRect()
  const logoBottomOffset = logoRect.bottom + window.scrollY
  const logoBoundaryScrollTop = Math.max(0, logoBottomOffset - window.innerHeight)

  // Trigger when user scrolls to bottom
  if (currentScrollY >= maxScrollTop - 2) {
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

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  if (footerEl.value) {
    footerObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isFooterVisible.value = true
          if (footerObserver) {
            footerObserver.disconnect()
            footerObserver = null
          }
        }
      },
      { rootMargin: '200px' },
    )
    footerObserver.observe(footerEl.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (footerObserver) {
    footerObserver.disconnect()
    footerObserver = null
  }
  if (scrollTimeout) clearTimeout(scrollTimeout)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    const deltaToFlush = pendingDelta
    debounceTimer = null
    pendingDelta = 0
    void persistThwipDelta(deltaToFlush)
  }
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
  border-color: var(--color-light, #fff) transparent transparent transparent;
}

/* Flinging left -> tail on right pointing back toward hand */
.speech-bubble-right::before {
  right: 20%;
  border-width: 6px 1px 0 6px;
  border-color: var(--color-light, #fff) transparent transparent transparent;
}
</style>
