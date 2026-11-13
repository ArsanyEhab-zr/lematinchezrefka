import { useCallback, useEffect, useState } from 'react'
import { useNavigation } from '@/stores/navigation-store'
import { getStaffEmail, getSupabase, isStaffSession, signOutStaff } from '@/lib/supabase'
import { refreshCloud } from '@/lib/supabase-sync'
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { DashboardOverview } from '@/pages/admin/DashboardOverview'
import { AdminMenuSettings } from '@/pages/admin/AdminMenuSettings'
import { AdminBoxConfigurator } from '@/pages/admin/AdminBoxConfigurator'
import { AdminGalleryManager } from '@/pages/admin/AdminGalleryManager'
import { AdminBrandMedia } from '@/pages/admin/AdminBrandMedia'
import { AdminSettings } from '@/pages/admin/AdminSettings'

const AdminRoot = () => {
  const route = useNavigation((state) => state.route)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  const syncSessionState = useCallback(async () => {
    try {
      const ok = await isStaffSession()
      const email = ok ? await getStaffEmail() : null
      setIsAdmin(ok)
      setAdminEmail(email)
    } catch {
      setIsAdmin(false)
      setAdminEmail(null)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    void syncSessionState()
    const client = getSupabase()
    if (!client) return
    const { data } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false)
        setAdminEmail(null)
        setAuthChecked(true)
        return
      }
      void syncSessionState()
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [syncSessionState])

  useEffect(() => {
    if (isAdmin) {
      void refreshCloud(true).catch(() => undefined)
    }
  }, [isAdmin])

  const handleSignOut = async () => {
    await signOutStaff()
    setIsAdmin(false)
    setAdminEmail(null)
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream font-sans text-sm font-medium text-olive/70">
        Verifying dashboard session…
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <AdminLogin
        onAuthenticated={async () => {
          await syncSessionState()
          await refreshCloud(true).catch(() => undefined)
        }}
      />
    )
  }

  const page =
    route === 'admin-menu' ? (
      <AdminMenuSettings />
    ) : route === 'admin-boxes' ? (
      <AdminBoxConfigurator />
    ) : route === 'admin-gallery' ? (
      <AdminGalleryManager />
    ) : route === 'admin-brand' ? (
      <AdminBrandMedia />
    ) : route === 'admin-settings' ? (
      <AdminSettings />
    ) : (
      <DashboardOverview />
    )

  return (
    <AdminLayout adminEmail={adminEmail} onSignOut={handleSignOut}>
      {page}
    </AdminLayout>
  )
}

export default AdminRoot
