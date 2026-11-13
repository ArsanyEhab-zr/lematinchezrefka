import { SmartImage } from '@/components/ui/smart-image'
import { GALLERY_ASPECTS } from '@/stores/gallery-store'
import { useState, type FormEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ArrowUp, ArrowDown, Trash2, ImagePlus } from 'lucide-react'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { CmsPublishing } from '@/components/admin/CmsPublishing'
import { useGalleryStore, galleryItemSchema, type GalleryDraft, type GalleryItem } from '@/stores/gallery-store'
import { publishGallery } from '@/lib/gallery-sync'
import { useTranslation } from '@/data/translations'
import { Button } from '@/components/ui/button'

const blank: GalleryDraft = { imageUrl: '', titleEn: '', titleAr: '', tagEn: '', tagAr: '', aspectRatio: 'tall', isVisible: true }
const GalleryEditor = ({ item, onSave, onCancel }: { item?: GalleryItem; onSave: (draft: GalleryDraft) => void; onCancel?: () => void }) => {
  const [draft, setDraft] = useState<GalleryDraft>(item ?? blank)
  const [error, setError] = useState('')
  const { lang } = useTranslation()
  const text = (en: string, ar: string) => lang === 'ar' ? ar : en
  const change = (patch: Partial<GalleryDraft>) => setDraft(previous => ({ ...previous, ...patch }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const valid = galleryItemSchema.safeParse({ ...draft, id: item?.id ?? '00000000-0000-4000-8000-000000000001', displayOrder: 0 })
    if (!valid.success) { setError(text('Choose a photo and enter both English and Arabic titles.', 'اختر صورة وأدخل العنوان بالعربية والإنجليزية.')); return }
    const { id: _id, displayOrder: _order, ...photo } = valid.data
    try { onSave(photo); if (!item) setDraft(blank); setError('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save photo.') }
  }
  return <form onSubmit={submit} className="space-y-5">
    <MediaPicker label={text('Order photo', 'صورة الطلب')} value={draft.imageUrl} onChange={imageUrl => change({ imageUrl })} allowEmpty />
    <div className="grid gap-4 sm:grid-cols-2">{(['titleEn', 'titleAr', 'tagEn', 'tagAr'] as const).map(key => <label className="min-w-0 text-sm font-semibold" key={key}>{({ titleEn: text('Title · English', 'العنوان · الإنجليزية'), titleAr: text('Title · Arabic', 'العنوان · العربية'), tagEn: text('Tag · English', 'الوسم · الإنجليزية'), tagAr: text('Tag · Arabic', 'الوسم · العربية') })[key]}<input required={key.startsWith('title')} maxLength={key.startsWith('title') ? 200 : 100} dir={key.endsWith('Ar') ? 'rtl' : 'ltr'} value={draft[key]} onChange={event => change({ [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3" /></label>)}</div>
    <label className="block text-sm font-semibold">{text('Card shape', 'شكل البطاقة')}<select aria-label={text('Card shape', 'شكل البطاقة')} value={draft.aspectRatio} onChange={event => change({ aspectRatio: event.target.value as GalleryDraft['aspectRatio'] })} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3"><option value="tall">{text('Tall', 'طويلة')}</option><option value="square">{text('Square', 'مربعة')}</option><option value="wide">{text('Wide', 'عريضة')}</option></select></label>
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#3E422B]" checked={draft.isVisible} onChange={event => change({ isVisible: event.target.checked })} />{text('Visible on Home', 'ظاهرة في الرئيسية')}</label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-3"><Button variant="cta" type="submit">{item ? text('Save photo', 'حفظ الصورة') : text('Add to Homepage Gallery', 'إضافة إلى معرض الرئيسية')}</Button>{onCancel && <Button type="button" variant="outline" onClick={onCancel}>{text('Cancel', 'إلغاء')}</Button>}</div>
  </form>
}

export const AdminGalleryManager = () => {
  const { items, dirty, addItem, updateItem, removeItem, moveItem } = useGalleryStore(useShallow(s => ({ items: s.items, dirty: s.hasUnpublishedChanges, addItem: s.addItem, updateItem: s.updateItem, removeItem: s.removeItem, moveItem: s.moveItem })))
  const { lang } = useTranslation()
  const text = (en: string, ar: string) => lang === 'ar' ? ar : en
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const act = (action: () => void) => { try { action(); setStatus(text('Gallery saved.', 'تم حفظ المعرض.')) } catch (cause) { setStatus(cause instanceof Error ? cause.message : 'Unable to save gallery.') } }
  return <div className="space-y-8 pb-10">
    <div><p className="text-sm font-semibold text-gold">Le Matin · {text('Morning memories', 'ذكريات الصباح')}</p><h1 className="mt-2 font-display text-3xl font-bold">{text('Best Orders Gallery', 'معرض أجمل الطلبات')}</h1><p className="mt-3 text-sm text-olive/75">{text('Curate the photos, bilingual captions, and rhythm of your homepage gallery.', 'اختر صور المعرض وعناوينها بالعربية والإنجليزية ورتّب إطلالتها على الصفحة الرئيسية.')}</p></div>
    <CmsPublishing dirty={dirty} publish={publishGallery} />
    <section className="rustic-card p-5 sm:p-8"><h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold"><ImagePlus className="text-gold" />{text('Add New Order Photo', 'إضافة صورة طلب جديدة')}</h2><GalleryEditor onSave={draft => { addItem(draft); setStatus(text('Photo added to gallery.', 'أُضيفت الصورة إلى المعرض.')) }} /></section>
    <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-display text-2xl font-bold">{text('Gallery collection', 'صور المعرض')} <span className="text-base text-gold">({items.length})</span></h2><p role="status" aria-live="polite" className="text-sm">{status}</p></div>
    {items.length === 0 && <p className="rustic-card p-8 text-center">{text('Your gallery is empty. Add the first morning memory above.', 'المعرض فارغ. أضف أول صورة للصباح من الأعلى.')}</p>}
    <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => <article key={item.id} className="rustic-card min-w-0 space-y-4 p-4" data-gallery-id={item.id}>
      {editing === item.id ? <GalleryEditor key={item.id} item={item} onSave={draft => { updateItem(item.id, draft); setEditing(null) }} onCancel={() => setEditing(null)} /> : <>
        <GalleryThumbnail item={item} />
        <div><h3 className="font-display text-lg font-bold">{lang === 'ar' ? item.titleAr : item.titleEn}</h3><p className="mt-1 text-xs text-olive/70">{lang === 'ar' ? item.tagAr : item.tagEn}</p></div>
        <label className="flex items-center justify-between gap-3 rounded-xl bg-blush/25 p-3 text-sm"><span>{item.isVisible ? text('Visible on Home', 'ظاهرة في الرئيسية') : text('Hidden', 'مخفية')}</span><input aria-label={`${text('Visibility', 'الظهور')}: ${item.titleEn}`} role="switch" type="checkbox" checked={item.isVisible} onChange={event => act(() => updateItem(item.id, { isVisible: event.target.checked }))} className="h-5 w-5 accent-[#3E422B]" /></label>
        <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setEditing(item.id)}>{text('Edit photo', 'تعديل الصورة')}</Button><button type="button" disabled={index === 0} aria-label={`${text('Move up', 'نقل لأعلى')}: ${item.titleEn}`} className="rounded-xl border border-kraft p-3 disabled:opacity-30" onClick={() => act(() => moveItem(item.id, -1))}><ArrowUp size={16} /></button><button type="button" disabled={index === items.length - 1} aria-label={`${text('Move down', 'نقل لأسفل')}: ${item.titleEn}`} className="rounded-xl border border-kraft p-3 disabled:opacity-30" onClick={() => act(() => moveItem(item.id, 1))}><ArrowDown size={16} /></button><button type="button" aria-label={`${text('Delete photo', 'حذف الصورة')}: ${item.titleEn}`} className="rounded-xl border border-kraft p-3" onClick={() => setDeleting(item.id)}><Trash2 size={16} /></button></div>
        {deleting === item.id && <div className="rounded-xl bg-blush/50 p-3 text-sm"><p>{text('Remove this photo from the gallery?', 'هل تريد حذف هذه الصورة من المعرض؟')}</p><div className="mt-3 flex gap-4"><button type="button" className="font-bold" onClick={() => act(() => { removeItem(item.id); setDeleting(null) })}>{text('Delete photo', 'حذف الصورة')}</button><button type="button" onClick={() => setDeleting(null)}>{text('Keep photo', 'الاحتفاظ بالصورة')}</button></div></div>}
      </>}
    </article>)}</div>
  </div>
}
const GalleryThumbnail = ({ item }: { item: GalleryItem }) => <SmartImage photoId={item.imageUrl} alt={item.titleEn} className={`${GALLERY_ASPECTS[item.aspectRatio]} w-full`} />
