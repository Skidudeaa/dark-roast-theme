// Dark Roast: Black Label — Spacing, Geometry & Animation Tokens

// ── Spacing Scale ───────────────────────────────────────────
export const spaceXs = '4px';
export const spaceSm = '8px';
export const spaceMd = '12px';
export const spaceLg = '16px';
export const spaceXl = '24px';
export const space2xl = '32px';
export const space3xl = '48px';

// ── Border Radii ────────────────────────────────────────────
export const radiusNone = '0';
export const radiusSm = '4px';
export const radiusMd = '8px';
export const radiusLg = '12px';
export const radiusXl = '16px';
export const radius2xl = '24px';

// ── Geo-Stripe Dimensions ───────────────────────────────────
export const stripeHeight = '2px';
export const stripeOpacity = '0.5';

// ── Animation Timing ────────────────────────────────────────
export const durationFast = '150ms';
export const durationNormal = '300ms';
export const durationTheatrical = '500ms';
export const durationEntrance = '600ms';

// ── Easing Curves ───────────────────────────────────────────
export const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const easingDramatic = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const easingBounce = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// ── Collected objects for iteration ─────────────────────────
export const spacing = {
  xs: spaceXs,
  sm: spaceSm,
  md: spaceMd,
  lg: spaceLg,
  xl: spaceXl,
  '2xl': space2xl,
  '3xl': space3xl,
};

export const radii = {
  none: radiusNone,
  sm: radiusSm,
  md: radiusMd,
  lg: radiusLg,
  xl: radiusXl,
  '2xl': radius2xl,
};

export const durations = {
  fast: durationFast,
  normal: durationNormal,
  theatrical: durationTheatrical,
  entrance: durationEntrance,
};

export const easings = {
  default: easing,
  dramatic: easingDramatic,
  bounce: easingBounce,
};
