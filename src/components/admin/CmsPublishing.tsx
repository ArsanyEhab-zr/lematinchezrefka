import { useCloudSyncStore } from '@/stores/cloud-sync-store'
import { useSiteSettingsStore } from '@/stores/site-settings-store'
import { useState } from 'react'
import { hasSettingsBackend } from '@/lib/site-settings-sync'
import { useTranslation } from '@/data/translations'
import { Button } from '@/components/ui/button'

export const CmsPublishing = ({ dirty, publish }: { dirty: boolean; publish: () => Promise<void> }) => {
  useSiteSettingsStore(state => state.integrations)
  const cloudMessage = useCloudSyncStore(state => state.message)
  const { lang } = useTranslation()
  const text = (en: string, ar: string) => lang === 'ar' ? ar : en
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false)
  return <section className="rustic-card space-y-4 p-5">
    <p className="text-sm text-olive/80">{hasSettingsBackend() ? text('Edits sync automatically to Supabase. Pending changes stay cached if the connection drops. Use Retry sync after reconnecting.', 'تتم مزامنة التعديلات تلقائياً مع Supabase. تبقى التغييرات معلّقة إذا انقطع الاتصال. استخدم إعادة المزامنة بعد العودة.') : text('Local mode: edits save immediately and appear in this browser’s storefront and open tabs. Configure Supabase to publish across devices.', 'الوضع المحلي: تُحفظ التغييرات فوراً وتظهر في المتجر وتبويبات هذا المتصفح. اربط Supabase للنشر عبر الأجهزة.')}</p>
    {hasSettingsBackend() && <Button type="button" variant="cta" disabled={busy || !dirty} onClick={async () => { setBusy(true); try { await publish(); setStatus(text('Published successfully.', 'تم النشر بنجاح.')) } catch (cause) { setStatus(cause instanceof Error ? cause.message : 'Publishing failed.') } finally { setBusy(false) } }}>{busy ? '…' : text('Retry sync', 'إعادة المزامنة')}</Button>}
    {cloudMessage && <p role="alert" className="text-sm text-red-700">{cloudMessage}</p>}
    <p role="status" aria-live="polite" className="text-sm">{status || (hasSettingsBackend() ? text('Synced automatically as you edit.', 'تتم المزامنة تلقائياً أثناء التعديل.') : text('Saved locally as you edit.', 'تُحفظ التغييرات محلياً أثناء التعديل.'))}</p>
  </section>
}
