import { validWhatsAppNumber } from '@/components/SocialLinks'
import { useSiteSettingsStore, DEFAULT_SITE_SETTINGS } from '@/stores/site-settings-store'
import { useTranslation, localizeBox } from '@/data/translations'
import { Clock, Heart, Sparkles, Truck, Award, ArrowRight, RefreshCw } from 'lucide-react'
import { useNavigation } from '@/stores/navigation-store'
import { useBoxBuilderStore } from '@/stores/box-builder-store'
import { useShallow } from 'zustand/react/shallow'
import { formatPrice } from '@/lib/utils'
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE } from '@/data/site'
import { SmartImage } from '@/components/ui/smart-image'
import { StampBadge } from '@/components/ui/stamp-badge'
import { SectionHeading, HeartDivider } from '@/components/ui/section-heading'
import { Button, ButtonLink } from '@/components/ui/button'
import { MasonryGrid } from '@/components/MasonryGrid'

export const Home = () => {
  const { t, lang } = useTranslation()
  const settings = useSiteSettingsStore(useShallow(state => ({ ...state })))
  const navigate = useNavigation(state => state.navigate)

  const { boxes, openBuilder } = useBoxBuilderStore(
    useShallow((state) => ({
      boxes: state.boxes,
      openBuilder: state.openBuilder,
    }))
  )

  const featuredBoxes = boxes.slice(0, 3)

  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      {/* ── 1. Hero Section (Split Layout) ────────────────────── */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Typography & CTAs */}
            <div className="flex flex-col items-start lg:col-span-7">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-kraft bg-blush/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-olive">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>{t.home.eyebrow}</span>
              </div>

              {/* Main Heading */}
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-olive sm:text-5xl lg:text-6xl">
                {t.home.heroTitleLine1}<br className="hidden sm:inline" />
                {t.home.heroTitleLine2}</h1>

              {/* Great Vibes Script Accent */}
              <p className="mt-2 font-script text-3xl text-gold sm:text-4xl">
                {t.home.heroScript}</p>

              {/* Story Narrative */}
              <p className="mt-6 max-w-xl text-base leading-relaxed text-olive/80 sm:text-lg">
                {t.home.heroDesc}</p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={() => navigate('menu')}
                  className="rounded-full shadow-md hover:shadow-lg"
                >
                  <span>{t.home.exploreMenu}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {validWhatsAppNumber(settings.whatsappNumber) && <ButtonLink
                  variant="outline"
                  size="lg"
                  href={buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full"
                >
                  {t.home.orderWhatsApp}</ButtonLink>}
              </div>

              {/* Micro-assurances */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-dashed border-kraft/60 pt-6 text-xs text-olive/70">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-gold" />
                  <span>{t.home.assuranceCutoff} {settings.dailyCutoffTime} {t.home.assuranceCutoffSuffix}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-gold" />
                  <span>{settings.deliveryTimeSlots.map((value, index) => <span key={value}>{index > 0 && ' · '}<bdi>{value}</bdi></span>)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 shrink-0 text-gold" />
                  <span>{t.home.assuranceHomemade}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image & Stamp */}
            <div className="relative flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-lg">
                {/* Background decorative rustic border */}
                <div className="overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-3 shadow-xl sm:p-4">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                    <SmartImage
                      photoId={settings.heroImageUrl || DEFAULT_SITE_SETTINGS.heroImageUrl}
                      alt="Artisanal French breakfast box with croissants, waffles, eggs and fresh orange juice"
                      isPriority
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating Stamp Badge */}
                <div className="absolute -bottom-6 -left-6 z-10 hidden sm:block">
                  <StampBadge />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Artisanal Craft Pillars ────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rustic-card p-6 transition-all hover:border-gold">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Award className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-olive">
              {t.home.pillars[0].title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-olive/70">
              {t.home.pillars[0].desc}</p>
          </div>

          <div className="rustic-card p-6 transition-all hover:border-gold">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Clock className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-olive">
              {t.home.pillars[1].title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-olive/70">
              {t.home.pillars[1].desc}</p>
          </div>

          <div className="rustic-card p-6 transition-all hover:border-gold">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Sparkles className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-olive">
              {t.home.pillars[2].title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-olive/70">
              {t.home.pillars[2].desc}</p>
          </div>

          <div className="rustic-card p-6 transition-all hover:border-gold">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Heart className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-olive">
              {settings.enableGiftCards ? t.contact.giftCardFeeLabel : t.home.assuranceHomemade}</h3>
            <p className="mt-2 text-xs leading-relaxed text-olive/70">
              {settings.enableGiftCards ? (settings.giftCardFee ? formatPrice(settings.giftCardFee) : t.contact.complimentary) : t.home.featuredIntro}</p>
          </div>
        </div>
      </section>

      {/* ── 3. Featured Breakfast Boxes ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <SectionHeading
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredTitle}
            script={t.home.featuredScript}
            intro={t.home.featuredIntro}
            className="text-center"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredBoxes.map((box) => (
            <article
              key={box.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-dashed border-kraft bg-cream shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden p-3.5 pb-0">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl border border-dashed border-kraft/70">
                    <SmartImage
                      photoId={box.image_url}
                      alt={localizeBox(box, lang).name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-cream/95 px-3 py-1 text-xs font-bold text-gold shadow-xs backdrop-blur-xs">
                      {t.home.fromPrice} {formatPrice(box.base_price)}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-olive group-hover:text-gold-deep transition-colors">
                    {localizeBox(box, lang).name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-olive/75 line-clamp-2">
                    {localizeBox(box, lang).description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Button
                  variant="cta"
                  size="md"
                  disabled={!settings.isAcceptingOrders || box.is_sold_out}
                  onClick={() => openBuilder(box.id)}
                  className="w-full justify-center gap-2 rounded-full shadow-sm hover:shadow-md"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{t.home.customizeOrder}</span>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('menu')}
            className="rounded-full"
          >
            <span>{t.home.exploreAllBoxes}{boxes.length} {t.home.curationsCount}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="mx-auto max-w-3xl px-4">
        <HeartDivider />
      </div>

      {/* ── 4. Pinterest-Style Masonry Grid ──────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <SectionHeading
            eyebrow={t.home.galleryEyebrow}
            title={t.home.galleryTitle}
            script={t.home.galleryScript}
            intro={t.home.galleryIntro}
            className="text-center"
          />
        </div>

        <div className="mt-12">
          <MasonryGrid />
        </div>
      </section>

      {/* ── 5. Bottom Invitation Banner ──────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-kraft bg-blush/40 p-8 shadow-md sm:p-14">
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="font-script text-3xl text-gold sm:text-4xl">
              {t.home.inviteScript}</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-olive sm:text-4xl">
              {t.home.inviteTitle}</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-olive/80 sm:text-base">
              {t.home.inviteDesc}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {validWhatsAppNumber(settings.whatsappNumber) && <ButtonLink
                variant="cta"
                size="lg"
                href={buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full"
              >
                {t.home.sendWhatsAppNote}</ButtonLink>}
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('contact')}
                className="rounded-full"
              >
                {t.home.customOrderInquiry}</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
