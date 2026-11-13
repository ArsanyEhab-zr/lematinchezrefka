import { useEffect, useId, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  FolderPlus,
  Folder,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Boxes,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import type { BoxCategory } from '@/types/box-builder'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated?: (category: BoxCategory) => void
  initialTab?: 'create' | 'list'
  initialEditId?: string | null
  initialDeleteId?: string | null
}

export const CategoryModal = ({
  isOpen,
  onClose,
  onCategoryCreated,
  initialTab = 'create',
  initialEditId = null,
  initialDeleteId = null,
}: CategoryModalProps) => {
  const modalTitleId = useId()
  const [newCatName, setNewCatName] = useState('')
  const [newCatNameAr, setNewCatNameAr] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatOrder, setNewCatOrder] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNameAr, setEditNameAr] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editOrder, setEditOrder] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteStrategy, setDeleteStrategy] = useState<'move' | 'cascade'>('move')
  const [targetCategoryId, setTargetCategoryId] = useState<string>('')

  const [activeTab, setActiveTab] = useState<'create' | 'list'>(initialTab)

  const { categories, boxes, addCategory, updateCategory, deleteCategory } = useBoxBuilderStore(
    useShallow((state) => ({
      categories: state.categories,
      boxes: state.boxes,
      addCategory: state.addCategory,
      updateCategory: state.updateCategory,
      deleteCategory: state.deleteCategory,
    }))
  )

  useEffect(() => {
    if (!isOpen) return
    setActiveTab(initialTab)
    setNewCatOrder(String(categories.length + 1))

    if (initialEditId) {
      const cat = categories.find((c) => c.id === initialEditId)
      if (cat) {
        setActiveTab('list')
        setDeletingId(null)
        setEditingId(cat.id)
        setEditName(cat.name_en || cat.name)
        setEditNameAr(cat.name_ar || '')
        setEditDesc(cat.description || '')
        setEditOrder(String(cat.display_order ?? 1))
        return
      }
    }

    if (initialDeleteId) {
      const cat = categories.find((c) => c.id === initialDeleteId)
      if (cat) {
        const others = categories.filter((c) => c.id !== cat.id)
        setActiveTab('list')
        setEditingId(null)
        setDeletingId(cat.id)
        setDeleteStrategy('move')
        setTargetCategoryId(others[0]?.id ?? '')
        return
      }
    }

    setEditingId(null)
    setDeletingId(null)
  }, [isOpen, initialTab, initialEditId, initialDeleteId])

  if (!isOpen) return null

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const parsedOrder = Number.parseInt(newCatOrder, 10)
    const created = addCategory(newCatName.trim(), newCatDesc.trim() || undefined, {
      name_en: newCatName.trim(),
      name_ar: newCatNameAr.trim() || undefined,
      display_order: Number.isFinite(parsedOrder) ? parsedOrder : categories.length + 1,
    })
    setNewCatName('')
    setNewCatNameAr('')
    setNewCatDesc('')
    setNewCatOrder(String(categories.length + 2))
    if (onCategoryCreated) {
      onCategoryCreated(created)
    }
    setActiveTab('list')
  }

  const handleStartEdit = (cat: BoxCategory) => {
    setDeletingId(null)
    setEditingId(cat.id)
    setEditName(cat.name_en || cat.name)
    setEditNameAr(cat.name_ar || '')
    setEditDesc(cat.description || '')
    setEditOrder(String(cat.display_order ?? 1))
  }

  const handleSaveEdit = (catId: string) => {
    if (!editName.trim()) return
    const parsedOrder = Number.parseInt(editOrder, 10)
    updateCategory(catId, {
      name: editName.trim(),
      name_en: editName.trim(),
      name_ar: editNameAr.trim() || undefined,
      description: editDesc.trim() || undefined,
      display_order: Number.isFinite(parsedOrder) ? parsedOrder : undefined,
    })
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditNameAr('')
    setEditDesc('')
    setEditOrder('')
  }

  const handleStartDelete = (cat: BoxCategory) => {
    const others = categories.filter((c) => c.id !== cat.id)
    setEditingId(null)
    setDeletingId(cat.id)
    setDeleteStrategy('move')
    setTargetCategoryId(others[0]?.id ?? '')
  }

  const handleConfirmDelete = (catId: string) => {
    if (deleteStrategy === 'cascade') {
      deleteCategory(catId, { deleteBoxes: true })
    } else {
      deleteCategory(catId, {
        deleteBoxes: false,
        targetCategoryId: targetCategoryId || null,
      })
    }
    setDeletingId(null)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-olive/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border-2 border-dashed border-kraft bg-cream p-6 sm:p-7 shadow-2xl transition-all max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close categories modal"
          className="absolute right-4 top-4 rounded-full p-1.5 text-olive/50 hover:bg-kraft/30 hover:text-olive transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-dashed border-kraft/70 pb-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dashed border-gold/60 bg-gold/10 text-gold-deep shadow-xs">
            <FolderPlus className="h-5 w-5 text-gold" />
          </span>
          <div>
            <h3 id={modalTitleId} className="font-display text-xl font-bold tracking-tight text-olive">
              Manage Box Categories
            </h3>
            <p className="text-xs text-olive/75">
              Categories group your artisanal breakfast boxes on the customer carte and stock controls.
            </p>
          </div>
        </div>

        {/* Sub-tabs: Add New Category vs Existing Categories */}
        <div className="mt-4 flex gap-2 border-b border-dashed border-kraft/60 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
              activeTab === 'create'
                ? 'bg-olive text-cream shadow-xs'
                : 'text-olive/70 hover:bg-blush/40 hover:text-olive'
            )}
          >
            <Plus className="h-3.5 w-3.5 text-gold" />
            <span>+ Add New Category</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
              activeTab === 'list'
                ? 'bg-olive text-cream shadow-xs'
                : 'text-olive/70 hover:bg-blush/40 hover:text-olive'
            )}
          >
            <Folder className="h-3.5 w-3.5 text-gold" />
            <span>Existing Categories ({categories.length})</span>
          </button>
        </div>

        {/* Tab 1: Create Category Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="rounded-xl border border-dashed border-kraft/80 bg-kraft/10 p-3.5 text-xs text-olive/80">
              <div className="flex items-center gap-1.5 font-bold text-olive">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Instant Menu Synchronization</span>
              </div>
              <p className="mt-1 text-[0.6875rem] leading-relaxed text-olive/75">
                Newly created categories immediately appear as category tabs in <strong>Stock Availability</strong> and as selectable options when creating or modifying boxes in the <strong>Box Configurator</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1.5">
                  English Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Family Weekend Hampers"
                  className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1.5">
                  Arabic Name (الاسم بالعربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: بوكسات العائلة والمشاركة"
                  className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1.5">
                  Description <span className="text-olive/50 font-normal lowercase">(optional blurb shown on menu)</span>
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Generous morning feasts crafted for weekend gatherings..."
                  className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs text-olive placeholder:text-olive/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={newCatOrder}
                  onChange={(e) => setNewCatOrder(e.target.value)}
                  className="w-full rounded-xl border border-kraft bg-cream px-3.5 py-2.5 text-xs font-bold text-olive focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashed border-kraft/60">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="cta"
                size="sm"
                type="submit"
                disabled={!newCatName.trim()}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Save Category</span>
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Existing Categories List & Management */}
        {activeTab === 'list' && (
          <div className="mt-4 flex flex-col gap-3 overflow-y-auto pr-1">
            <p className="text-xs text-olive/70">
              Edit bilingual names, display order, or safely remove categories with box reassignment or cleanup.
            </p>

            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-kraft p-6 text-center text-xs text-olive/60">
                No categories yet. Switch to "+ Add New Category" to create one.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {categories.map((cat) => {
                  const boxCount = boxes.filter((b) => b.category_id === cat.id).length
                  const isEditing = editingId === cat.id
                  const isDeleting = deletingId === cat.id
                  const otherCategories = categories.filter((c) => c.id !== cat.id)

                  if (isEditing) {
                    return (
                      <div
                        key={cat.id}
                        className="rounded-xl border border-gold bg-gold/5 p-3 flex flex-col gap-2.5"
                      >
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-[0.625rem] font-bold uppercase text-olive/70">
                              English Name *
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full rounded-lg border border-kraft bg-cream px-3 py-1.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[0.625rem] font-bold uppercase text-olive/70">
                              Arabic Name (عربي)
                            </label>
                            <input
                              type="text"
                              dir="rtl"
                              value={editNameAr}
                              onChange={(e) => setEditNameAr(e.target.value)}
                              placeholder="الاسم بالعربية..."
                              className="w-full rounded-lg border border-kraft bg-cream px-3 py-1.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-[0.625rem] font-bold uppercase text-olive/70">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder="Category description..."
                              className="w-full rounded-lg border border-kraft bg-cream px-3 py-1.5 text-xs text-olive focus:border-gold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[0.625rem] font-bold uppercase text-olive/70">
                              Order
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={editOrder}
                              onChange={(e) => setEditOrder(e.target.value)}
                              className="w-full rounded-lg border border-kraft bg-cream px-3 py-1.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleCancelEdit}
                            className="h-7 px-2.5 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                          <Button
                            variant="cta"
                            size="sm"
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={!editName.trim()}
                            className="h-7 px-2.5 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  if (isDeleting) {
                    return (
                      <div
                        key={cat.id}
                        className="rounded-xl border border-red-300 bg-red-50/70 p-3.5 flex flex-col gap-2.5"
                      >
                        <div className="flex items-start gap-2 text-red-900">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold">
                              Delete category "{cat.name_en || cat.name}"?
                            </p>
                            <p className="text-[0.6875rem] text-red-800/80 mt-0.5">
                              {boxCount === 0
                                ? 'This category has no boxes and can be removed safely.'
                                : `This category currently contains ${boxCount} ${boxCount === 1 ? 'box' : 'boxes'}. Choose how to handle them:`}
                            </p>
                          </div>
                        </div>

                        {boxCount > 0 && (
                          <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-cream p-2.5 text-xs text-olive">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`del-${cat.id}`}
                                checked={deleteStrategy === 'move'}
                                onChange={() => setDeleteStrategy('move')}
                                className="mt-0.5 accent-gold"
                              />
                              <div className="flex-1">
                                <span className="font-semibold">
                                  {otherCategories.length > 0
                                    ? 'Move boxes to another category:'
                                    : 'Keep boxes uncategorized:'}
                                </span>
                                {otherCategories.length > 0 && (
                                  <select
                                    value={targetCategoryId}
                                    onChange={(e) => {
                                      setDeleteStrategy('move')
                                      setTargetCategoryId(e.target.value)
                                    }}
                                    className="mt-1.5 w-full rounded-lg border border-kraft bg-cream px-2.5 py-1.5 text-xs font-bold text-olive focus:border-gold focus:outline-none"
                                  >
                                    {otherCategories.map((other) => (
                                      <option key={other.id} value={other.id}>
                                        {other.name_en || other.name}
                                      </option>
                                    ))}
                                    <option value="">Uncategorized (No category)</option>
                                  </select>
                                )}
                              </div>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-red-700 font-semibold">
                              <input
                                type="radio"
                                name={`del-${cat.id}`}
                                checked={deleteStrategy === 'cascade'}
                                onChange={() => setDeleteStrategy('cascade')}
                                className="accent-red-600"
                              />
                              <span>Delete category AND permanently delete all {boxCount} {boxCount === 1 ? 'box' : 'boxes'}</span>
                            </label>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="h-7 px-2.5 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="cta"
                            size="sm"
                            type="button"
                            onClick={() => handleConfirmDelete(cat.id)}
                            className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 border-red-700 text-white"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Confirm Delete
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={cat.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-kraft bg-cream p-3 hover:border-gold/50 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-kraft/25 px-1.5 py-0.5 text-[0.625rem] font-bold text-olive/70">
                            #{cat.display_order ?? 1}
                          </span>
                          <h4 className="text-xs font-bold text-olive">
                            {cat.name_en || cat.name}
                          </h4>
                          {cat.name_ar && (
                            <span dir="rtl" className="text-[0.6875rem] font-semibold text-gold-deep">
                              ({cat.name_ar})
                            </span>
                          )}
                          <span className="flex items-center gap-1 rounded-full bg-blush px-2 py-0.5 text-[0.625rem] font-semibold text-olive">
                            <Boxes className="h-2.5 w-2.5 text-gold-deep" />
                            <span>{boxCount} {boxCount === 1 ? 'box' : 'boxes'}</span>
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[0.6875rem] text-olive/70 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="rounded-lg p-1 text-olive/60 hover:bg-kraft/30 hover:text-olive transition-colors"
                          title="Edit Category Name & Order"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartDelete(cat)}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-dashed border-kraft/60">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setActiveTab('create')}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5 text-gold" />
                <span>+ Add Another Category</span>
              </Button>
              <Button
                variant="cta"
                size="sm"
                type="button"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
