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
        class="size-10 shrink-0 overflow-hidden rounded-full"
        :class="isHomeView ? 'cursor-default!' : 'hover:opacity-80 active:opacity-90'"
        aria-label="Psiderman home"
      >
        <img src="/psider.webp" alt="" aria-hidden="true" class="size-10" width="80" height="80" />
      </router-link>
    </Transition>

    <!-- Mobile: tap to open the big wish dialog -->
    <div v-if="isWishTime && isCoarsePointer" v-reveal class="relative size-10 shrink-0">
      <button
        type="button"
        aria-label="Make a wish"
        class="relative size-full overflow-hidden rounded-full border-2 border-transparent bg-amber-200 dark:bg-amber-500/20"
        @click="isWishDialogOpen = true"
      >
        <span
          class="text-h2 flex size-full flex-col items-center justify-center"
          aria-hidden="true"
        >
          🤞
        </span>
      </button>
    </div>

    <!-- Desktop: interactive circle in place -->
    <WishCircle
      v-else-if="isWishTime && !isCoarsePointer"
      show-tooltip
      size="sm"
      @wished="onWished"
    />

    <div
      v-if="isWishTime && !isWishDialogOpen && !isPopping"
      class="absolute -left-5 -z-10 size-20 animate-ping! rounded-full bg-amber-200 group-hover:invisible dark:bg-amber-500/20"
    ></div>

    <div class="text-text-tertiary text-ui-small flex flex-col gap-1">
      <div v-reveal="100" class="flex flex-row gap-1">
        <Globe2 :size="16" />
        i'm in {{ current_location.city }}
      </div>
      <div
        v-tooltip="{ content: isWishTime ? null : 'can’t make a wish yet', placement: 'right' }"
        v-reveal="50"
        class="flex w-fit flex-row items-center gap-1 tabular-nums"
      >
        <MiniClock :time="currentTime" :size="16" />
        and it is
        {{
          isWishTime
            ? `${currentTime.split(':').slice(0, -1).join(':')}, time to make a wish`
            : currentTime
        }}
      </div>
    </div>

    <WishDialog :is-open="isWishDialogOpen" @close="isWishDialogOpen = false" @wished="onWished" />
  </div>
</template>

<script setup lang="ts">
import { Globe2 } from '@lucide/vue'
import { addDays } from 'date-fns'
import { onMounted, onUnmounted, ref } from 'vue'

import { isHomeView } from '@/composables/useLive.ts'

import MiniClock from './MiniClock.vue'
import WishCircle from './WishCircle.vue'
import WishDialog from './WishDialog.vue'

interface Location {
  city: string
  timezone: string
}

const current_location = ref<Location>({
  city: 'bengaluru, india',
  timezone: 'Asia/Kolkata',
})

const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

const currentTime = ref('11:11:11')

const isWishTime = ref(false)
const isPopping = ref(false)
const isWishDialogOpen = ref(false)
const nextWishTimeStr = ref('')
const lastWish = ref<null | string>(null)

const onWished = () => {
  isPopping.value = true
  lastWish.value = nextWishTimeStr.value
  localStorage.setItem('lastWishTime', nextWishTimeStr.value)

  setTimeout(() => {
    isPopping.value = false
    isWishTime.value = false
    isWishDialogOpen.value = false
  }, 2500)
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

  const yyyy = targetMock.getFullYear()
  const mm = String(targetMock.getMonth() + 1).padStart(2, '0')
  const dd = String(targetMock.getDate()).padStart(2, '0')

  nextWishTimeStr.value = `${yyyy}-${mm}-${dd} ${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}:${String(targetS).padStart(2, '0')}`

  if (lastWish.value === nextWishTimeStr.value) {
    isWishTime.value = false
  } else if (isCurrentlyWishTime) {
    isWishTime.value = true
  } else {
    isWishTime.value = false
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
