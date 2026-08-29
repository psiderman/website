import fs from 'fs'
import path from 'path'

import { SUPPORTED_EXTENSIONS } from './exif.js'

export function analyzeTripStructure(dirPath) {
  const resolved = path.resolve(dirPath)
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    return null
  }

  const entries = fs.readdirSync(resolved)
  const directImages = entries.filter((e) =>
    SUPPORTED_EXTENSIONS.includes(path.extname(e).toLowerCase()),
  )
  const subdirs = entries.filter((e) => {
    if (e.startsWith('.') || e === 'thumb' || e === 'processed' || e === 'node_modules') return false
    return fs.statSync(path.join(resolved, e)).isDirectory()
  })

  // Case 1: Multi-trip container folder (e.g. ~/Downloads/trips/ containing 23_01_pondy, 24_02_tokyo...)
  // A directory is a multi-trip container if it has multiple subdirectories, or subdirectories that aren't 'pvt'
  const nonPvtSubdirs = subdirs.filter((s) => s !== 'pvt')
  if (nonPvtSubdirs.length > 0) {
    const trips = []
    for (const sub of nonPvtSubdirs) {
      const tripPath = path.join(resolved, sub)
      const subEntries = fs.readdirSync(tripPath)
      const subDirectImages = subEntries.filter((e) =>
        SUPPORTED_EXTENSIONS.includes(path.extname(e).toLowerCase()),
      )
      const subHasPvt =
        subEntries.includes('pvt') && fs.statSync(path.join(tripPath, 'pvt')).isDirectory()

      let pvtImages = []
      if (subHasPvt) {
        pvtImages = fs
          .readdirSync(path.join(tripPath, 'pvt'))
          .filter((e) => SUPPORTED_EXTENSIONS.includes(path.extname(e).toLowerCase()))
          .map((e) => path.join(tripPath, 'pvt', e))
      }

      trips.push({
        isStructured: subHasPvt || subDirectImages.length > 0,
        publicImages: subDirectImages.map((e) => path.join(tripPath, e)),
        pvtImages,
        tripDir: tripPath,
        tripSlug: sub,
      })
    }

    return {
      isMultiTrip: true,
      isStructuredTrip: true,
      rootDir: resolved,
      trips,
    }
  }

  // Case 2: Single Trip folder (<trip_slug>/ containing images and optional pvt/)
  const hasPvtSubdir = subdirs.includes('pvt')
  if (directImages.length > 0 || hasPvtSubdir) {
    const pvtImages = []
    if (hasPvtSubdir) {
      const pvtPath = path.join(resolved, 'pvt')
      fs.readdirSync(pvtPath).forEach((f) => {
        if (SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase())) {
          pvtImages.push(path.join(pvtPath, f))
        }
      })
    }

    return {
      isMultiTrip: false,
      isStructuredTrip: true,
      publicImages: directImages.map((f) => path.join(resolved, f)),
      pvtImages,
      rootDir: path.dirname(resolved),
      tripDir: resolved,
      tripSlug: path.basename(resolved),
    }
  }

  return {
    isMultiTrip: false,
    isStructuredTrip: false,
    publicImages: [],
    pvtImages: [],
    rootDir: path.dirname(resolved),
    tripDir: resolved,
    tripSlug: path.basename(resolved),
  }
}

export function scaffoldTripFolder(rootDir, tripSlug) {
  const tripDir = path.join(rootDir, tripSlug)
  const pvtDir = path.join(tripDir, 'pvt')
  const thumbTripDir = path.join(rootDir, 'thumb', tripSlug)
  const thumbPvtDir = path.join(thumbTripDir, 'pvt')

  if (!fs.existsSync(tripDir)) fs.mkdirSync(tripDir, { recursive: true })
  if (!fs.existsSync(pvtDir)) fs.mkdirSync(pvtDir, { recursive: true })
  if (!fs.existsSync(thumbTripDir)) fs.mkdirSync(thumbTripDir, { recursive: true })
  if (!fs.existsSync(thumbPvtDir)) fs.mkdirSync(thumbPvtDir, { recursive: true })

  return { pvtDir, thumbPvtDir, thumbTripDir, tripDir }
}
