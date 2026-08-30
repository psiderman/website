<template>
  <div class="absolute inset-0 z-0">
    <video
      src="@/assets/mp4/lost.mp4"
      autoplay
      loop
      muted
      class="h-svh w-svw object-contain"
      playsinline
    />
  </div>

  <div class="bg-overlay absolute inset-0 flex h-svh flex-col items-center justify-center p-20">
    <div class="font-handwriting text-ui z-10 flex flex-col items-end font-normal">
      <div v-reveal class="-mx-6 flex items-start gap-1.5">
        <img src="@/assets/svg/lyric_mark.svg" class="mt-1.5 size-5" />
        <p class="text-light text-display font-bold">I've been lost</p>
        <img src="@/assets/svg/lyric_mark.svg" class="mt-1.5 size-5 rotate-180" />
      </div>

      <p
        v-for="[text, delay, classes] in credits"
        :key="text"
        v-reveal="delay"
        :class="['origin-right', classes]"
      >
        {{ text }}
      </p>

      <router-link v-reveal="200" to="/" class="btn primary bg-light text-dark text-ui mt-8 w-full">
        Home
      </router-link>

      <a
        v-reveal="250"
        href="https://www.youtube.com/watch?v=YPlR8gyVtWs"
        target="_blank"
        rel="noopener noreferrer"
        class="btn primary inverted text-ui mt-4 w-full backdrop-blur-sm"
      >
        Listen to the song
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const credits = [
  ['–Angie McMahon', 70, 'text-light/30 scale-75'],
  ['–Fred Gibson', 140, 'text-light/50'],
  ['–This page', 210, 'text-light scale-120'],
]
</script>
