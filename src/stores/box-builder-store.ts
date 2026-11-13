import { assertLocalSave } from '@/lib/media'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  Box,
  BoxCategory,
  BoxComponent,
  Item,
  SwapOption,
  EnrichedBox,
  EnrichedBoxComponent,
  EnrichedSwapOption,
  CustomizedBoxSelection,
} from '@/types/box-builder'

// ── Default Seed Box Categories ───────────────────────────────────────────────
export const INITIAL_CATEGORIES: BoxCategory[] = [
  {
    id: 'cat-couples',
    name: 'Couples Trays',
    description: 'Generous morning breakfast feasts and wooden trays crafted for sharing between two.',
    display_order: 1,
  },
  {
    id: 'cat-individual',
    name: 'Individual Boxes',
    description: 'Wholesome, perfectly-portioned morning rituals tailored for mindful solo starts.',
    display_order: 2,
  },
  {
    id: 'cat-prestige',
    name: 'Prestige Celebrations',
    description: 'Luxury celebration breakfast hampers with artisanal dessert pots and fresh floral posies.',
    display_order: 3,
  },
]

// ── Default Seed Items Catalog (STRICTLY Internal Ingredients) ─────────────────
export const INITIAL_ITEMS: Item[] = [
  // Bakery & Breads
  { id: 'item-croissant-butter', name: 'Normandy Butter Croissant', category: 'bakery', description: 'Flaky 72-layer croissant made with cultured French butter', is_available: true, is_sold_out: false },
  { id: 'item-croissant-turkey', name: 'Turkey & Emmental Croissant', category: 'savory', description: 'Warm smoked turkey breast and melted Swiss Emmental', is_available: true, is_sold_out: false },
  { id: 'item-croissant-salami', name: 'Smoked Salami & Dijon Croissant', category: 'savory', description: 'Artisan beef salami with aged grain mustard', is_available: true, is_sold_out: false },
  { id: 'item-croissant-pistachio', name: 'Pistachio Praline Croissant', category: 'sweet', description: 'Filled with roasted Sicilian pistachio cream', is_available: true, is_sold_out: false },
  { id: 'item-rye-bread', name: 'Seeded Rye Country Bread', category: 'bakery', description: 'Organic sourdough rye with pumpkin and flax seeds', is_available: true, is_sold_out: false },
  { id: 'item-gluten-free-bread', name: 'Gluten-Free Buckwheat Loaf', category: 'bakery', description: 'Artisan ancient grain loaf baked fresh', is_available: true, is_sold_out: false },
  { id: 'item-sourdough', name: 'Pain de Campagne Slices', category: 'bakery', description: '24-hour slow fermented French country sourdough', is_available: true, is_sold_out: false },
  { id: 'item-brioche-french-toast', name: 'Brioche French Toast & Berries', category: 'sweet', description: 'Caramelized thick-cut brioche with wild blueberries', is_available: true, is_sold_out: false },
  { id: 'item-vanilla-waffles', name: 'Belgian Vanilla Waffles & Maple', category: 'sweet', description: 'Crisp pearl-sugar waffles with Quebec maple syrup', is_available: true, is_sold_out: false },
  { id: 'item-bostock-almond', name: 'Almond Frangipane Bostock', category: 'sweet', description: 'Orange-blossom soaked brioche baked with almond cream', is_available: true, is_sold_out: false },

  // Eggs & Savory
  { id: 'item-scrambled-eggs', name: 'Soft Scrambled Eggs with Chives', category: 'savory', description: 'Free-range eggs gently cooked with cream and garden chives', is_available: true, is_sold_out: false },
  { id: 'item-poached-avocado', name: 'Poached Eggs with Avocado', category: 'savory', description: 'Two organic poached eggs over sliced Hass avocado', is_available: true, is_sold_out: false },
  { id: 'item-truffle-omelette', name: 'Truffle & Herb Omelette', category: 'savory', description: 'French folded omelette with summer black truffle oil', is_available: true, is_sold_out: false },
  { id: 'item-avocado-hemp', name: 'Hass Avocado & Hemp Heart Salad', category: 'fruit', description: 'Dressed with cold-pressed olive oil and Maldon sea salt', is_available: true, is_sold_out: false },
  { id: 'item-smoked-salmon', name: 'Scottish Smoked Salmon & Capers', category: 'savory', description: 'Cured ribbon slices with caperberries and fresh dill', is_available: true, is_sold_out: false },
  { id: 'item-heirloom-feta', name: 'Heirloom Tomatoes & Barrel Feta', category: 'savory', description: 'Marinated cherry tomatoes with aged Greek feta', is_available: true, is_sold_out: false },

  // Dairy, Yogurt & Bowls
  { id: 'item-greek-granola', name: 'Greek Yoghurt & Homemade Granola', category: 'dairy', description: 'Strained whole-milk yogurt, honey-roasted oat clusters', is_available: true, is_sold_out: false },
  { id: 'item-chia-pudding', name: 'Coconut Milk Chia Pudding', category: 'dairy', description: 'Infused with Madagascar vanilla bean and mango puree', is_available: true, is_sold_out: false },
  { id: 'item-acai-bowl', name: 'Wild Amazon Açai Berry Bowl', category: 'fruit', description: 'Blended with banana and topped with coconut flakes and cacao', is_available: true, is_sold_out: false },
  { id: 'item-panna-cotta-straw', name: 'Strawberry Panna Cotta Duo', category: 'sweet', description: 'Silky cream infused with vanilla and local strawberries', is_available: true, is_sold_out: false },
  { id: 'item-chocolate-lava', name: 'Valrhona Chocolate Lava Mini-Pots', category: 'sweet', description: '70% dark chocolate pots with liquid hazelnut core', is_available: true, is_sold_out: false },
  { id: 'item-macaron-tower', name: 'Parisian Raspberry Macaron Duo', category: 'sweet', description: 'Crisp almond shells with tangy raspberry ganache', is_available: true, is_sold_out: false },

  // Spreads & Jams
  { id: 'item-fig-jam', name: 'Artisan Fig & Walnut Jam', category: 'sweet', description: 'Kairouan black figs simmered with roasted walnuts', is_available: true, is_sold_out: false },
  { id: 'item-raw-honey', name: 'Raw Cap Bon Wildflower Honey', category: 'sweet', description: 'Unfiltered golden comb honey from Mediterranean hills', is_available: true, is_sold_out: false },
  { id: 'item-almond-butter', name: 'Stone-Ground Almond Butter', category: 'sweet', description: '100% roasted almonds with a touch of fleur de sel', is_available: true, is_sold_out: false },

  // Juices & Beverages
  { id: 'item-orange-juice', name: 'Fresh Pressed Maltese Orange Juice', category: 'beverage', description: 'Sweet seasonal citrus pressed fresh each dawn', is_available: true, is_sold_out: false },
  { id: 'item-strawberry-juice', name: 'Cold-Pressed Strawberry & Mint', category: 'beverage', description: 'Hand-crushed berries with garden spearmint', is_available: true, is_sold_out: false },
  { id: 'item-green-detox', name: 'Green Detox Apple, Cucumber & Ginger', category: 'beverage', description: 'Refreshing nutrient-dense morning tonic', is_available: true, is_sold_out: false },
  { id: 'item-pomegranate-juice', name: 'Pure Testour Pomegranate Splash', category: 'beverage', description: 'Rich antioxidant-packed ruby press', is_available: true, is_sold_out: false },
  { id: 'item-cafe-lait', name: 'Slow-Drip Café au Lait (Thermos)', category: 'beverage', description: 'Single-origin roast with warm steamed whole milk', is_available: true, is_sold_out: false },
  { id: 'item-cappuccino', name: 'Double Shot Velvet Cappuccino', category: 'beverage', description: 'Rich espresso with microfoam and Dutch cocoa dust', is_available: true, is_sold_out: false },
  { id: 'item-hot-chocolate', name: 'Traditional Parisian Hot Chocolate', category: 'beverage', description: 'Melted dark chocolate ganache with a hint of cinnamon', is_available: true, is_sold_out: false },
  { id: 'item-filter-coffee', name: 'Black Filter Coffee (Pour-Over)', category: 'beverage', description: 'Clean Ethiopian pour-over roast, served black', is_available: true, is_sold_out: false },

  // Extras & Flowers
  { id: 'item-flower-posy', name: 'Fresh Jasmine & Eucalyptus Posy', category: 'extra', description: 'Handpicked local morning stems tied with natural raffia', is_available: true, is_sold_out: false },
  { id: 'item-rose-posy', name: 'Blush Garden Rose Posy', category: 'extra', description: 'Fragrant French tea roses wrapped in parchment', is_available: true, is_sold_out: false },
]

// ── Default Seed Boxes ────────────────────────────────────────────────────────
export const INITIAL_BOXES: Box[] = [
  {
    id: 'box-couples-tray',
    category_id: 'cat-couples',
    name: 'Couples Tray (Le Grand Matin)',
    description: 'Our signature breakfast feast for two. Features artisan croissants, farm eggs, fresh juices, and warm café au lait, packed with ribbon and a calligraphy card.',
    base_price: 240,
    image_url: '1504754524776-8f4f37790ca0',
    is_active: true,
    is_sold_out: false,
    display_order: 1,
  },
  {
    id: 'box-healthy-garden',
    category_id: 'cat-individual',
    name: 'Healthy Botanical Box (Le Jardin)',
    description: 'A vibrant, wholesome morning ritual. Ancient grain bread, superfood breakfast bowls, cold-pressed green elixirs, and nutrient-dense savory garnishes.',
    base_price: 180,
    image_url: '1541519227354-08fa5d50c44d',
    is_active: true,
    is_sold_out: false,
    display_order: 2,
  },
  {
    id: 'box-executive-solo',
    category_id: 'cat-individual',
    name: 'The Executive Solo Morning',
    description: 'Crafted for focused work mornings. Fresh butter viennoiserie, protein-rich soft scrambled eggs, fresh citrus juice, and hot artisanal café.',
    base_price: 160,
    image_url: '1525351484163-7529414344d8',
    is_active: true,
    is_sold_out: false,
    display_order: 3,
  },
  {
    id: 'box-brunch-romance',
    category_id: 'cat-prestige',
    name: 'Brunch Romance (Prestige Hamper)',
    description: 'Designed for anniversaries, birthdays and quiet romantic mornings. Indulgent caramelized brioche, dessert pots, and fresh garden flowers.',
    base_price: 320,
    image_url: '1484723091739-30a097e8f929',
    is_active: true,
    is_sold_out: false,
    display_order: 4,
  },
  {
    id: 'box-anniversary-luxury',
    category_id: 'cat-prestige',
    name: "L'Anniversaire Royal Box",
    description: 'The pinnacle of celebration catering. Truffle and herb egg skillet, Parisian macaron tower, double chocolate lava pots, and fresh blush rose stems.',
    base_price: 380,
    image_url: '1533089860892-a7c6f0a88666',
    is_active: true,
    is_sold_out: false,
    display_order: 5,
  },
]

// ── Default Seed Components ───────────────────────────────────────────────────
export const INITIAL_COMPONENTS: BoxComponent[] = [
  // Box 1: Couples Tray
  { id: 'comp-1-1', box_id: 'box-couples-tray', name: 'Croissant Selection', default_item_id: 'item-croissant-butter', is_swappable: true, display_order: 1 },
  { id: 'comp-1-2', box_id: 'box-couples-tray', name: 'Egg Preparation', default_item_id: 'item-scrambled-eggs', is_swappable: true, display_order: 2 },
  { id: 'comp-1-3', box_id: 'box-couples-tray', name: 'Artisan Jam & Spread', default_item_id: 'item-fig-jam', is_swappable: true, display_order: 3 },
  { id: 'comp-1-4', box_id: 'box-couples-tray', name: 'Fresh Morning Juice', default_item_id: 'item-orange-juice', is_swappable: true, display_order: 4 },
  { id: 'comp-1-5', box_id: 'box-couples-tray', name: 'Hot Morning Beverage', default_item_id: 'item-cafe-lait', is_swappable: true, display_order: 5 },

  // Box 2: Healthy Box
  { id: 'comp-2-1', box_id: 'box-healthy-garden', name: 'Organic Bread Base', default_item_id: 'item-rye-bread', is_swappable: true, display_order: 1 },
  { id: 'comp-2-2', box_id: 'box-healthy-garden', name: 'Morning Wellness Bowl', default_item_id: 'item-greek-granola', is_swappable: true, display_order: 2 },
  { id: 'comp-2-3', box_id: 'box-healthy-garden', name: 'Cold-Pressed Juice', default_item_id: 'item-green-detox', is_swappable: true, display_order: 3 },
  { id: 'comp-2-4', box_id: 'box-healthy-garden', name: 'Botanical Side Garnish', default_item_id: 'item-avocado-hemp', is_swappable: true, display_order: 4 },

  // Box 3: Executive Solo Box
  { id: 'comp-3-1', box_id: 'box-executive-solo', name: 'Morning Bakery', default_item_id: 'item-croissant-butter', is_swappable: true, display_order: 1 },
  { id: 'comp-3-2', box_id: 'box-executive-solo', name: 'Protein Breakfast Base', default_item_id: 'item-scrambled-eggs', is_swappable: true, display_order: 2 },
  { id: 'comp-3-3', box_id: 'box-executive-solo', name: 'Citrus Press', default_item_id: 'item-orange-juice', is_swappable: true, display_order: 3 },
  { id: 'comp-3-4', box_id: 'box-executive-solo', name: 'Warm Brew', default_item_id: 'item-cafe-lait', is_swappable: true, display_order: 4 },

  // Box 4: Romance Box
  { id: 'comp-4-1', box_id: 'box-brunch-romance', name: 'Warm Pastry Centerpiece', default_item_id: 'item-brioche-french-toast', is_swappable: true, display_order: 1 },
  { id: 'comp-4-2', box_id: 'box-brunch-romance', name: 'Patisserie Dessert Pot', default_item_id: 'item-panna-cotta-straw', is_swappable: true, display_order: 2 },
  { id: 'comp-4-3', box_id: 'box-brunch-romance', name: 'Flower Posy Bouquet', default_item_id: 'item-flower-posy', is_swappable: true, display_order: 3 },

  // Box 5: Royal Anniversary
  { id: 'comp-5-1', box_id: 'box-anniversary-luxury', name: 'Gourmet Savory Centerpiece', default_item_id: 'item-truffle-omelette', is_swappable: true, display_order: 1 },
  { id: 'comp-5-2', box_id: 'box-anniversary-luxury', name: 'Artisan Pastry Duo', default_item_id: 'item-croissant-pistachio', is_swappable: true, display_order: 2 },
  { id: 'comp-5-3', box_id: 'box-anniversary-luxury', name: 'Celebration Sweet Finale', default_item_id: 'item-macaron-tower', is_swappable: true, display_order: 3 },
  { id: 'comp-5-4', box_id: 'box-anniversary-luxury', name: 'Fresh Flower Gift', default_item_id: 'item-rose-posy', is_swappable: true, display_order: 4 },
]

// ── Default Seed Swap Options ──────────────────────────────────────────────────
export const INITIAL_SWAP_OPTIONS: SwapOption[] = [
  // Box 1: Croissant Options
  { id: 'so-1', component_id: 'comp-1-1', item_id: 'item-croissant-butter', price_modifier: 0 },
  { id: 'so-2', component_id: 'comp-1-1', item_id: 'item-croissant-turkey', price_modifier: 15 },
  { id: 'so-3', component_id: 'comp-1-1', item_id: 'item-croissant-salami', price_modifier: 20 },
  { id: 'so-4', component_id: 'comp-1-1', item_id: 'item-croissant-pistachio', price_modifier: 25 },
  { id: 'so-5-neg', component_id: 'comp-1-1', item_id: 'item-sourdough', price_modifier: -10 },

  // Box 1: Eggs Options
  { id: 'so-5', component_id: 'comp-1-2', item_id: 'item-scrambled-eggs', price_modifier: 0 },
  { id: 'so-6', component_id: 'comp-1-2', item_id: 'item-poached-avocado', price_modifier: 20 },
  { id: 'so-7', component_id: 'comp-1-2', item_id: 'item-truffle-omelette', price_modifier: 35 },

  // Box 1: Jam Options
  { id: 'so-8', component_id: 'comp-1-3', item_id: 'item-fig-jam', price_modifier: 0 },
  { id: 'so-9', component_id: 'comp-1-3', item_id: 'item-raw-honey', price_modifier: 10 },
  { id: 'so-10', component_id: 'comp-1-3', item_id: 'item-almond-butter', price_modifier: 15 },

  // Box 1: Juice Options
  { id: 'so-11', component_id: 'comp-1-4', item_id: 'item-orange-juice', price_modifier: 0 },
  { id: 'so-12', component_id: 'comp-1-4', item_id: 'item-strawberry-juice', price_modifier: 15 },
  { id: 'so-13', component_id: 'comp-1-4', item_id: 'item-green-detox', price_modifier: 20 },

  // Box 1: Hot Beverage Options
  { id: 'so-14', component_id: 'comp-1-5', item_id: 'item-cafe-lait', price_modifier: 0 },
  { id: 'so-15', component_id: 'comp-1-5', item_id: 'item-cappuccino', price_modifier: 10 },
  { id: 'so-16', component_id: 'comp-1-5', item_id: 'item-hot-chocolate', price_modifier: 15 },
  { id: 'so-17-neg', component_id: 'comp-1-5', item_id: 'item-filter-coffee', price_modifier: -10 },

  // Box 2: Bread Options
  { id: 'so-20', component_id: 'comp-2-1', item_id: 'item-rye-bread', price_modifier: 0 },
  { id: 'so-21', component_id: 'comp-2-1', item_id: 'item-gluten-free-bread', price_modifier: 15 },
  { id: 'so-22-neg', component_id: 'comp-2-1', item_id: 'item-sourdough', price_modifier: -5 },

  // Box 2: Bowl Options
  { id: 'so-23', component_id: 'comp-2-2', item_id: 'item-greek-granola', price_modifier: 0 },
  { id: 'so-24', component_id: 'comp-2-2', item_id: 'item-chia-pudding', price_modifier: 15 },
  { id: 'so-25', component_id: 'comp-2-2', item_id: 'item-acai-bowl', price_modifier: 25 },

  // Box 2: Juice Options
  { id: 'so-26', component_id: 'comp-2-3', item_id: 'item-green-detox', price_modifier: 0 },
  { id: 'so-27', component_id: 'comp-2-3', item_id: 'item-orange-juice', price_modifier: 0 },
  { id: 'so-28', component_id: 'comp-2-3', item_id: 'item-pomegranate-juice', price_modifier: 20 },

  // Box 2: Garnish Options
  { id: 'so-29', component_id: 'comp-2-4', item_id: 'item-avocado-hemp', price_modifier: 0 },
  { id: 'so-30', component_id: 'comp-2-4', item_id: 'item-smoked-salmon', price_modifier: 40 },
  { id: 'so-31', component_id: 'comp-2-4', item_id: 'item-heirloom-feta', price_modifier: 15 },

  // Box 3: Executive Solo Options
  { id: 'so-32', component_id: 'comp-3-1', item_id: 'item-croissant-butter', price_modifier: 0 },
  { id: 'so-33', component_id: 'comp-3-1', item_id: 'item-croissant-turkey', price_modifier: 15 },
  { id: 'so-34', component_id: 'comp-3-2', item_id: 'item-scrambled-eggs', price_modifier: 0 },
  { id: 'so-35', component_id: 'comp-3-2', item_id: 'item-poached-avocado', price_modifier: 20 },
  { id: 'so-36', component_id: 'comp-3-3', item_id: 'item-orange-juice', price_modifier: 0 },
  { id: 'so-37', component_id: 'comp-3-3', item_id: 'item-green-detox', price_modifier: 15 },
  { id: 'so-38', component_id: 'comp-3-4', item_id: 'item-cafe-lait', price_modifier: 0 },
  { id: 'so-39-neg', component_id: 'comp-3-4', item_id: 'item-filter-coffee', price_modifier: -10 },

  // Box 4: Romance Box Pastry
  { id: 'so-40', component_id: 'comp-4-1', item_id: 'item-brioche-french-toast', price_modifier: 0 },
  { id: 'so-41', component_id: 'comp-4-1', item_id: 'item-vanilla-waffles', price_modifier: 10 },
  { id: 'so-42', component_id: 'comp-4-1', item_id: 'item-bostock-almond', price_modifier: 20 },
  { id: 'so-42-neg', component_id: 'comp-4-1', item_id: 'item-croissant-butter', price_modifier: -15 },

  // Box 4: Dessert Pots
  { id: 'so-43', component_id: 'comp-4-2', item_id: 'item-panna-cotta-straw', price_modifier: 0 },
  { id: 'so-44', component_id: 'comp-4-2', item_id: 'item-chocolate-lava', price_modifier: 15 },
  { id: 'so-45', component_id: 'comp-4-2', item_id: 'item-macaron-tower', price_modifier: 25 },

  // Box 4: Flower Posy
  { id: 'so-46', component_id: 'comp-4-3', item_id: 'item-flower-posy', price_modifier: 0 },
  { id: 'so-47', component_id: 'comp-4-3', item_id: 'item-rose-posy', price_modifier: 25 },

  // Box 5: Royal Anniversary
  { id: 'so-50', component_id: 'comp-5-1', item_id: 'item-truffle-omelette', price_modifier: 0 },
  { id: 'so-51', component_id: 'comp-5-1', item_id: 'item-smoked-salmon', price_modifier: 25 },
  { id: 'so-52', component_id: 'comp-5-2', item_id: 'item-croissant-pistachio', price_modifier: 0 },
  { id: 'so-53', component_id: 'comp-5-2', item_id: 'item-brioche-french-toast', price_modifier: 15 },
  { id: 'so-54', component_id: 'comp-5-3', item_id: 'item-macaron-tower', price_modifier: 0 },
  { id: 'so-55', component_id: 'comp-5-3', item_id: 'item-chocolate-lava', price_modifier: 0 },
  { id: 'so-56', component_id: 'comp-5-4', item_id: 'item-rose-posy', price_modifier: 0 },
]

export interface BoxBuilderStoreState {
  // Normalized Relational Tables (Single Source of Truth)
  categories: BoxCategory[]
  boxes: Box[]
  components: BoxComponent[]
  items: Item[]
  swapOptions: SwapOption[]

  // Active Customer Box Customization Modal State
  activeBoxId: string | null
  selectedSwaps: Record<string, string> // componentId -> itemId
  quantity: number
  customNotes: string

  // Customer Actions
  openBuilder: (boxId: string) => void
  closeBuilder: () => void
  selectSwap: (componentId: string, itemId: string) => void
  setQuantity: (quantity: number) => void
  setCustomNotes: (notes: string) => void
  resetSelection: () => void

  // Relational Selectors
  getEnrichedBox: (boxId: string) => EnrichedBox | null
  getAllEnrichedBoxes: () => EnrichedBox[]
  getCalculatedPrice: (boxId: string, swaps: Record<string, string>) => number
  getCurrentSelection: () => CustomizedBoxSelection | null

  // Synchronized Stock & Inventory Actions (Unified API)
  addItem: (item: Omit<Item, 'id' | 'is_sold_out'> & { is_sold_out?: boolean }) => Item
  createItem: (item: Omit<Item, 'id' | 'is_sold_out'> & { is_sold_out?: boolean }) => Item
  updateItem: (itemId: string, updates: Partial<Item>) => void
  deleteItem: (itemId: string) => void
  updateItemStatus: (itemId: string, isSoldOut: boolean) => void
  setItemSoldOut: (itemId: string, isSoldOut: boolean) => void
  toggleItemSoldOut: (itemId: string) => void

  // Synchronized Box Actions (Unified API)
  addBox: (box: Omit<Box, 'id' | 'is_sold_out'> & { is_sold_out?: boolean }) => Box
  createBox: (box: Omit<Box, 'id' | 'is_sold_out'> & { is_sold_out?: boolean }) => Box
  updateBox: (boxId: string, updates: Partial<Box>) => void
  deleteBox: (boxId: string) => void
  updateBoxStatus: (boxId: string, isSoldOut: boolean) => void
  setBoxSoldOut: (boxId: string, isSoldOut: boolean) => void
  toggleBoxSoldOut: (boxId: string) => void

  // Category & Component Actions
  addCategory: (
    name: string,
    description?: string,
    extra?: { name_en?: string; name_ar?: string; display_order?: number }
  ) => BoxCategory
  updateCategory: (categoryId: string, updates: Partial<BoxCategory>) => void
  deleteCategory: (
    categoryId: string,
    options?: { targetCategoryId?: string | null; deleteBoxes?: boolean }
  ) => void

  addComponent: (
    boxId: string,
    name: string,
    defaultItemId: string,
    isSwappable: boolean,
    initialSwaps?: { itemId: string; priceModifier: number }[],
    extra?: { name_en?: string; name_ar?: string }
  ) => BoxComponent
  updateComponent: (componentId: string, updates: Partial<BoxComponent>) => void
  deleteComponent: (componentId: string) => void

  addSwapOption: (componentId: string, itemId: string, priceModifier: number) => SwapOption
  updateSwapOption: (
    swapOptionId: string,
    updates: Partial<Pick<SwapOption, 'item_id' | 'price_modifier'>>
  ) => void
  updateSwapOptionModifier: (swapOptionId: string, priceModifier: number) => void
  removeSwapOption: (swapOptionId: string) => void

  resetToDefaults: () => void
}

let entitySeq = 0
const nextEntityId = (prefix: string) =>
  `${prefix}-${Date.now()}-${(++entitySeq).toString(36)}`

export const useBoxBuilderStore = create<BoxBuilderStoreState>()(
  persist(
    (set, get) => {
      const handleCreateItem = (
        itemData: Omit<Item, 'id' | 'is_sold_out'> & { is_sold_out?: boolean }
      ): Item => {
        const id = nextEntityId('item')
        const enName = (itemData.name_en || itemData.name).trim()
        const newItem: Item = {
          is_available: true,
          is_sold_out: false,
          ...itemData,
          id,
          name: enName,
          name_en: enName,
          name_ar: itemData.name_ar?.trim() || undefined,
        }
        set((state) => ({ items: [...state.items, newItem] }))
        return newItem
      }

      const handleUpdateItemStatus = (itemId: string, isSoldOut: boolean) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, is_sold_out: isSoldOut } : i
          ),
        }))
      }

      const handleCreateBox = (
        boxData: Omit<Box, 'id' | 'is_sold_out'> & { is_sold_out?: boolean }
      ): Box => {
        const id = nextEntityId('box')
        const enName = (boxData.name_en || boxData.name).trim()
        const enDesc = (boxData.description_en || boxData.description).trim()
        const newBox: Box = {
          is_active: true,
          is_sold_out: false,
          display_order: get().boxes.length + 1,
          ...boxData,
          id,
          name: enName,
          name_en: enName,
          name_ar: boxData.name_ar?.trim() || undefined,
          description: enDesc,
          description_en: enDesc,
          description_ar: boxData.description_ar?.trim() || undefined,
        }
        set((state) => ({ boxes: [...state.boxes, newBox] }))
        return newBox
      }

      const handleUpdateBoxStatus = (boxId: string, isSoldOut: boolean) => {
        set((state) => ({
          boxes: state.boxes.map((b) =>
            b.id === boxId ? { ...b, is_sold_out: isSoldOut } : b
          ),
        }))
      }

      return {
        categories: INITIAL_CATEGORIES,
        boxes: INITIAL_BOXES,
        components: INITIAL_COMPONENTS,
        items: INITIAL_ITEMS,
        swapOptions: INITIAL_SWAP_OPTIONS,

        activeBoxId: null,
        selectedSwaps: {},
        quantity: 1,
        customNotes: '',

        // ── Customer Modal Actions ──────────────────────────────────────────────
        openBuilder: (boxId: string) => {
          const state = get()
          const targetBox = state.boxes.find((b) => b.id === boxId)
          if (!targetBox || targetBox.is_sold_out) return

          const boxComponents = state.components.filter((c) => c.box_id === boxId)
          const itemsMap = new Map<string, Item>(state.items.map((i) => [i.id, i]))

          // Initialize with default items; if default is sold out, pick first available swap option
          const initialSwaps: Record<string, string> = {}
          boxComponents.forEach((c) => {
            const defaultItem = itemsMap.get(c.default_item_id)
            if (defaultItem && !defaultItem.is_sold_out) {
              initialSwaps[c.id] = c.default_item_id
            } else {
              const availableSwap = state.swapOptions.find((so) => {
                if (so.component_id !== c.id) return false
                const swapItem = itemsMap.get(so.item_id)
                return swapItem && !swapItem.is_sold_out
              })
              initialSwaps[c.id] = availableSwap ? availableSwap.item_id : c.default_item_id
            }
          })

          set({
            activeBoxId: boxId,
            selectedSwaps: initialSwaps,
            quantity: 1,
            customNotes: '',
          })
        },

        closeBuilder: () => {
          set({
            activeBoxId: null,
            selectedSwaps: {},
            quantity: 1,
            customNotes: '',
          })
        },

        selectSwap: (componentId: string, itemId: string) => {
          // Guard: never allow selecting a sold-out ingredient
          const item = get().items.find((i) => i.id === itemId)
          if (item?.is_sold_out) return

          set((state) => ({
            selectedSwaps: {
              ...state.selectedSwaps,
              [componentId]: itemId,
            },
          }))
        },

        setQuantity: (quantity: number) => {
          set({ quantity: Math.max(1, quantity) })
        },

        setCustomNotes: (customNotes: string) => {
          set({ customNotes })
        },

        resetSelection: () => {
          const { activeBoxId, components, items, swapOptions } = get()
          if (!activeBoxId) return

          const boxComponents = components.filter((c) => c.box_id === activeBoxId)
          const itemsMap = new Map<string, Item>(items.map((i) => [i.id, i]))
          const initialSwaps: Record<string, string> = {}

          boxComponents.forEach((c) => {
            const defaultItem = itemsMap.get(c.default_item_id)
            if (defaultItem && !defaultItem.is_sold_out) {
              initialSwaps[c.id] = c.default_item_id
            } else {
              const availableSwap = swapOptions.find((so) => {
                if (so.component_id !== c.id) return false
                const swapItem = itemsMap.get(so.item_id)
                return swapItem && !swapItem.is_sold_out
              })
              initialSwaps[c.id] = availableSwap ? availableSwap.item_id : c.default_item_id
            }
          })

          set({ selectedSwaps: initialSwaps, quantity: 1, customNotes: '' })
        },

        // ── Relational Selectors ────────────────────────────────────────────────
        getEnrichedBox: (boxId: string): EnrichedBox | null => {
          const { boxes, categories, components, items, swapOptions } = get()
          const box = boxes.find((b) => b.id === boxId)
          if (!box) return null

          const category = categories.find((c) => c.id === box.category_id)
          const itemsMap = new Map<string, Item>(items.map((i) => [i.id, i]))

          const boxComponents: EnrichedBoxComponent[] = components
            .filter((c) => c.box_id === boxId)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((comp) => {
              const defaultItem = itemsMap.get(comp.default_item_id) || {
                id: comp.default_item_id,
                name: 'Item Unavailable',
                category: 'bakery' as const,
                is_sold_out: true,
              }

              const compSwaps: EnrichedSwapOption[] = swapOptions
                .filter((so) => so.component_id === comp.id)
                .map((so) => ({
                  ...so,
                  item: itemsMap.get(so.item_id) || {
                    id: so.item_id,
                    name: 'Option Unavailable',
                    category: 'extra' as const,
                    is_sold_out: true,
                  },
                }))

              return {
                ...comp,
                default_item: defaultItem,
                swap_options: compSwaps,
              }
            })

          return {
            ...box,
            category,
            components: boxComponents,
          }
        },

        getAllEnrichedBoxes: (): EnrichedBox[] => {
          const { boxes, getEnrichedBox } = get()
          return boxes
            .map((b) => getEnrichedBox(b.id))
            .filter((b): b is EnrichedBox => b !== null)
        },

        getCalculatedPrice: (boxId: string, swaps: Record<string, string>): number => {
          const { boxes, swapOptions } = get()
          const box = boxes.find((b) => b.id === boxId)
          if (!box) return 0

          let total = box.base_price

          Object.entries(swaps).forEach(([componentId, itemId]) => {
            const match = swapOptions.find(
              (so) => so.component_id === componentId && so.item_id === itemId
            )
            if (match) {
              total += match.price_modifier
            }
          })

          return Math.max(0, total)
        },

        getCurrentSelection: (): CustomizedBoxSelection | null => {
          const { activeBoxId, selectedSwaps, quantity, customNotes, getEnrichedBox, getCalculatedPrice } = get()
          if (!activeBoxId) return null

          const enriched = getEnrichedBox(activeBoxId)
          if (!enriched) return null

          const unitPrice = getCalculatedPrice(activeBoxId, selectedSwaps)
          const itemsMap = new Map<string, Item>(get().items.map((i) => [i.id, i]))

          const swapDetails = enriched.components.map((comp) => {
            const selectedItemId = selectedSwaps[comp.id] ?? comp.default_item_id
            const selectedItem = itemsMap.get(selectedItemId)
            const isDefault = selectedItemId === comp.default_item_id

            const swapOpt = comp.swap_options.find((so) => so.item_id === selectedItemId)
            const priceModifier = swapOpt ? swapOpt.price_modifier : 0

            return {
              componentId: comp.id,
              componentName: comp.name,
              componentNameAr: comp.name_ar || comp.name,
              itemId: selectedItemId,
              itemName: selectedItem ? selectedItem.name : 'Custom Selection',
              itemNameAr: selectedItem ? (selectedItem.name_ar || selectedItem.name) : 'اختيار مخصص',
              priceModifier,
              isDefault,
            }
          })

          return {
            boxId: activeBoxId,
            boxName: enriched.name,
            boxNameAr: enriched.name_ar || enriched.name,
            basePrice: enriched.base_price,
            unitPrice,
            selectedSwaps,
            swapDetails,
            totalPrice: unitPrice * quantity,
            quantity,
            customNotes: customNotes.trim() || undefined,
          }
        },

        // ── Synchronized Inventory (Items) Actions ──────────────────────────────
        addItem: handleCreateItem,
        createItem: handleCreateItem,

        updateItem: (itemId, updates) => {
          const synced: Partial<Item> = { ...updates }
          if (updates.name_en !== undefined && updates.name === undefined) synced.name = updates.name_en
          if (updates.name !== undefined && updates.name_en === undefined) synced.name_en = updates.name
          const nextItems = get().items.map((i) => (i.id === itemId ? { ...i, ...synced } : i))
          assertLocalSave('le-matin-box-config-v2', { ...get(), items: nextItems })
          set({ items: nextItems })
        },

        deleteItem: (itemId) => {
          set((state) => {
            const remainingItems = state.items.filter((i) => i.id !== itemId)
            let nextSwapOptions = state.swapOptions.filter((so) => so.item_id !== itemId)
            const nextComponents: BoxComponent[] = []
            const removedCompIds = new Set<string>()
            const nextSelectedSwaps = { ...state.selectedSwaps }

            for (const comp of state.components) {
              if (comp.default_item_id !== itemId) {
                nextComponents.push(comp)
                if (nextSelectedSwaps[comp.id] === itemId) {
                  nextSelectedSwaps[comp.id] = comp.default_item_id
                }
                continue
              }

              const compSwaps = nextSwapOptions.filter((so) => so.component_id === comp.id)
              const preferredSwap = [...compSwaps].sort(
                (a, b) => Math.abs(a.price_modifier) - Math.abs(b.price_modifier)
              )[0]
              const fallbackItemId = preferredSwap?.item_id ?? remainingItems[0]?.id

              if (!fallbackItemId) {
                removedCompIds.add(comp.id)
                delete nextSelectedSwaps[comp.id]
                continue
              }

              nextComponents.push({ ...comp, default_item_id: fallbackItemId })
              if (!nextSwapOptions.some((so) => so.component_id === comp.id && so.item_id === fallbackItemId)) {
                nextSwapOptions.push({
                  id: nextEntityId(`so-${comp.id}`),
                  component_id: comp.id,
                  item_id: fallbackItemId,
                  price_modifier: 0,
                })
              }
              if (nextSelectedSwaps[comp.id] === itemId) {
                nextSelectedSwaps[comp.id] = fallbackItemId
              }
            }

            if (removedCompIds.size > 0) {
              nextSwapOptions = nextSwapOptions.filter((so) => !removedCompIds.has(so.component_id))
            }

            return {
              items: remainingItems,
              components: nextComponents,
              swapOptions: nextSwapOptions,
              selectedSwaps: nextSelectedSwaps,
            }
          })
        },

        updateItemStatus: handleUpdateItemStatus,
        setItemSoldOut: handleUpdateItemStatus,

        toggleItemSoldOut: (itemId: string) => {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, is_sold_out: !i.is_sold_out } : i
            ),
          }))
        },

        // ── Synchronized Box Actions ────────────────────────────────────────────
        addBox: handleCreateBox,
        createBox: handleCreateBox,

        updateBox: (boxId, updates) => {
          const synced: Partial<Box> = { ...updates }
          if (updates.name_en !== undefined && updates.name === undefined) synced.name = updates.name_en
          if (updates.name !== undefined && updates.name_en === undefined) synced.name_en = updates.name
          if (updates.description_en !== undefined && updates.description === undefined) {
            synced.description = updates.description_en
          }
          if (updates.description !== undefined && updates.description_en === undefined) {
            synced.description_en = updates.description
          }
          set((state) => ({
            boxes: state.boxes.map((b) => (b.id === boxId ? { ...b, ...synced } : b)),
          }))
        },

        deleteBox: (boxId) => {
          set((state) => {
            const remainingBoxes = state.boxes.filter((b) => b.id !== boxId)
            const removedCompIds = new Set(
              state.components.filter((c) => c.box_id === boxId).map((c) => c.id)
            )
            return {
              boxes: remainingBoxes,
              components: state.components.filter((c) => c.box_id !== boxId),
              swapOptions: state.swapOptions.filter((so) => !removedCompIds.has(so.component_id)),
              activeBoxId: state.activeBoxId === boxId ? null : state.activeBoxId,
            }
          })
        },

        updateBoxStatus: handleUpdateBoxStatus,
        setBoxSoldOut: handleUpdateBoxStatus,

        toggleBoxSoldOut: (boxId: string) => {
          set((state) => ({
            boxes: state.boxes.map((b) =>
              b.id === boxId ? { ...b, is_sold_out: !b.is_sold_out } : b
            ),
          }))
        },

        // ── Category & Component Actions ────────────────────────────────────────
        addCategory: (name, description, extra) => {
          const cleanName = (extra?.name_en || name).trim()
          const id = nextEntityId(`cat-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'custom'}`)
          const newCat: BoxCategory = {
            id,
            name: cleanName,
            name_en: cleanName,
            name_ar: extra?.name_ar?.trim() || undefined,
            description: description?.trim() || undefined,
            display_order: extra?.display_order ?? get().categories.length + 1,
          }
          set((state) => ({
            categories: [...state.categories, newCat].sort(
              (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
            ),
          }))
          return newCat
        },

        updateCategory: (categoryId, updates) => {
          const synced: Partial<BoxCategory> = { ...updates }
          if (updates.name_en !== undefined && updates.name === undefined) synced.name = updates.name_en
          if (updates.name !== undefined && updates.name_en === undefined) synced.name_en = updates.name
          set((state) => ({
            categories: state.categories
              .map((c) => (c.id === categoryId ? { ...c, ...synced } : c))
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
          }))
        },

        deleteCategory: (categoryId, options) => {
          set((state) => {
            const remaining = state.categories.filter((c) => c.id !== categoryId)
            if (options?.deleteBoxes) {
              const removedBoxIds = new Set(
                state.boxes.filter((b) => b.category_id === categoryId).map((b) => b.id)
              )
              const removedCompIds = new Set(
                state.components.filter((c) => removedBoxIds.has(c.box_id)).map((c) => c.id)
              )
              return {
                categories: remaining,
                boxes: state.boxes.filter((b) => !removedBoxIds.has(b.id)),
                components: state.components.filter((c) => !removedCompIds.has(c.id)),
                swapOptions: state.swapOptions.filter((so) => !removedCompIds.has(so.component_id)),
                activeBoxId: state.activeBoxId && removedBoxIds.has(state.activeBoxId) ? null : state.activeBoxId,
              }
            }
            const fallbackId =
              options?.targetCategoryId !== undefined
                ? options.targetCategoryId
                : (remaining[0]?.id ?? null)
            return {
              categories: remaining,
              boxes: state.boxes.map((b) =>
                b.category_id === categoryId ? { ...b, category_id: fallbackId } : b
              ),
            }
          })
        },

        addComponent: (boxId, name, defaultItemId, isSwappable, initialSwaps = [], extra) => {
          const compId = nextEntityId('comp')
          const enName = (extra?.name_en || name).trim()
          const newComp: BoxComponent = {
            id: compId,
            box_id: boxId,
            name: enName,
            name_en: enName,
            name_ar: extra?.name_ar?.trim() || undefined,
            default_item_id: defaultItemId,
            is_swappable: isSwappable,
            display_order: get().components.filter((c) => c.box_id === boxId).length + 1,
          }

          // Always ensure default item is present in swap options with 0 modifier
          const baseSwaps: SwapOption[] = [
            {
              id: nextEntityId('so-def'),
              component_id: compId,
              item_id: defaultItemId,
              price_modifier: 0,
            },
          ]

          initialSwaps.forEach((is) => {
            if (is.itemId !== defaultItemId) {
              baseSwaps.push({
                id: nextEntityId('so'),
                component_id: compId,
                item_id: is.itemId,
                price_modifier: is.priceModifier,
              })
            }
          })

          set((state) => ({
            components: [...state.components, newComp],
            swapOptions: [...state.swapOptions, ...baseSwaps],
          }))

          return newComp
        },

        updateComponent: (componentId, updates) => {
          const synced: Partial<BoxComponent> = { ...updates }
          if (updates.name_en !== undefined && updates.name === undefined) synced.name = updates.name_en
          if (updates.name !== undefined && updates.name_en === undefined) synced.name_en = updates.name
          set((state) => {
            const nextComponents = state.components.map((c) =>
              c.id === componentId ? { ...c, ...synced } : c
            )
            // If default_item_id changed, ensure it exists in swapOptions for this component
            let nextSwapOptions = state.swapOptions
            if (synced.default_item_id) {
              const hasDefaultSwap = state.swapOptions.some(
                (so) =>
                  so.component_id === componentId && so.item_id === synced.default_item_id
              )
              if (!hasDefaultSwap) {
                nextSwapOptions = [
                  ...state.swapOptions,
                  {
                    id: nextEntityId('so-def'),
                    component_id: componentId,
                    item_id: synced.default_item_id,
                    price_modifier: 0,
                  },
                ]
              }
            }
            return {
              components: nextComponents,
              swapOptions: nextSwapOptions,
            }
          })
        },

        deleteComponent: (componentId) => {
          set((state) => ({
            components: state.components.filter((c) => c.id !== componentId),
            swapOptions: state.swapOptions.filter((so) => so.component_id !== componentId),
          }))
        },

        addSwapOption: (componentId, itemId, priceModifier) => {
          // Prevent duplicate (component_id, item_id) pairs; update modifier if already present
          const existing = get().swapOptions.find(
            (so) => so.component_id === componentId && so.item_id === itemId
          )
          if (existing) {
            set((state) => ({
              swapOptions: state.swapOptions.map((so) =>
                so.id === existing.id ? { ...so, price_modifier: priceModifier } : so
              ),
            }))
            return { ...existing, price_modifier: priceModifier }
          }

          const id = nextEntityId('so')
          const newOption: SwapOption = {
            id,
            component_id: componentId,
            item_id: itemId,
            price_modifier: priceModifier,
          }

          set((state) => ({
            swapOptions: [...state.swapOptions, newOption],
          }))

          return newOption
        },

        updateSwapOption: (swapOptionId, updates) => {
          set((state) => {
            const target = state.swapOptions.find((so) => so.id === swapOptionId)
            if (!target) return state
            if (
              updates.item_id &&
              updates.item_id !== target.item_id &&
              state.swapOptions.some(
                (so) =>
                  so.id !== swapOptionId &&
                  so.component_id === target.component_id &&
                  so.item_id === updates.item_id
              )
            ) {
              return state
            }
            return {
              swapOptions: state.swapOptions.map((so) =>
                so.id === swapOptionId ? { ...so, ...updates } : so
              ),
            }
          })
        },

        updateSwapOptionModifier: (swapOptionId, priceModifier) => {
          set((state) => ({
            swapOptions: state.swapOptions.map((so) =>
              so.id === swapOptionId ? { ...so, price_modifier: priceModifier } : so
            ),
          }))
        },

        removeSwapOption: (swapOptionId) => {
          set((state) => ({
            swapOptions: state.swapOptions.filter((so) => so.id !== swapOptionId),
          }))
        },

        resetToDefaults: () => {
          set({
            categories: INITIAL_CATEGORIES,
            boxes: INITIAL_BOXES,
            components: INITIAL_COMPONENTS,
            items: INITIAL_ITEMS,
            swapOptions: INITIAL_SWAP_OPTIONS,
            activeBoxId: null,
            selectedSwaps: {},
            quantity: 1,
            customNotes: '',
          })
        },
      }
    },
    {
      name: 'le-matin-box-config-v2',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<BoxBuilderStoreState> | undefined
        if (!persisted) return currentState

        const normalizedCategories = Array.isArray(persisted.categories)
          ? persisted.categories
          : currentState.categories

        const normalizedBoxes = Array.isArray(persisted.boxes)
          ? persisted.boxes.map((b) => ({
              ...b,
              category_id: b.category_id ?? null,
              is_sold_out: Boolean(b.is_sold_out),
            }))
          : currentState.boxes

        const normalizedItems = Array.isArray(persisted.items)
          ? persisted.items.map((i) => ({
              ...i,
              is_available: i.is_available ?? true,
              is_sold_out: Boolean(i.is_sold_out),
            }))
          : currentState.items

        return {
          ...currentState,
          ...persisted,
          categories: normalizedCategories,
          boxes: normalizedBoxes,
          items: normalizedItems,
        }
      },
    }
  )
)
