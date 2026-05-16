// Dark Roast: Black Label — Color Tokens
// Generated from tokens.json v4.1.0
// Surface scale (6 steps) + foregrounds + geological accents + action colors + opacity variants + semantic roles.

// ── Surface Scale (monotonic dark → light) ──────────────────
// OLED science: void (#120C06) keeps pixels at 1.6ms wake delay,
// avoiding 18.5ms purple-smearing of pure black (#000000).
export const void_ = '#120C06';           // Page/app background, deepest layer
export const obsidian = '#160E08';        // Content background, elevated floor
export const darkCacao = '#1E140E';       // Elevated surfaces: modals, sheets, popovers
export const espresso = '#2A1C13';        // Card/panel backgrounds (was `grain` in v3)
export const espressoHover = '#382818';   // Warm lift on hover/focus (was `grainHover` in v3)
export const roastedBean = '#3C2A1E';     // Borders, dividers
export const crater = '#4D3B31';          // Top of surface scale, geological accent (was `craterLt` in v3)

// ── Foregrounds ─────────────────────────────────────────────
export const crema = '#FFF7EE';           // Hero text, brand chrome, highest contrast
export const warmWhite = '#F0E6D0';       // Bright callouts, ANSI 15
export const bone = '#EBE1D7';            // Reduced-contrast body, codex ink
export const mocha = '#8B7355';           // Muted secondary, captions, labels

// ── Geological Accent Layer ─────────────────────────────────
export const craterDeep = '#3C2A21';      // Geological accent, darker (was `crater` in v3)
export const asparagus = '#465945';       // Tertiary metadata, timestamps
export const rustic = '#480404';          // Grounded interactive red state
export const rose = '#480607';            // Contextual error background

// ── Action & State (color-name primitives) ──────────────────
export const amber = '#E69A4C';           // Primary accent, cursor, CTAs
export const amberHot = '#D2691E';        // Gradient terminal, escalation/hover (no longer severity — see Option C)
export const amberMuted = '#C07A4A';      // Reader contexts, Mystic2 parity
export const gold = '#DAA520';            // Stable severity, true gold
export const brass = '#BFA162';           // Warning, caution
export const scarlet = '#C44C4C';         // Clinical critical severity
export const burntSienna = '#C75B39';     // Terminal error, UI error (ANSI red)
export const teal = '#4CC4B4';            // Success, live data, kinetic teal

// ── Clinical Severity Hues (Option C, v4.1.0) ───────────────
// WHY: worsening/improving/stable previously aliased amberHot/amber/gold —
// a 3° hue spread that collapses to "vaguely amber" at census scanning
// speed. These three occupy distinct hue families (333°/39°/72°) so the
// clinical distinction survives peripheral vision and display variation.
// Directional states still require paired iconography (see DESIGN-SYSTEM.md).
export const magenta = '#C25F90';         // Worsening severity (hue 333°)
export const harvest = '#D4A040';         // Improving severity (hue 39°)
export const olive = '#879A39';           // Stable severity (hue 72°)

// ── Opacity Variants ────────────────────────────────────────
// dim (40%) — focused borders, active rings
// subtle (10%) — hover backgrounds, light fills
// ghost (5%) — skeleton loads, faint state

export const amberDim = 'rgba(230, 154, 76, 0.40)';
export const amberSubtle = 'rgba(230, 154, 76, 0.10)';
export const amberGhost = 'rgba(230, 154, 76, 0.05)';

export const amberHotDim = 'rgba(210, 105, 30, 0.40)';
export const amberHotSubtle = 'rgba(210, 105, 30, 0.10)';
export const amberHotGhost = 'rgba(210, 105, 30, 0.05)';

export const goldDim = 'rgba(218, 165, 32, 0.40)';
export const goldSubtle = 'rgba(218, 165, 32, 0.10)';
export const goldGhost = 'rgba(218, 165, 32, 0.05)';

export const scarletDim = 'rgba(196, 76, 76, 0.40)';
export const scarletSubtle = 'rgba(196, 76, 76, 0.10)';
export const scarletGhost = 'rgba(196, 76, 76, 0.05)';

export const tealDim = 'rgba(76, 196, 180, 0.40)';
export const tealSubtle = 'rgba(76, 196, 180, 0.10)';
export const tealGhost = 'rgba(76, 196, 180, 0.05)';

export const brassDim = 'rgba(191, 161, 98, 0.40)';
export const brassSubtle = 'rgba(191, 161, 98, 0.10)';
export const brassGhost = 'rgba(191, 161, 98, 0.05)';

export const burntSiennaDim = 'rgba(199, 91, 57, 0.40)';
export const burntSiennaSubtle = 'rgba(199, 91, 57, 0.10)';
export const burntSiennaGhost = 'rgba(199, 91, 57, 0.05)';

export const magentaDim = 'rgba(194, 95, 144, 0.40)';
export const magentaSubtle = 'rgba(194, 95, 144, 0.10)';
export const magentaGhost = 'rgba(194, 95, 144, 0.05)';

export const harvestDim = 'rgba(212, 160, 64, 0.40)';
export const harvestSubtle = 'rgba(212, 160, 64, 0.10)';
export const harvestGhost = 'rgba(212, 160, 64, 0.05)';

export const oliveDim = 'rgba(135, 154, 57, 0.40)';
export const oliveSubtle = 'rgba(135, 154, 57, 0.10)';
export const oliveGhost = 'rgba(135, 154, 57, 0.05)';

// ── Structural Derived ──────────────────────────────────────
export const divider = 'rgba(255, 247, 238, 0.04)';

// ── Semantic Roles (pointers into primitives) ───────────────
// Prefer these in new code for portability; primitives remain canonical.
export const accent = amber;
export const accentHot = amberHot;
export const accentMuted = amberMuted;
export const success = teal;
export const warning = brass;
export const error = burntSienna;
export const critical = scarlet;
export const stable = gold;
export const live = teal;

// ── Collected objects for iteration ─────────────────────────
export const colors = {
  // Surface scale
  void: void_,
  obsidian,
  darkCacao,
  espresso,
  espressoHover,
  roastedBean,
  crater,
  // Foregrounds
  crema,
  warmWhite,
  bone,
  mocha,
  // Geological accents
  craterDeep,
  asparagus,
  rustic,
  rose,
  // Action colors
  amber,
  amberHot,
  amberMuted,
  gold,
  brass,
  scarlet,
  burntSienna,
  teal,
  // Clinical severity hues (Option C)
  magenta,
  harvest,
  olive,
};

export const roles = {
  accent,
  accentHot,
  accentMuted,
  success,
  warning,
  error,
  critical,
  stable,
  live,
  display: crema,
  workhorse: bone,
  secondary: mocha,
  tertiary: asparagus,
};

export const opacityVariants = {
  amberDim, amberSubtle, amberGhost,
  amberHotDim, amberHotSubtle, amberHotGhost,
  goldDim, goldSubtle, goldGhost,
  scarletDim, scarletSubtle, scarletGhost,
  tealDim, tealSubtle, tealGhost,
  brassDim, brassSubtle, brassGhost,
  burntSiennaDim, burntSiennaSubtle, burntSiennaGhost,
  magentaDim, magentaSubtle, magentaGhost,
  harvestDim, harvestSubtle, harvestGhost,
  oliveDim, oliveSubtle, oliveGhost,
  divider,
};

// ── Opacity Scale (alpha channel, hex suffix form) ──────────
// Use for composing rgba() dynamically or hex-suffix overlays.
export const opacityScale = {
  0: 0.0,
  4: 0.04,
  5: 0.05,
  8: 0.08,
  10: 0.10,
  12: 0.12,
  15: 0.15,
  24: 0.24,
  40: 0.40,
  60: 0.60,
  85: 0.85,
  100: 1.0,
};
