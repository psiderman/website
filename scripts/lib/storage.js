import fs from 'fs'
import path from 'path'

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

export function diffStorageFiles(localFiles, remoteFiles, localBaseDir) {
  const toUpload = []
  const toDelete = []
  const matching = []

  const remoteMap = new Map(remoteFiles.map((r) => [r.path, r]))

  for (const localPath of localFiles) {
    const relPath = path.relative(localBaseDir, localPath).replace(/\\/g, '/')
    const stat = fs.statSync(localPath)
    const remote = remoteMap.get(relPath)

    if (!remote) {
      toUpload.push({ action: 'create', localPath, relPath, size: stat.size })
    } else if (remote.size !== stat.size) {
      toUpload.push({
        action: 'update',
        localPath,
        relPath,
        remoteSize: remote.size,
        size: stat.size,
      })
    } else {
      matching.push({ localPath, relPath, size: stat.size })
    }
  }

  const localRelSet = new Set(
    localFiles.map((p) => path.relative(localBaseDir, p).replace(/\\/g, '/')),
  )

  for (const remote of remoteFiles) {
    if (!localRelSet.has(remote.path)) {
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
