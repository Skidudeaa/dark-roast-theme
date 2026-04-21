// Dark Roast: Black Label — Typography Tokens
// v4.0.0 — Added 10-step scale (xs → 5xl), line-heights, letter-spacing per-step, weight per-step, and semantic roles.

// ── Font Stacks ─────────────────────────────────────────────
export const fontDisplay = "'Playfair Display', Georgia, serif";
export const fontHeading = "'Instrument Sans', -apple-system, sans-serif";
export const fontBody = "'DM Sans', -apple-system, sans-serif";
export const fontMono = "'Fira Code', 'SF Mono', monospace";

// ── Type Scale (v4 — 1.25 minor-third ratio) ────────────────
// Each step includes size, rem equivalent, line-height, letter-spacing, default weight.
export const textXs = { size: '10px', rem: '0.625rem', lineHeight: 1.4, tracking: '0.02em', weight: 500 };
export const textSm = { size: '12px', rem: '0.75rem', lineHeight: 1.5, tracking: '0.01em', weight: 400 };
export const textBase = { size: '14px', rem: '0.875rem', lineHeight: 1.6, tracking: '0', weight: 400 };
export const textMd = { size: '16px', rem: '1rem', lineHeight: 1.5, tracking: '0', weight: 400 };
export const textLg = { size: '18px', rem: '1.125rem', lineHeight: 1.4, tracking: '-0.01em', weight: 500 };
export const textXl = { size: '22px', rem: '1.375rem', lineHeight: 1.3, tracking: '-0.01em', weight: 600 };
export const text2xl = { size: '28px', rem: '1.75rem', lineHeight: 1.2, tracking: '-0.02em', weight: 700 };
export const text3xl = { size: '36px', rem: '2.25rem', lineHeight: 1.15, tracking: '-0.02em', weight: 700 };
export const text4xl = { size: '48px', rem: '3rem', lineHeight: 1.1, tracking: '-0.03em', weight: 900 };
export const text5xl = { size: '64px', rem: '4rem', lineHeight: 1.0, tracking: '-0.03em', weight: 900 };

// Legacy v3 rem-only tokens (retained for backwards compat).
export const textXsRem = '0.6875rem';   // 11px
export const textSmRem = '0.8125rem';   // 13px
export const textBaseRem = '0.9375rem'; // 15px
export const textLgRem = '1.125rem';
export const textXlRem = '1.5rem';
export const text2xlRem = '2rem';
export const textHuge = '4.5rem';       // 72px

// ── Letter Spacing ──────────────────────────────────────────
export const trackingTight = '-0.01em';
export const trackingNormal = '0';
export const trackingWide = '0.05em';
export const trackingWider = '0.10em';
export const trackingWidest = '0.20em';
export const trackingDisplay = '0.15em';

// ── Semantic Typography Roles ───────────────────────────────
// Role → { family, scale step, color token name }. Color resolution happens at consumer.
export const typographyRoles = {
  hero: { family: 'display', scale: '4xl', color: 'crema' },
  pageTitle: { family: 'heading', scale: '2xl', color: 'crema' },
  section: { family: 'heading', scale: 'xl', color: 'bone' },
  cardTitle: { family: 'heading', scale: 'lg', color: 'bone' },
  body: { family: 'body', scale: 'base', color: 'bone' },
  bodyMuted: { family: 'body', scale: 'base', color: 'mocha' },
  label: { family: 'body', scale: 'sm', color: 'mocha' },
  metadata: { family: 'body', scale: 'sm', color: 'asparagus' },
  code: { family: 'mono', scale: 'base', color: 'bone' },
  labValue: { family: 'mono', scale: 'md', color: 'bone', weight: 500 },
  timestamp: { family: 'mono', scale: 'xs', color: 'asparagus' },
  vitalSign: { family: 'mono', scale: 'lg', color: 'bone', weight: 600 },
};

// ── Collected objects for iteration ─────────────────────────
export const fontStacks = {
  display: fontDisplay,
  heading: fontHeading,
  body: fontBody,
  mono: fontMono,
};

export const typeScale = {
  xs: textXs,
  sm: textSm,
  base: textBase,
  md: textMd,
  lg: textLg,
  xl: textXl,
  '2xl': text2xl,
  '3xl': text3xl,
  '4xl': text4xl,
  '5xl': text5xl,
};

export const tracking = {
  tight: trackingTight,
  normal: trackingNormal,
  wide: trackingWide,
  wider: trackingWider,
  widest: trackingWidest,
  display: trackingDisplay,
};
