<template>
  <div class="avatar-stack flex flex-row items-center gap-0">
    <a
      v-tooltip="{
        content: 'Wilson',
        group: 'header-avatars',
        placement: 'bottom',
      }"
      href="https://share.google/eakcO826TmMal2uqb"
      class="rounded-full"
    >
      <div
        v-if="!global.allowMultiplayer.value"
        v-reveal
        class="avatar outline-background relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 outline-4 dark:bg-zinc-200"
      >
        <img
          src="@/assets/svg/wilson.svg"
          alt=""
          aria-hidden="true"
          class="z-10 size-9"
          width="36"
          height="36"
        />
      </div>
    </a>
    <div
      v-for="user in sortedPresenceUsers.slice(0, 5)"
      :key="user.id"
      v-tooltip="{
        allowHTML: true,
        content: getTooltipContent(user),
        group: 'header-avatars',
        placement: 'bottom',
      }"
      class="avatar bg-background outline-background relative size-9 shrink-0 rounded-full outline-4 not-first:-ml-2"
    >
      <div
        class="flex size-9 items-center justify-center rounded-full"
        :class="{ 'opacity-50': user.room !== activeRoomName || user.isStale }"
        :style="{ backgroundColor: user.color?.bg, color: user.color?.fg }"
      >
        <img
          v-if="user.avatar"
          v-lazy="user.avatar"
          referrerpolicy="no-referrer"
          class="bg-surface-tertiary absolute inset-0 size-full rounded-full object-cover"
          width="160"
          height="160"
        />
        <span v-else class="text-sm font-semibold">
          {{ getInitial(user.name) }}
        </span>
        <div
          v-if="isHighClearance(user.role) && user.id === activeUserId"
          v-reveal
          class="bg-background absolute -right-2 -bottom-2 z-10 flex size-5.25 items-center justify-center rounded-full"
        >
          <TheListIndicator size="sm" />
        </div>
      </div>
    </div>

    <span
      v-if="sortedPresenceUsers.length > 5"
      aria-live="polite"
      class="text-text-secondary ml-2 text-sm whitespace-nowrap"
    >
      + {{ sortedPresenceUsers.length - 5 }} more…
    </span>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'

import TheListIndicator from '@/components/TheListIndicator.vue'
import { global } from '@/composables/useGlobal'
import { isHighClearance } from '@/composables/useTravel'

import {
  activeRoomName,
  activeUserId,
  type PresenceUser,
  sortedPresenceUsers,
} from '../composables/useLive'

// Presence names are user-supplied — reduce to plain text before it's
// interpolated into the allowHTML tooltip.
const TEXT_CLEAN = { ALLOWED_ATTR: [], ALLOWED_TAGS: [] }

const getTooltipContent = (user: PresenceUser) => {
  const isMe = user.id === activeUserId.value
  const name = DOMPurify.sanitize(
    isMe ? `You (${user.name})` : user.name || 'Anonymous',
    TEXT_CLEAN,
  )
  if (isHighClearance(user.role) && isMe) {
    return `${name}<br />are on “the list”`
  }
  return name
}

const getInitial = (name?: string) => {
  if (!name) return '?'
  if (name.startsWith('Anonymous ')) {
    return name.slice(10).charAt(0).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}
</script>

<style scoped>
@reference "@/style.css";

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
