<template>
  <div class="flex flex-col gap-4 p-4">
    <div v-for="entry in parsedGuestbookEntries" :key="entry.id" class="flex flex-col gap-2">
      <div class="flex flex-row justify-between">
        <span class="text-text-secondary text-ui-small uppercase">{{
          format(new Date(entry.updated_at ?? ''), 'dd MMMM, yy HH:mm')
        }}</span>
        <button
          class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
          @click="deleteGuestbookEntry(entry.id)"
        >
          Delete
        </button>
      </div>
      <div class="drawing-board relative h-80! w-full">
        <svg class="size-full" :viewBox="entry.viewBox" preserveAspectRatio="xMidYMid meet">
          <path
            v-for="(pathD, idx) in entry.svgPaths"
            :key="idx"
            :d="pathD"
            class="fill-surface-inverted"
          />
        </svg>
        <div
          class="bg-surface-secondary text-ui text-text-tertiary border-border-high-contrast absolute right-0 bottom-0 flex flex-row items-center justify-center gap-1.5 rounded-tl-xl border-t border-l px-2 py-1"
        >
          <img
            v-if="entry.avatar_url"
            :src="entry.avatar_url"
            :alt="entry.display_name || 'User avatar'"
            referrerpolicy="no-referrer"
            class="border-border-primary size-5 rounded-full border object-cover"
            @error="entry.avatar_url = undefined"
          />
          <span class="max-w-60 truncate">
            {{ entry.email || entry.display_name || 'Anonymous' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { computed } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { getDrawingViewBox, getSvgPathFromStroke, parseStrokes } from '../utils/strokes'

import type { GuestbookEntry, ParsedGuestbookEntry } from '../types'

const queryClient = useQueryClient()

const { data: guestbookEntries } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    // Admin-guarded RPC (replaces the previously anon-exposed view)
    const { data, error } = await supabase.rpc('admin_guestbook')
    if (error) throw error
    return ((data || []) as GuestbookEntry[]).sort((a, b) => {
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      return bTime - aTime
    })
  },
  queryKey: queryKeys.admin.guestbook,
})

const parsedGuestbookEntries = computed<ParsedGuestbookEntry[]>(() => {
  return (guestbookEntries.value || []).map((entry) => {
    const strokes = parseStrokes(entry.strokes)
    const svgPaths = strokes.map(getSvgPathFromStroke).filter(Boolean)
    const viewBox = getDrawingViewBox(strokes)
    return {
      ...entry,
      svgPaths,
      viewBox,
    }
  })
})

async function deleteGuestbookEntry(id: string) {
  if (!confirm('Are you sure you want to delete this drawing?')) return

  try {
    const { error } = await supabase.from('guestbook').delete().eq('id', id)
    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.guestbook })
    await queryClient.invalidateQueries({ queryKey: queryKeys.guestbook.latest })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete drawing: ${errorMsg}`)
  }
}
</script>

<style scoped>
@reference "@/style.css";

.drawing-board {
  @apply border-border-primary relative size-full overflow-hidden rounded-lg border;
  background: url('@/assets/patterns/dot_grid.webp');
  background-size: 2.5%;
  @apply bg-repeat;
}

.dark .drawing-board {
  background: url('@/assets/patterns/dot_grid_dark.webp');
  background-size: 2.5%;
}
</style>
