import { useKitchenStore } from '@/stores/kitchen-store'
import { getSupabase } from '@/lib/supabase'
import { cloudId } from '@/lib/cloud-records'
import type { Order } from '@/data/orders'
type Draft = Omit<Order, 'id' | 'status' | 'createdAt'>
/** Stable for retries, including a reload; no customer details are stored in the retry token. */
export const submitCustomerOrder = async (draft: Draft): Promise<Order> => {
  const client = getSupabase()
  if (!client) return useKitchenStore.getState().addOrder(draft)
  if (!draft.customizedBoxes?.length || draft.lines.reduce((sum, line) => sum + line.quantity, 0) !== draft.customizedBoxes.reduce((sum, box) => sum + box.quantity, 0)) throw new Error('Please rebuild your selection using the current breakfast boxes before ordering.')
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(draft)))
  const fingerprint = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')
  let id = crypto.randomUUID() as string
  try {
    const previous = JSON.parse(sessionStorage.getItem('le-matin-order-attempt') || 'null')
    if (previous?.fingerprint === fingerprint) id = previous.id
    else sessionStorage.setItem('le-matin-order-attempt', JSON.stringify({ fingerprint, id }))
  } catch { /* The active request remains valid if browser storage is unavailable. */ }
  const cleanGift = draft.giftMessage !== undefined ? draft.giftMessage.trim() : undefined
  const cleanNote = draft.note?.trim() || undefined
  const normalizedDraft: Draft = { ...draft, note: cleanNote, giftMessage: cleanGift }
  const order: Order = { ...normalizedDraft, id: `LM-${id}`, remoteId: id, status: 'pending', createdAt: new Date().toISOString() }
  const { error } = await client.from('orders').insert({
    id, order_number: order.id, customer_name: draft.customer, customer_phone: draft.phone, customer_address: draft.address,
    delivery_date: draft.deliveryDate, delivery_slot: draft.deliverySlot, items_json: normalizedDraft,
    requested_boxes: draft.customizedBoxes.map(box => ({
      box_id: cloudId(box.boxId),
      quantity: box.quantity,
      swaps: Object.fromEntries(Object.entries(box.selectedSwaps).map(([component, item]) => [cloudId(component), cloudId(item)])),
      ...(box.customNotes?.trim() ? { customNotes: box.customNotes.trim() } : {}),
    })),
    total_price: draft.pricing?.total, delivery_fee: draft.pricing?.delivery, gift_card_note: cleanGift ?? '', gift_requested: cleanGift !== undefined,
  })
  // Unique IDs make a lost response safe to retry without creating a second order.
  if (error && error.code !== '23505') throw new Error(error.message)
  useKitchenStore.setState(state => ({ orders: [order, ...state.orders.filter(existing => existing.remoteId !== id)] }))
  try { sessionStorage.removeItem('le-matin-order-attempt') } catch { /* optional retry cache */ }
  return order
}
