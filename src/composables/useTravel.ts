import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

import { supabase } from '@/supabase'

export interface TravelImage {
  closeFriends: boolean
  dateTaken: Date | null
  id: string
  location: {
    lat: null | number
    lng: null | number
  }
  name: string
  url: string
}

import { format } from 'date-fns'
import ExifReader from 'exifreader'

// Matches the public.trips table (snake_case from Supabase → camelCase here)
export interface Trip {
  closeFriends: boolean
  date: Date
  description: string[]
  instagramLink: null | string
  mapsListLink: null | string
  repeatVisit: boolean
  slug: string
  subtitle: string
  title: string
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
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
    queryFn: async () => {
      // 1. Get current session to check auth state
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const isAuthenticated = !!session?.user

      // 2. Fetch public folder files
      const { data: publicFiles, error: publicError } = await supabase.storage
        .from('travel')
        .list(`${slugRef.value}`)

      if (publicError) throw publicError

      const filesToProcess: { closeFriends: boolean; id: string; name: string; path: string }[] = (
        publicFiles || []
      )
        .filter((file) => !file.name.startsWith('.') && file.metadata) // Only files, skip directories
        .map((file) => ({
          closeFriends: false,
          id: file.id || file.name,
          name: file.name,
          path: `${slugRef.value}/${file.name}`,
        }))

      // 3. If authenticated, attempt to fetch friends-only subfolder files
      if (isAuthenticated) {
        const { data: friendFiles, error: friendError } = await supabase.storage
          .from('travel')
          .list(`${slugRef.value}/friends`)

        // Ignore errors if the friends folder doesn't exist yet
        if (!friendError && friendFiles) {
          const mappedFriends = friendFiles
            .filter((file) => !file.name.startsWith('.'))
            .map((file) => ({
              closeFriends: true,
              id: file.id || file.name,
              name: file.name,
              path: `${slugRef.value}/friends/${file.name}`,
            }))
          filesToProcess.push(...mappedFriends)
        }
      }

      if (filesToProcess.length === 0) return []

      // 4. Create signed URLs for all gathered files (valid for 1 hour)
      const paths = filesToProcess.map((f) => f.path)
      const { data: signedUrls, error: signError } = await supabase.storage
        .from('travel')
        .createSignedUrls(paths, 60 * 60)

      if (signError) throw signError

      // Map signed URLs back to files with EXIF data
      const mappedImages = await Promise.all(
        filesToProcess.map(async (file) => {
          const match = signedUrls.find((urlObj) => urlObj.path === file.path)
          const url = match?.signedUrl || ''

          let dateTaken: Date | null = null
          let lat: null | number = null
          let lng: null | number = null

          if (url) {
            try {
              const response = await fetch(url)
              const buffer = await response.arrayBuffer()
              const tags = ExifReader.load(buffer)

              dateTaken = getDateTaken(tags)
              lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
              lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])
            } catch (e) {
              console.warn(`Failed to parse EXIF for ${file.name}:`, e)
            }
          }

          return {
            closeFriends: file.closeFriends,
            dateTaken,
            id: file.id,
            location: { lat, lng },
            name: file.name,
            url,
          }
        }),
      )

      // Filter out images without a dateTaken
      const validImages = mappedImages.filter((img) => img.dateTaken !== null)

      // Sort images by dateTaken
      validImages.sort((a, b) => {
        return a.dateTaken!.getTime() - b.dateTaken!.getTime()
      })

      return validImages
    },
    queryKey: ['travel-images', slugRef],
    staleTime: 0, //1000 * 60 * 30, // Cache for 30 minutes
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
  } = useQuery({
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const isAuthenticated = !!session?.user

      // 1. Fetch trips from Supabase (RLS handles close_friends visibility)
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('date', { ascending: false })

      if (tripsError) throw tripsError
      const trips = (tripsData ?? []).map(rowToTrip)

      return await Promise.all(
        trips.map(async (travel) => {
          const { data: publicFiles, error: publicError } = await supabase.storage
            .from('travel')
            .list(`${travel.slug}`)

          if (publicError) throw publicError

          const filesToProcess: {
            closeFriends: boolean
            id: string
            name: string
            path: string
          }[] = (publicFiles || [])
            .filter((file) => !file.name.startsWith('.') && file.metadata)
            .map((file) => ({
              closeFriends: false,
              id: file.id || file.name,
              name: file.name,
              path: `${travel.slug}/${file.name}`,
            }))

          if (isAuthenticated) {
            const { data: friendFiles, error: friendError } = await supabase.storage
              .from('travel')
              .list(`${travel.slug}/friends`)

            if (!friendError && friendFiles) {
              const mappedFriends = friendFiles
                .filter((file) => !file.name.startsWith('.'))
                .map((file) => ({
                  closeFriends: true,
                  id: file.id || file.name,
                  name: file.name,
                  path: `${travel.slug}/friends/${file.name}`,
                }))
              filesToProcess.push(...mappedFriends)
            }
          }

          if (filesToProcess.length === 0) {
            return { ...travel, images: [] as TravelImage[] }
          }

          const paths = filesToProcess.map((f) => f.path)
          const { data: signedUrls, error: signError } = await supabase.storage
            .from('travel')
            .createSignedUrls(paths, 60 * 60)

          if (signError) throw signError

          const mappedImages = await Promise.all(
            filesToProcess.map(async (file) => {
              const match = signedUrls.find((urlObj) => urlObj.path === file.path)
              const url = match?.signedUrl || ''

              let dateTaken: Date | null = null
              let lat: null | number = null
              let lng: null | number = null

              if (url) {
                try {
                  // Fetch array buffer to parse EXIF
                  const response = await fetch(url)
                  const buffer = await response.arrayBuffer()
                  const tags = ExifReader.load(buffer)
                  dateTaken = getDateTaken(tags)
                  lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
                  lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])
                } catch (e) {
                  console.warn(`Failed to parse EXIF for ${file.name}:`, e)
                }
              }

              return {
                closeFriends: file.closeFriends,
                dateTaken,
                id: file.id,
                location: { lat, lng },
                name: file.name,
                url,
              }
            }),
          )

          // Filter out images without a dateTaken
          const validImages = mappedImages.filter((img) => img.dateTaken !== null)

          // Sort images by dateTaken (ascending)
          validImages.sort((a, b) => {
            return a.dateTaken!.getTime() - b.dateTaken!.getTime()
          })

          return {
            ...travel,
            images: validImages,
          }
        }),
      )
    },
    queryKey: ['travels-with-images'],
    staleTime: 0, //1000 * 60 * 30, // Cache for 30 minutes
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

function getDateTaken(tags: any): Date | null {
  const dateStr = tags['DateTimeOriginal']?.description || tags['DateTime']?.description
  if (!dateStr) return null

  // Convert "YYYY:MM:DD HH:MM:SS" to "YYYY-MM-DDTHH:MM:SS"
  const formattedDate = dateStr.replace(':', '-').replace(':', '-')
  const isoStr = formattedDate.replace(' ', 'T')

  // Capture timezone offset (e.g. "+01:00") if present
  const offset = tags['OffsetTimeOriginal']?.description || tags['OffsetTime']?.description || ''

  const parsedDate = new Date(isoStr + offset)
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate
  }
  return null
}

function getDecimalCoordinate(coordinateTag: any, refTag: any): null | number {
  if (!coordinateTag) return null

  // ExifReader pre-calculates the decimal degree value in description
  const desc = Number(coordinateTag.description)
  if (isNaN(desc)) return null

  let val = desc
  if (refTag && refTag.value && refTag.value.length > 0) {
    const ref = refTag.value[0]
    if (ref === 'S' || ref === 'W') {
      val = -val
    }
  }
  return val
}

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    closeFriends: row.close_friends as boolean,
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
