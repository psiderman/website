import { useQuery } from '@tanstack/vue-query'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { currentUser, isAuthModalOpen } from '@/composables/useAuth'
import { queryKeys } from '@/queryKeys'
import { openLink } from '@/utils'

export interface DisplayTrack extends Omit<Track, 'duration'> {
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

export function useSpotify() {
  const containerRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  const activeFocusIndex = ref(0)

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

  const { data: now_playing_data, isLoading: isNowPlayingLoading } = useQuery({
    enabled: computed(() => isVisible.value && !!currentUser.value),
    queryFn: async ({ signal }) => {
      const res = await fetch('/api/now-playing', { signal })
      if (!res.ok) throw new Error('Failed to fetch now playing')
      return await res.json()
    },
    queryKey: queryKeys.nowPlaying,
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
    queryFn: async ({ signal }) => {
      const res = await fetch('/api/recently-played', { signal })
      if (!res.ok) throw new Error('Failed to fetch recently played tracks')
      return (await res.json()) as Track[]
    },
    queryKey: queryKeys.recentlyPlayed,
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

  const focusSibling = (direction: number) => {
    if (containerRef.value) {
      const focusable = Array.from(containerRef.value.querySelectorAll('a[href]')) as HTMLElement[]
      const index = activeFocusIndex.value
      const nextIndex = index + direction
      if (nextIndex >= 0 && nextIndex < focusable.length) {
        activeFocusIndex.value = nextIndex
        focusable[nextIndex].focus()
      }
    }
  }

  return {
    activeFocusIndex,
    containerRef,
    display_tracks,
    focusSibling,
    isRecentLoading,
    now_playing,
    playerClick,
  }
}
