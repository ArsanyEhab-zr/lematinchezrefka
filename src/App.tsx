import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { startSupabaseSync } from '@/lib/supabase-sync'
import { useNavigation, startHashSync } from '@/stores/navigation-store'
import { isAdminApp } from '@/lib/app-target'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Menu } from '@/pages/Menu'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { BoxBuilder } from '@/components/BoxBuilder'

const AdminRoot = lazy(() =>
  import.meta.env.VITE_APP_TARGET === 'storefront' && !import.meta.env.DEV
    ? Promise.resolve({ default: (() => null) as ComponentType })
    : import('@/pages/admin/AdminRoot'),
)

const setHeadLink = (rel: string, href: string, type?: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
  if (type) link.type = type
  else link.removeAttribute('type')
}

const setHeadMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    document.head.appendChild(meta)
  }
  meta.content = content
}

export const App = () => {
  const adminTarget = isAdminApp()
  const route = useNavigation((state) => state.route)

  useEffect(startSupabaseSync, [])

  const { faviconUrl, siteTitleEn, siteTitleAr, activeLanguage } = useSiteSettingsStore(
    useShallow((s) => ({
      faviconUrl: s.faviconUrl,
      siteTitleEn: s.siteTitleEn,
      siteTitleAr: s.siteTitleAr,
      activeLanguage: s.activeLanguage,
    })),
  )

  useEffect(() => {
    if (adminTarget) {
      document.title = '📊 Le Matin — Admin Dashboard'
      setHeadLink('manifest', '/manifest-admin.webmanifest')
      setHeadLink('icon', '/pwa/admin-icon-192.png', 'image/png')
      setHeadLink('apple-touch-icon', '/pwa/admin-icon-192.png')
      setHeadMeta('name', 'theme-color', '#3E422B')
      setHeadMeta('property', 'og:title', document.title)
      return
    }

    const title = activeLanguage === 'ar' ? siteTitleAr : siteTitleEn
    document.title = title || 'Le Matin chez Refka'
    setHeadLink('manifest', '/manifest-store.webmanifest')
    setHeadLink('icon', faviconUrl || '/pwa/store-icon-192.png', faviconUrl ? undefined : 'image/png')
    setHeadLink('apple-touch-icon', '/pwa/store-icon-192.png')
    setHeadMeta('name', 'theme-color', '#FDFBF7')
    setHeadMeta('property', 'og:title', document.title)
  }, [adminTarget, faviconUrl, siteTitleEn, siteTitleAr, activeLanguage])

  // Start URL hash synchronization on mount
  useEffect(() => {
    const stopSync = startHashSync()
    return stopSync
  }, [])

  if (adminTarget) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-cream font-sans text-sm font-medium text-olive/70">
            Loading Le Matin Dashboard…
          </div>
        }
      >
        <AdminRoot />
      </Suspense>
    )
  }

  // Strictly isolated Customer Storefront routes
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-olive antialiased selection:bg-blush selection:text-olive">
      <Header />
      <main className="flex-1 pb-16">
        {route === 'home' && <Home />}
        {route === 'menu' && <Menu />}
        {route === 'about' && <About />}
        {route === 'contact' && <Contact />}
      </main>
      <Footer />
      {/* Global Interactive Box Builder Modal */}
      <BoxBuilder />
    </div>
  )
}

export default App
