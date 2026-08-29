#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

import { checkbox, confirm, input } from '@inquirer/prompts'

import { getSupabaseAdminClient, listRemoteBucketFiles } from './lib/storage.js'
import { analyzeTripStructure } from './lib/structure.js'

const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png']

async function downloadRemoteFile(supabase, bucketName, remotePath, localDestPath) {
  const destDir = path.dirname(localDestPath)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const { data, error } = await supabase.storage.from(bucketName).download(remotePath)
  if (error) throw error

  const buffer = Buffer.from(await data.arrayBuffer())
  fs.writeFileSync(localDestPath, buffer)
}

function findLocalImages(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results

  const list = fs.readdirSync(dir)
  for (const entry of list) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === '.trash') continue
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results = results.concat(findLocalImages(fullPath))
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(entry).toLowerCase())) {
      results.push(fullPath)
    }
  }

  return results
}

async function main() {
  console.log(`
┌────────────────────────────────────────────────────────┐
│  📥  TRAVEL MEDIA RECONCILE & PULL                     │
│  Sync Remote (Suitlady) moves, deletes & additions     │
└────────────────────────────────────────────────────────┘
`)

  const args = process.argv.slice(2)
  let targetPath = null
  let dryRun = false
  let useTrash = false
  let serviceKey = null

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--trash') {
      useTrash = true
    } else if (arg === '--service-key') {
      serviceKey = args[++i]
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/pull-travel.js [path-to-travel-folder] [options]')
      console.log('\nOptions:')
      console.log('  --dry-run             Preview reconciliation actions without disk modifications')
      console.log('  --trash               Move deleted local files to .trash/ folder instead of deleting')
      console.log('  --service-key <key>   Supabase Service Role Key (default: from .env)')
      console.log('  --help, -h            Show this help message')
      process.exit(0)
    } else if (!targetPath && !arg.startsWith('-')) {
      targetPath = arg
    }
  }

  if (!targetPath) {
    targetPath = await input({
      default: '.',
      message: 'Enter path to Travel folder or Trip folder:',
    })
  }

  const cleanedPath = targetPath.trim().replace(/^['"]|['"]$/g, '')
  const resolvedPath = path.resolve(cleanedPath)

  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
    console.error(`❌ Path does not exist or is not a directory: ${resolvedPath}`)
    process.exit(1)
  }

  analyzeTripStructure(resolvedPath)
  console.log(`📁 Target Folder: ${resolvedPath}`)

  let supabase
  try {
    supabase = getSupabaseAdminClient(serviceKey)
  } catch (err) {
    console.error(`❌ ${err.message}`)
    process.exit(1)
  }

  // 1. Fetch Remote State: DB trip_images & Storage objects
  console.log('\n📡 Fetching remote state from Supabase...')
  const [{ data: dbImages, error: dbError }, remoteStorageFiles] = await Promise.all([
    supabase.from('trip_images').select('id, trip_slug, storage_path, clearance'),
    listRemoteBucketFiles(supabase, 'travel'),
  ])

  if (dbError) {
    console.error(`❌ Error fetching trip_images: ${dbError.message}`)
    process.exit(1)
  }

  const remoteDbImages = dbImages || []
  const remoteStorageMap = new Map(remoteStorageFiles.map((f) => [f.path, f]))
  console.log(`  Found ${remoteDbImages.length} DB image records and ${remoteStorageFiles.length} storage objects.`)

  // 2. Scan Local Files
  console.log('\n🔍 Scanning local directory...')
  const localFilePaths = findLocalImages(resolvedPath)
  console.log(`  Found ${localFilePaths.length} local file(s).`)

  // Index local files by relative path & by base filename per trip
  const localRelPaths = new Set()
  const localFilesByTripAndName = new Map() // key: "tripSlug/filename.webp" -> fullPath

  for (const fp of localFilePaths) {
    const rel = path.relative(resolvedPath, fp).split(path.sep).join('/')
    localRelPaths.add(rel)

    if (!rel.startsWith('thumb/')) {
      const parts = rel.split('/')
      const tripSlug = parts[0]
      const fileName = parts[parts.length - 1]
      const key = `${tripSlug}/${fileName}`
      localFilesByTripAndName.set(key, { fullPath: fp, relPath: rel })
    }
  }

  // 3. Detect Discrepancies
  const movesToPropose = []
  const deletionsToPropose = []
  const downloadsToPropose = []

  // Check Remote DB Records against Local
  const remoteMatchedLocalRels = new Set()

  for (const img of remoteDbImages) {
    const remoteRel = img.storage_path // e.g. "24_02_tokyo/pvt/abc.webp" or "24_02_tokyo/abc.webp"
    const tripSlug = img.trip_slug
    const fileName = path.basename(remoteRel)
    const key = `${tripSlug}/${fileName}`

    const existingLocal = localFilesByTripAndName.get(key)

    if (existingLocal) {
      remoteMatchedLocalRels.add(existingLocal.relPath)
      remoteMatchedLocalRels.add(`thumb/${existingLocal.relPath}`)

      // Check if location changed (public <-> pvt)
      if (existingLocal.relPath !== remoteRel) {
        movesToPropose.push({
          fileName,
          fromLocalPath: existingLocal.fullPath,
          fromRelPath: existingLocal.relPath,
          toLocalPath: path.join(resolvedPath, remoteRel),
          toRelPath: remoteRel,
          tripSlug,
        })
      }
    } else {
      // Missing locally
      downloadsToPropose.push({
        fileName,
        remoteRelPath: remoteRel,
        size: remoteStorageMap.get(remoteRel)?.size ?? 0,
        targetLocalPath: path.join(resolvedPath, remoteRel),
        tripSlug,
      })
    }
  }

  // Detect Local Orphans (Local files not in remote DB)
  for (const fp of localFilePaths) {
    const rel = path.relative(resolvedPath, fp).split(path.sep).join('/')
    if (rel.startsWith('thumb/')) continue // handled with primary image

    if (!remoteMatchedLocalRels.has(rel)) {
      const parts = rel.split('/')
      const tripSlug = parts[0]
      const fileName = parts[parts.length - 1]

      // If it wasn't matched with any remote DB record
      const isRecordPresent = remoteDbImages.some((img) => img.storage_path === rel)
      if (!isRecordPresent) {
        const thumbPath = path.join(resolvedPath, 'thumb', rel)
        deletionsToPropose.push({
          fileName,
          fullPath: fp,
          hasThumb: fs.existsSync(thumbPath),
          relPath: rel,
          thumbPath,
          tripSlug,
        })
      }
    }
  }

  console.log('\n📊 Reconcile Summary:')
  console.log(`  • Path Moves (Public ↔ Private): ${movesToPropose.length}`)
  console.log(`  • Local Deletions / Orphans:     ${deletionsToPropose.length}`)
  console.log(`  • Missing Locally (To Download): ${downloadsToPropose.length}`)

  if (
    movesToPropose.length === 0 &&
    deletionsToPropose.length === 0 &&
    downloadsToPropose.length === 0
  ) {
    console.log('\n✨ Local directory is perfectly in sync with Supabase Remote state!')
    process.exit(0)
  }

  // 4. Interactive Selection (Spacebar to toggle [X])
  const choices = []

  if (movesToPropose.length > 0) {
    movesToPropose.forEach((m) => {
      choices.push({
        checked: true,
        name: `🔀 [Move] ${m.fromRelPath} ➔ ${m.toRelPath}`,
        value: { type: 'move', ...m },
      })
    })
  }

  if (deletionsToPropose.length > 0) {
    deletionsToPropose.forEach((d) => {
      choices.push({
        checked: true,
        name: `🗑️  [${useTrash ? 'Trash' : 'Delete'} Local Orphan] ${d.relPath} (deleted on remote)`,
        value: { type: 'delete', ...d },
      })
    })
  }

  if (downloadsToPropose.length > 0) {
    downloadsToPropose.forEach((dl) => {
      const sizeMb = (dl.size / (1024 * 1024)).toFixed(2)
      choices.push({
        checked: true,
        name: `⬇️  [Download] ${dl.remoteRelPath} (${sizeMb} MB)`,
        value: { type: 'download', ...dl },
      })
    })
  }

  console.log('')
  const selectedActions = await checkbox({
    choices,
    message: 'Select reconciliation actions to apply to local disk (Toggle with Spacebar [X]):',
  })

  if (selectedActions.length === 0) {
    console.log('\nNo actions selected. Exiting without making changes.')
    process.exit(0)
  }

  const confirmed = await confirm({
    default: true,
    message: `\nApply ${selectedActions.length} changes to local disk${dryRun ? ' (DRY RUN)' : ''}?`,
  })

  if (!confirmed) {
    console.log('Cancelled.')
    process.exit(0)
  }

  // 5. Execute Selected Actions
  console.log('\n🚀 Applying changes...')

  let movesCount = 0
  let deletesCount = 0
  let downloadsCount = 0

  for (const action of selectedActions) {
    if (action.type === 'move') {
      console.log(`  🔀 Moving: ${action.fromRelPath} -> ${action.toRelPath}`)
      if (!dryRun) {
        // Move main image
        safeMoveFile(action.fromLocalPath, action.toLocalPath)

        // Move thumbnail if it exists
        const fromThumb = path.join(resolvedPath, 'thumb', action.fromRelPath)
        const toThumb = path.join(resolvedPath, 'thumb', action.toRelPath)
        if (fs.existsSync(fromThumb)) {
          safeMoveFile(fromThumb, toThumb)
        }
      }
      movesCount++
    } else if (action.type === 'delete') {
      console.log(`  🗑️  ${useTrash ? 'Trashing' : 'Deleting'}: ${action.relPath}`)
      if (!dryRun) {
        safeDeleteOrTrash(action.fullPath, resolvedPath, useTrash)
        if (action.hasThumb) {
          safeDeleteOrTrash(action.thumbPath, resolvedPath, useTrash)
        }
      }
      deletesCount++
    } else if (action.type === 'download') {
      console.log(`  ⬇️  Downloading: ${action.remoteRelPath}`)
      if (!dryRun) {
        await downloadRemoteFile(supabase, 'travel', action.remoteRelPath, action.targetLocalPath)

        // Also attempt download thumbnail if available remotely
        const remoteThumbPath = `thumb/${action.remoteRelPath}`
        if (remoteStorageMap.has(remoteThumbPath)) {
          const localThumbDest = path.join(resolvedPath, remoteThumbPath)
          await downloadRemoteFile(supabase, 'travel', remoteThumbPath, localThumbDest)
        }
      }
      downloadsCount++
    }
  }

  console.log(`\n🎉 Done! Successfully applied ${selectedActions.length} action(s):`)
  console.log(`  • Moved:      ${movesCount}`)
  console.log(`  • Deleted:    ${deletesCount}`)
  console.log(`  • Downloaded: ${downloadsCount}`)
}

function safeDeleteOrTrash(filePath, rootDir, useTrash = false) {
  if (!fs.existsSync(filePath)) return

  if (useTrash) {
    const rel = path.relative(rootDir, filePath)
    const trashDest = path.join(rootDir, '.trash', rel)
    safeMoveFile(filePath, trashDest)
  } else {
    fs.unlinkSync(filePath)
  }
}

function safeMoveFile(fromPath, toPath) {
  const destDir = path.dirname(toPath)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  fs.renameSync(fromPath, toPath)
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err)
  process.exit(1)
})
