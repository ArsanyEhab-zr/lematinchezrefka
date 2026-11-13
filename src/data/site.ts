import { buildDynamicWhatsAppLink, useSiteSettingsStore } from '@/stores/site-settings-store'
/**
 * Business details. Replace the placeholder WhatsApp number with the real one
 * (international format, digits only — e.g. 21620123456).
 */
export const SITE = {
  name: 'Le Matin chez Refka',
  shortName: 'Le Matin',
  tagline: 'Fait Maison, Avec Amour',
  whatsappNumber: '21620000000',
  phoneDisplay: '+216 20 000 000',
  email: 'bonjour@lematin-refka.com',
  deliveryHours: '7:00–11:00 a.m.',
  openDays: 'Tuesday to Sunday',
  orderCutoff: '8 p.m. the evening before',
  deliveryArea: 'Tunis, La Marsa, Carthage and Sidi Bou Said',
} as const

export const buildWhatsAppLink = (message: string): string =>
  buildDynamicWhatsAppLink(message === DEFAULT_WHATSAPP_MESSAGE ? (useSiteSettingsStore.getState().activeLanguage === 'ar' ? useSiteSettingsStore.getState().whatsappHeaderNoteAr : useSiteSettingsStore.getState().whatsappHeaderNoteEn) : message)

export const DEFAULT_WHATSAPP_MESSAGE =
  'Bonjour Refka! I’d love to order a breakfast box. Could you tell me what’s available?'

