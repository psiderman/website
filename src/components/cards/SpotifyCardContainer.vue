<template>
  <div ref="containerRef" class="noscrollbar relative h-full w-full overflow-scroll bg-[#121212]">
    <GenericLoader v-if="isRecentLoading" theme="dark" />
    <template v-else>
      <div
        class="text-ui text-text-inverted-primary sticky top-0 z-1 bg-[#121212] p-4 font-semibold"
      >
        recently played
      </div>
      <div class="flex flex-col gap-0 pr-4 pl-2">
        <div
          v-for="(t, i) in display_tracks"
          :key="t.track_id"
          class="text-ui-small text-text-inverted-primary hover:bg-hover-inverted active:bg-press-inverted relative flex w-full cursor-pointer flex-row gap-3 rounded-lg px-2 py-1"
          @click="handleClick(t.song_url)"
        >
          <p class="h-4 w-4 shrink-0 text-right tabular-nums opacity-60">{{ i + 1 }}</p>
          <p class="grow truncate">{{ t.title }}</p>
          <p class="w-30 shrink-0 truncate opacity-60">{{ t.artist }}</p>
          <p class="w-8 shrink-0 text-right tabular-nums opacity-60">{{ t.duration }}</p>
        </div>
      </div>
    </template>

    <Transition name="slide-up">
      <div v-if="!now_playing.is_loading" class="group sticky bottom-0 mt-auto w-full p-3.5">
        <div
          class="text-ui-small text-text-inverted-primary bg-coal/50 border-light/25 relative flex h-12 flex-row items-center justify-between gap-2 overflow-hidden rounded-l-2xl rounded-r-xl border p-3 backdrop-blur-sm transition-all duration-200"
          :class="[
            now_playing.title
              ? 'group-hover:border-light/30 group-hover:bg-coal/80 cursor-pointer'
              : '',
          ]"
          @click="handleClick(now_playing.song_url)"
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
              <p class="truncate">{{ now_playing.title }}</p>
              <p class="truncate opacity-50">{{ now_playing.artist }}</p>
            </div>

            <div class="z-10 flex h-4 items-center gap-0.5">
              <div
                v-for="i in 4"
                :key="i"
                class="bg-text-inverted-primary w-1 rounded-xs transition-all duration-300"
                :class="[
                  now_playing.is_playing ? 'animate-waveform' : '',
                  !now_playing.is_playing ? 'h-0.75' : '',
                ]"
                :style="{
                  animationDelay: now_playing.is_playing ? `${i * -0.66}s` : '0s',
                }"
              ></div>
            </div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { supabase } from '@/supabase'

import GenericLoader from '../GenericLoader.vue'

interface track {
  artist: string
  duration: number
  song_url: string
  title: string
  track_id: string
}

const now_playing = ref({
  artist: '',
  cover: '',
  duration: 0,
  is_loading: true,
  is_playing: false,
  song_url: '',
  title: '',
  track_id: '',
  vivid_color: '#333333',
})

const recently_played = ref<track[]>([])
const isRecentLoading = ref(true)
const containerRef = ref<HTMLElement | null>(null)

const fetchNowPlaying = async () => {
  try {
    const res = await fetch('/api/now-playing')
    if (res.ok) {
      const data = await res.json()
      if (data.isPlaying !== undefined) {
        now_playing.value = {
          artist: data.artist || '',
          cover: data.albumImageUrl || '',
          duration: data.duration || 0,
          is_loading: false,
          is_playing: data.isPlaying,
          song_url: data.songUrl || '',
          title: data.title || '',
          track_id: '',
          vivid_color: data.vividColor || '#333333',
        }
      } else {
        now_playing.value.is_loading = false
      }
    } else {
      now_playing.value.is_loading = false
    }
  } catch (err) {
    now_playing.value.is_loading = false
    console.error('Error fetching now playing:', err)
  }
}

const fetchRecentlyPlayed = async () => {
  try {
    const { data, error } = await supabase
      .from('spotify_recently_played')
      .select('*')
      .order('played_at', { ascending: false })
      .limit(13)

    if (error) throw error
    if (data) {
      recently_played.value = data
    }
  } catch (err) {
    console.error('Error fetching recently played:', err)
  } finally {
    isRecentLoading.value = false
  }
}

let pollInterval: null | ReturnType<typeof setInterval> = null
let observer: IntersectionObserver | null = null

const startPolling = () => {
  if (pollInterval) return
  pollInterval = setInterval(() => {
    if (!document.hidden) {
      fetchNowPlaying()
    }
  }, 300000)
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    stopPolling()
  }
}

let isVisible = false

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting
      if (isVisible) {
        if (recently_played.value.length === 0) fetchRecentlyPlayed()
        fetchNowPlaying()
        startPolling()
      } else {
        stopPolling()
      }
    },
    { threshold: 0.1 },
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopPolling()
    } else if (isVisible) {
      startPolling()
      fetchNowPlaying() // instantly refresh when coming back
    }
  })
})

onUnmounted(() => {
  stopPolling()
  if (observer) {
    observer.disconnect()
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const formatTrackDuration = (duration: number) => {
  if (!duration) return '0:00'
  const totalSeconds = Math.floor(duration / 1000)
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

const display_tracks = computed(() => {
  const seen = new Set()

  return recently_played.value
    .filter((a) => {
      if (seen.has(a.track_id)) return false
      seen.add(a.track_id)
      return true
    })
    .map((a) => ({
      ...a,
      duration: formatTrackDuration(a.duration),
    }))
})

const handleClick = (link: null | string) => {
  if (link) {
    window.open(link, '_blank')
  }
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
