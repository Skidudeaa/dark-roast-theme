// AUTO-GENERATED from src/tokens.json by scripts/build-tokens.js — DO NOT EDIT.
// Edit src/tokens.json and run `npm run build`.
// Color tokens: surface scale, foregrounds, accents, action colors,
// severity hues, opacity variants, semantic roles.

// ── Monotonic dark→light: void → obsidian → darkCacao → espresso → roastedBean → crater ──
export const void_ = '#120C06';
export const obsidian = '#160E08';
export const darkCacao = '#1E140E';
export const espresso = '#2A1C13';
export const espressoHover = '#382818';
export const roastedBean = '#3C2A1E';
export const crater = '#4D3B31';

// ── crema = hero/display, bone = reading midpoint, mocha = muted body, warmWhite = bright callouts ──
export const crema = '#FFF7EE';
export const warmWhite = '#F0E6D0';
export const bone = '#EBE1D7';
export const mocha = '#8B7355';

// ── craterDeep = darker geological accent, asparagus = tertiary metadata, rustic/rose = grounded error states ──
export const craterDeep = '#3C2A21';
export const asparagus = '#465945';
export const rustic = '#480404';
export const rose = '#480607';

// ── Color-name primitives. Semantic roles below alias these. ──
export const amber = '#E69A4C';
export const amberHot = '#D2691E';
export const amberMuted = '#C07A4A';
export const gold = '#DAA520';
export const brass = '#BFA162';
export const scarlet = '#C44C4C';
export const burntSienna = '#C75B39';
export const teal = '#4CC4B4';

// ── Clinical severity primitives (Option C, v4.1.0). Distinct hue families so worsening/improving/stable cannot blend at census scanning speed: magenta 333°, harvest 39°, olive 72°. See docs/DESIGN-SYSTEM.md Palette Rules. Directional severity states REQUIRE paired iconography — color is category, icon is direction. ──
export const magenta = '#C25F90';
export const harvest = '#D4A040';
export const olive = '#879A39';

// ── Opacity Variants (dim 40% / subtle 10% / ghost 5%) ──
export const amberDim = 'rgba(230, 154, 76, 0.4)';
export const amberSubtle = 'rgba(230, 154, 76, 0.1)';
export const amberGhost = 'rgba(230, 154, 76, 0.05)';
export const amberHotDim = 'rgba(210, 105, 30, 0.4)';
export const amberHotSubtle = 'rgba(210, 105, 30, 0.1)';
export const amberHotGhost = 'rgba(210, 105, 30, 0.05)';
export const goldDim = 'rgba(218, 165, 32, 0.4)';
export const goldSubtle = 'rgba(218, 165, 32, 0.1)';
export const goldGhost = 'rgba(218, 165, 32, 0.05)';
export const scarletDim = 'rgba(196, 76, 76, 0.4)';
export const scarletSubtle = 'rgba(196, 76, 76, 0.1)';
export const scarletGhost = 'rgba(196, 76, 76, 0.05)';
export const tealDim = 'rgba(76, 196, 180, 0.4)';
export const tealSubtle = 'rgba(76, 196, 180, 0.1)';
export const tealGhost = 'rgba(76, 196, 180, 0.05)';
export const brassDim = 'rgba(191, 161, 98, 0.4)';
export const brassSubtle = 'rgba(191, 161, 98, 0.1)';
export const brassGhost = 'rgba(191, 161, 98, 0.05)';
export const burntSiennaDim = 'rgba(199, 91, 57, 0.4)';
export const burntSiennaSubtle = 'rgba(199, 91, 57, 0.1)';
export const burntSiennaGhost = 'rgba(199, 91, 57, 0.05)';
export const magentaDim = 'rgba(194, 95, 144, 0.4)';
export const magentaSubtle = 'rgba(194, 95, 144, 0.1)';
export const magentaGhost = 'rgba(194, 95, 144, 0.05)';
export const harvestDim = 'rgba(212, 160, 64, 0.4)';
export const harvestSubtle = 'rgba(212, 160, 64, 0.1)';
export const harvestGhost = 'rgba(212, 160, 64, 0.05)';
export const oliveDim = 'rgba(135, 154, 57, 0.4)';
export const oliveSubtle = 'rgba(135, 154, 57, 0.1)';
export const oliveGhost = 'rgba(135, 154, 57, 0.05)';

// ── Structural derived ──
export const divider = 'rgba(255, 247, 238, 0.04)';

// ── Semantic Roles (pointers into primitives) ──
export const accent = amber;
export const accentHot = amberHot;
export const accentMuted = amberMuted;
export const success = teal;
export const warning = brass;
export const error = burntSienna;
export const critical = scarlet;
export const stable = gold;
export const live = teal;

export const colors = {
  void: void_,
  obsidian,
  darkCacao,
  espresso,
  espressoHover,
  roastedBean,
  crater,
  crema,
  warmWhite,
  bone,
  mocha,
  craterDeep,
  asparagus,
  rustic,
  rose,
  amber,
  amberHot,
  amberMuted,
  gold,
  brass,
  scarlet,
  burntSienna,
  teal,
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

export const opacityScale = {
  0: 0,
  4: 0.04,
  5: 0.05,
  8: 0.08,
  10: 0.1,
  12: 0.12,
  15: 0.15,
  24: 0.24,
  40: 0.4,
  60: 0.6,
  85: 0.85,
  100: 1,
};
