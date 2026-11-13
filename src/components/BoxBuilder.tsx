import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { useTranslation, localizeBox, localizeComponentName, localizeItem } from '@/data/translations'
import { useState, useId, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  X,
  RefreshCw,
  Sparkles,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  Lock,
  Heart,
  ArrowRight,
} from 'lucide-react'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useNavigation } from '@/stores/navigation-store'
import { SmartImage } from '@/components/ui/smart-image'
import { Button } from '@/components/ui/button'
import { formatPrice, formatPriceModifier, cn } from '@/lib/utils'

export const BoxBuilder = () => {
  const { t, lang } = useTranslation()
  const settings = useSiteSettingsStore(useShallow(state => ({ ...state })))
  const {
    activeBoxId,
    closeBuilder,
    selectedSwaps,
    selectSwap,
    quantity,
    setQuantity,
    customNotes,
    setCustomNotes,
    resetSelection,
    getEnrichedBox,
    getCalculatedPrice,
    getCurrentSelection,
    boxes,
    components,
    items,
    swapOptions,
  } = useBoxBuilderStore(
    useShallow((state) => ({
      activeBoxId: state.activeBoxId,
      closeBuilder: state.closeBuilder,
      selectedSwaps: state.selectedSwaps,
      selectSwap: state.selectSwap,
      quantity: state.quantity,
      setQuantity: state.setQuantity,
      customNotes: state.customNotes,
      setCustomNotes: state.setCustomNotes,
      resetSelection: state.resetSelection,
      getEnrichedBox: state.getEnrichedBox,
      getCalculatedPrice: state.getCalculatedPrice,
      getCurrentSelection: state.getCurrentSelection,
      boxes: state.boxes,
      components: state.components,
      items: state.items,
      swapOptions: state.swapOptions,
    }))
  )

  const addCustomizedBox = useCustomerStore((state) => state.addCustomizedBox)
  const navigateToSection = useNavigation((state) => state.navigateToSection)

  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false)
  const [activeExpandedComponent, setActiveExpandedComponent] = useState<string | null>(null)
  const noteId = useId()

  const box = useMemo(() => {
    if (!activeBoxId) return null
    return getEnrichedBox(activeBoxId)
  }, [activeBoxId, getEnrichedBox, boxes, components, items, swapOptions])

  const unitPrice = useMemo(() => {
    if (!activeBoxId) return 0
    return getCalculatedPrice(activeBoxId, selectedSwaps)
  }, [activeBoxId, selectedSwaps, getCalculatedPrice, boxes, components, items, swapOptions])

  const totalPrice = unitPrice * quantity
  const priceDifference = box ? unitPrice - box.base_price : 0

  if (!activeBoxId || !box) return null

  const handleAddAndCheckout = () => {
    if (!useSiteSettingsStore.getState().isAcceptingOrders || box.is_sold_out) return
    const currentSelection = getCurrentSelection()
    if (!currentSelection) return

    addCustomizedBox(currentSelection)
    closeBuilder()
    navigateToSection('contact', 'checkout-form')
  }

  const handleAddBox = () => {
    if (!useSiteSettingsStore.getState().isAcceptingOrders || box.is_sold_out) return
    const currentSelection = getCurrentSelection()
    if (!currentSelection) return

    addCustomizedBox(currentSelection)
    setIsSuccessAnimated(true)

    setTimeout(() => {
      setIsSuccessAnimated(false)
      closeBuilder()
    }, 650)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="box-builder-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-olive/80 p-3 sm:p-6 backdrop-blur-sm"
      onClick={closeBuilder}
    >
      <div
        className="relative my-8 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-dashed border-kraft bg-cream shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Scallop / Ribbon ────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-dashed border-kraft bg-blush/35 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-gold shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-gold-deep">
              {t.builder.badge}</span>
          </div>

          <button
            type="button"
            onClick={closeBuilder}
            className="grid h-9 w-9 place-items-center rounded-full border border-kraft bg-cream text-olive transition-transform hover:scale-105 active:scale-95"
            aria-label={lang === 'ar' ? 'إغلاق تخصيص البوكس' : 'Close box builder'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Main Modal Body ──────────────────────────────────────────────── */}
        {!settings.isAcceptingOrders && <p role="status" className="bg-blush p-4 text-sm">{lang === 'ar' ? settings.busyModeMessageAr : settings.busyModeMessageEn}</p>}
        <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10 max-h-[75vh] overflow-y-auto">
          {/* Box Profile Banner */}
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-1.5 shadow-md">
                <SmartImage
                  photoId={box.image_url}
                  alt={localizeBox(box, lang).name}
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col sm:col-span-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="box-builder-title" className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-olive">
                  {localizeBox(box, lang).name}
                </h2>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-olive/60 font-medium">{t.builder.basePrice}</span>
                  <span className="tabular font-sans text-lg font-bold text-gold">
                    {formatPrice(box.base_price)}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-olive/80">
                {localizeBox(box, lang).description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-olive/70">
                <span className="inline-flex items-center gap-1 rounded-full bg-blush/60 px-3 py-1 font-semibold text-olive">
                  <RefreshCw className="h-3 w-3 text-gold" />
                  <span>{t.builder.interactiveSwaps}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-kraft px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                  <span>{t.builder.artisanIngredients}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section Heading with Reset Button */}
          <div className="flex items-center justify-between border-t border-dashed border-kraft/70 pt-6">
            <div>
              <h3 className="font-display text-xl font-bold text-olive">
                {t.builder.componentsHeading}</h3>
              <p className="text-xs text-olive/70">
                {t.builder.componentsSub}</p>
            </div>

            <button
              type="button"
              onClick={resetSelection}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-kraft px-3 py-1.5 text-xs font-semibold text-olive/75 hover:bg-blush/40 hover:text-olive transition-colors"
              title={t.builder.resetDefaults}
            >
              <RotateCcw className="h-3 w-3 text-gold" />
              <span>{t.builder.resetDefaults}</span>
            </button>
          </div>

          {/* Components List */}
          <div className="flex flex-col gap-4">
            {box.components.map((component, compIndex) => {
              const selectedItemId = selectedSwaps[component.id] ?? component.default_item_id
              const isDefaultSelected = selectedItemId === component.default_item_id
              const currentSwapOpt = component.swap_options.find((so) => so.item_id === selectedItemId)
              const activeItem = currentSwapOpt?.item ?? component.default_item
              const activeModifier = currentSwapOpt?.price_modifier ?? 0
              const isSwappable = component.is_swappable && component.swap_options.length > 1
              const isExpanded = activeExpandedComponent === component.id

              return (
                <div
                  key={component.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border-2 transition-all',
                    isSwappable
                      ? 'border-dashed border-kraft bg-cream hover:border-gold'
                      : 'border-dashed border-kraft/50 bg-cream/60'
                  )}
                >
                  {/* Summary Bar */}
                  <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush font-display text-xs font-bold text-olive">
                        {compIndex + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-olive/60">
                            {localizeComponentName(component, lang)}
                          </span>
                          {!isSwappable ? (
                            <span className="inline-flex items-center gap-1 text-[0.6875rem] text-olive/50">
                              <Lock className="h-2.5 w-2.5" />
                              <span>{t.builder.signatureFixed}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blush/50 px-2 py-0.5 text-[0.6875rem] font-bold text-gold-deep">
                              <RefreshCw className="h-2.5 w-2.5" />
                              <span>{t.builder.swappableCount.replace('{count}', String(component.swap_options.length))}</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <p className="font-display text-base font-bold text-olive">
                            {localizeItem(activeItem, lang).name}
                          </p>
                          {!isDefaultSelected && (
                            <span className="rounded-full bg-blush px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-olive">
                              {t.builder.customizedBadge}</span>
                          )}
                          {activeModifier > 0 && (
                            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold-deep">
                              {formatPriceModifier(activeModifier)}
                            </span>
                          )}
                          {activeModifier < 0 && (
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              {formatPriceModifier(activeModifier)}
                            </span>
                          )}
                        </div>
                        {activeItem.description && (
                          <p className="mt-0.5 text-xs text-olive/70">
                            {localizeItem(activeItem, lang).description}
                          </p>
                        )}
                        {activeItem.is_sold_out && (
                          <p className="mt-1 inline-flex items-center gap-1 text-[0.6875rem] font-bold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                            <span>{t.builder.outOfStockNotice}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Swap Trigger Action */}
                    {isSwappable && (
                      <div className="sm:self-center">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveExpandedComponent(isExpanded ? null : component.id)
                          }
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-all',
                            isExpanded
                              ? 'bg-gold text-white shadow-xs'
                              : 'border border-dashed border-kraft bg-cream text-olive hover:bg-blush/40 hover:text-gold-deep'
                          )}
                        >
                          <RefreshCw className={cn('h-3.5 w-3.5', isExpanded && 'rotate-180 transition-transform')} />
                          <span>{isExpanded ? t.builder.doneChoosing : t.builder.customizeSwap}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Swappable Options Drawer */}
                  {isSwappable && isExpanded && (
                    <div className="border-t border-dashed border-kraft/80 bg-blush/15 p-4 sm:p-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-olive/70">
                        {t.builder.selectAlternativeFor} {localizeComponentName(component, lang)}:
                      </p>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {component.swap_options.map((option) => {
                          const isSelected = selectedItemId === option.item_id
                          const isOptionDefault = option.item_id === component.default_item_id
                          const isItemSoldOut = option.item.is_sold_out

                          return (
                            <label
                              key={option.id}
                              className={cn(
                                'flex items-start justify-between gap-3 rounded-xl border p-3.5 transition-all',
                                isItemSoldOut
                                  ? 'cursor-not-allowed opacity-50 bg-kraft/15 border-dashed border-kraft/50'
                                  : isSelected
                                    ? 'cursor-pointer border-gold bg-cream shadow-sm ring-2 ring-gold/20'
                                    : 'cursor-pointer border-kraft/70 bg-cream/70 hover:border-gold/60 hover:bg-cream'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name={`comp-${component.id}`}
                                  checked={isSelected}
                                  disabled={isItemSoldOut}
                                  onChange={() => {
                                    if (!isItemSoldOut) {
                                      selectSwap(component.id, option.item_id)
                                    }
                                  }}
                                  className={cn(
                                    'mt-0.5 h-4 w-4 border-kraft text-gold focus:ring-gold',
                                    isItemSoldOut && 'cursor-not-allowed opacity-40'
                                  )}
                                />
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={cn('font-display text-sm font-bold', isItemSoldOut ? 'text-olive/50 line-through' : 'text-olive')}>
                                      {localizeItem(option.item, lang).name}
                                    </span>
                                    {isOptionDefault && (
                                      <span className="text-[0.625rem] font-bold uppercase tracking-wider text-olive/50">
                                        {t.builder.standardLabel}</span>
                                    )}
                                    {isItemSoldOut && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[0.625rem] font-bold text-red-700">
                                        {t.builder.outOfStockBadge}</span>
                                    )}
                                  </div>
                                  {option.item.description && (
                                    <p className="mt-1 text-xs text-olive/70 leading-snug">
                                      {localizeItem(option.item, lang).description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                {isItemSoldOut ? (
                                  <span className="text-[0.6875rem] font-medium text-red-600">
                                    {t.builder.unavailableLabel}</span>
                                ) : option.price_modifier === 0 ? (
                                  <span className="rounded-full bg-cream border border-dashed border-kraft px-2 py-0.5 text-[0.6875rem] font-medium text-olive/70">
                                    {t.builder.includedLabel}</span>
                                ) : option.price_modifier > 0 ? (
                                  <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-gold-deep">
                                    {formatPriceModifier(option.price_modifier)}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                    {formatPriceModifier(option.price_modifier)}
                                  </span>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Optional Special Requests or Card Text */}
          <div className="rounded-2xl border border-dashed border-kraft bg-cream p-4 sm:p-5">
            <label htmlFor={noteId} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-olive">
              <Heart className="h-3.5 w-3.5 text-gold fill-gold/20" />
              <span>{t.builder.specialNotesLabel}</span>
            </label>
            <textarea
              id={noteId}
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={t.builder.specialNotesPlaceholder}
              className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3 text-xs sm:text-sm text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
        </div>

        {/* ── Bottom Sticky Bar: Live Calculated Price & Action ─────────────── */}
        <div className="border-t-2 border-dashed border-kraft bg-cream p-6 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Live Pricing Breakdown */}
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center rounded-full border border-kraft bg-cream p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="grid h-8 w-8 place-items-center rounded-full text-olive hover:bg-blush disabled:opacity-30 transition-colors"
                  aria-label={lang === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center tabular font-sans text-sm font-bold text-olive">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gold text-white hover:bg-gold-deep transition-colors"
                  aria-label={lang === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Total Price with Live Update Animation */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-olive/60">
                    {t.builder.totalLabel}</span>
                  <span
                    key={totalPrice}
                    className="tabular font-display text-2xl sm:text-3xl font-extrabold text-gold transition-all duration-300 transform scale-100 animate-rise"
                  >
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                {priceDifference !== 0 && (
                  <p
                    className={cn(
                      'text-[0.6875rem] font-bold',
                      priceDifference > 0 ? 'text-gold-deep' : 'text-emerald-800'
                    )}
                  >
                    {priceDifference > 0
                      ? t.builder.includesUpgrades.replace('{mod}', formatPriceModifier(priceDifference))
                      : t.builder.includesDiscount.replace('{mod}', formatPriceModifier(priceDifference))}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                disabled={!settings.isAcceptingOrders || box.is_sold_out}
                onClick={handleAddBox}
                className={cn(
                  'rounded-full flex-1 sm:flex-initial justify-center gap-1.5 text-xs',
                  isSuccessAnimated && 'border-olive bg-olive text-cream hover:bg-olive hover:text-cream'
                )}
              >
                {isSuccessAnimated ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>{t.builder.addedBtn}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.builder.addAndBrowseBtn}</span>
                  </>
                )}
              </Button>

              <Button
                variant="cta"
                size="md"
                disabled={!settings.isAcceptingOrders || box.is_sold_out}
                onClick={handleAddAndCheckout}
                className="rounded-full w-full sm:w-auto flex-1 sm:flex-initial justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>{t.builder.addAndCheckoutBtn}</span>
                <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
