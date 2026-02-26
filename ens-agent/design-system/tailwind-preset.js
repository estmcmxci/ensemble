/**
 * PULSE Design System — Tailwind CSS Preset
 *
 * Drop this into any Tailwind project to inherit the PULSE palette,
 * typography, spacing, and animation tokens.
 *
 * Usage (tailwind.config.js):
 *   import pulsePreset from '@pulse-ds/design-system/tailwind-preset'
 *   export default { presets: [pulsePreset] }
 *
 * Or with Tailwind 4 (CSS):
 *   @import '@pulse-ds/design-system/tokens';
 *   // tokens auto-register via CSS custom properties
 */

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--ds-color-bg-base)',
          raised: 'var(--ds-color-bg-raised)',
          elevated: 'var(--ds-color-bg-elevated)',
          overlay: 'var(--ds-color-bg-overlay)',
        },
        text: {
          primary: 'var(--ds-color-text-primary)',
          secondary: 'var(--ds-color-text-secondary)',
          tertiary: 'var(--ds-color-text-tertiary)',
          muted: 'var(--ds-color-text-muted)',
        },
        border: {
          subtle: 'var(--ds-color-border-subtle)',
          DEFAULT: 'var(--ds-color-border-default)',
          strong: 'var(--ds-color-border-strong)',
        },
        accent: {
          DEFAULT: 'var(--ds-color-accent)',
          secondary: 'var(--ds-color-accent-secondary)',
        },
        warm: {
          DEFAULT: 'var(--ds-color-warm)',
          muted: 'var(--ds-color-warm-muted)',
        },
        success: {
          DEFAULT: 'var(--ds-color-success)',
          muted: 'var(--ds-color-success-muted)',
        },
        warning: {
          DEFAULT: 'var(--ds-color-warning)',
          muted: 'var(--ds-color-warning-muted)',
        },
        danger: {
          DEFAULT: 'var(--ds-color-danger)',
          muted: 'var(--ds-color-danger-muted)',
        },
        info: {
          DEFAULT: 'var(--ds-color-info)',
          muted: 'var(--ds-color-info-muted)',
        },
        interactive: {
          DEFAULT: 'var(--ds-color-interactive)',
          hover: 'var(--ds-color-interactive-hover)',
          active: 'var(--ds-color-interactive-active)',
        },
      },

      fontFamily: {
        sans: [
          'ABC Monument Grotesk',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'monospace'],
      },

      fontSize: {
        '2xs': 'var(--ds-text-2xs)',
        xs: 'var(--ds-text-xs)',
        sm: 'var(--ds-text-sm)',
        base: 'var(--ds-text-base)',
        md: 'var(--ds-text-md)',
        lg: 'var(--ds-text-lg)',
        xl: 'var(--ds-text-xl)',
        '2xl': 'var(--ds-text-2xl)',
        '3xl': 'var(--ds-text-3xl)',
        '4xl': 'var(--ds-text-4xl)',
        hero: 'var(--ds-text-hero)',
      },

      spacing: {
        0.5: 'var(--ds-space-0-5)',
        1: 'var(--ds-space-1)',
        1.5: 'var(--ds-space-1-5)',
        2: 'var(--ds-space-2)',
        3: 'var(--ds-space-3)',
        4: 'var(--ds-space-4)',
        5: 'var(--ds-space-5)',
        6: 'var(--ds-space-6)',
        8: 'var(--ds-space-8)',
        10: 'var(--ds-space-10)',
        12: 'var(--ds-space-12)',
        16: 'var(--ds-space-16)',
      },

      borderRadius: {
        sm: 'var(--ds-radius-sm)',
        md: 'var(--ds-radius-md)',
        lg: 'var(--ds-radius-lg)',
        xl: 'var(--ds-radius-xl)',
        '2xl': 'var(--ds-radius-2xl)',
      },

      boxShadow: {
        card: 'var(--ds-shadow-card)',
        'card-hover': 'var(--ds-shadow-card-hover)',
        hero: 'var(--ds-shadow-hero)',
        glow: 'var(--ds-shadow-glow)',
        focus: 'var(--ds-shadow-focus)',
      },

      transitionDuration: {
        fast: '100ms',
        DEFAULT: '150ms',
        slow: '300ms',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        drift: {
          '0%': { transform: 'translate(0%,0%) scale(1)' },
          '33%': { transform: 'translate(3%,-2%) scale(1.02)' },
          '66%': { transform: 'translate(-2%,3%) scale(0.98)' },
          '100%': { transform: 'translate(1%,-1%) scale(1.01)' },
        },
        pulse: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        drift: 'drift 45s ease-in-out infinite alternate',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
};
