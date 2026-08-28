import { getSwatches } from 'colorthief'

import { safeFetch } from './safety'

/**
 * Extract the dominant "vibrant" hex color from a remote image via safeFetch.
 * Throws on failure — callers decide the fallback.
 */
export async function getDominantColorHex(imageUrl: string): Promise<string> {
  const response = await safeFetch(imageUrl)
  if (!response.ok) throw new Error('Image fetch failed')

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const swatches = await getSwatches(buffer)
  const targetSwatch = swatches.Vibrant || swatches.LightVibrant || swatches.DarkVibrant
  const chosen = targetSwatch || Object.values(swatches).find(Boolean)

  if (!chosen) throw new Error('Failed to extract colors from image')
  return chosen.color.hex()
}
