#!/usr/bin/env node
// Operational Interface Doctrine — contract generator.
//
// Reads the single source of truth (src/system/contract.json) and emits the
// generated adapter surface:
//
//   dist/system/contract.js    frozen constants + development assertions
//   dist/system/contract.d.ts  string-literal unions and interfaces
//   dist/system/contract.json  published manifest, comments stripped
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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'system', 'contract.json');
const OUT_DIR = join(ROOT, 'dist', 'system');
const CHECK = process.argv.includes('--check');

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
const allSlots = [
  ...new Set(entries(manifest.recipes).flatMap(([, r]) => r.slotOrder)),
].sort();

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
  L.push('// ── Recipes (§11) ──');
  L.push(`export const recipes = Object.freeze([${list(recipeNames)}]);`);
  L.push('');
  L.push('export const recipeContracts = Object.freeze({');
  for (const [name, def] of entries(manifest.recipes)) {
    L.push(`  '${name}': Object.freeze({`);
    L.push(`    stability: '${def.stability}',`);
    L.push(`    slotOrder: Object.freeze([${list(def.slotOrder)}]),`);
    L.push(`    requiredSlots: Object.freeze([${list(def.requiredSlots)}]),`);
    L.push(`    optionalSlots: Object.freeze([${list(def.optionalSlots)}]),`);
    L.push(`    supportedDensities: Object.freeze([${list(def.supportedDensities)}]),`);
    L.push(`    publicHooks: Object.freeze([${list(def.publicHooks ?? [])}]),`);
    L.push('  }),');
  }
  L.push('});');

  L.push('');
  L.push(`export const reservedRecipeNames = Object.freeze([${list(manifest.reservedRecipeNames.names)}]);`);
  L.push(`export const stabilityLadder = Object.freeze([${list(manifest.stabilityLadder.stages)}]);`);
  L.push(`export const forbiddenDomainTerms = Object.freeze([${list(manifest.forbiddenDomainTerms.terms)}]);`);

  L.push('');
  L.push('// ── Development assertions (§13, §20) ──');
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
  L.push(' * @returns {boolean} true when the value is valid for the axis.');
  L.push(' */');
  L.push('export function assertAxisValue(axis, value) {');
  L.push('  const allowed = axes[axis];');
  L.push('  if (!allowed) {');
  L.push('    if (process.env.NODE_ENV !== \'production\') {');
  L.push('      throw new Error(`[oi] unknown axis "${axis}"; expected one of ${Object.keys(axes).join(\', \')}`);');
  L.push('    }');
  L.push('    return false;');
  L.push('  }');
  L.push('  if (allowed.includes(value)) return true;');
  L.push('  if (process.env.NODE_ENV !== \'production\') {');
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
  L.push(' * @returns {string[]} Missing required slot names; empty when satisfied.');
  L.push(' */');
  L.push('export function missingRequiredSlots(recipe, providedSlots) {');
  L.push('  const contract = recipeContracts[recipe];');
  L.push('  if (!contract) {');
  L.push('    if (process.env.NODE_ENV !== \'production\') {');
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
  L.push(`/** Composition recipes (§11). */`);
  L.push(`export type ${T.recipe ?? 'OiRecipe'} = ${union(recipeNames)};`);
  L.push('');
  L.push(`/** Every slot name declared by any recipe. */`);
  L.push(`export type ${T.slot ?? 'OiSlot'} = ${union(allSlots)};`);
  L.push('');
  L.push(`export type OiStability = ${union(manifest.stabilityLadder.stages)};`);
  L.push('');

  L.push('/** The orthogonal state of a single operational surface (§5.3). */');
  L.push('export interface OiState {');
  for (const [axis] of axes) {
    const typeName = T[axis] ?? `Oi${pascal(axis)}`;
    L.push(`  ${camel(axis)}?: ${typeName};`);
  }
  L.push('}');
  L.push('');

  L.push('/** Public contract of one recipe. */');
  L.push('export interface OiRecipeContract {');
  L.push('  readonly stability: OiStability;');
  L.push(`  readonly slotOrder: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly requiredSlots: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly optionalSlots: readonly ${T.slot ?? 'OiSlot'}[];`);
  L.push(`  readonly supportedDensities: readonly ${T.density ?? 'OiDensity'}[];`);
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
  L.push(`export declare const recipes: readonly ${T.recipe ?? 'OiRecipe'}[];`);
  L.push(`export declare const recipeContracts: Readonly<Record<${T.recipe ?? 'OiRecipe'}, OiRecipeContract>>;`);
  L.push('export declare const reservedRecipeNames: readonly string[];');
  L.push('export declare const stabilityLadder: readonly OiStability[];');
  L.push('export declare const forbiddenDomainTerms: readonly string[];');
  L.push('');
  L.push('export declare function assertAxisValue(axis: string, value: string): boolean;');
  L.push(`export declare function missingRequiredSlots(recipe: ${T.recipe ?? 'OiRecipe'}, providedSlots: readonly string[]): ${T.slot ?? 'OiSlot'}[];`);
  L.push('export declare function requiresProvenanceDisclosure(state: Pick<OiState, \'source\' | \'certainty\' | \'freshness\' | \'completeness\'>): boolean;');

  return L.join('\n') + '\n';
}

// ── write / check ───────────────────────────────────────────
const outputs = {
  'contract.js': buildJs(),
  'contract.d.ts': buildDts(),
  'contract.json': `${JSON.stringify(strip(manifest), null, 2)}\n`,
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
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, content] of Object.entries(outputs)) {
    writeFileSync(join(OUT_DIR, name), content);
  }
  console.log(
    `✓ generated dist/system: ${Object.keys(outputs).join(', ')} (contract ${manifest.version})`,
  );
}
