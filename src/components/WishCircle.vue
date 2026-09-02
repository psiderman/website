<template>
  <div
    class="relative"
    :class="{ 'size-10 shrink-0': size === 'sm' }"
    :style="size === 'lg' ? circleStyle : undefined"
  >
    <div v-if="particles.length > 0" class="pointer-events-none absolute inset-0 z-0">
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
      v-tooltip="tooltipConfig"
      type="button"
      aria-label="Make a wish"
      class="relative size-full cursor-cell touch-none overflow-hidden rounded-full border-transparent bg-amber-200 select-none [-webkit-touch-callout:none] dark:bg-amber-500/20"
      :class="{
        'border-2': size === 'sm',
        'border-8!': size === 'lg',
        'cursor-progress border-amber-400! transition-all duration-200': isPressing,
        'border-transparent bg-transparent! transition-all duration-200': popping,
        'popping cursor-default': popping,
        jitter: status === 'ready',
      }"
      @mousedown="onPressStart"
      @mouseup="onPressEnd"
      @mouseleave="onPressEnd"
      @touchstart="onPressStart"
      @touchend="onPressEnd"
      @touchcancel="onPressEnd"
      @contextmenu.prevent
      @keydown.enter.prevent="onPressStart"
      @keydown.space.prevent="onPressStart"
      @keyup.enter.prevent="onPressEnd"
      @keyup.space.prevent="onPressEnd"
    >
      <div
        class="pointer-events-none absolute inset-0 z-10 bg-amber-400"
        :class="[
          popping ? 'bg-transparent' : 'transition-transform ease-linear',
          isPressing || popping ? 'translate-y-0' : 'translate-y-full',
        ]"
        :style="{
          transitionDuration: isPressing ? '5s' : '0s',
        }"
      ></div>

      <div class="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <span class="origin-center" :class="{ 'text-[10rem]': size === 'lg' }" aria-hidden="true"
          >🤞</span
        >
      </div>
    </button>

    <p
      v-if="hint && !popping"
      class="text-ui text-light/75 bg-overlay pointer-events-none mx-auto mt-6 w-fit rounded-full p-2 px-4 text-center backdrop-blur-xs"
    >
      {{ statusText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

interface Props {
  hint?: boolean
  showTooltip?: boolean
  size?: 'lg' | 'sm'
}

const props = withDefaults(defineProps<Props>(), {
  hint: false,
  showTooltip: false,
  size: 'sm',
})

const emit = defineEmits<{
  (e: 'update:popping', value: boolean): void
  (e: 'wished'): void
}>()

type WishStatus = 'holding' | 'idle' | 'ready'
const status = ref<WishStatus>('idle')
const isPressing = ref(false)
const popping = ref(false)
let holdTimeout: null | ReturnType<typeof setTimeout> = null

const isLarge = computed(() => props.size === 'lg')
const circleStyle = isLarge.value
  ? { height: 'min(84svh, 92svw)', width: 'min(84svh, 92svw)' }
  : undefined

const statusText = computed(() => {
  if (status.value === 'holding') return 'focus on your wish'
  if (status.value === 'ready') return 'let go'
  return 'press and hold to make a wish'
})

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
  const count = isLarge.value ? 34 : 16
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 6 * Math.PI
    const distance = (isLarge.value ? 90 : 20) + Math.random() * (isLarge.value ? 150 : 40)
    const dx = Math.cos(angle) * distance
    const dy = Math.sin(angle) * distance
    const delay = 800
    const duration = 5000 + Math.random() * 2000
    const scaleStart = 0.6 + Math.random() * 0.8
    const scaleEnd = 0.2
    const size = (isLarge.value ? 16 : 4) + Math.random() * (isLarge.value ? 20 : 8)
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
  if (popping.value) return
  isPressing.value = true
  status.value = 'holding'

  if (holdTimeout) clearTimeout(holdTimeout)
  holdTimeout = setTimeout(() => {
    status.value = 'ready'
  }, 4800)
}

const onPressEnd = () => {
  if (!isPressing.value) return
  isPressing.value = false
  if (holdTimeout) {
    clearTimeout(holdTimeout)
    holdTimeout = null
  }

  if (status.value === 'ready') {
    generateParticles()
    popping.value = true
    status.value = 'idle'
    emit('wished')

    setTimeout(() => {
      popping.value = false
    }, 2500)
  } else {
    status.value = 'idle'
  }
}

const tooltipContent = computed(() => {
  if (popping.value) return null
  if (status.value === 'ready') return 'let go'
  if (status.value === 'holding') return 'focus on your wish'
  return 'press and hold to make a wish'
})

const tooltipConfig = computed(() => {
  if (!props.showTooltip) return false
  return {
    allowHTML: true,
    content: tooltipContent.value,
    hideOnClick: false,
    placement: 'right',
    theme: 'tippy-small',
  }
})

onUnmounted(() => {
  if (holdTimeout) clearTimeout(holdTimeout)
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
    transform: translate(0, 0) rotate(0deg);
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
