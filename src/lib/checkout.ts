import { calculateDeliveryFee, type SiteSettingsValues } from '@/stores/site-settings-store'
import { TRANSLATIONS, localizeBox, localizeComponentName, localizeItem } from '@/data/translations'
import type { CustomizedBoxSelection } from '@/types/box-builder'
import type { SelectionLine } from '@/stores/customer-store'

export const checkoutTotals = (subtotal: number, gift: boolean, settings: SiteSettingsValues) => {
  const delivery = calculateDeliveryFee(subtotal, settings.deliveryFee, settings.freeDeliveryThreshold)
  const giftFee = subtotal > 0 && gift && settings.enableGiftCards ? settings.giftCardFee : 0
  return { subtotal, delivery, giftFee, total: Math.round((subtotal + delivery + giftFee) * 100) / 100 }
}

/** After the Cairo cutoff, the next available baking day is the day after tomorrow. */
export const earliestDeliveryDate = (cutoff: string, now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const part = (type: string) => parts.find(p => p.type === type)!.value
  const day = new Date(`${part('year')}-${part('month')}-${part('day')}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() + (`${part('hour')}:${part('minute')}` >= cutoff ? 2 : 1))
  return day.toISOString().slice(0, 10)
}
export interface CheckoutDetails {
  name: string; phone: string; address: string; deliveryDate: string; deliverySlot: string; note: string; giftMessage: string; gift: boolean
}
export const orderMessage = (settings: SiteSettingsValues, boxes: CustomizedBoxSelection[], lines: SelectionLine[], details?: CheckoutDetails, orderId?: string) => {
  const lang = settings.activeLanguage
  const t = TRANSLATIONS[lang]
  const arabic = lang === 'ar'
  const money = (value: number) => `${value.toLocaleString(arabic ? 'ar-EG' : 'en-GB')} ${arabic ? 'ج.م' : 'EGP'}`
  const subtotal = boxes.reduce((sum, box) => sum + box.totalPrice, 0) + lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const totals = checkoutTotals(subtotal, details?.gift ?? false, settings)
  return [
    arabic ? settings.whatsappHeaderNoteAr : settings.whatsappHeaderNoteEn,
    orderId ? `${arabic ? 'رقم الطلب' : 'Order'}: ${orderId}` : '',
    '───────────────',
    ...boxes.flatMap(box => {
      const boxTitle = lang === 'ar' && box.boxNameAr
        ? box.boxNameAr
        : localizeBox({ id: box.boxId, name: box.boxName, description: '' }, lang).name
      return [
        `• ${box.quantity} × ${boxTitle} — ${money(box.totalPrice)}`,
        ...box.swapDetails.map(swap => {
          const compTitle = lang === 'ar' && swap.componentNameAr
            ? swap.componentNameAr
            : localizeComponentName({ id: swap.componentId, name: swap.componentName }, lang)
          const itemTitle = lang === 'ar' && swap.itemNameAr
            ? swap.itemNameAr
            : localizeItem({ id: swap.itemId, name: swap.itemName }, lang).name
          const priceNote = swap.priceModifier !== 0
            ? ` (${swap.priceModifier > 0 ? '+' : ''}${money(swap.priceModifier)})`
            : swap.isDefault
              ? ''
              : ` (${arabic ? 'بديل مختار' : 'Swapped'})`
          return `  ↳ ${compTitle}: ${itemTitle}${priceNote}`
        }),
        box.customNotes ? `  📝 ${t.builder.specialNotesLabel}: ${box.customNotes}` : '',
      ]
    }),
    ...lines.map(line => `• ${line.quantity} × ${localizeItem({ id: line.itemId, name: line.name }, lang).name} — ${money(line.lineTotal)}`),
    '───────────────',
    `${t.contact.subtotal}: ${money(totals.subtotal)}`,
    `${t.contact.deliveryFee}: ${totals.delivery === 0 ? t.menu.freeDelivery : money(totals.delivery)}`,
    details?.gift && settings.enableGiftCards
      ? [
          `${t.contact.giftCardFeeLabel}: ${totals.giftFee === 0 ? t.contact.complimentary : money(totals.giftFee)}`,
          details.giftMessage?.trim() ? `  💌 "${details.giftMessage.trim()}"` : '',
        ].filter(Boolean).join('\n')
      : '',
    `${t.contact.grandTotal}: ${money(totals.total)}`,
    details ? [
      '───────────────',
      `${t.contact.nameLabel}: ${details.name}`,
      `${t.contact.phoneLabel}: ${details.phone}`,
      `${t.contact.addressLabel}: ${details.address}`,
      `${t.contact.dateLabel}: ${details.deliveryDate}`,
      `${t.contact.slotLabel}: ${details.deliverySlot}`,
      details.note?.trim() ? `${t.builder.specialNotesLabel}: ${details.note.trim()}` : '',
    ].filter(Boolean).join('\n') : '',
  ].filter(Boolean).join('\n')
}
