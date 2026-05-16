// Dark Roast: Black Label — Glow Tokens
// Multi-layer phosphor-style box-shadow values.
// Three layers per glow: white hotspot, color midband, color wash.
// IMPORTANT: Glows are box-shadow values, NOT colors.

// ── Amber Glows ─────────────────────────────────────────────
export const glowAmber =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 10px rgba(230, 154, 76, 0.25), ' +
  '0 0 24px rgba(230, 154, 76, 0.10)';

export const glowAmberIntense =
  '0 0 4px rgba(255, 255, 255, 0.5), ' +
  '0 0 14px rgba(230, 154, 76, 0.40), ' +
  '0 0 32px rgba(230, 154, 76, 0.15)';

// ── Teal Glows ──────────────────────────────────────────────
export const glowTeal =
  '0 0 2px rgba(255, 255, 255, 0.4), ' +
  '0 0 8px rgba(76, 196, 180, 0.35), ' +
  '0 0 24px rgba(76, 196, 180, 0.12)';

export const glowTealIntense =
  '0 0 4px rgba(255, 255, 255, 0.6), ' +
  '0 0 16px rgba(76, 196, 180, 0.50), ' +
  '0 0 36px rgba(76, 196, 180, 0.20)';

// ── Scarlet Glows ───────────────────────────────────────────
export const glowScarlet =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 8px rgba(196, 76, 76, 0.40), ' +
  '0 0 16px rgba(196, 76, 76, 0.15)';

export const glowScarletIntense =
  '0 0 4px rgba(255, 255, 255, 0.5), ' +
  '0 0 14px rgba(196, 76, 76, 0.55), ' +
  '0 0 28px rgba(196, 76, 76, 0.20)';

// ── Gold Glows ──────────────────────────────────────────────
export const glowGold =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 10px rgba(218, 165, 32, 0.25), ' +
  '0 0 24px rgba(218, 165, 32, 0.10)';

export const glowGoldIntense =
  '0 0 4px rgba(255, 255, 255, 0.5), ' +
  '0 0 14px rgba(218, 165, 32, 0.40), ' +
  '0 0 32px rgba(218, 165, 32, 0.15)';

// ── Amber-Hot Glow ──────────────────────────────────────────
export const glowAmberHot =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 8px rgba(210, 105, 30, 0.30), ' +
  '0 0 20px rgba(210, 105, 30, 0.10)';

// ── Clinical Severity Glows (Option C, v4.1.0) ──────────────
// WHY: worsening carries the scarlet urgency profile (tighter, brighter
// midband) so a deteriorating problem reads as alarming; improving/stable
// use the calm gold profile. Matches the hue split in colors.js.
export const glowMagenta =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 8px rgba(194, 95, 144, 0.40), ' +
  '0 0 16px rgba(194, 95, 144, 0.15)';

export const glowHarvest =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 10px rgba(212, 160, 64, 0.25), ' +
  '0 0 24px rgba(212, 160, 64, 0.10)';

export const glowOlive =
  '0 0 2px rgba(255, 255, 255, 0.3), ' +
  '0 0 10px rgba(135, 154, 57, 0.25), ' +
  '0 0 24px rgba(135, 154, 57, 0.10)';

// ── Ghost Glow (empty state cards) ──────────────────────────
export const glowTealGhost =
  '0 0 4px rgba(76, 196, 180, 0.08), ' +
  '0 0 12px rgba(76, 196, 180, 0.03)';

// ── Glass Panel Gradient ────────────────────────────────────
// NOTE: Uses var() references — only works in CSS context.
// For JS use, compose with the color values from colors.js.
export const glassGradientCSS = 'linear-gradient(145deg, var(--dr-espresso), rgba(60, 42, 33, 0.2))';
export const glassGradient = 'linear-gradient(145deg, #2A1C13, rgba(60, 42, 33, 0.2))';

// ── Collected object for iteration ──────────────────────────
export const glows = {
  amber: glowAmber,
  amberIntense: glowAmberIntense,
  teal: glowTeal,
  tealIntense: glowTealIntense,
  scarlet: glowScarlet,
  scarletIntense: glowScarletIntense,
  gold: glowGold,
  goldIntense: glowGoldIntense,
  amberHot: glowAmberHot,
  magenta: glowMagenta,
  harvest: glowHarvest,
  olive: glowOlive,
  tealGhost: glowTealGhost,
};
