import { assertLocalSave } from '@/lib/media'
import { normalizeWhatsAppPhone } from '@/lib/phone'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Language = 'ar' | 'en'

export interface SiteSettingsValues {
  logoUrl: string
  logoDisplayMode: 'text_only' | 'image_only' | 'both'
  faviconUrl: string
  siteTitleEn: string
  siteTitleAr: string
  heroImageUrl: string
  storyImage1Url: string
  storyImage2Url: string
  storyImage3Url: string
  tiktokUrl: string
  googleMapsUrl: string
  contactEmail: string
  // Localization Settings
  activeLanguage: Language
  defaultLanguage: Language
  enableLanguageSwitcher: boolean

  // Contact & Order Dispatch
  whatsappNumber: string
  facebookUrl: string
  instagramUrl: string
  whatsappHeaderNoteAr: string
  whatsappHeaderNoteEn: string

  // Delivery & Pricing Rules
  deliveryFee: number
  freeDeliveryThreshold: number
  minOrderAmount: number

  // Kitchen & Scheduling Controls
  isAcceptingOrders: boolean
  busyModeMessageAr: string
  busyModeMessageEn: string
  dailyCutoffTime: string
  deliveryTimeSlots: string[]

  // Gifting & Storefront Promo
  enableGiftCards: boolean
  giftCardFee: number
  announcementBarActive: boolean
  announcementTextAr: string
  announcementTextEn: string
}

export interface IntegrationOverrides {
  supabaseUrl: string
  supabaseAnonKey: string
  cloudinaryCloudName: string
  cloudinaryUploadPreset: string
}
export interface SiteSettingsStore extends SiteSettingsValues {
  integrations: IntegrationOverrides
  setIntegrations: (values: IntegrationOverrides) => void
  mediaRevision: number
  hasUnpublishedMedia: boolean
  updateCmsSettings: (values: Partial<SiteSettingsValues>) => void
  hasChosenLanguage: boolean
  applyGlobalSettings: (values: Omit<SiteSettingsValues, 'activeLanguage'>) => void
  setActiveLanguage: (lang: Language) => void
  toggleActiveLanguage: () => void
  setDefaultLanguage: (lang: Language) => void
  updateSettings: (partial: Partial<SiteSettingsValues>) => void
  addDeliveryTimeSlot: (slot: string) => void
  removeDeliveryTimeSlot: (slot: string) => void
  resetSiteSettings: () => void
}

export const CMS_SETTINGS_KEYS = ['logoUrl', 'logoDisplayMode', 'faviconUrl', 'siteTitleEn', 'siteTitleAr', 'heroImageUrl', 'storyImage1Url', 'storyImage2Url', 'storyImage3Url', 'facebookUrl', 'instagramUrl', 'tiktokUrl', 'whatsappNumber', 'googleMapsUrl', 'contactEmail'] as const

export const DEFAULT_SITE_SETTINGS: SiteSettingsValues = {
  logoUrl: '/brand-logo.png',
  logoDisplayMode: 'both',
  faviconUrl: '/brand-logo.png',
  siteTitleEn: 'Le Matin chez Refka — Fait maison, avec amour',
  siteTitleAr: 'لو ماتان شي رفقة — صنع منزلي بكل حب',
  heroImageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80',
  storyImage1Url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  storyImage2Url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  storyImage3Url: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=800&q=80',
  tiktokUrl: '',
  googleMapsUrl: '',
  contactEmail: 'bonjour@lematin-refka.com',
  // Localization Settings
  activeLanguage: 'en',
  defaultLanguage: 'en',
  enableLanguageSwitcher: true,

  // Contact & Order Dispatch
  whatsappNumber: '201000000000',
  facebookUrl: 'https://www.facebook.com/share/1bNFTkMPTL/',
  instagramUrl: 'https://www.instagram.com/lematin.refka',
  whatsappHeaderNoteAr: 'صباح الخير رفقة! أود طلب بوكس إفطار من Le Matin chez Refka:',
  whatsappHeaderNoteEn: 'Bonjour Refka! I would like to place a breakfast box order from Le Matin chez Refka:',

  // Delivery & Pricing Rules
  deliveryFee: 40,
  freeDeliveryThreshold: 600,
  minOrderAmount: 150,

  // Kitchen & Scheduling Controls
  isAcceptingOrders: true,
  busyModeMessageAr:
    'مطبخنا مكتمل العدد لصباح الغد! نعتذر عن استقبال طلبات جديدة حالياً، ونسعد بخدمتكم قريباً.',
  busyModeMessageEn:
    'Our kitchen is fully booked for tomorrow morning! We are temporarily pausing new orders and will reopen shortly.',
  dailyCutoffTime: '20:00',
  deliveryTimeSlots: [
    '07:00 AM - 09:00 AM',
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
  ],

  // Gifting & Storefront Promo
  enableGiftCards: true,
  giftCardFee: 0,
  announcementBarActive: true,
  announcementTextAr:
    'بوكسات إفطار فرنسية ريفية تُخبز فجراً وتُوصل دافئة لباب منزلك · اطلب قبل 8 مساءً · توصيل مجاني للطلبات فوق 600 ج.م',
  announcementTextEn:
    'Handcrafted breakfast boxes baked at dawn & delivered warm · Order by 8:00 PM · Free delivery over 600 EGP',
}

/**
 * Synchronizes document root `dir` and `lang` attributes for instant RTL/LTR layout & font switching
 */
export const syncDocumentDirection = (lang: Language) => {
  if (typeof document === 'undefined') return
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
}

/**
 * Sanitizes WhatsApp phone number (normalizing local Egyptian numbers like 010... -> 2010...) and constructs a wa.me deep link
 */
export const buildDynamicWhatsAppLink = (message: string, customNumber?: string): string => {
  const raw = customNumber ?? useSiteSettingsStore.getState().whatsappNumber
  const digits = normalizeWhatsAppPhone(raw)
  if (!/^[1-9]\d{7,14}$/.test(digits)) return '#/contact'
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * Computes effective delivery fee taking into account the free delivery threshold (0 disables free delivery)
 */
export const calculateDeliveryFee = (
  subtotal: number,
  deliveryFee: number,
  freeDeliveryThreshold: number
): number => {
  if (subtotal <= 0) return 0
  if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) {
    return 0
  }
  return Math.max(0, deliveryFee)
}

export const useSiteSettingsStore = create<SiteSettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SITE_SETTINGS,
      integrations: { supabaseUrl: '', supabaseAnonKey: '', cloudinaryCloudName: '', cloudinaryUploadPreset: '' },
      setIntegrations: (integrations) => {
        assertLocalSave('le-matin-site-settings', { ...get(), integrations })
        set({ integrations })
      },
      hasChosenLanguage: false,
      hasUnpublishedMedia: false,
      mediaRevision: 0,
      updateCmsSettings: (values) => {
        const next = { ...get(), ...values, hasUnpublishedMedia: true, mediaRevision: get().mediaRevision + 1 }
        assertLocalSave('le-matin-site-settings', next)
        set(next)
      },
      applyGlobalSettings: (values) => {
        const current = get()
        const activeLanguage = !current.hasChosenLanguage || !values.enableLanguageSwitcher
          ? values.defaultLanguage : current.activeLanguage
        syncDocumentDirection(activeLanguage)
        set({ ...values, activeLanguage })
      },

      setActiveLanguage: (lang) => {
        syncDocumentDirection(lang)
        set({ activeLanguage: lang, hasChosenLanguage: true })
      },

      toggleActiveLanguage: () => {
        const nextLang: Language = get().activeLanguage === 'ar' ? 'en' : 'ar'
        syncDocumentDirection(nextLang)
        set({ activeLanguage: nextLang, hasChosenLanguage: true })
      },

      setDefaultLanguage: (lang) => {
        syncDocumentDirection(lang)
        set({ defaultLanguage: lang, activeLanguage: lang })
      },

      updateSettings: (partial) => {
        if (partial.activeLanguage) {
          syncDocumentDirection(partial.activeLanguage)
        }
        set((state) => ({ ...state, ...partial }))
      },

      addDeliveryTimeSlot: (slot) => {
        const clean = slot.trim()
        if (!clean) return
        set((state) => {
          if (state.deliveryTimeSlots.includes(clean)) return state
          return { deliveryTimeSlots: [...state.deliveryTimeSlots, clean] }
        })
      },

      removeDeliveryTimeSlot: (slot) => {
        set((state) => {
          if (state.deliveryTimeSlots.length <= 1) return state
          return {
            deliveryTimeSlots: state.deliveryTimeSlots.filter((s) => s !== slot),
          }
        })
      },

      resetSiteSettings: () => {
        syncDocumentDirection(DEFAULT_SITE_SETTINGS.defaultLanguage)
        set({ ...DEFAULT_SITE_SETTINGS })
      },
    }),
    {
      name: 'le-matin-site-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.activeLanguage) {
          syncDocumentDirection(state.activeLanguage)
        }
      },
    }
  )
)

