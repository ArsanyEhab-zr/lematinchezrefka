import type { Config } from 'tailwindcss'

/**
 * Le Matin chez Refka — Tailwind theme.
 *
 * Every colour resolves to a CSS variable defined in `src/styles/tokens.css`
 * (primitive → semantic → component). Values are stored as RGB channels so
 * opacity modifiers keep working, e.g. `bg-cream/90`, `bg-blush/70`.
 */
const token = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Layer 1 — primitive brand palette (names mirror the brand brief)
        cream: token('--lm-cream'),
        olive: token('--lm-olive'),
        blush: token('--lm-blush'),
        gold: {
          DEFAULT: token('--lm-gold'),
          deep: token('--lm-gold-deep'),
        },
        kraft: token('--lm-kraft'),

        // Layer 2 — semantic roles
        surface: token('--color-surface'),
        ink: token('--color-ink'),
        cta: {
          DEFAULT: token('--color-cta'),
          hover: token('--color-cta-hover'),
          fg: token('--color-on-cta'),
        },
        highlight: token('--color-highlight'),
        line: token('--color-line'),
        inverse: {
          DEFAULT: token('--color-inverse-surface'),
          fg: token('--color-on-inverse'),
        },

        // Layer 3 — component tokens
        card: {
          DEFAULT: token('--card-bg'),
          border: token('--card-border'),
        },
        status: {
          'pending-bg': token('--badge-pending-bg'),
          'pending-fg': token('--badge-pending-fg'),
          'preparing-bg': token('--badge-preparing-bg'),
          'preparing-fg': token('--badge-preparing-fg'),
          'delivered-bg': token('--badge-delivered-bg'),
          'delivered-fg': token('--badge-delivered-fg'),
        },
        sidebar: {
          DEFAULT: token('--sidebar-bg'),
          fg: token('--sidebar-fg'),
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Tajawal', 'Lato', 'ui-sans-serif', 'sans-serif'],
        display: ['"Playfair Display"', 'Tajawal', '"Aref Ruqaa"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', '"Aref Ruqaa"', 'cursive'],
        arabic: ['Tajawal', 'sans-serif'],
        'arabic-script': ['"Aref Ruqaa"', 'Tajawal', 'serif'],
      },
      fontSize: {
        // Body-first scale: 16px base, modest steps, fluid display sizes.
        eyebrow: ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.18em' }],
        'display-sm': ['clamp(1.75rem, 1.4rem + 1.2vw, 2.25rem)', { lineHeight: '1.2' }],
        'display-md': ['clamp(2.25rem, 1.7rem + 2vw, 3.25rem)', { lineHeight: '1.12' }],
        'display-lg': ['clamp(2.75rem, 1.9rem + 3.4vw, 4.75rem)', { lineHeight: '1.05' }],
        script: ['clamp(1.9rem, 1.5rem + 1.6vw, 2.75rem)', { lineHeight: '1.2' }],
      },
      maxWidth: {
        prose: '65ch',
      },
      boxShadow: {
        // Olive-tinted, low-contrast shadows. Overrides Tailwind’s grey `shadow-md`.
        sm: '0 1px 2px 0 rgb(var(--lm-olive) / 0.06)',
        md: '0 6px 18px -6px rgb(var(--lm-olive) / 0.16), 0 2px 6px -2px rgb(var(--lm-olive) / 0.08)',
        lg: '0 18px 40px -16px rgb(var(--lm-olive) / 0.22), 0 4px 10px -4px rgb(var(--lm-olive) / 0.08)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        rise: 'rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'spin-slow': 'spin-slow 28s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config

