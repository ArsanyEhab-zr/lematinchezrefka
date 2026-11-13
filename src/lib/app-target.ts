export type AppTarget = 'storefront' | 'admin'

/** Resolves whether this bundle runs as the Customer Storefront or isolated Admin Dashboard PWA. */
export const getAppTarget = (): AppTarget => {
  const envTarget = (import.meta as { env?: { VITE_APP_TARGET?: string; DEV?: boolean } }).env?.VITE_APP_TARGET
  if (envTarget === 'admin') return 'admin'

  if (typeof window !== 'undefined') {
    const isDev = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV)
    const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    if (isDev && isLocalHost) {
      const mode = new URLSearchParams(window.location.search).get('mode')
      if (mode === 'admin') return 'admin'
      if (mode === 'storefront') return 'storefront'
    }
  }

  return 'storefront'
}

export const isAdminApp = (): boolean => getAppTarget() === 'admin'
