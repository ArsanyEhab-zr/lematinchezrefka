import { useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  SlidersHorizontal,
  Boxes,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  PackagePlus,
  FolderPlus,
  Plus,
  Pencil,
  Trash2,
  Sliders,
} from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useNavigation } from '@/stores/navigation-store'
import type { Item } from '@/types/box-builder'
import { SmartImage } from '@/components/ui/smart-image'
import { Button } from '@/components/ui/button'
import { CategoryModal } from '@/components/admin/CategoryModal'
import { IngredientModal } from '@/components/admin/IngredientModal'

type StockView = 'boxes' | 'ingredients'

const INGREDIENT_CATEGORIES = [
  { id: 'all', label: 'All Ingredients' },
  { id: 'bakery', label: 'Bakery & Breads' },
  { id: 'savory', label: 'Eggs & Savory' },
  { id: 'dairy', label: 'Dairy & Bowls' },
  { id: 'beverage', label: 'Juices & Coffee' },
  { id: 'sweet', label: 'Sweets & Jams' },
  { id: 'fruit', label: 'Fruits' },
  { id: 'extra', label: 'Extras & Flowers' },
]

export const AdminMenuSettings = () => {
  const [activeTab, setActiveTab] = useState<StockView>('boxes')
  const [boxCategoryFilter, setBoxCategoryFilter] = useState<string>('all')
  const [ingredientCategoryFilter, setIngredientCategoryFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Category Management Modal State
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean
    tab: 'create' | 'list'
    editId: string | null
    deleteId: string | null
  }>({ isOpen: false, tab: 'create', editId: null, deleteId: null })

  // Shared Create/Edit Ingredient Modal State
  const [ingredientModalState, setIngredientModalState] = useState<{
    isOpen: boolean
    editingItem: Item | null
  }>({ isOpen: false, editingItem: null })

  // Inline deletion confirmations
  const [confirmDeleteBoxId, setConfirmDeleteBoxId] = useState<string | null>(null)
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null)

  const navigate = useNavigation((state) => state.navigate)
  const openBoxInConfigurator = useNavigation((state) => state.openBoxInConfigurator)

  const {
    categories,
    boxes,
    items,
    components,
    swapOptions,
    updateBoxStatus,
    deleteBox,
    updateItemStatus,
    deleteItem,
  } = useBoxBuilderStore(
    useShallow((state) => ({
      categories: state.categories,
      boxes: state.boxes,
      items: state.items,
      components: state.components,
      swapOptions: state.swapOptions,
      updateBoxStatus: state.updateBoxStatus,
      deleteBox: state.deleteBox,
      updateItemStatus: state.updateItemStatus,
      deleteItem: state.deleteItem,
    }))
  )

  const soldOutBoxesCount = useMemo(() => boxes.filter((b) => b.is_sold_out).length, [boxes])
  const soldOutItemsCount = useMemo(() => items.filter((i) => i.is_sold_out).length, [items])

  const effectiveBoxCategoryFilter =
    boxCategoryFilter === 'all' || categories.some((c) => c.id === boxCategoryFilter)
      ? boxCategoryFilter
      : 'all'

  // Filtered Boxes
  const filteredBoxes = useMemo(() => {
    return boxes.filter((box) => {
      const matchesCategory =
        effectiveBoxCategoryFilter === 'all' || box.category_id === effectiveBoxCategoryFilter
      const q = search.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        box.name.toLowerCase().includes(q) ||
        (box.name_ar && box.name_ar.toLowerCase().includes(q)) ||
        box.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [boxes, effectiveBoxCategoryFilter, search])

  // Filtered Ingredients
  const filteredIngredients = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        ingredientCategoryFilter === 'all' || item.category === ingredientCategoryFilter
      const q = search.trim().toLowerCase()
      const matchesSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        (item.name_ar && item.name_ar.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [items, ingredientCategoryFilter, search])

  // Compute usage count per item across box defaults and swap options
  const itemUsageMap = useMemo(() => {
    const map = new Map<string, { defaults: number; swaps: number }>()
    for (const comp of components) {
      const entry = map.get(comp.default_item_id) ?? { defaults: 0, swaps: 0 }
      entry.defaults += 1
      map.set(comp.default_item_id, entry)
    }
    for (const so of swapOptions) {
      const entry = map.get(so.item_id) ?? { defaults: 0, swaps: 0 }
      entry.swaps += 1
      map.set(so.item_id, entry)
    }
    return map
  }, [components, swapOptions])

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-deep">
            <SlidersHorizontal className="h-4 w-4 text-gold" />
            <span>Kitchen Inventory &amp; Real-Time Synchronized Stock</span>
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-olive">
            Stock &amp; Availability Control
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-olive/75">
            Synced in real time with the Box Configurator and Customer Box Builder. Toggling an ingredient Out of Stock immediately disables its swap option across all boxes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-blush px-3.5 py-1.5 text-xs font-bold text-olive">
            {soldOutBoxesCount} {soldOutBoxesCount === 1 ? 'Box' : 'Boxes'} Sold Out
          </span>
          <span className="rounded-full bg-kraft/30 border border-dashed border-kraft px-3.5 py-1.5 text-xs font-bold text-olive">
            {soldOutItemsCount} {soldOutItemsCount === 1 ? 'Ingredient' : 'Ingredients'} Out of Stock
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCategoryModalState({ isOpen: true, tab: 'list', editId: null, deleteId: null })
            }
            className="rounded-full gap-1.5 border-dashed border-kraft hover:border-gold hover:bg-gold/10"
          >
            <FolderPlus className="h-4 w-4 text-gold" />
            <span>Manage Categories ({categories.length})</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIngredientModalState({ isOpen: true, editingItem: null })}
            className="rounded-full gap-1.5"
          >
            <PackagePlus className="h-4 w-4 text-gold" />
            <span>Add Ingredient ({items.length})</span>
          </Button>
        </div>
      </div>

      {/* ── Section Switcher Tabs (Boxes vs Ingredients) ────── */}
      <div className="flex border-b border-dashed border-kraft/70 gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('boxes')
            setSearch('')
          }}
          className={cn(
            'flex items-center gap-2 border-b-2 pb-3 px-2 text-sm font-bold tracking-wider transition-all',
            activeTab === 'boxes'
              ? 'border-gold text-olive'
              : 'border-transparent text-olive/50 hover:text-olive'
          )}
        >
          <Boxes className="h-4 w-4 text-gold" />
          <span>Boxes Availability ({boxes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ingredients')
            setSearch('')
          }}
          className={cn(
            'flex items-center gap-2 border-b-2 pb-3 px-2 text-sm font-bold tracking-wider transition-all',
            activeTab === 'ingredients'
              ? 'border-gold text-olive'
              : 'border-transparent text-olive/50 hover:text-olive'
          )}
        >
          <Package className="h-4 w-4 text-gold" />
          <span>Internal Ingredients Stock ({items.length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: BOXES AVAILABILITY (Grouped by Category)
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'boxes' && (
        <div className="flex flex-col gap-6">
          {/* Controls: Search & Box Category Pills */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5 overflow-x-auto rounded-full border border-dashed border-kraft bg-cream p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setBoxCategoryFilter('all')}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
                  effectiveBoxCategoryFilter === 'all'
                    ? 'bg-olive text-cream shadow-xs'
                    : 'text-olive/70 hover:bg-blush/40 hover:text-olive'
                )}
              >
                All Categories ({boxes.length})
              </button>

              {categories.map((cat) => {
                const count = boxes.filter((b) => b.category_id === cat.id).length
                const isSelected = effectiveBoxCategoryFilter === cat.id
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      'inline-flex items-center rounded-full transition-all shrink-0',
                      isSelected
                        ? 'bg-olive text-cream shadow-xs pr-1.5'
                        : 'text-olive/75 hover:bg-blush/40 hover:text-olive pr-1'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setBoxCategoryFilter(cat.id)}
                      className="whitespace-nowrap rounded-full pl-3.5 pr-1.5 py-1.5 text-xs font-semibold tracking-wider"
                    >
                      {cat.name} ({count})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryModalState({
                          isOpen: true,
                          tab: 'list',
                          editId: cat.id,
                          deleteId: null,
                        })
                      }
                      aria-label={`Edit category ${cat.name}`}
                      title={`Edit "${cat.name}"`}
                      className={cn(
                        'rounded-full p-1 transition-colors',
                        isSelected
                          ? 'text-cream/80 hover:bg-cream/15 hover:text-cream'
                          : 'text-olive/50 hover:bg-kraft/30 hover:text-olive'
                      )}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryModalState({
                          isOpen: true,
                          tab: 'list',
                          editId: null,
                          deleteId: cat.id,
                        })
                      }
                      aria-label={`Delete category ${cat.name}`}
                      title={`Delete "${cat.name}"`}
                      className={cn(
                        'rounded-full p-1 transition-colors',
                        isSelected
                          ? 'text-red-200 hover:bg-red-500/30 hover:text-white'
                          : 'text-red-500/70 hover:bg-red-100 hover:text-red-700'
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() =>
                  setCategoryModalState({ isOpen: true, tab: 'create', editId: null, deleteId: null })
                }
                className="flex items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-gold/70 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-gold-deep transition-all hover:border-gold hover:bg-gold/15 hover:text-olive shrink-0"
                title="Add Category"
              >
                <Plus className="h-3.5 w-3.5 text-gold" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search breakfast boxes..."
                className="w-full rounded-full border border-kraft bg-cream pl-9 pr-4 py-2 text-xs text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>

          {/* Boxes Grid */}
          {filteredBoxes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-kraft bg-cream p-10 text-center">
              <Boxes className="mx-auto h-8 w-8 text-gold/70" />
              <p className="mt-2 font-display text-lg font-bold text-olive">
                No boxes match this filter
              </p>
              <p className="mt-1 text-xs text-olive/70">
                Create a new box in the Configurator or clear your current category/search filter.
              </p>
              <Button
                variant="cta"
                size="sm"
                onClick={() => navigate('admin-boxes')}
                className="mt-4 gap-1.5 rounded-full"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Open Box Configurator</span>
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBoxes.map((box) => {
              const category = categories.find((c) => c.id === box.category_id)
              const boxComponentsCount = components.filter((c) => c.box_id === box.id).length
              const isSoldOut = box.is_sold_out
              const isConfirmingDelete = confirmDeleteBoxId === box.id

              return (
                <div
                  key={box.id}
                  className={cn(
                    'flex flex-col justify-between rounded-2xl border-2 border-dashed p-5 transition-all',
                    isSoldOut
                      ? 'border-red-300/80 bg-red-50/15 opacity-85'
                      : 'border-kraft bg-cream shadow-sm hover:border-gold'
                  )}
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-dashed border-kraft">
                      <SmartImage
                        photoId={box.image_url}
                        alt={box.name}
                        className={cn(
                          'h-full w-full object-cover transition-all',
                          isSoldOut && 'grayscale-[75%] opacity-60'
                        )}
                      />
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-cream/95 px-2.5 py-0.5 text-xs font-bold text-gold shadow-xs">
                        {formatPrice(box.base_price)}
                      </div>
                      {category && (
                        <div className="absolute top-2.5 left-2.5 rounded-full bg-olive/90 text-cream px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider shadow-xs">
                          {category.name}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className={cn(
                            'font-display text-lg font-bold text-olive',
                            isSoldOut && 'text-olive/60 line-through'
                          )}
                        >
                          {box.name}
                        </h4>
                        {box.name_ar && (
                          <p dir="rtl" className="text-xs font-semibold text-gold-deep">
                            {box.name_ar}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-olive/70 line-clamp-2">
                          {box.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-olive/60 border-t border-dashed border-kraft/60 pt-3">
                      <span>{boxComponentsCount} Components</span>
                      {isSoldOut ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[0.6875rem] font-bold text-red-700">
                          <Lock className="h-3 w-3" />
                          <span>Sold Out Today</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[0.6875rem] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Available on Menu</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 flex flex-col gap-2 border-t border-dashed border-kraft/60 pt-3">
                    <Button
                      variant={isSoldOut ? 'cta' : 'outline'}
                      size="sm"
                      onClick={() => updateBoxStatus(box.id, !isSoldOut)}
                      className={cn(
                        'w-full justify-center gap-2 rounded-full',
                        !isSoldOut && 'text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800'
                      )}
                    >
                      {isSoldOut ? (
                        <>
                          <Unlock className="h-3.5 w-3.5" />
                          <span>Mark as In Stock (Available)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Mark as Sold Out</span>
                        </>
                      )}
                    </Button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs">
                        <span className="font-semibold text-red-800">Delete this box?</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteBoxId(null)}
                            className="rounded-lg border border-kraft bg-cream px-2 py-1 font-semibold text-olive"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteBox(box.id)
                              setConfirmDeleteBoxId(null)
                            }}
                            className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-700"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBoxInConfigurator(box.id)}
                          className="flex-1 justify-center gap-1.5 rounded-full text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5 text-gold" />
                          <span>Edit in Configurator</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteBoxId(box.id)}
                          aria-label={`Delete box ${box.name}`}
                          className="rounded-full border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: INTERNAL INGREDIENTS STOCK (Granular Swaps Lock)
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'ingredients' && (
        <div className="flex flex-col gap-6">
          {/* Informational Callout */}
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-kraft bg-blush/30 p-4 text-xs text-olive">
            <AlertCircle className="h-5 w-5 shrink-0 text-gold-deep mt-0.5" />
            <div>
              <strong className="font-semibold block text-sm">
                Global Internal Ingredients Inventory (Single Source of Truth)
              </strong>
              <p className="mt-0.5 text-olive/80 leading-relaxed">
                Ingredients are shared across all boxes. When you mark an ingredient as <strong>Out of Stock</strong> here, it immediately shows an "Out of Stock" badge inside the <strong>Box Configurator</strong> and locks the radio option inside the customer <strong>Box Builder</strong>.
              </p>
            </div>
          </div>

          {/* Controls: Search & Ingredient Category Pills */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5 overflow-x-auto rounded-full border border-dashed border-kraft bg-cream p-1.5 shadow-xs">
              {INGREDIENT_CATEGORIES.map((cat) => {
                const count =
                  cat.id === 'all'
                    ? items.length
                    : items.filter((i) => i.category === cat.id).length
                const isSelected = ingredientCategoryFilter === cat.id

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIngredientCategoryFilter(cat.id)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
                      isSelected
                        ? 'bg-olive text-cream shadow-xs'
                        : 'text-olive/70 hover:bg-blush/40 hover:text-olive'
                    )}
                  >
                    {cat.label} ({count})
                  </button>
                )
              })}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full rounded-full border border-kraft bg-cream pl-9 pr-4 py-2 text-xs text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>

          {/* Ingredients Table / List */}
          <div className="overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream shadow-xs">
            <div className="divide-y divide-dashed divide-kraft/60">
              {filteredIngredients.map((item) => {
                const isSoldOut = item.is_sold_out
                const usage = itemUsageMap.get(item.id) ?? { defaults: 0, swaps: 0 }
                const isConfirmingDelete = confirmDeleteItemId === item.id

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex flex-col gap-3 p-4 transition-colors',
                      isSoldOut ? 'bg-red-50/35' : 'hover:bg-blush/10'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-dashed border-kraft bg-cream">
                            <SmartImage
                              photoId={item.image_url}
                              alt={item.name}
                              className="h-full w-full"
                              imgClassName="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={cn(
                                'text-sm font-bold',
                                isSoldOut ? 'text-olive/50 line-through' : 'text-olive'
                              )}
                            >
                              {item.name}
                            </h4>
                            {item.name_ar && (
                              <span dir="rtl" className="text-xs font-semibold text-gold-deep">
                                ({item.name_ar})
                              </span>
                            )}
                            <span className="rounded-full bg-cream border border-dashed border-kraft px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-gold-deep">
                              {item.category}
                            </span>
                            {(usage.swaps > 0 || usage.defaults > 0) && (
                              <span className="rounded-full bg-blush/40 px-2 py-0.5 text-[0.625rem] font-semibold text-olive/70">
                                {usage.defaults > 0 ? `${usage.defaults} default · ` : ''}
                                {usage.swaps} {usage.swaps === 1 ? 'swap' : 'swaps'}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-olive/60">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        {isSoldOut ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Out of Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>In Stock</span>
                          </span>
                        )}

                        <Button
                          variant={isSoldOut ? 'cta' : 'outline'}
                          size="sm"
                          onClick={() => updateItemStatus(item.id, !isSoldOut)}
                          className={cn(
                            'rounded-full text-xs',
                            !isSoldOut &&
                              'text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800'
                          )}
                        >
                          {isSoldOut ? 'Mark In Stock' : 'Mark Out of Stock'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIngredientModalState({ isOpen: true, editingItem: item })}
                          aria-label={`Edit ingredient ${item.name}`}
                          className="rounded-full gap-1 text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5 text-gold" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteItemId(item.id)}
                          aria-label={`Delete ingredient ${item.name}`}
                          className="rounded-full border-red-200 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isConfirmingDelete && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs">
                        <span className="text-red-900">
                          <strong>Delete "{item.name}"?</strong>
                          {usage.defaults > 0 || usage.swaps > 0
                            ? ` Safely removes ${usage.swaps} swap option(s) and automatically reassigns ${usage.defaults} default component slot(s) to another available ingredient.`
                            : ' This removes it from the global inventory.'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteItemId(null)}
                            className="rounded-lg border border-kraft bg-cream px-2.5 py-1 font-semibold text-olive"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteItem(item.id)
                              setConfirmDeleteItemId(null)
                            }}
                            className="rounded-lg bg-red-600 px-3 py-1 font-bold text-white hover:bg-red-700"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Create or Edit Internal Ingredient ─────────── */}
      <IngredientModal
        isOpen={ingredientModalState.isOpen}
        editingItem={ingredientModalState.editingItem}
        onClose={() => setIngredientModalState({ isOpen: false, editingItem: null })}
      />

      {/* ── Modal: Manage Categories ────────────────────────── */}
      <CategoryModal
        isOpen={categoryModalState.isOpen}
        initialTab={categoryModalState.tab}
        initialEditId={categoryModalState.editId}
        initialDeleteId={categoryModalState.deleteId}
        onClose={() =>
          setCategoryModalState({ isOpen: false, tab: 'create', editId: null, deleteId: null })
        }
        onCategoryCreated={(newCat) => {
          setBoxCategoryFilter(newCat.id)
        }}
      />
    </div>
  )
}

export const MenuAvailability = AdminMenuSettings
