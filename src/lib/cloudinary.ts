import { Cloudinary } from '@cloudinary/url-gen'
import { integrationConfig } from '@/lib/supabase'
import { readImageFile } from '@/lib/media'
import { useCloudSyncStore } from '@/stores/cloud-sync-store'

export const isCloudinaryConfigured = () => {
  const { cloudinaryCloudName: name, cloudinaryUploadPreset: preset } = integrationConfig()
  return Boolean(name && preset && name !== 'your-cloud-name' && preset !== 'your-unsigned-preset')
}
export const uploadToCloudinary = (file: File, folder = 'le-matin', onProgress?: (percent: number) => void, signal?: AbortSignal): Promise<string> => {
  if (!file.type.startsWith('image/')) return Promise.reject(new Error('Choose an image file.'))
  if (file.size > 8 * 1024 * 1024) return Promise.reject(new Error('Choose an image smaller than 8 MB.'))
  if (!isCloudinaryConfigured()) return readImageFile(file).then(source => { onProgress?.(100); return source })
  const { cloudinaryCloudName, cloudinaryUploadPreset } = integrationConfig()
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('Upload cancelled.')); return }
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudinaryCloudName)}/image/upload`)
    xhr.timeout = 120000
    const data = new FormData()
    data.append('file', file); data.append('upload_preset', cloudinaryUploadPreset)
    if (folder) data.append('folder', folder)
    const abort = () => xhr.abort()
    signal?.addEventListener('abort', abort, { once: true })
    const cleanup = () => signal?.removeEventListener('abort', abort)
    const fail = (message: string) => { cleanup(); useCloudSyncStore.setState({ cloudinary: 'error' }); reject(new Error(message)) }
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 95)) }
    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText)
        if (xhr.status < 200 || xhr.status >= 300 || !/^https:\/\//.test(result.secure_url ?? '')) { fail(result.error?.message || 'Cloudinary rejected this upload. Check the unsigned preset.'); return }
        cleanup(); onProgress?.(100); useCloudSyncStore.setState({ cloudinary: 'connected' }); resolve(result.secure_url)
      } catch { fail('Cloudinary returned an invalid upload response.') }
    }
    xhr.onerror = () => fail('Upload failed. Check your connection and try again.')
    xhr.ontimeout = () => fail('Upload timed out. Try a smaller image or retry.')
    xhr.onabort = () => { cleanup(); useCloudSyncStore.setState({ cloudinary: 'configured' }); reject(new Error('Upload cancelled.')) }
    useCloudSyncStore.setState({ cloudinary: 'uploading' }); onProgress?.(0); xhr.send(data)
  })
}
/** Preserve external, signed, and already transformed URLs instead of corrupting them. */
export const getOptimizedImageUrl = (url: string, options: { width?: number; height?: number } = {}) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== 'res.cloudinary.com' || parsed.protocol !== 'https:') return url
    const match = parsed.pathname.match(/^\/([^/]+)\/image\/upload\/(.+)$/)
    if (!match || match[2].startsWith('s--') || parsed.search) return url
    let path = match[2]
    const version = path.match(/^v(\d+)\//)
    if (!version && /^(?:[a-z]{1,3}_|t_)/.test(path)) return url
    if (version) path = path.slice(version[0].length)
    const cld = new Cloudinary({ cloud: { cloudName: match[1] }, url: { secure: true } })
    const image = cld.image(path).format('auto').quality('auto')
    if (version) image.setVersion(Number(version[1]))
    const width = options.width ? Math.max(1, Math.min(4000, Math.round(options.width))) : undefined
    const height = options.height ? Math.max(1, Math.min(4000, Math.round(options.height))) : undefined
    if (width || height) image.addTransformation(`c_limit${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''}`)
    return image.toURL()
  } catch { return url }
}
