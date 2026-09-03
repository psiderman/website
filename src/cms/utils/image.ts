export async function convertToSquareWebp(file: File, size = 400, quality = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  const minDim = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - minDim) / 2
  const sy = (bitmap.height - minDim) / 2
  ctx.drawImage(bitmap, sx, sy, minDim, minDim, 0, 0, size, size)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas conversion failed'))
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }))
      },
      'image/webp',
      quality,
    )
  })
}
