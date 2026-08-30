<template>
  <div class="group pointer-events-auto relative flex flex-row items-center justify-center gap-2">
    <Transition
      enter-active-class="transition duration-1000 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <router-link
        v-if="!isWishTime"
        v-reveal
        to="/"
        class="size-10 shrink-0 overflow-hidden rounded-full hover:opacity-80 active:opacity-90"
        aria-label="Psiderman home"
      >
        <img src="/psider.webp" alt="" aria-hidden="true" class="size-10" width="80" height="80" />
      </router-link>
    </Transition>

    <div v-if="isWishTime" v-reveal class="relative size-10 shrink-0">
      <!-- Confetti Particles -->
      <div v-if="particles.length > 0" class="z-00 pointer-events-none absolute inset-0">
        <span
          v-for="particle in particles"
          :key="particle.id"
          class="particle pointer-events-none absolute top-1/2 left-1/2 z-0 mt-0.5 -translate-1/2 text-amber-400 select-none dark:text-amber-300"
          :style="{
            '--dx': particle.dx + 'px',
            '--dy': particle.dy + 'px',
            '--delay': particle.delay + 'ms',
            '--scale-start': particle.scaleStart,
            '--scale-end': particle.scaleEnd,
            '--duration': particle.duration + 'ms',
            '--rotate-start': particle.rotateStart + 'deg',
            '--rotate-end': particle.rotateEnd + 'deg',
            fontSize: particle.size + 'px',
          }"
        >
          {{ particle.char }}
        </span>
      </div>

      <button
        v-tooltip="{
          content: isPopping ? null : wishTooltip,
          theme: 'tippy-small',
          hideOnClick: false,
          placement: 'right',
        }"
        type="button"
        aria-label="Make a wish"
        data-sync="wish"
        class="relative size-full cursor-cell overflow-hidden rounded-full border-2 border-transparent bg-amber-200 dark:bg-amber-500/20"
        :class="{
          'cursor-progress border-amber-400! transition-all duration-200': isPressing,
          'border-transparent bg-transparent! transition-all duration-200': isPopping,
          'popping cursor-default': isPopping,
          jitter: isReadyToPop,
        }"
        @mousedown="onPressStart"
        @mouseup="onPressEnd"
        @mouseleave="onPressEnd"
        @touchstart="onPressStart"
        @touchend="onPressEnd"
        @keydown.enter.prevent="onPressStart"
        @keydown.space.prevent="onPressStart"
        @keyup.enter.prevent="onPressEnd"
        @keyup.space.prevent="onPressEnd"
      >
        <div
          class="pointer-events-none absolute inset-0 z-10 bg-amber-400"
          :class="[
            isPopping ? 'bg-transparent' : 'transition-transform ease-linear',
            isPressing || isPopping ? 'translate-y-0' : 'translate-y-full',
          ]"
          :style="{
            transitionDuration: isPressing ? '5s' : '0s',
          }"
        ></div>

        <div class="absolute inset-0 z-20 flex flex-col items-center justify-center">
          <span class="text-h2" aria-hidden="true">🤞</span>
        </div>
      </button>
    </div>
    <div
      v-if="isWishTime"
      class="absolute -left-5 -z-10 size-20 animate-ping! rounded-full bg-amber-200 group-hover:invisible dark:bg-amber-500/20"
    ></div>

    <div class="text-text-tertiary text-ui-small flex flex-col gap-1">
      <div v-reveal="50" class="flex flex-row gap-1 tabular-nums">
        <component :is="currentTimeClockIcon" :size="16" />
        {{ isWishTime ? currentTime.split(':').slice(0, -1).join(':') : currentTime }}
      </div>
      <div v-reveal="100" class="flex flex-row gap-1">
        <Globe2 :size="16" />
        {{ current_location.city }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Clock,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  Globe2,
} from '@lucide/vue'
import { addDays, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Location {
  city: string
  timezone: string
}

const current_location = ref<Location>({
  city: 'bengaluru, india',
  timezone: 'Asia/Kolkata',
})

const currentTime = ref('11:11:11')
const timeTooltip = ref<null | string>(null)
const wishTooltip = ref<null | string>(null)

const isWishTime = ref(false)
const isPressing = ref(false)
const isPopping = ref(false)
const isButtonVisible = ref(true)
const nextWishTimeStr = ref('')
const lastWish = ref<null | string>(null)

const clockIcons = [
  Clock12,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
]

const currentTimeClockIcon = computed(() => {
  const hour = parseInt(currentTime.value.split(':')[0], 10)
  return clockIcons[hour % 12] || Clock
})

let holdTimeout: null | ReturnType<typeof setTimeout> = null
const isReadyToPop = ref(false)

interface Particle {
  char: string
  delay: number
  duration: number
  dx: number
  dy: number
  id: string
  rotateEnd: number
  rotateStart: number
  scaleEnd: number
  scaleStart: number
  size: number
}

const particles = ref<Particle[]>([])

const generateParticles = () => {
  const chars = ['✦', '✧']
  const now = Date.now()
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * 6 * Math.PI
    const distance = 20 + Math.random() * 40
    const dx = Math.cos(angle) * distance
    const dy = Math.sin(angle) * distance
    const delay = 800
    const duration = 5000 + Math.random() * 2000
    const scaleStart = 0.6 + Math.random() * 0.8
    const scaleEnd = 0.2
    const size = 4 + Math.random() * 8
    const char = chars[Math.floor(Math.random() * chars.length)]
    const rotateStart = Math.random() * 360
    const rotateEnd = rotateStart + (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)
    const id = `${now}-${i}-${Math.random()}`

    particles.value.push({
      char,
      delay,
      duration,
      dx,
      dy,
      id,
      rotateEnd,
      rotateStart,
      scaleEnd,
      scaleStart,
      size,
    })

    setTimeout(
      () => {
        particles.value = particles.value.filter((p) => p.id !== id)
      },
      delay + duration + 100,
    )
  }
}

const onPressStart = () => {
  if (!isWishTime.value) return
  isPressing.value = true
  wishTooltip.value = 'focus on your wish'
  isPopping.value = false
  isReadyToPop.value = false

  if (holdTimeout) clearTimeout(holdTimeout)
  holdTimeout = setTimeout(() => {
    isReadyToPop.value = true
    wishTooltip.value = 'let go'
  }, 4800)
}

const onPressEnd = () => {
  if (!isPressing.value) return
  isPressing.value = false
  if (holdTimeout) clearTimeout(holdTimeout)

  if (isReadyToPop.value) {
    generateParticles()
    isPopping.value = true
    isReadyToPop.value = false

    lastWish.value = nextWishTimeStr.value
    localStorage.setItem('lastWishTime', nextWishTimeStr.value)

    setTimeout(() => {
      isPopping.value = false
      isButtonVisible.value = false
      isWishTime.value = false
    }, 2500)
  }
}

let timer: null | ReturnType<typeof setInterval> = null
const formatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  second: '2-digit',
  timeZone: current_location.value.timezone,
})

const updateTime = () => {
  if (!formatter || isPopping.value) return

  const formatted = formatter.format(new Date())
  currentTime.value = formatted

  const parts = formatted.split(':')
  let h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const s = parseInt(parts[2], 10)
  if (h === 24) h = 0

  const isCurrentlyWishTime = h === m

  let targetH = h
  let targetM = h

  if (m >= targetM) {
    targetH = (h + 1) % 24
    targetM = targetH
  }

  const targetS = targetH

  const nowMock = new Date()
  nowMock.setHours(h, m, s, 0)

  let targetMock = new Date()
  targetMock.setHours(targetH, targetM, targetS, 0)

  if (targetMock < nowMock) {
    targetMock = addDays(targetMock, 1)
  }

  const mins = differenceInMinutes(targetMock, nowMock)
  const seconds = differenceInSeconds(targetMock, nowMock) % 60

  const yyyy = targetMock.getFullYear()
  const mm = String(targetMock.getMonth() + 1).padStart(2, '0')
  const dd = String(targetMock.getDate()).padStart(2, '0')

  nextWishTimeStr.value = `${yyyy}-${mm}-${dd} ${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}:${String(targetS).padStart(2, '0')}`

  if (lastWish.value === nextWishTimeStr.value) {
    isButtonVisible.value = false
    isWishTime.value = false
  } else {
    isButtonVisible.value = true
    if (isCurrentlyWishTime) {
      if (!isPressing.value) wishTooltip.value = 'press and hold to make a wish'
      isWishTime.value = true
    } else {
      timeTooltip.value = `come back in ${mins}:${String(seconds).padStart(2, '0')}`
      isWishTime.value = false
    }
  }
}

onMounted(() => {
  lastWish.value = localStorage.getItem('lastWishTime')
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
@reference "@/style.css";

.jitter {
  animation: jitterWish 0.1s infinite;
}

@keyframes jitterWish {
  0% {
    transform: translate(0.5px, 0.5px) rotate(0deg);
  }
  25% {
    transform: translate(-0.5px, -0.5px) rotate(-1deg);
  }
  50% {
    transform: translate(-0.5px, 0.5px) rotate(1deg);
  }
  75% {
    transform: translate(0.5px, -0.5px) rotate(-1deg);
  }
  100% {
    transform: translate(0px, 0px) rotate(0deg);
  }
}

.popping {
  animation: popWish 2s cubic-bezier(1, -0.5, 0, 1) forwards;
}

@keyframes popWish {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(5);
    opacity: 0;
  }
}

.particle {
  animation: explode var(--duration) cubic-bezier(0.15, 0.85, 0.35, 1) var(--delay) forwards;
  will-change: transform, opacity;
}

@keyframes explode {
  0% {
    transform: scale(var(--scale-start)) rotate(var(--rotate-start));
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), var(--dy)) scale(var(--scale-end)) rotate(var(--rotate-end));
    opacity: 0;
  }
}
</style>
