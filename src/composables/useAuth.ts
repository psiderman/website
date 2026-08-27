import { computed, ref } from 'vue'

import { queryClient } from '@/queryClient'
import { supabase } from '@/supabase'

import type { User } from '@supabase/supabase-js'

// Global state for the auth modal
export const isAuthModalOpen = ref(false)

// Global state for the current authenticated user
export const currentUser = ref<null | User>(null)
export const currentUserRole = ref<null | string>(null)
export const isAdmin = computed(() => currentUserRole.value === 'admin')
export const isRoleLoading = ref(false)

export const fetchUserRole = async () => {
  if (!currentUser.value) {
    currentUserRole.value = null
    return null
  }
  isRoleLoading.value = true
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.value.id)
      .maybeSingle()

    if (!error && data) {
      currentUserRole.value = data.role
    } else {
      currentUserRole.value = null
    }
  } catch {
    currentUserRole.value = null
  } finally {
    isRoleLoading.value = false
  }
  return currentUserRole.value
}

let authResolve: () => void
export const authReady = new Promise<void>((resolve) => {
  authResolve = resolve
})

export const ensureUserRole = async (): Promise<null | string> => {
  await authReady
  if (!currentUser.value) return null
  if (currentUserRole.value !== null) return currentUserRole.value
  return await fetchUserRole()
}

// Initialize auth state
const initAuth = async () => {
  try {
    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    currentUser.value = session?.user ?? null
    if (currentUser.value) {
      await fetchUserRole()
    }
  } finally {
    authResolve()
  }

  // Listen for auth changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange(async (_event, session) => {
    currentUser.value = session?.user ?? null
    if (currentUser.value) {
      await fetchUserRole()
    } else {
      currentUserRole.value = null
    }

    // Invalidate travel & images cache globally on auth state changes
    queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
    queryClient.invalidateQueries({ queryKey: ['trip-images'] })
  })
}

// Call it immediately so the state is populated on load
initAuth()


