import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, Link, Upload, X } from 'lucide-react'
import { SmartImage } from '@/components/ui/smart-image'
import { isImageSource } from '@/lib/media'
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'
import { useTranslation } from '@/data/translations'

export const CloudinaryUploadField = ({ label, value, onChange, allowEmpty = true, folder = 'le-matin' }: { label: string; value: string; onChange: (source: string) => void; allowEmpty?: boolean; folder?: string }) => {
  const { lang } = useTranslation()
  const text = (en: string, ar: string) => lang === 'ar' ? ar : en
  const id = useId()
  const [url, setUrl] = useState(value.startsWith('data:') ? '' : value)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const controller = useRef<AbortController>()
  const request = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => { setUrl(value.startsWith('data:') ? '' : value) }, [value])
  useEffect(() => () => { request.current++; controller.current?.abort() }, [])
  const apply = (source: string) => {
    try { onChange(source); setError('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : text('Unable to save image.', 'تعذر حفظ الصورة.')) }
  }
  const upload = async (file: File) => {
    if (busy) return
    const token = ++request.current
    controller.current = new AbortController()
    setBusy(true); setProgress(0); setError('')
    try { const source = await uploadToCloudinary(file, folder, setProgress, controller.current.signal); if (token === request.current) apply(source) }
    catch (cause) { if (token === request.current) setError(cause instanceof Error ? cause.message : 'Upload failed.') }
    finally { if (token === request.current) setBusy(false) }
  }
  return <fieldset onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void upload(file) }} data-dragging={dragging} className="min-w-0 space-y-3 rounded-2xl border-2 border-dashed border-[#D9C3A9] bg-cream p-4 data-[dragging=true]:bg-blush/40">
    <legend className="px-2 text-sm font-semibold">{label}</legend>
    {value ? <SmartImage photoId={value} alt={label} className="h-44 w-full" imgClassName="object-contain" /> : <div className="grid h-44 place-items-center rounded-2xl bg-blush/25 text-olive/60"><ImagePlus size={32} /></div>}
    <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blush/35 p-3 text-sm font-semibold disabled:opacity-50"><Upload size={17} />{text('Upload image file', 'رفع صورة من الجهاز')}</button>
    <input ref={fileInput} tabIndex={-1} id={id} aria-label={`${label} — ${text('Upload image file', 'رفع صورة')}`} type="file" accept="image/*" disabled={busy} className="sr-only" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''
      if (!file) return
      void upload(file)
    }} />
    <label className="block text-xs font-semibold"><span className="flex items-center gap-2"><Link size={14} />{text('Direct image URL', 'رابط الصورة المباشر')}</span>
      <input aria-label={`${label} URL`} type="text" inputMode="url" dir="ltr" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" disabled={busy} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3 text-sm" />
    </label>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={() => { const source = url.trim(); if (!source || !isImageSource(source)) { setError(text('Enter an HTTPS image URL or a local asset path.', 'أدخل رابط صورة HTTPS أو مسار صورة محلية.')); return } apply(source) }} className="rounded-full bg-olive px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50">{text('Use URL', 'استخدام الرابط')}</button>
      {value && allowEmpty && <button type="button" disabled={busy} onClick={() => apply('')} className="flex items-center gap-1 rounded-full border border-kraft px-3 py-2 text-xs"><X size={14} />{text('Clear', 'إزالة')}</button>}

    </div>
    <p className="text-xs text-olive/70">{busy ? `${text('Uploading', 'جارٍ الرفع')}… ${progress}%` : isCloudinaryConfigured() ? text('Drop an image here · Up to 8 MB · Cloudinary upload', 'اسحب صورة هنا · حتى ٨ ميجابايت · رفع إلى Cloudinary') : text('Drop an image here · Local image storage until Cloudinary is configured.', 'اسحب صورة هنا · حفظ محلي حتى إعداد Cloudinary.')}</p>
    {busy && <progress aria-label={text('Upload progress', 'تقدم الرفع')} className="w-full accent-olive" value={progress} max={100} />}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </fieldset>
}
