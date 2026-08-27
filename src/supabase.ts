import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const getStorageUrl = (bucket: string, ...paths: string[]) => {
  const fullPath = paths.join('/')
  return `https://media.psiderman.com/storage/v1/object/public/${bucket}/${fullPath}`
}
