import { useShallow } from 'zustand/react/shallow'
import { useSiteSettingsStore, type Language } from '@/stores/site-settings-store'

export const TRANSLATIONS = {
  en: {
    common: { optional: 'Optional', close: 'Close', increase: 'Increase quantity', decrease: 'Decrease quantity', deliveryArea: 'Tunis, La Marsa, Carthage and Sidi Bou Said', stamp: 'Homemade · With love · Le Matin ·' },
    gallery: { view: 'View morning details', description: 'Freshly prepared and packed in our signature kraft box with fresh flowers and silk ribbon.',
      captions: ['Tulips & granola', 'Croissants at 5 a.m.', 'Brioche French toast', 'Red-fruit tarts', 'Panna cotta jars', 'Figs & fromages', 'Blueberry pancakes', 'Pain de campagne', 'Rose cupcakes', 'Le Jardin box', 'Le Grand Matin', 'Maple pancakes'],
      occasions: ['Mother’s Day', 'Office morning', 'Anniversary', 'Sunday lunch', 'Baby shower', 'Family brunch', 'Birthday surprise', 'Weekend order', 'Engagement', 'Wellness morning', 'Guests in town', 'Lazy Sunday'] },
    brand: {
      name: 'Le Matin chez Refka',
      shortName: 'Le Matin',
      chezRefka: 'chez Refka',
      tagline: 'Fait Maison, Avec Amour',
    },
    nav: {
      home: 'Home',
      menu: 'Our Menu',
      about: 'Our Story',
      contact: 'Order & Contact',
      orderWhatsApp: 'Order via WhatsApp',
      kitchenPortal: 'Kitchen Admin Dashboard',
      busyBadge: 'Kitchen Full',
    },
    home: {
      eyebrow: 'Artisanal Breakfast & Brunch Delivery',
      heroTitleLine1: 'Your Morning',
      heroTitleLine2: 'Made Beautiful',
      heroScript: 'Fait Maison, Avec Amour',
      heroDesc:
        'Freshly baked French viennoiseries, slow-proofed sourdough loaves, homemade granola, and fresh seasonal fruit—lovingly packed in signature kraft boxes with silk ribbon and delivered straight to your door at dawn.',
      exploreMenu: 'Explore Full Menu',
      orderWhatsApp: 'Order via WhatsApp',
      assuranceCutoff: 'Order by',
      assuranceCutoffSuffix: 'for next morning',
      assuranceDelivery: 'Delivered 7–11 a.m. hot & fresh',
      assuranceHomemade: '100% Homemade with Love',
      pillars: [
        {
          title: 'Cultured French Butter',
          desc: 'Only high-grade French butter is laminated into our dough for shattering, flaky layers with unforgettable aroma.',
        },
        {
          title: 'Slow Proofed Overnight',
          desc: 'Doughs rest for 24 hours to develop natural complexity, light digestibility, and golden caramelized crusts.',
        },
        {
          title: 'Local Seasonal Harvest',
          desc: 'Fresh citrus squeezed at 6 a.m., mountain wildflower honey, and figs handpicked from local orchards.',
        },
        {
          title: 'Handwritten Card Included',
          desc: 'Every box arrives tied with silk ribbon and a customized calligraphy message for your recipient.',
        },
      ],
      featuredEyebrow: 'Signature Creations',
      featuredTitle: 'Breakfast Boxes Loved by All',
      featuredScript: 'Le matin s’éveille',
      featuredIntro:
        'Packed with care in compostable kraft packaging, fresh wild flowers, and everything needed for a sacred morning ritual.',
      fromPrice: 'from',
      customizeOrder: 'Customize & Order',
      exploreAllBoxes: 'Explore All Breakfast Boxes',
      curationsCount: 'Curations',
      galleryEyebrow: 'Morning Moments',
      galleryTitle: 'The Breakfast Gallery',
      galleryScript: 'Partagez vos réveils',
      galleryIntro:
        'Snapshots of love letters, birthday surprises, office brunches, and slow weekend mornings delivered by Refka.',
      inviteScript: 'Fait maison, chaque matin',
      inviteTitle: 'Planning a Special Wake-Up?',
      inviteDesc:
        'Whether celebrating an anniversary, thanking your team, or sending breakfast to someone you love across the city, we craft every box to order.',
      sendWhatsAppNote: 'Send Us a Note on WhatsApp',
      customOrderInquiry: 'Custom Order Inquiry',
    },
    menu: {
      eyebrow: 'La Carte des Boîtes',
      title: 'Artisanal Breakfast Boxes',
      script: 'Composez votre réveil',
      intro:
        'Every offering at Le Matin is curated as a complete breakfast box. Select your favorite box below and tailor its inner components—swap croissants, eggs, juices, or sweet pots with live pricing.',
      allBoxes: 'All Boxes',
      noBoxesTitle: 'No boxes available in this category',
      noBoxesDesc: 'Please choose another category tab above to explore our artisan collection.',
      soldOut: 'Sold Out',
      soldOutToday: 'Sold Out for Today',
      kitchenBusyBtn: 'Kitchen Currently Full',
      fromPrice: 'from',
      boxInclusions: 'Box Inclusions',
      itemsUnit: 'Items',
      swappable: '↻ Swappable',
      signature: 'Signature',
      customizeAndOrderBox: 'Customize & Order Box',
      customizeBox: 'Customize & Swap',
      quickOrderNow: 'Quick Order Now',
      ritualsEyebrow: 'Sacred Morning Rituals',
      ritualsTitle: 'How Refka Prepares Your Box',
      step1Title: '1. Tailor Your Box',
      step1Desc:
        'Choose your favorite breakfast box above. Swap artisan croissants, juices, or sweet pots to match your palate.',
      step2Title: '2. Order Before Cutoff',
      step2Desc:
        'Place your order before the daily evening cutoff to guarantee fresh dawn baking and warm morning delivery.',
      step3Title: '3. Delivered Warm',
      step3Desc:
        'Packed in insulated containers and signature kraft presentation with a handwritten calligraphy note.',
      yourBreakfastOrder: 'Your Breakfast Order',
      boxSingular: 'box',
      boxPlural: 'boxes',
      tailoredSingular: 'tailored box',
      tailoredPlural: 'tailored boxes',
      subtotalLabel: 'Subtotal:',
      deliveryLabel: 'Delivery:',
      freeDelivery: 'FREE',
      freeDeliveryHint: 'Free delivery unlocked!',
      addMoreForFreeDelivery: 'Add {amount} more for Free Delivery',
      resetBtn: 'Reset',
      finalizeForm: 'Checkout & Delivery Details',
      orderViaWhatsApp: 'Quick WhatsApp Dispatch',
    },
    builder: {
      badge: 'Atelier Box Customizer',
      basePrice: 'Base:',
      interactiveSwaps: 'Interactive Swaps Enabled',
      artisanIngredients: 'Artisan Ingredients',
      componentsHeading: 'Box Components & Personal Swaps',
      componentsSub:
        'Review default breakfast items below. Click on any swappable item to tailor it to your morning taste.',
      resetDefaults: 'Reset Defaults',
      signatureFixed: 'Signature',
      swappableCount: 'Swappable ({count} options)',
      customizedBadge: 'Customized',
      outOfStockNotice:
        'This item is currently out of stock today. Please select an alternative below.',
      doneChoosing: 'Done Choosing',
      customizeSwap: 'Customize / Swap',
      selectAlternativeFor: 'Select an alternative for',
      standardLabel: '(Standard)',
      outOfStockBadge: 'Out of Stock',
      unavailableLabel: 'Unavailable',
      includedLabel: 'Included',
      specialNotesLabel: 'Special Customization Requests / Dietary Notes',
      specialNotesPlaceholder:
        'e.g. Please package bread separately, replace sugar with raw honey, include a birthday ribbon...',
      totalLabel: 'Total:',
      includesUpgrades: 'Includes {mod} upgrades per box',
      includesDiscount: 'Includes {mod} discount per box',
      cancelBtn: 'Cancel',
      addBoxBtn: 'Add Tailored Box to Order',
      addAndCheckoutBtn: 'Add & Complete Order Now',
      addAndBrowseBtn: 'Add & Keep Browsing',
      addedBtn: 'Added to Order!',
    },
    about: {
      eyebrow: 'Our Story & Philosophy',
      title: 'A Love Letter to the Sacred Morning',
      script: 'Fait maison, chaque matin',
      p1: 'Le Matin chez Refka was born out of a quiet rebellion against hurried, industrialized breakfasts. Refka grew up watching her grandmother fold butter into dough by hand, understanding that breakfast is not just fuel—it is the emotional compass of the entire day.',
      p2: 'After training in French artisan viennoiserie, Refka returned home with a simple vision: to bring the gentle elegance of French rustic chic to your morning table. Every morning at 4:30 a.m., when the city is still quiet, our ovens are lit.',
      p3: 'We do not use premixes, preservatives, or shortcuts. Our croissants require three days of lamination and resting. Our sourdough loaves ferment slowly over 24 hours. And each breakfast box is wrapped by hand in kraft paper, tied with a silk ribbon, and sent out with a personalized handwritten card.',
      ctaDiscover: 'Discover Refka’s Creations',
      commitmentsEyebrow: 'Our Commitments',
      commitmentsTitle: 'The Three Non-Negotiables',
      commitmentsScript: 'L’exigence artisanale',
      commitmentsIntro:
        'Why hundreds of families and gift-senders trust Refka with their most special mornings.',
      promise1Title: 'Pure Natural Ingredients',
      promise1Desc:
        'Only authentic cultured butter, organic unbleached flour, free-range eggs, and raw wildflower honey. Never margarine, artificial essences, or shortening.',
      promise1Bullet1: 'Cultured AOP butter only',
      promise1Bullet2: 'Zero industrial preservatives',
      promise2Title: 'Uncompromising Patience',
      promise2Desc:
        'Good bread cannot be rushed. Our viennoiserie dough rests overnight at cold temperature, allowing yeasts to unlock aromas that instant baking can never match.',
      promise2Bullet1: '24-hour sourdough fermentation',
      promise2Bullet2: 'Baked at 5 a.m. sharp',
      promise3Title: 'Human-Centric Warmth',
      promise3Desc:
        'Every order is prepared as if it were for our own family. Refka reads every single note, writes the recipient’s card by hand, and ensures every box arrives with care.',
      promise3Bullet1: 'Handwritten calligraphy card',
      promise3Bullet2: 'Direct WhatsApp care from Refka',
      quoteText:
        '“The world moves too fast, but morning belongs to us. When you open a box from Le Matin, the scent of warm butter and roasted coffee should remind you that life is meant to be savoured, slowly.”',
      quoteAuthor: 'Refka Trabelsi',
      quoteRole: 'Fondatrice & Pâtissière, Le Matin',
    },
    contact: {
      eyebrow: 'Direct Care & Custom Orders',
      title: 'Complete Your Breakfast Order',
      script: 'Toujours à votre écoute',
      intro:
        'Fill out your delivery details below to dispatch your morning box. Refka receives each request directly on WhatsApp to confirm delivery timing, handwritten card wording, and custom pastry wishes.',
      welcomeBack: 'Welcome back, {name}! Your details were filled automatically.',
      clearProfile: 'Clear',
      orderSentTitle: 'Order #{id} Sent to WhatsApp!',
      orderSentDesc:
        'WhatsApp has opened in a new tab with your pre-filled order. Send the message to Refka to finalize confirmation. You can also view it in the Kitchen Portal.',
      celebrationBadge: 'Saved in Kitchen Atelier',
      celebrationTitle: 'Order Confirmed! Redirecting to WhatsApp...',
      celebrationSubtitle:
        'Your handcrafted breakfast order is saved in our kitchen queue. Handing off to WhatsApp with your full itemized summary...',
      celebrationOrderNo: 'Order Reference',
      celebrationTotalLabel: 'Order Total',
      celebrationProgress: 'Opening WhatsApp automatically...',
      openWhatsAppNowBtn: 'Open WhatsApp Now',
      itemsInOrder: 'Items currently in your order:',
      tailoredBoxesHeading: 'Tailored Boxes',
      menuItemsHeading: 'Menu Items',
      removeBtn: 'Remove',
      subtotal: 'Boxes Subtotal',
      deliveryFee: 'Morning Delivery Fee',
      freeDeliveryUnlocked: 'Free (Threshold Met!)',
      giftCardFeeLabel: 'Handwritten Calligraphy Card',
      complimentary: 'Complimentary',
      grandTotal: 'Estimated Total',
      minOrderWarning:
        'Minimum order amount is {min}. Please add more items or boxes before dispatching.',
      nameLabel: 'Your Full Name',
      nameHint: 'Who should Refka greet?',
      namePlaceholder: 'e.g. Salma Ben Ali',
      phoneLabel: 'WhatsApp Phone Number',
      phoneHint: 'For live delivery coordination',
      phonePlaceholder: '+20 100 000 0000',
      dateLabel: 'Preferred Delivery Date',
      slotLabel: 'Morning Delivery Time Slot',
      slotHint: 'Breakfasts arrive warm within this window',
      addressLabel: 'Detailed Delivery Address',
      addressHint: 'Street, building/villa, floor, landmark',
      addressPlaceholder: 'e.g. 14 Rue des Jasmins, Villa 3',
      giftCardCheckboxLabel: 'Include a Handwritten Calligraphy Gift Card',
      noteLabel: 'Handwritten Card Message / Special Notes',
      noteHint:
        'Refka writes this by hand in calligraphy. Add any food allergies or delivery gate codes.',
      notePlaceholder:
        'e.g. “Happy Anniversary my love!” or “Please leave with concierge on 2nd floor.”',
      rememberMeLabel: 'Remember my details on this device for future orders',
      confirmWhatsAppBtn: 'Confirm & Dispatch Order via WhatsApp',
      busyDisabledBtn: 'Kitchen Currently Full — Orders Paused',
      paymentAssurance:
        'No online card payment required upfront · Pay via cash or transfer upon morning delivery',
      atelierTitle: 'L’Atelier Le Matin',
      atelierDesc:
        'Our artisanal kitchen bakes fresh every dawn. Event tastings and custom gift consultations are welcome by prior appointment.',
      deliveryZonesTitle: 'Delivery Coverage',
      morningHoursTitle: 'Morning Delivery Slots',
      dailyCutoffTitle: 'Daily Baking Cutoff',
      dailyCutoffDesc: 'Orders close daily at {cutoff}',
      phoneWhatsAppTitle: 'Telephone & WhatsApp',
      emailTitle: 'Email Inquiries',
      eventsBadge: 'Large Events & Corporate',
      eventsTitle: 'Brunch Catering for 10 to 100 Guests',
      eventsDesc:
        'Hosting an engagement, baby shower, or executive breakfast? We create full bespoke pastry tables, fruit towers, and hot coffee urns. Message Refka at least 48 hours in advance.',
    },
    footer: {
      topStripPrefix: 'Daily morning delivery across all primary zones · Cutoff at',
      manifesto:
        'Artisanal breakfast boxes and French viennoiseries crafted with cultured butter, slow-fermented doughs, and seasonal harvest. Freshly baked at dawn and delivered warmly to your doorstep.',
      devotion: 'Homemade with devotion since 2022',
      navigationTitle: 'Navigation',
      directContactTitle: 'Direct Contact & Socials',
      chatOnWhatsApp: 'Chat on WhatsApp',
      facebookPage: 'Facebook Page',
      instagramPage: 'Instagram',
      rightsReserved: 'All rights reserved.',
      madeWithLove: 'Fait maison avec amour',
    },
  },

  ar: {
    common: { optional: 'اختياري', close: 'إغلاق', increase: 'زيادة الكمية', decrease: 'تقليل الكمية', deliveryArea: 'تونس والمرسى وقرطاج وسيدي بوسعيد', stamp: 'صنع منزلي · بكل حب · لو ماتان ·' },
    gallery: { view: 'عرض تفاصيل الصباح', description: 'نحضّرها طازجة ونغلّفها في بوكس كرافت مميز مع زهور طبيعية وشريط حريري.',
      captions: ['توليب وجرانولا', 'كرواسون الخامسة صباحاً', 'توست بريوش فرنسي', 'تارت الفواكه الحمراء', 'أكواب بانا كوتا', 'تين وأجبان', 'بان كيك بالتوت الأزرق', 'خبز ريفي', 'كب كيك الورد', 'بوكس الحديقة', 'الصباح الكبير', 'بان كيك بشراب القيقب'],
      occasions: ['عيد الأم', 'صباح المكتب', 'ذكرى سنوية', 'غداء الأحد', 'استقبال مولود', 'برانش عائلي', 'مفاجأة عيد ميلاد', 'طلب نهاية الأسبوع', 'خطوبة', 'صباح صحي', 'ضيوف المدينة', 'أحد هادئ'] },
    brand: {
      name: 'لو ماتان شي رفقة (Le Matin)',
      shortName: 'لو ماتان',
      chezRefka: 'chez Refka',
      tagline: 'صُنع في المنزل، بكل حب',
    },
    nav: {
      home: 'الرئيسية',
      menu: 'قائمة البوكسات',
      about: 'قصتنا',
      contact: 'إتمام الطلب والتواصل',
      orderWhatsApp: 'اطلب عبر واتساب',
      kitchenPortal: 'لوحة تحكم المطبخ',
      busyBadge: 'المطبخ مكتمل',
    },
    home: {
      eyebrow: 'توصيل بوكسات الإفطار والبرانش الحرفي',
      heroTitleLine1: 'صباحك أجمل',
      heroTitleLine2: 'بنكهة فرنسية ريفية',
      heroScript: 'صُنع في المنزل، بكل حب',
      heroDesc:
        'مخبوزات فرنسية طازجة بالزبدة الطبيعية، خبز الساوردو المخمّر ببطء، جرانولا منزلية، وفواكه موسمية طازجة — تُرتب بعناية في بوكسات كرافت أنيقة بشريط حريري وتُوصل دافئة إلى باب منزلك مع الفجر.',
      exploreMenu: 'استكشف قائمة البوكسات',
      orderWhatsApp: 'اطلب عبر واتساب',
      assuranceCutoff: 'اطلب قبل الساعة',
      assuranceCutoffSuffix: 'لتوصيل صباح الغد',
      assuranceDelivery: 'توصيل صباحي طازج ودافئ',
      assuranceHomemade: 'مخبوزات منزلية 100% بكل حب',
      pillars: [
        {
          title: 'زبدة فرنسية طبيعية فاخرة',
          desc: 'نستخدم أجود أنواع الزبدة الفرنسية لتوريد العجين والحصول على طبقات مقرمشة وهشة برائحة لا تُقاوم.',
        },
        {
          title: 'تخمير بطيء طوال الليل',
          desc: 'ترتاح العجينة لمدة 24 ساعة لتطوير نكهة غنية، وهضم خفيف، وقشرة ذهبية مكرملة.',
        },
        {
          title: 'حصاد موسمي طازج يومياً',
          desc: 'عصائر طبيعية تُعصر في السادسة صباحاً، عسل جبلي نقي، وفواكه طازجة مختارة بعناية.',
        },
        {
          title: 'بطاقة إهداء مكتوبة بخط اليد',
          desc: 'يصل كل بوكس مربوطاً بشريط حريري مع بطاقة معايدة مكتوبة بخط اليد برسالتك الخاصة لمن تحب.',
        },
      ],
      featuredEyebrow: 'إبداعاتنا المميزة',
      featuredTitle: 'بوكسات الإفطار الأكثر طلباً',
      featuredScript: 'إشراقة الصباح',
      featuredIntro:
        'مُغلفة بعناية فائقة في عبوات كرافت صديقة للبيئة مع زهور طبيعية وكل ما تحتاجه لطقوس صباحية دافئة.',
      fromPrice: 'يبدأ من',
      customizeOrder: 'خصّص البوكس واطلب الآن',
      exploreAllBoxes: 'عرض جميع بوكسات الإفطار',
      curationsCount: 'بوكسات',
      galleryEyebrow: 'لحظات الصباح',
      galleryTitle: 'معرض صور الإفطار',
      galleryScript: 'شاركنا صباحاتك الجميلة',
      galleryIntro:
        'لقطات حية لرسائل الحب، مفاجآت أعياد الميلاد، اجتماعات الصباح، وعطلات نهاية الأسبوع من مطبخ رفقة.',
      inviteScript: 'مخبوز بحب، كل صباح',
      inviteTitle: 'تخطط لمفاجأة صباحية مميزة؟',
      inviteDesc:
        'سواء كنت تحتفل بذكرى خاصة، أو تشكر فريق عملك، أو ترسل إفطاراً دافئاً لشخص عزيز، نحن نُعد كل بوكس خصيصاً حسب طلبك.',
      sendWhatsAppNote: 'راسلنا عبر واتساب',
      customOrderInquiry: 'طلب خاص أو مناسبة',
    },
    menu: {
      eyebrow: 'قائمة البوكسات الحرفية',
      title: 'بوكسات الإفطار والبرانش',
      script: 'صمّم صباحك على ذوقك',
      intro:
        'تُقدم جميع إبداعاتنا في "لو ماتان" على هيئة بوكسات إفطار متكاملة. اختر البوكس المفضل لديك أدناه وقم بتخصيص مكوناته الداخلية واستبدال الأصناف مع حساب السعر المباشر.',
      allBoxes: 'جميع البوكسات',
      noBoxesTitle: 'لا توجد بوكسات متاحة في هذا القسم حالياً',
      noBoxesDesc: 'يرجى اختيار قسم آخر من التبويبات أعلاه لاستكشاف تشكيلتنا.',
      soldOut: 'نفدت الكمية',
      soldOutToday: 'نفدت الكمية لليوم',
      kitchenBusyBtn: 'المطبخ مكتمل العدد حالياً',
      fromPrice: 'يبدأ من',
      boxInclusions: 'مكونات البوكس',
      itemsUnit: 'أصناف',
      swappable: '↻ قابل للتبديل',
      signature: 'أساسي',
      customizeAndOrderBox: 'تخصيص وطلب البوكس',
      customizeBox: 'تخصيص وتبديل',
      quickOrderNow: 'اطلب البوكس فوراً',
      ritualsEyebrow: 'طقوس الصباح الدافئة',
      ritualsTitle: 'كيف تُحضّر رفقة بوكس الإفطار الخاص بك',
      step1Title: '١. خصّص مكونات البوكس',
      step1Desc:
        'اختر البوكس المفضل لديك، واستبدل الكرواسون أو العصائر أو الحلويات بما يناسب ذوقك.',
      step2Title: '٢. اطلب قبل موعد الإغلاق',
      step2Desc:
        'أكمل طلبك قبل موعد الإغلاق المسائي لضمان الخَبز الطازج فجراً والتوصيل في الموعد المحدد.',
      step3Title: '٣. يصلك دافئاً لباب منزلك',
      step3Desc:
        'يُغلف في عبوات حافظة للحرارة وبوكسات كرافت أنيقة مع بطاقة إهداء مكتوبة بخط اليد.',
      yourBreakfastOrder: 'سلة طلب الإفطار',
      boxSingular: 'بوكس',
      boxPlural: 'بوكسات',
      tailoredSingular: 'بوكس مخصص',
      tailoredPlural: 'بوكسات مخصصة',
      subtotalLabel: 'المجموع الفرعي:',
      deliveryLabel: 'التوصيل:',
      freeDelivery: 'مجاني',
      freeDeliveryHint: 'حصلت على توصيل مجاني!',
      addMoreForFreeDelivery: 'أضف بقيمة {amount} للحصول على توصيل مجاني',
      resetBtn: 'إفراغ',
      finalizeForm: 'إدخال بيانات التوصيل',
      orderViaWhatsApp: 'إرسال سريع عبر واتساب',
    },
    builder: {
      badge: 'مُخصّص بوكسات الإفطار',
      basePrice: 'السعر الأساسي:',
      interactiveSwaps: 'تبديل الأصناف متاح',
      artisanIngredients: 'مكونات حرفية طازجة',
      componentsHeading: 'مكونات البوكس وخيارات التبديل',
      componentsSub:
        'راجع الأصناف الافتراضية للبوكس أدناه. اضغط على أي صنف قابل للتبديل لاختيار البديل المفضل لديك.',
      resetDefaults: 'استعادة الافتراضي',
      signatureFixed: 'صنف ثابت',
      swappableCount: 'قابل للتبديل ({count} خيارات)',
      customizedBadge: 'مُخصّص',
      outOfStockNotice: 'هذا الصنف غير متوفر اليوم. يرجى اختيار بديل متاح أدناه.',
      doneChoosing: 'تم الاختيار',
      customizeSwap: 'تخصيص / تبديل',
      selectAlternativeFor: 'اختر بديلاً لـ',
      standardLabel: '(افتراضي)',
      outOfStockBadge: 'نفد من المخزون',
      unavailableLabel: 'غير متاح',
      includedLabel: 'مشمول',
      specialNotesLabel: 'ملاحظات التخصيص / الحساسية الغذائية',
      specialNotesPlaceholder:
        'مثال: يرجى تغليف الخبز بشكل منفصل، استبدال السكر بعسل طبيعي، إضافة شريط عيد ميلاد...',
      totalLabel: 'الإجمالي:',
      includesUpgrades: 'يشمل {mod} إضافات لكل بوكس',
      includesDiscount: 'يشمل {mod} خصم لكل بوكس',
      cancelBtn: 'إلغاء',
      addBoxBtn: 'إضافة البوكس المخصص للطلب',
      addAndCheckoutBtn: 'أضف البوكس وأكمل الطلب الآن',
      addAndBrowseBtn: 'أضف وتابع التصفح',
      addedBtn: 'تمت الإضافة بنجاح!',
    },
    about: {
      eyebrow: 'قصتنا وفلسفتنا',
      title: 'رسالة حب لطقوس الصباح الهادئة',
      script: 'صُنع في المنزل، كل صباح',
      p1: 'وُلد مشروع "لو ماتان شي رفقة" من شغف حقيقي بإعادة البهجة والدفء لوجبة الإفطار بعيداً عن المخبوزات التجارية السريعة. نشأت رفقة وهي تشاهد جدتها تطوي الزبدة داخل العجين يدوياً، مؤمنة بأن الإفطار هو البوصلة العاطفية لليوم بأكمله.',
      p2: 'بعد تدريب متعمق في فنون المخبوزات والفيينوازيري الفرنسي، عادت رفقة برؤية واضحة: تقديم الأناقة الريفية الفرنسية الدافئة على مائدتكم. في كل فجر عند الساعة 4:30 صباحاً، تُضاء أفراننا لتبدأ رحلة الخَبز.',
      p3: 'نحن لا نستخدم الخلطات الجاهزة أو المواد الحافظة. يتطلب الكرواسون لدينا ثلاثة أيام من التوريد والراحة، ويتخمر خبز الساوردو ببطء على مدار 24 ساعة. ويُغلف كل بوكس يدوياً بورق الكرافت وشريط الحرير مع بطاقة معايدة مكتوبة بخط اليد.',
      ctaDiscover: 'استكشف إبداعات رفقة',
      commitmentsEyebrow: 'عهودنا لكم',
      commitmentsTitle: 'ثلاثة مبادئ لا نتنازل عنها',
      commitmentsScript: 'الإتقان الحرفي',
      commitmentsIntro: 'لماذا تثق العائلات ومحبو الهدايا المميزة بمطبخ رفقة في مناسباتهم الصباحية.',
      promise1Title: 'مكونات طبيعية نقية 100%',
      promise1Desc:
        'نستخدم فقط الزبدة الطبيعية الفاخرة، الدقيق العضوي غير المبيض، البيض البلدي الطازج، والعسل الجبلي الخام. لا نستخدم المرجرين أو المنكهات الصناعية أبداً.',
      promise1Bullet1: 'زبدة طبيعية فاخرة فقط',
      promise1Bullet2: 'خالي تماماً من المواد الحافظة',
      promise2Title: 'صبر وعناية في التخمير',
      promise2Desc:
        'الخبز المتقن لا يُستعجل. ترتاح عجينتنا طوال الليل في درجات حرارة باردة لتنضج النكهات وتمنحك قواماً هشاً وخفيفاً.',
      promise2Bullet1: 'تخمير طبيعي لمدة 24 ساعة',
      promise2Bullet2: 'يُخبز طازجاً الساعة 5 فجراً',
      promise3Title: 'دفء إنساني في كل تفصيل',
      promise3Desc:
        'نُحضّر كل طلب وكأنه لعائلتنا. تقرأ رفقة كل ملاحظة بنفسها، وتكتب بطاقة الإهداء بخط يدها، وتحرص على وصول البوكس في أبهى صورة.',
      promise3Bullet1: 'بطاقة إهداء مكتوبة بخط اليد',
      promise3Bullet2: 'متابعة مباشرة عبر واتساب مع رفقة',
      quoteText:
        '«العالم يركض بسرعة، لكن الصباح ملكٌ لنا. عندما تفتح بوكس لو ماتان، فإن رائحة الزبدة الدافئة والقهوة المحمصة تذكرك بأن الحياة خُلقت لنستمتع بتفاصيلها على مهل.»',
      quoteAuthor: 'رفقة الطرابلسي',
      quoteRole: 'المؤسِّسة وشيف المخبوزات — Le Matin',
    },
    contact: {
      eyebrow: 'إتمام الطلب والتواصل المباشر',
      title: 'أكمل طلب بوكس الإفطار أو تواصل مع رفقة',
      script: 'نسعد بخدمتكم دائماً',
      intro:
        'أدخل بيانات التوصيل أدناه لإرسال طلبك مباشرة إلى واتساب المطبخ لتأكيد موعد التوصيل الصباحي ورسالة بطاقة الإهداء.',
      welcomeBack: 'أهلاً بعودتك يا {name}! تم ملء بياناتك المحفوظة تلقائياً.',
      clearProfile: 'مسح البيانات',
      orderSentTitle: 'تم تجهيز الطلب رقم #{id} وإرساله إلى واتساب!',
      orderSentDesc:
        'تم فتح تطبيق واتساب في نافذة جديدة بتفاصيل طلبك كاملة. أرسل الرسالة إلى رفقة لتأكيد التوصيل.',
      celebrationBadge: 'تم حفظ الطلب في دفتر المطبخ',
      celebrationTitle: 'تم تسجيل طلبك بنجاح! جاري تحويلك إلى واتساب...',
      celebrationSubtitle:
        'وصل طلبك إلى مطبخ رفقة الآن، وجاري فتح واتساب بتفاصيل البوكس الكاملة لتأكيد التوصيل الصباحي.',
      celebrationOrderNo: 'رقم الطلب',
      celebrationTotalLabel: 'إجمالي الطلب',
      celebrationProgress: 'جاري التحويل التلقائي إلى واتساب...',
      openWhatsAppNowBtn: 'إرسال الطلب عبر واتساب الآن',
      itemsInOrder: 'الأصناف المختارة في طلبك الحالي:',
      tailoredBoxesHeading: 'البوكسات المخصصة',
      menuItemsHeading: 'الأصناف المختارة',
      removeBtn: 'حذف',
      subtotal: 'المجموع الفرعي للبوكسات',
      deliveryFee: 'رسوم التوصيل الصباحي',
      freeDeliveryUnlocked: 'مجاني (تجاوزت حد التوصيل المجاني!)',
      giftCardFeeLabel: 'بطاقة إهداء مكتوبة بخط اليد',
      complimentary: 'مجاناً',
      grandTotal: 'الإجمالي النهائي التقديري',
      minOrderWarning: 'الحد الأدنى للطلب هو {min}. يرجى إضافة المزيد من البوكسات لإتمام الطلب.',
      nameLabel: 'الاسم الكامل',
      nameHint: 'الاسم الذي ستسجل به رفقة طلبك',
      namePlaceholder: 'مثال: سلمى بن علي',
      phoneLabel: 'رقم الهاتف (واتساب)',
      phoneHint: 'للتنسيق المباشر عند التوصيل',
      phonePlaceholder: '+20 100 000 0000',
      dateLabel: 'تاريخ التوصيل المفضل',
      slotLabel: 'فترة التوصيل الصباحية',
      slotHint: 'يصل الإفطار دافئاً خلال هذه الفترة الزمنية',
      addressLabel: 'عنوان التوصيل بالتفصيل',
      addressHint: 'المنطقة، الشارع، رقم العقار/الفيلا، علامة مميزة',
      addressPlaceholder: 'مثال: شارع الياسمين، فيلا 3',
      giftCardCheckboxLabel: 'إرفاق بطاقة إهداء مكتوبة بخط اليد مع البوكس',
      noteLabel: 'نص بطاقة الإهداء / ملاحظات خاصة للمطبخ',
      noteHint: 'تكتبها رفقة بخط اليد. يمكنك أيضاً كتابة أي ملاحظات حول الحساسية أو البوابة.',
      notePlaceholder: 'مثال: «كل عام وأنت بخير!» أو «يرجى الاتصال عند الوصول للبوابة»',
      rememberMeLabel: 'حفظ بياناتي على هذا الجهاز للطلبات القادمة',
      confirmWhatsAppBtn: 'تأكيد وإرسال الطلب عبر واتساب',
      busyDisabledBtn: 'المطبخ مكتمل العدد حالياً — الطلبات متوقفة مؤقتاً',
      paymentAssurance:
        'لا يلزم الدفع الإلكتروني المسبق · الدفع نقداً أو بتحويل عند استلام الطلب صباحاً',
      atelierTitle: 'مطبخ لو ماتان الحرفي (L’Atelier)',
      atelierDesc:
        'يُخبز إفطارنا طازجاً كل فجر. نرحب بحجوزات المناسبات الخاصة وتنسيقات الهدايا المسبقة.',
      deliveryZonesTitle: 'مناطق التوصيل',
      morningHoursTitle: 'فترات التوصيل الصباحية',
      dailyCutoffTitle: 'موعد إغلاق الطلبات اليومي',
      dailyCutoffDesc: 'يُغلق باب الحجز لصباح الغد الساعة {cutoff}',
      phoneWhatsAppTitle: 'الهاتف وواتساب',
      emailTitle: 'البريد الإلكتروني',
      eventsBadge: 'الحفلات وطلبات الشركات',
      eventsTitle: 'بوفيهات برانش للمناسبات من 10 إلى 100 ضيف',
      eventsDesc:
        'هل تخطط لحفل خطوبة، استقبال مولود، أو إفطار عمل للشركات؟ نصمم طاولات مخبوزات وفواكه وقهوة متكاملة. تواصل معنا قبل 48 ساعة على الأقل.',
    },
    footer: {
      topStripPrefix: 'توصيل صباحي يومي · آخر موعد لحجز طلبات الغد الساعة',
      manifesto:
        'بوكسات إفطار فرنسية ريفية ومخبوزات حرفية تُحضر بالزبدة الطبيعية والتخمير البطيء. تُخبز مع الفجر وتُوصل دافئة لباب منزلك.',
      devotion: 'صُنع بشغف وحب منذ ٢٠٢٢',
      navigationTitle: 'روابط سريعة',
      directContactTitle: 'التواصل المباشر وحساباتنا',
      chatOnWhatsApp: 'تحدث معنا عبر واتساب',
      facebookPage: 'صفحتنا على فيسبوك',
      instagramPage: 'إنستغرام',
      rightsReserved: 'جميع الحقوق محفوظة.',
      madeWithLove: 'صُنع في المنزل بكل حب',
    },
  },
} as const

// ── Optional Bilingual Dictionary for Seed Catalog Entities ──────────────────
const SEED_CATEGORY_AR: Record<string, { name: string; description: string }> = {
  'cat-couples': {
    name: 'صواني وبوكسات لشخصين',
    description: 'ولائم إفطار صباحية غنية وصواني خشبية مصممة للمشاركة الدافئة بين شخصين.',
  },
  'cat-individual': {
    name: 'بوكسات فردية',
    description: 'بوكسات صباحية متكاملة ومشبعة مصممة لبداية يوم هادئة ومفعمة بالحيوية.',
  },
  'cat-prestige': {
    name: 'بوكسات الاحتفالات الفاخرة',
    description: 'سلال إفطار ملكية للمناسبات الخاصة مع حلويات فرنسية وباقات زهور طبيعية.',
  },
}

const SEED_BOX_AR: Record<string, { name: string; description: string }> = {
  'box-couples-tray': {
    name: 'صينية الزوجين (Le Grand Matin)',
    description:
      'وليمة الإفطار المميزة لشخصين. تضم كرواسون حرفي، بيض مزرعة طازج، عصائر طبيعية، وقهوة بالحليب ساخنة، مغلفة بشريط حريري وبطاقة إهداء.',
  },
  'box-healthy-garden': {
    name: 'البوكس الصحي النباتي (Le Jardin)',
    description:
      'طقس صباحي صحي ومنعش. خبز الحبوب الكاملة، أطباق الجرانولا والأساي، عصير ديتوكس أخضر بارد، وإضافات غنية بالعناصر الغذائية.',
  },
  'box-executive-solo': {
    name: 'بوكس الصباح التنفيذي الفردي',
    description:
      'مصمم لصباحات العمل المركزة. مخبوزات فرنسية بالزبدة، بيض مخفوق غني بالبروتين، عصير برتقال طازج، وقهوة مختصة ساخنة.',
  },
  'box-brunch-romance': {
    name: 'بوكس برانش الرومانسية الفاخر',
    description:
      'مصمم لأعياد الزواج والميلاد والصباحات الرومانسية. بريوش فرنسي مكرمل، حلويات الباتيسيري، وباقة زهور طبيعية منعشة.',
  },
  'box-anniversary-luxury': {
    name: 'بوكس الاحتفال الملكي (L’Anniversaire Royal)',
    description:
      'قمة الفخامة للاحتفالات. أومليت بالكمأة والأعشاب، برج ماكرون باريسي، بودنغ الشوكولاتة الداكنة، وباقة ورد جوري.',
  },
}

const SEED_COMPONENT_AR: Record<string, string> = {
  'comp-1-1': 'اختيار الكرواسون',
  'comp-1-2': 'تحضير البيض',
  'comp-1-3': 'المربى والدهن الحرفي',
  'comp-1-4': 'عصير الصباح الطازج',
  'comp-1-5': 'المشروب الساخن',
  'comp-2-1': 'قاعدة الخبز العضوي',
  'comp-2-2': 'طبق الصباح الصحي',
  'comp-2-3': 'العصير الطبيعي المعصور على البارد',
  'comp-2-4': 'الإضافة الجانبية الطازجة',
  'comp-3-1': 'مخبوزات الصباح',
  'comp-3-2': 'طبق البروتين الأساسي',
  'comp-3-3': 'عصير الحمضيات الطازج',
  'comp-3-4': 'القهوة الساخنة',
  'comp-4-1': 'المخبوزات الدافئة الرئيسية',
  'comp-4-2': 'حلوى الباتيسيري الفرنسي',
  'comp-4-3': 'باقة الزهور الطبيعية',
  'comp-5-1': 'الطبق المالح الفاخر',
  'comp-5-2': 'ثنائي المخبوزات الحرفية',
  'comp-5-3': 'ختام الحلويات الاحتفالية',
  'comp-5-4': 'هدية الورد الطبيعي',
}

const SEED_ITEM_AR: Record<string, { name: string; description?: string }> = {
  'item-croissant-butter': {
    name: 'كرواسون بالزبدة الفرنسية',
    description: 'كرواسون مورّق من 72 طبقة مخبوز بالزبدة الفرنسية الطبيعية',
  },
  'item-croissant-turkey': {
    name: 'كرواسون ديك رومي مدخن وجبن إيمنتال',
    description: 'شرائح ديك رومي مدخن دافئة مع جبن إيمنتال السويسري الذائب',
  },
  'item-croissant-salami': {
    name: 'كرواسون سلامي مدخن وخردل ديجون',
    description: 'سلامي بقري فاخر مع خردل الحبوب الكاملة المعتق',
  },
  'item-croissant-pistachio': {
    name: 'كرواسون كريمة الفستق الصقلي',
    description: 'محشو بكريمة الفستق المحمص الغنية',
  },
  'item-rye-bread': {
    name: 'خبز الجاودار الريفي بالبذور',
    description: 'خبز ساوردو عضوي ببذور اليقطين والكتان',
  },
  'item-gluten-free-bread': {
    name: 'خبز الحنطة السوداء (خالي من الغلوتين)',
    description: 'خبز حبوب قديمة حرفي مخبوز طازجاً',
  },
  'item-sourdough': {
    name: 'شرائح خبز الساوردو الريفي',
    description: 'مخمّر ببطء لمدة 24 ساعة على الطريقة الفرنسية',
  },
  'item-brioche-french-toast': {
    name: 'فرنش توست بريوش بالتوت البري',
    description: 'بريوش سميك مكرمل مع التوت الطازج',
  },
  'item-vanilla-waffles': {
    name: 'وافل بلجيكي بالفانيليا وشراب القيقب',
    description: 'وافل مقرمش بسكر اللؤلؤ مع شراب القيقب الكندي',
  },
  'item-bostock-almond': {
    name: 'بريوش بوستوك بكريمة اللوز وزهر البرتقال',
    description: 'بريوش مشرب بماء الزهر ومخبوز بكريمة اللوز',
  },
  'item-scrambled-eggs': {
    name: 'بيض مخفوق كريمي بالأعشاب الطازجة',
    description: 'بيض مزرعة طازج مطهو ببطء مع الثوم المعمر والزبدة',
  },
  'item-poached-avocado': {
    name: 'بيض بوشيه مع الأفوكادو المهروس',
    description: 'مع طماطم كرزية متبلة وبذور السمسم المحمصة',
  },
  'item-truffle-omelette': {
    name: 'أومليت الفطر البري وزيت الكمأة',
    description: 'أومليت فرنسي مطوي بجبن غرويير وزيت الكمأة البيضاء',
  },
  'item-smoked-salmon': {
    name: 'سلمون إسكتلندي مدخن وكريمة الشبت',
    description: 'شرائح سلمون فاخرة مع الكبر والليمون',
  },
  'item-avocado-hemp': {
    name: 'تارتين الأفوكادو وبذور القنب والليمون',
    description: 'أفوكادو ناضج مع زيت زيتون بكر ممتاز ورقائق الفلفل',
  },
  'item-heirloom-feta': {
    name: 'طماطم كرزية وجبن فيتا مخفوق بالريحان',
    description: 'جبن فيتا كريمي مع ريحان طازج وخل بلسمك معتق',
  },
  'item-greek-granola': {
    name: 'زبادي يوناني وجرانولا منزلية بالعسل',
    description: 'زبادي كامل الدسم مع شوفان محمص بالعسل والمكسرات',
  },
  'item-chia-pudding': {
    name: 'بودنغ الشيا بحليب جوز الهند والمانجو',
    description: 'منكّه بفانيليا مدغشقر الطبيعية وبيوريه المانجو',
  },
  'item-acai-bowl': {
    name: 'طبق الأساي البرازيلي بالفواكه',
    description: 'ممزوج بالموز ومغطى برقائق جوز الهند والكاكاو الخام',
  },
  'item-panna-cotta-straw': {
    name: 'ثنائي بانا كوتا الفراولة والفانيليا',
    description: 'كريمة حريرية مطبوخة بالفانيليا مع صوص الفراولة الطازجة',
  },
  'item-chocolate-lava': {
    name: 'أكواب لافا الشوكولاتة الفاخرة (70%)',
    description: 'شوكولاتة داكنة فاخرة بقلب البندق السائل',
  },
  'item-macaron-tower': {
    name: 'ثنائي ماكرون التوت الباريسي',
    description: 'ماكرون لوز مقرمش بحشوة غاناش التوت الأحمر',
  },
  'item-fig-jam': {
    name: 'مربى التين الأسود والجوز المحمص',
    description: 'تين مطهو ببطء على الطريقة التقليدية مع الجوز',
  },
  'item-raw-honey': {
    name: 'عسل أزهار برية جبلي خام',
    description: 'عسل طبيعي غير مفلتر من المناحل الجبلية',
  },
  'item-almond-butter': {
    name: 'زبدة اللوز المحمص المطحونة بالحجر',
    description: 'لوز محمص 100% مع لمسة من ملح البحر',
  },
  'item-orange-juice': {
    name: 'عصير برتقال طبيعي معصور فجراً',
    description: 'برتقال موسمي حلو يُعصر طازجاً كل صباح',
  },
  'item-strawberry-juice': {
    name: 'عصير فراولة ونعناع معصور على البارد',
    description: 'فراولة طازجة مع أوراق النعناع الأخضر',
  },
  'item-green-detox': {
    name: 'عصير الديتوكس الأخضر (تفاح، خيار، زنجبيل)',
    description: 'إكسير صباحي منعش وغني بالفيتامينات',
  },
  'item-pomegranate-juice': {
    name: 'عصير رمان طبيعي صافي',
    description: 'غني بمضادات الأكسدة الطبيعية',
  },
  'item-cafe-lait': {
    name: 'قهوة بالحليب الساخن (ترمس حافظ للحرارة)',
    description: 'قهوة مختصة مع حليب كامل الدسم مبخر',
  },
  'item-cappuccino': {
    name: 'كابتشينو دبل شوت غني بالرغوة',
    description: 'إسبريسو غني مع رغوة الحليب المخملية ورشة كاكاو',
  },
  'item-hot-chocolate': {
    name: 'شوكولاتة ساخنة على الطريقة الباريسية',
    description: 'غاناش الشوكولاتة الداكنة الذائبة مع لمسة قرفة',
  },
  'item-filter-coffee': {
    name: 'قهوة مقطرة سوداء (Pour-Over)',
    description: 'تحميص إثيوبي فاخر، تُقدم ساخنة بدون حليب',
  },
  'item-flower-posy': {
    name: 'باقة زهور الياسمين والأوكالبتوس الطازجة',
    description: 'زهور صباحية مربوطة يدوياً بخيوط الرافيا الطبيعية',
  },
  'item-rose-posy': {
    name: 'باقة ورد جوري وردي فاخر',
    description: 'ورود فرنسية عطرة مغلفة بورق الكرافت',
  },
}

export const localizeCategory = (
  cat: { id: string; name: string; description?: string; name_en?: string; name_ar?: string; description_en?: string; description_ar?: string },
  lang: Language
) => {
  const enName = cat.name_en || cat.name
  const enDesc = cat.description_en || cat.description
  if (lang === 'ar') {
    const arName = cat.name_ar || SEED_CATEGORY_AR[cat.id]?.name || enName
    const arDesc = cat.description_ar || SEED_CATEGORY_AR[cat.id]?.description || enDesc
    return { name: arName, description: arDesc }
  }
  return { name: enName, description: enDesc }
}

export const localizeBox = (
  box: { id: string; name: string; description: string; name_en?: string; name_ar?: string; description_en?: string; description_ar?: string },
  lang: Language
) => {
  const enName = box.name_en || box.name
  const enDesc = box.description_en || box.description
  if (lang === 'ar') {
    const arName = box.name_ar || SEED_BOX_AR[box.id]?.name || enName
    const arDesc = box.description_ar || SEED_BOX_AR[box.id]?.description || enDesc
    return { name: arName, description: arDesc }
  }
  return { name: enName, description: enDesc }
}

export const localizeComponentName = (
  comp: { id: string; name: string; name_en?: string; name_ar?: string },
  lang: Language
): string => {
  const enName = comp.name_en || comp.name
  if (lang === 'ar') {
    return comp.name_ar || SEED_COMPONENT_AR[comp.id] || enName
  }
  return enName
}

export const localizeItem = (
  item: { id: string; name: string; description?: string; name_en?: string; name_ar?: string; description_en?: string; description_ar?: string },
  lang: Language
) => {
  const enName = item.name_en || item.name
  const enDesc = item.description_en || item.description
  if (lang === 'ar') {
    const arName = item.name_ar || SEED_ITEM_AR[item.id]?.name || enName
    const arDesc = item.description_ar || SEED_ITEM_AR[item.id]?.description || enDesc
    return { name: arName, description: arDesc }
  }
  return { name: enName, description: enDesc }
}

/**
 * Primary Localization Hook for Components
 */
export const useTranslation = () => {
  const { activeLanguage, setActiveLanguage, toggleActiveLanguage } = useSiteSettingsStore(
    useShallow((state) => ({
      activeLanguage: state.activeLanguage,
      setActiveLanguage: state.setActiveLanguage,
      toggleActiveLanguage: state.toggleActiveLanguage,
    }))
  )

  const t = TRANSLATIONS[activeLanguage]
  const isRTL = activeLanguage === 'ar'

  return {
    t,
    lang: activeLanguage,
    isRTL,
    setLanguage: setActiveLanguage,
    toggleLanguage: toggleActiveLanguage,
  }
}

