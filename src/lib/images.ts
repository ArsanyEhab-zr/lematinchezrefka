/** Unsplash placeholder helpers — swap for real product photography before launch. */

const UNSPLASH_BASE = 'https://images.unsplash.com/photo-'
const DEFAULT_WIDTHS = [480, 800, 1200]

export const unsplashSrc = (photoId: string, width: number): string =>
  `${UNSPLASH_BASE}${photoId}?auto=format&fit=crop&w=${width}&q=75`

export const unsplashSrcSet = (photoId: string, widths: number[] = DEFAULT_WIDTHS): string =>
  widths.map((width) => `${unsplashSrc(photoId, width)} ${width}w`).join(', ')

