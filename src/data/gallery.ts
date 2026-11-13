export type GalleryShot = {
  id: string
  photoId: string
  alt: string
  caption: string
  occasion: string
  /** Tailwind aspect class — varied ratios create the masonry rhythm. */
  aspect: string
}

export const GALLERY: GalleryShot[] = [
  { id: 'g1', photoId: '1494390248081-4e521a5940db', alt: 'Brunch spread with pink tulips and granola', caption: 'Tulips & granola', occasion: 'Mother’s Day', aspect: 'aspect-[3/4]' },
  { id: 'g2', photoId: '1555507036-ab1f4038808a', alt: 'Freshly baked croissants with flour', caption: 'Croissants at 5 a.m.', occasion: 'Office morning', aspect: 'aspect-square' },
  { id: 'g3', photoId: '1484723091739-30a097e8f929', alt: 'French toast with blueberries', caption: 'Brioche French toast', occasion: 'Anniversary', aspect: 'aspect-[4/5]' },
  { id: 'g4', photoId: '1464305795204-6f5bbfc7fb81', alt: 'Lattice berry tarts on linen', caption: 'Red-fruit tarts', occasion: 'Sunday lunch', aspect: 'aspect-[4/3]' },
  { id: 'g5', photoId: '1488477181946-6428a0291777', alt: 'Strawberry panna cotta jars', caption: 'Panna cotta jars', occasion: 'Baby shower', aspect: 'aspect-[2/3]' },
  { id: 'g6', photoId: '1478145046317-39f10e56b5e9', alt: 'Platter of figs, grapes and cheese', caption: 'Figs & fromages', occasion: 'Family brunch', aspect: 'aspect-square' },
  { id: 'g7', photoId: '1506084868230-bb9d95c24759', alt: 'Pancakes with blueberries on a wooden board', caption: 'Blueberry pancakes', occasion: 'Birthday surprise', aspect: 'aspect-[3/4]' },
  { id: 'g8', photoId: '1509440159596-0249088772ff', alt: 'Rustic sourdough loaves with wheat', caption: 'Pain de campagne', occasion: 'Weekend order', aspect: 'aspect-[4/3]' },
  { id: 'g9', photoId: '1563729784474-d77dbb933a9e', alt: 'Pink frosted cupcakes', caption: 'Rose cupcakes', occasion: 'Engagement', aspect: 'aspect-[4/5]' },
  { id: 'g10', photoId: '1541519227354-08fa5d50c44d', alt: 'Avocado toast with soft-boiled eggs', caption: 'Le Jardin box', occasion: 'Wellness morning', aspect: 'aspect-[2/3]' },
  { id: 'g11', photoId: '1504754524776-8f4f37790ca0', alt: 'Breakfast table with waffles and juice', caption: 'Le Grand Matin', occasion: 'Guests in town', aspect: 'aspect-square' },
  { id: 'g12', photoId: '1567620905732-2d1ec7ab7445', alt: 'Pancake stack with syrup pouring', caption: 'Maple pancakes', occasion: 'Lazy Sunday', aspect: 'aspect-[3/4]' },
]

