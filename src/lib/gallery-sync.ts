import { retryCloudChanges, refreshCloud } from '@/lib/supabase-sync'
export const publishGallery = retryCloudChanges
export const refreshGallery = refreshCloud
