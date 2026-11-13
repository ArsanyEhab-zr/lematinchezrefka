import { create } from 'zustand'
import { persist } from 'zustand/middleware'
export type CloudState = 'local' | 'checking' | 'connected' | 'error'
export interface CloudMutation { id: string; project: string; kind: 'catalog' | 'settings' | 'status' | 'delete_order'; payload: Record<string, unknown>; attempts: number }
interface CloudSyncState {
  supabase: CloudState
  cloudinary: 'local' | 'configured' | 'uploading' | 'connected' | 'error'
  message: string
  lastSync: string | null
  isStaff: boolean
  queue: CloudMutation[]
  enqueue: (mutation: Omit<CloudMutation, 'id' | 'attempts'>) => void
  clearQueue: (project?: string) => void
}
export const useCloudSyncStore = create<CloudSyncState>()(persist(set => ({
  supabase: 'local', cloudinary: 'local', message: '', lastSync: null, isStaff: false, queue: [],
  enqueue: mutation => set(state => ({ queue: [...state.queue, { ...mutation, id: crypto.randomUUID(), attempts: 0 }] })),
  clearQueue: (project) => set(state => ({
    queue: project ? state.queue.filter(row => row.project !== project) : [],
    message: '',
  })),
}), {
  name: 'le-matin-cloud-outbox',
  version: 3,
  migrate: () => ({ queue: [] }),
  partialize: state => ({ queue: state.queue }),
}))
