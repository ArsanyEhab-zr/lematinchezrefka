import { useEffect, useId, useState } from 'react'
import { Plus, Save, Utensils, X } from 'lucide-react'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import type { Item } from '@/types/box-builder'
import { Button } from '@/components/ui/button'
import { CloudinaryUploadField } from '@/components/ui/cloudinary-upload-field'

export const ITEM_CATEGORIES: { value: Item['category']; label: string }[] = [
  { value: 'bakery', label: 'Bakery & Viennoiseries' },
  { value: 'savory', label: 'Savory & Charcuterie' },
  { value: 'dairy', label: 'Cheese & Dairy' },
  { value: 'beverage', label: 'Drinks & Coffee' },
  { value: 'sweet', label: 'Jams & Sweets' },
  { value: 'fruit', label: 'Fresh Fruit' },
  { value: 'extra', label: 'Table Extras & Flowers' },
]

interface IngredientModalProps {
  isOpen: boolean
  editingItem?: Item | null
  onClose: () => void
  onSaved?: (item: Item) => void
}

export const IngredientModal = ({
  isOpen,
  editingItem = null,
  onClose,
  onSaved,
}: IngredientModalProps) => {
  const titleId = useId()
  const addItem = useBoxBuilderStore((state) => state.addItem)
  const updateItem = useBoxBuilderStore((state) => state.updateItem)

  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [category, setCategory] = useState<Item['category']>('bakery')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (editingItem) {
      setNameEn(editingItem.name_en || editingItem.name)
      setNameAr(editingItem.name_ar || '')
      setCategory(editingItem.category)
      setDescription(editingItem.description || '')
      setImageUrl(editingItem.image_url || '')
    } else {
      setNameEn('')
      setNameAr('')
      setCategory('bakery')
      setDescription('')
      setImageUrl('')
    }
  }, [isOpen, editingItem])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEn = nameEn.trim()
    if (!cleanEn) return

    const cleanAr = nameAr.trim() || undefined
    const cleanDesc = description.trim() || undefined
    const cleanImg = imageUrl.trim() || undefined

    if (editingItem) {
      updateItem(editingItem.id, {
        name: cleanEn,
        name_en: cleanEn,
        name_ar: cleanAr,
        category,
        description: cleanDesc,
        image_url: cleanImg,
      })
      onSaved?.({
        ...editingItem,
        name: cleanEn,
        name_en: cleanEn,
        name_ar: cleanAr,
        category,
        description: cleanDesc,
        image_url: cleanImg,
      })
    } else {
      const created = addItem({
        name: cleanEn,
        name_en: cleanEn,
        name_ar: cleanAr,
        category,
        description: cleanDesc,
        image_url: cleanImg,
        is_available: true,
      })
      onSaved?.(created)
    }

    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-olive/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ingredient modal"
          className="absolute right-4 top-4 rounded-full p-1.5 text-olive/50 hover:bg-kraft/30 hover:text-olive transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-dashed border-kraft pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blush text-olive">
            <Utensils className="h-4 w-4 text-gold-deep" />
          </span>
          <div>
            <h3 id={titleId} className="font-display text-xl font-bold text-olive">
              {editingItem ? 'Edit Ingredient' : 'Add Internal Ingredient'}
            </h3>
            <p className="text-xs text-olive/70">
              {editingItem
                ? 'Updates name, category, and photo across all box defaults and swap drawers.'
                : 'Becomes immediately available for box components and customer swaps.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-olive">
                English Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Smoked Turkey & Gruyère"
                className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs text-olive focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-olive">
                Arabic Name (الاسم بالعربية)
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: تركي مدخن وجبن غرويير"
                className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs text-olive focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-olive">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Item['category'])}
              className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-olive">
              Description <span className="font-normal lowercase text-olive/50">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short tasting note shown inside customer swap options..."
              className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs text-olive focus:border-gold focus:outline-none"
            />
          </div>

          <CloudinaryUploadField
            label="Ingredient Photo"
            value={imageUrl}
            onChange={setImageUrl}
            folder="le-matin/ingredients"
            allowEmpty
          />

          <div className="flex justify-end gap-2 border-t border-dashed border-kraft pt-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="cta" size="sm" type="submit" disabled={!nameEn.trim()} className="gap-1.5">
              {editingItem ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{editingItem ? 'Save Ingredient' : 'Add to Inventory'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
