import { ref } from 'vue'

const photoRotations = ref<number[]>([])

export function getPhotoRotation(imgIndex: number): number {
  if (photoRotations.value[imgIndex] !== undefined) {
    return photoRotations.value[imgIndex]
  }
  const sign = Math.random() < 0.5 ? -1 : 1
  const magnitude = 1 + Math.random() * 2.5
  const rot = Number((sign * magnitude).toFixed(1))
  photoRotations.value[imgIndex] = rot
  return rot
}

export function resetRotations(count: number) {
  photoRotations.value = Array.from({ length: count }, () => {
    const sign = Math.random() < 0.5 ? -1 : 1
    const magnitude = 1 + Math.random() * 2.5
    return Number((sign * magnitude).toFixed(1))
  })
}
