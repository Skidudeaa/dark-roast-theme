#!/usr/bin/env node
// Operational Interface Doctrine — contract manifest validator.
//
// Two layers, because JSON Schema alone is not enough:
//
//   1. Structural — src/system/contract.json against contract.schema.json
//      (doctrine §17.5 requires JSON Schema validation of the manifest).
//   2. Referential — the invariants a schema cannot express: recipe slots
//      resolving against their own slot order, primitive axes resolving against
//      declared axes, stability values drawn from the ladder, generated type
//      coverage, and the manifest being free of its own forbidden domain terms.
//
// Contract validation failure aborts generation (§20).

import Ajv from 'ajv';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SYSTEM = join(ROOT, 'src', 'system');

const manifest = JSON.parse(readFileSync(join(SYSTEM, 'contract.json'), 'utf8'));
const schema = JSON.parse(readFileSync(join(SYSTEM, 'contract.schema.json'), 'utf8'));

const failures = [];
const isMeta = (k) => k.startsWith('$') || k.startsWith('_');
const keys = (o) => Object.keys(o).filter((k) => !isMeta(k));
const entries = (o) => Object.entries(o).filter(([k]) => !isMeta(k));

// ── 1. Structural ───────────────────────────────────────────
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(manifest)) {
  for (const err of validate.errors) {
    const where = err.instancePath || '(root)';
    failures.push(`schema ${where} ${err.message}${err.params?.allowedValues ? ` (allowed: ${err.params.allowedValues.join(', ')})` : ''}`);
  }
}

// ── 2. Referential ──────────────────────────────────────────
const axisNames = keys(manifest.axes);
const axisSet = new Set(axisNames);
const ladder = new Set(manifest.stabilityLadder.stages);
const semanticRoleVariables = new Set(
  entries(manifest.semanticRoles).flatMap(([category, roles]) =>
    roles.map((role) => `${manifest.naming.cssVariablePrefix}${category}-${role}`),
  ),
);
const publicHookOwners = new Map();

function validateAttributeContract(context, requiredAttributes, forbiddenAttributes) {
  const required = requiredAttributes ?? {};
  const forbidden = new Set(forbiddenAttributes ?? []);

  for (const [attribute, values] of Object.entries(required)) {
    if (values.includes('*') && values.length !== 1) {
      failures.push(`${context}: attribute "${attribute}" wildcard must be its only allowed value`);
    }
    if (forbidden.has(attribute)) {
      failures.push(`${context}: attribute "${attribute}" is both required and forbidden`);
    }
  }
}

function validateElementContract(context, elements) {
  if (elements?.includes('*') && elements.length !== 1) {
    failures.push(`${context}: element wildcard must be the only allowed element`);
  }
}

function registerPublicHook(ownerType, ownerName, hook, requiredPrefix) {
  if (!hook.startsWith(requiredPrefix)) {
    failures.push(
      `${ownerType} "${ownerName}": public hook "${hook}" must start with "${requiredPrefix}"`,
    );
  }
  if (semanticRoleVariables.has(hook)) {
    failures.push(
      `${ownerType} "${ownerName}": public hook "${hook}" collides with a semantic role`,
    );
  }
  const previousOwner = publicHookOwners.get(hook);
  if (previousOwner) {
    failures.push(
      `${ownerType} "${ownerName}": public hook "${hook}" is already owned by ${previousOwner}`,
    );
  } else {
    publicHookOwners.set(hook, `${ownerType} "${ownerName}"`);
  }
}

// Every axis declares a stability, and no stability names a phantom axis.
for (const axis of axisNames) {
  if (!(axis in manifest.axisStability)) {
    failures.push(`axisStability: missing entry for axis "${axis}"`);
  }
}
for (const axis of keys(manifest.axisStability)) {
  if (!axisSet.has(axis)) failures.push(`axisStability: "${axis}" is not a declared axis`);
}

// Truth axes must be real axes (§9).
for (const member of manifest.truthAxes.members) {
  if (!axisSet.has(member)) failures.push(`truthAxes: "${member}" is not a declared axis`);
}

// Doctrine §10: exactly ten primitives in the first implementation.
const primitiveNames = keys(manifest.primitives);
if (primitiveNames.length !== 10) {
  failures.push(
    `primitives: expected exactly 10 per doctrine §10, found ${primitiveNames.length} (${primitiveNames.join(', ')})`,
  );
}

// Primitive anatomy is public API: every part has one owner, deterministic
// order, valid DOM constraints, and a private hook namespace.
for (const [name, def] of entries(manifest.primitives)) {
  for (const axis of def.axes ?? []) {
    if (!axisSet.has(axis)) {
      failures.push(`primitive "${name}": axis "${axis}" is not declared in axes`);
    }
  }

  if (!ladder.has(def.stability)) {
    failures.push(`primitive "${name}": stability "${def.stability}" is not on the stability ladder`);
  }

  validateElementContract(`primitive "${name}" root`, def.root?.elements);
  validateAttributeContract(
    `primitive "${name}" root`,
    def.root?.requiredAttributes,
    def.root?.forbiddenAttributes,
  );

  const partNames = keys(def.parts ?? {});
  const partSet = new Set(partNames);
  const order = def.partOrder ?? [];
  const orderSet = new Set(order);
  if (order.length !== orderSet.size) {
    failures.push(`primitive "${name}": partOrder contains duplicates`);
  }
  for (const part of partNames) {
    if (!orderSet.has(part)) {
      failures.push(`primitive "${name}": part "${part}" is absent from partOrder`);
    }
  }
  for (const part of order) {
    if (!partSet.has(part)) {
      failures.push(`primitive "${name}": partOrder names undeclared part "${part}"`);
    }
  }

  const hasParts = partNames.length > 0;
  if (hasParts === (def.partOrderPolicy === 'none')) {
    failures.push(
      `primitive "${name}": partOrderPolicy must be "none" if and only if parts is empty`,
    );
  }

  for (const [partName, part] of entries(def.parts ?? {})) {
    validateElementContract(`primitive "${name}" part "${partName}"`, part.elements);
    validateAttributeContract(
      `primitive "${name}" part "${partName}"`,
      part.requiredAttributes,
      part.forbiddenAttributes,
    );
    if (part.parent !== 'root' && !partSet.has(part.parent)) {
      failures.push(
        `primitive "${name}" part "${partName}": parent "${part.parent}" is not root or a declared part`,
      );
    }

    const ancestry = new Set([partName]);
    let parent = part.parent;
    while (parent && parent !== 'root' && partSet.has(parent)) {
      if (ancestry.has(parent)) {
        failures.push(`primitive "${name}" part "${partName}": parent graph contains a cycle`);
        break;
      }
      ancestry.add(parent);
      parent = def.parts[parent]?.parent;
    }
  }

  const hookNamespace = name.split('-')[0];
  for (const hook of def.publicHooks ?? []) {
    registerPublicHook(
      'primitive',
      name,
      hook,
      `${manifest.naming.cssVariablePrefix}${hookNamespace}-`,
    );
  }
}

// Recipe slot algebra: required and optional must partition slotOrder exactly.
const reserved = new Set(manifest.reservedRecipeNames.names);
for (const [name, def] of entries(manifest.recipes)) {
  const order = def.slotOrder;
  const orderSet = new Set(order);
  if (order.length !== orderSet.size) {
    failures.push(`recipe "${name}": slotOrder contains duplicates`);
  }

  for (const slot of def.requiredSlots) {
    if (!orderSet.has(slot)) failures.push(`recipe "${name}": required slot "${slot}" is absent from slotOrder`);
  }
  for (const slot of def.optionalSlots) {
    if (!orderSet.has(slot)) failures.push(`recipe "${name}": optional slot "${slot}" is absent from slotOrder`);
  }

  const req = new Set(def.requiredSlots);
  const opt = new Set(def.optionalSlots);
  for (const slot of req) {
    if (opt.has(slot)) failures.push(`recipe "${name}": slot "${slot}" is both required and optional`);
  }
  for (const slot of order) {
    if (!req.has(slot) && !opt.has(slot)) {
      failures.push(`recipe "${name}": slot "${slot}" appears in slotOrder but is neither required nor optional`);
    }
  }

  for (const density of def.supportedDensities) {
    if (!manifest.axes.density.includes(density)) {
      failures.push(`recipe "${name}": density "${density}" is not a value of the density axis`);
    }
  }

  if (!ladder.has(def.stability)) {
    failures.push(`recipe "${name}": stability "${def.stability}" is not on the stability ladder`);
  }

  // §18: nothing above "candidate" exists without a documented study.
  const needsStudy = !['study', 'candidate'].includes(def.stability);
  if (needsStudy && !def.study) {
    failures.push(`recipe "${name}": stability "${def.stability}" requires a study reference (§18)`);
  }
  if (def.study) {
    const studyPath = def.study.split('#')[0];
    if (!existsSync(join(ROOT, studyPath))) {
      failures.push(`recipe "${name}": study "${studyPath}" does not exist`);
    }
  }

  if (reserved.has(name)) {
    failures.push(`recipe "${name}": implemented recipes must not also be listed in reservedRecipeNames`);
  }

  for (const hook of def.publicHooks ?? []) {
    registerPublicHook(
      'recipe',
      name,
      hook,
      `${manifest.naming.cssVariablePrefix}${name}-`,
    );
  }
}

// Generated type coverage: every axis plus the structural enumerations.
for (const axis of axisNames) {
  if (!manifest.generatedTypes[axis]) {
    failures.push(`generatedTypes: missing type name for axis "${axis}"`);
  }
}
for (const structural of ['primitive', 'part', 'recipe', 'slot']) {
  if (!manifest.generatedTypes[structural]) {
    failures.push(`generatedTypes: missing type name for "${structural}"`);
  }
}
const typeNames = Object.values(
  Object.fromEntries(entries(manifest.generatedTypes)),
);
if (new Set(typeNames).size !== typeNames.length) {
  failures.push('generatedTypes: type names must be unique');
}

// The doctrine document the manifest claims to implement must exist.
if (manifest._doctrine && !existsSync(join(ROOT, manifest._doctrine))) {
  failures.push(`_doctrine: "${manifest._doctrine}" does not exist`);
}

// §5.13: the contract itself must be free of domain vocabulary. Two exemptions,
// both necessary rather than convenient:
//   - documentation keys (_note and friends), which discuss the rules; and
//   - the forbiddenDomainTerms block, which by definition enumerates the terms.
// Without the second exemption the check trivially fails against itself.
const { forbiddenDomainTerms, ...scannable } = manifest;
const contractOnly = JSON.stringify(
  (function stripMeta(value) {
    if (Array.isArray(value)) return value.map(stripMeta);
    if (value && typeof value === 'object') {
      return Object.fromEntries(entries(value).map(([k, v]) => [k, stripMeta(v)]));
    }
    return value;
  })(scannable),
).toLowerCase();

for (const term of forbiddenDomainTerms.terms) {
  if (new RegExp(`\\b${term}\\b`).test(contractOnly)) {
    failures.push(`forbiddenDomainTerms: the contract itself contains the domain term "${term}"`);
  }
}

// ── report ──────────────────────────────────────────────────
if (failures.length) {
  console.error(`FAIL contract (${failures.length} problem${failures.length === 1 ? '' : 's'})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('Contract validation failure aborts generation (§20).');
  process.exit(1);
}

const recipeCount = keys(manifest.recipes).length;
const roleCount = entries(manifest.semanticRoles).reduce((n, [, v]) => n + v.length, 0);
console.log(
  `PASS contract ${manifest.name}@${manifest.version}: ` +
    `${axisNames.length} axes, ${roleCount} semantic roles, ` +
    `${primitiveNames.length} primitives, ${recipeCount} recipe(s)`,
);
