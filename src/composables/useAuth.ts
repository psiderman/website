import { computed, ref } from 'vue'

import { isAuthModalOpen, openAuthModal } from '@/composables/useGlobal'
import { forceSignOut, queryClient } from '@/queryClient'
import { supabase } from '@/supabase'

import type { User } from '@supabase/supabase-js'

// Re-export auth modal state from useGlobal
export { isAuthModalOpen, openAuthModal }

// Global state for the current authenticated user
export const currentUser = ref<null | User>(null)
export const currentUserRole = ref<null | string>(null)
const isRoleLoading = ref(false)
export const isAdmin = computed(() => currentUserRole.value === 'admin')

// Sign out and wipe all cached query data (incl. localStorage persistence)
// so the next user never sees this user's trips, travel images, etc.
export async function signOut() {
  await forceSignOut()
  currentUser.value = null
  currentUserRole.value = null
}

const fetchUserRole = async (userId?: string) => {
  const uid = userId ?? currentUser.value?.id
  if (!uid) return (currentUserRole.value = null)

  isRoleLoading.value = true
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', uid)
      .maybeSingle()

    currentUserRole.value = data?.role ?? null
  } catch {
    currentUserRole.value = null
  } finally {
    isRoleLoading.value = false
  }
  return currentUserRole.value
}

let resolveReady: () => void
export const authReady = new Promise<void>((resolve) => {
  resolveReady = resolve
})

export const ensureUserRole = async () => {
  await authReady
  return currentUserRole.value
}

// Single subscription handles initial session + changes without duplicate fetches
let initialized = false
supabase.auth.onAuthStateChange(async (_event, session) => {
  currentUser.value = session?.user ?? null
  if (currentUser.value) {
    const urlParams =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const requestedFromUrl = urlParams?.get('requested_clearance') === 'true'
    const requestedFromStorage =
      typeof window !== 'undefined' && sessionStorage.getItem('requested_clearance') === 'true'
    const requestedFromMeta = Boolean(
      session?.user?.user_metadata?.requested_clearance ??
      session?.user?.user_metadata?.requestedClearance,
    )

    if (requestedFromUrl || requestedFromStorage || requestedFromMeta) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('requested_clearance')
        if (requestedFromUrl && window.history?.replaceState) {
          const cleanUrl = new URL(window.location.href)
          cleanUrl.searchParams.delete('requested_clearance')
          window.history.replaceState({}, '', cleanUrl.toString())
        }
      }

      // 1. Sync to Supabase auth user_metadata if not already set
      if (!requestedFromMeta) {
        try {
          await supabase.auth.updateUser({
            data: { requested_clearance: true },
          })
        } catch (err) {
          console.warn('Failed to update user_metadata in auth:', err)
        }
      }

      // 2. Update user_roles table
      try {
        const { error } = await supabase
          .from('user_roles')
          .update({ requested_clearance: true })
          .eq('user_id', currentUser.value.id)

        if (error) {
          console.warn('Failed to update requested_clearance in user_roles:', error)
        }
      } catch (err) {
        console.warn('Failed to update requested_clearance in user_roles:', err)
      }
    }

    await fetchUserRole(currentUser.value.id)
  } else {
    currentUserRole.value = null
  }

  if (!initialized) {
    initialized = true
    resolveReady()
  }

  // Invalidate travel & images cache globally on auth state changes
  queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
  queryClient.invalidateQueries({ queryKey: ['trip-images'] })
  // Also refresh blog listing + post content (including gated posts whose
  // access changed once a user logs in or out).
  queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
  queryClient.invalidateQueries({ queryKey: ['blog-post'] })
  queryClient.invalidateQueries({ queryKey: ['blog-post-content'] })
  queryClient.invalidateQueries({ queryKey: ['quotes'] })
})
