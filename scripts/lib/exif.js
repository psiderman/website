import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import ExifReader from 'exifreader'

export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.tiff']

export function copyExifTags(sourceFile, targetFile, copyDate = true, copyGps = true) {
  const args = []
  if (copyDate) {
    args.push('-tagsfromfile', sourceFile, '-AllDates', '-DateTimeOriginal', '-CreateDate')
  }
  if (copyGps) {
    args.push('-tagsfromfile', sourceFile, '-GPS:all')
  }
  args.push('-overwrite_original', targetFile)

  execFileSync('exiftool', args, { stdio: 'ignore' })
}

export function findImagesRecursively(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results
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

export function getDateTaken(tags) {
  const dateStr = tags['DateTimeOriginal']?.description || tags['DateTime']?.description
  if (!dateStr) return null

  const formattedDate = dateStr.replace(':', '-').replace(':', '-')
  const isoStr = formattedDate.replace(' ', 'T')
  const offset = tags['OffsetTimeOriginal']?.description || tags['OffsetTime']?.description || ''

  const parsedDate = new Date(isoStr + offset)
  return isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function getDecimalCoordinate(coordinateTag, refTag) {
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

export function inspectImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath)
    const tags = ExifReader.load(buffer)
    const dateTaken = getDateTaken(tags)
    const lat = getDecimalCoordinate(tags['GPSLatitude'], tags['GPSLatitudeRef'])
    const lng = getDecimalCoordinate(tags['GPSLongitude'], tags['GPSLongitudeRef'])

    const stats = fs.statSync(filePath)
    const fsDate =
      stats.birthtime && !isNaN(stats.birthtime.getTime()) && stats.birthtime.getFullYear() > 1980
        ? stats.birthtime
        : stats.mtime

    return {
      dateTaken,
      filePath,
      fsDate,
      hasDate: dateTaken !== null,
      hasGps: lat !== null && lng !== null,
      location: lat !== null && lng !== null ? { lat, lng } : null,
      name: path.basename(filePath),
    }
  } catch (err) {
    let fsDate
    try {
      const stats = fs.statSync(filePath)
      fsDate = stats.birthtime || stats.mtime
    } catch {
      fsDate = null
    }
    return {
      dateTaken: null,
      error: err instanceof Error ? err.message : String(err),
      filePath,
      fsDate,
      hasDate: false,
      hasGps: false,
      location: null,
      name: path.basename(filePath),
    }
  }
}

export function writeExifDate(filePath, dateObj) {
  const pad = (n) => String(n).padStart(2, '0')
  const formatted = `${dateObj.getFullYear()}:${pad(dateObj.getMonth() + 1)}:${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`

  const args = [
    `-AllDates=${formatted}`,
    `-FileCreateDate=${formatted}`,
    `-FileModifyDate=${formatted}`,
    '-overwrite_original',
    filePath,
  ]

  execFileSync('exiftool', args, { stdio: 'ignore' })
}
