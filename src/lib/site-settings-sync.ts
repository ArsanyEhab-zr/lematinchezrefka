import { useSiteSettingsStore, type SiteSettingsValues } from '@/stores/site-settings-store'
import { settingsSchema } from '@/lib/settings-schema'
import { isSupabaseConfigured, signInStaff } from '@/lib/supabase'
import { refreshCloud, retryCloudChanges } from '@/lib/supabase-sync'
export { settingsSchema } from '@/lib/settings-schema'
export type { GlobalSettings } from '@/lib/settings-schema'
export const hasSettingsBackend = isSupabaseConfigured
export const signInSettingsAdmin = signInStaff
export const refreshSiteSettings = refreshCloud
export const saveSiteSettings = async (draft: SiteSettingsValues) => {
  const values = settingsSchema.parse(draft)
  useSiteSettingsStore.getState().applyGlobalSettings(values)
  if (isSupabaseConfigured()) await retryCloudChanges()
}
