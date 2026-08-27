// AUTO-GENERATED from src/system/contract.json by scripts/build-system.js — DO NOT EDIT.
// Edit src/system/contract.json and run `npm run build:system`.
// Runtime contract for the Operational Interface Doctrine.
//
// Unknown stable-axis values must trigger development assertions and fall
// back to neutral presentation in production (§6, §20). assertAxisValue()
// implements that: it throws when NODE_ENV !== "production", and returns
// false quietly otherwise so callers can omit the attribute.

export const CONTRACT_NAME = 'operational-interface-doctrine';
export const CONTRACT_VERSION = '0.2.0';

// ── Naming contract (§6) ──
export const cssClassPrefix = 'oi-';
export const cssVariablePrefix = '--oi-';
export const axisAttributePrefix = 'data-oi-';
export const slotAttribute = 'data-oi-slot';
export const typeScriptTypePrefix = 'Oi';
export const swiftTypePrefix = 'OI';

// ── Axes (§7) ──
export const surface = Object.freeze(['canvas', 'base', 'raised', 'interactive', 'inset', 'overlay', 'scrim']);
export const activity = Object.freeze(['idle', 'loading', 'refreshing', 'live', 'ready', 'failed']);
export const severity = Object.freeze(['neutral', 'informational', 'positive', 'warning', 'negative', 'critical']);
export const freshness = Object.freeze(['live', 'recent', 'stale', 'unknown']);
export const certainty = Object.freeze(['confirmed', 'inferred', 'uncertain', 'disputed']);
export const completeness = Object.freeze(['complete', 'partial', 'missing', 'unavailable']);
export const source = Object.freeze(['direct', 'derived', 'generated', 'user-entered', 'external']);
export const emphasis = Object.freeze(['quiet', 'normal', 'strong']);
export const density = Object.freeze(['compact', 'standard', 'spacious']);

export const axes = Object.freeze({
  surface,
  activity,
  severity,
  freshness,
  certainty,
  completeness,
  source,
  emphasis,
  density,
});

// Public attribute name for each axis, e.g. surface -> data-oi-surface.
export const axisAttributes = Object.freeze({
  surface: 'data-oi-surface',
  activity: 'data-oi-activity',
  severity: 'data-oi-severity',
  freshness: 'data-oi-freshness',
  certainty: 'data-oi-certainty',
  completeness: 'data-oi-completeness',
  source: 'data-oi-source',
  emphasis: 'data-oi-emphasis',
  density: 'data-oi-density',
});

// ── Axis stability (§19) ──
// Adding a value to a stable closed axis is a MAJOR bump, because domain
// adapters may switch exhaustively over it.
export const axisStability = Object.freeze({
  surface: 'stable',
  activity: 'stable',
  severity: 'stable',
  freshness: 'stable',
  certainty: 'stable',
  completeness: 'stable',
  source: 'stable',
  emphasis: 'stable',
  density: 'stable',
});

// ── Truth axes (§9) ──
export const truthAxes = Object.freeze(['source', 'freshness', 'certainty', 'completeness']);

// ── Semantic roles (§8) ──
// Full custom-property names. Primitives and recipes consume ONLY these;
// reaching for a palette token such as --dr-espresso is "token soup" (§23).
export const semanticRoles = Object.freeze({
  surface: Object.freeze(['--oi-surface-canvas', '--oi-surface-base', '--oi-surface-raised', '--oi-surface-interactive', '--oi-surface-hover', '--oi-surface-inset', '--oi-surface-overlay', '--oi-surface-scrim']),
  text: Object.freeze(['--oi-text-primary', '--oi-text-body', '--oi-text-muted', '--oi-text-inverse', '--oi-text-link']),
  border: Object.freeze(['--oi-border-subtle', '--oi-border-default', '--oi-border-strong', '--oi-border-focus']),
  status: Object.freeze(['--oi-status-informational', '--oi-status-positive', '--oi-status-warning', '--oi-status-negative', '--oi-status-critical', '--oi-status-live']),
  accent: Object.freeze(['--oi-accent-primary', '--oi-accent-active', '--oi-accent-muted']),
  typography: Object.freeze(['--oi-typography-body', '--oi-typography-heading', '--oi-typography-display', '--oi-typography-mono']),
  geometry: Object.freeze(['--oi-geometry-space', '--oi-geometry-radius-control', '--oi-geometry-radius-surface', '--oi-geometry-radius-overlay']),
  elevation: Object.freeze(['--oi-elevation-flat', '--oi-elevation-raised', '--oi-elevation-overlay', '--oi-elevation-live', '--oi-elevation-critical']),
  motion: Object.freeze(['--oi-motion-duration-fast', '--oi-motion-duration-normal', '--oi-motion-duration-slow', '--oi-motion-ease-standard', '--oi-motion-ease-emphasized']),
  interaction: Object.freeze(['--oi-interaction-focus-ring-width', '--oi-interaction-focus-ring-offset', '--oi-interaction-pointer-target-min', '--oi-interaction-touch-target-min']),
});

export const semanticRoleVariables = Object.freeze([
  '--oi-surface-canvas',
  '--oi-surface-base',
  '--oi-surface-raised',
  '--oi-surface-interactive',
  '--oi-surface-hover',
  '--oi-surface-inset',
  '--oi-surface-overlay',
  '--oi-surface-scrim',
  '--oi-text-primary',
  '--oi-text-body',
  '--oi-text-muted',
  '--oi-text-inverse',
  '--oi-text-link',
  '--oi-border-subtle',
  '--oi-border-default',
  '--oi-border-strong',
  '--oi-border-focus',
  '--oi-status-informational',
  '--oi-status-positive',
  '--oi-status-warning',
  '--oi-status-negative',
  '--oi-status-critical',
  '--oi-status-live',
  '--oi-accent-primary',
  '--oi-accent-active',
  '--oi-accent-muted',
  '--oi-typography-body',
  '--oi-typography-heading',
  '--oi-typography-display',
  '--oi-typography-mono',
  '--oi-geometry-space',
  '--oi-geometry-radius-control',
  '--oi-geometry-radius-surface',
  '--oi-geometry-radius-overlay',
  '--oi-elevation-flat',
  '--oi-elevation-raised',
  '--oi-elevation-overlay',
  '--oi-elevation-live',
  '--oi-elevation-critical',
  '--oi-motion-duration-fast',
  '--oi-motion-duration-normal',
  '--oi-motion-duration-slow',
  '--oi-motion-ease-standard',
  '--oi-motion-ease-emphasized',
  '--oi-interaction-focus-ring-width',
  '--oi-interaction-focus-ring-offset',
  '--oi-interaction-pointer-target-min',
  '--oi-interaction-touch-target-min',
]);

// ── Primitives (§10) ──
export const primitives = Object.freeze(['surface', 'stack', 'cluster', 'rail', 'inset', 'divider', 'metric', 'meter', 'disclosure', 'history-strip']);

export const primitiveAxes = Object.freeze({
  'surface': Object.freeze(['surface', 'emphasis', 'severity']),
  'stack': Object.freeze(['density']),
  'cluster': Object.freeze(['density']),
  'rail': Object.freeze(['density']),
  'inset': Object.freeze(['surface']),
  'divider': Object.freeze(['emphasis']),
  'metric': Object.freeze(['severity', 'emphasis', 'source', 'freshness', 'certainty', 'completeness']),
  'meter': Object.freeze(['severity', 'activity']),
  'disclosure': Object.freeze(['density']),
  'history-strip': Object.freeze(['severity', 'freshness']),
});

// ── Recipes (§11) ──
export const recipes = Object.freeze(['compact-monitor']);

export const recipeContracts = Object.freeze({
  'compact-monitor': Object.freeze({
    stability: 'experimental',
    slotOrder: Object.freeze(['context', 'actions', 'focus', 'status', 'primary', 'details', 'history', 'settings']),
    requiredSlots: Object.freeze(['status', 'primary']),
    optionalSlots: Object.freeze(['context', 'actions', 'focus', 'details', 'history', 'settings']),
    supportedDensities: Object.freeze(['compact', 'standard']),
    publicHooks: Object.freeze([]),
  }),
});

export const reservedRecipeNames = Object.freeze(['dense-inspector', 'operational-summary', 'contextual-sidebar', 'conversation-shell', 'context-composer']);
export const stabilityLadder = Object.freeze(['study', 'candidate', 'experimental', 'proven', 'stable', 'deprecated']);
export const forbiddenDomainTerms = Object.freeze(['patient', 'physician', 'clinician', 'diagnosis', 'medication', 'potassium', 'vitals', 'census', 'discharge', 'admission', 'encounter', 'triage', 'acuity', 'portfolio', 'drawdown', 'ticker', 'inbox', 'mailbox']);

// ── Development assertions (§13, §20) ──

function isDevelopmentEnvironment(options) {
  if (typeof options?.development === 'boolean') return options.development;
  return typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';
}

/**
 * Validate a value against a contract axis.
 *
 * Throws in development so unknown values surface immediately; returns
 * false in production so the caller can omit the attribute and inherit
 * neutral presentation instead of crashing an operational surface.
 *
 * @param {string} axis  Axis name, e.g. "severity".
 * @param {string} value Candidate value, e.g. "critical".
 * @param {{development?: boolean}} [options] Explicit native-browser development mode.
 * @returns {boolean} true when the value is valid for the axis.
 */
export function assertAxisValue(axis, value, options) {
  const allowed = axes[axis];
  if (!allowed) {
    if (isDevelopmentEnvironment(options)) {
      throw new Error(`[oi] unknown axis "${axis}"; expected one of ${Object.keys(axes).join(', ')}`);
    }
    return false;
  }
  if (allowed.includes(value)) return true;
  if (isDevelopmentEnvironment(options)) {
    throw new Error(`[oi] "${value}" is not a valid ${axis}; expected one of ${allowed.join(', ')}`);
  }
  return false;
}

/**
 * Validate that a recipe receives every slot it requires.
 *
 * Missing required slots fail fixtures and development assertions (§20).
 *
 * @param {string} recipe Recipe name, e.g. "compact-monitor".
 * @param {string[]} providedSlots Slot names present in the DOM.
 * @param {{development?: boolean}} [options] Explicit native-browser development mode.
 * @returns {string[]} Missing required slot names; empty when satisfied.
 */
export function missingRequiredSlots(recipe, providedSlots, options) {
  const contract = recipeContracts[recipe];
  if (!contract) {
    if (isDevelopmentEnvironment(options)) {
      throw new Error(`[oi] unknown recipe "${recipe}"; expected one of ${recipes.join(', ')}`);
    }
    return [];
  }
  const provided = new Set(providedSlots);
  return contract.requiredSlots.filter((slot) => !provided.has(slot));
}

/**
 * True when the axis combination describes information whose provenance
 * must be represented (§5.4, §9). Generated, inferred, stale, or partial
 * data must never carry the visual authority of confirmed direct data —
 * the "truth laundering" anti-pattern (§23).
 *
 * @param {{source?: string, certainty?: string, freshness?: string, completeness?: string}} state
 * @returns {boolean}
 */
export function requiresProvenanceDisclosure(state) {
  const { source, certainty, freshness, completeness } = state ?? {};
  return (
    (source !== undefined && source !== 'direct') ||
    (certainty !== undefined && certainty !== 'confirmed') ||
    (freshness !== undefined && freshness !== 'live' && freshness !== 'recent') ||
    (completeness !== undefined && completeness !== 'complete')
  );
}
