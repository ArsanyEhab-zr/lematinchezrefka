import { create } from 'zustand'
import { prefersReducedMotion } from '@/lib/utils'
import { getAppTarget } from '@/lib/app-target'

/**
 * Simulated navigation. The route lives in a store and is mirrored to the URL
 * hash, so the browser back button, deep links and “open in new tab” all work
 * strictly within the active app target (`storefront` vs `admin`).
 */
export type Route =
  | 'home'
  | 'menu'
  | 'about'
  | 'contact'
  | 'admin'
  | 'admin-menu'
  | 'admin-boxes'
  | 'admin-settings'
  | 'admin-gallery'
  | 'admin-brand'

const STOREFRONT_ROUTES: readonly Route[] = ['home', 'menu', 'about', 'contact']
const ADMIN_ROUTES: readonly Route[] = [
  'admin',
  'admin-menu',
  'admin-boxes',
  'admin-settings',
  'admin-gallery',
  'admin-brand',
]

const isStorefrontRoute = (value: string): value is Route =>
  (STOREFRONT_ROUTES as readonly string[]).includes(value)

const isAdminRouteKey = (value: string): value is Route =>
  (ADMIN_ROUTES as readonly string[]).includes(value)

const sanitizeRoute = (route: Route): Route => {
  if (getAppTarget() === 'admin') {
    return isAdminRouteKey(route) ? route : 'admin'
  }
  return isStorefrontRoute(route) ? route : 'home'
}

const parseHash = (hash: string): Route => {
  const key = hash.replace(/^#\/?/, '').split('?')[0]
  if (getAppTarget() === 'admin') {
    if (!key) return 'admin'
    return isAdminRouteKey(key) ? key : 'admin'
  }
  if (!key) return 'home'
  return isStorefrontRoute(key) ? key : 'home'
}

export const hrefFor = (route: Route): string => {
  if (getAppTarget() === 'admin') {
    return route === 'admin' ? '#/' : `#/${sanitizeRoute(route)}`
  }
  return route === 'home' ? '#/' : `#/${sanitizeRoute(route)}`
}

export const isAdminRoute = (route: Route): boolean => route.startsWith('admin')

type NavigationState = {
  route: Route
  configuratorBoxId: string | null
  scrollTarget: string | null
  navigate: (route: Route) => void
  navigateToSection: (route: Route, targetId?: string) => void
  clearScrollTarget: () => void
  openBoxInConfigurator: (boxId: string) => void
  clearConfiguratorBoxId: () => void
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
const scrollToElement = (elementId: string) => {
  const el = document.getElementById(elementId)
  if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

export const useNavigation = create<NavigationState>((set, get) => ({
  route: typeof window === 'undefined' ? sanitizeRoute('home') : parseHash(window.location.hash),
  configuratorBoxId: null,
  scrollTarget: null,
  navigate: (targetRoute) => {
    const route = sanitizeRoute(targetRoute)
    set({ scrollTarget: null })
    if (get().route === route) {
      scrollToTop()
      return
    }
    window.location.hash = hrefFor(route)
  },
  navigateToSection: (targetRoute, targetId) => {
    const route = sanitizeRoute(targetRoute)
    const cleanTarget = targetId ?? null
    set({ scrollTarget: cleanTarget })
    if (get().route === route) {
      if (cleanTarget) window.requestAnimationFrame(() => scrollToElement(cleanTarget))
      else scrollToTop()
      return
    }
    window.location.hash = hrefFor(route)
  },
  clearScrollTarget: () => set({ scrollTarget: null }),
  openBoxInConfigurator: (boxId) => {
    if (getAppTarget() !== 'admin') return
    set({ configuratorBoxId: boxId, scrollTarget: null })
    if (get().route === 'admin-boxes') {
      scrollToTop()
      return
    }
    window.location.hash = hrefFor('admin-boxes')
  },
  clearConfiguratorBoxId: () => set({ configuratorBoxId: null }),
}))

/** Keeps the store in sync with the hash. Returns an unsubscribe function. */
export const startHashSync = (): (() => void) => {
  const normalizeCurrentHash = () => {
    const target = getAppTarget()
    const rawKey = window.location.hash.replace(/^#\/?/, '').split('?')[0]
    if (target === 'storefront' && rawKey.startsWith('admin')) {
      window.location.replace('#/')
    } else if (target === 'admin' && rawKey && !isAdminRouteKey(rawKey)) {
      window.location.replace('#/')
    }
  }
  const handleHashChange = () => {
    normalizeCurrentHash()
    const pendingTarget = useNavigation.getState().scrollTarget
    useNavigation.setState({ route: parseHash(window.location.hash) })
    if (!pendingTarget) window.scrollTo({ top: 0 })
  }
  normalizeCurrentHash()
  useNavigation.setState({ route: parseHash(window.location.hash) })
  window.addEventListener('hashchange', handleHashChange)
  return () => window.removeEventListener('hashchange', handleHashChange)
}
