<template>
  <header
    data-sync="header"
    class="pointer-events-none z-30 flex w-screen flex-row items-center justify-center"
    :class="{ 'desktop:sticky desktop:top-0': isHome }"
  >
    <div
      class="max-w-container desktop:px-10 flex w-full flex-row items-center justify-between px-4 py-5"
    >
      <!-- Logo and Location Wish -->
      <LocationWish />

      <!-- Right side -->
      <div class="desktop:gap-4 pointer-events-none flex flex-row items-center gap-2">
        <!-- Avatar stack -->
        <div
          :class="{ 'avatar-scroll-out': isHome }"
          class="desktop:flex pointer-events-auto hidden"
        >
          <HeaderAvatars v-reveal="50" />
        </div>

        <!-- Multiplayer tools -->
        <div
          v-reveal="100"
          v-tooltip="{
            content: global.allowMultiplayer.value ? 'hide other visitors' : 'show other visitors',
            hideOnClick: false,
            group: 'header-right',
          }"
          class="pointer-events-auto"
        >
          <button
            class="btn stroke icon-only"
            :aria-label="
              global.allowMultiplayer.value ? 'Hide other visitors' : 'Show other visitors'
            "
            @click="toggleMultiplayer()"
          >
            <MousePointer2 v-if="global.allowMultiplayer.value" :size="16" />
            <MousePointer2Off v-else :size="16" />
          </button>
        </div>

        <!-- Theme -->
        <ThemeToggle v-reveal="150" class="pointer-events-auto" />

        <!-- Login -->
        <div v-reveal="200" class="desktop:flex pointer-events-auto hidden">
          <button v-if="!currentUser" class="btn primary" @click="isAuthModalOpen = true">
            Log in
          </button>
          <button v-else class="btn stroke" @click="signOut()">Log out</button>
        </div>
        <div class="desktop:hidden pointer-events-auto flex">
          <button
            v-if="!currentUser"
            class="btn icon-only primary"
            aria-label="Log in"
            @click="isAuthModalOpen = true"
          >
            <LogIn :size="16" />
          </button>
          <button v-else class="btn icon-only stroke" aria-label="Log out" @click="signOut()">
            <LogOut :size="16" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LogIn, LogOut, MousePointer2, MousePointer2Off } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { currentUser, isAuthModalOpen, signOut } from '../composables/useAuth'
import { global } from '../composables/useGlobal'
import { toggleMultiplayer } from '../composables/useLive'
import HeaderAvatars from './HeaderAvatars.vue'
import LocationWish from './LocationWish.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const isHome = computed(() => route.name === 'Home' || route.path === '/')
</script>

<style scoped>
@supports (animation-timeline: scroll()) {
  .avatar-scroll-out {
    animation: avatar-scroll-out linear both;
    animation-timeline: scroll();
    animation-range: 0 70px;
  }
}

@keyframes avatar-scroll-out {
  to {
    opacity: 0;
    transform: translateY(-70px);
    max-width: 0;
    margin-right: -1rem;
    pointer-events: none;
    visibility: hidden;
  }
}
</style>
