import { ref } from 'vue'

import { queryClient } from '@/queryClient'
import { supabase } from '@/supabase'

import type { User } from '@supabase/supabase-js'

// Global state for the auth modal
export const isAuthModalOpen = ref(false)

// Global state for the current authenticated user
export const currentUser = ref<null | User>(null)

// Initialize auth state
const initAuth = async () => {
  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  currentUser.value = session?.user ?? null

  // Listen for auth changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser.value = session?.user ?? null
    
    // Invalidate travel & images cache globally on auth state changes
    queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
    queryClient.invalidateQueries({ queryKey: ['trip-images'] })
  })
}

// Call it immediately so the state is populated on load
initAuth()
