import { Heart, Plus, Minus, Check } from 'lucide-react'
import type { MenuItem } from '@/data/menu'
import { formatPrice } from '@/lib/utils'
import { SmartImage } from '@/components/ui/smart-image'
import { Tag } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCustomerStore } from '@/stores/customer-store'
import { useKitchenStore } from '@/stores/kitchen-store'

type ProductCardProps = {
  item: MenuItem
}

export const ProductCard = ({ item }: ProductCardProps) => {
  const count = useCustomerStore((state) => state.selection[item.id] ?? 0)
  const addItem = useCustomerStore((state) => state.addItem)
  const removeItem = useCustomerStore((state) => state.removeItem)
  const isSoldOut = useKitchenStore((state) => state.soldOut.includes(item.id))

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden p-3 pb-0">
        <SmartImage
          photoId={item.photoId}
          alt={item.photoAlt}
          className="h-full w-full rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Tag badge (e.g. Bestseller, New, For two) */}
        {item.tag && (
          <div className="absolute left-6 top-6">
            <Tag className="shadow-sm">{item.tag}</Tag>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-3 flex items-center justify-center rounded-2xl bg-olive/70 backdrop-blur-xs">
            <span className="rounded-full bg-cream px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-olive shadow-md">
              Sold Out for Today
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Header: Title + Price */}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-bold tracking-tight text-olive">
            {item.name}
          </h3>
          <span className="tabular font-sans text-lg font-bold text-gold">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Portion / Serves label */}
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold-deep">
          {item.serves}
        </p>

        {/* Blurb */}
        <p className="mt-3 text-sm leading-relaxed text-olive/80">
          {item.description}
        </p>

        {/* Ingredients list with Gold Heart icons */}
        <div className="mt-4 border-t border-dashed border-kraft/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60">
            Ingredients &amp; Notes
          </p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {item.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-olive/90">
                <Heart
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-gold/25 text-gold"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="leading-tight">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button: Add to Box or Quantity Selector */}
        <div className="mt-6 pt-2">
          {isSoldOut ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full justify-center opacity-60"
            >
              Unavailable Today
            </Button>
          ) : count > 0 ? (
            <div className="flex items-center justify-between rounded-full border-2 border-gold bg-blush/40 px-3 py-1 shadow-sm">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="grid h-8 w-8 place-items-center rounded-full bg-cream text-olive transition-transform hover:scale-105 active:scale-95"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 text-sm font-bold text-olive">
                <Check className="h-4 w-4 text-gold" />
                <span>{count} in your box</span>
              </div>
              <button
                type="button"
                onClick={() => addItem(item.id)}
                className="grid h-8 w-8 place-items-center rounded-full bg-gold text-white transition-transform hover:scale-105 active:scale-95"
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="cta"
              size="sm"
              onClick={() => addItem(item.id)}
              className="w-full justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add to Breakfast Box
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

