import { execFileSync, spawnSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const CHUNK_SIZE = 100

export function batchConvertToWebp(filePaths, quality = 85) {
  if (filePaths.length === 0) return []

  const nonWebpFiles = filePaths.filter((p) => path.extname(p).toLowerCase() !== '.webp')
  const webpFiles = filePaths.filter((p) => path.extname(p).toLowerCase() === '.webp')
  const resultingWebpFiles = []

  // 1. Process existing .webp files in-place (resize 3000x3000, colorspace sRGB, quality)
  if (webpFiles.length > 0) {
    for (const chunk of chunkArray(webpFiles, CHUNK_SIZE)) {
      execFileSync(
        'magick',
        [
          'mogrify',
          '-auto-orient',
          '-resize',
          '3000x3000',
          '-colorspace',
          'sRGB',
          '-quality',
          quality.toString(),
          ...chunk,
        ],
        { stdio: 'ignore' },
      )
    }
    resultingWebpFiles.push(...webpFiles)
  }

  // 2. Convert non-webp files (jpg, png, heic, etc.) to .webp using mogrify
  if (nonWebpFiles.length > 0) {
    for (const chunk of chunkArray(nonWebpFiles, CHUNK_SIZE)) {
      execFileSync(
        'magick',
        [
          'mogrify',
          '-format',
          'webp',
          '-auto-orient',
          '-resize',
          '3000x3000',
          '-colorspace',
          'sRGB',
          '-quality',
          quality.toString(),
          ...chunk,
        ],
        { stdio: 'ignore' },
      )
    }

    // 3. Batch copy EXIF tags from original files to new .webp files
    for (const originalFile of nonWebpFiles) {
      const dir = path.dirname(originalFile)
      const parsed = path.parse(originalFile)
      const destWebp = path.join(dir, `${parsed.name}.webp`)

      if (fs.existsSync(destWebp)) {
        try {
          execFileSync(
            'exiftool',
            [
              '-tagsfromfile',
              originalFile,
              '-AllDates',
              '-DateTimeOriginal',
              '-CreateDate',
              '-GPS:all',
              '-overwrite_original',
              destWebp,
            ],
            { stdio: 'ignore' },
          )
        } catch {
          // ignore tag copy errors if format doesn't support
        }

        // Remove original non-webp file
        if (originalFile !== destWebp && fs.existsSync(originalFile)) {
          fs.unlinkSync(originalFile)
        }
        resultingWebpFiles.push(destWebp)
      }
    }
  }

  return resultingWebpFiles
}

export function batchGenerateThumbnails(images, travelRoot, quality = 70) {
  if (images.length === 0) return 0

  // Group images by their relative subdirectory under travelRoot
  const groups = new Map() // relSubdir -> Array of full filePaths

  for (const imgPath of images) {
    const relPath = path.relative(travelRoot, imgPath)
    const relDir = path.dirname(relPath) // e.g. "24_02_tokyo" or "24_02_tokyo/pvt"
    if (!groups.has(relDir)) {
      groups.set(relDir, [])
    }
    groups.get(relDir).push(imgPath)
  }

  let count = 0

  for (const [relDir, fileList] of groups.entries()) {
    const targetThumbDir = path.join(travelRoot, 'thumb', relDir)
    if (!fs.existsSync(targetThumbDir)) {
      fs.mkdirSync(targetThumbDir, { recursive: true })
    }

    for (const chunk of chunkArray(fileList, CHUNK_SIZE)) {
      execFileSync(
        'magick',
        [
          'mogrify',
          '-path',
          targetThumbDir,
          '-format',
          'webp',
          '-auto-orient',
          '-scale',
          '10%',
          '-scale',
          '200%',
          '-strip',
          '-colorspace',
          'sRGB',
          '-quality',
          quality.toString(),
          ...chunk,
        ],
        { stdio: 'ignore' },
      )
      count += chunk.length
    }
  }

  return count
}

export function batchSanitizeAndStripImages(filePaths) {
  if (filePaths.length === 0) return

  for (const chunk of chunkArray(filePaths, CHUNK_SIZE)) {
    try {
      execFileSync(
        'exiftool',
        [
          '-overwrite_original',
          '-MakerNotes:all=',
          '-XMP-mwg-rs:all=',
          '-ThumbnailImage=',
          '-PreviewImage=',
          '-IFD1:all=',
          ...chunk,
        ],
        { stdio: 'ignore' },
      )
    } catch (err) {
      console.error(`  ⚠️ Batch exiftool warning: ${err.message}`)
    }
  }
}

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

  execFileSync(
    'magick',
    [
      sourcePath,
      '-auto-orient',
      '-resize',
      '3000x3000',
      '-colorspace',
      'sRGB',
      '-quality',
      quality.toString(),
      targetWebpPath,
    ],
    { stdio: 'ignore' },
  )

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
      '10%',
      '-scale',
      '200%',
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

function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
