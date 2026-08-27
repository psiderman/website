#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Travel Storage Sync & Thumbnail Pipeline Script
 *
 * Syncs a local travel directory with Supabase Storage `travel` bucket:
 * 1. Scans local travel folder (<trip_slug>/[pvt/]<filename>.webp).
 * 2. Generates 80x80 centered square WebP thumbnails locally using ImageMagick (`magick`).
 * 3. Compares with remote Supabase storage objects (3-way diff).
 * 4. Uploads new and modified originals (<trip_slug>/...) and thumbnails (thumb/<trip_slug>/...).
 * 5. Deletes remote files that no longer exist locally (cascading DB deletes automatically via trigger).
 *
 * Usage:
 *   node scripts/upload-travel.js <path-to-travel-folder> [options]
 *
 * Options:
 *   --dry-run             Preview changes without uploading or deleting
 *   --service-key <key>   Explicit Supabase service role key (or loads from .env)
 *   --quality <num>       Thumbnail WebP quality 1-100 (default: 70)
 *   --help, -h            Show this help message
 */

import { execFileSync, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png']

function checkDependencies() {
  const res = spawnSync('which', ['magick'], { stdio: 'ignore' })
  if (res.status !== 0) {
    console.error('❌ Error: Missing required CLI tool: magick (ImageMagick)')
    console.error('Install via Homebrew: brew install imagemagick')
    process.exit(1)
  }
}

function findLocalFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  for (const entry of list) {
    if (
      entry.startsWith('.') ||
      entry === 'processed' ||
      entry === 'node_modules' ||
      entry === 'thumb'
    )
      continue
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results = results.concat(findLocalFiles(fullPath))
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(entry).toLowerCase())) {
      results.push(fullPath)
    }
  }

  return results
}

function generateThumbnail(sourcePath, targetThumbPath, quality = 70) {
  const thumbDir = path.dirname(targetThumbPath)
  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true })
  }

  execFileSync(
    'magick',
    [
      sourcePath,
      '-auto-orient',

      // Reduce to ~1% then upscale to ~600x800.
      '-scale',
      '4%',
      '-scale',
      '400%',

      // Remove EXIF/IPTC/XMP/color-profile metadata.
      '-strip',

      // Consistent browser-friendly color space.
      '-colorspace',
      'sRGB',

      // WebP encoding.
      '-quality',
      quality.toString(),

      targetThumbPath,
    ],
    { stdio: 'ignore' },
  )
}

async function listAllRemoteObjects(supabase, bucketName, prefix = '') {
  let allObjects = []
  let offset = 0
  const limit = 100

  while (true) {
    const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      throw error
    }

    if (!data || data.length === 0) break

    for (const item of data) {
      const fullItemPath = prefix ? `${prefix}/${item.name}` : item.name

      // If item has no id or metadata.mimetype is missing, it is a subfolder
      if (!item.id && !item.metadata) {
        const subObjects = await listAllRemoteObjects(supabase, bucketName, fullItemPath)
        allObjects = allObjects.concat(subObjects)
      } else {
        allObjects.push({
          createdAt: item.created_at,
          id: item.id,
          name: fullItemPath,
          size: item.metadata?.size ?? 0,
          updatedAt: item.updated_at,
        })
      }
    }

    if (data.length < limit) break
    offset += limit
  }

  return allObjects
}

async function main() {
  const args = process.argv.slice(2)
  let targetPath = null
  let dryRun = false
  let serviceKey = null
  let thumbQuality = 70
  let forceThumbs = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--service-key') {
      serviceKey = args[++i]
    } else if (arg === '--quality' || arg === '-q') {
      thumbQuality = parseInt(args[++i], 10) || 70
    } else if (arg === '--force-thumbs') {
      forceThumbs = true
    } else if (arg === '--help' || arg === '-h') {
      targetPath = null
      break
    } else if (!targetPath && !arg.startsWith('-')) {
      targetPath = arg
    }
  }

  if (!targetPath) {
    console.log('Usage: node scripts/upload-travel.js <path-to-travel-folder> [options]')
    console.log('\nOptions:')
    console.log('  --dry-run             Preview actions without executing uploads or deletes')
    console.log('  --service-key <key>   Supabase Service Role Key (default: from .env)')
    console.log('  --quality, -q <num>   Thumbnail WebP quality (default: 70)')
    console.log('  --force-thumbs        Force regeneration and upload of all thumbnails')
    console.log('  --help, -h            Show this help message')
    process.exit(0)
  }

  checkDependencies()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials.')
    console.error(
      'Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env or passed via --service-key.',
    )
    process.exit(1)
  }

  const resolvedPath = path.resolve(targetPath)
  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
    console.error(`❌ Error: Directory not found: ${resolvedPath}`)
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  console.log(`\n================================================================================`)
  console.log(`🚀 Travel Storage Sync ${dryRun ? '🔍 [DRY RUN]' : ''}`)
  console.log(`📂 Source Directory: ${resolvedPath}`)
  console.log(`🗄️  Remote Bucket:    travel`)
  console.log(`================================================================================\n`)

  // 1. Scan local files
  console.log('🔍 Scanning local travel files...')
  const localFilePaths = findLocalFiles(resolvedPath)
  console.log(`  Found ${localFilePaths.length} local original image(s).`)

  // 2. Fetch remote storage state
  console.log('\n📡 Fetching remote files from Supabase Storage (bucket: travel)...')
  const remoteObjects = await listAllRemoteObjects(supabase, 'travel')
  const remoteObjectMap = new Map()
  remoteObjects.forEach((obj) => remoteObjectMap.set(obj.name, obj))
  console.log(`  Found ${remoteObjects.length} remote object(s).`)

  // 3. Reconcile differences and determine which thumbnails to generate
  const toUpload = []
  const toDelete = []
  const localDesiredFiles = new Set()
  const thumbsToGenerate = []

  const localThumbDir = path.join(resolvedPath, 'thumb')
  let upToDateCount = 0

  for (const filePath of localFilePaths) {
    const relativePath = path.relative(resolvedPath, filePath)
    const remoteOriginalPath = relativePath.split(path.sep).join('/')
    const remoteThumbPath = `thumb/${remoteOriginalPath}`

    localDesiredFiles.add(remoteOriginalPath)
    localDesiredFiles.add(remoteThumbPath)

    const originalStat = fs.statSync(filePath)
    const remoteOriginal = remoteObjectMap.get(remoteOriginalPath)

    let originalNeedsUpload = false
    let thumbNeedsUpload = false

    if (!remoteOriginal) {
      originalNeedsUpload = true
      thumbNeedsUpload = true
    } else if (remoteOriginal.size !== originalStat.size) {
      originalNeedsUpload = true
      thumbNeedsUpload = true
    } else {
      const remoteThumb = remoteObjectMap.get(remoteThumbPath)
      if (!remoteThumb || forceThumbs) {
        thumbNeedsUpload = true
      }
    }

    if (originalNeedsUpload) {
      toUpload.push({
        action: remoteOriginal ? 'MODIFIED' : 'NEW',
        fullPath: filePath,
        isThumb: false,
        remotePath: remoteOriginalPath,
        size: originalStat.size,
      })
    } else {
      upToDateCount++
    }

    if (thumbNeedsUpload) {
      const localThumbPath = path.join(localThumbDir, relativePath)
      thumbsToGenerate.push({
        action: remoteObjectMap.has(remoteThumbPath) ? 'MODIFIED' : 'NEW',
        filePath,
        localThumbPath,
        remoteThumbPath,
      })
    } else {
      upToDateCount++
    }
  }

  for (const [remotePath] of remoteObjectMap.entries()) {
    if (!localDesiredFiles.has(remotePath)) {
      toDelete.push(remotePath)
    }
  }

  // 4. Generate only the needed thumbnails
  if (thumbsToGenerate.length > 0) {
    console.log(`🖼️  Generating ${thumbsToGenerate.length} needed WebP thumbnail(s) locally...`)
    for (const thumbInfo of thumbsToGenerate) {
      generateThumbnail(thumbInfo.filePath, thumbInfo.localThumbPath, thumbQuality)
      const thumbStat = fs.statSync(thumbInfo.localThumbPath)
      toUpload.push({
        action: thumbInfo.action,
        fullPath: thumbInfo.localThumbPath,
        isThumb: true,
        remotePath: thumbInfo.remoteThumbPath,
        size: thumbStat.size,
      })
    }
  } else {
    console.log('🖼️  No new thumbnails need to be generated.')
  }

  // 5. Print Reconciliation Summary
  console.log('\n================================================================================')
  console.log('📊 Sync Plan:')
  console.log(`   ✨ To Upload (New):       ${toUpload.filter((u) => u.action === 'NEW').length}`)
  console.log(
    `   🔄 To Overwrite (Mod):    ${toUpload.filter((u) => u.action === 'MODIFIED').length}`,
  )
  console.log(`   🗑️  To Delete (Orphans):   ${toDelete.length}`)
  console.log(`   ✅ Already In Sync:       ${upToDateCount}`)
  console.log('================================================================================\n')

  if (toUpload.length > 0) {
    console.log('⬆️  Uploads:')
    toUpload.forEach((item) => {
      console.log(
        `   [${item.action.padEnd(8)}] ${item.remotePath} (${(item.size / 1024).toFixed(1)} KB)`,
      )
    })
  }

  if (toDelete.length > 0) {
    console.log('\n🗑️  Deletions (Remote only):')
    toDelete.forEach((p) => console.log(`   [DELETE  ] ${p}`))
  }

  if (dryRun) {
    console.log('\n🔍 Dry run completed. No remote changes were made.')
    return
  }

  // 6. Execute Uploads
  if (toUpload.length > 0) {
    console.log(`\n🚀 Uploading ${toUpload.length} file(s)...`)
    for (let i = 0; i < toUpload.length; i++) {
      const item = toUpload[i]
      process.stdout.write(`   [${i + 1}/${toUpload.length}] Uploading ${item.remotePath}... `)

      const fileBuffer = fs.readFileSync(item.fullPath)
      const { error: uploadError } = await supabase.storage
        .from('travel')
        .upload(item.remotePath, fileBuffer, {
          cacheControl: '31536000, public, immutable',
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) {
        console.log(`❌ Error: ${uploadError.message}`)
      } else {
        console.log('✅ Done')
      }
    }
  }

  // 7. Execute Deletions
  if (toDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${toDelete.length} orphaned remote file(s)...`)
    // Delete in chunks of 50
    const chunkSize = 50
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize)
      const { error: deleteError } = await supabase.storage.from('travel').remove(chunk)
      if (deleteError) {
        console.error(`   ❌ Failed to delete chunk: ${deleteError.message}`)
      } else {
        console.log(`   ✅ Deleted chunk of ${chunk.length} object(s).`)
      }
    }
  }

  console.log('\n🎉 Storage sync completed successfully!')
}

main().catch((err) => {
  console.error('\n❌ Fatal error during sync:', err)
  process.exit(1)
})
