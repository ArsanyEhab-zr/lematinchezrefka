import { getSupabase, integrationConfig, isStaffSession, isSupabaseConfigured, requireSupabase } from '@/lib/supabase'
import { getAppTarget } from '@/lib/app-target'
import { catalogSnapshot, catalogChanges, hydrateCatalog, hydrateGallery, TABLES, publicSettings, settingsRow, snake, type Catalog, type Row } from '@/lib/cloud-records'
import { settingsSchema } from '@/lib/settings-schema'
import { useCloudSyncStore, type CloudMutation } from '@/stores/cloud-sync-store'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { useGalleryStore, galleryItemSchema } from '@/stores/gallery-store'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useKitchenStore } from '@/stores/kitchen-store'
import { isCloudinaryConfigured } from '@/lib/cloudinary'
import type { Order } from '@/data/orders'

let applying = false
let isHydrating = false
let flushPromise: Promise<void> | null = null
let refreshPromise: Promise<void> | null = null
let queuedRefresh = false
let syncSnapshot: (() => void) | null = null
let version = 0
const DELETE_ORDER = ['swap_options', 'box_components', 'boxes', 'items', 'box_categories', 'gallery_items'] as const
const ORDER_COLUMN: Record<typeof TABLES[number], string> = {
  box_categories: 'display_order',
  items: 'created_at',
  boxes: 'display_order',
  box_components: 'display_order',
  swap_options: 'created_at',
  gallery_items: 'display_order',
}
const TABLE_COLUMNS: Record<typeof TABLES[number], readonly string[]> = {
  box_categories: ['id', 'local_id', 'name', 'name_en', 'name_ar', 'description', 'display_order'],
  items: ['id', 'local_id', 'name', 'name_en', 'name_ar', 'category', 'description', 'image_url', 'is_available', 'is_sold_out'],
  boxes: ['id', 'local_id', 'category_id', 'name', 'name_en', 'name_ar', 'description', 'description_en', 'description_ar', 'base_price', 'image_url', 'is_active', 'is_sold_out', 'display_order'],
  box_components: ['id', 'local_id', 'box_id', 'name', 'name_en', 'name_ar', 'default_item_id', 'is_swappable', 'display_order'],
  swap_options: ['id', 'local_id', 'component_id', 'item_id', 'price_modifier'],
  gallery_items: ['id', 'image_url', 'title_en', 'title_ar', 'tag_en', 'tag_ar', 'aspect_ratio', 'is_visible', 'display_order'],
}
const fail = (cause: unknown) => useCloudSyncStore.setState({ supabase: 'error', message: cause instanceof Error ? cause.message : String(cause) })
const check = (error: { message: string } | null) => { if (error) throw new Error(error.message) }
const project = () => integrationConfig().supabaseUrl
const normalizeRows = (table: typeof TABLES[number], rows: Row[]) => {
  const allowed = TABLE_COLUMNS[table]
  const keys = allowed.filter(column => rows.some(row => column in row))
  return rows.map(row => Object.fromEntries(keys.map(key => [key, row[key] === undefined ? null : row[key]])))
}
const applyCatalogMutation = async (
  client: ReturnType<typeof requireSupabase>,
  changes: { upserts?: Partial<Catalog>; deletes?: Record<string, string[]> },
) => {
  const upserts = changes.upserts ?? {}
  const deletes = changes.deletes ?? {}
  for (const table of TABLES) {
    const rows = upserts[table]
    if (rows?.length) {
      check((await client.from(table).upsert(normalizeRows(table, rows), { onConflict: 'id' })).error)
    }
  }
  for (const table of DELETE_ORDER) {
    const ids = deletes[table]
    if (ids?.length) {
      check((await client.from(table).delete().in('id', ids)).error)
    }
  }
  if ([...Object.keys(upserts), ...Object.keys(deletes)].some(key => key !== 'gallery_items')) {
    check((await client.from('site_settings').update({ catalog_seeded: true }).eq('id', 1)).error)
  }
}
export const flushCloudChanges = () => {
  if (!getSupabase()) return Promise.resolve()
  if (flushPromise) return flushPromise
  const run = async () => {
    try {
      const client = requireSupabase(), target = project()
      const isStaff = await isStaffSession().catch(() => false)
      useCloudSyncStore.setState({ isStaff })
      if (!isStaff || getAppTarget() !== 'admin') return
      while (true) {
        const job = useCloudSyncStore.getState().queue.find(row => row.project === target)
        if (!job || job.attempts >= 3 || project() !== target) break
        try {
          if (job.kind === 'catalog') await applyCatalogMutation(client, job.payload as { upserts?: Partial<Catalog>; deletes?: Record<string, string[]> })
          if (job.kind === 'settings') check((await client.rpc('save_site_settings', { patch: job.payload })).error)
          if (job.kind === 'status') {
            const { data, error } = await client.from('orders').update({ status: job.payload.status }).eq('id', job.payload.id).select('id')
            check(error); if (!data?.length) throw new Error('Order status was not saved in Supabase.')
          }
          if (job.kind === 'delete_order') {
            check((await client.from('orders').delete().eq('id', job.payload.id)).error)
          }
          useCloudSyncStore.setState(state => ({ queue: state.queue.filter(row => row.id !== job.id), supabase: 'connected', message: '', lastSync: new Date().toISOString() }))
        } catch (cause) {
          useCloudSyncStore.setState(state => ({ queue: state.queue.map(row => row.id === job.id ? { ...row, attempts: row.attempts + 1 } : row) }))
          throw cause
        }
      }
      if (!useCloudSyncStore.getState().queue.some(row => row.project === target)) {
        useGalleryStore.setState({ hasUnpublishedChanges: false })
        useSiteSettingsStore.setState({ hasUnpublishedMedia: false })
      }
    } catch (cause) { fail(cause) } finally { flushPromise = null }
  }
  flushPromise = run()
  return flushPromise
}
export const retryCloudChanges = async () => {
  await flushCloudChanges()
  useCloudSyncStore.setState(state => ({ queue: state.queue.map(row => ({ ...row, attempts: 0 })) }))
  await flushCloudChanges()
  if (useCloudSyncStore.getState().queue.some(row => row.project === project())) throw new Error(useCloudSyncStore.getState().message || 'Could not sync pending edits to Supabase.')
}
export const refreshCloud = (force = false): Promise<void> => {
  const client = getSupabase()
  if (!client) { useCloudSyncStore.setState({ supabase: 'local', isStaff: false }); return Promise.resolve() }
  if (refreshPromise) {
    if (force) {
      return refreshPromise.catch(() => {}).then(() => refreshCloud(true))
    }
    queuedRefresh = true
    return refreshPromise
  }
  const run = async () => {
    if (flushPromise && !force) await flushPromise
    const started = version, target = project()
    try {
      const isStaff = await isStaffSession().catch(() => false)
      useCloudSyncStore.setState({ isStaff, ...(useCloudSyncStore.getState().supabase === 'local' ? { supabase: 'checking' as const } : {}) })
      const results = await Promise.all(
        TABLES.map(table => client.from(table).select('*').order(ORDER_COLUMN[table], { ascending: true }).order('id', { ascending: true })),
      )
      for (const result of results) check(result.error)
      const settings = await client.from('site_settings').select('*').eq('id', 1).single(); check(settings.error)
      const shouldFetchOrders = isStaff && getAppTarget() === 'admin'
      const orders = shouldFetchOrders
        ? await client.from('orders').select('*').order('created_at', { ascending: false }).limit(500)
        : { data: null, error: null }
      check(orders.error)
      if (!force && (version !== started || project() !== target)) return
      const boxState = useBoxBuilderStore.getState()
      const localCatalogEmpty = boxState.categories.length === 0 && boxState.boxes.length === 0
      const hasActiveOutbox = useCloudSyncStore.getState().queue.some(row => row.project === target && row.attempts < 3)
      if (!force && hasActiveOutbox && !localCatalogEmpty) return
      applying = true
      isHydrating = true
      try {
        const data = Object.fromEntries(TABLES.map((table, index) => [table, results[index].data as Row[]])) as Catalog
        const cloudHasCatalog = Boolean(
          data.box_categories.length ||
          data.boxes.length ||
          data.items.length ||
          data.box_components.length ||
          data.swap_options.length,
        )
        // Only overwrite the catalog store when Supabase holds catalog records; empty DB stays gallery-only until seeded.
        if (cloudHasCatalog) hydrateCatalog(data)
        else hydrateGallery(data.gallery_items)
        const row = settings.data
        const values = settingsSchema.parse(Object.fromEntries(Object.entries(publicSettings()).map(([key, fallback]) => [key, row[snake(key)] ?? row.config?.[key] ?? fallback])))
        useSiteSettingsStore.getState().applyGlobalSettings(values)
        useSiteSettingsStore.setState({ hasUnpublishedMedia: false })
        useGalleryStore.setState({ hasUnpublishedChanges: false })
        if (orders.data !== null) useKitchenStore.setState({ orders: orders.data.map(orderFromRow) })
        syncSnapshot?.()
        useCloudSyncStore.setState({ supabase: 'connected', message: '', lastSync: new Date().toISOString() })
      } finally {
        applying = false
        isHydrating = false
      }
    } catch (cause) { fail(cause); throw cause } finally {
      refreshPromise = null
      if (queuedRefresh) {
        queuedRefresh = false
        queueMicrotask(() => { void refreshCloud(false).catch(() => {}) })
      }
    }
  }
  refreshPromise = run()
  return refreshPromise
}
export const forceCloudSync = async () => {
  const target = project()
  version++
  useCloudSyncStore.getState().clearQueue(target)
  if (isSupabaseConfigured()) useCloudSyncStore.setState({ supabase: 'checking', message: '' })
  if (flushPromise) await flushPromise.catch(() => {})
  await refreshCloud(true)
}
export const orderFromRow = (row: Record<string, unknown>): Order => {
  const payload = (row.items_json && typeof row.items_json === 'object' ? row.items_json : {}) as Partial<Omit<Order, 'id' | 'status' | 'createdAt'>>
  const giftNote = typeof row.gift_card_note === 'string' && row.gift_card_note.trim() ? row.gift_card_note.trim() : payload.giftMessage
  const rawNote = typeof payload.note === 'string' && payload.note.trim() ? payload.note.trim() : undefined
  const totalFromRow = typeof row.total_price === 'number' ? row.total_price : Number(row.total_price ?? 0)
  const deliveryFromRow = typeof row.delivery_fee === 'number' ? row.delivery_fee : Number(row.delivery_fee ?? 0)
  const pricing = payload.pricing ?? (totalFromRow > 0
    ? { subtotal: Math.max(0, totalFromRow - deliveryFromRow), delivery: deliveryFromRow, giftFee: 0, total: totalFromRow }
    : undefined)
  return {
    lines: [],
    ...payload,
    customizedBoxes: Array.isArray(payload.customizedBoxes) ? payload.customizedBoxes : [],
    note: rawNote,
    giftMessage: giftNote || undefined,
    pricing,
    remoteId: String(row.id),
    id: String(row.order_number),
    customer: String(row.customer_name),
    phone: String(row.customer_phone),
    address: String(row.customer_address),
    deliveryDate: String(row.delivery_date),
    deliverySlot: String(row.delivery_slot),
    status: row.status as Order['status'],
    createdAt: String(row.created_at),
  }
}
export const pushInitialSeed = async () => {
  const client = requireSupabase()
  await applyCatalogMutation(client, { upserts: catalogSnapshot() })
  check((await client.rpc('save_site_settings', { patch: publicSettings() })).error)
  await retryCloudChanges()
  await refreshCloud()
}
export const startSupabaseSync = () => {
  const enqueue = (kind: CloudMutation['kind'], payload: Record<string, unknown>) => {
    if (applying || isHydrating || !isSupabaseConfigured()) return
    version++
    useCloudSyncStore.getState().enqueue({ project: project(), kind, payload })
    void flushCloudChanges()
  }
  let snapshot = catalogSnapshot()
  syncSnapshot = () => { snapshot = catalogSnapshot() }
  const catalogChanged = () => {
    const next = catalogSnapshot()
    if (applying || isHydrating || !isSupabaseConfigured()) {
      snapshot = next
      return
    }
    const delta = catalogChanges(snapshot, next)
    snapshot = next
    if (delta) enqueue('catalog', delta)
  }
  const stopBoxes = useBoxBuilderStore.subscribe(catalogChanged)
  const stopGallery = useGalleryStore.subscribe(catalogChanged)
  const stopSettings = useSiteSettingsStore.subscribe((next, previous) => {
    if (next.integrations !== previous.integrations) { version++; reconnect(); return }
    if (applying || isHydrating || !isSupabaseConfigured()) return
    const before = settingsSchema.parse(previous), after = settingsSchema.parse(next)
    const patch = Object.fromEntries(Object.entries(after).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(before[key as keyof typeof before])))
    if (Object.keys(patch).length) enqueue('settings', patch)
  })
  const stopKitchen = useKitchenStore.subscribe((next, previous) => {
    if (applying || isHydrating || !isSupabaseConfigured()) return
    const nextIds = new Set(next.orders.map(order => order.remoteId).filter(Boolean))
    for (const old of previous.orders) if (old.remoteId && !nextIds.has(old.remoteId)) enqueue('delete_order', { id: old.remoteId })
    for (const order of next.orders) if (order.remoteId && previous.orders.some(old => old.remoteId === order.remoteId && old.status !== order.status)) enqueue('status', { id: order.remoteId, status: order.status })
  })
  const refresh = () => { void flushCloudChanges().then(() => refreshCloud()).catch(() => {}) }
  let unsubscribeAuth: (() => void) | undefined
  const reconnect = () => {
    unsubscribeAuth?.()
    const client = getSupabase()
    let activeOrdersChannel: ReturnType<NonNullable<typeof client>['channel']> | null = null
    let activeCatalogChannel: ReturnType<NonNullable<typeof client>['channel']> | null = null
    let catalogTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleCatalogRefresh = () => {
      if (catalogTimer !== null) globalThis.clearTimeout(catalogTimer)
      catalogTimer = globalThis.setTimeout(() => {
        catalogTimer = null
        void flushCloudChanges().then(() => refreshCloud()).catch(() => {})
      }, 150)
    }
    if (client) {
      let channel = client.channel(`catalog-realtime-${Date.now()}`)
      for (const table of [...TABLES, 'site_settings'] as const) {
        channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleCatalogRefresh)
      }
      activeCatalogChannel = channel.subscribe()
    }
    const syncOrdersChannel = (staffActive: boolean) => {
      if (!client || getAppTarget() !== 'admin') return
      if (!staffActive) {
        if (activeOrdersChannel) {
          void client.removeChannel(activeOrdersChannel)
          activeOrdersChannel = null
        }
        return
      }
      if (activeOrdersChannel) return
      activeOrdersChannel = client
        .channel(`orders-realtime-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as Record<string, unknown> | null)?.id
              if (typeof deletedId === 'string') {
                applying = true
                try {
                  useKitchenStore.setState(state => ({
                    orders: state.orders.filter(existing => existing.remoteId !== deletedId && existing.id !== `LM-${deletedId}`),
                  }))
                } finally {
                  applying = false
                }
              }
              return
            }
            const nextRow = payload.new as Record<string, unknown> | null
            if (!nextRow || !nextRow.id) return
            const parsed = orderFromRow(nextRow)
            applying = true
            try {
              useKitchenStore.setState(state => {
                const exists = state.orders.some(existing => existing.remoteId === parsed.remoteId || existing.id === parsed.id)
                const nextOrders = exists
                  ? state.orders.map(existing => (existing.remoteId === parsed.remoteId || existing.id === parsed.id ? parsed : existing))
                  : [parsed, ...state.orders]
                return { orders: nextOrders }
              })
            } finally {
              applying = false
            }
          },
        )
        .subscribe()
    }
    useCloudSyncStore.setState({ cloudinary: isCloudinaryConfigured() ? 'configured' : 'local' })
    const subscription = client?.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        applying = true
        try {
          useCloudSyncStore.setState({ isStaff: false })
          useKitchenStore.setState({ orders: [] })
        } finally {
          applying = false
        }
        syncOrdersChannel(false)
      } else {
        void isStaffSession().then(syncOrdersChannel).catch(() => {})
      }
      queueMicrotask(refresh)
    }).data.subscription
    void isStaffSession().then(syncOrdersChannel).catch(() => {})
    unsubscribeAuth = () => {
      if (catalogTimer !== null) {
        globalThis.clearTimeout(catalogTimer)
        catalogTimer = null
      }
      if (client && activeCatalogChannel) {
        void client.removeChannel(activeCatalogChannel)
        activeCatalogChannel = null
      }
      subscription?.unsubscribe()
      syncOrdersChannel(false)
    }
    refresh()
  }
  reconnect()
  const timer = window.setInterval(refresh, 5000)
  const storage = (event: StorageEvent) => {
    if (!event.newValue) return
    try {
      const incoming = JSON.parse(event.newValue).state
      applying = true
      isHydrating = true
      if (event.key === 'le-matin-site-settings') { const values = settingsSchema.parse(incoming); if (JSON.stringify(values) !== JSON.stringify(publicSettings())) useSiteSettingsStore.getState().applyGlobalSettings(values) }
      if (event.key === 'le-matin-gallery') { const items = incoming.items.map((item: unknown) => galleryItemSchema.parse(item)); if (JSON.stringify(items) !== JSON.stringify(useGalleryStore.getState().items)) useGalleryStore.getState().replaceShared(items) }
      snapshot = catalogSnapshot()
    } catch { /* Ignore malformed cross-tab cache data. */ } finally { applying = false; isHydrating = false }
  }
  window.addEventListener('storage', storage)
  window.addEventListener('focus', refresh)
  return () => { syncSnapshot = null; clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('storage', storage); unsubscribeAuth?.(); stopBoxes(); stopGallery(); stopSettings(); stopKitchen() }
}
export { settingsRow }
