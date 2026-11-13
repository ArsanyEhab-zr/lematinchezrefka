import type { CustomizedBoxSelection } from '@/types/box-builder'
import { isoDateFromToday } from '@/lib/utils'

export type OrderStatus = 'pending' | 'preparing' | 'delivered'

export type OrderLine = {
  itemId: string
  quantity: number
}

export type Order = {
  remoteId?: string
  id: string
  customer: string
  phone: string
  address: string
  lines: OrderLine[]
  deliveryDate: string
  deliverySlot: string
  status: OrderStatus
  note?: string
  pricing?: { subtotal: number; delivery: number; giftFee: number; total: number }
  customizedBoxes?: CustomizedBoxSelection[]
  giftMessage?: string
  createdAt: string
}

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'preparing', 'delivered']

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  delivered: 'Delivered',
}

export const DELIVERY_SLOTS = ['7:00–8:00', '8:00–9:00', '9:00–10:00', '10:00–11:00'] as const

/** Sample orders so the dashboard is populated on first load. */
export const createSeedOrders = (): Order[] => {
  const today = isoDateFromToday(0)
  const tomorrow = isoDateFromToday(1)
  const yesterday = isoDateFromToday(-1)
  const createdAt = new Date().toISOString()

  return [
    { id: 'LM-1048', customer: 'Salma Ben Ali', phone: '+216 22 145 870', address: '14 Rue des Jasmins, La Marsa', lines: [{ itemId: 'le-grand-matin', quantity: 1 }, { itemId: 'jus-orange', quantity: 1 }], deliveryDate: today, deliverySlot: '7:00–8:00', status: 'delivered', note: 'Birthday — please add a candle.', createdAt },
    { id: 'LM-1049', customer: 'Youssef Trabelsi', phone: '+216 98 302 114', address: 'Les Berges du Lac, Immeuble Amen, 3e étage', lines: [{ itemId: 'plateau-brunch-famille', quantity: 1 }, { itemId: 'cafe-au-lait', quantity: 2 }], deliveryDate: today, deliverySlot: '8:00–9:00', status: 'preparing', note: 'Office meeting at 9:15.', createdAt },
    { id: 'LM-1050', customer: 'Amira Khelifi', phone: '+216 55 870 441', address: '3 Avenue Habib Bourguiba, Carthage', lines: [{ itemId: 'brunch-romance', quantity: 1 }], deliveryDate: today, deliverySlot: '8:00–9:00', status: 'preparing', note: 'Anniversary. Card: “To ten more years.”', createdAt },
    { id: 'LM-1051', customer: 'Mehdi Gharbi', phone: '+216 20 554 093', address: '27 Rue de Marseille, Tunis', lines: [{ itemId: 'la-petite-matinee', quantity: 2 }], deliveryDate: today, deliverySlot: '9:00–10:00', status: 'pending', createdAt },
    { id: 'LM-1052', customer: 'Nour Hamdi', phone: '+216 24 991 207', address: 'Sidi Bou Said, Villa Les Oliviers', lines: [{ itemId: 'corbeille-viennoiseries', quantity: 1 }, { itemId: 'panna-cotta-fraise', quantity: 1 }], deliveryDate: today, deliverySlot: '10:00–11:00', status: 'pending', note: 'No nuts, please.', createdAt },
    { id: 'LM-1053', customer: 'Ines Jaziri', phone: '+216 52 610 388', address: '8 Rue Ibn Khaldoun, La Marsa', lines: [{ itemId: 'le-jardin', quantity: 1 }, { itemId: 'jus-orange', quantity: 1 }], deliveryDate: tomorrow, deliverySlot: '7:00–8:00', status: 'pending', createdAt },
    { id: 'LM-1054', customer: 'Karim Mansour', phone: '+216 97 118 562', address: 'Ennasr 2, Résidence El Yasmine', lines: [{ itemId: 'plateau-figues-fromages', quantity: 1 }], deliveryDate: tomorrow, deliverySlot: '9:00–10:00', status: 'pending', note: 'Ring twice — baby sleeping.', createdAt },
    { id: 'LM-1046', customer: 'Leila Saidi', phone: '+216 23 447 019', address: '5 Rue du Lac Léman, Les Berges du Lac', lines: [{ itemId: 'le-grand-matin', quantity: 2 }], deliveryDate: yesterday, deliverySlot: '8:00–9:00', status: 'delivered', createdAt },
    { id: 'LM-1047', customer: 'Omar Bouazizi', phone: '+216 50 223 980', address: '19 Avenue de la Liberté, Tunis', lines: [{ itemId: 'croissants-au-beurre', quantity: 2 }, { itemId: 'chocolat-chaud', quantity: 1 }], deliveryDate: yesterday, deliverySlot: '7:00–8:00', status: 'delivered', createdAt },
  ]
}

