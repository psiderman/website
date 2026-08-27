#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Travel Storage Sync Script
 *
 * Syncs a local travel directory with Supabase Storage `travel` bucket:
 * 1. Scans local travel folder (originals in `<trip_slug>/...` and thumbnails in `thumb/<trip_slug>/...`).
 * 2. Compares with remote Supabase storage objects (size & presence diff).
 * 3. Uploads new and modified files to Supabase Storage.
 * 4. Deletes remote files that no longer exist locally (unless `--push` is specified).
 *
 * Usage:
 *   node scripts/upload-travel.js <path-to-travel-folder> [options]
 *
 * Options:
 *   --push                Upload only (do not delete any remote files missing locally)
 *   --dry-run             Preview changes without uploading or deleting
 *   --service-key <key>   Explicit Supabase service role key (or loads from .env)
 *   --help, -h            Show this help message
 */

import fs from 'fs'
import path from 'path'

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png']

function findLocalFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  for (const entry of list) {
    if (entry.startsWith('.') || entry === 'processed' || entry === 'node_modules') continue
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
  let pushOnly = false
  let serviceKey = null

  let allowMissingThumbs = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--push') {
      pushOnly = true
    } else if (arg === '--allow-missing-thumbs') {
      allowMissingThumbs = true
    } else if (arg === '--service-key') {
      serviceKey = args[++i]
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
    console.log(
      '  --push                  Upload only (do not delete any remote files missing locally)',
    )
    console.log('  --allow-missing-thumbs  Bypass thumbnail validation check')
    console.log('  --dry-run               Preview actions without executing uploads or deletes')
    console.log('  --service-key <key>     Supabase Service Role Key (default: from .env)')
    console.log('  --help, -h              Show this help message')
    process.exit(0)
  }

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
  console.log(
    `🚀 Travel Storage Sync ${dryRun ? '🔍 [DRY RUN]' : ''} ${pushOnly ? '⬆️ [PUSH ONLY]' : ''}`,
  )
  console.log(`📂 Source Directory: ${resolvedPath}`)
  console.log(`🗄️  Remote Bucket:    travel`)
  console.log(`================================================================================\n`)

  // 1. Scan local files
  console.log('🔍 Scanning local travel files (originals + thumbnails)...')
  const localFilePaths = findLocalFiles(resolvedPath)
  console.log(`  Found ${localFilePaths.length} local file(s).`)

  // 2. Verify matching thumbnails exist for all original images
  const originalFiles = []
  const missingThumbnails = []

  for (const filePath of localFilePaths) {
    const relativePath = path.relative(resolvedPath, filePath).split(path.sep).join('/')
    if (!relativePath.startsWith('thumb/')) {
      originalFiles.push(relativePath)
      const expectedThumbPath = path.join(resolvedPath, 'thumb', relativePath)
      if (!fs.existsSync(expectedThumbPath)) {
        missingThumbnails.push({
          expectedThumbPath,
          original: relativePath,
        })
      }
    }
  }

  if (missingThumbnails.length > 0 && !allowMissingThumbs) {
    console.error(
      `\n❌ Error: Found ${missingThumbnails.length} original image(s) missing local thumbnails in thumb/:`,
    )
    missingThumbnails.slice(0, 10).forEach((m) => {
      console.error(`   - Missing thumbnail for: ${m.original}`)
    })
    if (missingThumbnails.length > 10) {
      console.error(`   ... and ${missingThumbnails.length - 10} more.`)
    }
    console.error(
      '\nPlease run sanitize-pvt-exif.js first to generate all thumbnails before uploading, or pass --allow-missing-thumbs.',
    )
    process.exit(1)
  }

  if (missingThumbnails.length > 0 && allowMissingThumbs) {
    console.warn(
      `  ⚠️ Warning: ${missingThumbnails.length} image(s) missing thumbnails (bypassed with --allow-missing-thumbs).`,
    )
  } else {
    console.log(
      `  ✅ All ${originalFiles.length} original images have verified local thumbnails in thumb/.`,
    )
  }

  // 3. Fetch remote storage state
  console.log('\n📡 Fetching remote files from Supabase Storage (bucket: travel)...')
  const remoteObjects = await listAllRemoteObjects(supabase, 'travel')
  const remoteObjectMap = new Map()
  remoteObjects.forEach((obj) => remoteObjectMap.set(obj.name, obj))
  console.log(`  Found ${remoteObjects.length} remote object(s).`)

  // 4. Reconcile differences
  const toUpload = []
  const toDelete = []
  const localDesiredFiles = new Set()
  let upToDateCount = 0

  for (const filePath of localFilePaths) {
    const relativePath = path.relative(resolvedPath, filePath)
    const remotePath = relativePath.split(path.sep).join('/')
    localDesiredFiles.add(remotePath)

    const originalStat = fs.statSync(filePath)
    const remoteOriginal = remoteObjectMap.get(remotePath)

    if (!remoteOriginal) {
      toUpload.push({
        action: 'NEW',
        fullPath: filePath,
        remotePath,
        size: originalStat.size,
      })
    } else if (remoteOriginal.size !== originalStat.size) {
      toUpload.push({
        action: 'MODIFIED',
        fullPath: filePath,
        remotePath,
        size: originalStat.size,
      })
    } else {
      upToDateCount++
    }
  }

  if (!pushOnly) {
    for (const [remotePath] of remoteObjectMap.entries()) {
      if (!localDesiredFiles.has(remotePath)) {
        toDelete.push(remotePath)
      }
    }
  }

  // 5. Print Reconciliation Summary
  console.log('\n================================================================================')
  console.log('📊 Sync Plan:')
  console.log(`   ✨ To Upload (New):       ${toUpload.filter((u) => u.action === 'NEW').length}`)
  console.log(
    `   🔄 To Overwrite (Mod):    ${toUpload.filter((u) => u.action === 'MODIFIED').length}`,
  )
  console.log(
    `   🗑️  To Delete (Orphans):   ${pushOnly ? '0 (Skipped: --push mode)' : toDelete.length}`,
  )
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

  // 7. Execute Deletions (skipped if --push)
  if (!pushOnly && toDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${toDelete.length} orphaned remote file(s)...`)
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
