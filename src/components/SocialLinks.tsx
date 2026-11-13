import { Facebook, Instagram, Music2, MessageCircle, MapPin, Mail } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useSiteSettingsStore, buildDynamicWhatsAppLink } from '@/stores/site-settings-store'
import { useTranslation } from '@/data/translations'
import { isValidWhatsAppPhone } from '@/lib/phone'
import { cn } from '@/lib/utils'
export const safeExternalUrl = (value: string) => { try { return new URL(value).protocol === 'https:' ? value : '' } catch { return '' } }
export const validWhatsAppNumber = isValidWhatsAppPhone
export const validContactEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
export const SocialLinks = ({ compact = false, className }: { compact?: boolean; className?: string }) => {
  const values = useSiteSettingsStore(useShallow(s => ({ facebookUrl: s.facebookUrl, instagramUrl: s.instagramUrl, tiktokUrl: s.tiktokUrl, googleMapsUrl: s.googleMapsUrl, contactEmail: s.contactEmail, whatsappNumber: s.whatsappNumber, whatsappHeaderNoteAr: s.whatsappHeaderNoteAr, whatsappHeaderNoteEn: s.whatsappHeaderNoteEn })))
  const { lang, t } = useTranslation()
  const links = [
    { label: t.footer.facebookPage, url: safeExternalUrl(values.facebookUrl), Icon: Facebook },
    { label: t.footer.instagramPage, url: safeExternalUrl(values.instagramUrl), Icon: Instagram },
    { label: lang === 'ar' ? 'تيك توك' : 'TikTok', url: safeExternalUrl(values.tiktokUrl), Icon: Music2 },
    { label: t.contact.phoneWhatsAppTitle, url: validWhatsAppNumber(values.whatsappNumber) ? buildDynamicWhatsAppLink(lang === 'ar' ? values.whatsappHeaderNoteAr : values.whatsappHeaderNoteEn, values.whatsappNumber) : '', Icon: MessageCircle },
    { label: lang === 'ar' ? 'خرائط جوجل' : 'Google Maps', url: safeExternalUrl(values.googleMapsUrl), Icon: MapPin },
    { label: t.contact.emailTitle, url: validContactEmail(values.contactEmail) ? `mailto:${values.contactEmail}` : '', Icon: Mail },
  ]
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{links.filter(link => link.url).map(({ label, url, Icon }) => <a key={label} href={url} aria-label={label} title={label} target={url.startsWith('https:') ? '_blank' : undefined} rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dashed border-kraft/60 px-3 py-2 text-xs transition-colors hover:bg-blush/20"><Icon size={16} aria-hidden="true" />{!compact && <span>{label}</span>}</a>)}</div>
}
