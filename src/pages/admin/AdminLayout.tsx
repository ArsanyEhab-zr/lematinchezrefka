import { useEffect, useState, useMemo, type FormEvent, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  ChefHat,
  ShoppingBag,
  SlidersHorizontal,
  Boxes,
  Menu as MenuIcon,
  X,
  ExternalLink,
  RotateCcw,
  LogOut,
  KeyRound,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  UserCheck,
  RefreshCw,
  Cloud,
} from 'lucide-react'
import { hrefFor, useNavigation, type Route } from '@/stores/navigation-store'
import { useKitchenStore } from '@/stores/kitchen-store'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useCloudSyncStore } from '@/stores/cloud-sync-store'
import { isSupabaseConfigured, updateStaffPassword } from '@/lib/supabase'
import { forceCloudSync } from '@/lib/supabase-sync'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { usePwaInstall } from '@/lib/pwa-install'
import { cn } from '@/lib/utils'

type AdminLayoutProps = {
  children: ReactNode
  adminEmail?: string | null
  onSignOut?: () => void | Promise<void>
}

export const AdminLayout = ({ children, adminEmail, onSignOut }: AdminLayoutProps) => {
  const { route, navigate } = useNavigation(useShallow((s) => ({ route: s.route, navigate: s.navigate })))
  const { activeLanguage, logoUrl } = useSiteSettingsStore(
    useShallow((state) => ({ activeLanguage: state.activeLanguage, logoUrl: state.logoUrl })),
  )
  const [failedLogoSrc, setFailedLogoSrc] = useState('')
  const [fallbackIconOnly, setFallbackIconOnly] = useState(false)
  const effectiveLogo = logoUrl && failedLogoSrc !== logoUrl ? logoUrl : '/brand-logo.png'
  const connected = isSupabaseConfigured()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwText, setShowPwText] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwFeedback, setPwFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)
  const [forceSyncing, setForceSyncing] = useState(false)
  const [syncNotice, setSyncNotice] = useState<string | null>(null)

  const { supabaseStatus, cloudMessage, queueLength, lastSync } = useCloudSyncStore(
    useShallow((state) => ({
      supabaseStatus: state.supabase,
      cloudMessage: state.message,
      queueLength: state.queue.length,
      lastSync: state.lastSync,
    })),
  )

  const { canNativeInstall, isInstalled, isIos, promptInstall } = usePwaInstall()
  const isAr = activeLanguage === 'ar'
  const text = (en: string, ar: string) => (isAr ? ar : en)

  const orders = useKitchenStore((state) => state.orders)
  const resetDemoData = useKitchenStore((state) => state.resetDemoData)

  const { boxes, items, resetToDefaults } = useBoxBuilderStore(
    useShallow((state) => ({
      boxes: state.boxes,
      items: state.items,
      resetToDefaults: state.resetToDefaults,
    })),
  )

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders],
  )

  const soldOutTotal = useMemo(
    () => boxes.filter((b) => b.is_sold_out).length + items.filter((i) => i.is_sold_out).length,
    [boxes, items],
  )

  const storefrontExternalHref = useMemo(() => {
    if (typeof window === 'undefined') return '/'
    if (import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      return window.location.port === '5174'
        ? `${window.location.protocol}//${window.location.hostname}:5173/`
        : `${window.location.origin}/?mode=storefront`
    }
    return '/'
  }, [])

  useEffect(() => {
    if (!showPasswordModal) {
      setNewPassword('')
      setConfirmPassword('')
      setPwFeedback(null)
      setShowPwText(false)
    }
  }, [showPasswordModal])

  const handleNav = (target: Route) => {
    navigate(target)
    setIsMobileOpen(false)
  }

  const handleInstallClick = async () => {
    if (canNativeInstall) {
      const outcome = await promptInstall()
      if (outcome !== 'unavailable') return
    }
    setShowIosGuide(true)
  }

  const handleSignOutClick = async () => {
    if (!onSignOut || signingOut) return
    setSigningOut(true)
    try {
      await onSignOut()
    } finally {
      setSigningOut(false)
    }
  }

  const handleForceSync = async () => {
    if (forceSyncing || !connected) return
    setForceSyncing(true)
    setSyncNotice(null)
    try {
      await forceCloudSync()
      setSyncNotice('Synced')
      window.setTimeout(() => setSyncNotice(null), 2500)
    } catch (err) {
      setSyncNotice(err instanceof Error ? err.message : 'Sync error')
    } finally {
      setForceSyncing(false)
    }
  }

  const syncDotClass = !connected
    ? 'bg-cream/40'
    : supabaseStatus === 'error'
    ? 'bg-red-400'
    : forceSyncing || supabaseStatus === 'checking' || queueLength > 0
    ? 'bg-amber-300 animate-pulse'
    : 'bg-emerald-400'

  const syncLabel = !connected
    ? 'Local Mode'
    : forceSyncing
    ? 'Syncing…'
    : supabaseStatus === 'error'
    ? 'Sync Error'
    : queueLength > 0
    ? `Pending (${queueLength})`
    : supabaseStatus === 'connected'
    ? 'Cloud Live'
    : 'Checking…'

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPwFeedback(null)
    if (newPassword.length < 8) {
      setPwFeedback({
        kind: 'err',
        msg: text(
          'Password must be at least 8 characters.',
          'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
        ),
      })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwFeedback({
        kind: 'err',
        msg: text('Passwords do not match.', 'كلمتا المرور غير متطابقتين.'),
      })
      return
    }
    setPwSaving(true)
    try {
      await updateStaffPassword(newPassword)
      setPwFeedback({
        kind: 'ok',
        msg: text('Password updated successfully.', 'تم تحديث كلمة المرور بنجاح.'),
      })
      setNewPassword('')
      setConfirmPassword('')
    } catch (cause) {
      setPwFeedback({
        kind: 'err',
        msg: cause instanceof Error ? cause.message : String(cause),
      })
    } finally {
      setPwSaving(false)
    }
  }

  const showInstallButton = !isInstalled && (canNativeInstall || isIos)

  return (
    <div className="flex min-h-screen bg-cream font-sans text-olive">
      {/* ── Sidebar (Desktop) ─────────────────────────────────── */}
      <aside className="hidden w-72 shrink-0 border-r border-cream/10 bg-olive text-cream lg:flex lg:flex-col lg:justify-between">
        <div>
          {/* Brand header */}
          <div className="border-b border-cream/10 p-6">
            <div className="flex items-center gap-3">
              {fallbackIconOnly ? (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 bg-cream/10 text-gold shadow-inner">
                  <ChefHat className="h-6 w-6" strokeWidth={1.75} />
                </span>
              ) : (
                <img
                  src={effectiveLogo}
                  alt="Le Matin chez Refka"
                  onError={() => {
                    if (effectiveLogo !== '/brand-logo.png') setFailedLogoSrc(effectiveLogo)
                    else setFallbackIconOnly(true)
                  }}
                  className="h-12 w-12 shrink-0 rounded-full border border-gold/50 bg-cream object-cover shadow-inner"
                />
              )}
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-cream">
                  Le Matin
                </h1>
                <p className="font-script text-base text-gold">
                  Kitchen Dashboard
                </p>
              </div>
            </div>
            {adminEmail && (
              <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-cream/10 px-3 py-2 text-xs text-cream/85">
                <UserCheck className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="truncate font-medium">{adminEmail}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav aria-label="Kitchen Portal Menu" className="flex flex-col gap-1.5 p-4">
            <a
              href={hrefFor('admin')}
              onClick={(e) => {
                e.preventDefault()
                handleNav('admin')
              }}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                route === 'admin'
                  ? 'bg-cream/15 text-gold'
                  : 'text-cream/80 hover:bg-cream/5 hover:text-cream',
              )}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                <span>Orders &amp; Dispatch</span>
              </div>
              {pendingCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blush px-1.5 text-xs font-bold text-olive">
                  {pendingCount}
                </span>
              )}
            </a>

            <a
              href={hrefFor('admin-menu')}
              onClick={(e) => {
                e.preventDefault()
                handleNav('admin-menu')
              }}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                route === 'admin-menu'
                  ? 'bg-cream/15 text-gold'
                  : 'text-cream/80 hover:bg-cream/5 hover:text-cream',
              )}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5" />
                <span>Menu Availability</span>
              </div>
              {soldOutTotal > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500/80 px-1.5 text-xs font-bold text-white">
                  {soldOutTotal}
                </span>
              )}
            </a>

            <a
              href={hrefFor('admin-boxes')}
              onClick={(e) => {
                e.preventDefault()
                handleNav('admin-boxes')
              }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                route === 'admin-boxes'
                  ? 'bg-cream/15 text-gold'
                  : 'text-cream/80 hover:bg-cream/5 hover:text-cream',
              )}
            >
              <Boxes className="h-5 w-5" />
              <span>Box Configurator</span>
            </a>

            <a
              href={hrefFor('admin-settings')}
              onClick={(e) => {
                e.preventDefault()
                handleNav('admin-settings')
              }}
              className={cn(
                'rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                route === 'admin-settings'
                  ? 'bg-cream/15 text-gold'
                  : 'text-cream/80 hover:bg-cream/5 hover:text-cream',
              )}
            >
              Site &amp; Kitchen Settings
            </a>

            {([
              ['admin-gallery', 'Best Orders Gallery'],
              ['admin-brand', 'Brand, Media & Socials CMS'],
            ] as const).map(([target, title]) => (
              <a
                key={target}
                href={hrefFor(target)}
                onClick={(event) => {
                  event.preventDefault()
                  handleNav(target)
                }}
                className={cn(
                  'rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                  route === target
                    ? 'bg-cream/15 text-gold'
                    : 'text-cream/80 hover:bg-cream/5 hover:text-cream',
                )}
              >
                {title}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom controls: Sync, Install App, Password, Sign Out, Storefront External */}
        <div className="border-t border-cream/10 p-4">
          <div className="flex flex-col gap-2">
            {connected && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-cream/15 bg-cream/5 px-3 py-2">
                <div
                  className="flex min-w-0 items-center gap-2 text-xs text-cream/85"
                  title={cloudMessage || (lastSync ? `Last synced ${new Date(lastSync).toLocaleTimeString()}` : undefined)}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', syncDotClass)} />
                  <span className="truncate font-semibold">{syncNotice || syncLabel}</span>
                </div>
                <button
                  type="button"
                  disabled={forceSyncing}
                  onClick={() => void handleForceSync()}
                  title="Clear stuck local sync cache and pull fresh data from Supabase"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold transition-colors hover:bg-gold/25 disabled:opacity-60"
                >
                  <RefreshCw className={cn('h-3 w-3', forceSyncing && 'animate-spin')} />
                  <span>Force Sync</span>
                </button>
              </div>
            )}

            {showInstallButton && (
              <button
                type="button"
                onClick={() => void handleInstallClick()}
                className="flex items-center gap-2.5 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-xs font-bold text-gold transition-colors hover:bg-gold/25"
              >
                <Download className="h-4 w-4" />
                <span>Install Dashboard App</span>
              </button>
            )}

            {connected && (
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-semibold text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
              >
                <KeyRound className="h-4 w-4 text-gold" />
                <span>Change Password</span>
              </button>
            )}

            {onSignOut && (
              <button
                type="button"
                disabled={signingOut}
                onClick={() => void handleSignOutClick()}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-semibold text-blush transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{signingOut ? 'Signing Out…' : 'Sign Out'}</span>
              </button>
            )}

            {!connected && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset kitchen orders, boxes, and ingredient stock to sample demo data?')) {
                    resetDemoData()
                    resetToDefaults()
                  }
                }}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-semibold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Demo Data</span>
              </button>
            )}

            {import.meta.env.DEV && (
              <a
                href={storefrontExternalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl bg-cream/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-cream/20"
              >
                <span>Open Storefront</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area (bg-[#FDFBF7]) ──────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar for mobile & admin info */}
        <header className="flex h-16 items-center justify-between border-b border-kraft/40 bg-cream px-4 sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-kraft bg-cream text-olive lg:hidden"
              aria-label="Toggle navigation"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-olive">
                {route === 'admin-gallery'
                  ? 'Best Orders Gallery'
                  : route === 'admin-brand'
                  ? 'Brand, Media & Socials CMS'
                  : route === 'admin-settings'
                  ? 'Site & Kitchen Settings'
                  : route === 'admin-menu'
                  ? 'Menu & Stock Control'
                  : route === 'admin-boxes'
                  ? 'Interactive Box Configurator'
                  : 'Orders & Daily Dispatch'}
              </span>
              <span className="hidden text-xs text-olive/50 sm:inline">
                · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {connected && (
              <div className="flex items-center gap-1.5 rounded-full border border-kraft/60 bg-cream px-2.5 py-1 shadow-xs">
                <span
                  className="hidden items-center gap-1.5 px-1 text-[11px] font-semibold text-olive/80 sm:inline-flex"
                  title={cloudMessage || (lastSync ? `Last sync: ${new Date(lastSync).toLocaleTimeString()}` : undefined)}
                >
                  <Cloud className="h-3.5 w-3.5 text-gold" />
                  <span className={cn('h-2 w-2 rounded-full', syncDotClass)} />
                  <span>{syncNotice || syncLabel}</span>
                </span>
                <button
                  type="button"
                  disabled={forceSyncing}
                  onClick={() => void handleForceSync()}
                  title="Force Sync with Supabase"
                  className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-1 text-xs font-bold text-cream transition-colors hover:bg-olive-light disabled:opacity-60"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5 text-gold', forceSyncing && 'animate-spin')} />
                  <span className="hidden sm:inline">{forceSyncing ? 'Syncing…' : 'Force Sync'}</span>
                  <span className="sm:hidden">Sync</span>
                </button>
              </div>
            )}
            {showInstallButton && (
              <button
                type="button"
                onClick={() => void handleInstallClick()}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-bold text-olive transition-colors hover:bg-gold/20 lg:hidden"
              >
                <Download className="h-3.5 w-3.5 text-gold" />
                <span>Install App</span>
              </button>
            )}
            {onSignOut && (
              <button
                type="button"
                disabled={signingOut}
                onClick={() => void handleSignOutClick()}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-kraft px-3 py-1.5 text-xs font-semibold text-olive transition-colors hover:bg-blush/30 lg:hidden"
              >
                <LogOut className="h-3.5 w-3.5 text-gold" />
                <span>{text('Sign Out', 'خروج')}</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile dropdown nav */}
        {isMobileOpen && (
          <div className="border-b border-kraft bg-olive p-4 text-cream lg:hidden">
            {adminEmail && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-cream/10 px-3 py-2 text-xs text-cream/85">
                <UserCheck className="h-3.5 w-3.5 text-gold" />
                <span className="truncate">{adminEmail}</span>
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold hover:bg-cream/10"
              >
                <span>Orders &amp; Dispatch</span>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-bold text-olive">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleNav('admin-menu')}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-cream/10"
              >
                <span>Menu Availability</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('admin-boxes')}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-cream/10"
              >
                <span>Box Configurator</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('admin-settings')}
                className="rounded-xl px-4 py-3 text-start text-sm font-semibold hover:bg-cream/10"
              >
                Site &amp; Kitchen Settings
              </button>
              {([
                ['admin-gallery', 'Best Orders Gallery'],
                ['admin-brand', 'Brand, Media & Socials CMS'],
              ] as const).map(([target, title]) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => handleNav(target)}
                  className="rounded-xl px-4 py-3 text-start text-sm font-semibold hover:bg-cream/10"
                >
                  {title}
                </button>
              ))}
              {connected && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false)
                    setShowPasswordModal(true)
                  }}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gold hover:bg-cream/10"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Change Password</span>
                </button>
              )}
              {onSignOut && (
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => void handleSignOutClick()}
                  className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 text-left text-sm font-bold text-blush"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{signingOut ? 'Signing Out…' : 'Sign Out'}</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* ── Change Password Modal ─────────────────────────────── */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-olive/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-pw-title"
        >
          <div className="w-full max-w-md rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="change-pw-title" className="font-display text-xl font-bold text-olive">
                {text('Update Admin Password', 'تحديث كلمة المرور')}
              </h2>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-lg p-1.5 text-olive/60 hover:bg-kraft/25"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {pwFeedback && (
              <div
                className={cn(
                  'mb-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold',
                  pwFeedback.kind === 'ok'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-800',
                )}
              >
                {pwFeedback.kind === 'ok' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                )}
                <span>{pwFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-olive/75">
                  {text('New Password', 'كلمة المرور الجديدة')}
                </label>
                <div className="relative">
                  <input
                    type={showPwText ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    dir="ltr"
                    className="w-full rounded-xl border border-kraft bg-white py-2.5 pl-3.5 pr-10 text-sm text-olive focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwText((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-olive/50 hover:text-olive"
                  >
                    {showPwText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-olive/75">
                  {text('Confirm Password', 'تأكيد كلمة المرور')}
                </label>
                <input
                  type={showPwText ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  className="w-full rounded-xl border border-kraft bg-white px-3.5 py-2.5 text-sm text-olive focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl border border-kraft px-4 py-2 text-xs font-semibold text-olive hover:bg-kraft/15"
                >
                  {text('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-olive px-5 py-2 text-xs font-bold text-cream hover:bg-olive/90 disabled:opacity-60"
                >
                  {pwSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />}
                  <span>{text('Save Password', 'حفظ كلمة المرور')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── iOS / Manual PWA Install Instructions Modal ──────── */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-olive/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/pwa/admin-icon-192.png" alt="Admin Icon" className="h-10 w-10 rounded-xl" />
                <h3 className="font-display text-lg font-bold text-olive">Install 📊 Le Matin Admin</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="rounded-lg p-1 text-olive/60 hover:bg-kraft/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-olive/80">
              {isIos
                ? 'On iPhone / iPad Safari: tap the Share button at the bottom bar, then choose "Add to Home Screen" for one-tap standalone access.'
                : 'Use your browser menu and select "Install app" or "Add to Home screen" to install the Dashboard icon.'}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="rounded-xl bg-olive px-4 py-2 text-xs font-bold text-cream"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
