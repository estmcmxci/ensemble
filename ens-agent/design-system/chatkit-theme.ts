/**
 * PULSE Design System — ChatKit Theme
 *
 * Exports a ChatKit-compatible ThemeOption object derived from
 * the same design tokens used in our CSS. Drop this into any
 * OpenAI ChatKit integration to match the PULSE aesthetic.
 *
 * Usage:
 *   import { pulseTheme } from '@pulse-ds/design-system/chatkit-theme'
 *
 *   <ChatKit options={{ theme: pulseTheme }} />
 */

/* ── Raw Token Values ──────────────────────────────────────────── */
/* Mirrored from tokens/colors.css so they're available at build time */

export const tokens = {
  colors: {
    bg: {
      base: '#06060a',
      raised: '#0c0c12',
      elevated: '#12121a',
      overlay: '#1a1a24',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
      muted: '#52525b',
    },
    border: {
      subtle: '#1a1a24',
      default: '#252530',
      strong: '#353545',
    },
    accent: {
      primary: '#5298ff',
      secondary: '#a099ff',
    },
    warm: {
      base: '#e8a946',
      muted: '#92691e',
    },
    success: { base: '#22c55e', muted: '#166534' },
    warning: { base: '#f59e0b', muted: '#92400e' },
    danger: { base: '#ef4444', muted: '#991b1b' },
    info: { base: '#3b82f6', muted: '#1e40af' },
    interactive: {
      base: '#5298ff',
      hover: '#6ba5ff',
      active: '#4080dd',
    },
  },
  typography: {
    fontFamily:
      "'ABC Monument Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyMono: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  shadows: {
    card: '0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
    cardHover:
      '0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(82,152,255,0.15) inset, 0 0 20px rgba(82,152,255,0.06)',
    hero: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(82,152,255,0.12) inset, 0 0 30px rgba(82,152,255,0.05)',
    glow: '0 0 30px rgba(82,152,255,0.15), 0 0 60px rgba(160,153,255,0.08)',
  },
} as const;

/* ── ChatKit ThemeOption ─────────────────────────────────────────── */

export type FontObject = {
  family: string;
  src: string;
  weight?: string | number;
  style?: 'normal' | 'italic' | 'oblique';
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
};

export type ChatKitTheme = {
  colorScheme?: 'light' | 'dark';
  typography?: {
    baseSize?: 14 | 15 | 16 | 17 | 18;
    fontSources?: FontObject[];
    fontFamily?: string;
    fontFamilyMono?: string;
  };
  radius?: 'pill' | 'round' | 'soft' | 'sharp';
  density?: 'compact' | 'normal' | 'spacious';
  color?: {
    grayscale?: {
      hue: number;
      tint: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
      shade?: -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;
    };
    accent?: {
      primary: string;
      level: 0 | 1 | 2 | 3;
    };
    surface?: {
      background: string;
      foreground: string;
    };
  };
};

/**
 * PULSE theme for OpenAI ChatKit.
 *
 * Applies the elevated dark aesthetic with ABC Monument Grotesk,
 * deep-space background tones, and the signature blue-purple
 * accent gradient.
 */
export const pulseTheme: ChatKitTheme = {
  colorScheme: 'dark',

  typography: {
    baseSize: 14,
    fontFamily: tokens.typography.fontFamily,
    fontFamilyMono: tokens.typography.fontFamilyMono,
    fontSources: [
      {
        family: 'ABC Monument Grotesk',
        src: '/fonts/ABCMonumentGrotesk-Regular.otf',
        weight: 400,
        style: 'normal',
        display: 'swap',
      },
      {
        family: 'ABC Monument Grotesk',
        src: '/fonts/ABCMonumentGrotesk-Medium.otf',
        weight: 500,
        style: 'normal',
        display: 'swap',
      },
      {
        family: 'ABC Monument Grotesk',
        src: '/fonts/ABCMonumentGrotesk-Bold.otf',
        weight: 700,
        style: 'normal',
        display: 'swap',
      },
      {
        family: 'ABC Monument Grotesk',
        src: '/fonts/ABCMonumentGrotesk-Light.otf',
        weight: 300,
        style: 'normal',
        display: 'swap',
      },
    ],
  },

  radius: 'soft',
  density: 'normal',

  color: {
    grayscale: {
      hue: 240,   // Blue-purple hue matching our deep-space palette
      tint: 2,    // Subtle warmth
      shade: -2,  // Darker than default
    },
    accent: {
      primary: tokens.colors.accent.primary, // #5298ff
      level: 2,
    },
    surface: {
      background: tokens.colors.bg.base,       // #06060a
      foreground: tokens.colors.text.primary,   // #fafafa
    },
  },
};

/**
 * PULSE theme variant for compact chat panels / sidebars.
 */
export const pulseThemeCompact: ChatKitTheme = {
  ...pulseTheme,
  density: 'compact',
  typography: {
    ...pulseTheme.typography,
    baseSize: 14,
  },
};

export default pulseTheme;
