import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { useTranslation } from '@/data/translations'
export const BrandMark = () => {
  const { logoUrl, logoDisplayMode } = useSiteSettingsStore(useShallow(s => ({ logoUrl: s.logoUrl, logoDisplayMode: s.logoDisplayMode })))
  const { t } = useTranslation()
  const [failedSource, setFailedSource] = useState('')
  const showImage = Boolean(logoUrl) && logoDisplayMode !== 'text_only' && failedSource !== logoUrl
  return <span className="flex max-w-[150px] sm:max-w-[220px] items-center justify-center gap-2">
    {showImage && <img src={logoUrl} alt={t.brand.name} onError={() => setFailedSource(logoUrl)} className={`max-h-14 rounded-full object-cover ${logoDisplayMode === 'both' ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-12 w-12 sm:h-14 sm:w-14'}`} />}
    {(!showImage || logoDisplayMode !== 'image_only') && <span className="flex flex-col items-center"><span className="font-display text-lg font-bold tracking-tight text-olive sm:text-3xl">{t.brand.shortName}</span><span className="-mt-1 font-script text-base text-gold sm:text-lg">{t.brand.chezRefka}</span></span>}
  </span>
}
