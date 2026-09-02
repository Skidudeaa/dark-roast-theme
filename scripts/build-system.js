#!/usr/bin/env node
// Operational Interface Doctrine — contract generator.
//
// Reads the single source of truth (src/system/contract.json) and emits the
// generated adapter surface:
//
//   dist/system/contract.js    frozen constants + development assertions
//   dist/system/contract.d.ts  string-literal unions and interfaces
//   dist/system/contract.json  published manifest, comments stripped
//   dist/system/conformance.*  hand-authored src/system/runtime copied verbatim
//
//   node scripts/build-system.js          # write generated files
//   node scripts/build-system.js --check  # exit 1 if any output is stale
//
// Doctrine §5.17: a rule that cannot be enforced is guidance, not law. This
// generator is what turns the prose contract into something a build can fail
// on. §17.6 requires repeated builds from the same source to be byte-identical,
// which --check proves.
//
// No runtime dependencies. CSS layout stays hand-authored (§14) — the generator
// produces contracts and repetitive bindings, never opaque generated layout.

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'system', 'contract.json');
const TOKENS_SRC = join(ROOT, 'src', 'tokens.json');
const MAPPING_SRC = join(ROOT, 'src', 'system', 'mappings', 'dark-roast.json');
const LAYERS_SRC = join(ROOT, 'src', 'system', 'layers.css');
const CONTRACTS_SRC = join(ROOT, 'src', 'system', 'contracts');
const PRIMITIVES_SRC = join(ROOT, 'src', 'system', 'primitives');
const RECIPES_SRC = join(ROOT, 'src', 'system', 'recipes');
const RUNTIME_SRC = join(ROOT, 'src', 'system', 'runtime');
const OUT_DIR = join(ROOT, 'dist', 'system');
const CHECK = process.argv.includes('--check');
const CONTRACT_SOURCE_ORDER = [
  'surfaces.css',
  'text.css',
  'interaction.css',
  'state.css',
  'truth.css',
  'density.css',
  'motion.css',
];

const manifest = JSON.parse(readFileSync(SRC, 'utf8'));

const BANNER = [
  '// AUTO-GENERATED from src/system/contract.json by scripts/build-system.js — DO NOT EDIT.',
  '// Edit src/system/contract.json and run `npm run build:system`.',
].join('\n');

// ── helpers ─────────────────────────────────────────────────
const isMeta = (k) => k.startsWith('$') || k.startsWith('_');
const entries = (o) => Object.entries(o).filter(([k]) => !isMeta(k));
const pascal = (s) => s.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
const camel = (s) => {
  const p = pascal(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
};
const union = (values) => values.map((v) => `'${v}'`).join(' | ');
const list = (values) => values.map((v) => `'${v}'`).join(', ');
const kebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[._ ]/g, '-').toLowerCase();

function readRequired(path, description) {
  if (!existsSync(path)) {
    throw new Error(`[oi] missing ${description}: ${path}`);
  }
  return readFileSync(path, 'utf8');
}

function exactKeys(actual, expected, description) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((key) => !actualSet.has(key));
  const extra = actual.filter((key) => !expectedSet.has(key));
  if (missing.length || extra.length) {
    const details = [
      missing.length ? `missing ${missing.join(', ')}` : '',
      extra.length ? `unexpected ${extra.join(', ')}` : '',
    ].filter(Boolean).join('; ');
    throw new Error(`[oi] ${description} does not match the contract: ${details}`);
  }
}

/** Recursively drop documentation keys so published JSON carries contract only. */
function strip(value) {
  if (Array.isArray(value)) return value.map(strip);
  if (value && typeof value === 'object') {
    return Object.fromEntries(entries(value).map(([k, v]) => [k, strip(v)]));
  }
  return value;
}

const axes = entries(manifest.axes);
const roles = entries(manifest.semanticRoles);
const primitiveNames = entries(manifest.primitives).map(([k]) => k);
const recipeNames = entries(manifest.recipes).map(([k]) => k);
const primitiveSourceOrder = primitiveNames.map((name) => `${name}.css`);
const recipeSourceOrder = recipeNames.map((name) => `${name}.css`);
const allParts = [
  ...new Set(
    entries(manifest.primitives).flatMap(([, primitive]) => keys(primitive.parts ?? {})),
  ),
].sort();
const allSlots = [
  ...new Set(entries(manifest.recipes).flatMap(([, r]) => r.slotOrder)),
].sort();
const allRecipeParts = [
  ...new Set(
    entries(manifest.recipes).flatMap(([, recipe]) => keys(recipe.parts ?? {})),
  ),
].sort();

function keys(object) {
  return Object.keys(object).filter((key) => !isMeta(key));
}

function frozenLiteral(value, depth = 0) {
  if (Array.isArray(value)) {
    return `Object.freeze([${value.map((item) => frozenLiteral(item, depth)).join(', ')}])`;
  }
  if (value && typeof value === 'object') {
    const indent = '  '.repeat(depth);
    const childIndent = '  '.repeat(depth + 1);
    const properties = Object.entries(value).map(
      ([key, child]) => `${childIndent}${JSON.stringify(key)}: ${frozenLiteral(child, depth + 1)},`,
    );
    return `Object.freeze({\n${properties.join('\n')}\n${indent}})`;
  }
  return JSON.stringify(value);
}

function darkRoastVariableInventory(tokens) {
  const variables = new Set();
  const add = (name) => variables.add(`--dr-${name}`);

  for (const [name] of entries(tokens.colors)) add(kebab(name));

  for (const name of [
    'accent',
    'accentHot',
    'accentMuted',
    'success',
    'warning',
    'error',
    'critical',
    'stable',
    'live',
  ]) {
    add(kebab(name));
  }
  for (const name of ['display', 'workhorse', 'secondary', 'tertiary', 'body', 'muted']) {
    add(`fg-${name}`);
  }

  for (const color of tokens._build.opacityVariantColors) {
    for (const tier of Object.keys(tokens._build.opacityTiers)) {
      add(`${kebab(color)}-${kebab(tier)}`);
    }
  }
  add('divider');

  for (const [name] of entries(tokens.glows)) add(`glow-${kebab(name)}`);
  add('glass-gradient');

  for (const [name] of entries(tokens.elevation)) {
    add(`elevation-${kebab(name)}-shadow`);
    add(`elevation-${kebab(name)}-border`);
  }

  for (const [name] of entries(tokens.typography.families)) add(`font-${kebab(name)}`);
  for (const [name] of entries(tokens.typography.scale)) {
    add(`text-${kebab(name)}`);
    add(`leading-${kebab(name)}`);
  }
  add('text-huge');
  for (const [name] of entries(tokens.typography.tracking)) add(`tracking-${kebab(name)}`);

  for (const [name] of entries(tokens.spacing.scale)) add(`space-${kebab(name)}`);
  for (const [name] of entries(tokens.spacing.aliases)) add(`space-${kebab(name)}`);
  for (const [name] of entries(tokens.radii)) add(`radius-${kebab(name)}`);
  add('stripe-height');
  add('stripe-opacity');
  for (const [name] of entries(tokens.icon.size)) add(`icon-${kebab(name)}`);

  for (const [name] of entries(tokens.motion.durations)) add(`duration-${kebab(name)}`);
  for (const [name] of entries(tokens.motion._legacyDurations)) add(`duration-${kebab(name)}`);
  for (const [name] of entries(tokens.motion.easings)) {
    if (name.startsWith('swiftui')) continue;
    add(name === 'default' ? 'easing' : `easing-${kebab(name)}`);
  }

  for (const [name] of entries(tokens.zIndex)) add(`z-${kebab(name)}`);
  return variables;
}

function buildDarkRoastMapping() {
  const mapping = JSON.parse(readRequired(MAPPING_SRC, 'Dark Roast semantic mapping source'));
  const tokens = JSON.parse(readRequired(TOKENS_SRC, 'canonical Dark Roast token source'));

  if (mapping.name !== 'dark-roast') {
    throw new Error(`[oi] mapping name must be "dark-roast", got ${JSON.stringify(mapping.name)}`);
  }
  if (!mapping.roles || typeof mapping.roles !== 'object' || Array.isArray(mapping.roles)) {
    throw new Error('[oi] dark-roast mapping must define a roles object');
  }

  const mappingCategories = entries(mapping.roles).map(([category]) => category);
  const expectedCategories = roles.map(([category]) => category);
  exactKeys(mappingCategories, expectedCategories, 'dark-roast mapping categories');

  const canonicalVariables = darkRoastVariableInventory(tokens);
  const declarations = [];
  for (const [category, roleNames] of roles) {
    const categoryMapping = mapping.roles[category];
    if (!categoryMapping || typeof categoryMapping !== 'object' || Array.isArray(categoryMapping)) {
      throw new Error(`[oi] dark-roast mapping category "${category}" must be an object`);
    }

    const actualRoles = entries(categoryMapping).map(([role]) => role);
    exactKeys(actualRoles, roleNames, `dark-roast mapping category "${category}"`);

    for (const role of roleNames) {
      const value = categoryMapping[role];
      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`[oi] dark-roast mapping ${category}.${role} must be a non-empty CSS value`);
      }
      const references = value.match(/--dr-[a-z0-9-]+/g) ?? [];
      if (references.length === 0) {
        throw new Error(
          `[oi] dark-roast mapping ${category}.${role} must reference a canonical --dr-* foundation`,
        );
      }
      for (const reference of references) {
        if (!canonicalVariables.has(reference)) {
          throw new Error(
            `[oi] dark-roast mapping ${category}.${role} references ${reference}, ` +
              'which is not derived from src/tokens.json',
          );
        }
      }
      declarations.push(`    ${manifest.naming.cssVariablePrefix}${category}-${role}: ${value};`);
    }
  }

  return [
    '/* AUTO-GENERATED from src/system/mappings/dark-roast.json by scripts/build-system.js — DO NOT EDIT. */',
    '@layer oi.mapping {',
    `  .${manifest.naming.cssClassPrefix}root {`,
    ...declarations,
    '  }',
    '}',
    '',
  ].join('\n');
}

function readCssSources(directory, sourceOrder, description, relativeDirectory) {
  if (!existsSync(directory)) {
    throw new Error(`[oi] missing ${description} source directory: ${directory}`);
  }
  const discoveredNames = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => entry.name)
    .sort();
  exactKeys(discoveredNames, sourceOrder, `${description} CSS sources`);

  return sourceOrder.map((name) =>
    `/* source: src/system/${relativeDirectory}/${name} */\n${readRequired(join(directory, name), `${description} ${name}`).trim()}`,
  );
}

function buildCssBundle(banner, sources) {
  const layers = readRequired(LAYERS_SRC, 'system cascade-layer source').trim();
  return `${[banner, layers, ...sources].join('\n\n')}\n`;
}

function buildContractsCss() {
  const sources = readCssSources(
    CONTRACTS_SRC,
    CONTRACT_SOURCE_ORDER,
    'semantic contract',
    'contracts',
  );
  return buildCssBundle(
    '/* AUTO-GENERATED from src/system/layers.css and src/system/contracts/*.css by scripts/build-system.js — DO NOT EDIT. */',
    sources,
  );
}

function buildPrimitivesCss() {
  const sources = readCssSources(
    PRIMITIVES_SRC,
    primitiveSourceOrder,
    'structural primitive',
    'primitives',
  );
  return buildCssBundle(
    '/* AUTO-GENERATED from src/system/layers.css and src/system/primitives/*.css by scripts/build-system.js — DO NOT EDIT. */',
    sources,
  );
}

function buildSystemCss() {
  const contractSources = readCssSources(
    CONTRACTS_SRC,
    CONTRACT_SOURCE_ORDER,
    'semantic contract',
    'contracts',
  );
  const primitiveSources = readCssSources(
    PRIMITIVES_SRC,
    primitiveSourceOrder,
    'structural primitive',
    'primitives',
  );
  const recipeSources = readCssSources(
    RECIPES_SRC,
    recipeSourceOrder,
    'composition recipe',
    'recipes',
  );
  return buildCssBundle(
    '/* AUTO-GENERATED from src/system/layers.css and src/system/{contracts,primitives,recipes}/*.css by scripts/build-system.js — DO NOT EDIT. */',
    [...contractSources, ...primitiveSources, ...recipeSources],
  );
}

function buildRecipesCss() {
  const sources = readCssSources(
    RECIPES_SRC,
    recipeSourceOrder,
    'composition recipe',
    'recipes',
  );
  return buildCssBundle(
    '/* AUTO-GENERATED from src/system/layers.css and src/system/recipes/*.css by scripts/build-system.js — DO NOT EDIT. */',
    sources,
  );
}

function buildSingleRecipeCss(name) {
  const sources = readCssSources(
    RECIPES_SRC,
    recipeSourceOrder,
    'composition recipe',
    'recipes',
  );
  const source = sources[recipeNames.indexOf(name)];
  return buildCssBundle(
    `/* AUTO-GENERATED from src/system/layers.css and src/system/recipes/${name}.css by scripts/build-system.js — DO NOT EDIT. */`,
    [source],
  );
}

function buildIndexJs() {
  return [
    BANNER,
    '',
    "export * from './contract.js';",
    "export * from './conformance.js';",
    '',
  ].join('\n');
}

// ── dist/system/contract.js ─────────────────────────────────
function buildJs() {
  const L = [
    BANNER,
    '// Runtime contract for the Operational Interface Doctrine.',
    '//',
    '// Unknown stable-axis values must trigger development assertions and fall',
    '// back to neutral presentation in production (§6, §20). assertAxisValue()',
    '// implements that: it throws when NODE_ENV !== "production", and returns',
    '// false quietly otherwise so callers can omit the attribute.',
    '',
    `export const CONTRACT_NAME = '${manifest.name}';`,
    `export const CONTRACT_VERSION = '${manifest.version}';`,
    '',
    '// ── Naming contract (§6) ──',
  ];

  for (const [k, v] of entries(manifest.naming)) {
    L.push(`export const ${k} = '${v}';`);
  }

  L.push('');
  L.push('// ── Axes (§7) ──');
  for (const [axis, values] of axes) {
    L.push(`export const ${camel(axis)} = Object.freeze([${list(values)}]);`);
  }

  L.push('');
  L.push('export const axes = Object.freeze({');
  for (const [axis] of axes) L.push(`  ${camel(axis)},`);
  L.push('});');

  L.push('');
  L.push('// Public attribute name for each axis, e.g. surface -> data-oi-surface.');
  L.push('export const axisAttributes = Object.freeze({');
  for (const [axis] of axes) {
    L.push(`  ${camel(axis)}: '${manifest.naming.axisAttributePrefix}${axis}',`);
  }
  L.push('});');

  L.push('');
  L.push('// ── Axis stability (§19) ──');
  L.push('// Adding a value to a stable closed axis is a MAJOR bump, because domain');
  L.push('// adapters may switch exhaustively over it.');
  L.push('export const axisStability = Object.freeze({');
  for (const [axis, stability] of entries(manifest.axisStability)) {
    L.push(`  ${camel(axis)}: '${stability}',`);
  }
  L.push('});');

  L.push('');
  L.push('// ── Truth axes (§9) ──');
  L.push(`export const truthAxes = Object.freeze([${list(manifest.truthAxes.members)}]);`);

  L.push('');
  L.push('// ── Semantic roles (§8) ──');
  L.push('// Full custom-property names. Primitives and recipes consume ONLY these;');
  L.push('// reaching for a palette token such as --dr-espresso is "token soup" (§23).');
  L.push('export const semanticRoles = Object.freeze({');
  for (const [category, names] of roles) {
    const vars = names.map((n) => `'${manifest.naming.cssVariablePrefix}${category}-${n}'`);
    L.push(`  ${camel(category)}: Object.freeze([${vars.join(', ')}]),`);
  }
  L.push('});');

  L.push('');
  L.push('export const semanticRoleVariables = Object.freeze([');
  for (const [category, names] of roles) {
    for (const n of names) {
      L.push(`  '${manifest.naming.cssVariablePrefix}${category}-${n}',`);
    }
  }
  L.push(']);');

  L.push('');
  L.push('// ── Primitives (§10) ──');
  L.push(`export const primitives = Object.freeze([${list(primitiveNames)}]);`);
  L.push('');
  L.push('export const primitiveAxes = Object.freeze({');
  for (const [name, def] of entries(manifest.primitives)) {
    L.push(`  '${name}': Object.freeze([${list(def.axes)}]),`);
  }
  L.push('});');

  L.push('');
  L.push('// Full DOM, part, and public-hook contract for each primitive.');
  L.push('export const primitiveContracts = Object.freeze({');
  for (const [name, def] of entries(manifest.primitives)) {
    L.push(`  '${name}': ${frozenLiteral(strip(def), 1)},`);
  }
  L.push('});');

  L.push('');
  L.push('// Owner-qualified public part classes; arbitrary BEM selectors are not contract.');
  L.push('export const primitivePartClasses = Object.freeze({');
  for (const [name, def] of entries(manifest.primitives)) {
    const partClasses = Object.fromEntries(
      keys(def.parts ?? {}).map((part) => [
        part,
        `${manifest.naming.cssClassPrefix}${name}__${part}`,
      ]),
    );
    L.push(`  '${name}': ${frozenLiteral(partClasses, 1)},`);
  }
  L.push('});');

  L.push('');
  L.push('// ── Recipes (§11) ──');
  L.push(`export const recipes = Object.freeze([${list(recipeNames)}]);`);
  L.push('');
  L.push('export const recipeContracts = Object.freeze({');
  for (const [name, def] of entries(manifest.recipes)) {
    L.push(`  '${name}': ${frozenLiteral(strip(def), 1)},`);
  }
  L.push('});');

  L.push('');
  L.push('// Owner-qualified public recipe part classes; slots continue to use data-oi-slot.');
  L.push('export const recipePartClasses = Object.freeze({');
  for (const [name, def] of entries(manifest.recipes)) {
    const partClasses = Object.fromEntries(
      keys(def.parts ?? {}).map((part) => [
        part,
        `${manifest.naming.cssClassPrefix}recipe-${name}__${part}`,
      ]),
    );
    L.push(`  '${name}': ${frozenLiteral(partClasses, 1)},`);
  }
  L.push('});');

  L.push('');
  L.push(`export const reservedRecipeNames = Object.freeze([${list(manifest.reservedRecipeNames.names)}]);`);
  L.push(`export const stabilityLadder = Object.freeze([${list(manifest.stabilityLadder.stages)}]);`);
  L.push(`export const forbiddenDomainTerms = Object.freeze([${list(manifest.forbiddenDomainTerms.terms)}]);`);

  L.push('');
  L.push('// ── Development assertions (§13, §20) ──');
  L.push('');
  L.push('function isDevelopmentEnvironment(options) {');
  L.push('  if (typeof options?.development === \'boolean\') return options.development;');
  L.push('  return typeof process !== \'undefined\' && process?.env?.NODE_ENV !== \'production\';');
  L.push('}');
  L.push('');
  L.push('/**');
  L.push(' * Validate a value against a contract axis.');
  L.push(' *');
  L.push(' * Throws in development so unknown values surface immediately; returns');
  L.push(' * false in production so the caller can omit the attribute and inherit');
  L.push(' * neutral presentation instead of crashing an operational surface.');
  L.push(' *');
  L.push(' * @param {string} axis  Axis name, e.g. "severity".');
  L.push(' * @param {string} value Candidate value, e.g. "critical".');
  L.push(' * @param {{development?: boolean}} [options] Explicit native-browser development mode.');
  L.push(' * @returns {boolean} true when the value is valid for the axis.');
  L.push(' */');
  L.push('export function assertAxisValue(axis, value, options) {');
  L.push('  const allowed = axes[axis];');
  L.push('  if (!allowed) {');
  L.push('    if (isDevelopmentEnvironment(options)) {');
  L.push('      throw new Error(`[oi] unknown axis "${axis}"; expected one of ${Object.keys(axes).join(\', \')}`);');
  L.push('    }');
  L.push('    return false;');
  L.push('  }');
  L.push('  if (allowed.includes(value)) return true;');
  L.push('  if (isDevelopmentEnvironment(options)) {');
  L.push('    throw new Error(`[oi] "${value}" is not a valid ${axis}; expected one of ${allowed.join(\', \')}`);');
  L.push('  }');
  L.push('  return false;');
  L.push('}');
  L.push('');
  L.push('/**');
  L.push(' * Validate that a recipe receives every slot it requires.');
  L.push(' *');
  L.push(' * Missing required slots fail fixtures and development assertions (§20).');
  L.push(' *');
  L.push(' * @param {string} recipe Recipe name, e.g. "compact-monitor".');
  L.push(' * @param {string[]} providedSlots Slot names present in the DOM.');
  L.push(' * @param {{development?: boolean}} [options] Explicit native-browser development mode.');
  L.push(' * @returns {string[]} Missing required slot names; empty when satisfied.');
  L.push(' */');
  L.push('export function missingRequiredSlots(recipe, providedSlots, options) {');
  L.push('  const contract = recipeContracts[recipe];');
  L.push('  if (!contract) {');
  L.push('    if (isDevelopmentEnvironment(options)) {');
  L.push('      throw new Error(`[oi] unknown recipe "${recipe}"; expected one of ${recipes.join(\', \')}`);');
  L.push('    }');
  L.push('    return [];');
  L.push('  }');
  L.push('  const provided = new Set(providedSlots);');
  L.push('  return contract.requiredSlots.filter((slot) => !provided.has(slot));');
  L.push('}');
  L.push('');
  L.push('/**');
  L.push(' * True when the axis combination describes information whose provenance');
  L.push(' * must be represented (§5.4, §9). Generated, inferred, stale, or partial');
  L.push(' * data must never carry the visual authority of confirmed direct data —');
  L.push(' * the "truth laundering" anti-pattern (§23).');
  L.push(' *');
  L.push(' * @param {{source?: string, certainty?: string, freshness?: string, completeness?: string}} state');
  L.push(' * @returns {boolean}');
  L.push(' */');
  L.push('export function requiresProvenanceDisclosure(state) {');
  L.push('  const { source, certainty, freshness, completeness } = state ?? {};');
  L.push('  return (');
  L.push('    (source !== undefined && source !== \'direct\') ||');
  L.push('    (certainty !== undefined && certainty !== \'confirmed\') ||');
  L.push('    (freshness !== undefined && freshness !== \'live\' && freshness !== \'recent\') ||');
  L.push('    (completeness !== undefined && completeness !== \'complete\')');
  L.push('  );');
  L.push('}');

  return L.join('\n') + '\n';
}

// ── dist/system/contract.d.ts ───────────────────────────────
function buildDts() {
  const T = manifest.generatedTypes;
  const L = [
    BANNER.replace(/^\/\//gm, '//'),
    '// TypeScript surface for the Operational Interface Doctrine contract.',
    '//',
    '// These are convenience types. Per §13 the CSS and semantic DOM contracts',
    '// are canonical; removing the TypeScript adapter must not change behavior.',
    '',
  ];

  for (const [axis, values] of axes) {
    const typeName = T[axis] ?? `Oi${pascal(axis)}`;
    L.push(`/** \`${manifest.naming.axisAttributePrefix}${axis}\` — ${manifest.axisStability[axis] ?? 'stable'}. */`);
    L.push(`export type ${typeName} = ${union(values)};`);
    L.push('');
  }

  L.push(`/** Structural primitives (§10). */`);
  L.push(`export type ${T.primitive ?? 'OiPrimitive'} = ${union(primitiveNames)};`);
  L.push('');
  L.push('/** Public part names declared by structural primitives. */');
  L.push(`export type ${T.part ?? 'OiPart'} = ${union(allParts)};`);
  L.push('');
  L.push('/** Primitive-specific part-name narrowing for framework adapters. */');
  L.push('export interface OiPrimitivePartMap {');
  for (const [name, def] of entries(manifest.primitives)) {
    const parts = keys(def.parts ?? {});
    L.push(`  readonly '${name}': ${parts.length ? union(parts) : 'never'};`);
  }
  L.push('}');
  L.push('');
  L.push(`/** Composition recipes (§11). */`);
  L.push(`export type ${T.recipe ?? 'OiRecipe'} = ${union(recipeNames)};`);
  L.push('');
  L.push('/** Public owner-qualified part names declared by composition recipes. */');
  L.push(`export type OiRecipePart = ${allRecipeParts.length ? union(allRecipeParts) : 'never'};`);
  L.push('');
  L.push('/** Recipe-specific part-name narrowing for framework adapters. */');
  L.push('export interface OiRecipePartMap {');
  for (const [name, def] of entries(manifest.recipes)) {
    const parts = keys(def.parts ?? {});
    L.push(`  readonly '${name}': ${parts.length ? union(parts) : 'never'};`);
  }
  L.push('}');
  L.push('');
  L.push(`/** Every slot name declared by any recipe. */`);
  L.push(`export type ${T.slot ?? 'OiSlot'} = ${union(allSlots)};`);
  L.push('');
  L.push(`export type OiStability = ${union(manifest.stabilityLadder.stages)};`);
  L.push('');

  L.push('/** Explicit assertion mode for native browser ESM without Node environment globals. */');
  L.push('export interface OiRuntimeOptions {');
  L.push('  readonly development?: boolean;');
  L.push('}');
  L.push('');

  L.push('/** The orthogonal state of a single operational surface (§5.3). */');
  L.push('export interface OiState {');
  for (const [axis] of axes) {
    const typeName = T[axis] ?? `Oi${pascal(axis)}`;
    L.push(`  ${camel(axis)}?: ${typeName};`);
  }
  L.push('}');
  L.push('');

  L.push("export type OiAccessibleName = 'none' | 'contents' | 'required';");
  L.push("export type OiPartCardinality = 'one' | 'zero-or-one' | 'one-or-more' | 'zero-or-more';");
  L.push("export type OiPartOrderPolicy = 'none' | 'listed' | 'either';");
  L.push('');

  L.push('/** Element and attribute obligations shared by primitive roots and parts. */');
  L.push('export interface OiPrimitiveNodeContract {');
  L.push('  readonly elements: readonly string[];');
  L.push('  readonly requiredClasses?: readonly string[];');
  L.push('  readonly requiredAttributes: Readonly<Record<string, readonly string[]>>;');
  L.push('  readonly forbiddenAttributes: readonly string[];');
  L.push('  readonly accessibleName: OiAccessibleName;');
  L.push('}');
  L.push('');

  L.push('/** Public contract of one owner-qualified primitive part. */');
  L.push('export interface OiPrimitivePartContract extends OiPrimitiveNodeContract {');
  L.push(`  readonly parent: 'root' | ${T.part ?? 'OiPart'};`);
  L.push('  readonly cardinality: OiPartCardinality;');
  L.push('}');
  L.push('');

  L.push('/** Public DOM and styling contract of one structural primitive. */');
  L.push('export interface OiPrimitiveContract {');
  L.push('  readonly stability: OiStability;');
  L.push('  readonly responsibility: string;');
  L.push('  readonly axes: readonly (keyof OiState)[];');
  L.push('  readonly root: OiPrimitiveNodeContract;');
  L.push(`  readonly partOrder: readonly ${T.part ?? 'OiPart'}[];`);
  L.push('  readonly partOrderPolicy: OiPartOrderPolicy;');
  L.push(`  readonly parts: Readonly<Partial<Record<${T.part ?? 'OiPart'}, OiPrimitivePartContract>>>;`);
  L.push('  readonly publicHooks: readonly string[];');
  L.push('}');
  L.push('');

  L.push('/** Public contract of one owner-qualified recipe part. */');
  L.push('export interface OiRecipePartContract extends OiPrimitiveNodeContract {');
  L.push("  readonly parent: 'root' | OiRecipePart;");
  L.push('  readonly cardinality: OiPartCardinality;');
  L.push('}');
  L.push('');

  L.push('/** Named recipe support widths; these are proof points, not a forced minimum size. */');
  L.push('export interface OiRecipeWidths {');
  L.push('  readonly minimumViable: string;');
  L.push('  readonly preferred: string;');
  L.push('  readonly wide: string;');
  L.push('}');
  L.push('');

  L.push('/** Additional semantic obligations owned by a recipe slot. */');
  L.push('export interface OiRecipeSlotSemantics {');
  L.push('  readonly requiredAttributes: Readonly<Record<string, readonly string[]>>;');
  L.push("  readonly visibleText: 'required';");
  L.push("  readonly rootReferenceAttribute: 'aria-describedby';");
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeOverflowBehavior {');
  L.push("  readonly root: 'no-scroll-container';");
  L.push("  readonly text: 'wrap-anywhere';");
  L.push(`  readonly scrollSlots: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push("  readonly documentInlineOverflow: 'forbidden';");
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeTruncationBehavior {');
  L.push("  readonly default: 'none';");
  L.push(`  readonly ellipsisSlots: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push('  readonly preserveNumericValues: true;');
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeOptionalSlotCollapse {');
  L.push("  readonly strategy: 'omit';");
  L.push("  readonly emptySlotElements: 'forbidden';");
  L.push("  readonly residualSpace: 'forbidden';");
  L.push(`  readonly conditionalParts: Readonly<Partial<Record<OiRecipePart, readonly ${T.slot ?? 'OiSlot'}[]>>>;`);
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeDensityBehavior {');
  L.push("  readonly boundary: 'required';");
  L.push('  readonly changes: readonly string[];');
  L.push('  readonly preserves: readonly string[];');
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeAsyncBehavior {');
  L.push('  readonly scenarios: readonly string[];');
  L.push(`  readonly ariaBusyActivities: readonly ${T.activity ?? 'OiActivity'}[];`);
  L.push(`  readonly geometryPreservedSlotsOnLoading: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly retainedSlotsOnRefresh: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly retainedSlotsWhenStale: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push("  readonly failureIsolation: 'smallest-responsible-slot';");
  L.push("  readonly recovery: 'visible-action';");
  L.push("  readonly validEmpty: 'ready-not-loading';");
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeKeyboardFocus {');
  L.push("  readonly model: 'native';");
  L.push("  readonly tabOrder: 'dom';");
  L.push('  readonly rootFocusable: false;');
  L.push('  readonly rovingFocus: false;');
  L.push('  readonly recipeShortcuts: readonly string[];');
  L.push("  readonly escapeBehavior: 'none';");
  L.push("  readonly responsiveReordering: 'forbidden';");
  L.push("  readonly asyncFocus: 'preserve-existing-node';");
  L.push('}');
  L.push('');

  L.push('export interface OiRecipeProofFixtures {');
  L.push('  readonly mappings: readonly string[];');
  L.push('  readonly widths: readonly string[];');
  L.push(`  readonly densities: readonly ${T.density ?? 'OiDensity'}[];`);
  L.push('  readonly asyncScenarios: readonly string[];');
  L.push('  readonly states: readonly string[];');
  L.push('  readonly stress: readonly string[];');
  L.push('}');
  L.push('');

  L.push('/** Public contract of one recipe. */');
  L.push('export interface OiRecipeContract {');
  L.push('  readonly stability: OiStability;');
  L.push('  readonly study?: string;');
  L.push('  readonly axes: readonly (keyof OiState)[];');
  L.push('  readonly root: OiPrimitiveNodeContract;');
  L.push('  readonly partOrder: readonly OiRecipePart[];');
  L.push('  readonly partOrderPolicy: OiPartOrderPolicy;');
  L.push('  readonly parts: Readonly<Partial<Record<OiRecipePart, OiRecipePartContract>>>;');
  L.push(`  readonly slotOrder: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly requiredSlots: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly optionalSlots: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly slotParents: Readonly<Partial<Record<${T.slot ?? 'OiSlot'}, 'root' | OiRecipePart>>>;`);
  L.push(`  readonly slotSemantics: Readonly<Partial<Record<${T.slot ?? 'OiSlot'}, OiRecipeSlotSemantics>>>;`);
  L.push(`  readonly supportedDensities: readonly ${T.density ?? 'OiDensity'}[];`);
  L.push('  readonly widths: OiRecipeWidths;');
  L.push('  readonly overflowBehavior: OiRecipeOverflowBehavior;');
  L.push('  readonly truncationBehavior: OiRecipeTruncationBehavior;');
  L.push('  readonly optionalSlotCollapse: OiRecipeOptionalSlotCollapse;');
  L.push('  readonly densityBehavior: OiRecipeDensityBehavior;');
  L.push('  readonly asyncBehavior: OiRecipeAsyncBehavior;');
  L.push('  readonly keyboardFocus: OiRecipeKeyboardFocus;');
  L.push('  readonly proofFixtures: OiRecipeProofFixtures;');
  L.push('  readonly publicHooks: readonly string[];');
  L.push('}');
  L.push('');

  L.push('export declare const CONTRACT_NAME: string;');
  L.push('export declare const CONTRACT_VERSION: string;');
  for (const [k] of entries(manifest.naming)) {
    L.push(`export declare const ${k}: string;`);
  }
  L.push('');
  for (const [axis, values] of axes) {
    const typeName = T[axis] ?? `Oi${pascal(axis)}`;
    L.push(`export declare const ${camel(axis)}: readonly ${typeName}[];`);
  }
  L.push('');
  L.push('export declare const axes: { readonly [K in keyof OiState]-?: readonly string[] };');
  L.push('export declare const axisAttributes: { readonly [K in keyof OiState]-?: string };');
  L.push("export declare const axisStability: { readonly [K in keyof OiState]-?: 'stable' | 'experimental' };");
  L.push('export declare const truthAxes: readonly string[];');
  L.push('export declare const semanticRoles: Readonly<Record<string, readonly string[]>>;');
  L.push('export declare const semanticRoleVariables: readonly string[];');
  L.push(`export declare const primitives: readonly ${T.primitive ?? 'OiPrimitive'}[];`);
  L.push(`export declare const primitiveAxes: Readonly<Record<${T.primitive ?? 'OiPrimitive'}, readonly string[]>>;`);
  L.push(`export declare const primitiveContracts: Readonly<Record<${T.primitive ?? 'OiPrimitive'}, OiPrimitiveContract>>;`);
  L.push('export declare const primitivePartClasses: {');
  L.push(`  readonly [K in ${T.primitive ?? 'OiPrimitive'}]: Readonly<Partial<Record<OiPrimitivePartMap[K], string>>>;`);
  L.push('};');
  L.push(`export declare const recipes: readonly ${T.recipe ?? 'OiRecipe'}[];`);
  L.push(`export declare const recipeContracts: Readonly<Record<${T.recipe ?? 'OiRecipe'}, OiRecipeContract>>;`);
  L.push('export declare const recipePartClasses: {');
  L.push(`  readonly [K in ${T.recipe ?? 'OiRecipe'}]: Readonly<Partial<Record<OiRecipePartMap[K], string>>>;`);
  L.push('};');
  L.push('export declare const reservedRecipeNames: readonly string[];');
  L.push('export declare const stabilityLadder: readonly OiStability[];');
  L.push('export declare const forbiddenDomainTerms: readonly string[];');
  L.push('');
  L.push('export declare function assertAxisValue(axis: string, value: string, options?: OiRuntimeOptions): boolean;');
  L.push(`export declare function missingRequiredSlots(recipe: ${T.recipe ?? 'OiRecipe'}, providedSlots: readonly string[], options?: OiRuntimeOptions): ${T.slot ?? 'OiSlot'}[];`);
  L.push('export declare function requiresProvenanceDisclosure(state: Pick<OiState, \'source\' | \'certainty\' | \'freshness\' | \'completeness\'>): boolean;');

  return L.join('\n') + '\n';
}

// ── write / check ───────────────────────────────────────────
const contractsCss = buildContractsCss();
const primitivesCss = buildPrimitivesCss();
const recipesCss = buildRecipesCss();
const systemCss = buildSystemCss();
const outputs = {
  'index.js': buildIndexJs(),
  'index.d.ts': buildIndexJs(),
  'contract.js': buildJs(),
  'contract.d.ts': buildDts(),
  'contract.json': `${JSON.stringify(strip(manifest), null, 2)}\n`,
  // Hand-authored runtime shipped beside the generated contract (§20): copied
  // byte-for-byte so --check proves dist never drifts from src.
  'conformance.js': readRequired(join(RUNTIME_SRC, 'conformance.js'), 'conformance runtime'),
  'conformance.d.ts': readRequired(join(RUNTIME_SRC, 'conformance.d.ts'), 'conformance types'),
  'contracts.css': contractsCss,
  'primitives.css': primitivesCss,
  'recipes.css': recipesCss,
  'index.css': systemCss,
  'mappings/dark-roast.css': buildDarkRoastMapping(),
  ...Object.fromEntries(
    recipeNames.map((name) => [`recipes/${name}.css`, buildSingleRecipeCss(name)]),
  ),
};

if (CHECK) {
  const stale = [];
  for (const [name, content] of Object.entries(outputs)) {
    const path = join(OUT_DIR, name);
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) {
      stale.push(`dist/system/${name}`);
    }
  }
  if (stale.length) {
    for (const path of stale) console.error(`✗ stale: ${path}`);
    console.error(`\n${stale.length} generated system file(s) out of sync. Run \`npm run build:system\`.`);
    process.exit(1);
  }
  console.log('✓ dist/system in sync with src/system/contract.json');
} else {
  for (const [name, content] of Object.entries(outputs)) {
    const path = join(OUT_DIR, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  console.log(
    `✓ generated dist/system: ${Object.keys(outputs).join(', ')} (contract ${manifest.version})`,
  );
}
