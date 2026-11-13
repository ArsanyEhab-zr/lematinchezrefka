BEGIN;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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



COMMIT;
