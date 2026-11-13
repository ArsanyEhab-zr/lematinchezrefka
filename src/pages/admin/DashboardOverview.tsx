import { useMemo } from 'react'
import {
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Sun,
} from 'lucide-react'
import { formatPrice, isoDateFromToday } from '@/lib/utils'
import { useKitchenStore, orderTotal } from '@/stores/kitchen-store'
import { OrdersTable } from './OrdersTable'

export const DashboardOverview = () => {
  const orders = useKitchenStore((state) => state.orders)

  const todayIso = useMemo(() => isoDateFromToday(0), [])

  const stats = useMemo(() => {
    const todayOrders = orders.filter((o) => o.deliveryDate === todayIso)
    const pending = orders.filter((o) => o.status === 'pending')
    const preparing = orders.filter((o) => o.status === 'preparing')
    const delivered = orders.filter((o) => o.status === 'delivered')
    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.total ?? orderTotal(order.lines)), 0)

    return {
      todayCount: todayOrders.length,
      pendingCount: pending.length,
      preparingCount: preparing.length,
      deliveredCount: delivered.length,
      totalRevenue,
    }
  }, [orders, todayIso])

  return (
    <div className="flex flex-col gap-8">
      {/* ── Welcome Banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-blush/35 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-deep">
              <Sun className="h-4 w-4 text-gold" />
              <span>Atelier La Marsa · Morning Dispatch Control</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-olive sm:text-3xl">
              Bonjour, Refka!
            </h2>
            <p className="mt-1 text-xs text-olive/75 sm:text-sm">
              You have <strong className="font-bold text-gold-deep">{stats.pendingCount} orders</strong> waiting for kitchen confirmation today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-dashed border-kraft bg-cream px-4 py-2 text-xs font-semibold text-olive">
              Cutoff: 8:00 p.m.
            </span>
            <span className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-white shadow-xs">
              Delivery 7:00–11:00 a.m.
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {/* Pending Orders Card */}
        <div className="rustic-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive/60">
              Pending Orders
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-status-pending-bg text-status-pending-fg">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-olive">
              {stats.pendingCount}
            </span>
            <span className="text-xs text-olive/60 font-medium">needs prep</span>
          </div>
        </div>

        {/* In Preparation Card */}
        <div className="rustic-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive/60">
              In Oven / Prep
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-status-preparing-bg text-status-preparing-fg">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-gold">
              {stats.preparingCount}
            </span>
            <span className="text-xs text-olive/60 font-medium">in kitchen</span>
          </div>
        </div>

        {/* Delivered Card */}
        <div className="rustic-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive/60">
              Delivered
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-status-delivered-bg text-status-delivered-fg">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-olive">
              {stats.deliveredCount}
            </span>
            <span className="text-xs text-olive/60 font-medium">completed</span>
          </div>
        </div>

        {/* Total Value Card */}
        <div className="rustic-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive/60">
              Active Orders Value
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blush text-olive">
              <DollarSign className="h-4 w-4 text-gold" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="tabular font-display text-2xl font-extrabold text-olive">
              {formatPrice(stats.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Orders Management Section ────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-olive">
              Daily Order Queue
            </h3>
            <p className="text-xs text-olive/70">
              Review incoming customer breakfast boxes, update dispatch states, and contact customers.
            </p>
          </div>
        </div>

        <OrdersTable />
      </div>
    </div>
  )
}
