-- Cloud catalog, cached settings and validated guest checkout.
BEGIN;
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
