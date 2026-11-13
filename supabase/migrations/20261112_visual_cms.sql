-- Visual CMS additions; safe for an existing settings installation.
BEGIN;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_display_mode TEXT NOT NULL DEFAULT 'text_only';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT NOT NULL DEFAULT '/favicon.svg';
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
COMMIT;
