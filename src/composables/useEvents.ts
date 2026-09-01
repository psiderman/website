import { authReady, currentUser, currentUserRole } from '@/composables/useAuth'
import { supabase } from '@/supabase'

// Track page views for signed-in, non-admin users. Fire-and-forget: a failure
// to record must never block navigation, and the backend RPC already drops
// anon + admin callers.
let lastPath = ''
let lastAt = 0

export async function trackPageView(path: string) {
  // Wait for the initial session to hydrate so the very first page a returning
  // user lands on is counted (auth state resolves after afterEach fired).
  await authReady

  if (!currentUser.value) return
  if (currentUserRole.value === 'admin') return

  const now = Date.now()
  if (path === lastPath && now - lastAt < 30_000) return
  lastPath = path
  lastAt = now

  void supabase.rpc('record_page_view', { p_path: path }).then(({ error }) => {
    if (error) console.warn('Failed to record page view', error)
  })
}
