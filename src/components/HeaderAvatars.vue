<template>
  <div v-if="hasOtherUsersOnRoom" class="avatar-stack flex flex-row items-center gap-0">
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
        :class="{ 'opacity-50': user.room !== activeRoomName || user.isStale }"
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
import {
  activeRoomName,
  activeUserId,
  hasOtherUsersOnRoom,
  sortedPresenceUsers,
} from '../composables/useLive'
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
