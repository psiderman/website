<template>
  <div
    ref="containerRef"
    class="noscrollbar dark:bg-dark dark:border-border-primary relative size-full overflow-scroll rounded-lg border border-transparent bg-[#121212]"
  >
    <GenericLoader v-if="isRecentLoading" theme="dark" />
    <template v-else-if="display_tracks.length > 0">
      <div
        class="text-ui text-light dark:bg-dark sticky -top-4 z-1 bg-[#121212] p-4 pb-1 font-semibold"
      >
        recently played
      </div>
      <div
        class="flex flex-col gap-0 pt-3 pr-4 pl-2"
        @keydown.down.prevent="focusSibling(1)"
        @keydown.up.prevent="focusSibling(-1)"
      >
        <a
          v-for="(t, idx) in display_tracks"
          :key="t.track_id"
          v-reveal="Math.min(idx * 50, 350)"
          class="text-ui-small focus-visible:outline-light/50! text-light hover:bg-hover-inverted active:bg-press-inverted relative flex w-full cursor-pointer flex-row gap-3 rounded-lg px-2 py-1"
          :href="t.song_url"
          target="_blank"
          :tabindex="activeFocusIndex === idx ? 0 : -1"
          @focus="activeFocusIndex = idx"
          @click="handleTrackClick(t)"
        >
          <p class="h-4 w-4 shrink-0 text-right tabular-nums opacity-60">{{ idx + 1 }}</p>
          <div class="flex grow flex-row items-center gap-1 truncate">
            <p class="truncate">{{ t.title }}</p>
            <span
              v-if="t.explicit"
              class="bg-light/80 size-3 shrink-0 rounded-sm text-center text-[8px] leading-3.5 font-bold text-[#212121]"
              >E</span
            >
          </div>
          <p class="desktop:w-30 w-20 shrink-0 truncate opacity-60">{{ t.artist }}</p>
          <p class="w-8 shrink-0 text-right tabular-nums opacity-60">{{ t.duration }}</p>
        </a>
      </div>
    </template>
    <div
      v-else
      class="dark:bg-dark flex size-full flex-col items-center justify-center gap-2 bg-[#121212]"
    >
      <OctagonAlert :size="24" class="text-light/50" />
      <div class="text-light/50 text-ui">Error fetching data</div>
    </div>

    <Transition name="slide-up">
      <div
        v-if="!now_playing.is_loading && !isRecentLoading"
        class="group sticky bottom-0 mt-auto w-full p-3.5"
      >
        <button
          class="text-ui-small text-light focus-visible:outline-light/50! bg-dark/50 border-light/20 relative flex h-12 w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-l-2xl rounded-r-xl border p-3 backdrop-blur-sm transition-colors duration-200"
          :class="[
            now_playing.title || !currentUser
              ? 'group-hover:border-light/25 group-hover:bg-dark/80 cursor-pointer'
              : '',
          ]"
          @click="handlePlayerClick(now_playing.song_url)"
        >
          <!-- Color overlay -->
          <div
            class="absolute inset-0 z-0"
            :style="{
              background: `linear-gradient(to right, #212121, ${now_playing.vivid_color})`,
              opacity: 0.25,
            }"
          ></div>

          <img
            src="@/assets/svg/spotify.svg"
            alt=""
            aria-hidden="true"
            class="z-10 size-5"
            width="24"
            height="24"
          />
          <template v-if="now_playing.title">
            <img
              v-if="now_playing.cover"
              :src="now_playing.cover"
              :alt="`${now_playing.title} album cover`"
              class="z-10 size-8 rounded-sm"
              width="128"
              height="128"
            />

            <div class="z-10 flex min-w-0 grow flex-col text-left">
              <div class="flex flex-row items-center gap-1">
                <p class="truncate">{{ now_playing.title }}</p>
                <span
                  v-if="now_playing.explicit"
                  class="bg-light/80 size-3 rounded-sm text-center text-[8px] leading-3.5 font-bold text-[#212121]"
                  >E</span
                >
              </div>

              <p class="truncate opacity-50">{{ now_playing.artist }}</p>
            </div>

            <div class="z-10 flex h-4 items-end gap-0.5">
              <div
                v-for="bar in waveBars"
                :key="bar.i"
                class="bg-light w-1 rounded-xs transition-[height]"
                :class="[
                  now_playing.is_playing && !prefersReducedMotion ? 'animate-waveform' : '',
                  !now_playing.is_playing || prefersReducedMotion ? 'h-0.75' : '',
                ]"
                :style="{
                  animationDelay: bar.delay,
                  animationDuration: bar.duration,
                }"
              ></div>
            </div>
          </template>
          <template v-else-if="!currentUser">
            <p class="text-light grow text-left">log in to see what i’m listening to right now</p>
          </template>
          <template v-else>
            <p class="grow text-left opacity-50">i’m not using spotify right now</p>
          </template>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { computed } from 'vue'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

import { currentUser } from '@/composables/useAuth.ts'
import { useSpotify } from '@/composables/useSpotify'
import { trackEvent } from '@/utils/analytics'

import GenericLoader from '../GenericLoader.vue'

// Stable (non re-randomizing) waveform animation values per bar
const waveBars = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    delay: `${i * -Math.random() * 300}ms`,
    duration: `${Math.max(Math.random() * 1, 0.75)}s`,
    i,
  })),
)

const {
  activeFocusIndex,
  containerRef,
  display_tracks,
  focusSibling,
  isRecentLoading,
  now_playing,
  playerClick: basePlayerClick,
} = useSpotify()

const handleTrackClick = (track: { artist: string; title: string }) => {
  trackEvent('click_spotify_track', {
    artist: track.artist,
    title: track.title,
  })
}

const handlePlayerClick = (url: null | string) => {
  trackEvent('click_spotify_player', {
    artist: now_playing.value.artist || '',
    title: now_playing.value.title || '',
  })
  basePlayerClick(url)
}
</script>

<style scoped>
@reference "@/style.css";

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes waveform {
  0%,
  100% {
    height: 20%;
  }
  50% {
    height: 100%;
  }
}
.animate-waveform {
  animation: waveform 1s ease-in-out infinite;
}
</style>
