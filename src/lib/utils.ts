import { useSiteSettingsStore } from '@/stores/site-settings-store'
/** Utility helpers shared across the app. */

export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ')

export const formatPrice = (amount: number, currency = 'EGP'): string => {
  const arabic = useSiteSettingsStore.getState().activeLanguage === 'ar'
  return `${amount.toLocaleString(arabic ? 'ar-EG' : 'en-GB')}\u00A0${arabic && currency === 'EGP' ? 'ج.م' : currency}`
}

export const formatPriceModifier = (amount: number, currency = 'EGP'): string => {
  if (amount === 0) return useSiteSettingsStore.getState().activeLanguage === 'ar' ? 'مشمول' : 'Included'
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatPrice(amount, currency)}`
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export const formatDate = (isoDate: string): string => dateFormatter.format(new Date(`${isoDate}T00:00:00`))

/** ISO date (YYYY-MM-DD) for today + `offsetDays`, in local time. */
export const isoDateFromToday = (offsetDays = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const greetingForNow = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

