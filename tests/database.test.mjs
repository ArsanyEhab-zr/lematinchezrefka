import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const db = new PGlite()
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE SCHEMA storage;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT COALESCE(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated; GRANT EXECUTE ON FUNCTION auth.jwt() TO anon, authenticated;
CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id uuid,bucket_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;`)
const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url),'utf8').replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '')
await db.exec(schema)
await db.exec(schema)
await db.exec(readFileSync(new URL('../supabase/migrations/20261111213200_cloud_sync.sql', import.meta.url), 'utf8'))
console.log('Full schema and upgrade migration apply successfully and can be reapplied')
await db.exec(`SET ROLE authenticated; SET request.jwt.claims = '{"app_metadata":{"role":"admin"}}'`)
const directory = await mkdtemp(join(tmpdir(), 'le-matin-db-fixture-'))
try {
  const outfile = join(directory, 'fixture.mjs')
  await build({ entryPoints: ['tests/catalog-fixture.ts'], bundle: true, platform: 'node', format: 'esm', outfile, define: { 'import.meta.env': '{}' } })
  const fixture = await import(pathToFileURL(outfile).href)
  await db.query('SELECT seed_storefront($1,$2)', [JSON.stringify(fixture.catalog), JSON.stringify(fixture.settings)])
  const count = await db.query('SELECT count(*)::int AS count FROM boxes')
  assert.equal(count.rows[0].count, fixture.catalog.boxes.length)
  console.log('All actual storefront categories, boxes, ingredients, components, swap rules, gallery photos and settings seeded successfully')
} finally { await rm(directory, { recursive: true, force: true }) }
const category='11111111-1111-4111-8111-111111111111', item='22222222-2222-4222-8222-222222222222', box='33333333-3333-4333-8333-333333333333', component='44444444-4444-4444-8444-444444444444', swapItem='55555555-5555-4555-8555-555555555555', swap='66666666-6666-4666-8666-666666666666'
const catalog={box_categories:[{id:category,name:'Test',name_en:'Test',name_ar:'اختبار'}],items:[{id:item,name:'Default',category:'bakery'},{id:swapItem,name:'Swap',category:'bakery'}],boxes:[{id:box,category_id:category,name:'Box',description:'Box',base_price:200,image_url:'https://example.com/image.png'}],box_components:[{id:component,box_id:box,name:'Bread',default_item_id:item,is_swappable:true}],swap_options:[{id:swap,component_id:component,item_id:swapItem,price_modifier:-20}],gallery_items:[]}
await db.query('SELECT seed_storefront($1,$2)',[JSON.stringify(catalog),JSON.stringify({minOrderAmount:150,deliveryFee:40,freeDeliveryThreshold:600,deliveryTimeSlots:['Morning']})])
assert.equal((await db.query('SELECT config->>\'deliveryFee\' fee FROM site_settings')).rows[0].fee,'40')
await db.exec(`SET request.jwt.claims = '{"app_metadata":{"role":"customer"}}'`)
await assert.rejects(db.query('SELECT apply_catalog_changes($1)',[JSON.stringify({upserts:catalog})]),/Admin access/)
await assert.rejects(db.exec(`UPDATE boxes SET base_price=1 WHERE id='${box}' RETURNING id`).then(r=>{assert.equal(r[0].rows.length,1)}))
await db.exec('RESET ROLE; SET ROLE anon')
await assert.rejects(db.exec('SELECT * FROM orders'),/permission denied/)
const order='77777777-7777-4777-8777-777777777777'
const insert = (id,total) => db.query(`INSERT INTO orders(id,order_number,customer_name,customer_phone,customer_address,delivery_date,delivery_slot,items_json,requested_boxes,total_price,delivery_fee) VALUES($1,$2,'Test','201000000000','Address', CURRENT_DATE+3,'Morning','{}',$3,$4,40)`,[id,`LM-${id}`,JSON.stringify([{box_id:box,quantity:1,swaps:{[component]:swapItem}}]),total])
await assert.rejects(insert(order,1),/Pricing changed/)
await insert(order,220)
await db.exec(`RESET ROLE; SET ROLE authenticated; SET request.jwt.claims = '{"app_metadata":{"role":"admin"}}'`)
let result=await db.query('SELECT total_price, items_json FROM orders WHERE id=$1',[order])
assert.equal(Number(result.rows[0].total_price),220)
assert.equal(result.rows[0].items_json.pricing.subtotal,180)
await db.query('UPDATE orders SET status=$1 WHERE id=$2',['preparing',order])
await assert.rejects(db.query('SELECT save_site_settings($1)', [JSON.stringify({supabaseAnonKey:'never-public'})]), /Unknown public setting/)
await db.query('SELECT save_site_settings($1)',[JSON.stringify({isAcceptingOrders:false})])
await db.exec('RESET ROLE; SET ROLE anon')
await assert.rejects(insert('88888888-8888-4888-8888-888888888888',220),/not accepting/)
console.log('Verified atomic seed, settings mapping, admin-only mutations, private orders, guest checkout, negative swaps, pricing checks, busy mode and status update')
await db.close()
