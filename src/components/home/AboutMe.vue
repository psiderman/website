<template>
  <div class="flex w-full flex-row items-center justify-center gap-8 p-20">
    <img
      src="@/assets/images/public.jpg"
      alt="karan sanas"
      class="border-border-primary aspect-auto h-60 rounded-[5rem] border"
    />
    <div class="flex w-120 flex-col items-start justify-center gap-4">
      <div class="text-ui text-text-secondary flex flex-col gap-0">
        <p>@psiderman</p>
        <h1 class="text-display text-text-primary">hi, i'm karan</h1>
        <p class="-mt-1">
          i’m still searching for a one-liner to sum me up.<br />until then my life is a bento box
          of endless interests,<br />neatly packed for display on my ever-evolving personal website.
        </p>
      </div>
      <div class="flex w-full flex-row justify-between">
        <div
          v-for="emj in emojis"
          :key="emj.id"
          class="bg-surface-tertiary text-ui flex size-14 items-center justify-center rounded-full"
        >
          {{ emj.emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emojis = [
  { emoji: '🤑', id: 'pf' },
  { emoji: '💼', id: 'work' },
  { emoji: '🛠️', id: 'building' },
  { emoji: '🎵', id: 'music' },
  { emoji: '🎮', id: 'gaming' },
  { emoji: '🗺️', id: 'travel' },
  { emoji: '🌻', id: 'life' },
]
</script>
