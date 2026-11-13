import './cms.test'
import assert from 'node:assert/strict'
import { DEFAULT_SITE_SETTINGS as defaults, useSiteSettingsStore, buildDynamicWhatsAppLink } from '../src/stores/site-settings-store'
import { checkoutTotals, earliestDeliveryDate, orderMessage } from '../src/lib/checkout'
import { normalizeWhatsAppPhone, isValidWhatsAppPhone } from '../src/lib/phone'
import { settingsSchema } from '../src/lib/site-settings-sync'
import { TRANSLATIONS } from '../src/data/translations'

assert.deepEqual(checkoutTotals(599, false, defaults), { subtotal: 599, delivery: 40, giftFee: 0, total: 639 })
assert.equal(checkoutTotals(600, false, defaults).delivery, 0)
assert.equal(checkoutTotals(600, false, { ...defaults, freeDeliveryThreshold: 0 }).delivery, 40)
assert.equal(checkoutTotals(200, true, { ...defaults, giftCardFee: 15 }).total, 255)
assert.equal(checkoutTotals(200, true, { ...defaults, enableGiftCards: false, giftCardFee: 15 }).total, 240)
assert.equal(checkoutTotals(0, true, { ...defaults, giftCardFee: 15 }).total, 0)
assert.equal(earliestDeliveryDate('20:00', new Date('2026-11-11T17:59:00Z')), '2026-11-12')
assert.equal(earliestDeliveryDate('20:00', new Date('2026-11-11T18:00:00Z')), '2026-11-13')
assert.equal(earliestDeliveryDate('20:00', new Date('2026-12-31T18:00:00Z')), '2027-01-02')
assert.equal(settingsSchema.safeParse({ ...defaults, whatsappNumber: 'abc' }).success, false)
assert.equal(settingsSchema.safeParse({ ...defaults, deliveryFee: -1 }).success, false)
assert.equal(settingsSchema.safeParse({ ...defaults, deliveryFee: NaN }).success, false)
assert.equal(settingsSchema.safeParse({ ...defaults, facebookUrl: 'javascript:alert(1)' }).success, false)
assert.equal(settingsSchema.safeParse({ ...defaults, dailyCutoffTime: '25:00' }).success, false)
assert.equal(settingsSchema.safeParse({ ...defaults, deliveryTimeSlots: [] }).success, false)
assert.equal(settingsSchema.safeParse({ ...defaults, deliveryTimeSlots: ['morning', 'morning'] }).success, false)
assert.equal(settingsSchema.safeParse(defaults).success, true)
const boxes = [{ boxId: 'custom', boxName: 'Test box', basePrice: 100, totalPrice: 200, quantity: 2, selectedSwaps: {}, swapDetails: [{ componentId: 'c', componentName: 'Bread', itemId: 'i', itemName: 'Rye', priceModifier: -5, isDefault: false }] }]
const details = { name: 'Test', phone: '201000000000', address: 'Cairo', deliveryDate: '2026-11-12', deliverySlot: defaults.deliveryTimeSlots[0], note: 'No nuts', gift: true, giftMessage: 'Happy birthday' }
const english = orderMessage({ ...defaults, giftCardFee: 15 }, boxes, [], details)
assert.match(english, /2 × Test box — 200 EGP/)
assert.match(english, /255 EGP/)
assert.match(english, /-5 EGP/)
assert.match(english, /Happy birthday/)
assert.ok(english.includes(details.deliverySlot))
const arabic = orderMessage({ ...defaults, activeLanguage: 'ar' }, boxes, [], details)
assert.ok(arabic.startsWith(defaults.whatsappHeaderNoteAr))
assert.ok(arabic.includes(TRANSLATIONS.ar.contact.grandTotal))
assert.ok(!orderMessage({ ...defaults, enableGiftCards: false }, boxes, [], details).includes('Happy birthday'))
assert.equal(decodeURIComponent(buildDynamicWhatsAppLink('صباح الخير', '201123456789')), 'https://wa.me/201123456789?text=صباح الخير')
assert.equal(normalizeWhatsAppPhone('01012345678'), '201012345678')
assert.equal(normalizeWhatsAppPhone('+20 101-234-5678'), '201012345678')
assert.equal(normalizeWhatsAppPhone('00201012345678'), '201012345678')
assert.equal(isValidWhatsAppPhone('01012345678'), true)
assert.equal(isValidWhatsAppPhone('abc'), false)
const normalizedSettings = settingsSchema.safeParse({ ...defaults, whatsappNumber: '+20 101-234-5678' })
assert.equal(normalizedSettings.success, true)
if (normalizedSettings.success) assert.equal(normalizedSettings.data.whatsappNumber, '201012345678')
assert.equal(decodeURIComponent(buildDynamicWhatsAppLink('Hello', '01012345678')), 'https://wa.me/201012345678?text=Hello')
const noteMessage = orderMessage(defaults, [{ ...boxes[0], customNotes: 'Warm bread please' }], [], details, 'LM-test-1')
assert.match(noteMessage, /Warm bread please/)
assert.match(noteMessage, /LM-test-1/)
useSiteSettingsStore.getState().applyGlobalSettings({ ...defaults, defaultLanguage: 'ar' })
assert.equal(useSiteSettingsStore.getState().activeLanguage, 'ar')
useSiteSettingsStore.getState().setActiveLanguage('en')
useSiteSettingsStore.getState().applyGlobalSettings({ ...defaults, defaultLanguage: 'ar' })
assert.equal(useSiteSettingsStore.getState().activeLanguage, 'en')
useSiteSettingsStore.getState().applyGlobalSettings({ ...defaults, defaultLanguage: 'ar', enableLanguageSwitcher: false })
assert.equal(useSiteSettingsStore.getState().activeLanguage, 'ar')
const paths = (object: unknown, prefix = ''): string[] => Object.entries(object as Record<string, unknown>).flatMap(([key, value]) => typeof value === 'string' ? [prefix + key] : paths(value, `${prefix}${key}.`))
assert.deepEqual(paths(TRANSLATIONS.en), paths(TRANSLATIONS.ar))
console.log('Passed: pricing, quantity, gifts, cutoff boundaries, validation, bilingual receipts, language preferences, dictionary parity.')

import './cloud.test'
