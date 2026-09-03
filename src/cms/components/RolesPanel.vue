<template>
  <div v-for="user in sortedUserRolesList" :key="user.user_id">
    <div
      class="border-border-primary relative flex w-full flex-row items-center justify-between gap-4 border-b px-4 py-4"
    >
      <button
        type="button"
        class="flex min-w-0 flex-1 flex-row items-center gap-2 text-left"
        :aria-expanded="expandedUserId === user.user_id"
        @click="toggleUserExpand(user.user_id)"
      >
        <div
          class="border-border-primary bg-surface-secondary size-8 shrink-0 overflow-hidden rounded-full border"
        >
          <img
            v-if="user.avatar_url"
            :src="user.avatar_url"
            :alt="user.full_name || 'User avatar'"
            referrerpolicy="no-referrer"
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
          <div class="flex items-center gap-1.5">
            <p class="text-text-primary truncate font-medium">
              {{ user.full_name }}
            </p>
            <span
              v-if="user.isOnline"
              v-tooltip="{ content: 'Online now', allowHTML: true }"
              class="relative flex size-2 shrink-0 items-center justify-center"
            >
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75"
              ></span>
              <span class="relative inline-flex size-1.5 rounded-full bg-green-500"></span>
            </span>
            <span
              v-if="user.role === 'auth' && (user.requested_clearance || user.requestedClearance)"
              v-tooltip="{ content: 'Requested access to “the list”', allowHTML: true }"
              class="relative flex size-2 shrink-0 items-center justify-center"
            >
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75"
              ></span>
              <span class="relative inline-flex size-1.5 rounded-full bg-green-500"></span>
            </span>
          </div>
          <p class="text-text-tertiary text-mono truncate" :title="user.user_id">
            {{ user.email }}
          </p>
        </div>
      </button>
      <ClearanceSelect
        :model-value="pendingRoles[user.user_id] || user.role"
        :levels="clearanceLevels"
        select-label="Change user clearance role"
        variant="compact"
        @update:model-value="pendingRoles[user.user_id] = $event"
        @change="saveRole(user)"
      />
    </div>

    <!-- Page views panel -->
    <div
      v-if="expandedUserId === user.user_id"
      class="border-border-primary bg-surface-secondary border-b px-4 py-3"
    >
      <div class="flex flex-row items-center justify-between gap-2">
        <p class="text-ui-small text-text-tertiary tracking-wider uppercase">pages visited</p>
        <Loader v-if="pageViewsLoading" :size="12" class="text-text-tertiary animate-spin" />
      </div>
      <p v-if="pageViewsError" class="text-ui-small text-text-tertiary mt-2">
        failed to load page views.
      </p>
      <ul v-else-if="pageViews?.length" class="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto">
        <li v-for="pv in pageViews" :key="pv.path" class="flex min-w-0 flex-row items-center gap-2">
          <span class="text-ui text-text-primary truncate">{{ pv.path }}</span>
          <span class="text-ui-small text-text-tertiary ml-auto shrink-0 whitespace-nowrap">
            {{ pv.views }}× · {{ formatVisited(pv.last_visited_at) }}
          </span>
        </li>
      </ul>
      <p v-else class="text-ui-small text-text-tertiary mt-2">no page views yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref, watch } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { activePresenceUsers, useLive } from '@/composables/useLive'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { clearanceLevels } from '../utils/clearance'
import { formatVisited } from '../utils/format'
import ClearanceSelect from './ui/ClearanceSelect.vue'

import type { PageViewRecord, UserRoleRecord } from '../types'
import type { ClearanceLevel } from '@/types'

const queryClient = useQueryClient()

useLive()
const liveVisitors = computed(() =>
  [...activePresenceUsers.value].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
)

const expandedUserId = ref<null | string>(null)

const toggleUserExpand = (id: string) => {
  expandedUserId.value = expandedUserId.value === id ? null : id
}

const {
  data: pageViews,
  error: pageViewsError,
  isLoading: pageViewsLoading,
} = useQuery({
  enabled: computed(() => isAdmin.value && !!expandedUserId.value),
  queryFn: async () => {
    const uid = expandedUserId.value
    if (!uid) return []
    const { data, error } = await supabase
      .from('user_page_views')
      .select('path, views, last_visited_at')
      .eq('user_id', uid)
      .order('views', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data || []) as PageViewRecord[]
  },
  queryKey: computed(() => [...queryKeys.admin.userPageViews, expandedUserId.value]),
})

const pendingRoles = reactive<Record<string, ClearanceLevel>>({})

const { data: userRolesList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    // Admin-guarded RPC (replaces the previously anon-exposed view)
    const { data, error } = await supabase.rpc('admin_user_roles')
    if (error) throw error
    return (data || []) as UserRoleRecord[]
  },
  queryKey: queryKeys.admin.userRoles,
})

const onlineUserIds = computed(() => new Set(liveVisitors.value.map((v) => v.id)))

const sortedUserRolesList = computed(() => {
  return (userRolesList.value || [])
    .filter((u) => u.role !== 'admin')
    .map((u) => ({ ...u, isOnline: onlineUserIds.value.has(u.user_id) }))
    .sort((a, b) => {
      const aRequested = a.role === 'auth' && Boolean(a.requested_clearance ?? a.requestedClearance)
      const bRequested = b.role === 'auth' && Boolean(b.requested_clearance ?? b.requestedClearance)

      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1

      if (aRequested !== bRequested) return aRequested ? -1 : 1

      const nameA = (a.full_name || a.email || '').trim()
      const nameB = (b.full_name || b.email || '').trim()
      const nameComparison = nameA.localeCompare(nameB, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      if (nameComparison !== 0) return nameComparison

      const timeA = a.created_at ? Date.parse(a.created_at) : 0
      const timeB = b.created_at ? Date.parse(b.created_at) : 0
      return timeB - timeA
    })
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

async function saveRole(user: UserRoleRecord) {
  const newRole = pendingRoles[user.user_id]
  if (!newRole) return

  const prevRole = user.role
  user.role = newRole

  try {
    const { error } = await supabase.rpc('admin_set_role', {
      new_role: newRole,
      target_user_id: user.user_id,
    })

    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.userRoles })
  } catch (err: unknown) {
    user.role = prevRole
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to update role: ${errorMsg}`)
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.userRoles })
  }
}
</script>
