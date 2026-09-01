import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'

import { getStorageUrl, supabase } from '@/supabase'

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

export function isHighClearance(level?: ClearanceLevel | null | string): boolean {
  return !!level && ['admin', 'close', 'friends'].includes(level)
}

/** Sort trip images by sort_order first, then date_taken ASC. */
export function sortTripImages<
  T extends { date_taken?: null | string; sort_order?: null | number },
>(images: T[]): T[] {
  return images.slice().sort((a, b) => {
    if (a.sort_order != null && b.sort_order != null) {
      return a.sort_order - b.sort_order
    }
    const timeA = a.date_taken ? new Date(a.date_taken).getTime() : 0
    const timeB = b.date_taken ? new Date(b.date_taken).getTime() : 0
    return timeA - timeB
  })
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

      // 2. Map trips and their images using public storage URLs
      return tripsData.map((row) => {
        const trip = rowToTrip(row)
        const rawImages = (row.trip_images as Array<Record<string, unknown>>) || []

        // Sort images by sort_order or date_taken ASC
        const sortedImages = sortTripImages(
          rawImages as Array<
            Record<string, unknown> & { date_taken?: null | string; sort_order?: null | number }
          >,
        )

        const mappedImages: TravelImage[] = sortedImages.map((img) => {
          const storagePath = img.storage_path as string
          const name = storagePath.split('/').pop() || storagePath
          const url = getStorageUrl('travel', storagePath)
          const thumbnailUrl = getStorageUrl('travel', `thumb/${storagePath}`)
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
