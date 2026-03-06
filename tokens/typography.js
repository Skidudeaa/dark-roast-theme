// Dark Roast: Black Label — Typography Tokens
// Four-tier type system: Display, Heading, Body, Mono

// ── Font Stacks ─────────────────────────────────────────────
export const fontDisplay = "'Playfair Display', Georgia, serif";
export const fontHeading = "'Instrument Sans', -apple-system, sans-serif";
export const fontBody = "'DM Sans', -apple-system, sans-serif";
export const fontMono = "'Fira Code', 'SF Mono', monospace";

// ── Type Scale ──────────────────────────────────────────────
export const textXs = '0.6875rem';    // 11px — metadata labels, timestamps
export const textSm = '0.8125rem';    // 13px — captions, secondary info
export const textBase = '0.9375rem';  // 15px — body text
export const textLg = '1.125rem';     // 18px — subheadings
export const textXl = '1.5rem';       // 24px — section headers
export const text2xl = '2rem';        // 32px — page titles
export const textHuge = '4.5rem';     // 72px — hero display

// ── Letter Spacing ──────────────────────────────────────────
export const trackingTight = '-0.01em';
export const trackingNormal = '0';
export const trackingWide = '0.05em';
export const trackingWider = '0.10em';
export const trackingWidest = '0.20em';
export const trackingDisplay = '0.15em';  // Section labels, uppercase metadata

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
  lg: textLg,
  xl: textXl,
  '2xl': text2xl,
  huge: textHuge,
};

export const tracking = {
  tight: trackingTight,
  normal: trackingNormal,
  wide: trackingWide,
  wider: trackingWider,
  widest: trackingWidest,
  display: trackingDisplay,
};
