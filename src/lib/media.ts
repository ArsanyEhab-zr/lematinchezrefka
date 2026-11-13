/** Media sources are either public HTTPS URLs, local assets, or decoded raster uploads. */
export const isImageSource = (value: string): boolean => {
  if (!value) return true
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return true
  if (/^data:image\/(png|jpeg|webp|gif|x-icon|vnd.microsoft.icon);base64,[A-Za-z0-9+/]+=*$/.test(value)) return true
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

export const assertLocalSave = (key: string, state: unknown) => {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify({ state, version: 0 })) }
  catch { throw new Error('Browser storage is full or unavailable. Use a hosted image URL or upload to shared storage, then try again.') }
}

/** Resize before persisting; WebP preserves transparent logos and keeps browser storage usable. */
export const readImageFile = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Choose an image smaller than 8 MB.')
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error('This image could not be decoded. Try PNG, JPEG, or WebP.') })
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image processing is unavailable in this browser.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/webp', 0.82)
    if (dataUrl.length > 650_000) throw new Error('This image is too detailed for local storage. Use a smaller image or a hosted URL.')
    return dataUrl
  } finally { bitmap.close() }
}
