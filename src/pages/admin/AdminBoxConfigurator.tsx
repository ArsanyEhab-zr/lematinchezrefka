import { MediaPicker } from '@/components/admin/MediaPicker'
import { isImageSource, assertLocalSave } from '@/lib/media'
import { unsplashSrc } from '@/lib/images'
import { useEffect, useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  Boxes,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  Sliders,
  PackagePlus,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useNavigation } from '@/stores/navigation-store'
import type { Box, Item } from '@/types/box-builder'
import { formatPrice, cn } from '@/lib/utils'
import { SmartImage } from '@/components/ui/smart-image'
import { Button } from '@/components/ui/button'
import { CategoryModal } from '@/components/admin/CategoryModal'
import { IngredientModal } from '@/components/admin/IngredientModal'

export const AdminBoxConfigurator = () => {
  const configuratorBoxId = useNavigation((state) => state.configuratorBoxId)
  const clearConfiguratorBoxId = useNavigation((state) => state.clearConfiguratorBoxId)

  const {
    categories,
    boxes,
    items,
    components,
    swapOptions,
    getEnrichedBox,
    addBox,
    updateBox,
    updateBoxStatus,
    deleteBox,
    addComponent,
    updateComponent,
    deleteComponent,
    addSwapOption,
    updateSwapOption,
    updateSwapOptionModifier,
    removeSwapOption,
    updateItemStatus,
    deleteItem,
    openCustomerBuilder,
  } = useBoxBuilderStore(
    useShallow((state) => ({
      categories: state.categories,
      boxes: state.boxes,
      items: state.items,
      components: state.components,
      swapOptions: state.swapOptions,
      getEnrichedBox: state.getEnrichedBox,
      addBox: state.addBox,
      updateBox: state.updateBox,
      updateBoxStatus: state.updateBoxStatus,
      deleteBox: state.deleteBox,
      addComponent: state.addComponent,
      updateComponent: state.updateComponent,
      deleteComponent: state.deleteComponent,
      addSwapOption: state.addSwapOption,
      updateSwapOption: state.updateSwapOption,
      updateSwapOptionModifier: state.updateSwapOptionModifier,
      removeSwapOption: state.removeSwapOption,
      updateItemStatus: state.updateItemStatus,
      deleteItem: state.deleteItem,
      openCustomerBuilder: state.openBuilder,
    }))
  )

  const [selectedBoxId, setSelectedBoxId] = useState<string>(configuratorBoxId || boxes[0]?.id || '')

  useEffect(() => {
    if (configuratorBoxId) {
      setSelectedBoxId(configuratorBoxId)
      clearConfiguratorBoxId()
    }
  }, [configuratorBoxId, clearConfiguratorBoxId])

  // Modals & form state
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean
    tab: 'create' | 'list'
    editId: string | null
    deleteId: string | null
  }>({ isOpen: false, tab: 'create', editId: null, deleteId: null })

  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false)
  const [newCompName, setNewCompName] = useState('')
  const [newCompNameAr, setNewCompNameAr] = useState('')
  const [newCompDefaultItemId, setNewCompDefaultItemId] = useState(items[0]?.id ?? '')
  const [newCompIsSwappable, setNewCompIsSwappable] = useState(true)

  // Inline Component Edit / Delete states
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)
  const [editCompName, setEditCompName] = useState('')
  const [editCompNameAr, setEditCompNameAr] = useState('')
  const [confirmDeleteCompId, setConfirmDeleteCompId] = useState<string | null>(null)
  const [confirmDeleteBoxId, setConfirmDeleteBoxId] = useState<string | null>(null)
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null)

  // Swap Option adding state
  const [activeComponentForSwap, setActiveComponentForSwap] = useState<string | null>(null)
  const [newSwapItemId, setNewSwapItemId] = useState(items[0]?.id ?? '')
  const [newSwapModifier, setNewSwapModifier] = useState<number>(15)

  const effectiveSelectedBoxId = boxes.some((b) => b.id === selectedBoxId) ? selectedBoxId : (boxes[0]?.id ?? '')
  const effectiveCompDefaultItemId = items.some((i) => i.id === newCompDefaultItemId) ? newCompDefaultItemId : (items[0]?.id ?? '')

  // Shared Create / Edit Ingredient Modal State
  const [ingredientModalState, setIngredientModalState] = useState<{
    isOpen: boolean
    editingItem: Item | null
  }>({ isOpen: false, editingItem: null })

  // Unified Create / Edit Box Modal State
  const [boxModalState, setBoxModalState] = useState<{
    isOpen: boolean
    editingBox: Box | null
  }>({ isOpen: false, editingBox: null })
  const [boxFormNameEn, setBoxFormNameEn] = useState('')
  const [boxFormNameAr, setBoxFormNameAr] = useState('')
  const [boxFormDescEn, setBoxFormDescEn] = useState('')
  const [boxFormDescAr, setBoxFormDescAr] = useState('')
  const [boxFormCategoryId, setBoxFormCategoryId] = useState<string>(categories[0]?.id ?? '')
  const [boxFormBasePrice, setBoxFormBasePrice] = useState<number>(180)
  const [boxFormOrder, setBoxFormOrder] = useState<number>(1)
  const [boxFormImage, setBoxFormImage] = useState('1504754524776-8f4f37790ca0')

  const openCreateBoxModal = () => {
    setBoxFormNameEn('')
    setBoxFormNameAr('')
    setBoxFormDescEn('')
    setBoxFormDescAr('')
    setBoxFormCategoryId(categories[0]?.id ?? '')
    setBoxFormBasePrice(180)
    setBoxFormOrder(boxes.length + 1)
    setBoxFormImage('1504754524776-8f4f37790ca0')
    setBoxModalState({ isOpen: true, editingBox: null })
  }

  const openEditBoxModal = (box: Box) => {
    setBoxFormNameEn(box.name_en || box.name)
    setBoxFormNameAr(box.name_ar || '')
    setBoxFormDescEn(box.description_en || box.description)
    setBoxFormDescAr(box.description_ar || '')
    setBoxFormCategoryId(box.category_id ?? '')
    setBoxFormBasePrice(box.base_price)
    setBoxFormOrder(box.display_order ?? 1)
    setBoxFormImage(box.image_url || '1504754524776-8f4f37790ca0')
    setBoxModalState({ isOpen: true, editingBox: box })
  }

  const activeEnrichedBox = useMemo(() => {
    if (!effectiveSelectedBoxId) return null
    return getEnrichedBox(effectiveSelectedBoxId)
  }, [effectiveSelectedBoxId, getEnrichedBox, boxes, items, components, swapOptions, categories])

  const soldOutItemsCount = useMemo(
    () => items.filter((i) => i.is_sold_out).length,
    [items]
  )

  const swapModalComponent = useMemo(
    () => activeEnrichedBox?.components.find((c) => c.id === activeComponentForSwap) ?? null,
    [activeEnrichedBox, activeComponentForSwap]
  )

  const availableSwapItems = useMemo(() => {
    if (!swapModalComponent) return items
    const usedIds = new Set(swapModalComponent.swap_options.map((so) => so.item_id))
    const unused = items.filter((i) => !usedIds.has(i.id))
    return unused.length > 0 ? unused : items
  }, [swapModalComponent, items])

  const effectiveSwapItemId = availableSwapItems.some((i) => i.id === newSwapItemId)
    ? newSwapItemId
    : (availableSwapItems[0]?.id ?? '')

  // Handler: Add Component
  const handleAddComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompName.trim() || !effectiveCompDefaultItemId || !effectiveSelectedBoxId) return

    addComponent(
      effectiveSelectedBoxId,
      newCompName.trim(),
      effectiveCompDefaultItemId,
      newCompIsSwappable,
      [],
      {
        name_en: newCompName.trim(),
        name_ar: newCompNameAr.trim() || undefined,
      }
    )
    setNewCompName('')
    setNewCompNameAr('')
    setIsAddComponentOpen(false)
  }

  // Handler: Add Swap Option to Component
  const handleAddSwapOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeComponentForSwap || !effectiveSwapItemId) return

    addSwapOption(activeComponentForSwap, effectiveSwapItemId, Number(newSwapModifier) || 0)
    setActiveComponentForSwap(null)
    setNewSwapModifier(15)
  }

  // Handler: Save Box (Create or Edit)
  const handleBoxModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEn = boxFormNameEn.trim()
    const cleanDescEn = boxFormDescEn.trim()
    if (!cleanEn || !cleanDescEn) return

    const cleanCat = boxFormCategoryId.trim() ? boxFormCategoryId : null
    const cleanPrice = Math.max(0, Number(boxFormBasePrice) || 0)
    const cleanOrder = Math.max(0, Number(boxFormOrder) || 1)
    const cleanImg = boxFormImage.trim() || '1504754524776-8f4f37790ca0'

    if (boxModalState.editingBox) {
      updateBox(boxModalState.editingBox.id, {
        name: cleanEn,
        name_en: cleanEn,
        name_ar: boxFormNameAr.trim() || undefined,
        description: cleanDescEn,
        description_en: cleanDescEn,
        description_ar: boxFormDescAr.trim() || undefined,
        category_id: cleanCat,
        base_price: cleanPrice,
        display_order: cleanOrder,
        image_url: cleanImg,
      })
    } else {
      const created = addBox({
        category_id: cleanCat,
        name: cleanEn,
        name_en: cleanEn,
        name_ar: boxFormNameAr.trim() || undefined,
        description: cleanDescEn,
        description_en: cleanDescEn,
        description_ar: boxFormDescAr.trim() || undefined,
        base_price: cleanPrice,
        display_order: cleanOrder,
        image_url: cleanImg,
      })
      setSelectedBoxId(created.id)
    }
    setBoxModalState({ isOpen: false, editingBox: null })
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-deep">
            <Sliders className="h-4 w-4 text-gold" />
            <span>Supabase Schema &amp; Synchronized Box Rules Engine</span>
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-olive">
            Interactive Box Configurator
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-olive/75">
            Configure box components, define default artisan items, and set up live customer swap options synced with global kitchen stock ({items.length} ingredients · {soldOutItemsCount} out of stock).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            <span>Add Item to Inventory ({items.length})</span>
          </Button>

          <Button
            variant="cta"
            size="sm"
            onClick={openCreateBoxModal}
            className="rounded-full gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Box</span>
          </Button>
        </div>
      </div>

      {/* ── Box Selector Tabs (Reflects Live Sold Out Lock Status) ── */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-dashed border-kraft bg-cream p-1.5 shadow-xs">
        {boxes.map((box) => {
          const isSelected = box.id === effectiveSelectedBoxId
          const isBoxSoldOut = box.is_sold_out

          return (
            <button
              key={box.id}
              type="button"
              onClick={() => setSelectedBoxId(box.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold tracking-wider transition-all sm:text-sm',
                isSelected
                  ? 'bg-olive text-cream shadow-xs'
                  : isBoxSoldOut
                    ? 'text-olive/50 bg-kraft/15 hover:bg-blush/30'
                    : 'text-olive/70 hover:bg-blush/40 hover:text-olive'
              )}
            >
              {isBoxSoldOut ? (
                <Lock className={cn('h-3.5 w-3.5', isSelected ? 'text-red-300' : 'text-red-600')} />
              ) : (
                <Boxes className="h-3.5 w-3.5 text-gold" />
              )}
              <span className={cn(isBoxSoldOut && !isSelected && 'line-through')}>
                {box.name}
              </span>
              {isBoxSoldOut && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider',
                    isSelected
                      ? 'bg-red-500/30 text-red-100'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  )}
                >
                  Sold Out
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Active Box Detail & Components ────────────────────── */}
      {activeEnrichedBox ? (
        <div className="flex flex-col gap-8">
          <MediaPicker label="Breakfast box image" value={isImageSource(activeEnrichedBox.image_url) ? activeEnrichedBox.image_url : unsplashSrc(activeEnrichedBox.image_url, 1200)} allowEmpty={false} onChange={image_url => {
            const current = useBoxBuilderStore.getState()
            assertLocalSave('le-matin-box-config-v2', { ...current, boxes: current.boxes.map(box => box.id === activeEnrichedBox.id ? { ...box, image_url } : box) })
            updateBox(activeEnrichedBox.id, { image_url })
          }} />
          {/* Box Banner Card */}
          <div
            className={cn(
              'rustic-card p-6 sm:p-8 transition-all',
              activeEnrichedBox.is_sold_out && 'border-red-300/80 bg-red-50/15'
            )}
          >
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-kraft">
                  <SmartImage
                    photoId={activeEnrichedBox.image_url}
                    alt={activeEnrichedBox.name}
                    className={cn(
                      'h-full w-full object-cover transition-all',
                      activeEnrichedBox.is_sold_out && 'grayscale-[70%] opacity-65'
                    )}
                  />
                  {activeEnrichedBox.is_sold_out && (
                    <div className="absolute inset-0 flex items-center justify-center bg-olive/40 backdrop-blur-[1px]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Sold Out</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 md:col-span-9">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3
                          className={cn(
                            'font-display text-2xl font-bold text-olive',
                            activeEnrichedBox.is_sold_out && 'text-olive/60 line-through'
                          )}
                        >
                          {activeEnrichedBox.name}
                        </h3>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditBoxModal(activeEnrichedBox)}
                          className="rounded-full gap-1.5 px-3 py-1 text-xs"
                        >
                          <Pencil className="h-3 w-3 text-gold" />
                          <span>Edit Box Details</span>
                        </Button>

                        {/* Live Box Availability Badge */}
                        {activeEnrichedBox.is_sold_out ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Locked (Sold Out on Menu)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Active &amp; In Stock</span>
                          </span>
                        )}
                      </div>

                      {activeEnrichedBox.name_ar && (
                        <p dir="rtl" className="mt-1 text-sm font-semibold text-gold-deep">
                          {activeEnrichedBox.name_ar}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-olive/60 font-semibold">Category:</span>
                          <select
                            value={activeEnrichedBox.category_id ?? ''}
                            onChange={(e) =>
                              updateBox(activeEnrichedBox.id, {
                                category_id: e.target.value || null,
                              })
                            }
                            className="rounded-full border border-dashed border-kraft bg-cream px-3 py-1 text-xs font-bold text-olive focus:border-gold focus:outline-none cursor-pointer"
                          >
                            <option value="">Uncategorized</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryModalState({
                                isOpen: true,
                                tab: 'create',
                                editId: null,
                                deleteId: null,
                              })
                            }
                            className="flex items-center gap-1 text-[0.6875rem] font-bold text-gold-deep hover:text-gold hover:underline"
                            title="Manage or Add Categories"
                          >
                            <Plus className="h-3 w-3" /> New
                          </button>
                        </div>

                        {/* Quick Synchronized Stock Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            updateBoxStatus(activeEnrichedBox.id, !activeEnrichedBox.is_sold_out)
                          }
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                            activeEnrichedBox.is_sold_out
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-red-200 bg-red-50/60 text-red-700 hover:bg-red-100'
                          )}
                        >
                          {activeEnrichedBox.is_sold_out ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Unlock Box (Mark In Stock)</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Mark Box Sold Out</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-olive/60">Base Price:</span>
                      <span className="tabular font-display text-xl font-bold text-gold">
                        {formatPrice(activeEnrichedBox.base_price)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm text-olive/75 leading-relaxed">
                    {activeEnrichedBox.description}
                  </p>
                  {activeEnrichedBox.description_ar && (
                    <p dir="rtl" className="mt-1 text-xs text-olive/65 leading-relaxed">
                      {activeEnrichedBox.description_ar}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-kraft/60 pt-4">
                  <div className="flex items-center gap-2 text-xs text-olive/70">
                    <span className="font-semibold">
                      {activeEnrichedBox.components.length} Components
                    </span>
                    <span>·</span>
                    <span>
                      {activeEnrichedBox.components.filter((c) => c.is_swappable).length} Swappable
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={activeEnrichedBox.is_sold_out}
                      onClick={() => openCustomerBuilder(activeEnrichedBox.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border border-dashed px-3.5 py-1.5 text-xs font-semibold transition-colors',
                        activeEnrichedBox.is_sold_out
                          ? 'cursor-not-allowed border-kraft/50 text-olive/40'
                          : 'border-gold text-gold-deep hover:bg-gold hover:text-white'
                      )}
                      title={
                        activeEnrichedBox.is_sold_out
                          ? 'Unlock this box first to preview in customer builder'
                          : 'Preview how customer experiences this box'
                      }
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview in Box Builder</span>
                    </button>

                    {confirmDeleteBoxId === activeEnrichedBox.id ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs">
                        <span className="font-semibold text-red-900">Delete "{activeEnrichedBox.name}"?</span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteBoxId(null)}
                          className="font-semibold text-olive hover:underline"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextId = boxes.find((b) => b.id !== activeEnrichedBox.id)?.id ?? ''
                            deleteBox(activeEnrichedBox.id)
                            setSelectedBoxId(nextId)
                            setConfirmDeleteBoxId(null)
                          }}
                          className="rounded-full bg-red-600 px-2.5 py-0.5 font-bold text-white hover:bg-red-700"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBoxId(activeEnrichedBox.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete this box"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Box</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Components Header */}
          <div className="flex items-center justify-between border-b border-dashed border-kraft pb-4">
            <div>
              <h4 className="font-display text-xl font-bold text-olive">
                Box Components &amp; Swap Options
              </h4>
              <p className="text-xs text-olive/70">
                Define the content slots, choose the default item, and configure permitted swap choices. Sold-out ingredients from Stock Control are highlighted automatically.
              </p>
            </div>

            <Button
              variant="cta"
              size="sm"
              onClick={() => setIsAddComponentOpen(true)}
              className="rounded-full gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Component</span>
            </Button>
          </div>

          {/* Components List */}
          <div className="flex flex-col gap-6">
            {activeEnrichedBox.components.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-kraft p-12 text-center text-olive/60">
                <AlertCircle className="mx-auto h-8 w-8 text-gold" />
                <h5 className="mt-3 font-display text-base font-bold text-olive">
                  No components in this box yet
                </h5>
                <p className="mt-1 text-xs">
                  Click "Add Component" above to specify items like Croissants, Juices, or Sweets.
                </p>
              </div>
            ) : (
              activeEnrichedBox.components.map((component, index) => {
                const isDefaultSoldOut = component.default_item.is_sold_out

                return (
                  <div
                    key={component.id}
                    className="rounded-2xl border-2 border-dashed border-kraft bg-cream p-5 sm:p-6 shadow-sm transition-all hover:border-gold/80"
                  >
                    {/* Component Header Bar */}
                    <div className="flex flex-col justify-between gap-4 border-b border-dashed border-kraft/60 pb-4 lg:flex-row lg:items-center">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush font-display text-xs font-bold text-olive mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {editingComponentId === component.id ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                value={editCompName}
                                onChange={(e) => setEditCompName(e.target.value)}
                                placeholder="English slot name"
                                className="rounded-lg border border-kraft bg-cream px-2.5 py-1 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                              />
                              <input
                                type="text"
                                dir="rtl"
                                value={editCompNameAr}
                                onChange={(e) => setEditCompNameAr(e.target.value)}
                                placeholder="الاسم بالعربية"
                                className="rounded-lg border border-kraft bg-cream px-2.5 py-1 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!editCompName.trim()) return
                                  updateComponent(component.id, {
                                    name: editCompName.trim(),
                                    name_en: editCompName.trim(),
                                    name_ar: editCompNameAr.trim() || undefined,
                                  })
                                  setEditingComponentId(null)
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-olive px-2.5 py-1 text-xs font-bold text-cream"
                              >
                                <Check className="h-3 w-3" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingComponentId(null)}
                                className="inline-flex items-center gap-1 rounded-lg border border-kraft px-2 py-1 text-xs text-olive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="font-display text-lg font-bold text-olive">
                                {component.name}
                              </h5>
                              {component.name_ar && (
                                <span dir="rtl" className="text-xs font-semibold text-gold-deep">
                                  ({component.name_ar})
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingComponentId(component.id)
                                  setEditCompName(component.name_en || component.name)
                                  setEditCompNameAr(component.name_ar || '')
                                }}
                                aria-label={`Edit component ${component.name}`}
                                title="Edit Component Name (EN / AR)"
                                className="rounded-md p-1 text-olive/50 hover:bg-kraft/30 hover:text-olive transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-olive/70">
                            <span className="font-semibold">Default Standard Item:</span>
                            <select
                              value={component.default_item_id}
                              onChange={(e) =>
                                updateComponent(component.id, { default_item_id: e.target.value })
                              }
                              aria-label={`Default item for ${component.name}`}
                              className="max-w-xs rounded-full border border-dashed border-kraft bg-cream px-3 py-1 text-xs font-bold text-olive focus:border-gold focus:outline-none cursor-pointer"
                            >
                              {items.map((it) => (
                                <option key={it.id} value={it.id}>
                                  {it.name} ({it.category}){it.is_sold_out ? ' [OUT]' : ''}
                                </option>
                              ))}
                            </select>
                            {isDefaultSoldOut && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-red-700">
                                <XCircle className="h-3 w-3" />
                                <span>Out of Stock</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Component Controls */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Allow Swaps Toggle */}
                        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-kraft px-3 py-1.5 text-xs font-semibold text-olive hover:bg-blush/30">
                          <input
                            type="checkbox"
                            checked={component.is_swappable}
                            onChange={(e) =>
                              updateComponent(component.id, { is_swappable: e.target.checked })
                            }
                            className="h-3.5 w-3.5 rounded border-kraft text-gold focus:ring-gold"
                          />
                          <span>Allow Customer Swaps</span>
                        </label>

                        {/* Delete Component */}
                        {confirmDeleteCompId === component.id ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCompId(null)}
                              className="font-semibold text-olive hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteComponent(component.id)
                                setConfirmDeleteCompId(null)
                              }}
                              className="rounded-full bg-red-600 px-2.5 py-0.5 font-bold text-white hover:bg-red-700"
                            >
                              Remove Slot
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCompId(component.id)}
                            className="p-1.5 text-red-500/70 hover:text-red-700 transition-colors"
                            aria-label={`Delete component ${component.name}`}
                            title="Delete component"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Swap Options List */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-olive/60">
                          Alternative Swap Options ({component.swap_options.length})
                        </span>

                        {component.is_swappable && (
                          <button
                            type="button"
                            onClick={() => {
                              const used = new Set(component.swap_options.map((so) => so.item_id))
                              const firstUnused = items.find((i) => !used.has(i.id)) ?? items[0]
                              setActiveComponentForSwap(component.id)
                              setNewSwapItemId(firstUnused?.id ?? '')
                              setNewSwapModifier(15)
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-gold-deep hover:text-olive transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5 text-gold" />
                            <span>Add Alternative Option</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {component.swap_options.map((option) => {
                          const isDefault = option.item_id === component.default_item_id
                          const isItemSoldOut = option.item.is_sold_out
                          const otherUsedItemIds = new Set(
                            component.swap_options
                              .filter((so) => so.id !== option.id)
                              .map((so) => so.item_id)
                          )
                          const selectableSwapItems = items.filter(
                            (it) => it.id === option.item_id || !otherUsedItemIds.has(it.id)
                          )

                          return (
                            <div
                              key={option.id}
                              className={cn(
                                'flex flex-col gap-2 rounded-xl border p-3 text-xs transition-all',
                                isItemSoldOut
                                  ? 'border-dashed border-red-300 bg-red-50/35 opacity-80'
                                  : isDefault
                                    ? 'border-dashed border-gold/60 bg-blush/20'
                                    : 'border-dashed border-kraft/70 bg-cream'
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <select
                                  value={option.item_id}
                                  aria-label={`Swap item for ${option.item.name}`}
                                  onChange={(e) => {
                                    const nextItemId = e.target.value
                                    updateSwapOption(option.id, { item_id: nextItemId })
                                    if (isDefault) {
                                      updateComponent(component.id, { default_item_id: nextItemId })
                                    }
                                  }}
                                  className={cn(
                                    'flex-1 min-w-0 rounded-lg border border-kraft/80 bg-cream px-2 py-1 text-xs font-bold text-olive focus:border-gold focus:outline-none',
                                    isItemSoldOut && 'line-through text-olive/50'
                                  )}
                                >
                                  {selectableSwapItems.map((it) => (
                                    <option key={it.id} value={it.id}>
                                      {it.name}
                                      {it.is_sold_out ? ' [OUT]' : ''}
                                    </option>
                                  ))}
                                </select>

                                {(component.swap_options.length > 1 || !isDefault) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isDefault) {
                                        const sibling = component.swap_options.find((so) => so.id !== option.id)
                                        if (sibling) {
                                          updateComponent(component.id, { default_item_id: sibling.item_id })
                                        }
                                      }
                                      removeSwapOption(option.id)
                                    }}
                                    className="p-1 text-olive/40 hover:text-red-700 shrink-0"
                                    aria-label={`Remove swap option ${option.item.name}`}
                                    title={
                                      isDefault
                                        ? 'Remove option (promotes next option to default)'
                                        : 'Remove swap option'
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[0.625rem] font-semibold text-olive/70 capitalize">
                                    {isDefault ? 'Default Item' : option.item.category}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateItemStatus(option.item_id, !isItemSoldOut)
                                    }
                                    className={cn(
                                      'text-[0.625rem] font-semibold underline transition-colors',
                                      isItemSoldOut
                                        ? 'text-emerald-700 hover:text-emerald-900'
                                        : 'text-olive/50 hover:text-red-700'
                                    )}
                                  >
                                    {isItemSoldOut ? 'Restock' : 'Mark Out'}
                                  </button>
                                  {isItemSoldOut && (
                                    <span className="inline-flex items-center rounded-full bg-red-100 border border-red-200 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase text-red-700">
                                      Out
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className={cn(
                                      'text-xs font-bold',
                                      isItemSoldOut
                                        ? 'text-olive/30'
                                        : option.price_modifier > 0
                                          ? 'text-gold-deep'
                                          : option.price_modifier < 0
                                            ? 'text-emerald-700'
                                            : 'text-olive/40'
                                    )}
                                  >
                                    {option.price_modifier > 0 ? '+' : ''}
                                  </span>
                                  <input
                                    type="number"
                                    value={option.price_modifier}
                                    aria-label={`Price modifier for ${option.item.name}`}
                                    title="Enter positive for upgrade (+), negative for discount (-)"
                                    onChange={(e) =>
                                      updateSwapOptionModifier(
                                        option.id,
                                        Number(e.target.value) || 0
                                      )
                                    }
                                    className={cn(
                                      'w-14 rounded-lg border px-1.5 py-0.5 text-center font-bold focus:border-gold focus:outline-none',
                                      isItemSoldOut
                                        ? 'border-kraft/50 bg-cream/50 text-olive/45'
                                        : option.price_modifier < 0
                                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                          : 'border-kraft bg-cream text-olive'
                                    )}
                                  />
                                  <span className="text-[0.6875rem] text-olive/60">EGP</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-kraft bg-cream p-12 text-center">
          <Boxes className="mx-auto h-10 w-10 text-gold" />
          <h4 className="mt-3 font-display text-xl font-bold text-olive">
            No breakfast boxes yet
          </h4>
          <p className="mt-1 text-xs text-olive/70">
            Create your first box to start assigning components and swap drawers.
          </p>
          <Button
            variant="cta"
            size="sm"
            onClick={openCreateBoxModal}
            className="mt-4 gap-1.5 rounded-full"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Box</span>
          </Button>
        </div>
      )}

      {/* ── Modal: Add Component to Box ───────────────────────── */}
      {isAddComponentOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-olive/80 p-4 backdrop-blur-sm"
          onClick={() => setIsAddComponentOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-display text-xl font-bold text-olive">
              Add Component to "{activeEnrichedBox?.name}"
            </h4>
            <p className="mt-1 text-xs text-olive/70">
              Create a new slot (e.g., "Sweet Treat" or "Morning Beverage") and choose its default inventory item.
            </p>

            <form onSubmit={handleAddComponentSubmit} className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Slot Name (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    placeholder="e.g. Morning Beverage"
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Slot Name (AR / عربي)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={newCompNameAr}
                    onChange={(e) => setNewCompNameAr(e.target.value)}
                    placeholder="مثال: مشروب الصباح"
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                  Default Item (Included in Base Price)
                </label>
                <select
                  value={effectiveCompDefaultItemId}
                  onChange={(e) => setNewCompDefaultItemId(e.target.value)}
                  className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none cursor-pointer"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.category}){it.is_sold_out ? ' — [OUT OF STOCK]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCompIsSwappable}
                  onChange={(e) => setNewCompIsSwappable(e.target.checked)}
                  className="h-4 w-4 rounded border-kraft text-gold focus:ring-gold"
                />
                <span className="text-xs font-semibold text-olive">
                  Enable Swapping (Allow customers to choose alternative items)
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-kraft/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddComponentOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="cta" size="sm" type="submit">
                  Save Component
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add Swap Option to Component ──────────────── */}
      {activeComponentForSwap && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-olive/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveComponentForSwap(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-display text-xl font-bold text-olive">
              Add Alternative Swap Option
            </h4>
            <p className="mt-1 text-xs text-olive/70">
              Choose an alternative item from global inventory and set a price modifier (0 for included, +15 for upgrade, -10 for discount).
            </p>

            <form onSubmit={handleAddSwapOptionSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                  Alternative Item (Global Inventory)
                </label>
                <select
                  value={effectiveSwapItemId}
                  onChange={(e) => setNewSwapItemId(e.target.value)}
                  className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none cursor-pointer"
                >
                  {availableSwapItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} — {it.category}
                      {it.is_sold_out ? ' [OUT OF STOCK]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                  Price Modifier (+/- Amount in EGP)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newSwapModifier}
                    onChange={(e) => setNewSwapModifier(Number(e.target.value) || 0)}
                    placeholder="e.g. +15 for upgrade, -10 for discount"
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-olive/70">EGP</span>
                </div>
                <p className="mt-1 text-[0.6875rem] text-olive/60">
                  Enter 0 for equal swap, positive (e.g. 15) for upgrade surcharge, or negative (e.g. -10) for downgrade discount.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-kraft/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveComponentForSwap(null)}
                >
                  Cancel
                </Button>
                <Button variant="cta" size="sm" type="submit">
                  Add Swap Option
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Collapsible Global Ingredient Inventory & Quick CRUD ── */}
      <details className="rustic-card my-2 p-5">
        <summary className="flex cursor-pointer items-center justify-between font-display text-xl text-olive">
          <span>Global Ingredient Inventory ({items.length})</span>
          <span className="text-xs font-sans font-normal text-olive/60">Click to expand &amp; edit, restock, or delete ingredients</span>
        </summary>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-2 rounded-xl border border-dashed border-kraft bg-cream p-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn('font-bold text-olive truncate', item.is_sold_out && 'line-through text-olive/50')}>
                    {item.name}
                  </p>
                  {item.name_ar && (
                    <p dir="rtl" className="text-[0.6875rem] font-semibold text-gold-deep truncate">
                      {item.name_ar}
                    </p>
                  )}
                  <span className="text-[0.625rem] uppercase text-olive/60">{item.category}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, !item.is_sold_out)}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[0.625rem] font-bold',
                      item.is_sold_out
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    )}
                  >
                    {item.is_sold_out ? 'Restock' : 'Out'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngredientModalState({ isOpen: true, editingItem: item })}
                    aria-label={`Edit ${item.name}`}
                    className="rounded-lg p-1 text-olive/60 hover:bg-kraft/30 hover:text-olive"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteItemId(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="rounded-lg p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {confirmDeleteItemId === item.id && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-[0.6875rem]">
                  <span className="text-red-900 font-semibold">Remove globally?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteItemId(null)}
                      className="font-semibold text-olive"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteItem(item.id)
                        setConfirmDeleteItemId(null)
                      }}
                      className="rounded bg-red-600 px-2 py-0.5 font-bold text-white"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </details>

      {/* ── Modal: Create or Edit Internal Ingredient ─────────── */}
      <IngredientModal
        isOpen={ingredientModalState.isOpen}
        editingItem={ingredientModalState.editingItem}
        onClose={() => setIngredientModalState({ isOpen: false, editingItem: null })}
        onSaved={(savedItem) => {
          setNewCompDefaultItemId(savedItem.id)
          setNewSwapItemId(savedItem.id)
        }}
      />

      {/* ── Modal: Create or Edit Breakfast Box ───────────────── */}
      {boxModalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-olive/80 p-4 backdrop-blur-sm"
          onClick={() => setBoxModalState({ isOpen: false, editingBox: null })}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dashed border-kraft pb-3">
              <div>
                <h4 className="font-display text-xl font-bold text-olive">
                  {boxModalState.editingBox
                    ? `Edit Box Details: ${boxModalState.editingBox.name}`
                    : 'Create New Artisanal Breakfast Box'}
                </h4>
                <p className="mt-0.5 text-xs text-olive/70">
                  Bilingual names, descriptions, base pricing, and cover photo sync directly to Supabase and the storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBoxModalState({ isOpen: false, editingBox: null })}
                className="rounded-full p-1 text-olive/50 hover:bg-kraft/30 hover:text-olive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBoxModalSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Box Name (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={boxFormNameEn}
                    onChange={(e) => setBoxFormNameEn(e.target.value)}
                    placeholder="e.g. Executive Morning Box"
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Box Name (AR / عربي)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={boxFormNameAr}
                    onChange={(e) => setBoxFormNameAr(e.target.value)}
                    placeholder="مثال: بوكس الصباح التنفيذي"
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-olive">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryModalState({
                          isOpen: true,
                          tab: 'create',
                          editId: null,
                          deleteId: null,
                        })
                      }
                      className="flex items-center gap-0.5 text-[0.6875rem] font-bold text-gold-deep hover:underline"
                    >
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <select
                    value={boxFormCategoryId}
                    onChange={(e) => setBoxFormCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Base Price (EGP) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={boxFormBasePrice}
                    onChange={(e) => setBoxFormBasePrice(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={boxFormOrder}
                    onChange={(e) => setBoxFormOrder(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Description (EN) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={boxFormDescEn}
                    onChange={(e) => setBoxFormDescEn(e.target.value)}
                    placeholder="Describe ingredients, morning mood, and serving size..."
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1">
                    Description (AR / عربي)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={boxFormDescAr}
                    onChange={(e) => setBoxFormDescAr(e.target.value)}
                    placeholder="وصف البوكس والمكونات باللغة العربية..."
                    className="w-full rounded-xl border border-kraft bg-cream p-2.5 text-xs text-olive focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <MediaPicker
                label="Breakfast box cover image"
                value={isImageSource(boxFormImage) ? boxFormImage : unsplashSrc(boxFormImage, 1200)}
                onChange={setBoxFormImage}
                folder="le-matin/boxes"
                allowEmpty={false}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-kraft/60">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setBoxModalState({ isOpen: false, editingBox: null })}
                >
                  Cancel
                </Button>
                <Button variant="cta" size="sm" type="submit">
                  {boxModalState.editingBox ? 'Save Box Changes' : 'Create Box'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Manage Box Categories ────────────────────── */}
      <CategoryModal
        isOpen={categoryModalState.isOpen}
        initialTab={categoryModalState.tab}
        initialEditId={categoryModalState.editId}
        initialDeleteId={categoryModalState.deleteId}
        onClose={() =>
          setCategoryModalState({ isOpen: false, tab: 'create', editId: null, deleteId: null })
        }
        onCategoryCreated={(newCat) => {
          setBoxFormCategoryId(newCat.id)
        }}
      />
    </div>
  )
}
