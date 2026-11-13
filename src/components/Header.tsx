import { BrandMark } from '@/components/BrandMark'
import { SocialLinks, validWhatsAppNumber } from '@/components/SocialLinks'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { useTranslation } from '@/data/translations'
import { useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Menu, X, ShoppingBag, Heart } from 'lucide-react'
import { hrefFor, useNavigation, type Route } from '@/stores/navigation-store'
import { selectionCount, useCustomerStore } from '@/stores/customer-store'
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE } from '@/data/site'
import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Header = () => {
  const { t, lang } = useTranslation()
  const settings = useSiteSettingsStore(useShallow(state => ({ ...state })))
  const NAV_LINKS: Array<{ route: Route; label: string }> = [
    { route: 'home', label: t.nav.home }, { route: 'menu', label: t.nav.menu },
    { route: 'about', label: t.nav.about }, { route: 'contact', label: t.nav.contact },
  ]
  const { route, navigate } = useNavigation(useShallow(state => ({ route: state.route, navigate: state.navigate })))
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { selection, customizedBoxes } = useCustomerStore(
    useShallow((state) => ({
      selection: state.selection,
      customizedBoxes: state.customizedBoxes,
    }))
  )
  const totalItems = useMemo(
    () => selectionCount(selection, customizedBoxes),
    [selection, customizedBoxes]
  )

  const handleNavClick = (targetRoute: Route) => {
    navigate(targetRoute)
    setIsMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-kraft/40 bg-cream/90 backdrop-blur-md transition-colors">
      {/* Top micro-announcement banner */}
      {settings.announcementBarActive && <div className="border-b border-kraft/30 bg-blush/40 px-4 py-1 text-center text-xs font-medium text-olive">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3 w-3 fill-gold text-gold" aria-hidden="true" />
          <span>{lang === 'ar' ? settings.announcementTextAr : settings.announcementTextEn}</span>
        </span>
      </div>}
      {!settings.isAcceptingOrders && <p role="status" className="bg-blush px-4 py-3 text-center text-sm">{lang === 'ar' ? settings.busyModeMessageAr : settings.busyModeMessageEn}</p>}

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Navigation links (Desktop) */}
        <nav aria-label={t.footer.navigationTitle} className="hidden lg:flex lg:items-center lg:gap-8">
          {NAV_LINKS.slice(0, 2).map((item) => {
            const isActive = route === item.route
            return (
              <a
                key={item.route}
                href={hrefFor(item.route)}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item.route)
                }}
                className={cn(
                  'relative text-sm font-semibold tracking-[0.03em] transition-colors',
                  isActive ? 'text-gold' : 'text-olive hover:text-gold',
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-gold" aria-hidden="true" />
                )}
              </a>
            )
          })}
        </nav>

        {/* Center: Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <a
            href={hrefFor('home')}
            onClick={(e) => {
              e.preventDefault()
              handleNavClick('home')
            }}
            className="group flex flex-col items-center"
          >
            <BrandMark />
          </a>
        </div>

        {/* Right: Secondary nav + Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav aria-label={t.footer.navigationTitle} className="hidden lg:flex lg:items-center lg:gap-8">
            {NAV_LINKS.slice(2).map((item) => {
              const isActive = route === item.route
              return (
                <a
                  key={item.route}
                  href={hrefFor(item.route)}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.route)
                  }}
                  className={cn(
                    'relative text-sm font-semibold tracking-[0.03em] transition-colors',
                    isActive ? 'text-gold' : 'text-olive hover:text-gold',
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-gold" aria-hidden="true" />
                  )}
                </a>
              )
            })}
          </nav>

          {settings.enableLanguageSwitcher && <div dir="ltr" className="flex rounded-full border border-dashed border-kraft p-1" aria-label="Language">
            {(['ar', 'en'] as const).map(language => <button key={language} type="button" lang={language} aria-pressed={lang === language} onClick={() => settings.setActiveLanguage(language)} className={cn('rounded-full px-2 py-2 text-xs font-bold', lang === language && 'bg-olive text-cream')}>{language.toUpperCase()}</button>)}
          </div>}
          {/* Cart / Selection Indicator */}
          <button
            type="button"
            onClick={() => handleNavClick('menu')}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-kraft bg-cream text-olive transition-colors hover:border-gold hover:bg-blush/30"
            aria-label={`${t.menu.yourBreakfastOrder} (${totalItems})`}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6875rem] font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {/* WhatsApp Direct CTA button (Desktop) */}
          {validWhatsAppNumber(settings.whatsappNumber) && <div className="hidden sm:block">
            <ButtonLink
              variant="cta"
              size="sm"
              href={buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.nav.orderWhatsApp}
            >
              {t.nav.orderWhatsApp}</ButtonLink>
          </div>

          }

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-kraft bg-cream text-olive lg:hidden"
            aria-expanded={isMobileOpen}
            aria-label={lang === 'ar' ? (isMobileOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (isMobileOpen ? 'Close menu' : 'Open menu')}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="border-b border-kraft bg-cream px-6 py-6 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.route}
                href={hrefFor(item.route)}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item.route)
                }}
                className={cn(
                  'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                  route === item.route ? 'bg-blush/60 text-gold' : 'text-olive hover:bg-blush/30',
                )}
              >
                {item.label}
              </a>
            ))}
            <SocialLinks compact />
            <div className="mt-2 flex flex-col gap-3 pt-4 border-t border-kraft/40">
              {validWhatsAppNumber(settings.whatsappNumber) && <ButtonLink
                variant="cta"
                size="md"
                href={buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center"
              >
                {t.nav.orderWhatsApp}</ButtonLink>}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

