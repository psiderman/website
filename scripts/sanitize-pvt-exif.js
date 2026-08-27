#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sanitize, Thumbnail Generation & Chronological Rename Script
 *
 * Scans travel folder(s) structured as <trip_slug>/[pvt/]<images>:
 * 1. Pre-validates all images against check-exif criteria (both Date Taken and GPS must exist).
 * 2. Strips extra telemetry, face recognition, MakerNotes, and thumbnails from ALL images.
 * 3. Sorts all images (<trip_slug>/ and <trip_slug>/pvt/) chronologically by Date Taken.
 * 4. Renames files to random 16-hex strings while preserving public/pvt folder location.
 * 5. Generates low-resolution WebP thumbnails in thumb/<trip_slug>/[pvt/]<filename>.webp.
 *
 * Usage:
 *   node scripts/sanitize-pvt-exif.js <path-to-travel-folder-or-trip-folder> [options]
 *
 * Options:
 *   --quality, -q <num>   Thumbnail WebP quality 1-100 (default: 70)
 *   --help, -h            Show this help message
 */

import { execFileSync, spawnSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

import ExifReader from 'exifreader'

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.tiff']

function checkDependencies() {
  const missing = []
  const checkCmd = (cmd) => {
    const res = spawnSync('which', [cmd], { stdio: 'ignore' })
    if (res.status !== 0) missing.push(cmd)
  }

  checkCmd('exiftool')
  checkCmd('magick')

  if (missing.length > 0) {
    console.error(`❌ Error: Missing required CLI tool(s): ${missing.join(', ')}`)
    console.error('Install via Homebrew: brew install exiftool imagemagick')
    process.exit(1)
  }
}

function findImagesRecursively(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  for (const file of list) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      if (file !== 'processed' && file !== 'thumb' && !file.startsWith('.')) {
        results = results.concat(findImagesRecursively(fullPath))
      }
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
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
      // Reduce to ~4% then upscale to ~400% for placeholder blur
      '-scale',
      '4%',
      '-scale',
      '400%',
      '-strip',
      '-colorspace',
      'sRGB',
      '-quality',
      quality.toString(),
      targetThumbPath,
    ],
    { stdio: 'ignore' },
  )
}

function getDateTaken(tags) {
  const dateStr = tags['DateTimeOriginal']?.description || tags['DateTime']?.description
  if (!dateStr) return null

  const formattedDate = dateStr.replace(':', '-').replace(':', '-')
  const isoStr = formattedDate.replace(' ', 'T')
  const offset = tags['OffsetTimeOriginal']?.description || tags['OffsetTime']?.description || ''

  const parsedDate = new Date(isoStr + offset)
  return isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getDecimalCoordinate(coordinateTag, refTag) {
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

function inspectImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath)
    const tags = ExifReader.load(buffer)
    const dateTaken = getDateTaken(tags)
    const lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
    const lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])

    return {
      dateTaken,
      hasDate: dateTaken !== null,
      hasGps: lat !== null && lng !== null,
      location: lat !== null && lng !== null ? { lat, lng } : null,
    }
  } catch {
    return {
      dateTaken: null,
      hasDate: false,
      hasGps: false,
      location: null,
    }
  }
}

function processTrip(tripDir, tripName, travelRootDir, options = {}) {
  const { noRename = false, thumbQuality = 70, thumbsOnly = false } = options

  console.log(`\n================================================================================`)
  console.log(
    `📁 Trip: ${tripName} ${thumbsOnly ? '[THUMBS ONLY]' : noRename ? '[NO RENAME]' : ''}`,
  )
  console.log(`================================================================================`)

  const publicFiles = []
  const pvtFiles = []

  // Check public folder (trip root)
  const rootEntries = fs.readdirSync(tripDir)
  for (const entry of rootEntries) {
    const fullPath = path.join(tripDir, entry)
    const stat = fs.statSync(fullPath)
    if (stat.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(entry).toLowerCase())) {
      publicFiles.push(fullPath)
    }
  }

  // Check pvt/ subfolder
  const pvtDir = path.join(tripDir, 'pvt')
  if (fs.existsSync(pvtDir) && fs.statSync(pvtDir).isDirectory()) {
    const pvtEntries = fs.readdirSync(pvtDir)
    for (const entry of pvtEntries) {
      const fullPath = path.join(pvtDir, entry)
      const stat = fs.statSync(fullPath)
      if (stat.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(entry).toLowerCase())) {
        pvtFiles.push(fullPath)
      }
    }
  }

  const totalFiles = publicFiles.length + pvtFiles.length
  if (totalFiles === 0) {
    console.log('  No images found.')
    return
  }

  console.log(`  Found ${publicFiles.length} public and ${pvtFiles.length} private image(s).`)

  // Step 1: Strip extra metadata (skipped if thumbsOnly)
  const allImagePaths = [...publicFiles, ...pvtFiles]
  const imageMetaMap = new Map()

  for (const filePath of allImagePaths) {
    if (!thumbsOnly) {
      sanitizeAndStripImage(filePath)
    }

    const updatedMeta = inspectImage(filePath)
    imageMetaMap.set(filePath, {
      ...updatedMeta,
      dir: path.dirname(filePath),
      ext: path.extname(filePath),
      isPvt: filePath.startsWith(pvtDir),
      originalName: path.basename(filePath),
    })
  }

  if (!thumbsOnly) {
    console.log(`  ✨ Stripped bloated metadata on all ${totalFiles} image(s).`)
  }

  // Step 2: Sort chronologically by Date Taken
  const allImages = Array.from(imageMetaMap.entries()).map(([filePath, data]) => ({
    ...data,
    filePath,
  }))

  allImages.sort((a, b) => a.dateTaken.getTime() - b.dateTaken.getTime())

  if (noRename || thumbsOnly) {
    console.log('\n  Generating Thumbnails (Preserving existing filenames):')
    console.log('  ------------------------------------------------------------------------------')
    allImages.forEach((img) => {
      const subFolder = img.isPvt ? path.join(tripName, 'pvt') : tripName
      const targetThumbPath = path.join(travelRootDir, 'thumb', subFolder, img.originalName)
      generateThumbnail(img.filePath, targetThumbPath, thumbQuality)

      const folderTag = img.isPvt ? '[pvt] ' : '[pub] '
      console.log(
        `  ${folderTag.padEnd(6)} ${img.originalName.padEnd(30)} ➔ Thumb generated in thumb/${path.join(subFolder, img.originalName)}`,
      )
    })
    return
  }

  // Step 3: Two-pass rename to avoid file collisions
  for (const img of allImages) {
    const tempName = `__tmp_${crypto.randomBytes(6).toString('hex')}${img.ext}`
    const tempPath = path.join(img.dir, tempName)
    fs.renameSync(img.filePath, tempPath)
    img.tempPath = tempPath
  }

  console.log('\n  Chronological Renaming & Thumbnail Generation:')
  console.log('  ------------------------------------------------------------------------------')
  allImages.forEach((img) => {
    // Generate a random 16-character hex string for the filename
    const obscuredName = `${crypto.randomBytes(8).toString('hex')}${img.ext}`
    const finalPath = path.join(img.dir, obscuredName)
    fs.renameSync(img.tempPath, finalPath)

    // Generate thumbnail inside <travelRootDir>/thumb/<tripName>/[pvt/]<obscuredName>
    const subFolder = img.isPvt ? path.join(tripName, 'pvt') : tripName
    const targetThumbPath = path.join(travelRootDir, 'thumb', subFolder, obscuredName)
    generateThumbnail(finalPath, targetThumbPath, thumbQuality)

    const folderTag = img.isPvt ? '[pvt] ' : '[pub] '
    const dateStr = img.dateTaken.toISOString().replace('T', ' ').substring(0, 19)
    console.log(
      `  ${folderTag.padEnd(6)} ${img.originalName.padEnd(25)} ➔ ${obscuredName.padEnd(20)} (${dateStr}) [Thumb created]`,
    )
  })
}

function sanitizeAndStripImage(filePath) {
  const exifArgs = [
    '-MakerNotes:all=',
    '-XMP-mwg-rs:all=',
    '-ThumbnailImage=',
    '-PreviewImage=',
    '-IFD1:all=',
    '-overwrite_original',
    filePath,
  ]

  try {
    execFileSync('exiftool', exifArgs, { stdio: 'ignore' })
    return true
  } catch (err) {
    console.error(`  ❌ Failed to sanitize ${path.basename(filePath)}: ${err.message}`)
    return false
  }
}

// CLI Arg Parsing
const args = process.argv.slice(2)
let targetPath = null
let thumbQuality = 70
let noRename = false
let thumbsOnly = false

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--quality' || arg === '-q') {
    thumbQuality = parseInt(args[++i], 10) || 70
  } else if (arg === '--no-rename') {
    noRename = true
  } else if (arg === '--thumbs-only') {
    thumbsOnly = true
  } else if (arg === '--help' || arg === '-h') {
    targetPath = null
    break
  } else if (!targetPath && !arg.startsWith('-')) {
    targetPath = arg
  }
}

if (!targetPath) {
  console.log(
    'Usage: node scripts/sanitize-pvt-exif.js <path-to-travel-folder-or-trip-folder> [options]',
  )
  console.log('\nOptions:')
  console.log(
    '  --no-rename           Keep existing filenames; only sanitize and generate thumbnails',
  )
  console.log(
    '  --thumbs-only         Generate/refresh thumbnails only (do not modify or rename originals)',
  )
  console.log('  --quality, -q <num>   Thumbnail WebP quality 1-100 (default: 70)')
  console.log('  --help, -h            Show this help message')
  process.exit(0)
}

checkDependencies()

const resolvedPath = path.resolve(targetPath)
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Error: Path does not exist: ${resolvedPath}`)
  process.exit(1)
}

const stats = fs.statSync(resolvedPath)
if (!stats.isDirectory()) {
  console.error('❌ Error: Please provide a directory path.')
  process.exit(1)
}

// Pre-validation gating: Check ALL images across the provided path first
const allFoundImages = findImagesRecursively(resolvedPath)

if (allFoundImages.length === 0) {
  console.log('No supported images found.')
  process.exit(0)
}

console.log(`🔍 Pre-validating EXIF data for ${allFoundImages.length} image(s)...`)
const preValidationResults = allFoundImages.map((filePath) => {
  const meta = inspectImage(filePath)
  return {
    fileName: path.basename(filePath),
    filePath,
    ...meta,
  }
})

const invalidFiles = preValidationResults.filter((f) => !f.hasDate || !f.hasGps)

if (invalidFiles.length > 0) {
  console.error('\n❌ Pre-validation failed: Found image(s) missing required EXIF metadata.')
  console.error(
    'All images must have both a valid Date Taken and GPS coordinates before running sanitize-pvt-exif.\n',
  )
  console.log(
    '========================================================================================================================',
  )
  console.log(
    `${'File Path'.padEnd(70)} | ${'Date Taken (UTC)'.padEnd(25)} | ${'GPS Coordinates'.padEnd(20)} | Issue`,
  )
  console.log(
    '========================================================================================================================',
  )
  invalidFiles.forEach((f) => {
    const dateStr = f.dateTaken ? f.dateTaken.toISOString() : 'MISSING'
    const gpsStr = f.location
      ? `${f.location.lat.toFixed(4)}, ${f.location.lng.toFixed(4)}`
      : 'MISSING'
    let issue = ''
    if (!f.hasDate && !f.hasGps) issue = 'Missing Date & GPS'
    else if (!f.hasDate) issue = 'Missing Date'
    else if (!f.hasGps) issue = 'Missing GPS'

    console.log(
      `${f.filePath.padEnd(70)} | ${dateStr.padEnd(25)} | ${gpsStr.padEnd(20)} | ❌ ${issue}`,
    )
  })
  console.log(
    '========================================================================================================================',
  )
  console.error(`\nPlease fix the ${invalidFiles.length} file(s) above before running this script.`)
  process.exit(1)
}

console.log(
  `✅ Pre-validation passed! All ${allFoundImages.length} image(s) have valid Date and GPS.\n`,
)

// Detect if resolvedPath is a single trip folder or a container of multiple trip folders
const subEntries = fs.readdirSync(resolvedPath)
const hasDirectImages = subEntries.some((e) =>
  SUPPORTED_EXTENSIONS.includes(path.extname(e).toLowerCase()),
)
const hasPvtSubdir = subEntries.includes('pvt')

const tripOptions = { noRename, thumbQuality, thumbsOnly }

if (hasDirectImages || hasPvtSubdir) {
  // Single trip folder
  const travelRootDir = path.dirname(resolvedPath)
  processTrip(resolvedPath, path.basename(resolvedPath), travelRootDir, tripOptions)
} else {
  // Multi-trip root directory
  const travelRootDir = resolvedPath
  const tripDirs = subEntries.filter((e) => {
    const p = path.join(resolvedPath, e)
    return fs.statSync(p).isDirectory() && e !== 'processed' && e !== 'thumb' && !e.startsWith('.')
  })

  if (tripDirs.length === 0) {
    console.log('No trip directories found.')
    process.exit(0)
  }

  for (const tripName of tripDirs) {
    const tripDir = path.join(resolvedPath, tripName)
    processTrip(tripDir, tripName, travelRootDir, tripOptions)
  }
}

console.log(
  `\n🎉 Finished ${thumbsOnly ? 'generating thumbnails' : noRename ? 'sanitizing and generating thumbnails' : 'sanitizing, renaming, and generating thumbnails'}!`,
)
