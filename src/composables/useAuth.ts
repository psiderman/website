import { computed, ref } from 'vue'

import { queryClient } from '@/queryClient'
import { supabase } from '@/supabase'

import type { User } from '@supabase/supabase-js'

// Global state for the auth modal
export const isAuthModalOpen = ref(false)

// Global state for the current authenticated user
export const currentUser = ref<null | User>(null)
export const currentUserRole = ref<null | string>(null)
export const isRoleLoading = ref(false)
export const isAdmin = computed(() => currentUserRole.value === 'admin')

export const fetchUserRole = async (userId?: string) => {
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
})



