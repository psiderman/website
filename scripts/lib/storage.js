import fs from 'fs'
import path from 'path'

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

import { inspectImage } from './exif.js'

export function diffStorageFiles(
  localFiles,
  remoteFiles,
  localBaseDir,
  dbImages = [],
  scopePrefixes = [],
) {
  const toUpload = []
  const toDelete = []
  const matching = []

  const remoteMap = new Map(remoteFiles.map((r) => [r.path, r]))
  const dbMap = new Map(dbImages.map((img) => [img.storage_path, img]))

  for (const localPath of localFiles) {
    const relPath = path.relative(localBaseDir, localPath).replace(/\\/g, '/')
    const stat = fs.statSync(localPath)
    const remote = remoteMap.get(relPath)
    const dbRecord = dbMap.get(relPath)

    if (!remote) {
      toUpload.push({
        action: 'create',
        localPath,
        reason: 'New file (not in storage)',
        relPath,
        size: stat.size,
      })
    } else if (remote.size !== stat.size) {
      toUpload.push({
        action: 'update',
        localPath,
        reason: `Size changed (${(remote.size / 1024).toFixed(1)} KB ➔ ${(stat.size / 1024).toFixed(1)} KB)`,
        relPath,
        remoteSize: remote.size,
        size: stat.size,
      })
    } else if (dbRecord && !relPath.startsWith('thumb/')) {
      const meta = inspectImage(localPath)
      const reasons = []

      if (meta.dateTaken && dbRecord.date_taken) {
        const localTime = meta.dateTaken.getTime()
        const dbTime = new Date(dbRecord.date_taken).getTime()
        if (Math.abs(localTime - dbTime) > 1000) {
          reasons.push('Date updated')
        }
      } else if (meta.dateTaken && !dbRecord.date_taken) {
        reasons.push('Date added')
      }

      if (meta.location && (dbRecord.lat !== null || dbRecord.lng !== null)) {
        const latDiff = Math.abs((meta.location.lat ?? 0) - (dbRecord.lat ?? 0))
        const lngDiff = Math.abs((meta.location.lng ?? 0) - (dbRecord.lng ?? 0))
        if (latDiff > 0.0001 || lngDiff > 0.0001) {
          reasons.push('GPS updated')
        }
      } else if (meta.location && dbRecord.lat === null && dbRecord.lng === null) {
        reasons.push('GPS added')
      }

      if (reasons.length > 0) {
        toUpload.push({
          action: 'meta_update',
          dbRecord,
          localPath,
          meta,
          reason: `EXIF metadata updated: ${reasons.join(', ')}`,
          relPath,
          size: stat.size,
        })
      } else {
        matching.push({ localPath, relPath, size: stat.size })
      }
    } else {
      matching.push({ localPath, relPath, size: stat.size })
    }
  }

  // Deletion is scoped: only remote files under one of `scopePrefixes`
  // (e.g. "23_10_india/" or "thumb/23_10_india/") are ever proposed for
  // deletion. With no scope we refuse to propose ANY deletion — this protects
  // other trips' files.
  const localRelSet = new Set(
    localFiles.map((p) => path.relative(localBaseDir, p).replace(/\\/g, '/')),
  )

  for (const remote of remoteFiles) {
    const inScope =
      scopePrefixes.length === 0 || scopePrefixes.some((p) => remote.path.startsWith(p))
    if (inScope && !localRelSet.has(remote.path)) {
      toDelete.push(remote)
    }
  }

  return { matching, toDelete, toUpload }
}

export function getSupabaseAdminClient(overrideKey) {
  const url = process.env.VITE_SUPABASE_URL
  const key =
    overrideKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  }

  return createClient(url, key)
}

export async function listRemoteBucketFiles(supabase, bucket = 'travel', prefix = '') {
  let all = []
  let offset = 0
  const limit = 100

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) throw error
    if (!data || data.length === 0) break

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) {
        // Directory
        const subFiles = await listRemoteBucketFiles(supabase, bucket, itemPath)
        all = all.concat(subFiles)
      } else {
        all.push({
          createdAt: item.created_at,
          name: item.name,
          path: itemPath,
          size: item.metadata?.size ?? 0,
        })
      }
    }

    if (data.length < limit) break
    offset += limit
  }

  return all
}
