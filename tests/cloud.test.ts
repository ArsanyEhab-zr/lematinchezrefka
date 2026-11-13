import assert from 'node:assert/strict'
import { cloudId, catalogChanges, catalogSnapshot, hydrateCatalog, publicSettings } from '../src/lib/cloud-records'
import { getOptimizedImageUrl } from '../src/lib/cloudinary'
import { validateIntegrationConfig, getSupabase } from '../src/lib/supabase'
import { useSiteSettingsStore } from '../src/stores/site-settings-store'
import { useBoxBuilderStore } from '../src/stores/box-builder-store'
const config = { supabaseUrl: '', supabaseAnonKey: '', cloudinaryCloudName: '', cloudinaryUploadPreset: '' }
assert.equal(getSupabase(), null)
assert.throws(() => validateIntegrationConfig({ ...config, supabaseAnonKey: 'sb_secret_unsafe' }))
assert.throws(() => validateIntegrationConfig({ ...config, supabaseUrl: 'http://example.com' }))
assert.equal(cloudId('cat-couples'), cloudId('cat-couples'))
assert.notEqual(cloudId('cat-couples'), cloudId('cat-office'))
assert.match(cloudId('cat-couples'), /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/)
const before = catalogSnapshot()
assert.equal(catalogChanges(before, before), null)
const next = structuredClone(before)
next.boxes[0].base_price = Number(next.boxes[0].base_price) + 1
const delta = catalogChanges(before, next)!
assert.equal(delta.upserts.boxes?.length, 1)
assert.deepEqual(delta.deletes, {})
const localId = useBoxBuilderStore.getState().boxes[0].id
hydrateCatalog(before)
assert.equal(useBoxBuilderStore.getState().boxes[0].id, localId)
assert.equal(useBoxBuilderStore.getState().components[0].box_id, before.box_components[0].box_id === before.boxes[0].id ? localId : useBoxBuilderStore.getState().components[0].box_id)
useSiteSettingsStore.getState().setIntegrations({ ...config, cloudinaryCloudName: 'test' })
assert.equal('integrations' in publicSettings(), false)
assert.equal('cloudinaryCloudName' in publicSettings(), false)
const optimized = getOptimizedImageUrl('https://res.cloudinary.com/demo/image/upload/v123/folder/image.jpg', { width: 640 })
assert.match(optimized, /f_auto/); assert.match(optimized, /q_auto/); assert.match(optimized, /w_640/); assert.match(optimized, /v123\/folder\/image.jpg/)
for (const url of ['data:image/png;base64,abc', '/favicon.svg', 'https://images.example.com/image.png', 'https://res.cloudinary.com/demo/image/upload/s--signed--/v12/a.jpg']) assert.equal(getOptimizedImageUrl(url), url)
useSiteSettingsStore.getState().setIntegrations(config)
console.log('Passed: cloud UUID mapping, catalog deltas and hydration, key protection, local configuration, public settings isolation, image optimization.')
