#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * EXIF Check Script (Recursive)
 *
 * Scans a file or folder (recursively) and checks that images have valid
 * Date Taken and GPS coordinates matching the website's extraction logic.
 *
 * Usage:
 *   node scripts/check-exif.js <path-to-folder-or-file> [options]
 *
 * Options:
 *   --invalid-only        Show only files missing Date or GPS
 *   --help, -h            Show this help message
 */

import fs from 'fs'
import path from 'path'

import ExifReader from 'exifreader'

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.tiff']

function findImagesRecursively(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  for (const file of list) {
    if (file.startsWith('.') || file === 'processed' || file === 'thumb' || file === 'node_modules')
      continue
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      results = results.concat(findImagesRecursively(fullPath))
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      results.push(fullPath)
    }
  }

  return results
}

// 1:1 match of the website's EXIF date parsing logic
function getDateTaken(tags) {
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

// 1:1 match of the website's GPS coordinate extraction logic
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

function processImage(filePath, basePath) {
  const relPath = path.relative(basePath, filePath) || path.basename(filePath)
  try {
    const buffer = fs.readFileSync(filePath)
    const tags = ExifReader.load(buffer)

    const dateTaken = getDateTaken(tags)
    const lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
    const lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])

    const hasDate = dateTaken !== null
    const hasLocation = lat !== null && lng !== null

    return {
      dateTaken: dateTaken ? dateTaken.toISOString() : null,
      filePath,
      hasDate,
      hasLocation,
      hasRequiredData: hasDate && hasLocation,
      location: hasLocation ? { lat, lng } : null,
      relPath,
      success: true,
    }
  } catch (err) {
    return {
      error: err.message,
      filePath,
      hasDate: false,
      hasLocation: false,
      hasRequiredData: false,
      relPath,
      success: false,
    }
  }
}

// CLI Arg Parsing
const args = process.argv.slice(2)
let targetPath = null
let invalidOnly = false

for (const arg of args) {
  if (arg === '--invalid-only') {
    invalidOnly = true
  } else if (arg === '--help' || arg === '-h') {
    targetPath = null
    break
  } else if (!targetPath && !arg.startsWith('-')) {
    targetPath = arg
  }
}

if (!targetPath) {
  console.log('Usage: node scripts/check-exif.js <path-to-folder-or-file> [options]')
  console.log('\nOptions:')
  console.log('  --invalid-only   Display only files missing Date or GPS')
  console.log('  --help, -h       Show this help message')
  process.exit(0)
}

const resolvedPath = path.resolve(targetPath)
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Error: Path does not exist: ${resolvedPath}`)
  process.exit(1)
}

const stats = fs.statSync(resolvedPath)
let filesToProcess = []
let baseDir = resolvedPath

if (stats.isFile()) {
  filesToProcess.push(resolvedPath)
  baseDir = path.dirname(resolvedPath)
} else if (stats.isDirectory()) {
  filesToProcess = findImagesRecursively(resolvedPath)
}

if (filesToProcess.length === 0) {
  console.log('No supported images found to process.')
  process.exit(0)
}

console.log(`\n🔍 Checking ${filesToProcess.length} image(s) across: ${resolvedPath}\n`)

const results = filesToProcess.map((f) => processImage(f, baseDir))

let invalidCount = 0
let validCount = 0

const rows = []

results.forEach((res) => {
  if (!res.success) {
    invalidCount++
    rows.push({
      dateStr: 'ERROR',
      gpsStr: 'ERROR',
      path: res.relPath,
      status: `❌ ${res.error.substring(0, 30)}`,
    })
  } else {
    const dateStr = res.dateTaken ? res.dateTaken : 'MISSING'
    const gpsStr = res.location
      ? `${res.location.lat.toFixed(4)}, ${res.location.lng.toFixed(4)}`
      : 'MISSING'

    let status = '✅ Valid'
    if (!res.hasDate && !res.hasLocation) {
      status = '❌ Missing Date & GPS'
      invalidCount++
    } else if (!res.hasDate) {
      status = '❌ Missing Date'
      invalidCount++
    } else if (!res.hasLocation) {
      status = '❌ Missing GPS'
      invalidCount++
    } else {
      validCount++
    }

    if (!invalidOnly || !res.hasRequiredData) {
      rows.push({
        dateStr,
        gpsStr,
        path: res.relPath,
        status,
      })
    }
  }
})

// Print Results summary table
console.log(
  '========================================================================================================================',
)
console.log(
  `${'Relative Path'.padEnd(65)} | ${'Date Taken (UTC)'.padEnd(25)} | ${'GPS Coordinates'.padEnd(22)} | Status`,
)
console.log(
  '========================================================================================================================',
)

rows.forEach((r) => {
  const displayPath = r.path.length > 63 ? `...${r.path.slice(-60)}` : r.path
  console.log(
    `${displayPath.padEnd(65)} | ${r.dateStr.padEnd(25)} | ${r.gpsStr.padEnd(22)} | ${r.status}`,
  )
})

console.log(
  '========================================================================================================================',
)
console.log(`📊 Summary: ${validCount} valid, ${invalidCount} invalid (Total: ${results.length})\n`)

if (invalidCount > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
