<template>
  <div
    ref="containerRef"
    class="noscrollbar dark:bg-dark dark:border-border-primary relative h-full w-full overflow-scroll rounded-lg border border-transparent bg-[#121212] focus:outline-none"
    tabindex="-1"
  >
    <GenericLoader v-if="isRecentLoading" theme="dark" />
    <template v-else-if="display_tracks.length > 0">
      <div class="text-ui text-light dark:bg-dark sticky top-0 z-1 bg-[#121212] p-4 font-semibold">
        recently played
      </div>
      <div class="flex flex-col gap-0 pr-4 pl-2">
        <div
          v-for="(t, i) in display_tracks"
          :key="t.track_id"
          class="text-ui-small text-light hover:bg-hover-inverted active:bg-press-inverted relative flex w-full cursor-pointer flex-row gap-3 rounded-lg px-2 py-1"
          @click="openLink(t.song_url)"
        >
          <p class="h-4 w-4 shrink-0 text-right tabular-nums opacity-60">{{ i + 1 }}</p>
          <div class="flex grow flex-row items-center gap-1 truncate">
            <p class="truncate">{{ t.title }}</p>
            <span
              v-if="t.explicit"
              class="bg-light/80 size-3 shrink-0 rounded-sm text-center text-[8px] leading-3.5 font-bold text-[#212121]"
              >E</span
            >
          </div>
          <p class="w-30 shrink-0 truncate opacity-60">{{ t.artist }}</p>
          <p class="w-8 shrink-0 text-right tabular-nums opacity-60">{{ t.duration }}</p>
        </div>
      </div>
    </template>
    <div
      v-else
      class="dark:bg-dark flex h-full w-full flex-col items-center justify-center gap-2 bg-[#121212]"
    >
      <OctagonAlert :size="24" class="text-light/50" />
      <div class="text-light/50 text-ui">Error fetching data</div>
    </div>

    <Transition name="slide-up">
      <div
        v-if="!now_playing.is_loading && !isRecentLoading"
        class="group sticky bottom-0 mt-auto w-full p-3.5"
      >
        <div
          class="text-ui-small text-light bg-dark/50 border-light/20 relative flex h-12 flex-row items-center justify-between gap-2 overflow-hidden rounded-l-2xl rounded-r-xl border p-3 backdrop-blur-sm transition-all duration-200"
          :class="[
            now_playing.title || !currentUser
              ? 'group-hover:border-light/25 group-hover:bg-dark/80 cursor-pointer'
              : '',
          ]"
          @click="playerClick(now_playing.song_url)"
        >
          <!-- Color overlay -->
          <div
            class="absolute inset-0 z-0"
            :style="{
              background: `linear-gradient(to right, #212121, ${now_playing.vivid_color})`,
              opacity: 0.25,
            }"
          ></div>

          <img src="@/assets/svg/spotify.svg" alt="spotify" class="z-10 size-5" />
          <template v-if="now_playing.title">
            <img
              v-if="now_playing.cover"
              :src="now_playing.cover"
              alt="cover"
              class="z-10 size-8 rounded-sm"
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
                v-for="i in 5"
                :key="i"
                class="bg-light w-1 rounded-xs transition-all"
                :class="[
                  now_playing.is_playing ? 'animate-waveform' : '',
                  !now_playing.is_playing ? 'h-0.75' : '',
                ]"
                :style="{
                  animationDelay: now_playing.is_playing ? `${i * -Math.random() * 300}ms` : '0s',
                  animationDuration: now_playing.is_playing
                    ? `${Math.max(Math.random() * 1, 0.75)}s`
                    : '0s',
                }"
              ></div>
            </div>
          </template>
          <template v-else-if="!currentUser">
            <p class="text-light grow text-left">log in to see what i'm listening to right now</p>
          </template>
          <template v-else>
            <p class="grow text-left opacity-50">i'm not using spotify right now</p>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { currentUser, isAuthModalOpen } from '@/composables/useAuth.ts'
import { openLink } from '@/utils'

import GenericLoader from '../GenericLoader.vue'

interface DisplayTrack extends Omit<Track, 'duration'> {
  duration: string
}

interface Track {
  artist: string
  duration: number
  explicit: boolean
  song_url: string
  title: string
  track_id: string
}

const containerRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const { data: now_playing_data, isLoading: isNowPlayingLoading } = useQuery({
  enabled: computed(() => isVisible.value && !!currentUser.value),
  queryFn: async () => {
    const res = await fetch('/api/now-playing')
    if (!res.ok) throw new Error('Failed to fetch now playing')
    return await res.json()
  },
  queryKey: ['now-playing'],
  refetchInterval: 30000,
  refetchOnWindowFocus: true,
})

const defaultNowPlaying = {
  artist: '',
  cover: '',
  duration: 0,
  explicit: false,
  is_playing: false,
  song_url: '',
  title: '',
  track_id: '',
  vivid_color: '#333333',
}

const now_playing = computed(() => {
  const data = now_playing_data.value
  const base =
    data?.isPlaying !== undefined
      ? {
          artist: data.artist || '',
          cover: data.albumImageUrl || '',
          duration: data.duration || 0,
          explicit: data.explicit || false,
          is_playing: data.isPlaying,
          song_url: data.songUrl || '',
          title: data.title || '',
          track_id: '',
          vivid_color: data.vividColor || '#333333',
        }
      : defaultNowPlaying

  return { ...base, is_loading: isNowPlayingLoading.value }
})

const { data: recently_played_data, isLoading: isRecentLoading } = useQuery({
  enabled: isVisible,
  queryFn: async () => {
    const res = await fetch('/api/recently-played')
    if (!res.ok) throw new Error('Failed to fetch recently played tracks')
    return (await res.json()) as Track[]
  },
  queryKey: ['recently-played'],
})

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting
    },
    { threshold: 0.1 },
  )

  if (containerRef.value) observer.observe(containerRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

const formatTrackDuration = (duration: number) => {
  if (!duration) return '0:00'
  const totalSeconds = Math.floor(duration / 1000)
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

const display_tracks = computed<DisplayTrack[]>(() => {
  if (!recently_played_data.value) return []

  const seen = new Set<string>()
  return recently_played_data.value.reduce<DisplayTrack[]>((acc, track) => {
    if (!seen.has(track.track_id)) {
      seen.add(track.track_id)
      acc.push({
        ...track,
        duration: formatTrackDuration(track.duration),
      })
    }
    return acc
  }, [])
})

const playerClick = (link: null | string) => {
  if (!currentUser.value) {
    isAuthModalOpen.value = true
    return
  }

  openLink(link)
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
