// AUTO-GENERATED from src/system/contract.json by scripts/build-system.js — DO NOT EDIT.
// Edit src/system/contract.json and run `npm run build:system`.
// Runtime contract for the Operational Interface Doctrine.
//
// Unknown stable-axis values must trigger development assertions and fall
// back to neutral presentation in production (§6, §20). assertAxisValue()
// implements that: it throws when NODE_ENV !== "production", and returns
// false quietly otherwise so callers can omit the attribute.

export const CONTRACT_NAME = 'operational-interface-doctrine';
export const CONTRACT_VERSION = '0.3.0';

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
  typography: Object.freeze(['--oi-typography-body', '--oi-typography-heading', '--oi-typography-display', '--oi-typography-mono', '--oi-typography-size-label', '--oi-typography-size-body', '--oi-typography-size-title', '--oi-typography-size-display', '--oi-typography-line-compact', '--oi-typography-line-reading']),
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
  '--oi-typography-size-label',
  '--oi-typography-size-body',
  '--oi-typography-size-title',
  '--oi-typography-size-display',
  '--oi-typography-line-compact',
  '--oi-typography-line-reading',
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

// Full DOM, part, and public-hook contract for each primitive.
export const primitiveContracts = Object.freeze({
  'surface': Object.freeze({
    "stability": "experimental",
    "responsibility": "Containment, background, border, elevation, clipping",
    "axes": Object.freeze(["surface", "emphasis", "severity"]),
    "root": Object.freeze({
      "elements": Object.freeze(["*"]),
      "requiredAttributes": Object.freeze({
        "data-oi-surface": Object.freeze(["*"]),
      }),
      "forbiddenAttributes": Object.freeze([]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze([]),
    "partOrderPolicy": "none",
    "parts": Object.freeze({

    }),
    "publicHooks": Object.freeze(["--oi-surface-padding", "--oi-surface-overflow"]),
  }),
  'stack': Object.freeze({
    "stability": "experimental",
    "responsibility": "Vertical rhythm; parent owns gap and alignment",
    "axes": Object.freeze(["density"]),
    "root": Object.freeze({
      "elements": Object.freeze(["*"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze([]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze([]),
    "partOrderPolicy": "none",
    "parts": Object.freeze({

    }),
    "publicHooks": Object.freeze(["--oi-stack-gap", "--oi-stack-align"]),
  }),
  'cluster': Object.freeze({
    "stability": "experimental",
    "responsibility": "Inline grouping with gap, alignment, and wrap policy",
    "axes": Object.freeze(["density"]),
    "root": Object.freeze({
      "elements": Object.freeze(["*"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze([]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze([]),
    "partOrderPolicy": "none",
    "parts": Object.freeze({

    }),
    "publicHooks": Object.freeze(["--oi-cluster-gap", "--oi-cluster-align", "--oi-cluster-justify", "--oi-cluster-wrap"]),
  }),
  'rail': Object.freeze({
    "stability": "experimental",
    "responsibility": "Fixed and fluid column relationship with an explicit collapse rule",
    "axes": Object.freeze(["density"]),
    "root": Object.freeze({
      "elements": Object.freeze(["*"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze([]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze(["rail", "content"]),
    "partOrderPolicy": "either",
    "parts": Object.freeze({
      "rail": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["*"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
      "content": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["*"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
    }),
    "publicHooks": Object.freeze(["--oi-rail-gap", "--oi-rail-size", "--oi-rail-content-min"]),
  }),
  'inset': Object.freeze({
    "stability": "experimental",
    "responsibility": "Recessed focus, evidence, or visualization region with an overflow policy",
    "axes": Object.freeze(["surface"]),
    "root": Object.freeze({
      "elements": Object.freeze(["*"]),
      "requiredAttributes": Object.freeze({
        "data-oi-surface": Object.freeze(["inset"]),
      }),
      "forbiddenAttributes": Object.freeze([]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze([]),
    "partOrderPolicy": "none",
    "parts": Object.freeze({

    }),
    "publicHooks": Object.freeze(["--oi-inset-padding", "--oi-inset-overflow"]),
  }),
  'divider': Object.freeze({
    "stability": "experimental",
    "responsibility": "Structural separation, declared semantic or decorative",
    "axes": Object.freeze(["emphasis"]),
    "root": Object.freeze({
      "elements": Object.freeze(["hr"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze(["tabindex"]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze([]),
    "partOrderPolicy": "none",
    "parts": Object.freeze({

    }),
    "publicHooks": Object.freeze(["--oi-divider-size"]),
  }),
  'metric': Object.freeze({
    "stability": "experimental",
    "responsibility": "Label, value, unit, trend, and provenance alignment with tabular numerics",
    "axes": Object.freeze(["severity", "emphasis", "source", "freshness", "certainty", "completeness"]),
    "root": Object.freeze({
      "elements": Object.freeze(["dl"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze(["role"]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze(["label", "value", "unit", "trend", "provenance"]),
    "partOrderPolicy": "listed",
    "parts": Object.freeze({
      "label": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["dt"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "value": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["dd"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "unit": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["dd"]),
        "cardinality": "zero-or-one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "trend": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["dd"]),
        "cardinality": "zero-or-one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "provenance": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["dd"]),
        "cardinality": "zero-or-one",
        "requiredAttributes": Object.freeze({
          "id": Object.freeze(["*"]),
        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
    }),
    "publicHooks": Object.freeze(["--oi-metric-value-size"]),
  }),
  'meter': Object.freeze({
    "stability": "experimental",
    "responsibility": "Bounded scalar measure with accessible minimum, maximum, current value, and label",
    "axes": Object.freeze(["severity", "activity"]),
    "root": Object.freeze({
      "elements": Object.freeze(["div"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze(["role"]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze(["label", "control", "track", "fill", "value", "description"]),
    "partOrderPolicy": "listed",
    "parts": Object.freeze({
      "label": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["label"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({
          "for": Object.freeze(["*"]),
        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "control": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["meter"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({
          "id": Object.freeze(["*"]),
          "min": Object.freeze(["*"]),
          "max": Object.freeze(["*"]),
          "value": Object.freeze(["*"]),
        }),
        "forbiddenAttributes": Object.freeze(["role", "aria-valuemin", "aria-valuemax", "aria-valuenow"]),
        "accessibleName": "required",
      }),
      "track": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["div"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({
          "aria-hidden": Object.freeze(["true"]),
        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
      "fill": Object.freeze({
        "parent": "track",
        "elements": Object.freeze(["span"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
      "value": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["span", "output"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "description": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["small", "span"]),
        "cardinality": "zero-or-one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
    }),
    "publicHooks": Object.freeze(["--oi-meter-track-size", "--oi-meter-value", "--oi-meter-value-size"]),
  }),
  'disclosure': Object.freeze({
    "stability": "experimental",
    "responsibility": "Native expandable structure with summary ownership and focus behavior",
    "axes": Object.freeze(["density"]),
    "root": Object.freeze({
      "elements": Object.freeze(["details"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze(["role", "tabindex", "aria-expanded"]),
      "accessibleName": "none",
    }),
    "partOrder": Object.freeze(["summary", "content"]),
    "partOrderPolicy": "listed",
    "parts": Object.freeze({
      "summary": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["summary"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze(["role", "tabindex", "aria-expanded"]),
        "accessibleName": "contents",
      }),
      "content": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["div", "section"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
    }),
    "publicHooks": Object.freeze([]),
  }),
  'history-strip': Object.freeze({
    "stability": "experimental",
    "responsibility": "Compact temporal distribution with a non-color intensity channel",
    "axes": Object.freeze(["severity", "freshness"]),
    "root": Object.freeze({
      "elements": Object.freeze(["ol"]),
      "requiredAttributes": Object.freeze({

      }),
      "forbiddenAttributes": Object.freeze(["role"]),
      "accessibleName": "required",
    }),
    "partOrder": Object.freeze(["item", "time", "bar", "value"]),
    "partOrderPolicy": "listed",
    "parts": Object.freeze({
      "item": Object.freeze({
        "parent": "root",
        "elements": Object.freeze(["li"]),
        "cardinality": "one-or-more",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
      "time": Object.freeze({
        "parent": "item",
        "elements": Object.freeze(["time"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({
          "datetime": Object.freeze(["*"]),
        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
      "bar": Object.freeze({
        "parent": "item",
        "elements": Object.freeze(["span"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({
          "aria-hidden": Object.freeze(["true"]),
        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "none",
      }),
      "value": Object.freeze({
        "parent": "item",
        "elements": Object.freeze(["span"]),
        "cardinality": "one",
        "requiredAttributes": Object.freeze({

        }),
        "forbiddenAttributes": Object.freeze([]),
        "accessibleName": "contents",
      }),
    }),
    "publicHooks": Object.freeze(["--oi-history-intensity", "--oi-history-item-size", "--oi-history-gap"]),
  }),
});

// Owner-qualified public part classes; arbitrary BEM selectors are not contract.
export const primitivePartClasses = Object.freeze({
  'surface': Object.freeze({

  }),
  'stack': Object.freeze({

  }),
  'cluster': Object.freeze({

  }),
  'rail': Object.freeze({
    "rail": "oi-rail__rail",
    "content": "oi-rail__content",
  }),
  'inset': Object.freeze({

  }),
  'divider': Object.freeze({

  }),
  'metric': Object.freeze({
    "label": "oi-metric__label",
    "value": "oi-metric__value",
    "unit": "oi-metric__unit",
    "trend": "oi-metric__trend",
    "provenance": "oi-metric__provenance",
  }),
  'meter': Object.freeze({
    "label": "oi-meter__label",
    "control": "oi-meter__control",
    "track": "oi-meter__track",
    "fill": "oi-meter__fill",
    "value": "oi-meter__value",
    "description": "oi-meter__description",
  }),
  'disclosure': Object.freeze({
    "summary": "oi-disclosure__summary",
    "content": "oi-disclosure__content",
  }),
  'history-strip': Object.freeze({
    "item": "oi-history-strip__item",
    "time": "oi-history-strip__time",
    "bar": "oi-history-strip__bar",
    "value": "oi-history-strip__value",
  }),
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
