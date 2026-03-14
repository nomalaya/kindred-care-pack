/**
 * Design System — CashForCause
 *
 * Centralized tokens for typography, spacing, radius, shadows, animations,
 * color roles, breakpoints, and component-level conventions.
 *
 * CSS variables (index.css) define the actual color palette.
 * This file documents semantic roles and provides reusable constants.
 */

// ─── Typography ──────────────────────────────────────────

export const FONT_FAMILY = "Inter, system-ui, sans-serif";

/** Tailwind text-size classes mapped to semantic levels */
export const TYPOGRAPHY = {
  h1: "text-3xl md:text-4xl font-bold text-foreground",
  h2: "text-2xl font-bold text-foreground",
  h3: "text-xl font-semibold text-foreground",
  h4: "text-lg font-semibold text-foreground",
  body: "text-base text-foreground",
  bodySmall: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium text-foreground",
  overline: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
} as const;

/** Font size scale (rem) */
export const FONT_SIZES = {
  xs: "0.75rem",   // 12px
  sm: "0.875rem",  // 14px
  base: "1rem",    // 16px
  lg: "1.125rem",  // 18px
  xl: "1.25rem",   // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem",  // 36px
  "5xl": "3rem",     // 48px
} as const;

export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// ─── Spacing ─────────────────────────────────────────────

/** 4px grid — multiply by 4 to get pixel value */
export const SPACING = {
  0: "0px",
  1: "4px",    // 0.25rem
  2: "8px",    // 0.5rem
  3: "12px",   // 0.75rem
  4: "16px",   // 1rem
  5: "20px",   // 1.25rem
  6: "24px",   // 1.5rem
  8: "32px",   // 2rem
  10: "40px",  // 2.5rem
  12: "48px",  // 3rem
  16: "64px",  // 4rem
  20: "80px",  // 5rem
} as const;

/** Semantic spacing tokens (Tailwind classes) */
export const SPACING_TOKENS = {
  sectionGap: "py-12",          // Vertical gap between page sections
  sectionGapLg: "py-16",       // Larger section gap (HowItWorks, etc.)
  cardPadding: "p-8",          // Main page cards (beneficiary, cause)
  cardPaddingInner: "p-6",     // Inner components (basket, timeline, impact)
  stackGap: "space-y-6",      // Vertical stack inside pages
  inlineGap: "gap-6",         // Grid / flex gap
  titleBottom: "mb-4",        // Space below h1
  subtitleBottom: "mb-12",    // Space below header block
} as const;

// ─── Border Radius ───────────────────────────────────────

export const RADIUS = {
  sm: "calc(var(--radius) - 4px)",  // ~8px
  md: "calc(var(--radius) - 2px)",  // ~10px
  lg: "var(--radius)",              // 12px
  xl: "1rem",                       // 16px
  "2xl": "1.5rem",                  // 24px — used on cards
  full: "9999px",                   // Pills, avatars
} as const;

// ─── Shadows ─────────────────────────────────────────────

export const SHADOWS = {
  card: "0 2px 12px -2px rgba(0, 0, 0, 0.06)",
  cardHover: "0 8px 30px -4px rgba(0, 0, 0, 0.1)",
  warm: "0 4px 20px -4px rgba(31, 122, 99, 0.12)",
  warmLg: "0 10px 40px -8px rgba(31, 122, 99, 0.15)",
} as const;

// ─── Animations (Framer Motion presets) ──────────────────

export const ANIM = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  scaleButton: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  },
  badgeFadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 0.3, duration: 0.3 },
  },
  staggerChildren: (staggerDelay = 0.1) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: (i: number) => ({ delay: i * staggerDelay }),
  }),
} as const;

// ─── Color Roles (documentation) ────────────────────────

export const COLOR_ROLES = {
  primary:     "Trust & brand identity — Emerald green",
  secondary:   "Nature & growth — Lighter green",
  cta:         "Call-to-action — Vivid magenta-pink",
  accent:      "Warmth & highlight — Amber gold",
  destructive: "Danger & error — Red",
  muted:       "Neutral surfaces — Warm gray",
  background:  "Page background — Warm off-white",
  card:        "Card surface — Pure white",
  foreground:  "Primary text — Near-black",
} as const;

// ─── Breakpoints ─────────────────────────────────────────

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px", // container max
} as const;

// ─── Component Tokens ────────────────────────────────────

/** Card class presets */
export const CARD_STYLES = {
  /** Full page-level cards: beneficiary, cause, situation */
  page: "bg-card rounded-2xl p-8 shadow-card border",
  /** Inner component cards: basket, impact, timeline */
  inner: "bg-card rounded-2xl p-6 border shadow-card",
  /** Hover effect to apply on interactive cards */
  hover: "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
  /** Group hover on title */
  titleHover: "group-hover:text-primary transition-colors",
} as const;

/** Badge size presets */
export const BADGE_SIZES = {
  sm: "py-1 px-2 text-[10px]",
  md: "py-1.5 px-3 text-xs",
  lg: "py-2 px-4 text-sm",
} as const;

/** Button presets (class strings) */
export const BUTTON_PRESETS = {
  cta: "bg-cta hover:bg-cta/90 text-cta-foreground",
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
} as const;

/** Loading skeleton preset */
export const SKELETON = {
  card: "bg-card rounded-2xl animate-pulse",
  cardPage: "bg-card rounded-2xl animate-pulse h-64",
  cardInner: "bg-card rounded-2xl animate-pulse h-48",
} as const;

/** Section header pattern */
export const SECTION_HEADER = {
  wrapper: "text-center mb-12",
  title: "text-3xl md:text-4xl font-bold text-foreground mb-4",
  subtitle: "text-lg text-muted-foreground",
} as const;

/** Back button classes */
export const BACK_BUTTON = "inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8" as const;
