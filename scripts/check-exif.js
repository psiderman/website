#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * EXIF Check Script
 *
 * Scans a folder of images and prints the exact EXIF properties
 * (date taken, latitude, longitude) extracted by our website app code.
 *
 * Usage:
 *   node scripts/check-exif.js <path-to-folder-or-file>
 */

import fs from 'fs'
import path from 'path'

import ExifReader from 'exifreader'

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

function processImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath)
    const tags = ExifReader.load(buffer)

    const dateTaken = getDateTaken(tags)
    const lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
    const lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])

    return {
      dateTaken: dateTaken ? dateTaken.toISOString() : null,
      fileName: path.basename(filePath),
      hasRequiredData: dateTaken !== null, // Website filters out images without dateTaken
      location: lat !== null && lng !== null ? { lat, lng } : null,
      success: true,
    }
  } catch (err) {
    return {
      error: err.message,
      fileName: path.basename(filePath),
      success: false,
    }
  }
}

// CLI Arg Parsing
const targetPath = process.argv[2]
if (!targetPath) {
  console.log('Usage: node scripts/check-exif.js <path-to-folder-or-file>')
  process.exit(1)
}

const resolvedPath = path.resolve(targetPath)
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: Path does not exist: ${resolvedPath}`)
  process.exit(1)
}

const stats = fs.statSync(resolvedPath)
let filesToProcess = []

if (stats.isFile()) {
  filesToProcess.push(resolvedPath)
} else if (stats.isDirectory()) {
  const files = fs.readdirSync(resolvedPath)
  const extensions = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.tiff']
  filesToProcess = files
    .filter((file) => extensions.includes(path.extname(file).toLowerCase()))
    .map((file) => path.join(resolvedPath, file))
}

if (filesToProcess.length === 0) {
  console.log('No supported images found to process.')
  process.exit(0)
}

console.log(`Processing ${filesToProcess.length} image(s)...\n`)

const results = filesToProcess.map(processImage)

// Print Results summary
console.log('================================================================================')
console.log(
  `${'File Name'.padEnd(30)} | ${'Date Taken (UTC)'.padEnd(25)} | ${'GPS Coordinates'.padEnd(25)} | Status`,
)
console.log('================================================================================')

results.forEach((res) => {
  if (!res.success) {
    console.log(`${res.fileName.padEnd(30)} | ERROR: ${res.error.substring(0, 50)}`)
  } else {
    const dateStr = res.dateTaken ? res.dateTaken : 'MISSING'
    const gpsStr = res.location
      ? `${res.location.lat.toFixed(4)}, ${res.location.lng.toFixed(4)}`
      : 'MISSING'
    const status = res.hasRequiredData ? '✅ Valid' : '❌ Filtered out (No Date)'
    console.log(
      `${res.fileName.substring(0, 30).padEnd(30)} | ${dateStr.padEnd(25)} | ${gpsStr.padEnd(25)} | ${status}`,
    )
  }
})
console.log('================================================================================')
console.log('Note: The website filters out any images that do not contain a valid Date Taken.')
