<template>
  <header
    data-sync="header"
    class="bg-background/95 sticky top-0 z-50 flex w-screen flex-row items-center justify-center backdrop-blur-xs"
  >
    <div class="max-w-container flex w-full flex-row items-center justify-between px-10 py-5">
      <!-- Logo and Location -->
      <div class="flex flex-row items-center justify-center gap-2">
        <router-link
          to="/"
          class="bg-dark dark:bg-surface-tertiary relative size-8 shrink-0 overflow-hidden rounded-full"
        >
          <img
            src="@/assets/svg/psider.svg"
            class="absolute top-2 left-1 -my-px -ml-px scale-200"
          />
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

      <!-- Right side -->
      <div class="flex flex-row items-center gap-4">
        <!-- Avatar stack -->
        <div v-if="hasOtherUsersOnRoute" class="avatar-stack flex flex-row items-center gap-0">
          <div
            v-for="user in sortedPresenceUsers.slice(0, 5)"
            :key="user.id"
            v-tooltip="{
              content: (user.name || 'Anonymous') + (user.id === activeUserId ? ' (You)' : ''),
              group: 'header-avatars',
              placement: 'bottom',
            }"
            class="avatar bg-background outline-background relative size-9 shrink-0 overflow-hidden rounded-full outline-4 not-first:-ml-2"
          >
            <div
              class="flex size-9 items-center justify-center"
              :class="{ 'opacity-50': user.route !== activeRoute || user.isStale }"
              :style="{ backgroundColor: user.color?.bg, color: user.color?.fg }"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar"
                referrerpolicy="no-referrer"
                class="bg-surface-tertiary absolute inset-0 size-full object-cover"
              />
              <span v-else>
                {{ user.name ? user.name.charAt(0).toUpperCase() : 'A' }}
              </span>
            </div>
            <span v-if="sortedPresenceUsers.length > 5" class="text-text-secondary ml-1">
              + {{ sortedPresenceUsers.length - 5 }} more...
            </span>
          </div>
        </div>

        <!-- Multiplayer tools -->
        <button
          class="btn stroke icon-only"
          :class="{ 'pointer-events-none opacity-50': !hasOtherUsersOnRoute }"
          :disabled="!hasOtherUsersOnRoute"
          @click="toggleMultiplayer()"
        >
          <MousePointer2 v-if="global.allowMultiplayer.value" :size="16" />
          <MousePointer2Off v-else :size="16" />
        </button>
        <!-- Theme -->

        <button class="theme-toggle btn stroke p-0.75">
          <div
            :class="{
              'bg-surface-inverted text-text-inverted-primary rounded-full': theme === 'dark',
            }"
            class="cursor-pointer"
            @click="setTheme('dark')"
          >
            <Moon :size="16" />
          </div>
          <div
            :class="{
              'bg-surface-inverted text-text-inverted-primary rounded-full': theme === 'light',
            }"
            class="cursor-pointer"
            @click="setTheme('light')"
          >
            <Sun :size="16" />
          </div>
          <div
            :class="{
              'bg-surface-inverted text-text-inverted-primary rounded-full': theme === 'system',
            }"
            class="cursor-pointer"
            @click="setTheme('system')"
          >
            <Monitor :size="16" />
          </div>
        </button>

        <!-- Login -->
        <button v-if="!currentUser" class="btn primary" @click="isAuthModalOpen = true">
          Log in
        </button>
        <button v-else class="btn stroke" @click="supabase.auth.signOut()">Log out</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Monitor, Moon, MousePointer2, MousePointer2Off, Sun } from '@lucide/vue'
import { addDays, differenceInMinutes } from 'date-fns'
import { onMounted, onUnmounted, ref } from 'vue'

import { currentUser, isAuthModalOpen } from '../composables/useAuth'
import { global } from '../composables/useGlobal'
import {
  activeRoute,
  activeUserId,
  hasOtherUsersOnRoute,
  sortedPresenceUsers,
  toggleMultiplayer,
} from '../composables/useLive'
import { setTheme, theme } from '../composables/useTheme'
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
    // 5 seconds reached, it's ready to pop when released
    isReadyToPop.value = true
  }, 4800)
}

const onPressEnd = () => {
  if (!isPressing.value) return
  isPressing.value = false
  if (holdTimeout) clearTimeout(holdTimeout)

  // Only pop if they held it for the full 5 seconds before releasing
  if (isReadyToPop.value) {
    isPopping.value = true
    isReadyToPop.value = false

    // Save to local storage so button vanishes for this specific matching time
    localStorage.setItem('lastWishTime', nextWishTimeStr.value)

    // After pop finishes, hide button completely
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

  // Parse current hour/minute in the target timezone
  const parts = formatted.split(':')
  let h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (h === 24) h = 0

  // Calculate the next matching HH:MM
  let targetH = h
  let targetM = h

  if (m >= targetM) {
    targetH = (h + 1) % 24
    targetM = targetH
  }

  // Use date-fns to compute the difference
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

button.theme-toggle > div {
  @apply flex size-8 items-center justify-center p-2;
}

.avatar-stack {
  z-index: 0;

  & .avatar:nth-child(1) {
    z-index: 5;
  }
  & .avatar:nth-child(2) {
    z-index: 4;
  }
  & .avatar:nth-child(3) {
    z-index: 3;
  }
  & .avatar:nth-child(4) {
    z-index: 2;
  }
  & .avatar:nth-child(5) {
    z-index: 1;
  }
}
</style>

<style scoped>
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
