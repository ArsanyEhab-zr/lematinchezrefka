import { hrefFor } from '@/stores/navigation-store'
import { useEffect, useState, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Facebook, Instagram, Music2, MessageCircle, MapPin, Mail } from 'lucide-react'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { CmsPublishing } from '@/components/admin/CmsPublishing'
import { useSiteSettingsStore, type SiteSettingsValues } from '@/stores/site-settings-store'
import { saveSiteSettings } from '@/lib/site-settings-sync'
import { safeExternalUrl, validContactEmail, validWhatsAppNumber } from '@/components/SocialLinks'
import { useTranslation } from '@/data/translations'

const Card = ({ title, children }: { title: string; children: ReactNode }) => <section className="rounded-2xl border-2 border-dashed border-[#D9C3A9] bg-cream p-5 sm:p-8"><h2 className="mb-6 font-display text-2xl font-bold">{title}</h2><div className="grid gap-6 md:grid-cols-2">{children}</div></section>
export const AdminBrandMedia = () => {
  const values = useSiteSettingsStore(useShallow(s => ({ logoUrl: s.logoUrl, logoDisplayMode: s.logoDisplayMode, faviconUrl: s.faviconUrl, siteTitleEn: s.siteTitleEn, siteTitleAr: s.siteTitleAr, heroImageUrl: s.heroImageUrl, storyImage1Url: s.storyImage1Url, storyImage2Url: s.storyImage2Url, storyImage3Url: s.storyImage3Url, facebookUrl: s.facebookUrl, instagramUrl: s.instagramUrl, tiktokUrl: s.tiktokUrl, whatsappNumber: s.whatsappNumber, googleMapsUrl: s.googleMapsUrl, contactEmail: s.contactEmail })))
  const dirty = useSiteSettingsStore(s => s.hasUnpublishedMedia)
  const update = useSiteSettingsStore(s => s.updateCmsSettings)
  const { lang } = useTranslation()
  const text = (en: string, ar: string) => lang === 'ar' ? ar : en
  const [error, setError] = useState('')
  const change = (patch: Partial<SiteSettingsValues>) => { try { update(patch); setError('') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save.') } }
  const field = (key: keyof typeof values, title: string, type = 'text', icon?: ReactNode) => <CmsTextField key={key} title={title} value={values[key]} type={type} icon={icon} direction={key.endsWith('Ar') ? 'rtl' : 'ltr'} commit={value => update({ [key]: value })} />
  const media = (key: 'logoUrl' | 'faviconUrl' | 'heroImageUrl' | 'storyImage1Url' | 'storyImage2Url' | 'storyImage3Url', label: string) => <MediaPicker key={key} label={label} value={values[key]} onChange={source => update({ [key]: source })} />
  return <div className="space-y-8 pb-10">
    <div><p className="text-sm font-semibold text-gold">Le Matin · {text('Visual atelier', 'الاستوديو البصري')}</p><h1 className="mt-2 font-display text-3xl font-bold">{text('Brand, Media & Socials CMS', 'إدارة الهوية والصور والتواصل')}</h1><p className="mt-3 max-w-2xl text-sm text-olive/75">{text('Shape the first impression: your logo, your photography, and every way to reach your kitchen.', 'شكّل الانطباع الأول: شعارك وصورك وكل وسيلة للتواصل مع مطبخك.')}</p></div>
    <CmsPublishing dirty={dirty} publish={() => saveSiteSettings(useSiteSettingsStore.getState())} />
    {error && <p role="alert" className="rounded-xl bg-blush p-4">{error}</p>}
    <Card title={text('Brand Logo & Browser Tab', 'الشعار وعنوان المتصفح')}>
      {media('logoUrl', text('Navbar brand logo', 'شعار شريط التنقل'))}
      {media('faviconUrl', text('Browser favicon', 'أيقونة المتصفح'))}
      <label className="text-sm font-semibold">{text('Logo display mode', 'طريقة عرض الشعار')}<select aria-label={text('Logo display mode', 'طريقة عرض الشعار')} value={values.logoDisplayMode} onChange={event => change({ logoDisplayMode: event.target.value as SiteSettingsValues['logoDisplayMode'] })} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3"><option value="text_only">{text('Text only', 'النص فقط')}</option><option value="image_only">{text('Image logo only', 'صورة الشعار فقط')}</option><option value="both">{text('Image + text', 'الصورة والنص')}</option></select><span className="mt-2 block text-xs font-normal text-olive/70">{text('If no image is set, the brand name remains visible.', 'إذا لم تُحدد صورة، يبقى اسم المتجر ظاهراً.')}</span></label>
      <div className="space-y-4">{field('siteTitleEn', text('Browser tab title · English', 'عنوان المتصفح · الإنجليزية'))}{field('siteTitleAr', text('Browser tab title · Arabic', 'عنوان المتصفح · العربية'))}</div>
    </Card>
    <Card title={text('Hero & Our Story Photography', 'صور الواجهة وقصتنا')}>
      {media('heroImageUrl', text('Home hero image', 'صورة الواجهة الرئيسية'))}
      {media('storyImage1Url', text('Our Story image 1', 'صورة قصتنا ١'))}
      {media('storyImage2Url', text('Our Story image 2', 'صورة قصتنا ٢'))}
      {media('storyImage3Url', text('Our Story image 3', 'صورة قصتنا ٣'))}
    </Card>
    <p className="rounded-2xl border-2 border-dashed border-kraft p-5 text-sm"><a href={hrefFor('admin-boxes')} className="font-semibold text-gold-deep">{text('Manage breakfast box images in Box Configurator →', 'إدارة صور بوكسات الإفطار من إعدادات البوكسات ←')}</a></p>
    <Card title={text('Social Channels & Contact', 'قنوات التواصل وبيانات الاتصال')}>
      {field('facebookUrl', text('Facebook page URL', 'رابط صفحة فيسبوك'), 'url', <Facebook size={18} />)}
      {field('instagramUrl', text('Instagram URL', 'رابط إنستغرام'), 'url', <Instagram size={18} />)}
      {field('tiktokUrl', text('TikTok URL', 'رابط تيك توك'), 'url', <Music2 size={18} />)}
      {field('whatsappNumber', text('WhatsApp order number', 'رقم واتساب للطلبات'), 'tel', <MessageCircle size={18} />)}
      {field('googleMapsUrl', text('Google Maps location URL', 'رابط الموقع على خرائط جوجل'), 'url', <MapPin size={18} />)}
      {field('contactEmail', text('Contact email', 'البريد الإلكتروني للتواصل'), 'email', <Mail size={18} />)}
      <p className="text-xs text-olive/70 md:col-span-2">{text('Leave a channel blank to hide it. URLs must begin with https://. WhatsApp uses 8–15 digits with the country code.', 'اترك الحقل فارغاً لإخفاء القناة. تبدأ الروابط بـ https://، ورقم واتساب من ٨ إلى ١٥ رقماً مع رمز الدولة.')}</p>
    </Card>
  </div>
}

const CmsTextField = ({ title, value, type, direction, icon, commit }: { title: string; value: string; type: string; direction: 'rtl' | 'ltr'; icon?: ReactNode; commit: (value: string) => void }) => {
  const [draft, setDraft] = useState(value), [error, setError] = useState('')
  const { lang } = useTranslation()
  useEffect(() => setDraft(value), [value])
  const save = () => {
    const clean = draft.trim()
    const valid = type === 'url' ? !clean || Boolean(safeExternalUrl(clean)) : type === 'email' ? !clean || validContactEmail(clean) : type === 'tel' ? !clean || validWhatsAppNumber(clean) : Boolean(clean)
    if (!valid) { setError(lang === 'ar' ? 'يرجى إدخال قيمة صحيحة.' : 'Enter a valid value before leaving this field.'); return }
    try { commit(clean); setError('') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save.') }
  }
  return <label className="min-w-0 text-sm font-semibold"><span className="flex items-center gap-2">{icon}{title}</span><input aria-label={title} aria-invalid={Boolean(error)} type={type} dir={direction} value={draft} onChange={event => setDraft(event.target.value)} onBlur={save} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); save() } }} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3" />{error && <span role="alert" className="mt-2 block text-xs text-red-700">{error}</span>}</label>
}
