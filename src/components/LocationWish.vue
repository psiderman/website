<template>
  <div class="flex flex-row items-center justify-center gap-2">
    <router-link
      to="/"
      class="bg-dark dark:bg-surface-tertiary relative size-8 shrink-0 overflow-hidden rounded-full"
    >
      <img src="@/assets/svg/psider.svg" class="absolute top-2 left-1 -my-px -ml-px scale-200" />
    </router-link>

    <p
      class="text-text-tertiary text-ui-small relative text-left select-none"
      :class="{ 'cursor-pointer': isWishTime }"
    >
      i'm in {{ current_location.city }} <br />
      and it is {{ currentTime }} right now
    </p>

    <button
      v-if="isButtonVisible"
      v-tooltip="{ content: isPopping ? null : timeTooltip }"
      class="btn icon-only relative overflow-hidden border-transparent hover:from-transparent hover:to-transparent hover:shadow-none active:from-transparent active:to-transparent"
      :class="{
        'bg-amber-200 dark:bg-amber-500/20': isWishTime,
        'bg-surface-secondary': !isWishTime,
        'translate-y-0.5 border-amber-400! shadow-none transition-transform duration-200':
          isPressing,
        'translate-y-0.5 border-transparent bg-transparent! shadow-none transition-transform duration-200 hover:from-transparent hover:to-transparent':
          isPopping,
        'popping cursor-default': isPopping,
        jitter: isReadyToPop,
      }"
      @mousedown="onPressStart"
      @mouseup="onPressEnd"
      @mouseleave="onPressEnd"
      @touchstart="onPressStart"
      @touchend="onPressEnd"
    >
      <div
        v-if="!isWishTime"
        class="text-text-tertiary outline-text-tertiary flex size-4.5 scale-75 items-center justify-center rounded-sm font-mono font-semibold outline"
      >
        ?
      </div>
      <span v-else class="z-10 inline-block text-[24px] transition-transform">🤞</span>

      <div
        class="pointer-events-none absolute bottom-0 w-full bg-amber-400"
        :class="isPopping ? 'bg-transparent' : 'transition-all ease-linear'"
        :style="{
          height: isPressing || isPopping ? '40px' : '0px',
          transitionDuration: isPressing ? '5s' : '0s',
        }"
      ></div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { addDays, differenceInMinutes } from 'date-fns'
import { onMounted, onUnmounted, ref } from 'vue'

import { supabase } from '../supabase'

interface Location {
  city: string
  timezone: string
}

const current_location = ref<Location>({
  city: 'bengaluru, india',
  timezone: 'Asia/Kolkata',
})

const currentTime = ref('11:11')
const timeTooltip = ref('')

const isWishTime = ref(false)
const isPressing = ref(false)
const isPopping = ref(false)
const isButtonVisible = ref(true)
const nextWishTimeStr = ref('')

let holdTimeout: any = null
const isReadyToPop = ref(false)

const onPressStart = () => {
  if (!isWishTime.value) return
  isPressing.value = true
  isPopping.value = false
  isReadyToPop.value = false

  if (holdTimeout) clearTimeout(holdTimeout)
  holdTimeout = setTimeout(() => {
    isReadyToPop.value = true
  }, 4800)
}

const onPressEnd = () => {
  if (!isPressing.value) return
  isPressing.value = false
  if (holdTimeout) clearTimeout(holdTimeout)

  if (isReadyToPop.value) {
    isPopping.value = true
    isReadyToPop.value = false

    localStorage.setItem('lastWishTime', nextWishTimeStr.value)

    setTimeout(() => {
      isPopping.value = false
      isButtonVisible.value = false
    }, 1000)
  }
}

let timer: ReturnType<typeof setInterval>

const updateTime = () => {
  if (!current_location.value.timezone) return

  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: current_location.value.timezone,
  })

  const formatted = formatter.format(new Date())
  currentTime.value = formatted

  const parts = formatted.split(':')
  let h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (h === 24) h = 0

  let targetH = h
  let targetM = h

  if (m >= targetM) {
    targetH = (h + 1) % 24
    targetM = targetH
  }

  const nowMock = new Date()
  nowMock.setHours(h, m, 0, 0)

  let targetMock = new Date()
  targetMock.setHours(targetH, targetM, 0, 0)

  if (targetMock < nowMock) {
    targetMock = addDays(targetMock, 1)
  }

  const mins = differenceInMinutes(targetMock, nowMock)
  nextWishTimeStr.value = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`
  const lastWish = localStorage.getItem('lastWishTime')

  if (lastWish === nextWishTimeStr.value) {
    isButtonVisible.value = false
    isWishTime.value = false
  } else {
    isButtonVisible.value = true
    if (mins === 0) {
      timeTooltip.value = 'press and hold to make a wish'
      isWishTime.value = true
    } else {
      timeTooltip.value = `come back to this in ${mins} minutes`
      isWishTime.value = false
    }
  }
}

async function getCurrentLocation() {
  try {
    const { data } = await supabase.from('variables').select().eq('id', 'current_location')
    if (data && data[0]) {
      current_location.value.city = data[0].value.city || ''
      current_location.value.timezone = data[0].value.time || data[0].value.timezone || ''
      updateTime()
    }
  } catch (err) {
    console.error('Error fetching location:', err)
  }
}

onMounted(() => {
  getCurrentLocation()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
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
  animation: popWish 1s cubic-bezier(1, -0.5, 0, 1) forwards;
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
</style>
