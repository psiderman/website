declare const Deno: any

import { createClient } from '@supabase/supabase-js'
import ExifReader from 'exifreader'

interface StorageWebhookPayload {
  old_record?: null | {
    id?: string
    name?: string
  }
  record?: {
    bucket_id: string
    id: string
    metadata?: Record<string, unknown>
    name: string
    updated_at: string
  }
  type: 'DELETE' | 'INSERT' | 'UPDATE'
}

Deno.serve(async (req: Request) => {
  try {
    // The storage trigger calls us via pg_net with the webhook-secret header.
    // Reject anything else so this endpoint isn't an open GPS-metadata oracle.
    const secret = Deno.env.get('WEBHOOK_SECRET') ?? ''
    const header = req.headers.get('webhook-secret') ?? ''
    if (!secret || header !== secret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      })
    }

    const payload: StorageWebhookPayload = await req.json()
    const record = payload.record

    if (!record || record.bucket_id !== 'travel') {
      return new Response(JSON.stringify({ message: 'Ignored non-travel record' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const storagePath = record.name
    // Skip dotfiles, hidden files, subfolder placeholders, or thumbnails
    if (
      storagePath.startsWith('.') ||
      storagePath.includes('/.') ||
      storagePath.endsWith('/') ||
      storagePath.startsWith('thumb/') ||
      storagePath.includes('/thumb/')
    ) {
      return new Response(JSON.stringify({ message: 'Ignored dotfile/directory/thumbnail' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Parse path: format is "<trip_slug>/[pvt/]<filename>"
    const segments = storagePath.split('/')
    if (segments.length < 2) {
      return new Response(JSON.stringify({ message: 'Path does not match trip folder structure' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const tripSlug = segments[0]
    const isPvt = segments.includes('pvt')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for existing image to preserve custom clearance override if already set
    const { data: existingImage } = await supabase
      .from('trip_images')
      .select('id, clearance')
      .eq('storage_path', storagePath)
      .maybeSingle()

    const clearance = existingImage?.clearance || (isPvt ? 'admin' : 'public')

    // Download the image binary to parse EXIF
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('travel')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error(`Failed to download ${storagePath}:`, downloadError)
      return new Response(JSON.stringify({ details: downloadError, error: 'Download failed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const arrayBuffer = await fileData.arrayBuffer()
    let tags: any = {}
    try {
      tags = ExifReader.load(arrayBuffer)
    } catch (e) {
      console.warn(`Could not parse EXIF for ${storagePath}:`, e)
    }

    const dateTaken = getDateTaken(tags)
    const lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
    const lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])

    const width = tags['Image Width']?.value || tags['PixelXDimension']?.value || null
    const height = tags['Image Height']?.value || tags['PixelYDimension']?.value || null

    // Upsert into trip_images
    const { error: upsertError } = await supabase.from('trip_images').upsert(
      {
        clearance,
        date_taken: dateTaken ? dateTaken.toISOString() : null,
        height: height ? Number(height) : null,
        lat: lat ?? null,
        lng: lng ?? null,
        storage_object_id: record.id,
        storage_path: storagePath,
        trip_slug: tripSlug,
        updated_at: new Date().toISOString(),
        width: width ? Number(width) : null,
      },
      {
        onConflict: 'storage_path',
      }
    )

    if (upsertError) {
      console.error(`Error upserting ${storagePath}:`, upsertError)
      return new Response(JSON.stringify({ details: upsertError, error: 'DB Upsert failed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(
      JSON.stringify({
        clearance,
        dateTaken,
        lat,
        lng,
        message: 'Successfully processed image',
        storagePath,
        tripSlug,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Unhandled error in process-trip-image:', error)
    return new Response(JSON.stringify({ error: error?.message || 'Server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function getDateTaken(tags: any): Date | null {
  const dateStr = tags['DateTimeOriginal']?.description || tags['DateTime']?.description
  if (!dateStr) return null

  const formattedDate = dateStr.replace(':', '-').replace(':', '-')
  const isoStr = formattedDate.replace(' ', 'T')
  const offset = tags['OffsetTimeOriginal']?.description || tags['OffsetTime']?.description || 'Z'

  const parsedDate = new Date(isoStr + offset)
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate
  }
  return null
}

function getDecimalCoordinate(coordinateTag: any, refTag: any): null | number {
  if (!coordinateTag) return null
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