import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useSiteSettingsStore, type IntegrationOverrides } from '@/stores/site-settings-store'

export const integrationConfig = () => {
  const overrides = useSiteSettingsStore.getState().integrations
  return {
    supabaseUrl: (overrides.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, ''),
    supabaseAnonKey: (overrides.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
    cloudinaryCloudName: (overrides.cloudinaryCloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim(),
    cloudinaryUploadPreset: (overrides.cloudinaryUploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim(),
  }
}
export const validateIntegrationConfig = (config: IntegrationOverrides) => {
  if (config.supabaseUrl) {
    const url = new URL(config.supabaseUrl)
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Use the HTTPS project URL without a path or query.')
  }
  const key = config.supabaseAnonKey
  if (key.startsWith('sb_secret_')) throw new Error('Use a public anon or publishable key, never a secret key.')
  if (key.includes('.')) {
    try {
      const claims = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (claims.role !== 'anon') throw new Error('Only an anon key can be saved in the browser.')
    } catch { throw new Error('Use a valid public anon or publishable key.') }
  }
  if (config.cloudinaryCloudName && !/^[a-z0-9_-]+$/i.test(config.cloudinaryCloudName)) throw new Error('Cloudinary cloud names contain letters, numbers, hyphens, and underscores only.')
}
export const isSupabaseConfigured = () => {
  const config = integrationConfig()
  if (!config.supabaseUrl || !config.supabaseAnonKey || /your-project|your-anon|your-public/.test(config.supabaseUrl + config.supabaseAnonKey)) return false
  try { validateIntegrationConfig(config); return true } catch { return false }
}
let cached: SupabaseClient | null = null
let identity = ''
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) { cached?.auth.stopAutoRefresh(); void cached?.removeAllChannels(); cached = null; identity = ''; return null }
  const config = integrationConfig()
  const nextIdentity = `${config.supabaseUrl}|${config.supabaseAnonKey}`
  if (!cached || identity !== nextIdentity) {
    cached?.auth.stopAutoRefresh()
    void cached?.removeAllChannels()
    cached = createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
    identity = nextIdentity
  }
  return cached
}
export const requireSupabase = () => {
  const client = getSupabase()
  if (!client) throw new Error('Configure a Supabase project URL and public key first.')
  return client
}
export const isStaffSession = async () => {
  const client = getSupabase()
  if (!client) return false
  const { data, error } = await client.auth.getSession()
  return !error && data.session?.user.app_metadata?.role === 'admin'
}
export const getStaffEmail = async (): Promise<string | null> => {
  const client = getSupabase()
  if (!client) return null
  const { data, error } = await client.auth.getSession()
  if (error || data.session?.user.app_metadata?.role !== 'admin') return null
  return data.session.user.email ?? null
}
export const signInStaff = async (email: string, password: string) => {
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (data.user?.app_metadata?.role !== 'admin') { await client.auth.signOut(); throw new Error('This account does not have kitchen administrator access.') }
}
export const signOutStaff = async () => {
  const client = getSupabase()
  if (!client) return
  const { error } = await client.auth.signOut()
  if (error) throw new Error(error.message)
}
export const updateStaffPassword = async (password: string) => {
  const client = requireSupabase()
  const { error } = await client.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
