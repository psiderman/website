<template>
  <div class="avatar-stack flex flex-row items-center gap-0">
    <div
      v-if="!global.allowMultiplayer.value && !hasOtherUsersOnRoom"
      v-tooltip="{
        content: 'Wilson',
        group: 'header-avatars',
        placement: 'bottom',
      }"
      class="avatar outline-background relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 outline-4 dark:bg-zinc-200"
    >
      <img src="@/assets/svg/wilson.svg" class="z-10 size-9" />
    </div>
    <div
      v-for="user in sortedPresenceUsers.slice(0, 5)"
      :key="user.id"
      v-tooltip="{
        content: getTooltipContent(user),
        group: 'header-avatars',
        placement: 'bottom',
      }"
      class="avatar bg-background outline-background relative size-9 shrink-0 overflow-hidden rounded-full outline-4 not-first:-ml-2"
    >
      <div
        class="flex size-9 items-center justify-center"
        :class="{ 'opacity-50': user.room !== activeRoomName || user.isStale }"
        :style="{ backgroundColor: user.color?.bg, color: user.color?.fg }"
      >
        <img
          v-if="user.avatar"
          v-lazy="user.avatar"
          referrerpolicy="no-referrer"
          class="bg-surface-tertiary absolute inset-0 size-full object-cover"
          width="160"
          height="160"
        />
        <span v-else class="text-sm font-semibold">
          {{ getInitial(user.name) }}
        </span>
      </div>
    </div>

    <span
      v-if="sortedPresenceUsers.length > 5"
      class="text-text-secondary ml-2 text-sm whitespace-nowrap"
    >
      + {{ sortedPresenceUsers.length - 5 }} more...
    </span>
  </div>
</template>

<script setup lang="ts">
import { global } from '@/composables/useGlobal'

import {
  activeRoomName,
  activeUserId,
  hasOtherUsersOnRoom,
  sortedPresenceUsers,
} from '../composables/useLive'

const getTooltipContent = (user: { id: string; name?: string }) => {
  if (user.id === activeUserId.value) {
    return `You (${user.name})`
  }
  return user.name || 'Anonymous'
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
