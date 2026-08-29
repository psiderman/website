#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

import { checkbox, confirm, input, select } from '@inquirer/prompts'

import { copyExifTags, findImagesRecursively, inspectImage, writeExifDate } from './lib/exif.js'
import {
  checkRequiredTools,
  convertToWebp,
  generateRandomHexName,
  generateThumbnail,
  isHexName,
  sanitizeAndStripImage,
} from './lib/image-ops.js'
import { diffStorageFiles, getSupabaseAdminClient, listRemoteBucketFiles } from './lib/storage.js'
import { analyzeTripStructure, scaffoldTripFolder } from './lib/structure.js'

console.log(`
┌────────────────────────────────────────────────────────┐
│  ✈️  TRAVEL MEDIA PIPELINE WIZARD                      │
│  Validate • Fix EXIF • Structure • Thumbnails • Sync   │
└────────────────────────────────────────────────────────┘
`)

// Step 0: Check system dependencies
const tools = checkRequiredTools()
if (!tools.ok) {
  console.error(`❌ Missing required system tools: ${tools.missing.join(', ')}`)
  console.error('Please install via Homebrew: brew install exiftool imagemagick')
  process.exit(1)
}

// 1. Pick target path: CLI arg takes precedence
// npm run travel -- /path/to/folder or node scripts/travel-cli.js /path/to/folder
const cliArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
let targetPath = cliArgs[0]

if (!targetPath) {
  targetPath = await input({
    default: '.',
    message: 'Enter path to Travel folder or Trip folder (or pass as arg):',
  })
}

// Strip outer quotes and resolve path (handles drag-and-drop or shell auto-quotes)
const cleanedPath = targetPath.trim().replace(/^['"]|['"]$/g, '')
const resolvedPath = path.resolve(cleanedPath)

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Path does not exist: ${resolvedPath}`)
  process.exit(1)
}

const structure = analyzeTripStructure(resolvedPath)

if (structure?.isMultiTrip) {
  console.log(`📁 Target: ${resolvedPath} (Detected multi-trip container with ${structure.trips.length} trip folders)`)
} else {
  console.log(`📁 Target: ${resolvedPath} (Single trip: ${structure?.tripSlug || 'unstructured'})`)
}

// 2. Select pipeline steps (Multi-select with spacebar [X])
const selectedSteps = await checkbox({
  choices: [
    {
      checked: true,
      name: '🔍 1. Audit & Interactively Fix EXIF (Dates & GPS)',
      value: 'audit_fix',
    },
    {
      checked: !structure?.isStructuredTrip,
      name: '🗂️  2. Structure Trip Folder & Pick [X] Private Photos',
      value: 'structure',
    },
    {
      checked: true,
      name: '🛠️  3. Ingest & Sanitize (Strip metadata, WebP, 16-hex rename)',
      value: 'sanitize',
    },
    {
      checked: true,
      name: '🖼️  4. Thumbnail Generator (Sync missing or Force rebuild)',
      value: 'thumbnails',
    },
    {
      checked: false,
      name: '☁️  5. Supabase Storage Sync (Diff preview, upload & prune)',
      value: 'storage_sync',
    },
  ],
  message: 'Select pipeline steps to run in sequence (Toggle with Spacebar [X]):',
})

if (selectedSteps.length === 0) {
  console.log('No steps selected. Exiting.')
  process.exit(0)
}

// -----------------------------------------------------------------------------
// STEP 1: AUDIT & INTERACTIVELY FIX EXIF
// -----------------------------------------------------------------------------
if (selectedSteps.includes('audit_fix')) {
  console.log(`\n========================================================`)
  console.log(`🔍 STEP 1: AUDIT & INTERACTIVELY FIX EXIF`)
  console.log(`========================================================`)

  const images = findImagesRecursively(resolvedPath)
  console.log(`Inspecting EXIF data across ${images.length} images...`)

  const results = images.map((p) => inspectImage(p))
  const invalid = results.filter((r) => !r.hasDate || !r.hasGps)
  const valid = results.filter((r) => r.hasDate && r.hasGps)

  if (invalid.length === 0) {
    console.log(`✅ All ${images.length} images have valid Date Taken and GPS coordinates!`)
  } else {
    console.log(`\n⚠️ Found ${invalid.length} image(s) missing required metadata:`)
    invalid.forEach((img, idx) => {
      const issues = []
      if (!img.hasDate) issues.push('Missing Date')
      if (!img.hasGps) issues.push('Missing GPS')
      console.log(`  ${idx + 1}. ${img.name} (${issues.join(', ')})`)
    })

    const proceedWithFix = await confirm({
      default: true,
      message: '\nWould you like to step through and fix these images now?',
    })

    if (proceedWithFix) {
      for (const img of invalid) {
        console.log(`\n────────────────────────────────────────────────────────`)
        console.log(`📸 Image: ${img.name}`)
        console.log(`   Path: ${img.filePath}`)
        console.log(`   Status: Date: ${img.hasDate ? '✅' : '❌'}, GPS: ${img.hasGps ? '✅' : '❌'}`)

        // 1. Fix Date
        if (!img.hasDate) {
          const fsIso = img.fsDate ? img.fsDate.toISOString().replace('T', ' ').substring(0, 19) : null
          const dateAction = await select({
            choices: [
              ...(fsIso
                ? [
                    {
                      name: `Use file system date (${fsIso})`,
                      value: 'fs_date',
                    },
                  ]
                : []),
              {
                name: 'Copy Date from another reference photo',
                value: 'copy_photo',
              },
              {
                name: 'Skip date for this photo',
                value: 'skip',
              },
            ],
            message: 'How would you like to set Date Taken?',
          })

          if (dateAction === 'fs_date' && img.fsDate) {
            writeExifDate(img.filePath, img.fsDate)
            console.log(`   ✨ Written Date: ${fsIso}`)
          } else if (dateAction === 'copy_photo' && valid.length > 0) {
            const refFile = await select({
              choices: valid.map((v) => ({
                name: `${v.name} (${v.dateTaken?.toISOString().replace('T', ' ').substring(0, 19)})`,
                value: v.filePath,
              })),
              message: 'Select reference image to copy Date from:',
            })
            copyExifTags(refFile, img.filePath, true, false)
            console.log(`   ✨ Copied Date from ${path.basename(refFile)}`)
          }
        }

        // 2. Fix GPS
        if (!img.hasGps && valid.length > 0) {
          const gpsAction = await select({
            choices: [
              {
                name: 'Copy GPS from a reference photo in this trip',
                value: 'copy_gps',
              },
              {
                name: 'Skip GPS for now',
                value: 'skip',
              },
            ],
            message: 'GPS coordinates missing. What would you like to do?',
          })

          if (gpsAction === 'copy_gps') {
            const refFile = await select({
              choices: valid.map((v) => ({
                name: `${v.name} (${v.location?.lat.toFixed(4)}, ${v.location?.lng.toFixed(4)})`,
                value: v.filePath,
              })),
              message: 'Select reference image to copy GPS coordinates from:',
            })
            copyExifTags(refFile, img.filePath, false, true)
            console.log(`   ✨ Copied GPS tags from ${path.basename(refFile)}`)
          }
        }
      }
      console.log('\n🎉 EXIF repair run completed!')
    }
  }
}

// -----------------------------------------------------------------------------
// STEP 2: STRUCTURE TRIP FOLDER & SELECT PRIVATE PHOTOS [X]
// -----------------------------------------------------------------------------
if (selectedSteps.includes('structure')) {
  console.log(`\n========================================================`)
  console.log(`🗂️  STEP 2: STRUCTURE TRIP FOLDER & SELECT PRIVATE PHOTOS`)
  console.log(`========================================================`)

  const tripsToProcess = structure?.isMultiTrip
    ? structure.trips
    : [{
        isStructured: structure?.isStructuredTrip,
        publicImages: structure?.publicImages || [],
        pvtImages: structure?.pvtImages || [],
        tripDir: resolvedPath,
        tripSlug: structure?.tripSlug || path.basename(resolvedPath),
      }]

  let selectedTrips = tripsToProcess

  if (structure?.isMultiTrip) {
    console.log(`Detected multi-trip directory with ${structure.trips.length} trip folders.`)
    const chosenTripDirs = await checkbox({
      choices: structure.trips.map((t) => ({
        checked: true,
        name: `${t.tripSlug} (${t.publicImages.length} pub, ${t.pvtImages.length} pvt)`,
        value: t.tripDir,
      })),
      message: 'Select trip folders to structure/categorize (Toggle with Spacebar [X]):',
    })

    const chosenSet = new Set(chosenTripDirs)
    selectedTrips = structure.trips.filter((t) => chosenSet.has(t.tripDir))
  }

  for (const trip of selectedTrips) {
    const tripImages = findImagesRecursively(trip.tripDir)
    if (tripImages.length === 0) continue

    let tripSlug = trip.tripSlug
    if (!trip.isStructured && !structure?.isMultiTrip) {
      tripSlug = await input({
        default: path.basename(trip.tripDir).toLowerCase().replace(/\s+/g, '_'),
        message: `Enter trip slug identifier for ${trip.tripDir}:`,
      })
    }

    const travelRoot = structure?.isMultiTrip ? resolvedPath : path.dirname(trip.tripDir)

    console.log(`\n── Trip: ${tripSlug} (${tripImages.length} images) ──`)
    console.log('Select PRIVATE images with Spacebar [X]. Unselected items stay PUBLIC:')
    const selectedPvt = await checkbox({
      choices: tripImages.map((p) => ({
        checked: p.includes('/pvt/'),
        name: path.basename(p),
        value: p,
      })),
      message: `Check all images for '${tripSlug}' that should be in pvt/ folder:`,
    })

    const pvtSet = new Set(selectedPvt)
    const pubFiles = tripImages.filter((p) => !pvtSet.has(p))

    console.log('\n📋 Staging Plan (Dry-run preview):')
    console.log(`  Trip folder: ${path.join(travelRoot, tripSlug)}`)
    console.log(`  Public (${pubFiles.length} images): ➔ ${tripSlug}/`)
    console.log(`  Private (${selectedPvt.length} images): ➔ ${tripSlug}/pvt/`)

    const executeMove = await confirm({
      default: true,
      message: `Execute scaffolding and moves for '${tripSlug}'?`,
    })

    if (executeMove) {
      const { pvtDir, tripDir } = scaffoldTripFolder(travelRoot, tripSlug)
      for (const file of pubFiles) {
        const dest = path.join(tripDir, path.basename(file))
        if (file !== dest) fs.renameSync(file, dest)
      }
      for (const file of selectedPvt) {
        const dest = path.join(pvtDir, path.basename(file))
        if (file !== dest) fs.renameSync(file, dest)
      }
      console.log(`✅ '${tripSlug}' organized successfully!`)
    }
  }
}

// -----------------------------------------------------------------------------
// STEP 3: SANITIZE & INGEST IMAGES
// -----------------------------------------------------------------------------
if (selectedSteps.includes('sanitize')) {
  console.log(`\n========================================================`)
  console.log(`🛠️  STEP 3: SANITIZE & INGEST IMAGES`)
  console.log(`========================================================`)

  const images = findImagesRecursively(resolvedPath)
  if (images.length === 0) {
    console.log('No images found in path.')
  } else {
    const existingHex = images.filter((p) => isHexName(p))
    const newRawImages = images.filter((p) => !isHexName(p))

    console.log(
      `Found ${images.length} images (${existingHex.length} already 16-hex, ${newRawImages.length} raw/new).`,
    )

    const sanitizeOptions = await checkbox({
      choices: [
        {
          checked: true,
          name: 'Strip bloated MakerNotes, thumbnails, face tags (exiftool)',
          value: 'strip_exif',
        },
        {
          checked: true,
          name: 'Convert non-WebP images to .webp format (magick)',
          value: 'convert_webp',
        },
        {
          checked: true,
          name: 'Chronologically rename new images to random 16-hex strings',
          value: 'hex_rename',
        },
        {
          checked: false,
          name: 'Force re-randomize already sanitized 16-hex images',
          value: 'force_rehex',
        },
      ],
      message: 'Select sanitization tasks to execute (Toggle with Spacebar [X]):',
    })

    const qualityStr = await input({
      default: '85',
      message: 'WebP conversion quality (1-100):',
    })
    const webpQuality = parseInt(qualityStr, 10) || 85

    const targetList = sanitizeOptions.includes('force_rehex') ? images : newRawImages

    console.log(`\n📋 Sanitization Plan (Dry-run preview):`)
    console.log(`  Total images to process: ${targetList.length}`)
    console.log(`  Strip EXIF telemetry: ${sanitizeOptions.includes('strip_exif') ? 'YES' : 'NO'}`)
    console.log(
      `  Convert to WebP: ${sanitizeOptions.includes('convert_webp') ? `YES (Quality: ${webpQuality})` : 'NO'}`,
    )
    console.log(`  Hex rename: ${sanitizeOptions.includes('hex_rename') ? 'YES' : 'NO'}`)

    const doSanitize = await confirm({
      default: true,
      message: 'Apply sanitization changes now?',
    })

    if (doSanitize) {
      for (const filePath of targetList) {
        if (sanitizeOptions.includes('strip_exif')) {
          sanitizeAndStripImage(filePath)
        }

        let currentPath = filePath
        if (
          sanitizeOptions.includes('convert_webp') &&
          path.extname(filePath).toLowerCase() !== '.webp'
        ) {
          const destWebp = path.join(path.dirname(filePath), `${path.parse(filePath).name}.webp`)
          convertToWebp(filePath, destWebp, webpQuality)
          fs.unlinkSync(filePath)
          currentPath = destWebp
        }

        if (sanitizeOptions.includes('hex_rename') && !isHexName(currentPath)) {
          const ext = path.extname(currentPath)
          const hexName = generateRandomHexName(ext)
          const destPath = path.join(path.dirname(currentPath), hexName)
          fs.renameSync(currentPath, destPath)
          console.log(`  Renamed: ${path.basename(currentPath)} ➔ ${hexName}`)
        }
      }
      console.log('✅ Sanitization pass completed!')
    }
  }
}

// -----------------------------------------------------------------------------
// STEP 4: THUMBNAILS (SYNC OR FORCE)
// -----------------------------------------------------------------------------
if (selectedSteps.includes('thumbnails')) {
  console.log(`\n========================================================`)
  console.log(`🖼️  STEP 4: THUMBNAIL GENERATOR`)
  console.log(`========================================================`)

  const images = findImagesRecursively(resolvedPath)
  if (images.length === 0) {
    console.log('No images found in path.')
  } else {
    const thumbMode = await select({
      choices: [
        {
          name: 'Sync missing thumbnails only (Incremental)',
          value: 'sync',
        },
        {
          name: 'Force rebuild all thumbnails',
          value: 'force',
        },
      ],
      message: 'Thumbnail generation mode:',
    })

    const thumbQualityStr = await input({
      default: '70',
      message: 'Thumbnail WebP quality (1-100):',
    })
    const thumbQuality = parseInt(thumbQualityStr, 10) || 70

    const travelRoot = structure?.isMultiTrip ? resolvedPath : path.dirname(resolvedPath)
    const thumbPlan = []

    for (const imgPath of images) {
      const rel = path.relative(travelRoot, imgPath)
      const targetThumbPath = path.join(travelRoot, 'thumb', rel)

      if (thumbMode === 'force' || !fs.existsSync(targetThumbPath)) {
        thumbPlan.push({ imgPath, targetThumbPath })
      }
    }

    console.log(`\n📋 Thumbnail Plan (Dry-run preview):`)
    console.log(`  Found ${images.length} source images.`)
    console.log(`  Thumbnails to generate: ${thumbPlan.length}`)
    console.log(`  Target directory: ${path.join(travelRoot, 'thumb')}`)

    if (thumbPlan.length === 0) {
      console.log('✨ All thumbnails are already up-to-date!')
    } else {
      const executeThumbs = await confirm({
        default: true,
        message: 'Proceed with thumbnail generation?',
      })

      if (executeThumbs) {
        for (const item of thumbPlan) {
          generateThumbnail(item.imgPath, item.targetThumbPath, thumbQuality)
        }
        console.log(`✅ Generated ${thumbPlan.length} thumbnails!`)
      }
    }
  }
}

// -----------------------------------------------------------------------------
// STEP 5: SUPABASE STORAGE SYNC & DIFF
// -----------------------------------------------------------------------------
if (selectedSteps.includes('storage_sync')) {
  console.log(`\n========================================================`)
  console.log(`☁️  STEP 5: SUPABASE STORAGE SYNC & DIFF`)
  console.log(`========================================================`)

  const travelRoot = structure?.isMultiTrip ? resolvedPath : path.dirname(resolvedPath)
  const localImages = findImagesRecursively(travelRoot)

  // Also include thumb/ files
  const thumbDir = path.join(travelRoot, 'thumb')
  const localThumbs = fs.existsSync(thumbDir) ? findImagesRecursively(thumbDir) : []
  const allLocal = [...localImages, ...localThumbs]

  console.log(`Connecting to Supabase Storage 'travel' bucket...`)
  let supabase
  try {
    supabase = getSupabaseAdminClient()
  } catch (err) {
    console.error(`❌ ${err.message}`)
    process.exit(1)
  }

  const remoteFiles = await listRemoteBucketFiles(supabase, 'travel')
  const diff = diffStorageFiles(allLocal, remoteFiles, travelRoot)

  console.log(`\n📋 Storage Diff Preview:`)
  console.log(`  + To Upload (New/Modified): ${diff.toUpload.length}`)
  diff.toUpload
    .slice(0, 10)
    .forEach((f) => console.log(`     [+] ${f.relPath} (${(f.size / 1024).toFixed(1)} KB)`))
  if (diff.toUpload.length > 10) console.log(`     ... and ${diff.toUpload.length - 10} more`)

  console.log(`  - Remote Missing Locally: ${diff.toDelete.length}`)
  diff.toDelete.slice(0, 10).forEach((f) => console.log(`     [-] ${f.path}`))
  if (diff.toDelete.length > 10) console.log(`     ... and ${diff.toDelete.length - 10} more`)

  if (diff.toUpload.length === 0 && diff.toDelete.length === 0) {
    console.log('\n✨ Local travel folder is completely in sync with remote bucket!')
  } else {
    const syncActions = await checkbox({
      choices: [
        {
          checked: diff.toUpload.length > 0,
          disabled: diff.toUpload.length === 0 ? 'No files to upload' : false,
          name: `Upload new & modified files (${diff.toUpload.length} files)`,
          value: 'upload',
        },
        {
          checked: false,
          disabled: diff.toDelete.length === 0 ? 'No remote files to delete' : false,
          name: `Delete orphaned remote files missing locally (${diff.toDelete.length} files)`,
          value: 'delete',
        },
      ],
      message: 'Select sync actions to perform (Toggle with Spacebar [X]):',
    })

    if (syncActions.length > 0) {
      const confirmSync = await confirm({
        default: false,
        message: '⚠️ Confirm executing storage sync now?',
      })

      if (confirmSync) {
        if (syncActions.includes('upload')) {
          console.log(`\nUploading ${diff.toUpload.length} file(s)...`)
          for (const item of diff.toUpload) {
            const fileData = fs.readFileSync(item.localPath)
            const isWebp = item.relPath.endsWith('.webp')
            const contentType = isWebp ? 'image/webp' : 'image/jpeg'
            const { error } = await supabase.storage.from('travel').upload(item.relPath, fileData, {
              contentType,
              upsert: true,
            })
            if (error) console.error(`  ❌ Error uploading ${item.relPath}: ${error.message}`)
            else console.log(`  ✅ Uploaded: ${item.relPath}`)
          }
        }

        if (syncActions.includes('delete')) {
          console.log(`\nDeleting ${diff.toDelete.length} orphaned remote file(s)...`)
          const pathsToDelete = diff.toDelete.map((f) => f.path)
          const { error } = await supabase.storage.from('travel').remove(pathsToDelete)
          if (error) console.error(`  ❌ Error deleting: ${error.message}`)
          else console.log(`  ✅ Successfully deleted ${pathsToDelete.length} remote file(s).`)
        }

        console.log('\n🎉 Storage sync completed!')
      }
    }
  }
}

console.log('\n✨ Pipeline wizard completed!')
