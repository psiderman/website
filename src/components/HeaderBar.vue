<template>
  <header
    data-sync="header"
    class="bg-background/95 sticky top-0 z-50 flex w-screen flex-row items-center justify-center backdrop-blur-xs"
  >
    <div class="max-w-container flex w-full flex-row items-center justify-between px-10 py-5">
      <!-- Logo and Location -->
      <div class="flex flex-row items-center justify-center gap-2">
        <router-link to="/" class="bg-coal relative size-8 shrink-0 overflow-hidden rounded-full">
          <img
            src="@/assets/svg/psider.svg"
            class="absolute top-2 left-1 -my-px -ml-px scale-200"
          />
        </router-link>

        <p class="text-text-tertiary text-ui-small text-left">
          i'm in {{ current_location.city }} <br />
          and it is {{ currentTime }} right now
        </p>
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
          :class="{ 'opacity-50': !hasOtherUsersOnRoute }"
          @click="toggleMultiplayer()"
        >
          <MousePointer2 v-if="global.allowMultiplayer.value" :size="16" />
          <MousePointer2Off v-else :size="16" />
        </button>

        <!-- Theme -->
        <button class="theme-toggle btn stroke pointer-events-none p-0.75">
          <div>
            <Moon :size="16" />
          </div>
          <div>
            <Sun :size="16" />
          </div>
          <div>
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
let timer: ReturnType<typeof setInterval>

const updateTime = () => {
  if (!current_location.value.timezone) return

  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: current_location.value.timezone,
  })
  currentTime.value = formatter.format(new Date())
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
