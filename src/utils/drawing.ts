import { getStroke, type StrokeOptions } from 'perfect-freehand'

export interface StrokeBounds {
  h: number
  maxX: number
  maxY: number
  minX: number
  minY: number
  w: number
}

export function getStrokeBounds(strokes: number[][][], padding = 16): null | StrokeBounds {
  if (!strokes?.length) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const stroke of strokes) {
    for (const pt of stroke) {
      if (pt && pt.length >= 2) {
        const x = pt[0]
        const y = pt[1]
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return null
  }

  const w = Math.max(1, maxX - minX + padding * 2)
  const h = Math.max(1, maxY - minY + padding * 2)

  return {
    h,
    maxX,
    maxY,
    minX,
    minY,
    w,
  }
}

export function getStrokePath(points: number[][], options?: StrokeOptions): string {
  if (!points?.length) return ''
  const outline = getStroke(points, {
    simulatePressure: false,
    size: 6,
    ...options,
  })
  if (!outline.length) return ''

  const d = outline.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...outline[0], 'Q'],
  )
  d.push('Z')
  return d.join(' ')
}
