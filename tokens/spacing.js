// Dark Roast: Black Label — Spacing, Geometry, Motion, Z-Index, Icon, Elevation
// v4.0.0 — Expanded spacing scale (4px base, 15 steps), added z-index + icon sizes + elevation.

// ── Spacing Scale (4px base unit) ───────────────────────────
// Numeric tokens (space1 = 4px, space2 = 8px, ...).
export const space0 = '0';
export const spacePx = '1px';
export const space0_5 = '2px';
export const space1 = '4px';
export const space1_5 = '6px';
export const space2 = '8px';
export const space3 = '12px';
export const space4 = '16px';
export const space5 = '20px';
export const space6 = '24px';
export const space8 = '32px';
export const space10 = '40px';
export const space12 = '48px';
export const space16 = '64px';
export const space20 = '80px';
export const space24 = '96px';

// Alias tokens (retained for backwards compat; point at numeric scale).
export const spaceXs = space1;    // 4px
export const spaceSm = space2;    // 8px
export const spaceMd = space3;    // 12px
export const spaceLg = space4;    // 16px
export const spaceXl = space6;    // 24px
export const space2xl = space8;   // 32px
export const space3xl = space12;  // 48px

// ── Border Radii ────────────────────────────────────────────
export const radiusNone = '0';
export const radiusXs = '2px';
export const radiusSm = '4px';
export const radiusMd = '8px';
export const radiusLg = '12px';
export const radiusXl = '16px';
export const radius2xl = '24px';
export const radiusFull = '9999px';

// ── Geo-Stripe Dimensions ───────────────────────────────────
export const stripeHeight = '2px';
export const stripeOpacity = '0.5';

// ── Animation Timing (v4 names) ─────────────────────────────
export const durationInstant = '0ms';
export const durationFast = '120ms';           // Hover, tap feedback
export const durationBase = '200ms';           // Standard transitions
export const durationModerate = '320ms';       // Card expand, tab switches
export const durationSlow = '480ms';           // Modal enter/exit
export const durationDeliberate = '640ms';     // Hero reveals
export const durationAmbient = '1200ms';       // Breathing glows

// Legacy v3 duration aliases (retained).
export const durationNormal = '300ms';
export const durationTheatrical = '500ms';
export const durationEntrance = '600ms';

// ── Easing Curves ───────────────────────────────────────────
export const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const easingLinear = 'linear';
export const easingEaseOut = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const easingEaseIn = 'cubic-bezier(0.7, 0, 0.84, 0)';
export const easingEaseInOut = 'cubic-bezier(0.65, 0, 0.35, 1)';
export const easingDramatic = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const easingBounce = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const easingSpringSnappy = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

// SwiftUI spring strings (consumed by native iOS targets, not CSS).
export const swiftuiSpringSnappy = '.spring(response: 0.35, dampingFraction: 0.7)';
export const swiftuiSpringSoft = '.spring(response: 0.55, dampingFraction: 0.85)';

// ── Z-Index Scale ───────────────────────────────────────────
export const zBase = 0;
export const zRaised = 1;
export const zSticky = 100;
export const zHeader = 200;
export const zDropdown = 300;
export const zOverlay = 400;
export const zModal = 500;
export const zPopover = 600;
export const zToast = 700;
export const zTooltip = 800;
export const zDebug = 9999;

// ── Icon Size Scale ─────────────────────────────────────────
export const iconXs = '12px';
export const iconSm = '14px';
export const iconMd = '16px';
export const iconLg = '20px';
export const iconXl = '24px';
export const icon2xl = '32px';
export const icon3xl = '48px';

export const iconStrokeThin = 1.5;
export const iconStrokeNormal = 2;
export const iconStrokeBold = 2.5;

// ── Elevation (shadow + border pairs) ───────────────────────
// Dark Roast uses radial glow + border-weight variation, not hard drop shadows.
export const elevationFlat = {
  shadow: 'none',
  border: '1px solid rgba(255,255,255,0.04)',
};
export const elevationRaised = {
  shadow: '0 2px 8px rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.06)',
};
export const elevationFloating = {
  shadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(230,154,76,0.12)',
  border: '1px solid rgba(255,255,255,0.08)',
  glow: 'amber',
};
export const elevationCritical = {
  shadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 24px rgba(196,76,76,0.20)',
  border: '1px solid rgba(196,76,76,0.30)',
  glow: 'scarlet',
};
export const elevationLive = {
  shadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 16px rgba(76,196,180,0.15)',
  border: '1px solid rgba(76,196,180,0.20)',
  glow: 'teal',
};

// ── Collected objects for iteration ─────────────────────────
export const spacing = {
  0: space0,
  px: spacePx,
  '0.5': space0_5,
  1: space1,
  '1.5': space1_5,
  2: space2,
  3: space3,
  4: space4,
  5: space5,
  6: space6,
  8: space8,
  10: space10,
  12: space12,
  16: space16,
  20: space20,
  24: space24,
  // Aliases
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
  xs: radiusXs,
  sm: radiusSm,
  md: radiusMd,
  lg: radiusLg,
  xl: radiusXl,
  '2xl': radius2xl,
  full: radiusFull,
};

export const durations = {
  instant: durationInstant,
  fast: durationFast,
  base: durationBase,
  moderate: durationModerate,
  slow: durationSlow,
  deliberate: durationDeliberate,
  ambient: durationAmbient,
  // Legacy
  normal: durationNormal,
  theatrical: durationTheatrical,
  entrance: durationEntrance,
};

export const easings = {
  default: easing,
  linear: easingLinear,
  easeOut: easingEaseOut,
  easeIn: easingEaseIn,
  easeInOut: easingEaseInOut,
  dramatic: easingDramatic,
  bounce: easingBounce,
  springSnappy: easingSpringSnappy,
  swiftuiSpringSnappy,
  swiftuiSpringSoft,
};

export const zIndex = {
  base: zBase,
  raised: zRaised,
  sticky: zSticky,
  header: zHeader,
  dropdown: zDropdown,
  overlay: zOverlay,
  modal: zModal,
  popover: zPopover,
  toast: zToast,
  tooltip: zTooltip,
  debug: zDebug,
};

export const icon = {
  size: {
    xs: iconXs, sm: iconSm, md: iconMd, lg: iconLg,
    xl: iconXl, '2xl': icon2xl, '3xl': icon3xl,
  },
  stroke: {
    thin: iconStrokeThin,
    normal: iconStrokeNormal,
    bold: iconStrokeBold,
  },
};

export const elevation = {
  flat: elevationFlat,
  raised: elevationRaised,
  floating: elevationFloating,
  critical: elevationCritical,
  live: elevationLive,
};
