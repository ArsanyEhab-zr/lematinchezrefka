import { z } from 'zod'
import { isImageSource } from '@/lib/media'
import { normalizeWhatsAppPhone } from '@/lib/phone'
const imageSource = z.string().refine(isImageSource, 'Use an HTTPS image URL, local asset path, or uploaded image.')
const money = z.number().finite().min(0).max(99999999)
export const settingsSchema = z.object({
  logoUrl: imageSource, logoDisplayMode: z.enum(['text_only', 'image_only', 'both']), faviconUrl: imageSource,
  siteTitleEn: z.string().min(1), siteTitleAr: z.string().min(1),
  heroImageUrl: imageSource, storyImage1Url: imageSource, storyImage2Url: imageSource, storyImage3Url: imageSource,
  tiktokUrl: z.string().refine(validSocialUrl, 'Enter an HTTPS URL or leave blank.'),
  googleMapsUrl: z.string().refine(validSocialUrl, 'Enter an HTTPS URL or leave blank.'),
  contactEmail: z.union([z.literal(''), z.string().email()]),
  defaultLanguage: z.enum(['ar', 'en']), enableLanguageSwitcher: z.boolean(),
  whatsappNumber: z.union([
    z.literal(''),
    z.string()
      .transform(normalizeWhatsAppPhone)
      .refine(val => /^[1-9]\d{7,14}$/.test(val), 'Use 8–15 digits including country code (e.g., 201000000000 or 01000000000).'),
  ]),
  facebookUrl: z.string().refine(validSocialUrl, 'Enter an HTTPS URL or leave blank.'),
  instagramUrl: z.string().refine(validSocialUrl, 'Enter an HTTPS URL or leave blank.'),
  whatsappHeaderNoteAr: z.string(), whatsappHeaderNoteEn: z.string(),
  deliveryFee: money, freeDeliveryThreshold: money, minOrderAmount: money,
  isAcceptingOrders: z.boolean(), busyModeMessageAr: z.string().min(1), busyModeMessageEn: z.string().min(1),
  dailyCutoffTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  deliveryTimeSlots: z.array(z.string().trim().min(1).max(100)).min(1).refine(v => new Set(v).size === v.length, 'Delivery slots must be unique.'),
  enableGiftCards: z.boolean(), giftCardFee: money, announcementBarActive: z.boolean(),
  announcementTextAr: z.string(), announcementTextEn: z.string(),
})
function validSocialUrl(value: string) {
  if (!value) return true
  try { return new URL(value).protocol === 'https:' } catch { return false }
}
export type GlobalSettings = z.infer<typeof settingsSchema>
