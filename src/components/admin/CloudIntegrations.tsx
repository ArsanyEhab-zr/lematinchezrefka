import { useState } from 'react'
import { Cloud, Database, LogOut, RefreshCw } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useSiteSettingsStore, type IntegrationOverrides } from '@/stores/site-settings-store'
import { useCloudSyncStore } from '@/stores/cloud-sync-store'
import { getSupabase, validateIntegrationConfig, signInStaff, isSupabaseConfigured } from '@/lib/supabase'
import { pushInitialSeed, refreshCloud, retryCloudChanges } from '@/lib/supabase-sync'
import { useTranslation } from '@/data/translations'
import { Button } from '@/components/ui/button'

export const CloudIntegrations = () => {
  const { lang } = useTranslation()
  const text = (en: string, ar: string) => lang === 'ar' ? ar : en
  const integrations = useSiteSettingsStore(state => state.integrations)
  const cloud = useCloudSyncStore(useShallow(state => ({ supabase: state.supabase, cloudinary: state.cloudinary, message: state.message, queue: state.queue.length, isStaff: state.isStaff, lastSync: state.lastSync })))
  const [draft, setDraft] = useState(integrations)
  const [email, setEmail] = useState(''), [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const run = async (work: () => Promise<void>, success: string) => {
    setBusy(true); setMessage('')
    try { await work(); setMessage(success) } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Cloud operation failed.') } finally { setBusy(false) }
  }
  const fields: [keyof IntegrationOverrides, string][] = [
    ['supabaseUrl', 'Supabase project URL'], ['supabaseAnonKey', 'Supabase anon / publishable key'],
    ['cloudinaryCloudName', 'Cloudinary cloud name'], ['cloudinaryUploadPreset', 'Cloudinary unsigned upload preset'],
  ]
  return <section className="space-y-6 rounded-2xl border-2 border-dashed border-[#D9C3A9] bg-[#FDFBF7] p-6 sm:p-8">
    <h2 className="flex items-center gap-3 font-display text-xl font-bold"><Cloud className="text-gold" />{text('Integrations, Cloud Status & Database Seeding', 'التكاملات وحالة السحابة وتهيئة قاعدة البيانات')}</h2>
    <div className="flex flex-wrap gap-3" aria-live="polite">{[['Supabase', cloud.supabase], ['Cloudinary', cloud.cloudinary]].map(([name, state]) => <span key={name} className="rounded-full bg-blush/40 px-4 py-2 text-sm"><strong>{name}</strong> · {state}</span>)}<span className="py-2 text-sm">{cloud.queue} {text('pending changes', 'تغييرات بانتظار المزامنة')}</span></div>
    <p className="text-sm text-olive/75">{text('Blank fields use environment settings. Overrides stay in this browser. Cloudinary is verified after a successful upload. Admin edits sync automatically with Supabase.', 'الحقول الفارغة تستخدم إعدادات البيئة. تُحفظ القيم البديلة في هذا المتصفح. يُتحقق من Cloudinary بعد رفع ناجح. تتم مزامنة تعديلات الإدارة تلقائياً مع Supabase.')}</p>
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); void run(async () => { const clean = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as unknown as IntegrationOverrides; validateIntegrationConfig(clean); useSiteSettingsStore.getState().setIntegrations(clean); await refreshCloud() }, text('Integration settings saved.', 'تم حفظ إعدادات التكامل.')) }}>
      {fields.map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}<input aria-label={label} dir="ltr" type={key === 'supabaseAnonKey' ? 'password' : 'text'} autoComplete="off" value={draft[key]} onChange={event => setDraft(previous => ({ ...previous, [key]: event.target.value }))} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3 font-normal" /></label>)}
      <Button disabled={busy} type="submit">{text('Save integration settings', 'حفظ إعدادات التكامل')}</Button>
    </form>
    {isSupabaseConfigured() && !cloud.isStaff && <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); void run(async () => { await signInStaff(email, password); setPassword(''); await retryCloudChanges(); await refreshCloud() }, text('Staff session connected.', 'تم تسجيل دخول الإدارة.')) }}>
      <label className="min-w-0 flex-1 text-sm">{text('Optional staff email', 'بريد الموظف (اختياري)')}<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3" /></label>
      <label className="min-w-0 flex-1 text-sm">{text('Password', 'كلمة المرور')}<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-kraft bg-cream p-3" /></label>
      <Button disabled={busy} type="submit">{text('Sign in', 'تسجيل الدخول')}</Button>
    </form>}
    <div className="flex flex-wrap gap-3">
      <Button type="button" variant="outline" disabled={busy || !isSupabaseConfigured()} onClick={() => void run(async () => { await retryCloudChanges(); await refreshCloud() }, text('Sync complete.', 'اكتملت المزامنة.'))}><RefreshCw size={16} />{text('Check connection / Retry sync', 'فحص الاتصال / إعادة المزامنة')}</Button>
      <Button type="button" disabled={busy || !isSupabaseConfigured()} onClick={() => void run(pushInitialSeed, text('Current storefront data seeded successfully.', 'تم رفع بيانات المتجر بنجاح.'))}><Database size={16} />{text('Push Initial Seed Data to Supabase', 'رفع البيانات الأولية إلى Supabase')}</Button>
      {cloud.isStaff && <Button type="button" variant="outline" disabled={busy} onClick={() => void run(async () => { const result = await getSupabase()?.auth.signOut(); if (result?.error) throw result.error; useCloudSyncStore.setState({ isStaff: false }) }, text('Signed out.', 'تم تسجيل الخروج.'))}><LogOut size={16} />{text('Sign out', 'تسجيل الخروج')}</Button>}
    </div>
    <p className="text-xs text-olive/70">{text('Seeding upserts the current catalog, gallery and public settings together. Demo orders and browser integration keys are excluded.', 'التهيئة ترفع الكتالوج والمعرض وإعدادات المتجر معاً. لا تتضمن الطلبات التجريبية أو مفاتيح التكامل المحلية.')}</p>
    {cloud.message && <p role="alert" className="text-sm text-red-700">{cloud.message}</p>}
    <p role="status" className="text-sm">{message || (cloud.lastSync ? `${text('Last sync', 'آخر مزامنة')}: ${new Date(cloud.lastSync).toLocaleTimeString(lang)}` : '')}</p>
  </section>
}
