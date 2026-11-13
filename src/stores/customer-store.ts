import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getMenuItem } from '@/data/menu'
import type { CustomizedBoxSelection } from '@/types/box-builder'

/**
 * Everything the site remembers about a returning guest — on this device only.
 * The guest can see what is remembered and clear it at any time.
 */
export type GuestProfile = {
  name: string
  phone: string
  address: string
}

type CustomerState = {
  /** itemId → quantity */
  selection: Record<string, number>
  /** Tailored boxes built through the Interactive Box Builder */
  customizedBoxes: CustomizedBoxSelection[]
  profile: GuestProfile | null

  // Standard items
  addItem: (itemId: string) => void
  removeItem: (itemId: string) => void
  clearSelection: () => void

  // Customized Boxes
  addCustomizedBox: (box: CustomizedBoxSelection) => void
  removeCustomizedBox: (index: number) => void
  clearCustomizedBoxes: () => void

  // Guest Profile
  rememberProfile: (profile: GuestProfile) => void
  forgetProfile: () => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      selection: {},
      customizedBoxes: [],
      profile: null,

      addItem: (itemId) =>
        set((state) => ({ selection: { ...state.selection, [itemId]: (state.selection[itemId] ?? 0) + 1 } })),

      removeItem: (itemId) =>
        set((state) => {
          const nextQuantity = (state.selection[itemId] ?? 0) - 1
          const { [itemId]: _removed, ...rest } = state.selection
          return { selection: nextQuantity > 0 ? { ...rest, [itemId]: nextQuantity } : rest }
        }),

      clearSelection: () => set({ selection: {}, customizedBoxes: [] }),

      addCustomizedBox: (box) =>
        set((state) => ({ customizedBoxes: [...state.customizedBoxes, box] })),

      removeCustomizedBox: (index) =>
        set((state) => ({
          customizedBoxes: state.customizedBoxes.filter((_, i) => i !== index),
        })),

      clearCustomizedBoxes: () => set({ customizedBoxes: [] }),

      rememberProfile: (profile) => set({ profile }),
      forgetProfile: () => set({ profile: null }),
    }),
    { name: 'le-matin-guest', storage: createJSONStorage(() => localStorage) },
  ),
)

export type SelectionLine = {
  itemId: string
  name: string
  quantity: number
  lineTotal: number
}

export const selectionToLines = (selection: Record<string, number>): SelectionLine[] =>
  Object.entries(selection).flatMap(([itemId, quantity]) => {
    const item = getMenuItem(itemId)
    if (!item) return []
    return [{ itemId, name: item.name, quantity, lineTotal: item.price * quantity }]
  })

export const selectionTotal = (lines: SelectionLine[], customizedBoxes: CustomizedBoxSelection[] = []): number => {
  const itemsTotal = lines.reduce((total, line) => total + line.lineTotal, 0)
  const boxesTotal = customizedBoxes.reduce((total, box) => total + box.totalPrice, 0)
  return itemsTotal + boxesTotal
}

export const selectionCount = (selection: Record<string, number>, customizedBoxes: CustomizedBoxSelection[] = []): number => {
  const itemsCount = Object.values(selection).reduce((count, quantity) => count + quantity, 0)
  const boxesCount = customizedBoxes.reduce((count, box) => count + box.quantity, 0)
  return itemsCount + boxesCount
}
