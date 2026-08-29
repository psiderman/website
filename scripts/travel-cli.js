#!/usr/bin/env node
/* eslint-disable no-console */

// Fail loud if anything throws mid-pipeline — a raw unhandled rejection
// would leave uploads/renames half-applied with no guidance.
process.on('unhandledRejection', (err) => {
  console.error('\n❌ Pipeline failed:', err instanceof Error ? err.message : err)
  console.error('If this happened mid-sync, re-run with --dry-run to verify local & remote state before continuing.')
  process.exit(1)
})

import fs from 'fs'
import path from 'path'

import { checkbox, confirm, input, search, select } from '@inquirer/prompts'

import { copyExifTags, findImagesRecursively, inspectImage, writeExifDate } from './lib/exif.js'
import {
  batchConvertToWebp,
  batchGenerateThumbnails,
  batchSanitizeAndStripImages,
  checkRequiredTools,
  generateRandomHexName,
  isHexName,
} from './lib/image-ops.js'
import { diffStorageFiles, getSupabaseAdminClient, listRemoteBucketFiles } from './lib/storage.js'
import { analyzeTripStructure, scaffoldTripFolder } from './lib/structure.js'

console.log(`
┌────────────────────────────────────────────────────────┐
│  ✈️  TRAVEL MEDIA PIPELINE WIZARD                      │
│  Validate • Fix EXIF • Structure • Thumbnails • Sync   │
└────────────────────────────────────────────────────────┘
`)

const TRIP_SLUG_REGEX = /^\d{2}_\d{2}_[a-z0-9_-]+$/

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
let resolvedPath = path.resolve(cleanedPath)

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Path does not exist: ${resolvedPath}`)
  process.exit(1)
}

const structure = analyzeTripStructure(resolvedPath)
let activeTripSlug =
  structure?.tripSlug || path.basename(resolvedPath).toLowerCase().replace(/\s+/g, '_')

if (structure?.isMultiTrip) {
  console.log(
    `📁 Target: ${resolvedPath} (Detected multi-trip container with ${structure.trips.length} trip folders)`,
  )
} else {
  const rawBase = path.basename(resolvedPath).toLowerCase().replace(/\s+/g, '_')
  const defaultSlug = TRIP_SLUG_REGEX.test(rawBase) ? rawBase : '24_02_tokyo'

  const userSlug = await input({
    default: defaultSlug,
    message: 'Enter trip slug identifier (format: YY_MM_name, e.g. 24_02_tokyo):',
    validate: (val) => {
      const slug = val.trim().toLowerCase().replace(/\s+/g, '_')
      if (!TRIP_SLUG_REGEX.test(slug)) {
        return 'Trip slug must match YY_MM_name format (e.g. 24_02_tokyo, 23_11_kyoto)'
      }
      return true
    },
  })
  activeTripSlug = userSlug.trim().toLowerCase().replace(/\s+/g, '_')
  if (structure) structure.tripSlug = activeTripSlug
  console.log(`📁 Target: ${resolvedPath} (Trip: ${activeTripSlug})`)
}

// 2. Select pipeline steps (Multi-select with spacebar [X])
const selectedSteps = await checkbox({
  choices: [
    {
      checked: true,
      name: '🔍 1. Audit EXIF (Dates & GPS)',
      value: 'audit_fix',
    },
    {
      checked: true,
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
  console.log(`🔍 STEP 1: AUDIT EXIF (Dates & GPS)`)
  console.log(`========================================================`)

  const images = findImagesRecursively(resolvedPath)
  console.log(`Inspecting EXIF data across ${images.length} images...`)

  let results = images.map((p) => inspectImage(p))
  let invalid = results.filter((r) => !r.hasDate || !r.hasGps)
  let valid = results.filter((r) => r.hasDate && r.hasGps)

  if (invalid.length === 0) {
    console.log(`✅ All ${images.length} images have valid Date Taken and GPS coordinates!`)
  } else if (valid.length > 0) {
    console.log(`\n⚠️ Found ${invalid.length} image(s) missing required metadata:`)
    invalid.forEach((img, idx) => {
      const issues = []
      if (!img.hasDate) issues.push('Missing Date')
      if (!img.hasGps) issues.push('Missing GPS')
      console.log(`  ${idx + 1}. ${img.name} (${issues.join(', ')})`)
    })

    const proceedWithFix = await confirm({
      default: true,
      message: `\nFound ${valid.length} valid reference photo(s). Would you like to step through and fix missing EXIF using reference photos?`,
    })

    if (proceedWithFix) {
      for (const img of invalid) {
        console.log(`\n────────────────────────────────────────────────────────`)
        console.log(`📸 Image: ${img.name}`)
        console.log(`   Path: ${img.filePath}`)
        console.log(
          `   Status: Date: ${img.hasDate ? '✅' : '❌'}, GPS: ${img.hasGps ? '✅' : '❌'}`,
        )

        // 1. Fix Date
        if (!img.hasDate) {
          const fsIso = img.fsDate
            ? img.fsDate.toISOString().replace('T', ' ').substring(0, 19)
            : null
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
              ...(valid.length > 0
                ? [
                    {
                      name: 'Copy Date from reference photo in this trip',
                      value: 'copy_photo',
                    },
                  ]
                : []),
              {
                name: 'Pick any external photo from disk (drag & drop / enter path)',
                value: 'copy_external',
              },
              {
                name: 'Skip date for now',
                value: 'skip',
              },
            ],
            message: 'How would you like to set Date Taken?',
          })

          if (dateAction === 'fs_date' && img.fsDate) {
            writeExifDate(img.filePath, img.fsDate)
            console.log(`   ✨ Written Date: ${fsIso}`)
          } else if (dateAction === 'copy_photo') {
            const refFile = await search({
              message: 'Search/Type reference image to copy Date from:',
              pageSize: 15,
              source: (term) => {
                const choices = valid.map((v) => ({
                  name: `${v.name} (${v.dateTaken?.toISOString().replace('T', ' ').substring(0, 19)})`,
                  value: v.filePath,
                }))
                if (!term) return choices
                const lower = term.toLowerCase()
                return choices.filter((c) => c.name.toLowerCase().includes(lower))
              },
            })
            copyExifTags(refFile, img.filePath, true, false)
            console.log(`   ✨ Copied Date from ${path.basename(refFile)}`)
          } else if (dateAction === 'copy_external') {
            const externalPathInput = await input({
              message: 'Enter / Drag-and-drop external image path to copy Date from:',
              validate: (val) => {
                const p = path.resolve(val.trim().replace(/^['"]|['"]$/g, ''))
                if (!fs.existsSync(p)) return `File does not exist: ${p}`
                return true
              },
            })
            const cleanPath = path.resolve(externalPathInput.trim().replace(/^['"]|['"]$/g, ''))
            copyExifTags(cleanPath, img.filePath, true, false)
            console.log(`   ✨ Copied Date from external file: ${path.basename(cleanPath)}`)
          }
        }

        // 2. Fix GPS
        if (!img.hasGps) {
          const gpsAction = await select({
            choices: [
              ...(valid.length > 0
                ? [
                    {
                      name: 'Copy GPS from reference photo in this trip',
                      value: 'copy_gps',
                    },
                  ]
                : []),
              {
                name: 'Pick any external photo / video from disk (drag & drop / enter path)',
                value: 'copy_external',
              },
              {
                name: 'Skip GPS for now',
                value: 'skip',
              },
            ],
            message: 'GPS coordinates missing. What would you like to do?',
          })

          if (gpsAction === 'copy_gps') {
            const refFile = await search({
              message: 'Search/Type reference image to copy GPS coordinates from:',
              pageSize: 15,
              source: (term) => {
                const choices = valid.map((v) => ({
                  name: `${v.name} (${v.location?.lat.toFixed(4)}, ${v.location?.lng.toFixed(4)})`,
                  value: v.filePath,
                }))
                if (!term) return choices
                const lower = term.toLowerCase()
                return choices.filter((c) => c.name.toLowerCase().includes(lower))
              },
            })
            copyExifTags(refFile, img.filePath, false, true)
            console.log(`   ✨ Copied GPS tags from ${path.basename(refFile)}`)
          } else if (gpsAction === 'copy_external') {
            const externalPathInput = await input({
              message:
                'Enter / Drag-and-drop external photo or video (.MOV/.MP4) to copy GPS from:',
              validate: (val) => {
                const p = path.resolve(val.trim().replace(/^['"]|['"]$/g, ''))
                if (!fs.existsSync(p)) return `File does not exist: ${p}`
                return true
              },
            })
            const cleanPath = path.resolve(externalPathInput.trim().replace(/^['"]|['"]$/g, ''))
            copyExifTags(cleanPath, img.filePath, false, true)
            console.log(`   ✨ Copied GPS tags from external file: ${path.basename(cleanPath)}`)
          }
        }
      }
    }

    // Re-verify after repair attempt
    results = images.map((p) => inspectImage(p))
    invalid = results.filter((r) => !r.hasDate || !r.hasGps)

    if (invalid.length === 0) {
      console.log(`\n🎉 All ${images.length} images now have valid Date Taken and GPS coordinates!`)
    } else {
      console.error(
        `\n❌ Metadata validation failed: ${invalid.length} image(s) are still missing required EXIF:`,
      )
      invalid.forEach((img, idx) => {
        const issues = []
        if (!img.hasDate) issues.push('Missing Date')
        if (!img.hasGps) issues.push('Missing GPS')
        console.error(`  ${idx + 1}. ${img.filePath} (${issues.join(', ')})`)
      })

      const sampleGpsTarget = invalid.find((i) => !i.hasGps)?.filePath || '/path/to/target.jpg'
      const sampleDateTarget = invalid.find((i) => !i.hasDate)?.filePath || '/path/to/target.jpg'

      console.log(`
🛑 Please fix remaining files with these commands before proceeding:

📍 For GPS from image:
exiftool -tagsFromFile \\
  /path/to/reference_with_gps.HEIC \\
  -gps:all -overwrite_original \\
  "${sampleGpsTarget}"

🎥 For GPS from video:
exiftool -ee -tagsFromFile \\
  /path/to/reference_with_gps.MOV \\
  "-GPSPosition<GPSCoordinates" -overwrite_original \\
  "${sampleGpsTarget}"

📅 For Dates (from file modify date):
exiftool "-AllDates<FileModifyDate" -overwrite_original "${sampleDateTarget}"
`)
      process.exit(1)
    }
  } else {
    // valid.length === 0 (no reference images in folder)
    console.error(
      `\n❌ Metadata validation failed: ${invalid.length} image(s) missing required EXIF, and no valid reference photos exist in this folder:`,
    )
    invalid.forEach((img, idx) => {
      const issues = []
      if (!img.hasDate) issues.push('Missing Date')
      if (!img.hasGps) issues.push('Missing GPS')
      console.error(`  ${idx + 1}. ${img.filePath} (${issues.join(', ')})`)
    })

    const sampleGpsTarget = invalid.find((i) => !i.hasGps)?.filePath || '/path/to/target.jpg'
    const sampleDateTarget = invalid.find((i) => !i.hasDate)?.filePath || '/path/to/target.jpg'

    console.log(`
🛑 Please fix your files first using these commands, then re-run the pipeline:

📍 For GPS from image:
exiftool -tagsFromFile \\
  /path/to/reference_with_gps.HEIC \\
  -gps:all -overwrite_original \\
  "${sampleGpsTarget}"

🎥 For GPS from video:
exiftool -ee -tagsFromFile \\
  /path/to/reference_with_gps.MOV \\
  "-GPSPosition<GPSCoordinates" -overwrite_original \\
  "${sampleGpsTarget}"

📅 For Dates (from file modify date):
exiftool "-AllDates<FileModifyDate" -overwrite_original "${sampleDateTarget}"
`)
    process.exit(1)
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
    : [
        {
          isStructured: structure?.isStructuredTrip,
          publicImages: structure?.publicImages || [],
          pvtImages: structure?.pvtImages || [],
          tripDir: resolvedPath,
          tripSlug: structure?.tripSlug || path.basename(resolvedPath),
        },
      ]

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

    let tripSlug = structure?.isMultiTrip ? trip.tripSlug : activeTripSlug
    if (!TRIP_SLUG_REGEX.test(tripSlug)) {
      const userSlug = await input({
        default: '24_02_tokyo',
        message: `Enter trip slug identifier for '${path.basename(trip.tripDir)}' (format: YY_MM_name, e.g. 24_02_tokyo):`,
        validate: (val) => {
          const slug = val.trim().toLowerCase().replace(/\s+/g, '_')
          if (!TRIP_SLUG_REGEX.test(slug)) {
            return 'Trip slug must match YY_MM_name format (e.g. 24_02_tokyo, 23_11_kyoto)'
          }
          return true
        },
      })
      tripSlug = userSlug.trim().toLowerCase().replace(/\s+/g, '_')
      activeTripSlug = tripSlug
    }

    const isTargetSameAsSlug = path.basename(trip.tripDir).toLowerCase() === tripSlug

    const travelRoot = structure?.isMultiTrip
      ? resolvedPath
      : isTargetSameAsSlug
        ? path.dirname(trip.tripDir)
        : trip.tripDir

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
    console.log(`  Source:      ${trip.tripDir}`)
    console.log(
      `  Destination: ${path.join(travelRoot, tripSlug)} (${!isTargetSameAsSlug ? 'COPY from inbox' : 'organize in place'})`,
    )
    console.log(`  Public (${pubFiles.length} images): ➔ ${tripSlug}/`)
    console.log(`  Private (${selectedPvt.length} images): ➔ ${tripSlug}/pvt/`)

    const executeMove = await confirm({
      default: true,
      message: `Execute scaffolding and ${!isTargetSameAsSlug ? 'copy' : 'moves'} for '${tripSlug}'?`,
    })

    if (executeMove) {
      const { pvtDir, tripDir } = scaffoldTripFolder(travelRoot, tripSlug)

      // Refuse to silently overwrite an existing destination (re-run/collision).
      const ensureVacant = (dest) => {
        if (fs.existsSync(dest)) {
          throw new Error(`Destination already exists, refusing to overwrite: ${dest}`)
        }
      }

      for (const file of pubFiles) {
        const dest = path.join(tripDir, path.basename(file))
        if (file !== dest) {
          ensureVacant(dest)
          if (!isTargetSameAsSlug) {
            fs.copyFileSync(file, dest)
          } else {
            fs.renameSync(file, dest)
          }
        }
      }
      for (const file of selectedPvt) {
        const dest = path.join(pvtDir, path.basename(file))
        if (file !== dest) {
          ensureVacant(dest)
          if (!isTargetSameAsSlug) {
            fs.copyFileSync(file, dest)
          } else {
            fs.renameSync(file, dest)
          }
        }
      }
      console.log(
        `✅ '${tripSlug}' ${!isTargetSameAsSlug ? 'copied and organized' : 'organized'} successfully!`,
      )

      if (!structure?.isMultiTrip && !isTargetSameAsSlug) {
        resolvedPath = tripDir
      }
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
          name: 'Resize & optimize all images to .webp (3000px longest side, magick)',
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
      default: '80',
      message: 'WebP conversion quality (1-100):',
    })
    const webpQuality = parseInt(qualityStr, 10) || 80

    const targetList = images

    console.log(`\n📋 Sanitization Plan (Dry-run preview):`)
    console.log(`  Total images to process: ${targetList.length}`)
    console.log(`  Strip EXIF telemetry: ${sanitizeOptions.includes('strip_exif') ? 'YES' : 'NO'}`)
    console.log(
      `  Convert/Resize to WebP: ${sanitizeOptions.includes('convert_webp') ? `YES (Quality: ${webpQuality}, max 3000px)` : 'NO'}`,
    )
    console.log(`  Hex rename: ${sanitizeOptions.includes('hex_rename') ? 'YES' : 'NO'}`)

    const doSanitize = await confirm({
      default: true,
      message: 'Apply sanitization changes now?',
    })

    if (doSanitize) {
      console.log(`\nProcessing ${targetList.length} image(s)...`)

      // 1. Batch telemetry strip
      if (sanitizeOptions.includes('strip_exif')) {
        console.log('  🧹 Batch stripping bloated EXIF tags (exiftool)...')
        batchSanitizeAndStripImages(targetList)
      }

      // 2. Batch WebP conversion and 3000px resizing with mogrify
      let currentImages = targetList
      if (sanitizeOptions.includes('convert_webp')) {
        console.log('  ⚡ Batch converting & resizing to WebP (magick mogrify)...')
        currentImages = batchConvertToWebp(targetList, webpQuality)
      }

      // 3. Fast In-Memory 16-hex renaming
      if (sanitizeOptions.includes('hex_rename')) {
        console.log('  🏷️  Renaming images to 16-hex strings...')
        let renameCount = 0
        for (const filePath of currentImages) {
          const shouldRename = !isHexName(filePath) || sanitizeOptions.includes('force_rehex')
          if (shouldRename) {
            const ext = path.extname(filePath)
            const hexName = generateRandomHexName(ext)
            const destPath = path.join(path.dirname(filePath), hexName)
            if (filePath !== destPath) {
              fs.renameSync(filePath, destPath)
              renameCount++
            }
          }
        }
        console.log(`  ✅ Renamed ${renameCount} image(s) to 16-hex.`)
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
        console.log(`  ⚡ Batch generating ${thumbPlan.length} thumbnails (magick mogrify)...`)
        const targetImages = thumbPlan.map((item) => item.imgPath)
        batchGenerateThumbnails(targetImages, travelRoot, thumbQuality)
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
  const localImages = findImagesRecursively(resolvedPath)

// Scope deletions to the trip(s) in the folder being synced so other trips'
// remote files are never proposed for deletion. Multi-trip root syncs the
// whole bucket; single-trip syncs only that trip's prefix + its thumb subfolder.
  const tripScopePrefixes = structure?.isMultiTrip
    ? []
    : [`${path.basename(resolvedPath)}/`, `thumb/${path.basename(resolvedPath)}/`]

  // Also include thumb/ files for the target trip(s)
  const tripThumbDir = structure?.isMultiTrip
    ? path.join(travelRoot, 'thumb')
    : path.join(travelRoot, 'thumb', path.basename(resolvedPath))
  const localThumbs = fs.existsSync(tripThumbDir) ? findImagesRecursively(tripThumbDir) : []
  const allLocal = [...localImages, ...localThumbs]

  console.log(`Connecting to Supabase Storage & DB...`)
  let supabase
  try {
    supabase = getSupabaseAdminClient()
  } catch (err) {
    console.error(`❌ ${err.message}`)
    process.exit(1)
  }

  const [remoteFiles, { data: dbImages }] = await Promise.all([
    listRemoteBucketFiles(supabase, 'travel'),
    supabase
      .from('trip_images')
      .select('id, trip_slug, storage_path, date_taken, lat, lng, clearance'),
  ])

  const diff = diffStorageFiles(allLocal, remoteFiles, travelRoot, dbImages || [], tripScopePrefixes)

  console.log(`\n📋 Storage & Metadata Diff Preview:`)
  console.log(`  + To Upload (New/Modified/EXIF changed): ${diff.toUpload.length}`)
  diff.toUpload
    .slice(0, 15)
    .forEach((f) =>
      console.log(`     [+] ${f.relPath} (${f.reason || `${(f.size / 1024).toFixed(1)} KB`})`),
    )
  if (diff.toUpload.length > 15) console.log(`     ... and ${diff.toUpload.length - 15} more`)

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
