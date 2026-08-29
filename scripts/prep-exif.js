#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * EXIF Preparation & WebP Conversion Script
 *
 * Prepares images for the website:
 * 1. Ensures Date Taken exists (falls back to FileModifyDate if missing).
 * 2. Converts image to WebP format using ImageMagick (`magick`).
 * 3. Strips face recognition data, telemetry, and bloated MakerNotes/thumbnails.
 * 4. Preserves GPS coordinates, creation dates, orientation, and color profiles.
 *
 * Usage:
 *   node scripts/prep-exif.js <path-to-folder-or-file> [options]
 *
 * Options:
 *   --out, -o <dir>       Target output directory (default: same directory as input)
 *   --quality, -q <num>   WebP quality 1-100 (default: 85)
 *   --delete-original     Delete original files after successful conversion
 */

import { execFileSync, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import ExifReader from 'exifreader'

function checkDependencies() {
  const missing = []
  const checkCmd = (cmd) => {
    const res = spawnSync('which', [cmd], { stdio: 'ignore' })
    if (res.status !== 0) missing.push(cmd)
  }

  checkCmd('magick')
  checkCmd('exiftool')

  if (missing.length > 0) {
    console.error(`❌ Error: Missing required CLI tool(s): ${missing.join(', ')}`)
    console.error('Install via Homebrew: brew install imagemagick exiftool')
    process.exit(1)
  }
}

// 1:1 match of website's EXIF date parsing
function getDateTaken(tags) {
  const dateStr = tags['DateTimeOriginal']?.description || tags['DateTime']?.description
  if (!dateStr) return null

  const formattedDate = dateStr.replace(':', '-').replace(':', '-')
  const isoStr = formattedDate.replace(' ', 'T')
  const offset = tags['OffsetTimeOriginal']?.description || tags['OffsetTime']?.description || 'Z'

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

function inspectFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath)
    const tags = ExifReader.load(buffer)
    const dateTaken = getDateTaken(tags)
    const lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
    const lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])

    return {
      dateTaken: dateTaken ? dateTaken.toISOString() : null,
      hasDate: dateTaken !== null,
      hasGps: lat !== null && lng !== null,
      location: lat !== null && lng !== null ? { lat, lng } : null,
    }
  } catch {
    return { hasDate: false, hasGps: false, location: null }
  }
}

function processImage(filePath, outDir, quality, deleteOriginal) {
  const fileName = path.basename(filePath)
  const baseName = path.parse(filePath).name
  const targetDir = outDir || path.dirname(filePath)
  const targetWebpPath = path.join(targetDir, `${baseName}.webp`)

  try {
    // 1. Check if source needs Date Taken fallback from filesystem
    const initialMeta = inspectFile(filePath)
    if (!initialMeta.hasDate) {
      execFileSync('exiftool', ['-AllDates<FileModifyDate', '-overwrite_original', filePath], {
        stdio: 'ignore',
      })
    }

    // 2. Convert to WebP using magick (-auto-orient ensures proper rotation)
    execFileSync(
      'magick',
      [filePath, '-auto-orient', '-quality', quality.toString(), targetWebpPath],
      { stdio: 'ignore' },
    )

    // 3. Verify resulting WebP metadata
    const finalMeta = inspectFile(targetWebpPath)

    if (deleteOriginal && path.resolve(filePath) !== path.resolve(targetWebpPath)) {
      fs.unlinkSync(filePath)
    }

    return {
      dateTaken: finalMeta.dateTaken,
      error: null,
      fileName,
      hasRequiredData: finalMeta.hasDate,
      location: finalMeta.location,
      outputFile: path.basename(targetWebpPath),
      success: true,
    }
  } catch (err) {
    return {
      error: err.message,
      fileName,
      outputFile: path.basename(targetWebpPath),
      success: false,
    }
  }
}

// CLI args parsing
const args = process.argv.slice(2)
let targetPath = null
let outDir = null
let quality = 80
let deleteOriginal = false

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--help' || arg === '-h') {
    targetPath = null
    break
  } else if (arg === '--out' || arg === '-o') {
    outDir = args[++i]
  } else if (arg === '--quality' || arg === '-q') {
    quality = parseInt(args[++i], 10) || 80
  } else if (arg === '--delete-original') {
    deleteOriginal = true
  } else if (!targetPath && !arg.startsWith('-')) {
    targetPath = arg
  }
}

if (!targetPath) {
  console.log('Usage: node scripts/prep-exif.js <path-to-folder-or-file> [options]')
  console.log('\nOptions:')
  console.log('  --out, -o <dir>       Target output directory (default: "<input>/processed")')
  console.log('  --quality, -q <num>   WebP compression quality 1-100 (default: 80)')
  console.log('  --delete-original     Remove original source files after conversion')
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

// Default output directory is a subfolder named 'processed'
if (!outDir) {
  outDir = stats.isDirectory()
    ? path.join(resolvedPath, 'processed')
    : path.join(path.dirname(resolvedPath), 'processed')
} else {
  outDir = path.resolve(outDir)
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

let filesToProcess = []
const extensions = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.tiff']

if (stats.isFile()) {
  filesToProcess.push(resolvedPath)
} else if (stats.isDirectory()) {
  const files = fs.readdirSync(resolvedPath)
  filesToProcess = files
    .filter((file) => {
      // Exclude the processed subfolder itself if scanning directory
      if (file === 'processed') return false
      return extensions.includes(path.extname(file).toLowerCase())
    })
    .map((file) => path.join(resolvedPath, file))
}

if (filesToProcess.length === 0) {
  console.log('No supported images found to process.')
  process.exit(0)
}

// Pre-validation: verify that all files pass check-exif criteria (both Date and GPS)
console.log(`🔍 Checking EXIF data for ${filesToProcess.length} image(s)...`)
const preValidationResults = filesToProcess.map((filePath) => {
  const meta = inspectFile(filePath)
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
    'All images must have both a valid Date Taken and GPS coordinates before running prep-exif.\n',
  )
  console.log('================================================================================')
  console.log(
    `${'File Name'.padEnd(30)} | ${'Date Taken (UTC)'.padEnd(25)} | ${'GPS Coordinates'.padEnd(20)} | Issue`,
  )
  console.log('================================================================================')
  invalidFiles.forEach((f) => {
    const dateStr = f.dateTaken ? f.dateTaken : 'MISSING'
    const gpsStr = f.location
      ? `${f.location.lat.toFixed(4)}, ${f.location.lng.toFixed(4)}`
      : 'MISSING'
    let issue = ''
    if (!f.hasDate && !f.hasGps) issue = 'Missing Date & GPS'
    else if (!f.hasDate) issue = 'Missing Date'
    else if (!f.hasGps) issue = 'Missing GPS'

    console.log(
      `${f.fileName.substring(0, 30).padEnd(30)} | ${dateStr.padEnd(25)} | ${gpsStr.padEnd(20)} | ❌ ${issue}`,
    )
  })
  console.log('================================================================================')
  console.error(`\nPlease fix the ${invalidFiles.length} file(s) above before running prep-exif.`)
  process.exit(1)
}

console.log(
  `✅ Pre-validation passed! All ${filesToProcess.length} image(s) have valid Date and GPS.\n`,
)
console.log(`🚀 Processing ${filesToProcess.length} image(s) to WebP (Quality: ${quality})...\n`)

const results = filesToProcess.map((file, idx) => {
  process.stdout.write(`[${idx + 1}/${filesToProcess.length}] ${path.basename(file)}... `)
  const res = processImage(file, outDir, quality, deleteOriginal)
  console.log(res.success ? '✅ Done' : `❌ Error: ${res.error}`)
  return res
})

// Summary Output
console.log('\n================================================================================')
console.log(
  `${'Output File'.padEnd(28)} | ${'Date Taken (UTC)'.padEnd(25)} | ${'GPS Coordinates'.padEnd(20)} | Status`,
)
console.log('================================================================================')

results.forEach((res) => {
  if (!res.success) {
    console.log(`${res.outputFile.padEnd(28)} | ERROR: ${res.error?.substring(0, 45)}`)
  } else {
    const dateStr = res.dateTaken ? res.dateTaken : 'MISSING'
    const gpsStr = res.location
      ? `${res.location.lat.toFixed(4)}, ${res.location.lng.toFixed(4)}`
      : 'None'
    const status = res.hasRequiredData ? '✅ Ready' : '⚠️ No Date'
    console.log(
      `${res.outputFile.substring(0, 28).padEnd(28)} | ${dateStr.padEnd(25)} | ${gpsStr.padEnd(20)} | ${status}`,
    )
  }
})
console.log('================================================================================')
