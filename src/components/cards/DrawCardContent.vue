<template>
  <div v-if="isLoading" class="bg-surface-secondary h-full w-full">
    <GenericLoader />
  </div>
  <div
    v-else
    :ref="setupObserver"
    class="drawing-board focus:outline-none"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <!-- Drawing Surface -->
    <svg
      class="canvas group"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerUp"
    >
      <g v-if="strokes.length === 0 && currentStroke.length === 0" class="pointer-events-none">
        <path
          v-for="(points, i) in backgroundStrokes.slice(0, visibleBgStrokeIndex)"
          :key="'bg' + i"
          :d="getSvgPathFromStroke(points)"
          class="fill-pink-800"
        />
        <path
          v-if="visibleBgStrokeIndex < backgroundStrokes.length"
          :d="
            getSvgPathFromStroke(
              backgroundStrokes[visibleBgStrokeIndex].slice(0, visibleBgPointIndex),
            )
          "
          class="fill-pink-800"
        />
      </g>
      <path
        v-for="(points, i) in strokes"
        :key="i"
        :d="getSvgPathFromStroke(points)"
        class="fill-coal"
      />
      <path v-if="currentStrokePath" :d="currentStrokePath" class="fill-coal" />
    </svg>

    <template v-if="strokes.length > 0">
      <button
        v-if="hasUnsavedChanges"
        class="text-text-tertiary hover:text-text-primary absolute top-0 right-0 z-20 cursor-pointer p-3 transition-colors"
        :class="{ 'animate-pulse cursor-not-allowed opacity-50': isSaving }"
        :disabled="isSaving"
        title="Save Drawing"
        @click="saveDrawing"
      >
        <CloudUpload :size="16" />
      </button>
      <div v-else class="absolute top-0 right-0 z-20 p-3 text-green-600">
        <CloudCheck :size="16" />
      </div>
    </template>

    <div
      v-if="strokes.length === 0 && currentStroke.length === 0 && backgroundArtist"
      class="bg-surface-secondary text-ui-small text-text-tertiary absolute right-0 bottom-0 rounded-tl-xl px-2 py-1"
    >
      by {{ backgroundArtist }}
    </div>

    <div
      class="bg-coal/90 text-ui text-text-inverted-primary pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-20 backdrop-blur-xs transition-opacity duration-300"
      :class="showHelp ? 'opacity-100' : 'opacity-0'"
    >
      <h2 class="text-h2">leave art for others</h2>
      <div class="flex h-8 w-full flex-row items-center justify-between">
        <p class="text-text-inverted-secondary">Click and drag to draw</p>
        <div class="keyboard-key">
          <MousePointer2 :size="16" />
        </div>
      </div>
      <div class="flex h-8 w-full flex-row items-center justify-between">
        <p class="text-text-inverted-secondary">Reset all</p>
        <div class="keyboard-key">R</div>
      </div>
      <div class="flex h-8 w-full flex-row items-center justify-between">
        <p class="text-text-inverted-secondary">Undo last stroke</p>
        <div class="flex flex-row gap-1.5">
          <div class="keyboard-key">⌘</div>
          <div class="keyboard-key">Z</div>
        </div>
      </div>
      <span v-if="!currentUser" class="text-ui-small text-text-tertiary">log in to draw</span>
    </div>
  </div>
</template>

<script lang="ts">
// Persist animation state across component unmounts/remounts (e.g. when hidden by a filter)
const visibleBgStrokeIndex = ref(0)
const visibleBgPointIndex = ref(0)
</script>

<script setup lang="ts">
import { CloudCheck, CloudUpload, MousePointer2 } from '@lucide/vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { getStroke } from 'perfect-freehand'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { currentUser, isAuthModalOpen } from '@/composables/useAuth'
import { supabase } from '@/supabase'

import GenericLoader from '../GenericLoader.vue'

defineProps<{ showHelp?: boolean }>()

const strokes = ref<number[][][]>([])
const currentStroke = ref<number[][]>([])

// Restore draft from local storage
const draft = localStorage.getItem('guestbook_draft_strokes')
if (draft) {
  try {
    const parsed = JSON.parse(draft)
    // Check if it's the old string format and clear it
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      localStorage.removeItem('guestbook_draft_strokes')
    } else {
      strokes.value = parsed
    }
  } catch (e) {
    console.error('Failed to parse guestbook draft', e)
  }
}

function persistDraft() {
  if (strokes.value.length > 0) {
    localStorage.setItem('guestbook_draft_strokes', JSON.stringify(strokes.value))
  } else {
    localStorage.removeItem('guestbook_draft_strokes')
  }
}

let observer: IntersectionObserver | null = null
let animInterval: number = 0

function setupObserver(el: unknown) {
  if (el) {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startAnimation()
          } else {
            stopAnimation()
          }
        },
        { threshold: 0.1 },
      )
    }
    observer.disconnect()
    observer.observe(el as Element)
  } else {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }
}

const { data: latestDrawing, isLoading } = useQuery({
  queryFn: async () => {
    const { data, error } = await supabase
      .from('guestbook')
      .select('id, display_name, created_at, strokes')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') throw error

    if (data && latestDrawing.value && data.id !== latestDrawing.value.id) {
      visibleBgStrokeIndex.value = 0
      visibleBgPointIndex.value = 0
    }

    return data
  },
  queryKey: ['guestbook', 'latest'],
})

const backgroundStrokes = computed(() => {
  const data = latestDrawing.value
  if (!data) return []
  if (data.strokes?.length > 0 && typeof data.strokes[0] === 'string') {
    return []
  }
  return data.strokes || []
})

const backgroundArtist = computed(() => {
  const data = latestDrawing.value
  if (!data) return ''
  const date = format(new Date(data.created_at), 'EEE, MMM d')
  return `${data.display_name.toLowerCase().split(' ')[0]}, ${date.toLowerCase()}`
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  stopAnimation()
})

function getSvgPathFromStroke(points: number[][]) {
  if (!points.length) return ''
  const outline = getStroke(points, {
    simulatePressure: false,
    size: 6,
    smoothing: 0.7,
    streamline: 0.3,
    thinning: 0.5,
  })
  if (!outline.length) return ''

  const d = outline.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...outline[0], 'Q'],
  )
  d.push('Z')
  return d.join(' ')
}

function handleKeyDown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (key === 'r' && !e.ctrlKey && !e.metaKey) {
    strokes.value = []
    resetSaveState()
    persistDraft()
  } else if (key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
    e.preventDefault()
    strokes.value.pop()
    resetSaveState()
    persistDraft()
  }
}

function handlePointerDown(e: PointerEvent) {
  const el = e.currentTarget as SVGElement
  el.setPointerCapture(e.pointerId)
  const rect = el.getBoundingClientRect()
  currentStroke.value = [
    [
      Math.round((e.clientX - rect.left) * 10) / 10,
      Math.round((e.clientY - rect.top) * 10) / 10,
      e.pressure,
    ],
  ]
}

function handlePointerMove(e: PointerEvent) {
  if (e.buttons !== 1) return
  if (currentStroke.value.length === 0) return

  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  currentStroke.value.push([
    Math.round((e.clientX - rect.left) * 10) / 10,
    Math.round((e.clientY - rect.top) * 10) / 10,
    e.pressure,
  ])
}

function handlePointerUp(_e: PointerEvent) {
  if (currentStroke.value.length > 0) {
    if (strokes.value.length >= 500) {
      currentStroke.value = []
      return
    }
    strokes.value.push([...currentStroke.value])
    currentStroke.value = []
    resetSaveState()
    persistDraft()
  }
}

const {
  isPending: isSaving,
  isSuccess: isSaved,
  mutate: performSave,
  reset: resetSaveState,
} = useMutation({
  mutationFn: async () => {
    const name =
      currentUser.value?.user_metadata?.full_name || currentUser.value?.email || 'anonymous'
    const today = format(new Date(), 'yyyy-MM-dd')
    const payload = {
      created_at: today,
      display_name: name,
      strokes: strokes.value,
      updated_at: new Date().toISOString(),
      user_id: currentUser.value!.id,
    }
    const { error } = await supabase
      .from('guestbook')
      .upsert(payload, { onConflict: 'user_id, created_at' })
    if (error) throw error
  },
})

function saveDrawing() {
  if (strokes.value.length === 0) return
  if (!currentUser.value) {
    isAuthModalOpen.value = true
    return
  }
  performSave()
}

function startAnimation() {
  if (animInterval) return
  animInterval = window.setInterval(() => {
    if (visibleBgStrokeIndex.value < backgroundStrokes.value.length) {
      const currentBgStroke = backgroundStrokes.value[visibleBgStrokeIndex.value]
      if (visibleBgPointIndex.value < currentBgStroke.length) {
        visibleBgPointIndex.value += 2 // Speed up by drawing 2 points per frame
      } else {
        visibleBgStrokeIndex.value += 1
        visibleBgPointIndex.value = 0
      }
    } else {
      stopAnimation()
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }
  }, 32)
}

function stopAnimation() {
  if (animInterval) {
    window.clearInterval(animInterval)
    animInterval = 0
  }
}

const currentStrokePath = computed(() => getSvgPathFromStroke(currentStroke.value))

const hasUnsavedChanges = computed(() => {
  if (strokes.value.length === 0) return false
  if (isSaved.value) return false

  if (latestDrawing.value?.strokes) {
    const currentStr = JSON.stringify(strokes.value)
    const latestStr = JSON.stringify(latestDrawing.value.strokes)
    if (currentStr === latestStr) return false
  }

  return true
})

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = '' // Required for legacy browsers
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('You’r art wasn’t saved. Are you sure you want to leave?')
    if (!answer) return false
  }
})
</script>

<style scoped>
@reference "@/style.css";

.drawing-board {
  @apply border-border-faded relative h-full w-full overflow-hidden rounded-lg border;
  background: url('@/assets/images/dot_grid.png');
  background-size: 2.5%;
  @apply bg-repeat;
}

.canvas {
  @apply absolute inset-0 h-full w-full cursor-crosshair touch-none;
}

.keyboard-key {
  @apply bg-surface-primary border-border-high-contrast rounded-special text-text-primary flex h-8 w-8.5 items-center justify-center border;
  box-shadow: 0 4px 0 0 var(--color-border-high-contrast);
}
</style>
