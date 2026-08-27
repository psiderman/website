#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sanitize & Chronological Rename Script
 *
 * Scans travel folder(s) structured as <trip_slug>/[pvt/]<images>:
 * 1. Pre-validates all images against check-exif criteria (both Date Taken and GPS must exist).
 * 2. Strips extra telemetry, face recognition, MakerNotes, and thumbnails from ALL images.
 * 3. Coarsens GPS on private images (inside `pvt/`) to 2 decimal places (~1.1 km precision).
 * 4. Collects all images across <trip_slug>/ and <trip_slug>/pvt/.
 * 5. Sorts all images chronologically by Date Taken.
 * 6. Renames files sequentially (1..n) while preserving their public/pvt folder location.
 *
 * Usage:
 *   node scripts/sanitize-pvt-exif.js <path-to-travel-folder-or-trip-folder>
 */

import { execFileSync, spawnSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

import ExifReader from 'exifreader'

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.tiff']

function checkDependencies() {
  const checkCmd = (cmd) => {
    const res = spawnSync('which', [cmd], { stdio: 'ignore' })
    if (res.status !== 0) {
      console.error(`❌ Error: Missing required CLI tool: ${cmd}`)
      console.error('Install via Homebrew: brew install exiftool')
      process.exit(1)
    }
  }

  checkCmd('exiftool')
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

function processTrip(tripDir, tripName) {
  console.log(`\n================================================================================`)
  console.log(`📁 Trip: ${tripName}`)
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

  // Step 1: Strip extra metadata (and coarsen GPS for private images)
  const allImagePaths = [...publicFiles, ...pvtFiles]
  const imageMetaMap = new Map()

  for (const filePath of allImagePaths) {
    const meta = inspectImage(filePath)
    const isPvt = filePath.startsWith(pvtDir)
    sanitizeAndStripImage(filePath, isPvt, meta.location)

    // Re-inspect metadata after stripping/sanitizing
    const updatedMeta = inspectImage(filePath)
    imageMetaMap.set(filePath, {
      ...updatedMeta,
      dir: path.dirname(filePath),
      ext: path.extname(filePath),
      isPvt,
      originalName: path.basename(filePath),
    })
  }

  console.log(`  ✨ Stripped bloated metadata on all ${totalFiles} image(s).`)
  if (pvtFiles.length > 0) {
    console.log(`  🔒 Coarsened GPS on ${pvtFiles.length} private image(s).`)
  }

  // Step 2: Sort chronologically by Date Taken
  const allImages = Array.from(imageMetaMap.entries()).map(([filePath, data]) => ({
    ...data,
    filePath,
  }))

  allImages.sort((a, b) => a.dateTaken.getTime() - b.dateTaken.getTime())

  // Step 3: Two-pass rename to avoid file collisions
  for (const img of allImages) {
    const tempName = `__tmp_${crypto.randomBytes(6).toString('hex')}${img.ext}`
    const tempPath = path.join(img.dir, tempName)
    fs.renameSync(img.filePath, tempPath)
    img.tempPath = tempPath
  }

  console.log('\n  Chronological Renaming (Obscured UUID):')
  console.log('  ------------------------------------------------------------------------------')
  allImages.forEach((img) => {
    // Generate a random 16-character hex string for the filename
    const obscuredName = `${crypto.randomBytes(8).toString('hex')}${img.ext}`
    const finalPath = path.join(img.dir, obscuredName)
    fs.renameSync(img.tempPath, finalPath)

    const folderTag = img.isPvt ? '[pvt] ' : '[pub] '
    const dateStr = img.dateTaken.toISOString().replace('T', ' ').substring(0, 19)
    console.log(
      `  ${folderTag.padEnd(6)} ${img.originalName.padEnd(25)} ➔ ${obscuredName.padEnd(20)} (${dateStr})`,
    )
  })
}

function sanitizeAndStripImage(filePath, isPvt, location) {
  const exifArgs = [
    '-MakerNotes:all=',
    '-XMP-mwg-rs:all=',
    '-ThumbnailImage=',
    '-PreviewImage=',
    '-IFD1:all=',
  ]

  // Coarsen GPS if inside pvt/
  if (isPvt && location) {
    const roundedLat = Math.round(location.lat * 100) / 100
    const roundedLng = Math.round(location.lng * 100) / 100
    exifArgs.push(
      `-GPSLatitude=${Math.abs(roundedLat)}`,
      `-GPSLatitudeRef=${roundedLat >= 0 ? 'N' : 'S'}`,
      `-GPSLongitude=${Math.abs(roundedLng)}`,
      `-GPSLongitudeRef=${roundedLng >= 0 ? 'E' : 'W'}`,
    )
  }

  exifArgs.push('-overwrite_original', filePath)

  try {
    execFileSync('exiftool', exifArgs, { stdio: 'ignore' })
    return true
  } catch (err) {
    console.error(`  ❌ Failed to sanitize ${path.basename(filePath)}: ${err.message}`)
    return false
  }
}

// CLI Arg Parsing
const targetPath = process.argv[2]
if (!targetPath || targetPath === '--help' || targetPath === '-h') {
  console.log('Usage: node scripts/sanitize-pvt-exif.js <path-to-travel-folder-or-trip-folder>')
  console.log('\nOptions:')
  console.log('  1. Pre-validates all images (requires Date Taken and GPS).')
  console.log('  2. Strips extra telemetry, face recognition, MakerNotes, and thumbnails.')
  console.log('  3. Coarsens GPS on all <trip>/pvt/ images to 2 decimal places.')
  console.log('  4. Sorts all images (<trip>/ + <trip>/pvt/) chronologically.')
  console.log('  5. Renames all images sequentially (1..n) in their respective folders.')
  process.exit(targetPath ? 0 : 1)
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
  console.log('========================================================================================================================')
  console.log(
    `${'File Path'.padEnd(70)} | ${'Date Taken (UTC)'.padEnd(25)} | ${'GPS Coordinates'.padEnd(20)} | Issue`,
  )
  console.log('========================================================================================================================')
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
  console.log('========================================================================================================================')
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

if (hasDirectImages || hasPvtSubdir) {
  // Single trip folder
  processTrip(resolvedPath, path.basename(resolvedPath))
} else {
  // Multi-trip root directory
  const tripDirs = subEntries.filter((e) => {
    const p = path.join(resolvedPath, e)
    return fs.statSync(p).isDirectory() && e !== 'processed' && !e.startsWith('.')
  })

  if (tripDirs.length === 0) {
    console.log('No trip directories found.')
    process.exit(0)
  }

  for (const tripName of tripDirs) {
    const tripDir = path.join(resolvedPath, tripName)
    processTrip(tripDir, tripName)
  }
}

console.log('\n🎉 Finished sanitizing and renaming!')
