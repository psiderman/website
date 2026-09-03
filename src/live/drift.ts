import { activeUserId } from './identity'
import { cursors, LIVE_CONFIG } from './state'

const driftOffsets = new Map<string, { x: number; y: number }>()
const driftEls = new Map<string, HTMLElement>()
let driftRaf = 0
let driftInterval: null | ReturnType<typeof setInterval> = null

const driftLoop = () => {
  for (const [id, el] of driftEls) {
    const offset = driftOffsets.get(id)
    if (offset) el.style.transform = `translate(${offset.x}px, ${offset.y}px)`
  }
  if (driftEls.size > 0) {
    driftRaf = requestAnimationFrame(driftLoop)
  } else {
    driftRaf = 0
  }
}

export function clearDriftOffsets() {
  driftOffsets.clear()
}

export function registerDriftEl(id: string, el: HTMLElement) {
  driftEls.set(id, el)
  if (driftRaf === 0) driftRaf = requestAnimationFrame(driftLoop)
}

export function unregisterDriftEl(id: string) {
  driftEls.delete(id)
  if (driftEls.size === 0 && driftRaf !== 0) {
    cancelAnimationFrame(driftRaf)
    driftRaf = 0
  }
}

const computeDrift = () => {
  const now = Date.now()
  for (const id in cursors.value) {
    if (id === activeUserId.value) continue

    const c = cursors.value[id]
    if (now - c.updatedAt > LIVE_CONFIG.CURSOR_STALE_MS) continue // Don't drift if stale

    // Generate a pseudo-random seed from the ID so each cursor floats differently
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)

    // Different phase offsets and slight speed variations
    const phaseX = hash % 100
    const phaseY = (hash >> 4) % 100
    const speedX = 0.0008 + (hash % 10) * 0.00005
    const speedY = 0.0009 + ((hash >> 2) % 10) * 0.00005

    // Smooth, continuous organic floating (max +/- 12px)
    driftOffsets.set(id, {
      x: Math.sin(now * speedX + phaseX) * 12,
      y: Math.cos(now * speedY + phaseY) * 12,
    })
  }
}

export function startDrift() {
  if (driftInterval) return
  driftInterval = setInterval(computeDrift, 50)
}

export function stopDrift() {
  if (driftInterval) {
    clearInterval(driftInterval)
    driftInterval = null
  }
  driftEls.clear()
  driftOffsets.clear()
  if (driftRaf !== 0) {
    cancelAnimationFrame(driftRaf)
    driftRaf = 0
  }
}
