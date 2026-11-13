import { useTranslation } from '@/data/translations'
import { AlertCircle } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const controlClasses =
  'w-full min-h-[2.875rem] rounded-xl border border-kraft bg-cream px-4 py-2.5 text-[0.9375rem] text-ink placeholder:text-olive/40 transition-colors duration-200 hover:border-gold/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-gold aria-[invalid=true]:bg-blush/25'

type FieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  isOptional?: boolean
  children: ReactNode
}

/** Visible label above, helper or error text directly below the control. */
export const Field = ({ id, label, hint, error, isOptional = false, children }: FieldProps) => {
  const { t } = useTranslation()
  return (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-semibold text-ink">
      {label}
      {isOptional && <span className="text-xs font-medium text-olive/50">{t.common.optional}</span>}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-[0.8125rem] font-medium text-olive">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden="true" />
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-olive/60">
          {hint}
        </p>
      )
    )}
  </div>
)
}

export const describedBy = (id: string, error?: string, hint?: string): string | undefined => {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

export const TextInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(controlClasses, className)} {...props} />
)

export const TextArea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(controlClasses, 'min-h-[7rem] resize-y leading-[1.45]', className)} {...props} />
)

export const Select = ({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(controlClasses, 'cursor-pointer appearance-none bg-no-repeat pr-10', className)} {...props}>
    {children}
  </select>
)

