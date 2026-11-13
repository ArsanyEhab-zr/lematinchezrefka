import { useShallow } from 'zustand/react/shallow'
import { useSiteSettingsStore, DEFAULT_SITE_SETTINGS } from '@/stores/site-settings-store'
import { useTranslation } from '@/data/translations'
import { Heart, Sparkles, Clock, CheckCircle2, Quote } from 'lucide-react'
import { useNavigation } from '@/stores/navigation-store'
import { SectionHeading, HeartDivider } from '@/components/ui/section-heading'
import { SmartImage } from '@/components/ui/smart-image'
import { StampBadge } from '@/components/ui/stamp-badge'
import { Button } from '@/components/ui/button'

export const About = () => {
  const media = useSiteSettingsStore(useShallow(s => ({ storyImage1Url: s.storyImage1Url, storyImage2Url: s.storyImage2Url, storyImage3Url: s.storyImage3Url })))
  const { t } = useTranslation()
  const navigate = useNavigation(state => state.navigate)

  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {/* ── 1. Story Hero (2-Column Storytelling Layout) ──────── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Narrative */}
          <div className="flex flex-col items-start lg:col-span-6">
            <SectionHeading
              eyebrow={t.about.eyebrow}
              title={t.about.title}
              script={t.about.script}
            />

            <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-olive/80">
              <p>
                {t.about.p1}</p>
              <p>
                {t.about.p2}</p>
              <p>
                {t.about.p3}</p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button
                variant="cta"
                size="md"
                onClick={() => navigate('menu')}
                className="rounded-full shadow-md hover:shadow-lg"
              >
                {t.about.ctaDiscover}</Button>
            </div>
          </div>

          {/* Right Column: Grid of 3 Food Preparation Images */}
          <div className="relative lg:col-span-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Image 1: Tall image of dough kneading / preparation */}
              <div className="col-span-1 row-span-2 overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-2 shadow-md">
                <SmartImage
                  photoId={media.storyImage1Url || DEFAULT_SITE_SETTINGS.storyImage1Url}
                  alt="Baker hands kneading sourdough bread dough on a floured wooden table"
                  className="h-full min-h-[340px] w-full rounded-2xl object-cover"
                />
              </div>

              {/* Image 2: Pastry lamination / bakery trays */}
              <div className="col-span-1 overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-2 shadow-md">
                <SmartImage
                  photoId={media.storyImage2Url || DEFAULT_SITE_SETTINGS.storyImage2Url}
                  alt="Freshly baked artisan sourdough bread and wheat stalks"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              </div>

              {/* Image 3: Food plating and breakfast spread */}
              <div className="col-span-1 overflow-hidden rounded-2xl border-2 border-dashed border-kraft bg-cream p-2 shadow-md">
                <SmartImage
                  photoId={media.storyImage3Url || DEFAULT_SITE_SETTINGS.storyImage3Url}
                  alt="Toast with fresh berries, honey and morning coffee"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              </div>
            </div>

            {/* Stamp Badge accent */}
            <div className="absolute -bottom-6 -left-6 hidden sm:block">
              <StampBadge />
            </div>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="mx-auto max-w-3xl px-4">
        <HeartDivider />
      </div>

      {/* ── 2. The Three Promises of Refka ──────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <SectionHeading
            eyebrow={t.about.commitmentsEyebrow}
            title={t.about.commitmentsTitle}
            script={t.about.commitmentsScript}
            intro={t.about.commitmentsIntro}
            className="text-center"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rustic-card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Sparkles className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-olive">
              {t.about.promise1Title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-olive/80">
              {t.about.promise1Desc}</p>
            <ul className="mt-4 flex flex-col gap-2 border-t border-dashed border-kraft/60 pt-4 text-xs font-semibold text-gold-deep">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>{t.about.promise1Bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>{t.about.promise1Bullet2}</span>
              </li>
            </ul>
          </div>

          <div className="rustic-card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Clock className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-olive">
              {t.about.promise2Title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-olive/80">
              {t.about.promise2Desc}</p>
            <ul className="mt-4 flex flex-col gap-2 border-t border-dashed border-kraft/60 pt-4 text-xs font-semibold text-gold-deep">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>{t.about.promise2Bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>{t.about.promise2Bullet2}</span>
              </li>
            </ul>
          </div>

          <div className="rustic-card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-olive">
              <Heart className="h-6 w-6 text-gold" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-olive">
              {t.about.promise3Title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-olive/80">
              {t.about.promise3Desc}</p>
            <ul className="mt-4 flex flex-col gap-2 border-t border-dashed border-kraft/60 pt-4 text-xs font-semibold text-gold-deep">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>{t.about.promise3Bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span>{t.about.promise3Bullet2}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. Founder Quote Banner ──────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border-2 border-dashed border-kraft bg-blush/30 p-8 sm:p-14 text-center">
          <Quote className="mx-auto h-10 w-10 text-gold/40" />
          <blockquote className="mt-4 font-display text-xl italic leading-relaxed text-olive sm:text-2xl">
            {t.about.quoteText}</blockquote>
          <p className="mt-6 font-display font-bold text-olive">{t.about.quoteAuthor}</p>
          <p className="font-script text-xl text-gold">{t.about.quoteRole}</p>
        </div>
      </section>
    </div>
  )
}

