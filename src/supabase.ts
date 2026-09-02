import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Refresh the session if needed (or clear it for anon requests) before a query.
 * Supabase auto-refreshes the JWT here; skipping this can leave clearance-gated
 * queries using a stale token.
 */
export async function ensureSession() {
  await supabase.auth.getSession()
}

export const getStorageUrl = (bucket: string, ...paths: string[]) => {
  const fullPath = paths.join('/')
  return `https://media.psiderman.com/storage/v1/object/public/${bucket}/${fullPath}`
}
