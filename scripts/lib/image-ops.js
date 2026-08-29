import { execFileSync, spawnSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export function checkRequiredTools() {
  const missing = []
  const check = (cmd) => {
    const res = spawnSync('which', [cmd], { stdio: 'ignore' })
    if (res.status !== 0) missing.push(cmd)
  }

  check('exiftool')
  check('magick')

  return {
    missing,
    ok: missing.length === 0,
  }
}

export function convertToWebp(sourcePath, targetWebpPath, quality = 85) {
  const targetDir = path.dirname(targetWebpPath)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // 1. Magick conversion with sRGB and quality
  execFileSync(
    'magick',
    [
      sourcePath,
      '-auto-orient',
      '-colorspace',
      'sRGB',
      '-quality',
      quality.toString(),
      targetWebpPath,
    ],
    { stdio: 'ignore' },
  )

  // 2. Copy EXIF metadata from source to target webp
  execFileSync(
    'exiftool',
    [
      '-tagsfromfile',
      sourcePath,
      '-AllDates',
      '-DateTimeOriginal',
      '-CreateDate',
      '-GPS:all',
      '-overwrite_original',
      targetWebpPath,
    ],
    { stdio: 'ignore' },
  )
}

export function generateRandomHexName(ext = '.webp') {
  return `${crypto.randomBytes(8).toString('hex')}${ext}`
}

export function generateThumbnail(sourcePath, targetThumbPath, quality = 70) {
  const thumbDir = path.dirname(targetThumbPath)
  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true })
  }

  execFileSync(
    'magick',
    [
      sourcePath,
      '-auto-orient',
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

export function isHexName(filename) {
  const nameWithoutExt = path.parse(filename).name
  return /^[0-9a-f]{16}$/i.test(nameWithoutExt)
}

export function sanitizeAndStripImage(filePath) {
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
