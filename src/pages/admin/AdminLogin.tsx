import { useState, type FormEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Eye, EyeOff, Globe, Loader2, Lock, Mail, AlertCircle, Smartphone, BarChart3 } from 'lucide-react'
import { signInStaff, isSupabaseConfigured } from '@/lib/supabase'
import { retryCloudChanges, refreshCloud } from '@/lib/supabase-sync'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { usePwaInstall } from '@/lib/pwa-install'
import { Button } from '@/components/ui/button'

type AdminLoginProps = {
  onAuthenticated: () => void | Promise<void>
}

export const AdminLogin = ({ onAuthenticated }: AdminLoginProps) => {
  const { activeLanguage, setActiveLanguage, logoUrl } = useSiteSettingsStore(
    useShallow((s) => ({
      activeLanguage: s.activeLanguage,
      setActiveLanguage: s.setActiveLanguage,
      logoUrl: s.logoUrl,
    })),
  )
  const isAr = activeLanguage === 'ar'
  const text = (en: string, ar: string) => (isAr ? ar : en)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [failedLogoSrc, setFailedLogoSrc] = useState('')
  const effectiveLogo = logoUrl && failedLogoSrc !== logoUrl ? logoUrl : '/brand-logo.png'

  const { canNativeInstall, isInstalled, promptInstall } = usePwaInstall()
  const supabaseReady = isSupabaseConfigured()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError(
        text(
          'Please enter your admin email and password.',
          'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
        ),
      )
      return
    }
    setSubmitting(true)
    try {
      await signInStaff(trimmedEmail, password)
      setPassword('')
      await onAuthenticated()
      void retryCloudChanges().catch(() => undefined)
      void refreshCloud().catch(() => undefined)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      setError(
        message.toLowerCase().includes('invalid login')
          ? text(
              'Incorrect email or password. Please try again.',
              'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
            )
          : message,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-10 font-sans text-olive antialiased selection:bg-blush selection:text-olive"
    >
      {/* Subtle brand top accent bar */}
      <div className="fixed inset-x-0 top-0 h-1.5 bg-gradient-to-r from-olive via-gold to-blush" />

      <div className="w-full max-w-md rounded-3xl border-2 border-dashed border-kraft bg-white/90 p-7 shadow-xl backdrop-blur-sm sm:p-9">
        {/* Header: Authentic brand logo + floating dashboard badge & AR/EN switch */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={effectiveLogo}
                alt="Le Matin chez Refka"
                onError={() => setFailedLogoSrc(effectiveLogo)}
                className="h-16 w-16 rounded-full border-2 border-gold/60 bg-cream object-cover shadow-md sm:h-20 sm:w-20"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-cream bg-olive text-gold shadow-sm"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-olive px-3 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-gold">
                <span aria-hidden="true">📊</span>
                <span>{text('Kitchen & Brand Dashboard', 'لوحة تحكم المطبخ والعلامة')}</span>
              </span>
              <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-olive">
                Le Matin chez Refka
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveLanguage(isAr ? 'en' : 'ar')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-kraft bg-cream px-3 py-1.5 text-xs font-bold text-olive transition-colors hover:border-gold hover:bg-blush/30"
            aria-label={text('Switch to Arabic', 'التبديل للإنجليزية')}
          >
            <Globe className="h-3.5 w-3.5 text-gold" />
            <span>{isAr ? 'EN' : 'AR'}</span>
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-olive/75">
          {text(
            'Sign in with your administrator credentials to manage incoming morning orders, menu availability, custom boxes, and gallery highlights.',
            'سجل الدخول بحساب الإدارة لمتابعة الطلبات الصباحية وإدارة القائمة وصناديق الفطور والمعرض والإعدادات.',
          )}
        </p>

        {!supabaseReady && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-medium text-amber-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>
              {text(
                'Supabase environment keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect.',
                'بيانات اتصال Supabase غير مهيأة حالياً.',
              )}
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-xs font-semibold text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-olive/80">
              {text('Admin Email', 'البريد الإلكتروني للإدارة')}
            </label>
            <div className="relative">
              <Mail
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-olive/45 ${
                  isAr ? 'right-3.5' : 'left-3.5'
                }`}
              />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lematin.eg"
                dir="ltr"
                className={`w-full rounded-xl border border-kraft bg-cream/60 py-3 text-sm font-medium text-olive placeholder:text-olive/35 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/25 ${
                  isAr ? 'pr-10 pl-4 text-left' : 'pl-10 pr-4'
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-olive/80">
              {text('Password', 'كلمة المرور')}
            </label>
            <div className="relative">
              <Lock
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-olive/45 ${
                  isAr ? 'right-3.5' : 'left-3.5'
                }`}
              />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className={`w-full rounded-xl border border-kraft bg-cream/60 py-3 text-sm font-medium text-olive placeholder:text-olive/35 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/25 ${
                  isAr ? 'px-10 text-left' : 'pl-10 pr-11'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? text('Hide password', 'إخفاء كلمة المرور')
                    : text('Show password', 'إظهار كلمة المرور')
                }
                className={`absolute top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-olive/55 transition-colors hover:bg-kraft/20 hover:text-olive ${
                  isAr ? 'left-2.5' : 'right-2.5'
                }`}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !supabaseReady}
            className="mt-2 w-full rounded-xl bg-olive py-3.5 text-sm font-bold text-cream shadow-md transition-all hover:bg-olive/90 disabled:opacity-60"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                <span>{text('Signing in…', 'جاري تسجيل الدخول…')}</span>
              </span>
            ) : (
              <span>{text('Sign In to Dashboard', 'دخول إلى لوحة التحكم')}</span>
            )}
          </Button>
        </form>

        {!isInstalled && canNativeInstall && (
          <div className="mt-5 border-t border-dashed border-kraft pt-4 text-center">
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream px-4 py-1.5 text-xs font-semibold text-olive transition-colors hover:bg-blush/30"
            >
              <Smartphone className="h-3.5 w-3.5 text-gold" />
              <span>{text('Install Dashboard App', 'تثبيت تطبيق لوحة التحكم')}</span>
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-olive/50">
        {text(
          'Protected Staff Portal · Le Matin chez Refka',
          'بوابة الإدارة المحمية · Le Matin chez Refka',
        )}
      </p>
    </div>
  )
}
