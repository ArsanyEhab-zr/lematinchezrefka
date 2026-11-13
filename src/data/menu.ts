export type MenuCategoryId = 'boxes' | 'bakery' | 'platters' | 'sweets' | 'drinks'

export type MenuCategory = {
  id: MenuCategoryId
  label: string
  blurb: string
}

export type MenuTag = 'Bestseller' | 'New' | 'For two' | 'Seasonal'

export type MenuItem = {
  id: string
  name: string
  category: MenuCategoryId
  price: number
  serves: string
  description: string
  ingredients: string[]
  photoId: string
  photoAlt: string
  tag?: MenuTag
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'boxes', label: 'Breakfast Boxes', blurb: 'Complete mornings, packed in kraft and tied with ribbon.' },
  { id: 'bakery', label: 'Viennoiseries', blurb: 'Laminated by hand the night before, baked at dawn.' },
  { id: 'platters', label: 'Brunch Platters', blurb: 'Generous boards for family tables and office mornings.' },
  { id: 'sweets', label: 'Sweet Corner', blurb: 'Little indulgences for birthdays, Sundays and no reason at all.' },
  { id: 'drinks', label: 'Drinks', blurb: 'Pressed, brewed and poured into glass bottles.' },
]

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'la-petite-matinee',
    name: 'La Petite Matinée',
    category: 'boxes',
    price: 28,
    serves: 'Serves 1',
    description: 'A quiet morning for one — warm toast, seasonal fruit and coffee the way you like it.',
    ingredients: ['Toasted country bread with berries', 'Mini butter croissant', 'Greek yoghurt and wild honey', 'Freshly pressed orange juice'],
    photoId: '1495214783159-3503fd1b572d',
    photoAlt: 'Breakfast for one with berry toast, coffee and fruit on a blue plate',
  },
  {
    id: 'le-grand-matin',
    name: 'Le Grand Matin',
    category: 'boxes',
    price: 65,
    serves: 'Serves 2',
    description: 'Our signature box: everything you would want on a slow weekend, delivered before you wake.',
    ingredients: ['Golden waffles and maple syrup', 'Soft scrambled eggs with chives', 'Two butter croissants', 'Seasonal fruit and two juices'],
    photoId: '1504754524776-8f4f37790ca0',
    photoAlt: 'Overhead brunch table with waffles, eggs, fruit and orange juice',
    tag: 'Bestseller',
  },
  {
    id: 'le-jardin',
    name: 'Le Jardin',
    category: 'boxes',
    price: 34,
    serves: 'Serves 1',
    description: 'Green, bright and nourishing — for mornings that need a gentle start.',
    ingredients: ['Smashed avocado on seeded rye', 'Soft-boiled free-range eggs', 'Homemade granola with berries', 'Cold-pressed green juice'],
    photoId: '1541519227354-08fa5d50c44d',
    photoAlt: 'Avocado toast with soft-boiled eggs on a white plate',
    tag: 'New',
  },
  {
    id: 'brunch-romance',
    name: 'Brunch Romance',
    category: 'boxes',
    price: 78,
    serves: 'Serves 2',
    description: 'Brioche French toast, fresh flowers and a handwritten card. Made for anniversaries and apologies.',
    ingredients: ['Brioche French toast with blueberries', 'Caramelised banana', 'Strawberry panna cotta duo', 'Fresh flowers and a handwritten note'],
    photoId: '1484723091739-30a097e8f929',
    photoAlt: 'Stacked French toast with blueberries and banana slices',
    tag: 'For two',
  },
  {
    id: 'croissants-au-beurre',
    name: 'Croissants au Beurre (×6)',
    category: 'bakery',
    price: 18,
    serves: '6 pieces',
    description: 'Three days of patience: cultured butter, slow-proofed dough, shattering layers.',
    ingredients: ['Cultured French butter', 'Stone-ground flour', 'Free-range egg glaze'],
    photoId: '1555507036-ab1f4038808a',
    photoAlt: 'Golden croissants dusted with flour on a dark board',
    tag: 'Bestseller',
  },
  {
    id: 'corbeille-viennoiseries',
    name: 'Corbeille de Viennoiseries',
    category: 'bakery',
    price: 36,
    serves: '12 pieces',
    description: 'A woven basket of croissants, pains au chocolat and brioches for sharing.',
    ingredients: ['4 butter croissants', '4 pains au chocolat', '4 sugar-pearl brioches'],
    photoId: '1608198093002-ad4e005484ec',
    photoAlt: 'Basket of assorted breads and pastries',
  },
  {
    id: 'pain-de-campagne',
    name: 'Pain de Campagne',
    category: 'bakery',
    price: 12,
    serves: '1 loaf · 800 g',
    description: 'Naturally leavened country loaf with a deep, crackling crust.',
    ingredients: ['Wild sourdough starter', 'Wholewheat and rye flours', 'Sea salt'],
    photoId: '1509440159596-0249088772ff',
    photoAlt: 'Rustic sourdough loaves with wheat stalks',
  },
  {
    id: 'plateau-brunch-famille',
    name: 'Plateau Brunch Famille',
    category: 'platters',
    price: 160,
    serves: 'Serves 6',
    description: 'A full family table on one board — sweet, savoury and fresh, with flowers from the market.',
    ingredients: ['Granola bowls with seasonal fruit', 'Mini croissants and brioches', 'Avocado and egg tartines', 'Fresh juices and a seasonal bouquet'],
    photoId: '1494390248081-4e521a5940db',
    photoAlt: 'Brunch spread with granola, fruit, avocado and pink tulips',
  },
  {
    id: 'plateau-figues-fromages',
    name: 'Plateau Figues & Fromages',
    category: 'platters',
    price: 120,
    serves: 'Serves 8–10',
    description: 'Fresh figs, grapes and a cheese selection for long, unhurried mornings.',
    ingredients: ['Three-cheese selection', 'Fresh figs and grapes', 'Walnuts and fig jam', 'Sliced pain de campagne'],
    photoId: '1478145046317-39f10e56b5e9',
    photoAlt: 'Platter of figs, grapes, cheese and eggs on a dark table',
    tag: 'Seasonal',
  },
  {
    id: 'pancakes-sirop',
    name: 'Pancakes au Sirop d’Érable',
    category: 'sweets',
    price: 26,
    serves: 'Serves 2',
    description: 'Fluffy buttermilk pancakes, stacked high, with a little jar of maple syrup.',
    ingredients: ['Buttermilk pancakes', 'Pure maple syrup', 'Fresh mint and berries'],
    photoId: '1567620905732-2d1ec7ab7445',
    photoAlt: 'Tall stack of pancakes with syrup being poured',
  },
  {
    id: 'panna-cotta-fraise',
    name: 'Panna Cotta à la Fraise (×4)',
    category: 'sweets',
    price: 22,
    serves: '4 jars',
    description: 'Silky vanilla cream topped with macerated strawberries, set in little glass jars.',
    ingredients: ['Vanilla bean cream', 'Macerated strawberries', 'Returnable glass jars'],
    photoId: '1488477181946-6428a0291777',
    photoAlt: 'Glass jars of strawberry panna cotta with fresh strawberries',
  },
  {
    id: 'tarte-fruits-rouges',
    name: 'Tarte aux Fruits Rouges',
    category: 'sweets',
    price: 42,
    serves: 'Serves 6–8',
    description: 'Lattice-topped tart filled with red berries and a hint of orange zest.',
    ingredients: ['All-butter shortcrust', 'Red berries and cherries', 'Orange zest and vanilla'],
    photoId: '1464305795204-6f5bbfc7fb81',
    photoAlt: 'Lattice berry tarts on a white linen with fresh berries',
  },
  {
    id: 'cookies-maison',
    name: 'Cookies Maison (×12)',
    category: 'sweets',
    price: 24,
    serves: '12 pieces',
    description: 'Brown-butter cookies with dark chocolate chunks and flaky sea salt.',
    ingredients: ['Brown butter', '70% dark chocolate', 'Flaky sea salt'],
    photoId: '1558961363-fa8fdf82db35',
    photoAlt: 'Chocolate chip cookies in a paper-lined basket',
  },
  {
    id: 'jus-orange',
    name: 'Jus d’Orange Pressé (1 L)',
    category: 'drinks',
    price: 12,
    serves: '1 litre',
    description: 'Maltese oranges pressed at 6 a.m. Nothing added, nothing taken away.',
    ingredients: ['Fresh Maltese oranges', 'Glass bottle'],
    photoId: '1600271886742-f049cd451bba',
    photoAlt: 'Glass of fresh orange juice with an orange slice',
  },
  {
    id: 'cafe-au-lait',
    name: 'Café au Lait Thermos (1 L)',
    category: 'drinks',
    price: 16,
    serves: 'Serves 4',
    description: 'Freshly ground coffee with steamed milk, kept warm in an insulated flask.',
    ingredients: ['Single-origin coffee', 'Fresh whole milk', 'Returnable thermos'],
    photoId: '1495474472287-4d71bcdd2085',
    photoAlt: 'Two hands holding cups of latte art coffee',
  },
  {
    id: 'chocolat-chaud',
    name: 'Chocolat Chaud à l’Ancienne',
    category: 'drinks',
    price: 18,
    serves: 'Serves 4',
    description: 'Thick, old-fashioned hot chocolate made with real dark chocolate.',
    ingredients: ['Dark chocolate', 'Whole milk', 'A pinch of cinnamon'],
    photoId: '1509042239860-f550ce710b93',
    photoAlt: 'Cups of hot drinks surrounded by plants',
  },
]

export const getMenuItem = (itemId: string): MenuItem | undefined =>
  MENU_ITEMS.find((item) => item.id === itemId)

