import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'cta' | 'outline' | 'ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Brand CTA: gold pill, white label. Deepens on hover instead of greying out.
  cta: 'bg-cta text-cta-fg shadow-md hover:bg-cta-hover hover:shadow-lg active:translate-y-px',
  outline: 'border-2 border-dashed border-line bg-cream text-ink hover:border-gold hover:bg-blush/40',
  ghost: 'text-ink hover:bg-blush/50',
  inverse: 'border-2 border-dashed border-cream/40 text-cream hover:border-blush hover:bg-cream/10',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[2.5rem] px-4 text-sm',
  md: 'min-h-[2.875rem] px-6 text-[0.9375rem]',
  lg: 'min-h-[3.25rem] px-8 text-base',
}

const baseClasses =
  'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50'

type SharedProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export const buttonClasses = (variant: ButtonVariant = 'cta', size: ButtonSize = 'md', className?: string) =>
  cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'cta', size = 'md', className, type = 'button', children, ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

type ButtonLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>

export const ButtonLink = ({ variant = 'cta', size = 'md', className, children, ...props }: ButtonLinkProps) => (
  <a className={buttonClasses(variant, size, className)} {...props}>
    {children}
  </a>
)

