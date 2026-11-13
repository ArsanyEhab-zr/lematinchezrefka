import { useEffect, useRef, useState } from 'react'
import { Heart, Sparkles, X } from 'lucide-react'
import { useTranslation } from '@/data/translations'
import { useGalleryStore, GALLERY_ASPECTS, type GalleryItem } from '@/stores/gallery-store'
import { SmartImage } from '@/components/ui/smart-image'
import { cn } from '@/lib/utils'

export const MasonryGrid = () => {
  const { t, lang } = useTranslation()
  const items = useGalleryStore(state => state.items)
  const visible = items.filter(item => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder)
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = visible.find(item => item.id === activeId)
  const dialog = useRef<HTMLDialogElement>(null)
  const caption = (item: GalleryItem) => lang === 'ar' ? item.titleAr : item.titleEn
  const tag = (item: GalleryItem) => lang === 'ar' ? item.tagAr : item.tagEn
  useEffect(() => {
    if (active && !dialog.current?.open) dialog.current?.showModal()
    if (!active && dialog.current?.open) dialog.current.close()
    if (!active && activeId) setActiveId(null)
  }, [active, activeId])
  if (visible.length === 0) return null
  return <div className="w-full">
    <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">{visible.map(item => <article key={item.id} data-gallery-id={item.id} className="group relative break-inside-avoid overflow-hidden rounded-2xl border-2 border-dashed border-[#D9C3A9] bg-cream shadow-md transition-colors hover:border-gold">
      <div className={cn('relative overflow-hidden', GALLERY_ASPECTS[item.aspectRatio])}>
        <SmartImage photoId={item.imageUrl} alt={caption(item)} className="h-full w-full" imgClassName="group-hover:scale-105" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-olive/90 via-olive/20 to-transparent p-5 text-cream transition-opacity sm:bg-blush/90 sm:bg-none sm:text-olive sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {tag(item) && <span className="inline-flex items-center gap-2 self-start rounded-full bg-cream px-3 py-1 text-xs font-semibold text-olive"><Sparkles size={14} className="text-gold" />{tag(item)}</span>}
          <h3 className="mt-3 font-display text-lg font-bold text-inherit">{caption(item)}</h3>
          <button type="button" onClick={() => setActiveId(item.id)} className="mt-3 inline-flex items-center gap-2 self-start rounded-full bg-cream px-4 py-2 text-xs font-semibold text-olive"><Heart size={14} className="text-gold" />{t.gallery.view}<span className="sr-only"> · {caption(item)}</span></button>
        </div>
      </div>
    </article>)}</div>
    <dialog ref={dialog} onClose={() => setActiveId(null)} aria-label={active ? caption(active) : t.home.galleryTitle} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-2 border-dashed border-kraft bg-cream p-5 text-olive backdrop:bg-olive/80">
      {active && <><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label={t.common.close} className="mb-3 ms-auto grid h-10 w-10 place-items-center rounded-full bg-blush"><X size={20} /></button><SmartImage photoId={active.imageUrl} alt={caption(active)} className="h-[50vh] w-full" imgClassName="object-contain" /><p className="mt-4 text-xs font-semibold text-gold">{tag(active)}</p><h2 className="mt-2 font-display text-2xl font-bold">{caption(active)}</h2><p className="mt-3 text-sm">{t.gallery.description}</p></>}
    </dialog>
  </div>
}
