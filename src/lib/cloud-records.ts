import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { galleryItemSchema, useGalleryStore } from '@/stores/gallery-store'
import { settingsSchema } from '@/lib/settings-schema'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { localizeBox, localizeItem, localizeCategory, localizeComponentName } from '@/data/translations'

export type Row = Record<string, unknown> & { id: string }
export const TABLES = ['box_categories', 'items', 'boxes', 'box_components', 'swap_options', 'gallery_items'] as const
export type Catalog = Record<typeof TABLES[number], Row[]>
export const snake = (key: string) => key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`).replace(/image(\d)/, 'image_$1')
/** Stable namespace mapping keeps existing local slug references compatible with UUID foreign keys. */
export const cloudId = (value: string): string => {
  if (/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)) return value
  const words = [2166136261, 2246822507, 3266489909, 668265263].map(seed => {
    let hash = seed
    for (const char of `le-matin:${value}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    return (hash >>> 0).toString(16).padStart(8, '0')
  }).join('')
  return `${words.slice(0, 8)}-${words.slice(8, 12)}-5${words.slice(13, 16)}-a${words.slice(17, 20)}-${words.slice(20)}`
}
export const catalogSnapshot = (): Catalog => {
  const state = useBoxBuilderStore.getState()
  const base = <T extends { id: string }>(row: T) => ({ ...row, id: cloudId(row.id), local_id: row.id })
  return {
    box_categories: state.categories.map(row => {
      const enName = row.name_en || row.name
      return { ...base(row), name: enName, description: row.description ?? null, name_en: enName, name_ar: row.name_ar || localizeCategory(row, 'ar').name }
    }),
    items: state.items.map(row => {
      const enName = row.name_en || row.name
      return { ...base(row), name: enName, description: row.description ?? null, image_url: row.image_url ?? null, name_en: enName, name_ar: row.name_ar || localizeItem(row, 'ar').name }
    }),
    boxes: state.boxes.map(row => {
      const enName = row.name_en || row.name
      const enDesc = row.description_en || row.description
      return { ...base(row), name: enName, description: enDesc, category_id: row.category_id ? cloudId(row.category_id) : null, name_en: enName, name_ar: row.name_ar || localizeBox(row, 'ar').name, description_en: enDesc, description_ar: row.description_ar || localizeBox(row, 'ar').description }
    }),
    box_components: state.components.map(row => {
      const enName = row.name_en || row.name
      return { ...base(row), name: enName, box_id: cloudId(row.box_id), default_item_id: cloudId(row.default_item_id), name_en: enName, name_ar: row.name_ar || localizeComponentName(row, 'ar') }
    }),
    swap_options: state.swapOptions.map(row => ({ ...base(row), component_id: cloudId(row.component_id), item_id: cloudId(row.item_id) })),
    gallery_items: useGalleryStore.getState().items.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [snake(key), value])) as Row),
  }
}
export const catalogChanges = (before: Catalog, after: Catalog) => {
  const upserts: Partial<Catalog> = {}, deletes: Record<string, string[]> = {}
  for (const table of TABLES) {
    const previous = new Map(before[table].map(row => [row.id, JSON.stringify(row)]))
    const next = new Set(after[table].map(row => row.id))
    const changed = after[table].filter(row => previous.get(row.id) !== JSON.stringify(row))
    const removed = before[table].filter(row => !next.has(row.id)).map(row => row.id)
    if (changed.length) upserts[table] = changed
    if (removed.length) deletes[table] = removed
  }
  return Object.keys(upserts).length || Object.keys(deletes).length ? { upserts, deletes } : null
}
export const hydrateCatalog = (data: Catalog) => {
  const idMap = new Map(TABLES.flatMap(table => data[table].map(row => [row.id, String(row.local_id || row.id)] as const)))
  const map = (row: Row) => {
    const result: Row = { ...row, id: idMap.get(row.id) || row.id }
    for (const key of ['category_id', 'box_id', 'default_item_id', 'component_id', 'item_id']) if (result[key]) result[key] = idMap.get(String(result[key])) || result[key]
    if (typeof row.name_en === 'string' && row.name_en) result.name = row.name_en
    if (typeof row.description_en === 'string' && row.description_en) result.description = row.description_en
    delete result.local_id
    delete result.created_at
    delete result.updated_at
    return result
  }
  // Server schema is the type boundary; keep local action functions intact.
  useBoxBuilderStore.setState({ categories: data.box_categories.map(map), items: data.items.map(map), boxes: data.boxes.map(map), components: data.box_components.map(map), swapOptions: data.swap_options.map(map) } as unknown as Partial<ReturnType<typeof useBoxBuilderStore.getState>>)
  hydrateGallery(data.gallery_items)
}
export const hydrateGallery = (rows: Row[]) => useGalleryStore.getState().replaceShared(rows.map(row => galleryItemSchema.parse(Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()), value])))))
export const publicSettings = () => settingsSchema.parse(useSiteSettingsStore.getState())
export const settingsRow = () => ({ id: 1, config: publicSettings(), ...Object.fromEntries(Object.entries(publicSettings()).map(([key, value]) => [snake(key), value])) })
