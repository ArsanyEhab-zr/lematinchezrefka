import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getMenuItem } from '@/data/menu'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { createSeedOrders, type Order, type OrderLine, type OrderStatus } from '@/data/orders'

type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt'>

type KitchenState = {
  orders: Order[]
  /** itemIds marked as sold out for today */
  soldOut: string[]
  setStatus: (orderId: string, status: OrderStatus) => void
  deleteOrder: (orderId: string) => void
  addOrder: (order: NewOrder) => Order
  toggleAvailability: (itemId: string) => void
  resetDemoData: () => void
}

const nextOrderId = (orders: Order[]): string => {
  const highest = orders.reduce((max, order) => Math.max(max, Number(order.id.match(/^LM-(\d+)$/)?.[1]) || 0), 1000)
  return `LM-${highest + 1}`
}

export const useKitchenStore = create<KitchenState>()(
  persist(
    (set, get) => ({
      orders: createSeedOrders(),
      soldOut: [],
      setStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        })),
      deleteOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        })),
      addOrder: (draft) => {
        const order: Order = {
          ...draft,
          id: nextOrderId(get().orders),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      toggleAvailability: (itemId) =>
        set((state) => ({
          soldOut: state.soldOut.includes(itemId)
            ? state.soldOut.filter((id) => id !== itemId)
            : [...state.soldOut, itemId],
        })),
      resetDemoData: () => set({ orders: createSeedOrders(), soldOut: [] }),
    }),
    { name: 'le-matin-kitchen', storage: createJSONStorage(() => localStorage) },
  ),
)

export const orderTotal = (lines: OrderLine[]): number => {
  const boxes = useBoxBuilderStore.getState().boxes
  return lines.reduce((total, line) => {
    const box = boxes.find((b) => b.id === line.itemId)
    const unitPrice = box ? box.base_price : (getMenuItem(line.itemId)?.price ?? 0)
    return total + unitPrice * line.quantity
  }, 0)
}

export const orderSummary = (lines: OrderLine[]): string => {
  const boxes = useBoxBuilderStore.getState().boxes
  return lines
    .map((line) => {
      const box = boxes.find((b) => b.id === line.itemId)
      const name = box ? box.name : (getMenuItem(line.itemId)?.name ?? 'Artisanal Box')
      return `${line.quantity} × ${name}`
    })
    .join(', ')
}

