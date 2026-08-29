import { recipeContracts } from '../../dist/system/contract.js';

const contract = recipeContracts['compact-monitor'];
if (!contract) throw new Error('compact-monitor contract is not generated');

const THEME_STYLESHEETS = {
  'dark-roast': '../../dist/css/dark-roast.css',
  'night-shift': '../../dist/css/dark-roast-night-shift.css',
  'house-blend': '../../dist/css/dark-roast-house-blend.css',
  alien: '../../dist/css/dark-roast.css',
};

const THEME_CLASSES = {
  'dark-roast': 'dark-roast',
  'night-shift': 'dark-roast-night-shift',
  'house-blend': 'dark-roast-house-blend',
  alien: '',
};

const WIDTHS = {
  'minimum-viable': contract.widths.minimumViable,
  preferred: contract.widths.preferred,
  wide: contract.widths.wide,
};

const SCENARIOS = {
  'initial-loading': {
    axes: {
      activity: 'loading',
      severity: 'neutral',
      freshness: 'unknown',
      certainty: 'uncertain',
      completeness: 'missing',
      source: 'external',
    },
    label: 'Loading initial result',
    detail: 'No prior value exists. The primary region retains its contracted geometry.',
    primaryMode: 'loading',
    value: 'Awaiting result',
    unit: '',
    trend: 'Initial request in progress',
    provenance: 'External source, freshness unknown, certainty uncertain, result missing.',
  },
  'ready-complete': {
    axes: {
      activity: 'ready',
      severity: 'neutral',
      freshness: 'recent',
      certainty: 'confirmed',
      completeness: 'complete',
      source: 'direct',
    },
    label: 'Ready and complete',
    detail: 'Confirmed direct result updated two minutes ago.',
    value: '37.5',
    unit: 'percent',
    trend: 'Up 2.5 percentage points',
    provenance: 'Direct, confirmed, recent, and complete.',
  },
  'refreshing-retained': {
    axes: {
      activity: 'refreshing',
      severity: 'informational',
      freshness: 'recent',
      certainty: 'confirmed',
      completeness: 'complete',
      source: 'direct',
    },
    label: 'Refreshing retained result',
    detail: 'The last confirmed value remains visible while refresh is in progress.',
    value: '37.5',
    unit: 'percent retained',
    trend: 'Refresh in progress; prior value retained',
    provenance: 'Direct confirmed result retained from two minutes ago.',
  },
  live: {
    axes: {
      activity: 'live',
      severity: 'positive',
      freshness: 'live',
      certainty: 'confirmed',
      completeness: 'complete',
      source: 'direct',
    },
    label: 'Live result',
    detail: 'The visible value is actively updating from a direct source.',
    value: '42.0',
    unit: 'live units',
    trend: 'Live stream active',
    provenance: 'Direct, confirmed, live, and complete.',
  },
  partial: {
    axes: {
      activity: 'ready',
      severity: 'warning',
      freshness: 'recent',
      certainty: 'inferred',
      completeness: 'partial',
      source: 'derived',
    },
    label: 'Partial result',
    detail: 'Some expected inputs are absent; available information remains visible.',
    value: '18 of 24',
    unit: 'inputs',
    trend: 'Six expected inputs are absent',
    provenance: 'Derived, inferred, recent, and partial.',
  },
  stale: {
    axes: {
      activity: 'ready',
      severity: 'warning',
      freshness: 'stale',
      certainty: 'inferred',
      completeness: 'partial',
      source: 'external',
    },
    label: 'Stale retained result',
    detail: 'The last usable value remains visible and is explicitly marked stale.',
    value: '31.25',
    unit: 'stale units',
    trend: 'Last update was twenty-six hours ago',
    provenance: 'External, inferred, stale, and partial.',
  },
  missing: {
    axes: {
      activity: 'ready',
      severity: 'warning',
      freshness: 'unknown',
      certainty: 'uncertain',
      completeness: 'missing',
      source: 'external',
    },
    label: 'Expected result missing',
    detail: 'The expected value was not returned. No numeric substitute is shown.',
    value: 'Missing',
    unit: '',
    trend: 'Expected result not returned',
    provenance: 'External source, freshness unknown, certainty uncertain, result missing.',
  },
  unavailable: {
    axes: {
      activity: 'ready',
      severity: 'negative',
      freshness: 'unknown',
      certainty: 'uncertain',
      completeness: 'unavailable',
      source: 'external',
    },
    label: 'Source unavailable',
    detail: 'The source cannot currently provide a value. No stale value is implied.',
    value: 'Unavailable',
    unit: '',
    trend: 'Source connection unavailable',
    provenance: 'External source unavailable; freshness and certainty unknown.',
  },
  failed: {
    axes: {
      activity: 'failed',
      severity: 'negative',
      freshness: 'recent',
      certainty: 'confirmed',
      completeness: 'complete',
      source: 'direct',
    },
    label: 'Detail request failed',
    detail: 'Primary data remains healthy. The failure is isolated to the detail region.',
    value: '37.5',
    unit: 'retained units',
    trend: 'Primary result remains available',
    provenance: 'Direct confirmed primary result retained after detail failure.',
    detailFailure: true,
  },
  'valid-empty': {
    axes: {
      activity: 'ready',
      severity: 'neutral',
      freshness: 'recent',
      certainty: 'confirmed',
      completeness: 'complete',
      source: 'direct',
    },
    label: 'Valid empty result',
    detail: 'The request completed successfully and returned no matching results.',
    primaryMode: 'empty',
    value: 'No matching results',
    unit: '',
    trend: 'Empty is a complete ready result',
    provenance: 'Direct, confirmed, recent, complete, and empty.',
  },
};

const STATES = {
  neutral: { axes: { activity: 'ready', severity: 'neutral' }, label: 'Neutral state' },
  live: {
    axes: { activity: 'live', severity: 'informational', freshness: 'live' },
    label: 'Live state',
  },
  warning: { axes: { severity: 'warning' }, label: 'Warning state' },
  critical: { axes: { severity: 'critical' }, label: 'Critical state' },
  disabled: { axes: {}, label: 'Disabled controls', disabled: true },
  stale: { axes: { freshness: 'stale' }, label: 'Stale state' },
  uncertain: {
    axes: { certainty: 'uncertain', source: 'derived' },
    label: 'Uncertain derived state',
  },
  disputed: {
    axes: { certainty: 'disputed', severity: 'warning', source: 'external' },
    label: 'Disputed external state',
  },
  partial: { axes: { completeness: 'partial' }, label: 'Partial state' },
  refreshing: { axes: { activity: 'refreshing' }, label: 'Refreshing state' },
  failed: { axes: { activity: 'failed', severity: 'negative' }, label: 'Failed state' },
};

const STRESS = Object.fromEntries(
  [
    'reduced-motion',
    'increased-contrast',
    'forced-colors',
    'keyboard-focus',
    'zoom-200-reflow',
    'ltr',
    'rtl',
    'long-labels-2x',
    'large-negative-numbers',
    'missing-unknown-unavailable',
    'no-color',
  ].map((name) => [name, { name }]),
);

const SLOT_MODES = {
  full: contract.optionalSlots,
  'required-only': [],
  'no-chrome': contract.optionalSlots.filter(
    (slot) => !['context', 'actions'].includes(slot),
  ),
  'omit-context': contract.optionalSlots.filter((slot) => slot !== 'context'),
  'omit-actions': contract.optionalSlots.filter((slot) => slot !== 'actions'),
  'omit-focus': contract.optionalSlots.filter((slot) => slot !== 'focus'),
  'omit-details': contract.optionalSlots.filter((slot) => slot !== 'details'),
  'omit-history': contract.optionalSlots.filter((slot) => slot !== 'history'),
  'omit-settings': contract.optionalSlots.filter((slot) => slot !== 'settings'),
};

function assertExact(label, actual, expected) {
  const a = [...actual].sort();
  const e = [...expected].sort();
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) {
    throw new Error(`${label} fixture drift: expected ${e.join(', ')}, found ${a.join(', ')}`);
  }
}

assertExact('mapping', Object.keys(THEME_STYLESHEETS), contract.proofFixtures.mappings);
assertExact('width', Object.keys(WIDTHS), contract.proofFixtures.widths);
assertExact('async scenario', Object.keys(SCENARIOS), contract.proofFixtures.asyncScenarios);
assertExact('state', Object.keys(STATES), contract.proofFixtures.states);
assertExact('stress', Object.keys(STRESS), contract.proofFixtures.stress);

const parameters = new URLSearchParams(window.location.search);

function selected(name, allowed, fallback, optional = false) {
  const value = parameters.get(name);
  if (value === null && optional) return null;
  const resolved = value ?? fallback;
  if (!allowed.includes(resolved)) {
    throw new Error(`invalid ${name} ${JSON.stringify(resolved)}; expected ${allowed.join(', ')}`);
  }
  return resolved;
}

const selection = {
  mapping: selected('mapping', contract.proofFixtures.mappings, 'dark-roast'),
  width: selected('width', contract.proofFixtures.widths, 'preferred'),
  density: selected('density', contract.proofFixtures.densities, 'standard'),
  scenario: selected(
    'scenario',
    contract.proofFixtures.asyncScenarios,
    'ready-complete',
  ),
  state: selected('state', contract.proofFixtures.states, null, true),
  stress: selected('stress', contract.proofFixtures.stress, null, true),
  slots: selected('slots', Object.keys(SLOT_MODES), 'full'),
};

async function applyTheme(mapping) {
  const link = document.querySelector('#proof-theme');
  const stylesheet = THEME_STYLESHEETS[mapping];
  if (link.getAttribute('href') !== stylesheet) {
    const loaded = new Promise((resolve, reject) => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', () => reject(new Error(`failed to load ${stylesheet}`)), {
        once: true,
      });
    });
    link.setAttribute('href', stylesheet);
    await loaded;
  } else if (!link.sheet) {
    await new Promise((resolve, reject) => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', reject, { once: true });
    });
  }
  document.body.className = THEME_CLASSES[mapping];
  document.documentElement.style.colorScheme = mapping === 'alien' ? 'light' : 'dark';
}

function attributes(values) {
  return Object.entries(values)
    .map(([name, value]) => ` data-oi-${name}="${value}"`)
    .join('');
}

function metric({ id, label, value, unit, trend, provenance, axes }) {
  return `
    <dl class="oi-metric"${attributes(axes)} aria-describedby="${id}-provenance">
      <dt class="oi-metric__label">${label}</dt>
      <dd class="oi-metric__value">${value}</dd>
      ${unit ? `<dd class="oi-metric__unit">${unit}</dd>` : ''}
      <dd class="oi-metric__trend">${trend}</dd>
      <dd id="${id}-provenance" class="oi-metric__provenance">${provenance}</dd>
    </dl>`;
}

function primaryMarkup(configuration, stress) {
  if (stress === 'missing-unknown-unavailable') {
    return [
      metric({
        id: 'proof-missing',
        label: 'Expected value',
        value: 'Missing',
        unit: '',
        trend: 'Expected value not returned',
        provenance: 'External source; freshness unknown; result missing.',
        axes: { ...configuration.axes, freshness: 'unknown', completeness: 'missing' },
      }),
      metric({
        id: 'proof-unknown',
        label: 'Current certainty',
        value: 'Unknown',
        unit: '',
        trend: 'No certainty can be assigned',
        provenance: 'Derived source; freshness and certainty unknown.',
        axes: { ...configuration.axes, freshness: 'unknown', certainty: 'uncertain' },
      }),
      metric({
        id: 'proof-unavailable',
        label: 'Source result',
        value: 'Unavailable',
        unit: '',
        trend: 'Source cannot currently answer',
        provenance: 'External source unavailable.',
        axes: { ...configuration.axes, completeness: 'unavailable' },
      }),
    ].join('');
  }

  if (configuration.primaryMode === 'loading') {
    return `
      <p class="proof-loading-value">${configuration.value}</p>
      <span class="proof-visually-hidden">Primary result is loading.</span>`;
  }
  if (configuration.primaryMode === 'empty') {
    return `
      <p class="proof-loading-value">${configuration.value}</p>
      <p class="proof-status-detail">${configuration.provenance}</p>`;
  }

  const long = stress === 'long-labels-2x';
  const pathological = stress === 'large-negative-numbers';
  const firstLabel = long
    ? 'Current operational measure with a deliberately doubled explanatory label that must wrap without hiding meaning or displacing adjacent values'
    : 'Current measure';
  const firstValue = pathological ? '−9,223,372,036,854,775,808.125' : configuration.value;
  const firstUnit = pathological
    ? 'microunits per extraordinarily long reporting interval'
    : configuration.unit;
  const secondValue = pathological ? '+1.7976931348623157e+308' : '98.25';
  const identifier = long
    ? 'MONITOR_REFERENCE_IDENTIFIER_WITHOUT_BREAKS_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    : 'Reference interval';

  return [
    metric({
      id: 'proof-primary-a',
      label: firstLabel,
      value: firstValue,
      unit: firstUnit,
      trend: configuration.trend,
      provenance: configuration.provenance,
      axes: configuration.axes,
    }),
    metric({
      id: 'proof-primary-b',
      label: identifier,
      value: secondValue,
      unit: 'units',
      trend: 'Stable across the current interval',
      provenance: configuration.provenance,
      axes: configuration.axes,
    }),
    metric({
      id: 'proof-primary-c',
      label: 'Bounded comparison',
      value: pathological ? '−0.00000000000000000042' : '64',
      unit: 'percent',
      trend: 'Visible without relying on color',
      provenance: configuration.provenance,
      axes: configuration.axes,
    }),
  ].join('');
}

function historyMarkup() {
  return `
    <ol class="oi-history-strip" data-oi-severity="neutral" data-oi-freshness="recent" aria-label="Four-interval history, oldest to newest">
      <li class="oi-history-strip__item" style="--oi-history-intensity: 0.2">
        <time class="oi-history-strip__time" datetime="2026-08-23">August 23</time>
        <span class="oi-history-strip__bar" aria-hidden="true"></span>
        <span class="oi-history-strip__value">2 of 10</span>
      </li>
      <li class="oi-history-strip__item" style="--oi-history-intensity: 0.5">
        <time class="oi-history-strip__time" datetime="2026-08-24">August 24</time>
        <span class="oi-history-strip__bar" aria-hidden="true"></span>
        <span class="oi-history-strip__value">5 of 10</span>
      </li>
      <li class="oi-history-strip__item" style="--oi-history-intensity: 0.8">
        <time class="oi-history-strip__time" datetime="2026-08-25">August 25</time>
        <span class="oi-history-strip__bar" aria-hidden="true"></span>
        <span class="oi-history-strip__value">8 of 10</span>
      </li>
      <li class="oi-history-strip__item" style="--oi-history-intensity: 0.4">
        <time class="oi-history-strip__time" datetime="2026-08-26">August 26</time>
        <span class="oi-history-strip__bar" aria-hidden="true"></span>
        <span class="oi-history-strip__value">4 of 10</span>
      </li>
    </ol>`;
}

function render() {
  const root = document.querySelector('[data-proof-root]');
  const mappingRoot = root.closest('.oi-root');
  const stage = document.querySelector('[data-proof-stage]');
  const base = SCENARIOS[selection.scenario];
  const state = selection.state ? STATES[selection.state] : null;
  const configuration = {
    ...base,
    axes: { ...base.axes, ...(state?.axes ?? {}) },
    label: state?.label ?? base.label,
    disabled: state?.disabled ?? false,
  };
  const optionalSlots = new Set(SLOT_MODES[selection.slots]);
  const hasContext = optionalSlots.has('context');
  const hasActions = optionalSlots.has('actions');
  const long = selection.stress === 'long-labels-2x';

  if (hasContext) {
    root.setAttribute('aria-labelledby', 'proof-title');
    root.removeAttribute('aria-label');
  } else {
    root.removeAttribute('aria-labelledby');
    root.setAttribute('aria-label', 'Compact operational monitor');
  }

  document.documentElement.dir = selection.stress === 'rtl' ? 'rtl' : 'ltr';
  root.toggleAttribute('data-proof-no-color', selection.stress === 'no-color');
  if (selection.mapping === 'alien') mappingRoot.dataset.oiMapping = 'alien';
  else delete mappingRoot.dataset.oiMapping;
  root.dataset.oiSurface = 'raised';
  root.dataset.oiDensity = selection.density;
  for (const [axis, value] of Object.entries(configuration.axes)) {
    root.dataset[`oi${axis[0].toUpperCase()}${axis.slice(1)}`] = value;
  }

  const rootStyle = getComputedStyle(root);
  const inlineExtras =
    Number.parseFloat(rootStyle.paddingInlineStart) +
    Number.parseFloat(rootStyle.paddingInlineEnd) +
    Number.parseFloat(rootStyle.borderInlineStartWidth) +
    Number.parseFloat(rootStyle.borderInlineEndWidth);
  stage.style.setProperty('--proof-container-width', WIDTHS[selection.width]);
  stage.style.setProperty('--proof-container-inline-extras', `${inlineExtras}px`);
  const busy = contract.asyncBehavior.ariaBusyActivities.includes(
    configuration.axes.activity,
  );
  if (busy) root.setAttribute('aria-busy', 'true');
  else root.removeAttribute('aria-busy');

  root.dataset.proofMapping = selection.mapping;
  root.dataset.proofWidth = selection.width;
  root.dataset.proofDensity = selection.density;
  root.dataset.proofScenario = selection.scenario;
  root.dataset.proofState = selection.state ?? 'scenario';
  root.dataset.proofStress = selection.stress ?? 'none';
  root.dataset.proofSlots = selection.slots;

  const chrome =
    hasContext || hasActions
      ? `<header class="oi-recipe-compact-monitor__chrome">
          ${
            hasContext
              ? `<div class="proof-context" data-oi-slot="context">
                  <p class="proof-kicker">${long ? 'Theme-neutral operational context with deliberately extended scan-path wording' : 'Operational context'}</p>
                  <h1 id="proof-title" class="proof-title">${long ? 'Compact monitor with a doubled title that wraps naturally through narrow and right-to-left layouts' : 'Compact monitor'}</h1>
                  <p class="proof-subtitle">${configuration.provenance}</p>
                </div>`
              : ''
          }
          ${
            hasActions
              ? `<div data-oi-slot="actions">
                  <button class="proof-button" type="button" data-proof-refresh ${configuration.disabled ? 'disabled' : ''}>${long ? 'Refresh retained operational measurements' : 'Refresh'}</button>
                  <button class="proof-button" type="button" ${configuration.disabled ? 'disabled' : ''}>Acknowledge</button>
                </div>`
              : ''
          }
        </header>`
      : '';

  const focus = optionalSlots.has('focus')
    ? `<aside class="oi-inset proof-focus" data-oi-slot="focus" data-oi-surface="inset" aria-label="Focused evidence">
        <strong>Focused evidence remains in the operational scan path.</strong>
        <p class="proof-focus-copy">${long ? 'This intentionally extended evidence statement exercises wrapping, local overflow ownership, and focus visibility without forcing the entire document to scroll inline.' : 'This region may scroll locally without making the monitor root a scroll container.'}</p>
        <a class="proof-link" ${configuration.disabled ? 'aria-disabled="true" tabindex="-1"' : `href="#${optionalSlots.has('details') ? 'proof-details' : 'proof-status'}"`}>Inspect evidence</a>
      </aside>`
    : '';

  const details = optionalSlots.has('details')
    ? `<div data-oi-slot="details" id="proof-details">
        <details class="oi-disclosure" data-oi-density="${selection.density}" ${configuration.detailFailure ? 'open' : ''}>
          <summary class="oi-disclosure__summary">Additional details</summary>
          <div class="oi-disclosure__content">
            ${
              configuration.detailFailure
                ? `<p class="proof-details-error">Detail request failed. Primary data remains available.</p>
                   <button class="proof-button" type="button" data-proof-retry ${configuration.disabled ? 'disabled' : ''}>Retry details</button>`
                : '<p>Native disclosure owns expansion, keyboard behavior, focus, and announcement.</p>'
            }
          </div>
        </details>
      </div>`
    : '';

  const settings = optionalSlots.has('settings')
    ? `<div class="proof-settings" data-oi-slot="settings">
        <p class="proof-settings-copy">Settings remain after the default operational scan path.</p>
        <button class="proof-button" type="button" ${configuration.disabled ? 'disabled' : ''}>Open settings</button>
      </div>`
    : '';

  root.innerHTML = `${chrome}${focus}
    <div id="proof-status" class="proof-status" data-oi-slot="status" role="status" aria-live="polite">
      <p class="proof-status-label" data-proof-status-text>${configuration.label}</p>
      <p id="proof-status-detail" class="proof-status-detail">${configuration.detail}</p>
    </div>
    <div class="proof-primary" data-oi-slot="primary" data-proof-primary-node="stable">
      ${primaryMarkup(configuration, selection.stress)}
    </div>
    ${details}
    ${optionalSlots.has('history') ? `<div data-oi-slot="history">${historyMarkup()}</div>` : ''}
    ${settings}`;

  root.querySelector('[data-proof-refresh]')?.addEventListener('click', (event) => {
    const primary = root.querySelector('[data-oi-slot="primary"]');
    const identity = primary;
    root.dataset.oiActivity = 'refreshing';
    root.setAttribute('aria-busy', 'true');
    root.querySelector('[data-proof-status-text]').textContent =
      'Refreshing retained result';
    root.dataset.proofRefresh = 'active';
    if (root.querySelector('[data-oi-slot="primary"]') !== identity) {
      throw new Error('refresh replaced the primary node');
    }
    if (document.activeElement !== event.currentTarget) {
      throw new Error('refresh moved focus');
    }
  });

  return { root, configuration };
}

try {
  await applyTheme(selection.mapping);
  const { root, configuration } = render();
  await document.fonts.ready;
  window.__OI_PROOF__ = Object.freeze({
    contract,
    selection: Object.freeze(selection),
    axes: Object.freeze(configuration.axes),
    slotModes: Object.freeze(Object.keys(SLOT_MODES)),
  });
  root.dataset.proofReady = 'true';
  document.documentElement.dataset.proofReady = 'true';
} catch (error) {
  document.documentElement.dataset.proofError = error.message;
  throw error;
}
