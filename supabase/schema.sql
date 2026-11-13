BEGIN;
-- ==============================================================================
-- Le Matin chez Refka — Supabase Relational Schema
-- Architecture Overhaul: Pure Box Model & Internal Ingredients Inventory
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Box Categories (e.g. "Couples Trays", "Individual Boxes", "Prestige Celebrations")
CREATE TABLE IF NOT EXISTS public.box_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Items Catalog (STRICTLY Internal Ingredients & Components Inventory)
-- Individual items are never sold standalone; they exist only as box components / swaps.
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('bakery', 'savory', 'dairy', 'beverage', 'sweet', 'fruit', 'extra')),
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true NOT NULL,
    is_sold_out BOOLEAN DEFAULT false NOT NULL, -- Stock control: out-of-stock items cannot be swapped in BoxBuilder
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Breakfast Boxes Table (The ONLY customer-facing products)
CREATE TABLE IF NOT EXISTS public.boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.box_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_sold_out BOOLEAN DEFAULT false NOT NULL, -- Stock control: sold-out boxes are disabled on the menu
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Box Components (Slots / Steps within a box)
CREATE TABLE IF NOT EXISTS public.box_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g. "Croissant Filling", "Fresh Morning Juice"
    default_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    is_swappable BOOLEAN DEFAULT true NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Swap Options (Permitted alternative items with price adjustments)
-- price_modifier: positive values add to box price (+15.00), negative values discount the box (-10.00)
CREATE TABLE IF NOT EXISTS public.swap_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID NOT NULL REFERENCES public.box_components(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    price_modifier NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_component_item UNIQUE (component_id, item_id)
);

-- ==============================================================================
-- Indexes for Optimal Relational Traversal & Fast Queries
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_box_categories_display_order ON public.box_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_boxes_category_id ON public.boxes(category_id);
CREATE INDEX IF NOT EXISTS idx_boxes_is_active ON public.boxes(is_active);
CREATE INDEX IF NOT EXISTS idx_boxes_is_sold_out ON public.boxes(is_sold_out);
CREATE INDEX IF NOT EXISTS idx_items_is_sold_out ON public.items(is_sold_out);
CREATE INDEX IF NOT EXISTS idx_box_components_box_id ON public.box_components(box_id);
CREATE INDEX IF NOT EXISTS idx_box_components_default_item ON public.box_components(default_item_id);
CREATE INDEX IF NOT EXISTS idx_swap_options_component_id ON public.swap_options(component_id);
CREATE INDEX IF NOT EXISTS idx_swap_options_item_id ON public.swap_options(item_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);

-- ==============================================================================
-- Automatic updated_at Trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_boxes_updated_at ON public.boxes;
CREATE TRIGGER trigger_boxes_updated_at
    BEFORE UPDATE ON public.boxes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_items_updated_at ON public.items;
CREATE TRIGGER trigger_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_box_components_updated_at ON public.box_components;
CREATE TRIGGER trigger_box_components_updated_at
    BEFORE UPDATE ON public.box_components
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.box_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_options ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated users can read categories, active boxes, components & available swaps
DROP POLICY IF EXISTS "Public read box categories" ON public.box_categories;
CREATE POLICY "Public read box categories" ON public.box_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read active boxes" ON public.boxes;
CREATE POLICY "Public read active boxes" ON public.boxes
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read items" ON public.items;
CREATE POLICY "Public read items" ON public.items
    FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "Public read box components" ON public.box_components;
CREATE POLICY "Public read box components" ON public.box_components
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read swap options" ON public.swap_options;
CREATE POLICY "Public read swap options" ON public.swap_options
    FOR SELECT USING (true);

-- Authenticated Staff / Admin can manage all records
DROP POLICY IF EXISTS "Admin full access box_categories" ON public.box_categories;
CREATE POLICY "Admin full access box_categories" ON public.box_categories
    FOR ALL TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin full access boxes" ON public.boxes;
CREATE POLICY "Admin full access boxes" ON public.boxes
    FOR ALL TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin full access items" ON public.items;
CREATE POLICY "Admin full access items" ON public.items
    FOR ALL TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin full access box_components" ON public.box_components;
CREATE POLICY "Admin full access box_components" ON public.box_components
    FOR ALL TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin full access swap_options" ON public.swap_options;
CREATE POLICY "Admin full access swap_options" ON public.swap_options
    FOR ALL TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==============================================================================
-- 7. Global Site & Kitchen Settings Table (Single-Row Configuration Pattern)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Guarantees single-row global config
    -- Localization Settings
    -- Visitor activeLanguage is device-local; only defaultLanguage is shared.
    default_language VARCHAR(5) DEFAULT 'en' NOT NULL CHECK (default_language IN ('ar', 'en')),
    enable_language_switcher BOOLEAN DEFAULT true NOT NULL,

    -- Contact & Order Dispatch
    whatsapp_number VARCHAR(30) DEFAULT '201000000000' NOT NULL CHECK (whatsapp_number ~ '^[1-9][0-9]{7,14}$'),
    facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1bNFTkMPTL/' NOT NULL,
    instagram_url TEXT DEFAULT 'https://www.instagram.com/lematin.refka' NOT NULL,
    whatsapp_header_note_ar TEXT DEFAULT 'صباح الخير رفقة! أود طلب بوكس إفطار من Le Matin chez Refka:' NOT NULL,
    whatsapp_header_note_en TEXT DEFAULT 'Bonjour Refka! I would like to place a breakfast box order from Le Matin chez Refka:' NOT NULL,

    -- Delivery & Pricing Rules
    delivery_fee NUMERIC(10, 2) DEFAULT 40.00 NOT NULL CHECK (delivery_fee >= 0),
    free_delivery_threshold NUMERIC(10, 2) DEFAULT 600.00 NOT NULL CHECK (free_delivery_threshold >= 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 150.00 NOT NULL CHECK (min_order_amount >= 0),

    -- Kitchen & Scheduling Controls
    is_accepting_orders BOOLEAN DEFAULT true NOT NULL,
    busy_mode_message_ar TEXT DEFAULT 'مطبخنا مكتمل العدد لصباح الغد! نعتذر عن استقبال طلبات جديدة حالياً، ونسعد بخدمتكم قريباً.' NOT NULL,
    busy_mode_message_en TEXT DEFAULT 'Our kitchen is fully booked for tomorrow morning! We are temporarily pausing new orders and will reopen shortly.' NOT NULL,
    daily_cutoff_time VARCHAR(20) DEFAULT '20:00' NOT NULL CHECK (daily_cutoff_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    delivery_time_slots TEXT[] DEFAULT ARRAY['07:00 AM - 09:00 AM', '09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM'] NOT NULL,

    CONSTRAINT delivery_slots_not_empty CHECK (cardinality(delivery_time_slots) > 0),

    -- Gifting & Storefront Promo
    enable_gift_cards BOOLEAN DEFAULT true NOT NULL,
    gift_card_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (gift_card_fee >= 0),
    announcement_bar_active BOOLEAN DEFAULT true NOT NULL,
    announcement_text_ar TEXT DEFAULT 'بوكسات إفطار فرنسية ريفية تُخبز فجراً وتُوصل دافئة لباب منزلك · اطلب قبل 8 مساءً' NOT NULL,
    announcement_text_en TEXT DEFAULT 'Handcrafted breakfast boxes baked at dawn & delivered warm · Order by 8:00 PM · Free delivery over 600 EGP' NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings" ON public.site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update site settings" ON public.site_settings;
CREATE POLICY "Admin update site settings" ON public.site_settings
    FOR UPDATE TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
REVOKE ALL ON public.site_settings FROM anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;


-- Seed singleton row if not exists
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;



-- Visual CMS additions; safe for an existing settings installation.
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '/brand-logo.png';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_display_mode TEXT NOT NULL DEFAULT 'both';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT NOT NULL DEFAULT '/brand-logo.png';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_title_en TEXT NOT NULL DEFAULT 'Le Matin chez Refka — Fait maison, avec amour';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_title_ar TEXT NOT NULL DEFAULT 'لو ماتان شي رفقة — صنع منزلي بكل حب';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS story_image_1_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS story_image_2_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS story_image_3_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=800&q=80';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tiktok_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_maps_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT 'bonjour@lematin-refka.com';
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_logo_display_mode_check;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_logo_display_mode_check
  CHECK (logo_display_mode IN ('text_only', 'image_only', 'both'));
-- Empty WhatsApp numbers hide the channel on the storefront.
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_whatsapp_number_check;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_whatsapp_number_check
  CHECK (whatsapp_number = '' OR whatsapp_number ~ '^[1-9][0-9]{7,14}$');

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL CHECK (length(image_url) > 0),
  title_en TEXT NOT NULL CHECK (length(trim(title_en)) BETWEEN 1 AND 200),
  title_ar TEXT NOT NULL CHECK (length(trim(title_ar)) BETWEEN 1 AND 200),
  tag_en TEXT NOT NULL DEFAULT '',
  tag_ar TEXT NOT NULL DEFAULT '',
  aspect_ratio TEXT NOT NULL DEFAULT 'tall' CHECK (aspect_ratio IN ('tall', 'square', 'wide')),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0 CHECK (display_order >= 0)
);
CREATE INDEX IF NOT EXISTS gallery_items_display_order_idx ON public.gallery_items(display_order);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read gallery" ON public.gallery_items;
CREATE POLICY "Public read gallery" ON public.gallery_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage gallery" ON public.gallery_items;
CREATE POLICY "Admin manage gallery" ON public.gallery_items FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
REVOKE ALL ON public.gallery_items FROM anon, authenticated;
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;

-- Replace and reorder together: a failed insert rolls back the entire publication.
CREATE OR REPLACE FUNCTION public.replace_gallery(photos JSONB)
RETURNS VOID LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF jsonb_typeof(photos) <> 'array' OR photos IS NULL THEN
    RAISE EXCEPTION 'Expected a gallery array';
  END IF;
  LOCK TABLE public.gallery_items IN EXCLUSIVE MODE;
  DELETE FROM public.gallery_items;
  INSERT INTO public.gallery_items(id, image_url, title_en, title_ar, tag_en, tag_ar, aspect_ratio, is_visible, display_order)
    SELECT id, image_url, title_en, title_ar, tag_en, tag_ar, aspect_ratio, is_visible, display_order
    FROM jsonb_to_recordset(photos) AS photo(id UUID, image_url TEXT, title_en TEXT, title_ar TEXT, tag_en TEXT, tag_ar TEXT, aspect_ratio TEXT, is_visible BOOLEAN, display_order INT);
END;
$$;
REVOKE ALL ON FUNCTION public.replace_gallery(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_gallery(JSONB) TO authenticated;

-- Public artwork bucket. Only trusted admin-role accounts may upload or modify files.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-media', 'brand-media', true, 1048576, ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/x-icon'])
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Admin manage brand media" ON storage.objects;
CREATE POLICY "Admin manage brand media" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'brand-media' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'brand-media' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

INSERT INTO public.gallery_items (id, image_url, title_en, title_ar, tag_en, tag_ar, aspect_ratio, is_visible, display_order) VALUES
('00000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=1200&q=75', 'Tulips & granola', 'توليب وجرانولا', 'Mother’s Day', 'عيد الأم', 'tall', true, 0),
('00000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=75', 'Croissants at 5 a.m.', 'كرواسون الخامسة صباحاً', 'Office morning', 'صباح المكتب', 'square', true, 1),
('00000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=75', 'Brioche French toast', 'توست بريوش فرنسي', 'Anniversary', 'ذكرى سنوية', 'tall', true, 2),
('00000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1200&q=75', 'Red-fruit tarts', 'تارت الفواكه الحمراء', 'Sunday lunch', 'غداء الأحد', 'wide', true, 3),
('00000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=75', 'Panna cotta jars', 'أكواب بانا كوتا', 'Baby shower', 'استقبال مولود', 'tall', true, 4),
('00000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1200&q=75', 'Figs & fromages', 'تين وأجبان', 'Family brunch', 'برانش عائلي', 'square', true, 5),
('00000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=75', 'Blueberry pancakes', 'بان كيك بالتوت الأزرق', 'Birthday surprise', 'مفاجأة عيد ميلاد', 'tall', true, 6),
('00000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=75', 'Pain de campagne', 'خبز ريفي', 'Weekend order', 'طلب نهاية الأسبوع', 'wide', true, 7),
('00000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=75', 'Rose cupcakes', 'كب كيك الورد', 'Engagement', 'خطوبة', 'tall', true, 8),
('00000000-0000-4000-8000-00000000000a', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=1200&q=75', 'Le Jardin box', 'بوكس الحديقة', 'Wellness morning', 'صباح صحي', 'tall', true, 9),
('00000000-0000-4000-8000-00000000000b', 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=75', 'Le Grand Matin', 'الصباح الكبير', 'Guests in town', 'ضيوف المدينة', 'square', true, 10),
('00000000-0000-4000-8000-00000000000c', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=75', 'Maple pancakes', 'بان كيك بشراب القيقب', 'Lazy Sunday', 'أحد هادئ', 'tall', true, 11)
ON CONFLICT (id) DO NOTHING;
-- Cloud catalog, cached settings and validated guest checkout.
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS catalog_seeded boolean NOT NULL DEFAULT false;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(config) = 'object');

DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['box_categories','items','boxes','box_components','swap_options','gallery_items'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()', tab);
    EXECUTE format('DROP TRIGGER IF EXISTS cloud_updated_at ON public.%I', tab);
    EXECUTE format('CREATE TRIGGER cloud_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', tab);
    IF tab <> 'gallery_items' THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS local_id text UNIQUE', tab);
    END IF;
    IF tab NOT IN ('swap_options','gallery_items') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS name_en text NOT NULL DEFAULT '''', ADD COLUMN IF NOT EXISTS name_ar text NOT NULL DEFAULT ''''', tab);
      EXECUTE format('UPDATE public.%I SET name_en = name, name_ar = name WHERE name_en = ''''', tab);
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admin full access ' || tab, tab);
    EXECUTE format('DROP POLICY IF EXISTS "Cloud admin access" ON public.%I', tab);
    EXECUTE format('CREATE POLICY "Cloud admin access" ON public.%I FOR ALL TO authenticated USING ((SELECT auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') WITH CHECK ((SELECT auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')', tab);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', tab);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', tab);
  END LOOP;
END $$;
ALTER TABLE public.boxes ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS description_ar text NOT NULL DEFAULT '';
UPDATE public.boxes SET description_en = description, description_ar = description WHERE description_en = '';

-- One transaction for related mutations. Identifiers are restricted to this fixed allowlist.
CREATE OR REPLACE FUNCTION public.apply_catalog_changes(changes jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE tab text; row_data jsonb; columns_sql text; values_sql text; updates_sql text;
BEGIN
  IF COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' THEN RAISE EXCEPTION 'Admin access required'; END IF;
  FOREACH tab IN ARRAY ARRAY['box_categories','items','boxes','box_components','swap_options','gallery_items'] LOOP
    FOR row_data IN SELECT value FROM jsonb_array_elements(COALESCE(changes -> 'upserts' -> tab, '[]'::jsonb)) LOOP
      SELECT string_agg(format('%I', a.attname), ',' ORDER BY a.attnum),
             string_agg(format('r.%I', a.attname), ',' ORDER BY a.attnum),
             string_agg(format('%I = EXCLUDED.%I', a.attname, a.attname), ',' ORDER BY a.attnum) FILTER (WHERE a.attname <> 'id')
      INTO columns_sql, values_sql, updates_sql
      FROM pg_catalog.pg_attribute a
      WHERE a.attrelid = format('public.%I', tab)::regclass AND a.attnum > 0 AND NOT a.attisdropped
        AND a.attname NOT IN ('created_at','updated_at') AND row_data ? a.attname;
      IF NOT row_data ? 'id' OR updates_sql IS NULL THEN RAISE EXCEPTION 'Invalid catalog row'; END IF;
      EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::public.%I, $1) r ON CONFLICT (id) DO UPDATE SET %s', tab, columns_sql, values_sql, tab, updates_sql) USING row_data;
    END LOOP;
  END LOOP;
  FOREACH tab IN ARRAY ARRAY['swap_options','box_components','boxes','items','box_categories','gallery_items'] LOOP
    EXECUTE format('DELETE FROM public.%I WHERE id IN (SELECT value::uuid FROM jsonb_array_elements_text($1))', tab)
      USING COALESCE(changes -> 'deletes' -> tab, '[]'::jsonb);
  END LOOP;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(COALESCE(changes -> 'upserts', '{}') || COALESCE(changes -> 'deletes', '{}')) k WHERE k <> 'gallery_items') THEN
    UPDATE public.site_settings SET catalog_seeded = true WHERE id = 1;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.apply_catalog_changes(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_catalog_changes(jsonb) TO authenticated;

-- Only public settings are accepted. Browser credentials never enter this row.
CREATE OR REPLACE FUNCTION public.save_site_settings(patch jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE mapped jsonb := '{}'; entry record; column_name text; assignments text;
BEGIN
  IF COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF jsonb_typeof(patch) <> 'object' THEN RAISE EXCEPTION 'Expected settings object'; END IF;
  FOR entry IN SELECT key, value FROM jsonb_each(patch) LOOP
    column_name := lower(regexp_replace(entry.key, '([A-Z])', '_\1', 'g'));
    column_name := regexp_replace(column_name, 'image([0-9])', 'image_\1');
    IF column_name IN ('id','config','updated_at') OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid = 'public.site_settings'::regclass AND attname = column_name AND attnum > 0 AND NOT attisdropped) THEN
      RAISE EXCEPTION 'Unknown public setting: %', entry.key;
    END IF;
    mapped := mapped || jsonb_build_object(column_name, entry.value);
  END LOOP;
  SELECT string_agg(format('%I = r.%I', key, key), ',') INTO assignments FROM jsonb_object_keys(mapped) AS keys(key);
  IF assignments IS NOT NULL THEN
    EXECUTE 'UPDATE public.site_settings s SET ' || assignments || ', config = s.config || $2 FROM jsonb_populate_record(NULL::public.site_settings, $1) r WHERE s.id = 1' USING mapped, patch;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.save_site_settings(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_site_settings(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.seed_storefront(catalog jsonb, settings jsonb)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  PERFORM public.apply_catalog_changes(jsonb_build_object('upserts', catalog));
  PERFORM public.save_site_settings(settings);
END $$;
REVOKE ALL ON FUNCTION public.seed_storefront(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_storefront(jsonb, jsonb) TO authenticated;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL CHECK (length(trim(customer_name)) BETWEEN 1 AND 200),
  customer_phone text NOT NULL CHECK (customer_phone ~ '^\+?[0-9 ()-]{8,22}$'),
  customer_address text NOT NULL CHECK (length(trim(customer_address)) BETWEEN 1 AND 2000),
  delivery_date date NOT NULL,
  delivery_slot text NOT NULL,
  items_json jsonb NOT NULL CHECK (jsonb_typeof(items_json) = 'object'),
  requested_boxes jsonb NOT NULL CHECK (jsonb_typeof(requested_boxes) = 'array' AND jsonb_array_length(requested_boxes) BETWEEN 1 AND 50),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  delivery_fee numeric(10,2) NOT NULL CHECK (delivery_fee >= 0),
  gift_card_note text NOT NULL DEFAULT '' CHECK (length(gift_card_note) <= 2000),
  gift_requested boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','preparing','delivered')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT UPDATE(status) ON public.orders TO authenticated;
DROP POLICY IF EXISTS "Guest checkout insert" ON public.orders;
CREATE POLICY "Guest checkout insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
DROP POLICY IF EXISTS "Staff read orders" ON public.orders;
CREATE POLICY "Staff read orders" ON public.orders FOR SELECT TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Staff update orders" ON public.orders;
CREATE POLICY "Staff update orders" ON public.orders FOR UPDATE TO authenticated USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE INDEX IF NOT EXISTS orders_delivery_status_idx ON public.orders(delivery_date, status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
DROP TRIGGER IF EXISTS cloud_orders_updated_at ON public.orders;
CREATE TRIGGER cloud_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Runs with the caller's public catalog privileges. No privileged guest RPC or order SELECT.
CREATE OR REPLACE FUNCTION public.validate_checkout_order()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  settings public.site_settings;
  requested jsonb;
  box public.boxes;
  component public.box_components;
  chosen uuid;
  item_ok boolean;
  modifier numeric;
  unit_price numeric;
  subtotal numeric := 0;
  shipping numeric;
  gift_fee numeric;
  quantity integer;
  cairo_now timestamp := now() AT TIME ZONE 'Africa/Cairo';
  earliest date;
  canonical jsonb := '[]';
  detail jsonb;
  details jsonb;
  lines jsonb := '[]';
  count_components integer;
  box_note text;
  order_note text;
BEGIN
  SELECT * INTO STRICT settings FROM public.site_settings WHERE id = 1;
  IF NOT settings.is_accepting_orders THEN RAISE EXCEPTION 'The kitchen is not accepting orders'; END IF;
  earliest := cairo_now::date + CASE WHEN cairo_now::time >= settings.daily_cutoff_time::time THEN 2 ELSE 1 END;
  IF NEW.delivery_date < earliest OR NEW.delivery_date > cairo_now::date + 365 OR NOT NEW.delivery_slot = ANY(settings.delivery_time_slots) THEN RAISE EXCEPTION 'Choose an available delivery date and slot'; END IF;
  IF NEW.order_number <> 'LM-' || NEW.id::text THEN RAISE EXCEPTION 'Invalid order reference'; END IF;
  IF octet_length(NEW.items_json::text) > 100000 OR length(COALESCE(NEW.items_json ->> 'note','')) > 30000 THEN RAISE EXCEPTION 'Order details too large'; END IF;
  FOR requested IN SELECT value FROM jsonb_array_elements(NEW.requested_boxes) LOOP
    quantity := (requested ->> 'quantity')::integer;
    IF quantity IS NULL OR quantity NOT BETWEEN 1 AND 100 OR (requested ->> 'quantity')::numeric <> quantity THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    SELECT * INTO box FROM public.boxes WHERE id = (requested ->> 'box_id')::uuid AND is_active AND NOT is_sold_out;
    IF NOT FOUND THEN RAISE EXCEPTION 'A selected box is unavailable'; END IF;
    unit_price := box.base_price; details := '[]'; count_components := 0;
    IF jsonb_typeof(requested -> 'swaps') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid swaps'; END IF;
    FOR component IN SELECT * FROM public.box_components WHERE box_id = box.id ORDER BY display_order LOOP
      count_components := count_components + 1;
      chosen := COALESCE((requested -> 'swaps' ->> component.id::text)::uuid, component.default_item_id);
      SELECT true INTO item_ok FROM public.items WHERE id = chosen AND is_available AND NOT is_sold_out;
      IF NOT COALESCE(item_ok, false) THEN RAISE EXCEPTION 'A selected ingredient is unavailable'; END IF;
      modifier := 0;
      IF chosen <> component.default_item_id THEN
        IF NOT component.is_swappable THEN RAISE EXCEPTION 'This component cannot be swapped'; END IF;
        SELECT price_modifier INTO modifier FROM public.swap_options WHERE component_id = component.id AND item_id = chosen;
        IF NOT FOUND THEN RAISE EXCEPTION 'Invalid ingredient swap'; END IF;
      END IF;
      unit_price := unit_price + modifier;
      SELECT jsonb_build_object(
        'componentId', COALESCE(component.local_id, component.id::text),
        'componentName', component.name,
        'componentNameAr', COALESCE(NULLIF(component.name_ar, ''), component.name),
        'itemId', COALESCE(i.local_id, i.id::text),
        'itemName', i.name,
        'itemNameAr', COALESCE(NULLIF(i.name_ar, ''), i.name),
        'priceModifier', modifier,
        'isDefault', chosen = component.default_item_id
      )
      INTO detail FROM public.items i WHERE id = chosen;
      details := details || jsonb_build_array(detail);
    END LOOP;
    IF EXISTS (SELECT 1 FROM jsonb_object_keys(requested -> 'swaps') k WHERE NOT EXISTS (SELECT 1 FROM public.box_components c WHERE c.id::text = k AND c.box_id = box.id)) THEN RAISE EXCEPTION 'Unknown component'; END IF;
    unit_price := GREATEST(0, unit_price);
    subtotal := subtotal + unit_price * quantity;
    box_note := NULLIF(left(btrim(COALESCE(requested ->> 'customNotes', '')), 1000), '');
    canonical := canonical || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'boxId', COALESCE(box.local_id, box.id::text),
      'boxName', box.name,
      'boxNameAr', COALESCE(NULLIF(box.name_ar, ''), box.name),
      'quantity', quantity,
      'basePrice', box.base_price,
      'unitPrice', unit_price,
      'totalPrice', unit_price * quantity,
      'swapDetails', details,
      'selectedSwaps', requested -> 'swaps',
      'customNotes', box_note
    )));
    lines := lines || jsonb_build_array(jsonb_build_object('itemId', COALESCE(box.local_id, box.id::text), 'quantity', quantity));
  END LOOP;
  IF subtotal < settings.min_order_amount OR subtotal <= 0 THEN RAISE EXCEPTION 'Order does not meet the minimum'; END IF;
  shipping := CASE WHEN settings.free_delivery_threshold > 0 AND subtotal >= settings.free_delivery_threshold THEN 0 ELSE settings.delivery_fee END;
  IF NEW.gift_requested AND NOT settings.enable_gift_cards THEN RAISE EXCEPTION 'Gift cards are unavailable'; END IF;
  gift_fee := CASE WHEN NEW.gift_requested THEN settings.gift_card_fee ELSE 0 END;
  IF abs(COALESCE(NEW.total_price, -1) - (subtotal + shipping + gift_fee)) > 0.01 OR abs(COALESCE(NEW.delivery_fee, -1) - shipping) > 0.01 THEN RAISE EXCEPTION 'Pricing changed. Refresh your selection before ordering'; END IF;
  order_note := NULLIF(btrim(COALESCE(NEW.items_json ->> 'note', '')), '');
  NEW.gift_card_note := left(btrim(COALESCE(NEW.gift_card_note, '')), 1000);
  NEW.items_json := jsonb_strip_nulls(jsonb_build_object(
    'lines', lines,
    'customizedBoxes', canonical,
    'giftMessage', NULLIF(NEW.gift_card_note, ''),
    'giftRequested', NEW.gift_requested,
    'note', order_note,
    'pricing', jsonb_build_object('subtotal',subtotal,'delivery',shipping,'giftFee',gift_fee,'total',NEW.total_price)
  ));
  NEW.status := 'pending'; NEW.created_at := now(); NEW.updated_at := now();
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validate_checkout_order() FROM PUBLIC;
DROP TRIGGER IF EXISTS validate_checkout_order ON public.orders;
CREATE TRIGGER validate_checkout_order BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.validate_checkout_order();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

COMMIT;
