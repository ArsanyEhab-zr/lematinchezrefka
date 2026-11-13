import { useTranslation } from '@/data/translations'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Rotating circular “wax stamp”: the brand promise set on a circle around a heart.
 * Decorative only — hidden from assistive tech.
 */
export const StampBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  return (
  <div
    aria-hidden="true"
    className={cn(
      'relative grid h-32 w-32 place-items-center rounded-full border-2 border-dashed border-kraft bg-cream shadow-md sm:h-36 sm:w-36',
      className,
    )}
  >
    <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-spin-slow">
      <defs>
        <path id="stamp-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <text className="fill-olive font-sans text-[9.5px] font-semibold uppercase" letterSpacing="2.6">
        <textPath href="#stamp-circle">{t.common.stamp}</textPath>
      </text>
    </svg>
    <span className="grid h-12 w-12 place-items-center rounded-full bg-blush">
      <Heart className="h-5 w-5 fill-gold text-gold" strokeWidth={1.5} />
    </span>
  </div>
)
}
