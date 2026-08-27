import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { computed, type Ref } from 'vue'

import { supabase } from '@/supabase'

export type ClearanceLevel = 'admin' | 'auth' | 'close' | 'friends' | 'known' | 'public'

export interface TravelImage {
  caption: null | string
  clearance: ClearanceLevel
  dateTaken: Date | null
  height: null | number
  id: string
  location: {
    lat: null | number
    lng: null | number
  }
  name: string
  storagePath: string
  thumbnailUrl: string
  url: string
  width: null | number
}


// Matches the public.trips table (snake_case from Supabase → camelCase here)
export interface Trip {
  clearance: ClearanceLevel
  date: Date
  description: string[]
  instagramLink: null | string
  mapsListLink: null | string
  repeatVisit: boolean
  slug: string
  subtitle: string
  title: string
}

export interface TripWithImages extends Trip {
  images: TravelImage[]
}

export function isHighClearance(level?: ClearanceLevel | null): boolean {
  return !!level && ['admin', 'close', 'friends'].includes(level)
}

export function useTravel(slug: Ref<null | string> | Ref<string> | string) {
  const slugRef = computed(() => {
    if (typeof slug === 'string') return slug
    return slug.value
  })

  const {
    data: images,
    error,
    isLoading,
    refetch,
  } = useQuery<TravelImage[]>({
    enabled: computed(() => !!slugRef.value),
    gcTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      if (!slugRef.value) return []

      // Ensure session is fresh (refreshes token if expired, or clears it for anon request)
      await supabase.auth.getSession()

      // 1. Fetch images from public.trip_images (RLS handles clearance visibility)
      const { data: dbImages, error: dbError } = await supabase
        .from('trip_images')
        .select('*')
        .eq('trip_slug', slugRef.value)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('date_taken', { ascending: true, nullsFirst: false })

      if (dbError) throw dbError
      if (!dbImages || dbImages.length === 0) return []

      // 2. Create signed URLs in batch (originals + thumbnails)
      const fullPaths = dbImages.map((img) => img.storage_path as string)
      const thumbPaths = dbImages.map((img) => `thumb/${img.storage_path}`)
      const allPaths = [...fullPaths, ...thumbPaths]

      const { data: signedUrls, error: signError } = await supabase.storage
        .from('travel')
        .createSignedUrls(allPaths, 60 * 60)

      if (signError) throw signError

      return dbImages.map((img) => {
        const fullMatch = signedUrls.find((urlObj) => urlObj.path === img.storage_path)
        const thumbMatch = signedUrls.find((urlObj) => urlObj.path === `thumb/${img.storage_path}`)
        const name = (img.storage_path as string).split('/').pop() || img.storage_path
        const url = fullMatch?.signedUrl || ''
        const thumbnailUrl = thumbMatch?.signedUrl || url
        return {
          caption: (img.caption as null | string) ?? null,
          clearance: (img.clearance as ClearanceLevel) || 'public',
          dateTaken: img.date_taken ? new Date(img.date_taken as string) : null,
          height: (img.height as null | number) ?? null,
          id: img.id as string,
          location: {
            lat: (img.lat as null | number) ?? null,
            lng: (img.lng as null | number) ?? null,
          },
          name,
          storagePath: img.storage_path as string,
          thumbnailUrl,
          url,
          width: (img.width as null | number) ?? null,
        }
      })
    },
    queryKey: ['trip-images', slugRef],
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  })

  return {
    error,
    images,
    isLoading,
    refetch,
  }
}

export function useTravelsWithImages() {
  const {
    data: travelsWithImages,
    error,
    isLoading,
    refetch,
  } = useQuery<TripWithImages[]>({
    gcTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      // Ensure session is fresh (refreshes token if expired, or clears it for anon request)
      await supabase.auth.getSession()

      // 1. Fetch trips joined with trip_images (RLS filters clearance automatically)
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*, trip_images(*)')
        .order('date', { ascending: false })

      if (tripsError) throw tripsError
      if (!tripsData) return []

      // 2. Gather all storage paths (both full and thumb) to batch create signed URLs in ONE request
      const allPaths: string[] = []
      for (const trip of tripsData) {
        const images = (trip.trip_images as Array<Record<string, unknown>>) || []
        for (const img of images) {
          if (img.storage_path) {
            allPaths.push(img.storage_path as string)
            allPaths.push(`thumb/${img.storage_path}`)
          }
        }
      }

      const signedUrlMap = new Map<string, string>()
      if (allPaths.length > 0) {
        const { data: signedUrls, error: signError } = await supabase.storage
          .from('travel')
          .createSignedUrls(allPaths, 60 * 60)

        if (!signError && signedUrls) {
          for (const s of signedUrls) {
            if (s.path && s.signedUrl) {
              signedUrlMap.set(s.path, s.signedUrl)
            }
          }
        }
      }

      // 3. Map trips and their images
      return tripsData.map((row) => {
        const trip = rowToTrip(row)
        const rawImages = (row.trip_images as Array<Record<string, unknown>>) || []

        // Sort images by sort_order or date_taken ASC
        rawImages.sort((a, b) => {
          if (a.sort_order !== null && b.sort_order !== null) {
            return (a.sort_order as number) - (b.sort_order as number)
          }
          const timeA = a.date_taken ? new Date(a.date_taken as string).getTime() : 0
          const timeB = b.date_taken ? new Date(b.date_taken as string).getTime() : 0
          return timeA - timeB
        })

        const mappedImages: TravelImage[] = rawImages.map((img) => {
          const storagePath = img.storage_path as string
          const name = storagePath.split('/').pop() || storagePath
          const url = signedUrlMap.get(storagePath) || ''
          const thumbnailUrl = signedUrlMap.get(`thumb/${storagePath}`) || url
          return {
            caption: (img.caption as null | string) ?? null,
            clearance: (img.clearance as ClearanceLevel) || 'public',
            dateTaken: img.date_taken ? new Date(img.date_taken as string) : null,
            height: (img.height as null | number) ?? null,
            id: img.id as string,
            location: {
              lat: (img.lat as null | number) ?? null,
              lng: (img.lng as null | number) ?? null,
            },
            name,
            storagePath,
            thumbnailUrl,
            url,
            width: (img.width as null | number) ?? null,
          }
        })

        return {
          ...trip,
          images: mappedImages,
        }
      })
    },
    queryKey: ['trips-with-images'],
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  })

  return {
    error,
    isLoading,
    refetch,
    travelsWithImages,
  }
}

export function useTrips() {
  const {
    data: trips,
    error,
    isLoading,
    refetch,
  } = useQuery<Trip[]>({
    gcTime: 1000 * 60 * 60,
    queryFn: async () => {
      // Ensure session is fresh (refreshes token if expired, or clears it for anon request)
      await supabase.auth.getSession()

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      return (data ?? []).map(rowToTrip)
    },
    queryKey: ['trips'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  return { error, isLoading, refetch, trips }
}

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    clearance: (row.clearance as ClearanceLevel) || 'public',
    date: new Date(row.date as string),
    description: (row.description as string[]) ?? [],
    instagramLink: (row.instagram_link as null | string) ?? null,
    mapsListLink: (row.maps_list_link as null | string) ?? null,
    repeatVisit: row.repeat_visit as boolean,
    slug: row.slug as string,
    subtitle:
      (row.subtitle as null | string) ||
      (format(new Date(row.date as string), 'MMMM yyyy') as string),
    title: row.title as string,
  }
}
