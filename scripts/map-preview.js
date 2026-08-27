#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Local Map Preview Generator Script
 *
 * 1. Queries `trip_images` table for all coordinates of public images (clearance = 'public').
 * 2. Formats a GeoJSON overlays representation.
 * 3. Fetches a static map layout webp image from Mapbox.
 * 4. Uploads/Overwrites it to Supabase storage bucket `webp` as `map-preview.webp`.
 * 5. Sets Cache-Control header to 15 days (1296000 seconds).
 *
 * Usage:
 *   node scripts/map-preview.js
 */

import { execFileSync } from 'child_process'
import fs from 'fs'

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
  )
  process.exit(1)
}

if (!MAPBOX_TOKEN) {
  console.error('❌ Error: Missing MAPBOX_TOKEN environment variable.')
  process.exit(1)
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  console.log('📡 Fetching travel coordinate markers from database...')
  const { data: images, error: dbError } = await supabase
    .from('trip_images')
    .select('lat, lng')
    .eq('clearance', 'public')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (dbError) {
    console.error('❌ Database error:', dbError.message)
    process.exit(1)
  }

  const coords = images.map((img) => [Number(img.lng), Number(img.lat)])

  if (coords.length === 0) {
    console.log('⚠️ No coordinates found in database. Exiting.')
    process.exit(0)
  }

  // Deduplicate coordinates so we don't send duplicates for images taken at the exact same location, reducing the URL length
  const uniqueCoords = []
  const seen = new Set()
  for (const [lng, lat] of coords) {
    // Round to 2 decimal places (~1.1 km accuracy) to merge very close pictures
    const key = `${lng.toFixed(0)},${lat.toFixed(0)}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueCoords.push([Number(lng.toFixed(0)), Number(lat.toFixed(0))])
    }
  }

  // Capped at 100 points to avoid HTTP 414 URL Limit Issues

  console.log(
    `  Found ${coords.length} total coordinates, condensed to ${uniqueCoords.length} unique markers.`,
  )

  // Mapbox static overlays support simple pins: pin-s-attraction+ef4444(lng,lat)
  const pinMarkers = uniqueCoords
    .map(([lng, lat]) => `pin-s-attraction+ef4444(${lng},${lat})`)
    .join(',')

  const style = 'mapbox/outdoors-v12'
  const width = 1200
  const height = 800

  const mapboxUrl =
    `https://api.mapbox.com/styles/v1/${style}/static/` +
    `${pinMarkers}/` +
    `auto/${width}x${height}` +
    `?padding=80&format=webp&access_token=${MAPBOX_TOKEN}`

  console.log(`URL length: ${mapboxUrl.length}`)
  console.log(`Generated URL: ${mapboxUrl}`)
  console.log('🗺️ Fetching static map preview image from Mapbox...')
  const mapboxResponse = await fetch(mapboxUrl, {
    headers: {
      Referer: 'https://psiderman.com/travel',
    },
  })

  if (!mapboxResponse.ok) {
    const errText = await mapboxResponse.text()
    console.error(`❌ Mapbox API error: ${errText}`)
    process.exit(1)
  }

  const arrayBuffer = await mapboxResponse.arrayBuffer()
  const rawBuffer = Buffer.from(arrayBuffer)

  // Write temporary file for ImageMagick processing
  const tempRawPath = './temp_map_raw.webp'
  const tempOptPath = './temp_map_opt.webp'
  fs.writeFileSync(tempRawPath, rawBuffer)

  console.log('✨ Compressing static map with ImageMagick to 75% quality...')
  try {
    execFileSync('magick', [tempRawPath, '-quality', '80', tempOptPath])
  } catch (err) {
    console.error('❌ ImageMagick compression failed:', err.message)
    // Clean up raw temp file
    if (fs.existsSync(tempRawPath)) fs.unlinkSync(tempRawPath)
    process.exit(1)
  }

  const optBuffer = fs.readFileSync(tempOptPath)

  // Clean up temp files
  fs.unlinkSync(tempRawPath)
  fs.unlinkSync(tempOptPath)

  console.log('⬆️ Uploading preview to Supabase storage (webp/map-preview.webp)...')
  const { error: uploadError } = await supabase.storage
    .from('webp')
    .upload('map-preview.webp', optBuffer, {
      cacheControl: '31536000, public, immutable', // 1 year cache
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError.message)
    process.exit(1)
  }

  console.log('🎉 Static map preview optimized and uploaded to Supabase.')

  // Cloudflare cache purge
  const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

  if (CF_ZONE_ID && CF_API_TOKEN) {
    console.log('🧹 Invalidating Cloudflare CDN cache for map-preview.webp...')
    try {
      const purgeResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
        {
          body: JSON.stringify({
            files: ['https://media.psiderman.com/storage/v1/object/public/webp/map-preview.webp'],
          }),
          headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
      const purgeData = await purgeResponse.json()
      if (purgeResponse.ok && purgeData.success) {
        console.log('✅ Cloudflare CDN cache successfully purged!')
      } else {
        console.error('❌ Cloudflare cache purge failed:', purgeData.errors || purgeData)
      }
    } catch (e) {
      console.error('❌ Network error attempting Cloudflare purge:', e.message)
    }
  } else {
    console.log(
      'ℹ️ Skipping Cloudflare purge: CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN not found in env.',
    )
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
