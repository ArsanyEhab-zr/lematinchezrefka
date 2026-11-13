import type { ReactNode } from 'react'
import { STATUS_LABELS, type OrderStatus } from '@/data/orders'
import { cn } from '@/lib/utils'

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-status-pending-bg text-status-pending-fg',
  preparing: 'bg-status-preparing-bg text-status-preparing-fg',
  delivered: 'bg-status-delivered-bg text-status-delivered-fg',
}

const STATUS_DOT: Record<OrderStatus, string> = {
  pending: 'bg-olive/60',
  preparing: 'bg-cream animate-pulse',
  delivered: 'bg-blush',
}

export const StatusBadge = ({ status, className }: { status: OrderStatus; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold tracking-[0.02em]',
      STATUS_CLASSES[status],
      className,
    )}
  >
    <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} />
    {STATUS_LABELS[status]}
  </span>
)

/** Soft blush tag used on product images and small labels. */
export const Tag = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-olive',
      className,
    )}
  >
    {children}
  </span>
)

