<template>
  <TabGroup
    :selected-index="selectedTab"
    as="div"
    class="flex h-screen w-screen flex-col"
    @change="(index: number) => (selectedTab = index)"
  >
    <div
      class="bg-surface-inverted text-text-inverted-primary text-ui flex items-center justify-center border-b border-transparent p-2"
    >
      suitlady v1.1
    </div>
    <TabList
      class="border-border-primary noscrollbar flex w-full flex-row gap-1 overflow-scroll border-b"
    >
      <Tab v-for="tab in tabs" :key="tab.name" v-slot="{ selected }" as="template">
        <button
          class="text-ui flex cursor-pointer flex-row items-center justify-center gap-2 border-b-2 p-2 transition-colors outline-none"
          :class="
            selected
              ? 'border-surface-inverted text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary border-transparent'
          "
        >
          <component :is="tab.icon" :size="16" />
          <span>{{ tab.name }}</span>
        </button>
      </Tab>
    </TabList>

    <TabPanels
      ref="scrollContainer"
      class="relative h-full w-full overflow-auto"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Pull to Refresh Indicator -->
      <div
        class="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-center transition-all duration-150 ease-out"
        :style="{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0,
          transform: `translateY(${Math.min(pullDistance, pullThreshold * 1.5)}px)`,
        }"
      >
        <div
          class="bg-surface-primary border-border-primary flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
        >
          <Loader
            :size="16"
            :class="['text-text-primary', isRefreshing ? 'animate-spin' : '']"
            :style="{
              transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined,
            }"
          />
          <span class="text-ui-small text-text-secondary">
            {{
              isRefreshing
                ? 'Refreshing...'
                : pullDistance > pullThreshold
                  ? 'Release to refresh'
                  : 'Pull to refresh'
            }}
          </span>
        </div>
      </div>

      <!-- Roles Tab Panel -->
      <TabPanel class="outline-none">
        <div v-for="user in userRolesList" :key="user.user_id" class="px-4">
          <!-- User / Image + Name -->
          <div
            class="border-border-primary relative flex w-full flex-row items-center justify-between gap-4 border-b py-4"
          >
            <div class="relative flex min-w-0 flex-1 flex-row items-center gap-4">
              <div
                class="border-border-primary bg-surface-secondary size-8 shrink-0 overflow-hidden rounded-full border"
              >
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.full_name || 'User avatar'"
                  class="size-full object-cover"
                  @error="user.avatar_url = undefined"
                />
                <div
                  v-else
                  class="text-text-tertiary flex size-full items-center justify-center font-medium uppercase"
                >
                  {{ (user.full_name || user.email || 'U').charAt(0) }}
                </div>
              </div>
              <div class="flex min-w-0 flex-1 flex-col">
                <p class="text-text-primary truncate font-medium">
                  {{ user.full_name }}
                </p>
                <p class="text-text-tertiary text-mono truncate" :title="user.user_id">
                  {{ user.email }}
                </p>
              </div>
            </div>
            <div
              class="text-ui border-border-primary bg-surface-primary relative inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-0"
            >
              <div class="flex flex-row items-center justify-start gap-1">
                <div
                  :class="getRoleBadgeClass(pendingRoles[user.user_id] || user.role)"
                  class="h-4 w-1.5 rounded-full"
                ></div>
                <span>{{ pendingRoles[user.user_id] || user.role }}</span>
              </div>

              <ChevronDown :size="14" class="shrink-0 opacity-70" />

              <select
                v-model="pendingRoles[user.user_id]"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                @change="saveRole(user)"
              >
                <option v-for="role in clearanceLevels" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- People Tab Panel -->
      <TabPanel class="outline-none">
        <!-- Content for people -->
      </TabPanel>

      <!-- Trip Tab Panel -->
      <TabPanel class="outline-none">
        <!-- Content for trip -->
      </TabPanel>

      <!-- Images Tab Panel -->
      <TabPanel class="outline-none">
        <!-- Content for images -->
      </TabPanel>

      <!-- Guestbook Tab Panel -->
      <TabPanel class="outline-none">
        <div class="flex flex-col gap-4 p-4">
          <div v-for="entry in guestbookEntries" :key="entry.id" class="flex flex-col gap-2">
            <div class="flex flex-row justify-between">
              <span class="text-text-secondary text-ui-small uppercase">{{
                format(new Date(entry.updated_at ?? ''), 'dd MMMM, yy HH:mm')
              }}</span>
              <button
                class="text-ui-small text-red-700 uppercase"
                @click="deleteGuestbookEntry(entry.id)"
              >
                Delete
              </button>
              <!-- <button
                type="button"
                class="btn primary h-6 cursor-pointer"
                title="Delete drawing"
              ></button> -->
            </div>
            <div class="drawing-board relative h-80! w-full">
              <svg class="h-full w-full">
                <path
                  v-for="(points, idx) in parseStrokes(entry.strokes)"
                  :key="idx"
                  :d="getSvgPathFromStroke(points)"
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
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import {
  BriefcaseBusiness,
  ChevronDown,
  GalleryHorizontal,
  KeyRound,
  Loader,
  Luggage,
  Pencil,
} from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { getStroke } from 'perfect-freehand'
import { computed, reactive, ref, watch } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { supabase } from '@/supabase'

import type { ClearanceLevel } from '@/composables/useTravel'

interface UserRoleRecord {
  avatar_url?: string
  created_at?: string
  email?: string
  full_name?: string
  last_sign_in_at?: string
  role: ClearanceLevel
  user_id: string
}

const selectedTab = ref(4)
const tabs = [
  { icon: KeyRound, name: 'roles' },
  { icon: BriefcaseBusiness, name: 'people' },
  { icon: Luggage, name: 'trip' },
  { icon: GalleryHorizontal, name: 'images' },
  { icon: Pencil, name: 'guestbook' },
]

const tabQueryKeys: Record<number, string[]> = {
  0: ['admin-user-roles'],
  1: ['admin-work-people'],
  2: ['admin-trips'],
  3: ['admin-images'],
  4: ['admin-guestbook'],
}

const clearanceLevels: ClearanceLevel[] = ['auth', 'known', 'friends', 'close']

const queryClient = useQueryClient()
const pendingRoles = reactive<Record<string, ClearanceLevel>>({})

// Pull to refresh state & handlers
const pullDistance = ref(0)
const pullThreshold = 60
const isRefreshing = ref(false)

let startY = 0
let isPulling = false

async function handleRefresh() {
  const queryKey = tabQueryKeys[selectedTab.value]
  if (queryKey) {
    await queryClient.invalidateQueries({ queryKey })
  }
}

async function onTouchEnd() {
  if (!isPulling || isRefreshing.value) return
  isPulling = false

  if (pullDistance.value >= pullThreshold) {
    isRefreshing.value = true
    pullDistance.value = pullThreshold
    await handleRefresh()
    isRefreshing.value = false
  }
  pullDistance.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (!isPulling || isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  const currentY = e.touches[0].clientY
  const diffY = currentY - startY

  if (diffY > 0 && (!target || target.scrollTop <= 0)) {
    pullDistance.value = Math.min(diffY * 0.45, 120)
  } else {
    pullDistance.value = 0
    isPulling = false
  }
}

function onTouchStart(e: TouchEvent) {
  if (isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  if (!target || target.scrollTop <= 0) {
    startY = e.touches[0].clientY
    isPulling = true
  }
}

const { data: userRolesList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    // Query view with auth profile joined
    const { data: viewData, error: viewError } = await supabase
      .from('admin_user_roles_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (viewError) {
      console.warn('admin_user_roles_view query failed, falling back:', viewError)
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserRoleRecord[]
    }

    return (viewData || []) as UserRoleRecord[]
  },
  queryKey: ['admin-user-roles'],
})

// Sync pending roles when data loads
watch(
  userRolesList,
  (list) => {
    if (list) {
      list.forEach((u) => {
        if (!pendingRoles[u.user_id]) {
          pendingRoles[u.user_id] = u.role
        }
      })
    }
  },
  { immediate: true },
)

const roleBadgeClasses: Record<ClearanceLevel, string> = {
  admin: '',
  auth: 'bg-yellow-500 dark:text-yellow-400',
  close: 'bg-green-500 dark:text-green-400',
  friends: 'bg-purple-500 dark:text-purple-400',
  known: 'bg-blue-500 dark:text-blue-400',
  public: '',
}

// ----------------------------------------------------
// GUESTBOOK TAB
// ----------------------------------------------------
interface GuestbookEntry {
  avatar_url?: string
  created_at?: string
  display_name?: string
  email?: string
  id: string
  strokes: number[][][]
  updated_at?: string
  user_id?: string
}

function getRoleBadgeClass(role: ClearanceLevel) {
  return roleBadgeClasses[role] || roleBadgeClasses.public
}

async function saveRole(user: UserRoleRecord) {
  const newRole = pendingRoles[user.user_id]
  if (!newRole) return

  user.role = newRole

  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ role: newRole, user_id: user.user_id })

    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to update role: ${errorMsg}`)
    await queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  }
}

const { data: guestbookEntries } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data: viewData, error: viewError } = await supabase
      .from('admin_guestbook_view')
      .select('*')
      .order('updated_at', { ascending: false })

    if (viewError) {
      console.warn('admin_guestbook_view query failed, falling back:', viewError)
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data || []) as GuestbookEntry[]
    }

    return (viewData || []) as GuestbookEntry[]
  },
  queryKey: ['admin-guestbook'],
})

async function deleteGuestbookEntry(id: string) {
  if (!confirm('Are you sure you want to delete this drawing?')) return

  try {
    const { error } = await supabase.from('guestbook').delete().eq('id', id)
    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] })
    await queryClient.invalidateQueries({ queryKey: ['guestbook', 'latest'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete drawing: ${errorMsg}`)
  }
}

function getSvgPathFromStroke(points: number[][]) {
  if (!points?.length) return ''
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

function parseStrokes(raw: unknown): number[][][] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  return raw as number[][][]
}
</script>

<style scoped>
@reference "@/style.css";

.drawing-board {
  @apply border-border-primary relative h-full w-full overflow-hidden rounded-lg border;
  background: url('@/assets/patterns/dot_grid.webp');
  background-size: 2.5%;
  @apply bg-repeat;
}

.dark .drawing-board {
  background: url('@/assets/patterns/dot_grid_dark.webp');
  background-size: 2.5%;
}

.canvas {
  @apply absolute inset-0 h-full w-full cursor-crosshair touch-none;
}

.keyboard-key {
  @apply bg-surface-primary border-border-high-contrast rounded-special text-text-primary flex h-8 w-8.5 items-center justify-center border;
  box-shadow: 0 4px 0 0 var(--color-border-high-contrast);
}
</style>
