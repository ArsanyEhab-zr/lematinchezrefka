import { Heart } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  script?: string
  intro?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
}

/** Eyebrow → Playfair title → Great Vibes flourish → intro. Left-aligned by default. */
export const SectionHeading = ({ eyebrow, title, script, intro, as = 'h2', className }: SectionHeadingProps) => {
  const Title = as
  return (
    <header className={cn('max-w-2xl', className)}>
      <p className="eyebrow">{eyebrow}</p>
      <Title
        className={cn(
          'mt-3 font-semibold tracking-[-0.01em]',
          as === 'h1' ? 'text-display-md' : 'text-display-sm',
        )}
      >
        {title}
      </Title>
      {script && <p className="mt-1 font-script text-script text-gold">{script}</p>}
      {intro && <div className="mt-4 max-w-prose text-olive/80">{intro}</div>}
    </header>
  )
}

/** A stitched kraft rule with a small gold heart — the brand’s section divider. */
export const HeartDivider = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cn('flex items-center gap-4 text-gold', className)}>
    <span className="h-px flex-1 border-t-2 border-dashed border-kraft" />
    <Heart className="h-4 w-4 fill-gold/20" strokeWidth={1.75} />
    <span className="h-px flex-1 border-t-2 border-dashed border-kraft" />
  </div>
)

