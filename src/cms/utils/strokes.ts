import { getStrokeBounds, getStrokePath } from '@/utils/drawing'

export function getDrawingViewBox(strokes: number[][][]) {
  const b = getStrokeBounds(strokes)
  if (!b) return undefined
  return `${b.minX} ${b.minY} ${b.w} ${b.h}`
}

export function getSvgPathFromStroke(points: number[][]) {
  return getStrokePath(points, {
    smoothing: 0.7,
    streamline: 0.3,
    thinning: 0.5,
  })
}

export function parseStrokes(raw: unknown): number[][][] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  return raw as number[][][]
}
