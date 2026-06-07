#!/usr/bin/env node
// Dark Roast: Black Label — token generator.
//
// Reads the single source of truth (src/tokens.json) and regenerates every
// derived file: the JS token modules (dist/tokens/*.js) and the CSS custom-
// property region injected into the hand-authored templates (src/css-templates/
// *.css → dist/css/*.css).
//
//   node scripts/build-tokens.js          # write generated files
//   node scripts/build-tokens.js --check  # exit 1 if any output is stale
//
// No runtime dependencies. The package still ships plain source files — this
// runs at dev time only, never at install.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'tokens.json');
const TEMPLATE_DIR = join(ROOT, 'src', 'css-templates');
const DIST_CSS = join(ROOT, 'dist', 'css');
const DIST_JS = join(ROOT, 'dist', 'tokens');

const t = JSON.parse(readFileSync(SRC, 'utf8'));

const BANNER = [
  '// AUTO-GENERATED from src/tokens.json by scripts/build-tokens.js — DO NOT EDIT.',
  '// Edit src/tokens.json and run `npm run build`.',
].join('\n');

const CSS_MARKER_START = '/* @generated:tokens — from src/tokens.json, do not edit by hand */';
const CSS_MARKER_END = '/* @end:tokens */';

// ── helpers ─────────────────────────────────────────────────
const isMeta = (k) => k.startsWith('_');
const entries = (o) => Object.entries(o).filter(([k]) => !isMeta(k));

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
// Minimal, consistent number formatting (0.40 → 0.4, 0.05 → 0.05).
const num = (n) => String(Number(n));
function rgba(hexOrToken, alpha) {
  const hex = hexOrToken.startsWith('#') ? hexOrToken : t.colors[hexOrToken];
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${num(alpha)})`;
}
const pascal = (s) => s.replace(/(^|[-_ ])(\w)/g, (_, __, c) => c.toUpperCase());
const kebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[._ ]/g, '-').toLowerCase();
// JS identifier-safe form of a scale key: '0.5' → '0_5', '2xl' stays '2xl'.
const idKey = (k) => k.replace(/\./g, '_');
const q = (v) => `'${v}'`;

// Which colors carry dim/subtle/ghost variants, and the tier alphas.
const VARIANT_COLORS = t._build.opacityVariantColors;
const TIERS = t._build.opacityTiers; // { dim, subtle, ghost }

// Render a glow's layers to a box-shadow value. `sep` joins layers.
function glowValue(layers, sep) {
  return layers
    .map(([blur, color, alpha]) => `0 0 ${blur}px ${rgba(color, alpha)}`)
    .join(sep);
}

// Color grouping, driven by the `_`-prefixed section markers in tokens.json so
// ordering and comments stay in lockstep with the source.
function colorGroups() {
  const groups = [];
  let cur = null;
  for (const [k, v] of Object.entries(t.colors)) {
    if (isMeta(k)) {
      cur = { marker: k, label: v, items: [] };
      groups.push(cur);
    } else if (cur) {
      cur.items.push([k, v]);
    }
  }
  return groups;
}

// ── JS: colors.js ───────────────────────────────────────────
function buildColorsJs() {
  const L = [BANNER, '// Color tokens: surface scale, foregrounds, accents, action colors,', '// severity hues, opacity variants, semantic roles.', ''];
  const jsName = (k) => (k === 'void' ? 'void_' : k);

  for (const g of colorGroups()) {
    L.push(`// ── ${g.label} ──`);
    for (const [k, v] of g.items) L.push(`export const ${jsName(k)} = '${v}';`);
    L.push('');
  }

  L.push('// ── Opacity Variants (dim 40% / subtle 10% / ghost 5%) ──');
  for (const c of VARIANT_COLORS) {
    for (const [tier, a] of Object.entries(TIERS)) {
      L.push(`export const ${c}${pascal(tier)} = '${rgba(c, a)}';`);
    }
  }
  L.push('');
  L.push('// ── Structural derived ──');
  L.push(`export const divider = '${rgba(t._build.divider.color, t._build.divider.alpha)}';`);
  L.push('');

  L.push('// ── Semantic Roles (pointers into primitives) ──');
  const colorRoles = entries(t.roles).filter(([, v]) => typeof v === 'string' && t.colors[v] !== undefined);
  // accent..live alias primitives by name; display/workhorse/secondary/tertiary handled in objects below.
  const ALIAS_ROLES = ['accent', 'accentHot', 'accentMuted', 'success', 'warning', 'error', 'critical', 'stable', 'live'];
  for (const r of ALIAS_ROLES) L.push(`export const ${r} = ${jsName(t.roles[r])};`);
  L.push('');

  // colors{} object — grouped in source order.
  L.push('export const colors = {');
  for (const g of colorGroups()) {
    for (const [k] of g.items) L.push(`  ${k === 'void' ? 'void: void_' : k},`);
  }
  L.push('};');
  L.push('');

  L.push('export const roles = {');
  for (const r of ALIAS_ROLES) L.push(`  ${r},`);
  for (const [r, v] of entries(t.roles)) {
    if (!ALIAS_ROLES.includes(r)) L.push(`  ${r}: ${jsName(v)},`);
  }
  L.push('};');
  L.push('');

  L.push('export const opacityVariants = {');
  for (const c of VARIANT_COLORS) {
    L.push('  ' + Object.keys(TIERS).map((tier) => `${c}${pascal(tier)}`).join(', ') + ',');
  }
  L.push('  divider,');
  L.push('};');
  L.push('');

  L.push('export const opacityScale = {');
  for (const [k, v] of entries(t.opacity)) L.push(`  ${k}: ${num(v.decimal)},`);
  L.push('};');

  return L.join('\n') + '\n';
}

// ── JS: glows.js ────────────────────────────────────────────
function buildGlowsJs() {
  const L = [BANNER, '// Multi-layer phosphor box-shadow values. NOT colors.', ''];
  for (const [k, g] of entries(t.glows)) {
    // Each layer carries a trailing ", " (except the last) so the concatenated
    // string is a valid comma-separated box-shadow.
    const last = g.layers.length - 1;
    const body = g.layers
      .map(([b, c, a], i) => `'0 0 ${b}px ${rgba(c, a)}${i < last ? ', ' : ''}'`)
      .join(' +\n  ');
    L.push(`export const glow${pascal(k)} =\n  ${body};`);
  }
  L.push('');
  // Glass gradient: var() form (CSS context) + hex-resolved form (JS use).
  const gl = t.gradients.glass;
  const toRgba = rgba(gl.to, gl.toAlpha);
  L.push(`export const glassGradientCSS = 'linear-gradient(${gl.angle}, var(--dr-${kebab(gl.from)}), ${toRgba})';`);
  L.push(`export const glassGradient = 'linear-gradient(${gl.angle}, ${t.colors[gl.from]}, ${toRgba})';`);
  L.push('');
  L.push('export const glows = {');
  for (const [k] of entries(t.glows)) L.push(`  ${k}: glow${pascal(k)},`);
  L.push('};');
  return L.join('\n') + '\n';
}

// ── JS: typography.js ───────────────────────────────────────
function buildTypographyJs() {
  const L = [BANNER, '// Font stacks, type scale, letter-spacing, semantic roles.', ''];
  const fam = t.typography.families;
  const stack = (f) => `'${fam[f].family}', ${fam[f].fallback}`;
  L.push('// ── Font Stacks ──');
  for (const f of Object.keys(fam).filter((k) => !isMeta(k))) {
    L.push(`export const font${pascal(f)} = "${stack(f)}";`);
  }
  L.push('');
  L.push('// ── Type Scale ──');
  for (const [k, s] of entries(t.typography.scale)) {
    L.push(
      `export const text${pascal(k)} = { size: '${s.sizePx}px', rem: '${s.sizeRem}', ` +
        `lineHeight: ${num(s.lineHeight)}, tracking: '${s.letterSpacing}', weight: ${s.weight} };`,
    );
  }
  L.push('');
  L.push('// ── Legacy v3 rem-only size tokens ──');
  for (const [k, v] of entries(t.typography._legacyRem)) L.push(`export const ${k} = '${v}';`);
  L.push('');
  L.push('// ── Letter Spacing ──');
  for (const [k, v] of entries(t.typography.tracking)) L.push(`export const tracking${pascal(k)} = '${v}';`);
  L.push('');
  L.push('// ── Semantic Typography Roles ──');
  L.push('export const typographyRoles = ' + jsObject(t.typography.roles, 0) + ';');
  L.push('');
  L.push('export const fontStacks = {');
  for (const f of Object.keys(fam).filter((k) => !isMeta(k))) L.push(`  ${f}: font${pascal(f)},`);
  L.push('};');
  L.push('');
  L.push('export const typeScale = {');
  for (const [k] of entries(t.typography.scale)) L.push(`  ${q(k)}: text${pascal(k)},`);
  L.push('};');
  L.push('');
  L.push('export const tracking = {');
  for (const [k] of entries(t.typography.tracking)) L.push(`  ${k}: tracking${pascal(k)},`);
  L.push('};');
  return L.join('\n') + '\n';
}

// Render a plain JSON object/value as a JS literal (objects only need string/number/nested).
function jsObject(o, indent) {
  const pad = '  '.repeat(indent + 1);
  const close = '  '.repeat(indent);
  const lines = entries(o).map(([k, v]) => {
    const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : q(k);
    if (v && typeof v === 'object' && !Array.isArray(v)) return `${pad}${key}: ${jsObject(v, indent + 1)}`;
    const val = typeof v === 'number' ? num(v) : q(v);
    return `${pad}${key}: ${val}`;
  });
  return `{\n${lines.join(',\n')},\n${close}}`;
}

// ── JS: spacing.js ──────────────────────────────────────────
function buildSpacingJs() {
  const L = [BANNER, '// Spacing, radii, motion, z-index, icon, elevation.', ''];

  // Numeric keys stay numeric (space0, space1_5); the lone alpha key `px` is
  // PascalCased to spacePx.
  const spaceConst = (k) => 'space' + (/^[a-z]/.test(k) ? pascal(k) : idKey(k));
  L.push('// ── Spacing Scale (4px base) ──');
  for (const [k, v] of entries(t.spacing.scale)) L.push(`export const ${spaceConst(k)} = '${v}';`);
  L.push('');
  L.push('// ── Spacing Aliases ──');
  for (const [a, ref] of entries(t.spacing.aliases)) L.push(`export const space${pascal(a)} = ${spaceConst(ref)};`);
  L.push('');

  L.push('// ── Border Radii ──');
  for (const [k, v] of entries(t.radii)) L.push(`export const radius${pascal(k)} = '${v}';`);
  L.push('');

  L.push('// ── Geo-Stripe ──');
  L.push(`export const stripeHeight = '${t.stripe.height}';`);
  L.push(`export const stripeOpacity = '${num(t.stripe.opacity)}';`);
  L.push('');

  L.push('// ── Durations ──');
  for (const [k, v] of entries(t.motion.durations)) L.push(`export const duration${pascal(k)} = '${v}';`);
  for (const [k, v] of entries(t.motion._legacyDurations)) L.push(`export const duration${pascal(k)} = '${v}';`);
  L.push('');

  L.push('// ── Easings ──');
  for (const [k, v] of entries(t.motion.easings)) {
    if (k === 'default') L.push(`export const easing = '${v}';`);
    else if (k.startsWith('swiftui')) L.push(`export const ${k} = '${v}';`);
    else L.push(`export const easing${pascal(k)} = '${v}';`);
  }
  L.push('');

  L.push('// ── Z-Index ──');
  for (const [k, v] of entries(t.zIndex)) L.push(`export const z${pascal(k)} = ${num(v)};`);
  L.push('');

  L.push('// ── Icon Sizes ──');
  for (const [k, v] of entries(t.icon.size)) L.push(`export const icon${pascal(k)} = '${v}';`);
  for (const [k, v] of entries(t.icon.strokeWidth)) L.push(`export const iconStroke${pascal(k)} = ${num(v)};`);
  L.push('');

  L.push('// ── Elevation ──');
  for (const [k, v] of entries(t.elevation)) L.push(`export const elevation${pascal(k)} = ${jsObject(v, 0)};`);
  L.push('');

  // Collected objects.
  L.push('export const spacing = {');
  for (const [k] of entries(t.spacing.scale)) L.push(`  ${q(k)}: ${spaceConst(k)},`);
  for (const [a] of entries(t.spacing.aliases)) L.push(`  ${q(a)}: space${pascal(a)},`);
  L.push('};');
  L.push('');
  L.push('export const radii = {');
  for (const [k] of entries(t.radii)) L.push(`  ${q(k)}: radius${pascal(k)},`);
  L.push('};');
  L.push('');
  L.push('export const durations = {');
  for (const [k] of entries(t.motion.durations)) L.push(`  ${k}: duration${pascal(k)},`);
  for (const [k] of entries(t.motion._legacyDurations)) L.push(`  ${k}: duration${pascal(k)},`);
  L.push('};');
  L.push('');
  L.push('export const easings = {');
  for (const [k] of entries(t.motion.easings)) {
    const ref = k === 'default' ? 'easing' : k.startsWith('swiftui') ? k : `easing${pascal(k)}`;
    L.push(`  ${k === 'default' ? 'default: easing' : `${k}: ${ref}`},`);
  }
  L.push('};');
  L.push('');
  L.push('export const zIndex = {');
  for (const [k] of entries(t.zIndex)) L.push(`  ${k}: z${pascal(k)},`);
  L.push('};');
  L.push('');
  L.push('export const icon = {');
  L.push('  size: {');
  for (const [k] of entries(t.icon.size)) L.push(`    ${q(k)}: icon${pascal(k)},`);
  L.push('  },');
  L.push('  stroke: {');
  for (const [k] of entries(t.icon.strokeWidth)) L.push(`    ${k}: iconStroke${pascal(k)},`);
  L.push('  },');
  L.push('};');
  L.push('');
  L.push('export const elevation = {');
  for (const [k] of entries(t.elevation)) L.push(`  ${k}: elevation${pascal(k)},`);
  L.push('};');
  return L.join('\n') + '\n';
}

function buildIndexJs() {
  return [BANNER, '', "export * from './colors.js';", "export * from './typography.js';", "export * from './glows.js';", "export * from './spacing.js';", ''].join('\n');
}

// ── CSS: the @generated token region (shared by both templates) ──
function buildCssVars() {
  const I = '    ';
  const L = [];
  const decl = (name, val) => L.push(`${I}--dr-${name}: ${val};`);

  // Primitives, grouped.
  for (const g of colorGroups()) {
    L.push(`${I}/* ${g.label} */`);
    for (const [k, v] of g.items) decl(kebab(k), v);
    L.push('');
  }

  // Semantic role aliases.
  L.push(`${I}/* Semantic role aliases */`);
  const ALIAS_ROLES = ['accent', 'accentHot', 'accentMuted', 'success', 'warning', 'error', 'critical', 'stable', 'live'];
  for (const r of ALIAS_ROLES) decl(kebab(r), `var(--dr-${kebab(t.roles[r])})`);
  for (const r of ['display', 'workhorse', 'secondary', 'tertiary']) decl(`fg-${r}`, `var(--dr-${kebab(t.roles[r])})`);
  L.push('');

  // Opacity variants.
  L.push(`${I}/* Opacity variants (dim 40% / subtle 10% / ghost 5%) */`);
  for (const c of VARIANT_COLORS) {
    for (const [tier, a] of Object.entries(TIERS)) decl(`${kebab(c)}-${tier}`, rgba(c, a));
  }
  decl('divider', rgba(t._build.divider.color, t._build.divider.alpha));
  L.push('');

  // Glows (multi-line for readability).
  L.push(`${I}/* Glow effects — white hotspot / color midband / color wash */`);
  for (const [k, g] of entries(t.glows)) {
    const body = g.layers.map(([b, c, a]) => `${I}${I}0 0 ${b}px ${rgba(c, a)}`).join(',\n');
    L.push(`${I}--dr-glow-${kebab(k)}:\n${body};`);
  }
  const gl = t.gradients.glass;
  decl('glass-gradient', `linear-gradient(${gl.angle}, var(--dr-${kebab(gl.from)}), ${rgba(gl.to, gl.toAlpha)})`);
  L.push('');

  // Elevation.
  L.push(`${I}/* Elevation — shadow + border pairs */`);
  for (const [k, v] of entries(t.elevation)) {
    decl(`elevation-${kebab(k)}-shadow`, v.shadow);
    decl(`elevation-${kebab(k)}-border`, v.border);
  }
  L.push('');

  // Typography.
  L.push(`${I}/* Typography */`);
  const fam = t.typography.families;
  for (const f of Object.keys(fam).filter((k) => !isMeta(k))) decl(`font-${kebab(f)}`, `'${fam[f].family}', ${fam[f].fallback}`);
  for (const [k, s] of entries(t.typography.scale)) decl(`text-${kebab(k)}`, s.sizeRem);
  decl('text-huge', t.typography._legacyRem.textHuge);
  for (const [k, s] of entries(t.typography.scale)) decl(`leading-${kebab(k)}`, num(s.lineHeight));
  for (const [k, v] of entries(t.typography.tracking)) decl(`tracking-${kebab(k)}`, v);
  L.push('');

  // Spacing & geometry.
  L.push(`${I}/* Spacing (4px base) */`);
  for (const [k, v] of entries(t.spacing.scale)) decl(`space-${kebab(k)}`, v);
  for (const [a, ref] of entries(t.spacing.aliases)) decl(`space-${kebab(a)}`, `var(--dr-space-${kebab(ref)})`);
  L.push('');
  L.push(`${I}/* Border radii */`);
  for (const [k, v] of entries(t.radii)) decl(`radius-${kebab(k)}`, v);
  L.push('');
  L.push(`${I}/* Geo stripe */`);
  decl('stripe-height', t.stripe.height);
  decl('stripe-opacity', num(t.stripe.opacity));
  L.push('');
  L.push(`${I}/* Icon sizes */`);
  for (const [k, v] of entries(t.icon.size)) decl(`icon-${kebab(k)}`, v);
  L.push('');

  // Motion.
  L.push(`${I}/* Motion — durations + easings */`);
  for (const [k, v] of entries(t.motion.durations)) decl(`duration-${kebab(k)}`, v);
  for (const [k, v] of entries(t.motion._legacyDurations)) decl(`duration-${kebab(k)}`, v);
  for (const [k, v] of entries(t.motion.easings)) {
    if (k.startsWith('swiftui')) continue; // native-only
    decl(k === 'default' ? 'easing' : `easing-${kebab(k)}`, v);
  }
  L.push('');

  // Z-index.
  L.push(`${I}/* Z-index scale */`);
  for (const [k, v] of entries(t.zIndex)) decl(`z-${kebab(k)}`, num(v));

  return L.join('\n');
}

function injectCss(template, region) {
  const s = template.indexOf(CSS_MARKER_START);
  const e = template.indexOf(CSS_MARKER_END);
  if (s === -1 || e === -1) throw new Error(`CSS template missing @generated markers`);
  return template.slice(0, s + CSS_MARKER_START.length) + '\n' + region + '\n' + template.slice(e);
}

// ── orchestration ───────────────────────────────────────────
const outputs = [
  [join(DIST_JS, 'colors.js'), buildColorsJs()],
  [join(DIST_JS, 'glows.js'), buildGlowsJs()],
  [join(DIST_JS, 'typography.js'), buildTypographyJs()],
  [join(DIST_JS, 'spacing.js'), buildSpacingJs()],
  [join(DIST_JS, 'index.js'), buildIndexJs()],
];

const cssRegion = buildCssVars();
for (const name of ['dark-roast.css', 'dark-roast-scoped.css']) {
  const template = readFileSync(join(TEMPLATE_DIR, name), 'utf8');
  outputs.push([join(DIST_CSS, name), injectCss(template, cssRegion)]);
}

const check = process.argv.includes('--check');
let stale = 0;
for (const [path, content] of outputs) {
  let current = null;
  try {
    current = readFileSync(path, 'utf8');
  } catch {}
  if (check) {
    if (current !== content) {
      stale++;
      console.error(`✗ stale: ${path.replace(ROOT + '/', '')}`);
    }
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log(`✓ wrote ${path.replace(ROOT + '/', '')}`);
  }
}

if (check) {
  if (stale) {
    console.error(`\n${stale} file(s) out of sync with src/tokens.json. Run \`npm run build\`.`);
    process.exit(1);
  }
  console.log('✓ all generated files in sync with src/tokens.json');
}
