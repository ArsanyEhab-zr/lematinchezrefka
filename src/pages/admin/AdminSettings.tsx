import { CloudIntegrations } from '@/components/admin/CloudIntegrations'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Globe, MessageCircle, ChefHat, Gift, Plus, Trash2 } from 'lucide-react'
import { useSiteSettingsStore, CMS_SETTINGS_KEYS, buildDynamicWhatsAppLink, type SiteSettingsValues } from '@/stores/site-settings-store'
import { isValidWhatsAppPhone, normalizeWhatsAppPhone } from '@/lib/phone'
import { hasSettingsBackend, saveSiteSettings, settingsSchema } from '@/lib/site-settings-sync'
import { useTranslation } from '@/data/translations'
import { Button } from '@/components/ui/button'

const inputClass = 'mt-2 w-full rounded-xl border border-kraft bg-cream p-3 text-sm text-olive'
const Card = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <section className="rounded-2xl border-2 border-dashed border-[#D9C3A9] bg-[#FDFBF7] p-6 sm:p-8">
    <h2 className="mb-6 flex items-center gap-3 font-display text-xl font-bold">{icon}{title}</h2>
    <div className="grid gap-6 sm:grid-cols-2">{children}</div>
  </section>
)

export const AdminSettings = () => {
  const settings = useSiteSettingsStore(useShallow(state => ({ ...state })))
  const { lang, toggleLanguage } = useTranslation()
  const label = (en: string, ar: string) => lang === 'ar' ? ar : en
  const [draft, setDraft] = useState<SiteSettingsValues>(() => ({ ...settings }))
  const [dirty, setDirty] = useState(false)
  const [slot, setSlot] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const syncedJson = JSON.stringify(settingsSchema.safeParse(settings))
  useEffect(() => {
    if (!dirty) setDraft({ ...useSiteSettingsStore.getState() })
  }, [syncedJson, dirty])
  const change = <K extends keyof SiteSettingsValues>(key: K, value: SiteSettingsValues[K]) => {
    setDirty(true)
    setDraft(previous => ({ ...previous, [key]: value }))
  }
  const field = (key: keyof SiteSettingsValues, title: string, type = 'text', hint?: string) => (
    <label className="block text-sm font-semibold" key={key}>{title}
      <input aria-label={title} className={inputClass} type={type} value={String(draft[key])} dir={key.endsWith('Ar') ? 'rtl' : key.endsWith('En') || type === 'url' || type === 'tel' || type === 'time' ? 'ltr' : undefined}
        min={type === 'number' ? 0 : undefined} step={type === 'number' ? '0.01' : undefined}
        onChange={e => change(key, type === 'number' ? (e.target.value === '' ? NaN : Number(e.target.value)) : e.target.value)} />
      {hint && <span className="mt-2 block text-xs font-normal text-olive/70">{hint}</span>}
    </label>
  )
  const toggle = (key: keyof SiteSettingsValues, title: string) => (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl bg-blush/30 p-4 text-sm font-semibold">
      {title}<input type="checkbox" role="switch" checked={Boolean(draft[key])} onChange={e => change(key, e.target.checked)} className="h-5 w-5 accent-[#3E422B]" />
    </label>
  )
  const validPhone = !draft.whatsappNumber.trim() || isValidWhatsAppPhone(draft.whatsappNumber)
  const save = async (event: FormEvent) => {
    event.preventDefault()
    const normalizedDraft = { ...draft, whatsappNumber: normalizeWhatsAppPhone(draft.whatsappNumber) }
    const result = settingsSchema.safeParse(normalizedDraft)
    if (!result.success) { setStatus(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(' ')); return }
    setSaving(true); setStatus('')
    try {
      await saveSiteSettings({ ...draft, whatsappNumber: result.data.whatsappNumber, ...Object.fromEntries(CMS_SETTINGS_KEYS.filter(key => !['whatsappNumber', 'facebookUrl', 'instagramUrl'].includes(key)).map(key => [key, useSiteSettingsStore.getState()[key]])) })
      setDraft(prev => ({ ...prev, whatsappNumber: result.data.whatsappNumber }))
      setDirty(false); setStatus(label('Settings saved.', 'تم حفظ الإعدادات.'))
    }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to save settings.') }
    finally { setSaving(false) }
  }

  return <div className="space-y-8 pb-12">
    <div><p className="text-sm font-semibold text-gold">Le Matin · {label('Kitchen notebook', 'دفتر المطبخ')}</p>
      <h1 className="mt-2 font-display text-3xl font-bold">{label('Site & Kitchen Settings', 'إعدادات الموقع والمطبخ')}</h1>
      <p className="mt-3 max-w-2xl text-sm text-olive/75">{hasSettingsBackend()
        ? label('Save to update every storefront. Shared changes arrive within five seconds.', 'احفظ لتحديث المتجر لدى جميع العملاء خلال خمس ثوانٍ.')
        : label('Local preview mode: saved changes apply to this browser and its open tabs. Configure Supabase for shared settings across devices.', 'وضع المعاينة المحلية: تُحفظ التغييرات في هذا المتصفح وتبويباته. اربط Supabase لمزامنة الأجهزة.')}</p>
    </div>
    <CloudIntegrations />
    <form onSubmit={save} className="space-y-6">
      <Card title={label('Language & Localization', 'اللغة والترجمة')} icon={<Globe className="text-gold" />}>
        <label className="text-sm font-semibold">{label('Default storefront language', 'لغة المتجر الافتراضية')}
          <select aria-label={label('Default storefront language', 'لغة المتجر الافتراضية')} className={inputClass} value={draft.defaultLanguage} onChange={e => change('defaultLanguage', e.target.value as 'ar' | 'en')}>
            <option value="en">English · LTR</option><option value="ar">العربية · RTL</option>
          </select>
        </label>
        {toggle('enableLanguageSwitcher', label('Show AR / EN switcher', 'إظهار زر تغيير اللغة'))}
        <Button type="button" variant="outline" onClick={toggleLanguage}>{label('Preview Arabic', 'معاينة الإنجليزية')}</Button>
      </Card>
      <Card title={label('WhatsApp & Social Channels', 'واتساب ووسائل التواصل')} icon={<MessageCircle className="text-gold" />}>
        <div>{field('whatsappNumber', label('WhatsApp order number', 'رقم واتساب للطلبات'), 'tel', label('Country code or local 01x number (auto-formatted). Example: 201000000000', 'رمز الدولة أو رقم موبايل يبدأ بـ 01 (يُنسّق تلقائياً). مثال: 201000000000'))}
          {!validPhone && <p role="alert" className="mt-2 text-sm text-red-700">{label('Enter 8–15 digits, or an 11-digit Egyptian mobile starting with 01.', 'أدخل ٨–١٥ رقماً أو رقم هاتف مصري يبدأ بـ 01.')}</p>}
        </div>
        <div className="self-end"><Button type="button" variant="outline" disabled={!isValidWhatsAppPhone(draft.whatsappNumber)} onClick={() => window.open(buildDynamicWhatsAppLink(lang === 'ar' ? draft.whatsappHeaderNoteAr : draft.whatsappHeaderNoteEn, draft.whatsappNumber), '_blank', 'noopener,noreferrer')}>{label('Send Test WhatsApp Message', 'اختبار رسالة واتساب')}</Button></div>
        {field('facebookUrl', label('Facebook page URL', 'رابط فيسبوك'), 'url')}
        {field('instagramUrl', label('Instagram URL', 'رابط إنستغرام'), 'url')}
        {field('whatsappHeaderNoteAr', label('Order greeting · Arabic', 'مقدمة الطلب · العربية'))}
        {field('whatsappHeaderNoteEn', label('Order greeting · English', 'مقدمة الطلب · الإنجليزية'))}
      </Card>
      <Card title={label('Kitchen, Delivery & Time Slots', 'المطبخ والتوصيل والمواعيد')} icon={<ChefHat className="text-gold" />}>
        {toggle('isAcceptingOrders', draft.isAcceptingOrders ? label('Accepting Orders', 'نستقبل الطلبات') : label('Kitchen Full / Busy Mode', 'المطبخ مكتمل / مشغول'))}
        {field('dailyCutoffTime', label('Daily cutoff · Cairo time', 'آخر موعد للطلب · توقيت القاهرة'), 'time')}
        {field('busyModeMessageAr', label('Busy message · Arabic', 'رسالة الانشغال · العربية'))}
        {field('busyModeMessageEn', label('Busy message · English', 'رسالة الانشغال · الإنجليزية'))}
        {field('deliveryFee', label('Delivery fee (EGP)', 'رسوم التوصيل (ج.م)'), 'number')}
        {field('freeDeliveryThreshold', label('Free delivery threshold (EGP)', 'حد التوصيل المجاني (ج.م)'), 'number', label('0 disables free delivery.', 'الصفر يلغي التوصيل المجاني.'))}
        {field('minOrderAmount', label('Minimum order subtotal (EGP)', 'الحد الأدنى للطلب (ج.م)'), 'number')}
        <div className="sm:col-span-2"><h3 className="font-semibold">{label('Morning delivery slots', 'مواعيد التوصيل الصباحية')}</h3>
          <ul className="my-4 space-y-2">{draft.deliveryTimeSlots.map((value, i) => <li key={value} className="flex items-center justify-between gap-4 rounded-xl bg-blush/20 px-4 py-2"><bdi>{value}</bdi><button type="button" disabled={draft.deliveryTimeSlots.length === 1} aria-label={`${label('Remove', 'حذف')} ${value}`} onClick={() => change('deliveryTimeSlots', draft.deliveryTimeSlots.filter((_, index) => index !== i))} className="p-3 disabled:opacity-30"><Trash2 size={18} /></button></li>)}</ul>
          <div className="flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1 text-sm">{label('New time slot', 'موعد جديد')}<input className={inputClass} value={slot} onChange={e => setSlot(e.target.value)} placeholder="07:00 AM – 09:00 AM" /></label><Button type="button" disabled={!slot.trim() || draft.deliveryTimeSlots.includes(slot.trim())} onClick={() => { change('deliveryTimeSlots', [...draft.deliveryTimeSlots, slot.trim()]); setSlot('') }}><Plus size={16} />{label('Add slot', 'إضافة موعد')}</Button></div>
        </div>
      </Card>
      <Card title={label('Storefront Promo & Gifting', 'إعلانات المتجر والهدايا')} icon={<Gift className="text-gold" />}>
        {toggle('announcementBarActive', label('Show announcement banner', 'عرض شريط الإعلان'))}
        {toggle('enableGiftCards', label('Handwritten calligraphy gift cards', 'بطاقات هدايا مكتوبة بخط اليد'))}
        {field('announcementTextAr', label('Announcement · Arabic', 'الإعلان · العربية'))}
        {field('announcementTextEn', label('Announcement · English', 'الإعلان · الإنجليزية'))}
        {field('giftCardFee', label('Gift card fee (EGP)', 'رسوم بطاقة الهدية (ج.م)'), 'number', label('0 means complimentary.', 'الصفر يعني مجاناً.'))}
      </Card>
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-kraft bg-cream p-5 shadow-lg">
        <p role="status" aria-live="polite" className="max-w-2xl text-sm">{status || label('Changes apply after saving.', 'تُطبق التغييرات بعد الحفظ.')}</p>
        <Button type="submit" variant="cta" disabled={saving}>{saving ? label('Saving…', 'جارٍ الحفظ…') : label('Save settings', 'حفظ الإعدادات')}</Button>
      </div>
    </form>
  </div>
}
