import { SocialLinks, validContactEmail, validWhatsAppNumber } from '@/components/SocialLinks'
import { useState, useEffect, useMemo, useRef, type FormEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { MessageCircle, Heart, ShoppingBag, Sparkles, X, ExternalLink } from 'lucide-react'
import { useTranslation, localizeBox, localizeComponentName, localizeItem } from '@/data/translations'
import { formatPrice, prefersReducedMotion } from '@/lib/utils'
import { checkoutTotals, earliestDeliveryDate, orderMessage } from '@/lib/checkout'
import { refreshSiteSettings, hasSettingsBackend } from '@/lib/site-settings-sync'
import { useSiteSettingsStore, buildDynamicWhatsAppLink } from '@/stores/site-settings-store'
import { useCustomerStore, selectionToLines, selectionTotal } from '@/stores/customer-store'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useNavigation } from '@/stores/navigation-store'
import { submitCustomerOrder } from '@/lib/submit-order'
import { SectionHeading } from '@/components/ui/section-heading'
import { Field, TextInput, TextArea, Select } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'

export const Contact = () => {
  const { t, lang } = useTranslation()
  const settings = useSiteSettingsStore(useShallow(state => ({ ...state })))
  const { profile, rememberProfile, forgetProfile, selection, customizedBoxes, removeCustomizedBox, clearSelection } = useCustomerStore(useShallow(s => ({
    profile: s.profile, rememberProfile: s.rememberProfile, forgetProfile: s.forgetProfile, selection: s.selection,
    customizedBoxes: s.customizedBoxes, removeCustomizedBox: s.removeCustomizedBox, clearSelection: s.clearSelection,
  })))
  const lines = useMemo(() => selectionToLines(selection), [selection])
  const subtotal = selectionTotal(lines, customizedBoxes)
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [date, setDate] = useState(() => earliestDeliveryDate(settings.dailyCutoffTime))
  const [slot, setSlot] = useState(settings.deliveryTimeSlots[0] ?? '')
  const [note, setNote] = useState('')
  const [gift, setGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [remember, setRemember] = useState(true)
  const { scrollTarget, clearScrollTarget } = useNavigation(useShallow(s => ({
    scrollTarget: s.scrollTarget,
    clearScrollTarget: s.clearScrollTarget,
  })))
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [dispatchUrl, setDispatchUrl] = useState('')
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [celebratingOrder, setCelebratingOrder] = useState<{ id: string; whatsappUrl: string; total: number } | null>(null)
  const redirectedRef = useRef<string | null>(null)
  const totals = checkoutTotals(subtotal, gift, settings)
  const minimumDate = earliestDeliveryDate(settings.dailyCutoffTime)
  const belowMinimum = subtotal < settings.minOrderAmount
  const canSubmit = validWhatsAppNumber(settings.whatsappNumber) && subtotal > 0 && !belowMinimum && settings.isAcceptingOrders && settings.deliveryTimeSlots.includes(slot) && date >= minimumDate
  useEffect(() => {
    if (!settings.deliveryTimeSlots.includes(slot)) setSlot(settings.deliveryTimeSlots[0] ?? '')
  }, [settings.deliveryTimeSlots, slot])
  useEffect(() => { if (date < minimumDate) setDate(minimumDate) }, [minimumDate, date])

  // Auto-scroll and focus directly on the checkout form when arriving from BoxBuilder / Menu
  useEffect(() => {
    if (scrollTarget !== 'checkout-form') return
    const frame = window.requestAnimationFrame(() => {
      const formEl = document.getElementById('checkout-form')
      if (formEl) {
        formEl.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      }
      const nameInput = document.getElementById('name')
      if (nameInput instanceof HTMLInputElement) {
        nameInput.focus({ preventScroll: true })
      }
      clearScrollTarget()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [scrollTarget, clearScrollTarget])

  // After showing the Order Confirmed celebration animation for 1.8s, trigger mobile-safe WhatsApp dispatch
  useEffect(() => {
    if (!celebratingOrder) return
    let closeTimer: number | undefined
    const timer = window.setTimeout(() => {
      if (redirectedRef.current === celebratingOrder.id) return
      redirectedRef.current = celebratingOrder.id
      const opened = window.open(celebratingOrder.whatsappUrl, '_blank', 'noopener,noreferrer')
      if (!opened || opened.closed) {
        setPopupBlocked(true)
        window.location.assign(celebratingOrder.whatsappUrl)
      } else {
        closeTimer = window.setTimeout(() => setCelebratingOrder(null), 400)
      }
    }, 1800)
    return () => {
      window.clearTimeout(timer)
      if (closeTimer) window.clearTimeout(closeTimer)
    }
  }, [celebratingOrder])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (sending) return
    setSending(true); setError(''); setPopupBlocked(false)
    try {
      if (hasSettingsBackend()) await refreshSiteSettings()
      const current = useSiteSettingsStore.getState()
      const builderState = useBoxBuilderStore.getState()
      if (!validWhatsAppNumber(current.whatsappNumber)) throw new Error(lang === 'ar' ? 'الطلب عبر واتساب غير متاح حالياً.' : 'WhatsApp ordering is currently unavailable.')
      if (!current.isAcceptingOrders) throw new Error(lang === 'ar' ? current.busyModeMessageAr : current.busyModeMessageEn)
      const reconciledBoxes = customizedBoxes.map((box) => {
        const enriched = builderState.getEnrichedBox(box.boxId)
        if (!enriched || !enriched.is_active || enriched.is_sold_out) {
          throw new Error(lang === 'ar'
            ? `عفواً، "${box.boxNameAr || box.boxName}" غير متاح حالياً. يرجى تحديث السلة.`
            : `Sorry, "${box.boxName}" is no longer available. Please update your selection.`)
        }
        const unitPrice = builderState.getCalculatedPrice(box.boxId, box.selectedSwaps)
        const itemsMap = new Map(builderState.items.map((item) => [item.id, item]))
        const freshSwapDetails = enriched.components.map((comp) => {
          const chosenId = box.selectedSwaps[comp.id] ?? comp.default_item_id
          const chosenItem = itemsMap.get(chosenId)
          if (!chosenItem || !chosenItem.is_available || chosenItem.is_sold_out) {
            throw new Error(lang === 'ar'
              ? `عفواً، المكوّن "${chosenItem?.name_ar || chosenItem?.name || ''}" غير متاح حالياً.`
              : `Sorry, "${chosenItem?.name || 'an ingredient'}" is currently out of stock.`)
          }
          const modOpt = comp.swap_options.find((so) => so.item_id === chosenId)
          return {
            componentId: comp.id,
            componentName: comp.name,
            componentNameAr: comp.name_ar || comp.name,
            itemId: chosenId,
            itemName: chosenItem.name,
            itemNameAr: chosenItem.name_ar || chosenItem.name,
            priceModifier: modOpt ? modOpt.price_modifier : 0,
            isDefault: chosenId === comp.default_item_id,
          }
        })
        return {
          ...box,
          boxName: enriched.name,
          boxNameAr: enriched.name_ar || enriched.name,
          basePrice: enriched.base_price,
          unitPrice,
          swapDetails: freshSwapDetails,
          totalPrice: unitPrice * box.quantity,
        }
      })
      const freshSubtotal = selectionTotal(lines, reconciledBoxes)
      if (freshSubtotal <= 0 || freshSubtotal < current.minOrderAmount) throw new Error(t.contact.minOrderWarning.replace('{min}', formatPrice(current.minOrderAmount)))
      if (!current.deliveryTimeSlots.includes(slot) || date < earliestDeliveryDate(current.dailyCutoffTime)) throw new Error(lang === 'ar' ? 'يرجى اختيار تاريخ وموعد توصيل متاحين.' : 'Please choose an available delivery date and time slot.')
      if (!name.trim() || !address.trim() || !/^\+?[\d\s()-]{8,22}$/.test(phone.trim())) throw new Error(lang === 'ar' ? 'يرجى مراجعة الاسم والعنوان ورقم الهاتف.' : 'Please check your name, address, and phone number.')
      const cleanName = name.trim()
      const cleanPhone = phone.trim()
      const cleanAddress = address.trim()
      const cleanNote = note.trim()
      const cleanGiftMessage = giftMessage.trim()
      const details = { name: cleanName, phone: cleanPhone, address: cleanAddress, deliveryDate: date, deliverySlot: slot, note: cleanNote, giftMessage: cleanGiftMessage, gift }
      const message = orderMessage(current, reconciledBoxes, lines, details)
      buildDynamicWhatsAppLink(message) // Validate the destination before creating a pending order.
      const finalTotals = checkoutTotals(freshSubtotal, gift, current)
      const created = await submitCustomerOrder({
        customer: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        lines: [...lines.map(l => ({ itemId: l.itemId, quantity: l.quantity })), ...reconciledBoxes.map(b => ({ itemId: b.boxId, quantity: b.quantity }))],
        deliveryDate: date,
        deliverySlot: slot,
        note: cleanNote || undefined,
        pricing: finalTotals,
        customizedBoxes: reconciledBoxes,
        giftMessage: gift && current.enableGiftCards ? cleanGiftMessage : undefined,
      })
      const url = buildDynamicWhatsAppLink(orderMessage(current, reconciledBoxes, lines, details, created.id))
      if (remember) rememberProfile({ name: cleanName, phone: cleanPhone, address: cleanAddress })
      setOrderId(created.id)
      setDispatchUrl(url)
      redirectedRef.current = null
      setCelebratingOrder({ id: created.id, whatsappUrl: url, total: finalTotals.total })
      clearSelection()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (lang === 'ar' ? 'تعذر إرسال الطلب.' : 'Unable to dispatch the order.'))
    } finally { setSending(false) }
  }

  return <div className="mx-auto max-w-7xl space-y-10 px-4 pt-4 sm:px-6 lg:px-8">
    <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} script={t.contact.script} intro={t.contact.intro} />
    <div className="grid gap-8 lg:grid-cols-12">
      <section className="rustic-card p-6 sm:p-8 lg:col-span-7">
        {profile && <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-blush/40 p-4 text-sm"><span><Heart className="inline h-4 w-4" /> {t.contact.welcomeBack.replace('{name}', profile.name)}</span><button type="button" onClick={() => { forgetProfile(); setName(''); setPhone(''); setAddress('') }}>{t.contact.clearProfile}</button></div>}
        {orderId && (
          <div role="status" className="mb-6 rounded-2xl border-2 border-[#25D366]/60 bg-[#25D366]/10 p-5 text-olive shadow-sm">
            <h2 className="font-display text-lg font-bold text-olive">{t.contact.orderSentTitle.replace('{id}', orderId)}</h2>
            <p className="mt-1.5 text-sm text-olive/80">
              {popupBlocked
                ? (lang === 'ar'
                    ? 'تم حفظ طلبك بنجاح! يبدو أن المتصفح منع فتح واتساب تلقائياً — اضغط على الزر الأخضر بالأسفل لإرسال الطلب فوراً.'
                    : 'Your order is saved! Your browser blocked the automatic tab — tap the WhatsApp button below to send it right now.')
                : t.contact.orderSentDesc}
            </p>
            <a
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] hover:bg-[#20bd5a]"
              href={dispatchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t.contact.confirmWhatsAppBtn}
            </a>
          </div>
        )}
        {!settings.isAcceptingOrders && <p role="status" className="mb-6 rounded-2xl bg-blush p-4">{lang === 'ar' ? settings.busyModeMessageAr : settings.busyModeMessageEn}</p>}
        <div className="mb-8 space-y-4 rounded-2xl border-2 border-dashed border-kraft p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><ShoppingBag size={18} />{t.contact.itemsInOrder}</h2>
          {customizedBoxes.map((box, index) => <div key={`${box.boxId}-${index}`} className="border-b border-dashed border-kraft pb-3 text-sm">
            <div className="flex justify-between gap-3"><strong>{box.quantity} × {localizeBox({ id: box.boxId, name: box.boxName, description: '' }, lang).name}</strong><bdi>{formatPrice(box.totalPrice)}</bdi></div>
            <ul className="mt-2 space-y-1 text-xs">{box.swapDetails.map(swap => <li key={swap.componentId}>{localizeComponentName({ id: swap.componentId, name: swap.componentName }, lang)}: {localizeItem({ id: swap.itemId, name: swap.itemName }, lang).name}{swap.priceModifier !== 0 && ` (${swap.priceModifier > 0 ? '+' : ''}${formatPrice(swap.priceModifier)})`}</li>)}</ul>
            {box.customNotes && <p className="mt-2 text-sm">{box.customNotes}</p>}
            <button type="button" onClick={() => removeCustomizedBox(index)} className="mt-2 text-xs font-semibold text-gold-deep">{t.contact.removeBtn}</button>
          </div>)}
          {lines.map(line => <p key={line.itemId} className="flex justify-between text-sm"><span>{line.quantity} × {localizeItem({ id: line.itemId, name: line.name }, lang).name}</span><bdi>{formatPrice(line.lineTotal)}</bdi></p>)}
          <dl className="space-y-2 text-sm">{[[t.contact.subtotal, formatPrice(subtotal)], [t.contact.deliveryFee, totals.delivery === 0 ? t.menu.freeDelivery : formatPrice(totals.delivery)], ...(gift && settings.enableGiftCards ? [[t.contact.giftCardFeeLabel, totals.giftFee ? formatPrice(totals.giftFee) : t.contact.complimentary]] : []), [t.contact.grandTotal, formatPrice(totals.total)]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-semibold"><bdi>{value}</bdi></dd></div>)}</dl>
          {(belowMinimum || subtotal === 0) && <p className="text-sm text-gold-deep">{t.contact.minOrderWarning.replace('{min}', formatPrice(settings.minOrderAmount))}</p>}
        </div>
        {!validWhatsAppNumber(settings.whatsappNumber) && <p role="status" className="mb-6 rounded-xl bg-blush/30 p-4 text-sm">{lang === 'ar' ? 'الطلب عبر واتساب غير متاح حالياً. استخدم إحدى قنوات التواصل المتاحة.' : 'WhatsApp ordering is currently unavailable. Please use one of the available contact channels.'}</p>}
        <form id="checkout-form" onSubmit={submit} className="scroll-mt-28 space-y-6">
          <Field id="name" label={t.contact.nameLabel} hint={t.contact.nameHint}><TextInput id="name" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder={t.contact.namePlaceholder} /></Field>
          <Field id="phone" label={t.contact.phoneLabel} hint={t.contact.phoneHint}><TextInput id="phone" required type="tel" dir="ltr" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.contact.phonePlaceholder} /></Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="date" label={t.contact.dateLabel}><TextInput id="date" required type="date" min={minimumDate} value={date} onChange={e => setDate(e.target.value)} /></Field>
            <Field id="slot" label={t.contact.slotLabel} hint={t.contact.slotHint}><Select id="slot" required value={slot} onChange={e => setSlot(e.target.value)}>{settings.deliveryTimeSlots.map(value => <option key={value} value={value}>{value}</option>)}</Select></Field>
          </div>
          <Field id="address" label={t.contact.addressLabel} hint={t.contact.addressHint}><TextInput id="address" required autoComplete="street-address" value={address} onChange={e => setAddress(e.target.value)} placeholder={t.contact.addressPlaceholder} /></Field>
          {settings.enableGiftCards && <div className="space-y-4 rounded-2xl bg-blush/25 p-4"><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={gift} onChange={e => setGift(e.target.checked)} />{t.contact.giftCardCheckboxLabel} · {settings.giftCardFee ? formatPrice(settings.giftCardFee) : t.contact.complimentary}</label>{gift && <Field id="gift-message" label={t.contact.giftCardFeeLabel}><TextArea id="gift-message" value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder={t.contact.notePlaceholder} /></Field>}</div>}
          <Field id="notes" label={t.builder.specialNotesLabel} isOptional><TextArea id="notes" value={note} onChange={e => setNote(e.target.value)} placeholder={t.builder.specialNotesPlaceholder} /></Field>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />{t.contact.rememberMeLabel}</label>
          {error && <p role="alert" className="rounded-xl bg-blush p-4 text-sm">{error}</p>}
          <Button type="submit" variant="cta" disabled={!canSubmit || sending} className="w-full justify-center"><MessageCircle size={18} />{sending ? '…' : settings.isAcceptingOrders ? t.contact.confirmWhatsAppBtn : t.contact.busyDisabledBtn}</Button>
          <p className="text-center text-xs text-olive/70">{t.contact.paymentAssurance}</p>
        </form>
      </section>
      <aside className="space-y-6 lg:col-span-5">
        <section className="rustic-card space-y-5 p-6"><h2 className="font-display text-xl font-bold">{t.contact.atelierTitle}</h2><p className="text-sm">{t.contact.atelierDesc}</p><dl className="space-y-4 text-sm">
          <div><dt className="font-semibold">{t.contact.deliveryZonesTitle}</dt><dd>{t.common.deliveryArea}</dd></div>
          <div><dt className="font-semibold">{t.contact.morningHoursTitle}</dt><dd>{settings.deliveryTimeSlots.map((value, index) => <span key={value}>{index > 0 && ' · '}<bdi>{value}</bdi></span>)}</dd></div>
          <div><dt className="font-semibold">{t.contact.dailyCutoffTitle}</dt><dd>{t.contact.dailyCutoffDesc.replace('{cutoff}', settings.dailyCutoffTime)}</dd></div>
          {validWhatsAppNumber(settings.whatsappNumber) && <div><dt className="font-semibold">{t.contact.phoneWhatsAppTitle}</dt><dd><a href={`tel:+${settings.whatsappNumber}`} dir="ltr">+{settings.whatsappNumber}</a></dd></div>}
          {validContactEmail(settings.contactEmail) && <div><dt className="font-semibold">{t.contact.emailTitle}</dt><dd><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></dd></div>}
        </dl><SocialLinks /></section>
        <section className="rustic-card bg-blush/30 p-6"><p className="text-xs font-bold text-gold-deep">{t.contact.eventsBadge}</p><h2 className="mt-2 font-display text-xl font-bold">{t.contact.eventsTitle}</h2><p className="mt-3 text-sm">{t.contact.eventsDesc}</p></section>
      </aside>
    </div>

    {/* ── Order Confirmed Celebration Overlay (1.8s animation -> Auto WhatsApp Redirect) ── */}
    {celebratingOrder && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-order-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-olive/75 p-4 backdrop-blur-sm"
      >
        <div className="animate-lm-pop-in relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-dashed border-gold bg-cream p-6 sm:p-8 text-center shadow-2xl">
          {/* Close control in corner */}
          <button
            type="button"
            onClick={() => {
              redirectedRef.current = celebratingOrder.id
              setCelebratingOrder(null)
            }}
            aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
            className="absolute top-4 end-4 grid h-8 w-8 place-items-center rounded-full border border-dashed border-kraft/70 text-olive/70 hover:bg-blush/40 hover:text-olive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Subtle floating hearts & sparkles */}
          <div className="pointer-events-none relative mx-auto mb-4 flex h-28 w-28 items-center justify-center" aria-hidden="true">
            <Heart className="animate-lm-float absolute -top-1 start-1 h-4 w-4 fill-blush text-gold" />
            <Sparkles className="animate-lm-float absolute top-2 -end-2 h-4 w-4 text-gold" style={{ animationDelay: '320ms' }} />
            <Heart className="animate-lm-float absolute bottom-3 -start-2 h-3.5 w-3.5 fill-gold/40 text-gold" style={{ animationDelay: '640ms' }} />

            {/* Rotating dashed artisanal ring */}
            <span className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-gold/60 bg-blush/25" />

            {/* Central olive wax-seal checkmark */}
            <span className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-gold bg-olive shadow-lg">
              <svg viewBox="0 0 48 48" className="h-10 w-10 fill-none stroke-cream" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 25.5L20.5 34L36 16" className="animate-lm-check" />
              </svg>
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-blush/50 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-gold-deep">
            <Sparkles className="h-3 w-3 text-gold" />
            {t.contact.celebrationBadge}
          </span>

          <h2 id="celebration-order-title" className="mt-3 font-display text-2xl font-bold text-olive leading-snug">
            {t.contact.celebrationTitle}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-olive/75">
            {t.contact.celebrationSubtitle}
          </p>

          {/* Order ID & Total Ticket */}
          <div className="mt-5 rounded-2xl border-2 border-dashed border-kraft bg-blush/20 p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-olive/70">{t.contact.celebrationOrderNo}</span>
              <span className="font-mono text-xs font-bold text-olive">#{celebratingOrder.id}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-kraft/60 pt-2">
              <span className="text-xs font-semibold text-olive/70">{t.contact.celebrationTotalLabel}</span>
              <span className="tabular font-display text-lg font-extrabold text-gold-deep">
                <bdi>{formatPrice(celebratingOrder.total)}</bdi>
              </span>
            </div>
          </div>

          {/* 1.8s Automatic Redirect Progress */}
          <div className="mt-5 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-kraft/35">
              <div className="animate-lm-progress h-full w-full rounded-full bg-gradient-to-r from-gold to-olive" />
            </div>
            <p className="text-[0.6875rem] font-semibold text-olive/65">{t.contact.celebrationProgress}</p>
          </div>

          {/* Prominent Backup Direct WhatsApp CTA */}
          <a
            href={celebratingOrder.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { redirectedRef.current = celebratingOrder.id }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20bd5a] hover:shadow-lg"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>{t.contact.openWhatsAppNowBtn}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
          </a>
        </div>
      </div>
    )}
  </div>
}
