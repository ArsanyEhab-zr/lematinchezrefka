import { validWhatsAppNumber } from '@/components/SocialLinks'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { useTranslation, localizeBox, localizeCategory, localizeComponentName } from '@/data/translations'
import { useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Lock,
  Heart,
  Boxes,
} from 'lucide-react'
import { checkoutTotals } from '@/lib/checkout'
import { formatPrice } from '@/lib/utils'
import { useCustomerStore, selectionTotal } from '@/stores/customer-store'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useNavigation } from '@/stores/navigation-store'
import { SectionHeading, HeartDivider } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/ui/smart-image'
import { cn } from '@/lib/utils'

export const Menu = () => {
  const { t, lang } = useTranslation()
  const settings = useSiteSettingsStore(useShallow(state => ({ ...state })))
  const navigateToSection = useNavigation(state => state.navigateToSection)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  const { customizedBoxes, addCustomizedBox, clearSelection } = useCustomerStore(
    useShallow((state) => ({
      customizedBoxes: state.customizedBoxes,
      addCustomizedBox: state.addCustomizedBox,
      clearSelection: state.clearSelection,
    }))
  )

  const { categories, boxes, components, items, swapOptions, openBuilder, getAllEnrichedBoxes } = useBoxBuilderStore(
    useShallow((state) => ({
      categories: state.categories,
      boxes: state.boxes,
      components: state.components,
      items: state.items,
      swapOptions: state.swapOptions,
      openBuilder: state.openBuilder,
      getAllEnrichedBoxes: state.getAllEnrichedBoxes,
    }))
  )

  // Enriched boxes memoized to prevent infinite re-renders
  const enrichedBoxes = useMemo(() => {
    return getAllEnrichedBoxes()
  }, [categories, boxes, components, items, swapOptions, getAllEnrichedBoxes])

  const quickOrderBox = (box: (typeof enrichedBoxes)[number]) => {
    if (!settings.isAcceptingOrders || box.is_sold_out) return
    const selectedSwaps = Object.fromEntries(
      box.components.map((comp) => [comp.id, comp.default_item_id])
    )
    const swapDetails = box.components.map((comp) => ({
      componentId: comp.id,
      componentName: comp.name,
      componentNameAr: comp.name_ar || comp.name,
      itemId: comp.default_item_id,
      itemName: comp.default_item?.name ?? 'Included Item',
      itemNameAr: comp.default_item?.name_ar || comp.default_item?.name || 'صنف مختار',
      priceModifier: 0,
      isDefault: true,
    }))
    addCustomizedBox({
      boxId: box.id,
      boxName: box.name,
      boxNameAr: box.name_ar || box.name,
      basePrice: box.base_price,
      unitPrice: box.base_price,
      selectedSwaps,
      swapDetails,
      totalPrice: box.base_price,
      quantity: 1,
    })
    navigateToSection('contact', 'checkout-form')
  }

  const effectiveCategoryId =
    selectedCategoryId === 'all' || categories.some((c) => c.id === selectedCategoryId)
      ? selectedCategoryId
      : 'all'

  // Filter boxes strictly by selected category
  const filteredBoxes = useMemo(() => {
    if (effectiveCategoryId === 'all') return enrichedBoxes
    return enrichedBoxes.filter((box) => box.category_id === effectiveCategoryId)
  }, [effectiveCategoryId, enrichedBoxes])

  const totalAmount = useMemo(() => selectionTotal([], customizedBoxes), [customizedBoxes])
  const totalItemsCount = customizedBoxes.reduce((acc, box) => acc + box.quantity, 0)

  const totals = checkoutTotals(totalAmount, false, settings)

  const activeCategoryInfo = categories.find((c) => c.id === effectiveCategoryId)

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <SectionHeading
            eyebrow={t.menu.eyebrow}
            title={t.menu.title}
            script={t.menu.script}
            intro={t.menu.intro}
            className="text-center"
          />
        </div>
      </section>

      {/* ── Category Filter Tabs (Dynamic from box_categories) ── */}
      <section className="sticky top-20 z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start gap-2 overflow-x-auto rounded-full border border-dashed border-kraft bg-cream/95 p-1.5 shadow-md backdrop-blur-md sm:justify-center">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold tracking-wider transition-all sm:text-sm',
              selectedCategoryId === 'all' || effectiveCategoryId === 'all'
                ? 'bg-gold text-white shadow-sm'
                : 'text-olive hover:bg-blush/50 hover:text-gold-deep'
            )}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>{t.menu.allBoxes} ({enrichedBoxes.length})</span>
          </button>

          {categories.map((cat) => {
            const count = enrichedBoxes.filter((b) => b.category_id === cat.id).length
            const isSelected = effectiveCategoryId === cat.id

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  'whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold tracking-wider transition-all sm:text-sm',
                  isSelected
                    ? 'bg-gold text-white shadow-sm'
                    : 'text-olive hover:bg-blush/50 hover:text-gold-deep'
                )}
              >
                <span>{localizeCategory(cat, lang).name}</span>
                <span className="ml-1.5 text-[0.6875rem] opacity-75">({count})</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Active Category Description Blurb */}
      {activeCategoryInfo && localizeCategory(activeCategoryInfo, lang).description && (
        <div className="mx-auto -mt-6 max-w-2xl px-4 text-center">
          <p className="text-xs sm:text-sm text-olive/75 italic">
            "{localizeCategory(activeCategoryInfo, lang).description}"
          </p>
        </div>
      )}

      {/* ── Breakfast Boxes Grid ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {filteredBoxes.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-kraft bg-cream p-12 text-center">
            <Boxes className="mx-auto h-8 w-8 text-gold/60" />
            <h4 className="mt-3 font-display text-lg font-bold text-olive">
              {t.menu.noBoxesTitle}</h4>
            <p className="mt-1 text-xs text-olive/60">
              {t.menu.noBoxesDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBoxes.map((box) => {
              const isSoldOut = box.is_sold_out

              return (
                <article
                  key={box.id}
                  className={cn(
                    'group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300',
                    isSoldOut
                      ? 'border-kraft/60 bg-cream/70 opacity-80'
                      : 'border-kraft bg-cream hover:-translate-y-1 hover:border-gold hover:shadow-xl'
                  )}
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden p-3.5 pb-0">
                      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-dashed border-kraft/70">
                        <SmartImage
                          photoId={box.image_url}
                          alt={localizeBox(box, lang).name}
                          className={cn(
                            'h-full w-full object-cover transition-transform duration-500',
                            isSoldOut
                              ? 'grayscale-[65%] opacity-75'
                              : 'group-hover:scale-105'
                          )}
                        />

                        {/* Category Tag (Top Left) */}
                        {box.category && (
                          <div className="absolute top-3 left-3 rounded-full bg-cream/95 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-olive shadow-xs backdrop-blur-xs">
                            {localizeCategory(box.category, lang).name}
                          </div>
                        )}

                        {/* Price Tag or Sold Out Ribbon (Top Right) */}
                        <div className="absolute top-3 right-3">
                          {isSoldOut ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs font-bold text-cream shadow-xs">
                              <Lock className="h-3 w-3 text-blush" />
                              <span>{t.menu.soldOut}</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-cream/95 px-3 py-1 text-xs font-bold text-gold shadow-xs backdrop-blur-xs">
                              {t.menu.fromPrice} {formatPrice(box.base_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col p-6">
                      <h3 className="font-display text-xl font-bold text-olive group-hover:text-gold-deep transition-colors">
                        {localizeBox(box, lang).name}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-olive/75 leading-relaxed line-clamp-2">
                        {localizeBox(box, lang).description}
                      </p>

                      {/* Components Breakdown */}
                      <div className="mt-5 border-t border-dashed border-kraft/60 pt-4">
                        <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-olive/50 mb-2.5">
                          {t.menu.boxInclusions} ({box.components.length} {t.menu.itemsUnit})</p>
                        <ul className="flex flex-col gap-1.5 text-xs text-olive/85">
                          {box.components.map((comp) => (
                            <li key={comp.id} className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5 truncate">
                                <Heart className="h-3 w-3 shrink-0 fill-gold text-gold" />
                                <span className="truncate">{localizeComponentName(comp, lang)}</span>
                              </span>
                              {comp.is_swappable ? (
                                <span className="shrink-0 text-[0.625rem] font-bold text-gold-deep bg-blush/40 px-2 py-0.5 rounded-full">
                                  {t.menu.swappable}</span>
                              ) : (
                                <span className="shrink-0 text-[0.625rem] text-olive/50">
                                  {t.menu.signature}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-6 pt-0 space-y-2.5">
                    {isSoldOut ? (
                      <button
                        type="button"
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-dashed border-kraft/60 bg-kraft/30 py-3 text-xs font-bold uppercase tracking-wider text-olive/50"
                      >
                        <Lock className="h-4 w-4 text-olive/40" />
                        <span>{t.menu.soldOutToday}</span>
                      </button>
                    ) : (
                      <>
                        <Button
                          variant="cta"
                          size="md"
                          disabled={!settings.isAcceptingOrders || box.is_sold_out}
                          onClick={() => openBuilder(box.id)}
                          className="w-full justify-center gap-2 rounded-full py-3 shadow-sm hover:shadow-md"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>{t.menu.customizeAndOrderBox}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !settings.isAcceptingOrders ||
                            box.is_sold_out ||
                            box.components.some(
                              (comp) => !comp.default_item || !comp.default_item.is_available || comp.default_item.is_sold_out
                            )
                          }
                          onClick={() => quickOrderBox(box)}
                          className="w-full justify-center gap-1.5 rounded-full text-xs"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-gold" />
                          <span>{t.menu.quickOrderNow}</span>
                          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Decorative divider */}
      <div className="mx-auto max-w-3xl px-4">
        <HeartDivider />
      </div>

      {/* ── Ordering Information ────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rustic-card p-6 sm:p-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-deep">
            <Sparkles className="h-4 w-4 text-gold" />
            <span>{t.menu.ritualsEyebrow}</span>
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold text-olive">
            {t.menu.ritualsTitle}</h3>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 text-sm text-olive/80">
            <div>
              <span className="font-display text-lg font-bold text-gold">{t.menu.step1Title}</span>
              <p className="mt-1 text-xs leading-relaxed text-olive/70">
                {t.menu.step1Desc}</p>
            </div>
            <div>
              <span className="font-display text-lg font-bold text-gold">{t.menu.step2Title} · {settings.dailyCutoffTime}</span>
              <p className="mt-1 text-xs leading-relaxed text-olive/70">
                {t.menu.step2Desc}
              </p>
            </div>
            <div>
              <span className="font-display text-lg font-bold text-gold">{t.menu.step3Title}</span>
              <p className="mt-1 text-xs leading-relaxed text-olive/70">
                {t.menu.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Order Summary Bar (shows when tailored boxes are in cart) ── */}
      {totalItemsCount > 0 && (
        <aside
          aria-label={t.menu.yourBreakfastOrder}
          className="fixed bottom-6 left-4 right-4 z-40 mx-auto max-w-4xl transition-all duration-300"
        >
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-gold bg-cream p-4 shadow-2xl sm:flex-row sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive shadow-xs">
                <ShoppingBag className="h-6 w-6 text-gold" />
              </span>
              <div>
                <p className="font-display text-base font-bold text-olive">
                  {t.menu.yourBreakfastOrder} ({totalItemsCount} {totalItemsCount === 1 ? t.menu.boxSingular : t.menu.boxPlural})
                </p>
                <p className="text-xs text-olive/70">
                  <span className="font-semibold text-gold-deep">
                    {customizedBoxes.length} {customizedBoxes.length === 1 ? t.menu.tailoredSingular : t.menu.tailoredPlural}
                  </span>
                  {' '}{t.builder.totalLabel}{' '}
                  <span className="tabular font-bold text-gold text-sm">
                    {formatPrice(totals.total)}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-xs">{t.menu.subtotalLabel} {formatPrice(totalAmount)} · {t.menu.deliveryLabel} {totals.delivery ? formatPrice(totals.delivery) : t.menu.freeDelivery}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-kraft px-3 py-2 text-xs font-semibold text-olive/70 hover:bg-blush/30 hover:text-olive"
                title={t.menu.resetBtn}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.menu.resetBtn}</span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToSection('contact', 'checkout-form')}
                className="rounded-full"
              >
                <span>{t.menu.finalizeForm}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>

              <Button
                variant="cta"
                size="sm"
                onClick={() => navigateToSection('contact', 'checkout-form')}
                disabled={!settings.isAcceptingOrders || totalAmount < settings.minOrderAmount || !validWhatsAppNumber(settings.whatsappNumber)}
                className="rounded-full shadow-md hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.nav.orderWhatsApp}</span>
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
