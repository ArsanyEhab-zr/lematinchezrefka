import assert from 'node:assert/strict'
import { SEED_GALLERY, useGalleryStore, galleryItemSchema } from '../src/stores/gallery-store'
import { useSiteSettingsStore, DEFAULT_SITE_SETTINGS } from '../src/stores/site-settings-store'
import { isImageSource } from '../src/lib/media'
import { settingsSchema } from '../src/lib/site-settings-sync'

assert.equal(SEED_GALLERY.length, 12)
assert.equal(new Set(SEED_GALLERY.map(item => item.id)).size, 12)
assert.ok(SEED_GALLERY.every(item => galleryItemSchema.safeParse(item).success && item.titleAr && item.titleEn))
assert.ok(isImageSource('https://example.com/photo.png'))
assert.ok(isImageSource('/favicon.svg'))
assert.ok(isImageSource('data:image/png;base64,AA=='))
assert.equal(isImageSource('javascript:alert(1)'), false)
assert.equal(isImageSource('//untrusted.example/image.png'), false)
assert.equal(isImageSource('data:text/html;base64,AA=='), false)
assert.equal(isImageSource('data:image/svg+xml;base64,AA=='), false)
assert.ok(settingsSchema.safeParse({ ...DEFAULT_SITE_SETTINGS, whatsappNumber: '', contactEmail: '', tiktokUrl: '' }).success)
assert.equal(settingsSchema.safeParse({ ...DEFAULT_SITE_SETTINGS, logoDisplayMode: 'unsupported' }).success, false)
assert.equal(settingsSchema.safeParse({ ...DEFAULT_SITE_SETTINGS, contactEmail: 'wrong' }).success, false)
const original = useGalleryStore.getState().items
useGalleryStore.getState().addItem({ imageUrl: 'https://example.com/photo.png', titleEn: 'Breakfast for two', titleAr: 'فطار الكابلز', tagEn: 'Weekend', tagAr: 'نهاية الأسبوع', aspectRatio: 'wide', isVisible: true })
const added = useGalleryStore.getState().items.at(-1)!
assert.equal(added.displayOrder, 12)
useGalleryStore.getState().updateItem(added.id, { titleEn: 'Edited breakfast', aspectRatio: 'square' })
assert.equal(useGalleryStore.getState().items.at(-1)?.displayOrder, 12)
useGalleryStore.getState().moveItem(added.id, -1)
assert.equal(useGalleryStore.getState().items[11].id, added.id)
useGalleryStore.getState().updateItem(added.id, { isVisible: false })
assert.equal(useGalleryStore.getState().items.filter(item => item.isVisible).length, 12)
const beforeQuotaFailure = useGalleryStore.getState().items
const setItem = localStorage.setItem
localStorage.setItem = () => { throw new Error('Quota exceeded') }
assert.throws(() => useGalleryStore.getState().removeItem(added.id), /storage/)
assert.equal(useGalleryStore.getState().items, beforeQuotaFailure)
const previousLogo = useSiteSettingsStore.getState().logoUrl
assert.throws(() => useSiteSettingsStore.getState().updateCmsSettings({ logoUrl: 'https://example.com/logo.png' }), /storage/)
assert.equal(useSiteSettingsStore.getState().logoUrl, previousLogo)
localStorage.setItem = setItem
useGalleryStore.getState().removeItem(added.id)
assert.equal(useGalleryStore.getState().items.length, 12)
assert.deepEqual(useGalleryStore.getState().items.map(item => item.displayOrder), Array.from({ length: 12 }, (_, index) => index))
useGalleryStore.getState().replaceShared(original)
console.log('Passed: seeded bilingual gallery, source validation, add/edit/reorder/hide/delete, blank channels, storage-quota rollback.')
