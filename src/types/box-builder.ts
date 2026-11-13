/**
 * Supabase Relational Schema TypeScript Definitions
 * 
 * Relational Mapping:
 * - box_categories (1) -> (N) boxes
 * - boxes (1) -> (N) box_components
 * - items (1) -> (N) box_components [as default_item]
 * - box_components (1) -> (N) swap_options
 * - items (1) -> (N) swap_options
 */

export interface BoxCategory {
  name_en?: string
  name_ar?: string
  description_en?: string
  description_ar?: string
  id: string
  name: string
  description?: string
  display_order?: number
  created_at?: string
}

export interface Box {
  name_en?: string
  name_ar?: string
  description_en?: string
  description_ar?: string
  id: string
  category_id: string | null
  name: string
  description: string
  base_price: number
  image_url: string
  is_active?: boolean
  is_sold_out: boolean
  display_order?: number
  created_at?: string
  updated_at?: string
}

export interface Item {
  name_en?: string
  name_ar?: string
  description_en?: string
  description_ar?: string
  id: string
  name: string
  category: 'bakery' | 'savory' | 'dairy' | 'beverage' | 'sweet' | 'fruit' | 'extra'
  description?: string
  image_url?: string
  is_available?: boolean
  is_sold_out: boolean // Stock control: out of stock ingredients cannot be picked as swaps
  created_at?: string
  updated_at?: string
}

export interface BoxComponent {
  name_en?: string
  name_ar?: string
  description_en?: string
  description_ar?: string
  id: string
  box_id: string
  name: string
  default_item_id: string
  is_swappable: boolean
  display_order?: number
  created_at?: string
  updated_at?: string
}

export interface SwapOption {
  id: string
  component_id: string
  item_id: string
  /**
   * price_modifier supports positive numbers (upgrades e.g. +15),
   * zero (standard replacement e.g. 0),
   * and negative numbers (downgrades/discounts e.g. -10).
   */
  price_modifier: number
  created_at?: string
}

/**
 * Enriched types for UI consumption
 */

export interface EnrichedSwapOption extends SwapOption {
  item: Item
}

export interface EnrichedBoxComponent extends BoxComponent {
  default_item: Item
  swap_options: EnrichedSwapOption[]
}

export interface EnrichedBox extends Box {
  category?: BoxCategory
  components: EnrichedBoxComponent[]
}

/**
 * Customer Selection state for a customized box
 */
export interface CustomizedBoxSelection {
  boxId: string
  boxName: string
  boxNameAr?: string
  basePrice: number
  unitPrice?: number
  /** componentId -> selected itemId */
  selectedSwaps: Record<string, string>
  /** Detailed breakdown for display, receipt & WhatsApp text */
  swapDetails: {
    componentId: string
    componentName: string
    componentNameAr?: string
    itemId: string
    itemName: string
    itemNameAr?: string
    priceModifier: number
    isDefault: boolean
  }[]
  totalPrice: number
  quantity: number
  customNotes?: string
}
