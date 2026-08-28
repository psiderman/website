<template>
  <header
    data-sync="header"
    class="bg-background z-50 flex w-screen flex-row items-center justify-center backdrop-blur-xs"
  >
    <div
      class="max-w-container desktop:px-10 flex w-full flex-row items-center justify-between px-4 py-5"
    >
      <!-- Logo and Location Wish -->
      <LocationWish />

      <!-- Right side -->
      <div class="desktop:gap-4 flex flex-row items-center gap-2">
        <!-- Avatar stack -->
        <HeaderAvatars class="desktop:flex hidden" />

        <!-- Multiplayer tools -->
        <div
          v-tooltip="{
            content: global.allowMultiplayer.value ? 'hide other visitors' : 'show other visitors',
            hideOnClick: false,
            group: 'header-right',
          }"
        >
          <button
            class="btn stroke icon-only"
            :aria-label="global.allowMultiplayer.value ? 'Hide other visitors' : 'Show other visitors'"
            @click="toggleMultiplayer()"
          >
            <MousePointer2 v-if="global.allowMultiplayer.value" :size="16" />
            <MousePointer2Off v-else :size="16" />
          </button>
        </div>

        <!-- Theme -->
        <ThemeToggle />

        <!-- Login -->
        <div class="desktop:flex hidden">
          <button v-if="!currentUser" class="btn primary" @click="isAuthModalOpen = true">
            Log in
          </button>
          <button v-else class="btn stroke" @click="signOut()">Log out</button>
        </div>
        <div class="desktop:hidden flex">
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

import { currentUser, isAuthModalOpen, signOut } from '../composables/useAuth'
import { global } from '../composables/useGlobal'
import { toggleMultiplayer } from '../composables/useLive'
import HeaderAvatars from './HeaderAvatars.vue'
import LocationWish from './LocationWish.vue'
import ThemeToggle from './ThemeToggle.vue'
</script>
