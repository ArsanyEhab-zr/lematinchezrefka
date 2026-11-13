import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { GALLERY } from '@/data/gallery'
import { TRANSLATIONS } from '@/data/translations'
import { unsplashSrc } from '@/lib/images'
import { assertLocalSave, isImageSource } from '@/lib/media'

export const galleryItemSchema = z.object({
  id: z.string().uuid(), imageUrl: z.string().min(1).refine(isImageSource),
  titleEn: z.string().trim().min(1).max(200), titleAr: z.string().trim().min(1).max(200),
  tagEn: z.string().max(100), tagAr: z.string().max(100),
  aspectRatio: z.enum(['tall', 'square', 'wide']), isVisible: z.boolean(), displayOrder: z.number().int().min(0),
})
export type GalleryItem = z.infer<typeof galleryItemSchema>
export type GalleryDraft = Omit<GalleryItem, 'id' | 'displayOrder'>
export const GALLERY_ASPECTS = { tall: 'aspect-[3/4]', square: 'aspect-square', wide: 'aspect-[4/3]' } as const
export const SEED_GALLERY: GalleryItem[] = GALLERY.map((shot, index) => ({
  id: `00000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, '0')}`,
  imageUrl: unsplashSrc(shot.photoId, 1200), titleEn: shot.caption, titleAr: TRANSLATIONS.ar.gallery.captions[index],
  tagEn: shot.occasion, tagAr: TRANSLATIONS.ar.gallery.occasions[index],
  aspectRatio: shot.aspect === 'aspect-square' ? 'square' : shot.aspect === 'aspect-[4/3]' ? 'wide' : 'tall',
  isVisible: true, displayOrder: index,
}))
export const normalizeGallery = (items: GalleryItem[]) => [...items].sort((a, b) => a.displayOrder - b.displayOrder).map((item, displayOrder) => ({ ...item, displayOrder }))
interface GalleryState {
  items: GalleryItem[]
  hasUnpublishedChanges: boolean
  revision: number
  addItem: (draft: GalleryDraft) => void
  updateItem: (id: string, patch: Partial<GalleryDraft>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, direction: -1 | 1) => void
  replaceShared: (items: GalleryItem[]) => void
}
export const useGalleryStore = create<GalleryState>()(persist((set, get) => {
  const commit = (items: GalleryItem[]) => {
    const valid = z.array(galleryItemSchema).parse(normalizeGallery(items))
    const next = { items: valid, hasUnpublishedChanges: true, revision: get().revision + 1 }
    assertLocalSave('le-matin-gallery', next)
    set(next)
  }
  return {
    items: SEED_GALLERY, hasUnpublishedChanges: false, revision: 0,
    addItem: draft => commit([...get().items, { ...draft, id: crypto.randomUUID(), displayOrder: get().items.length }]),
    updateItem: (id, patch) => commit(get().items.map(item => item.id === id ? { ...item, ...patch } : item)),
    removeItem: id => commit(get().items.filter(item => item.id !== id)),
    moveItem: (id, direction) => {
      const items = normalizeGallery(get().items)
      const index = items.findIndex(item => item.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= items.length) return
      ;[items[index], items[target]] = [items[target], items[index]]
      commit(items.map((item, displayOrder) => ({ ...item, displayOrder })))
    },
    replaceShared: items => set({ items: normalizeGallery(items), hasUnpublishedChanges: false }),
  }
}, { name: 'le-matin-gallery', storage: createJSONStorage(() => localStorage), partialize: state => ({ items: state.items, hasUnpublishedChanges: state.hasUnpublishedChanges, revision: state.revision }) }))
