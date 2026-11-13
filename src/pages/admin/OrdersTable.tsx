import { useState, useMemo } from 'react'
import {
  Search,
  MessageCircle,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  ChevronDown,
  Trash2,
  Gift,
  StickyNote,
} from 'lucide-react'
import { ORDER_STATUSES, type OrderStatus } from '@/data/orders'
import { formatPrice, cn } from '@/lib/utils'
import { buildDynamicWhatsAppLink } from '@/stores/site-settings-store'
import { isValidWhatsAppPhone } from '@/lib/phone'
import { useKitchenStore, orderTotal, orderSummary } from '@/stores/kitchen-store'
import { StatusBadge } from '@/components/ui/badge'

type FilterStatus = 'all' | OrderStatus

export const OrdersTable = () => {
  const orders = useKitchenStore((state) => state.orders)
  const setStatus = useKitchenStore((state) => state.setStatus)
  const deleteOrder = useKitchenStore((state) => state.deleteOrder)

  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = filter === 'all' || order.status === filter
      const matchesSearch =
        search.trim() === '' ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.toLowerCase().includes(search.toLowerCase()) ||
        order.address.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [orders, filter, search])

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    }
  }, [orders])

  return (
    <div className="flex flex-col gap-6">
      {/* ── Filter Tabs & Search Bar ─────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-full border border-dashed border-kraft bg-cream p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
              filter === 'all'
                ? 'bg-olive text-white shadow-xs'
                : 'text-olive/70 hover:bg-blush/40 hover:text-olive',
            )}
          >
            All Orders ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
              filter === 'pending'
                ? 'bg-status-pending-bg text-status-pending-fg shadow-xs font-bold'
                : 'text-olive/70 hover:bg-blush/40 hover:text-olive',
            )}
          >
            <span>Pending</span>
            <span className="rounded-full bg-olive/10 px-1.5 text-[0.6875rem]">
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('preparing')}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
              filter === 'preparing'
                ? 'bg-status-preparing-bg text-status-preparing-fg shadow-xs font-bold'
                : 'text-olive/70 hover:bg-blush/40 hover:text-olive',
            )}
          >
            <span>Preparing</span>
            <span className="rounded-full bg-white/20 px-1.5 text-[0.6875rem]">
              {counts.preparing}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
              filter === 'delivered'
                ? 'bg-status-delivered-bg text-status-delivered-fg shadow-xs font-bold'
                : 'text-olive/70 hover:bg-blush/40 hover:text-olive',
            )}
          >
            <span>Delivered</span>
            <span className="rounded-full bg-white/20 px-1.5 text-[0.6875rem]">
              {counts.delivered}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, ID..."
            className="w-full rounded-full border border-kraft bg-cream pl-9 pr-4 py-2 text-xs text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>

      {/* ── Orders Table / Responsive Card List ──────────────── */}
      <div className="overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream shadow-md">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-olive/60">
            <AlertCircle className="h-8 w-8 text-gold-deep/60" />
            <p className="mt-3 font-display text-base font-bold text-olive">
              No orders found
            </p>
            <p className="mt-1 text-xs">
              Try adjusting your filter or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-dashed border-kraft bg-blush/25 font-semibold text-olive">
                <tr>
                  <th scope="col" className="px-6 py-4">Order ID &amp; Status</th>
                  <th scope="col" className="px-6 py-4">Customer &amp; Contact</th>
                  <th scope="col" className="px-6 py-4">Delivery Window</th>
                  <th scope="col" className="px-6 py-4">Items &amp; Total</th>
                  <th scope="col" className="px-6 py-4">Notes / Calligraphy Card</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-kraft/40 text-olive/90">
                {filteredOrders.map((order) => {
                  const boxesTotal = order.customizedBoxes?.reduce((sum, box) => sum + box.totalPrice, 0) ?? 0
                  const total = order.pricing?.total ?? (boxesTotal > 0 ? boxesTotal : orderTotal(order.lines))
                  const summary = orderSummary(order.lines)
                  const boxes = order.customizedBoxes ?? []
                  const canWaCustomer = isValidWhatsAppPhone(order.phone)
                  const customerWaMessage = `Bonjour ${order.customer}! Here is an update regarding your breakfast box order (${order.id}) from Le Matin chez Refka.`
                  const customerWaUrl = canWaCustomer ? buildDynamicWhatsAppLink(customerWaMessage, order.phone) : ''
                  const createdLabel = order.createdAt
                    ? new Date(order.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-blush/15"
                    >
                      {/* ID & Status */}
                      <td className="whitespace-nowrap px-6 py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-mono text-xs font-bold text-olive" title={order.id}>
                            {order.id.length > 16 ? `${order.id.slice(0, 11)}…` : order.id}
                          </span>
                          <StatusBadge status={order.status} />
                          {createdLabel && (
                            <span className="text-[0.6875rem] text-olive/55">
                              {createdLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-display text-sm font-bold text-olive">
                            {order.customer}
                          </span>
                          <div className="flex items-start gap-1.5 text-olive/80">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                            <span className="max-w-[230px] whitespace-normal break-words text-xs leading-relaxed">
                              {order.address}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <a
                              href={`tel:${order.phone}`}
                              className="font-medium text-olive hover:text-gold"
                              dir="ltr"
                            >
                              {order.phone}
                            </a>
                            {canWaCustomer && (
                              <a
                                href={customerWaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-[0.6875rem] font-bold text-olive hover:bg-[#25D366] hover:text-white transition-colors"
                                title={`Chat with ${order.customer} on WhatsApp`}
                              >
                                <MessageCircle className="h-3 w-3 text-[#128C7E]" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Delivery Date & Time */}
                      <td className="whitespace-nowrap px-6 py-4 align-top">
                        <div className="flex flex-col gap-1 text-olive/80">
                          <span className="flex items-center gap-1.5 font-semibold text-olive">
                            <Calendar className="h-3.5 w-3.5 text-gold" />
                            <span>{order.deliveryDate}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gold-deep font-medium">
                            <Clock className="h-3.5 w-3.5 text-gold" />
                            <span>{order.deliverySlot}</span>
                          </span>
                        </div>
                      </td>

                      {/* Items & Total */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex min-w-[270px] max-w-[340px] flex-col gap-2">
                          {boxes.length > 0 ? (
                            <div className="space-y-2">
                              {boxes.map((box, boxIdx) => (
                                <div
                                  key={`${box.boxId}-${boxIdx}`}
                                  className="rounded-xl border border-dashed border-kraft/60 bg-cream/70 p-2.5 text-xs"
                                >
                                  <div className="flex items-start justify-between gap-2 font-bold text-olive">
                                    <span>
                                      {box.quantity} × {box.boxName}
                                      {box.boxNameAr && box.boxNameAr !== box.boxName && (
                                        <span className="block text-[0.6875rem] font-normal text-olive/65" dir="rtl">
                                          {box.boxNameAr}
                                        </span>
                                      )}
                                    </span>
                                    <span className="tabular shrink-0 text-gold-deep">
                                      {formatPrice(box.totalPrice)}
                                    </span>
                                  </div>

                                  {box.swapDetails && box.swapDetails.length > 0 && (
                                    <ul className="mt-1.5 space-y-1 border-t border-dashed border-kraft/40 pt-1.5 text-[0.6875rem]">
                                      {box.swapDetails.map((swap, swapIdx) => (
                                        <li
                                          key={`${swap.componentId}-${swapIdx}`}
                                          className="flex flex-wrap items-center justify-between gap-1 text-olive/80"
                                        >
                                          <span className="leading-snug">
                                            <span className="font-semibold text-olive/65">{swap.componentName}:</span>{' '}
                                            <span className={cn(!swap.isDefault && 'font-semibold text-olive')}>
                                              {swap.itemName}
                                            </span>
                                            {!swap.isDefault && (
                                              <span className="ms-1 inline-block rounded bg-gold/20 px-1 py-0.2 text-[0.625rem] font-semibold text-gold-deep">
                                                Swapped
                                              </span>
                                            )}
                                          </span>
                                          {swap.priceModifier !== 0 && (
                                            <span
                                              className={cn(
                                                'tabular shrink-0 rounded px-1.5 py-0.2 text-[0.625rem] font-bold',
                                                swap.priceModifier > 0
                                                  ? 'bg-emerald-100 text-emerald-800'
                                                  : 'bg-rose-100 text-rose-800',
                                              )}
                                            >
                                              {swap.priceModifier > 0 ? `+${formatPrice(swap.priceModifier)}` : formatPrice(swap.priceModifier)}
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {box.customNotes && (
                                    <div className="mt-1.5 rounded-lg bg-blush/40 px-2 py-1 text-[0.6875rem] text-olive">
                                      <span className="font-semibold">Kitchen note:</span> “{box.customNotes}”
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="max-w-[260px] leading-relaxed text-xs text-olive/90">
                              {summary}
                            </span>
                          )}

                          {/* Financial Breakdown */}
                          <div className="space-y-0.5 border-t border-dashed border-kraft/50 pt-1.5 text-[0.6875rem] text-olive/75">
                            {order.pricing && (
                              <>
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span className="tabular font-medium text-olive">{formatPrice(order.pricing.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Delivery</span>
                                  <span className="tabular font-medium text-olive">
                                    {order.pricing.delivery === 0 ? 'Free' : formatPrice(order.pricing.delivery)}
                                  </span>
                                </div>
                                {order.pricing.giftFee > 0 && (
                                  <div className="flex justify-between">
                                    <span>Gift Card</span>
                                    <span className="tabular font-medium text-olive">{formatPrice(order.pricing.giftFee)}</span>
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex justify-between pt-0.5 text-xs font-bold text-gold-deep">
                              <span>Total</span>
                              <span className="tabular">{formatPrice(total)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Notes / Calligraphy Card */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex max-w-[230px] flex-col gap-2">
                          {order.giftMessage && (
                            <div className="rounded-xl border border-dashed border-gold/60 bg-blush/35 p-2.5 text-xs text-olive">
                              <div className="mb-1 flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wider text-gold-deep">
                                <Gift className="h-3.5 w-3.5" />
                                <span>Calligraphy Card</span>
                              </div>
                              <p className="whitespace-pre-wrap break-words italic leading-relaxed">
                                “{order.giftMessage}”
                              </p>
                            </div>
                          )}
                          {order.note && (
                            <div className="rounded-xl border border-dashed border-kraft bg-cream p-2.5 text-xs text-olive/85">
                              <div className="mb-1 flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wider text-olive/60">
                                <StickyNote className="h-3.5 w-3.5 text-gold" />
                                <span>Customer Note</span>
                              </div>
                              <p className="whitespace-pre-wrap break-words italic leading-relaxed">
                                “{order.note}”
                              </p>
                            </div>
                          )}
                          {!order.giftMessage && !order.note && (
                            <span className="text-olive/40 italic">No special notes</span>
                          )}
                        </div>
                      </td>

                      {/* Status Change & Delete Actions */}
                      <td className="whitespace-nowrap px-6 py-4 align-top text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <div className="relative inline-block text-left">
                            <select
                              value={order.status}
                              onChange={(e) => setStatus(order.id, e.target.value as OrderStatus)}
                              className="cursor-pointer appearance-none rounded-full border border-kraft bg-cream px-3 py-1.5 pr-7 text-xs font-semibold text-olive shadow-xs transition-colors hover:border-gold focus:border-gold focus:outline-none"
                              aria-label={`Change status for order ${order.id}`}
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  Mark as {st.charAt(0).toUpperCase() + st.slice(1)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-olive/60" />
                          </div>

                          {confirmDeleteId === order.id ? (
                            <div className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-1 text-[0.6875rem]">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 font-semibold text-olive hover:underline"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteOrder(order.id)
                                  setConfirmDeleteId(null)
                                }}
                                className="rounded-full bg-red-600 px-2.5 py-0.5 font-bold text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(order.id)}
                              aria-label={`Delete order ${order.id}`}
                              title={`Delete order ${order.id}`}
                              className="rounded-full border border-red-200 p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
