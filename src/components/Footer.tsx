import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  Heart,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Music2,
} from 'lucide-react'
import { safeExternalUrl, validWhatsAppNumber } from '@/components/SocialLinks'
import { useSiteSettingsStore, buildDynamicWhatsAppLink } from '@/stores/site-settings-store'
import { useTranslation } from '@/data/translations'
import { hrefFor, useNavigation, type Route } from '@/stores/navigation-store'
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE } from '@/data/site'

export const Footer = () => {
  const { lang, t } = useTranslation()
  const settings = useSiteSettingsStore(useShallow((state) => ({ ...state })))
  const navigate = useNavigation((state) => state.navigate)
  const [failedLogoSrc, setFailedLogoSrc] = useState('')

  const logoSrc =
    settings.logoUrl && failedLogoSrc !== settings.logoUrl
      ? settings.logoUrl
      : '/brand-logo.png'

  const hasWhatsApp = validWhatsAppNumber(settings.whatsappNumber)
  const headerGreeting =
    lang === 'ar' ? settings.whatsappHeaderNoteAr : settings.whatsappHeaderNoteEn

  const socialIcons = [
    {
      label: t.footer.facebookPage,
      url: safeExternalUrl(settings.facebookUrl),
      Icon: Facebook,
    },
    {
      label: t.footer.instagramPage,
      url: safeExternalUrl(settings.instagramUrl),
      Icon: Instagram,
    },
    {
      label: lang === 'ar' ? 'تيك توك' : 'TikTok',
      url: safeExternalUrl(settings.tiktokUrl),
      Icon: Music2,
    },
    {
      label: t.contact.phoneWhatsAppTitle,
      url: hasWhatsApp
        ? buildDynamicWhatsAppLink(headerGreeting, settings.whatsappNumber)
        : '',
      Icon: MessageCircle,
    },
  ].filter((item) => Boolean(item.url))

  const quickLinks: Array<{ route: Route; label: string }> = [
    { route: 'home', label: t.nav.home },
    { route: 'menu', label: t.nav.menu },
    { route: 'about', label: t.nav.about },
    { route: 'contact', label: t.nav.contact },
  ]

  return (
    <footer className="mt-12 border-t-2 border-kraft/30 bg-[#3E422B] text-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        {/* Streamlined 3-Column Grid */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3 md:gap-8">
          {/* Column 1: Brand Identity */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt={t.brand.name}
                onError={() => setFailedLogoSrc(logoSrc)}
                className="h-11 w-11 shrink-0 rounded-full border border-[#D9C3A9]/40 bg-cream object-cover"
              />
              <div className="min-w-0">
                <span className="block font-display text-lg font-bold tracking-tight text-[#FDFBF7]">
                  {t.brand.name}
                </span>
                <span className="-mt-0.5 block font-script text-base text-[#B08248]">
                  {t.brand.tagline}
                </span>
              </div>
            </div>

            <p className="mt-2.5 line-clamp-2 max-w-xs text-xs leading-relaxed text-[#FDFBF7]/75">
              {t.footer.manifesto}
            </p>

            {socialIcons.length > 0 && (
              <div className="mt-3.5 flex items-center gap-2">
                {socialIcons.map(({ label, url, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-[#D9C3A9]/35 text-[#FDFBF7]/80 transition-colors hover:border-[#B08248] hover:bg-cream/10 hover:text-[#B08248]"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="flex flex-col">
            <h3 className="font-display text-sm font-semibold tracking-wide text-[#FDFBF7]">
              {t.footer.navigationTitle}
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs text-[#FDFBF7]/80">
              {quickLinks.map(({ route, label }) => (
                <li key={route}>
                  <a
                    href={hrefFor(route)}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(route)
                    }}
                    className="inline-block transition-colors hover:text-[#B08248]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Dispatch */}
          <div className="flex flex-col items-start">
            <h3 className="font-display text-sm font-semibold tracking-wide text-[#FDFBF7]">
              {t.footer.directContactTitle}
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs text-[#FDFBF7]/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B08248]" />
                <span>{t.common.deliveryArea}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#B08248]" />
                <span>
                  {settings.deliveryTimeSlots.map((value, index) => (
                    <span key={value}>
                      {index > 0 && ' · '}
                      <bdi>{value}</bdi>
                    </span>
                  ))}
                </span>
              </li>
              {hasWhatsApp && (
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#B08248]" />
                  <a
                    dir="ltr"
                    href={`tel:+${settings.whatsappNumber}`}
                    className="transition-colors hover:text-[#B08248]"
                  >
                    {settings.whatsappNumber}
                  </a>
                </li>
              )}
            </ul>

            {hasWhatsApp && (
              <a
                href={buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#B08248]/70 bg-cream/5 px-4 py-2 text-xs font-semibold text-[#FDFBF7] transition-colors hover:border-[#F2D5D5] hover:bg-cream/15"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#B08248]" />
                <span>{t.footer.chatOnWhatsApp}</span>
              </a>
            )}
          </div>
        </div>

        {/* Single Unified Bottom Bar: Copyright & English LTR Developer Signature */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-dashed border-[#D9C3A9]/20 pt-4 text-[11px] sm:flex-row">
          <p className="text-[#FDFBF7]/65">
            © 2026 {t.brand.name}. {t.footer.rightsReserved}
          </p>

          <p
            dir="ltr"
            lang="en"
            className="group flex flex-wrap items-center justify-center text-center"
          >
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#FDFBF7]/75">
              DESIGNED &amp; CRAFTED WITH
            </span>
            <Heart
              className="mx-1.5 inline h-3 w-3 shrink-0 fill-[#B08248] text-[#B08248] transition-colors duration-300 group-hover:fill-[#F2D5D5] group-hover:text-[#F2D5D5] motion-safe:animate-pulse"
              aria-label="love"
            />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#FDFBF7]/75">
              BY
            </span>
            <span className="ml-1.5 font-display text-sm font-medium italic tracking-normal text-[#B08248] transition-colors duration-300 group-hover:text-[#F2D5D5] group-hover:underline group-hover:underline-offset-4">
              Arsany Zika
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
