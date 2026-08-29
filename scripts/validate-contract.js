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
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REAL_ROOT = realpathSync(ROOT);
const SYSTEM = join(ROOT, 'src', 'system');

const manifestPath = process.argv[2]
  ? resolve(process.argv[2])
  : join(SYSTEM, 'contract.json');
const evidenceOverridePath = process.argv[3] ? resolve(process.argv[3]) : null;
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const packageVersion = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8'),
).version;
const schema = JSON.parse(readFileSync(join(SYSTEM, 'contract.schema.json'), 'utf8'));
const promotionEvidenceSchema = JSON.parse(
  readFileSync(join(ROOT, 'governance', 'promotion-evidence.schema.json'), 'utf8'),
);

const failures = [];
const isMeta = (k) => k.startsWith('$') || k.startsWith('_');
const keys = (o) => Object.keys(o).filter((k) => !isMeta(k));
const entries = (o) => Object.entries(o).filter(([k]) => !isMeta(k));

// ── 1. Structural ───────────────────────────────────────────
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const validatePromotionEvidenceSchema = ajv.compile(promotionEvidenceSchema);
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
const expectedStabilityLadder = [
  'study',
  'candidate',
  'experimental',
  'proven',
  'stable',
  'deprecated',
];
if (manifest.stabilityLadder.stages.join(',') !== expectedStabilityLadder.join(',')) {
  failures.push(`stabilityLadder: stages must remain ${expectedStabilityLadder.join(' -> ')}`);
}
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

function sameMembers(left = [], right = []) {
  return (
    left.length === right.length &&
    left.every((value) => right.includes(value))
  );
}

function formatMembers(values = []) {
  return values.length ? values.join(', ') : '(none)';
}

function remNumber(value) {
  const match = /^(\d+(?:\.\d+)?)rem$/.exec(value ?? '');
  return match ? Number(match[1]) : Number.NaN;
}

function validateEvidenceReference(context, reference, expectedAnchor) {
  const [relativePath, anchor, ...extra] = (reference ?? '').split('#');
  if (!relativePath || !anchor || extra.length) {
    failures.push(`${context}: evidence reference must be a Markdown path with one explicit anchor`);
    return;
  }
  if (expectedAnchor && anchor !== expectedAnchor) {
    failures.push(
      `${context}: evidence anchor must be "${expectedAnchor}", got "${anchor}"`,
    );
    return;
  }
  if (
    relativePath === 'scripts/fixtures/VALIDATOR-PROMOTION-EVIDENCE.md' &&
    !evidenceOverridePath
  ) {
    failures.push(`${context}: validator fixtures cannot serve as product evidence`);
    return;
  }
  const lexicalPath = resolve(ROOT, relativePath);
  if (lexicalPath !== ROOT && !lexicalPath.startsWith(`${ROOT}${sep}`)) {
    failures.push(`${context}: evidence reference escapes the repository: "${reference}"`);
    return;
  }
  if (!existsSync(lexicalPath)) {
    failures.push(`${context}: evidence file does not exist: "${relativePath}"`);
    return;
  }
  let evidencePath;
  try {
    evidencePath = realpathSync(lexicalPath);
  } catch (error) {
    failures.push(`${context}: evidence reference cannot be resolved: ${error.message}`);
    return;
  }
  if (
    evidencePath !== REAL_ROOT &&
    !evidencePath.startsWith(`${REAL_ROOT}${sep}`)
  ) {
    failures.push(`${context}: evidence reference resolves outside the repository`);
    return;
  }
  if (!statSync(evidencePath).isFile()) {
    failures.push(`${context}: evidence reference must resolve to a regular file`);
    return;
  }
  const expectedDouble = `<a id="${anchor}"></a>`;
  const expectedSingle = `<a id='${anchor}'></a>`;
  const hasExactAnchor = readFileSync(evidencePath, 'utf8')
    .split(/\r?\n/)
    .some((line) => {
      const trimmed = line.trim();
      return trimmed === expectedDouble || trimmed === expectedSingle;
    });
  if (!hasExactAnchor) {
    failures.push(`${context}: evidence anchor "${anchor}" does not exist in "${relativePath}"`);
  }
}

function validateIsoDate(context, value) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    failures.push(`${context}: "${value}" is not a real ISO calendar date`);
  }
}

function readPromotionEvidence(context, reference, expectedRecipe) {
  if (typeof reference !== 'string') return null;
  const lexicalPath = evidenceOverridePath ?? resolve(ROOT, reference);
  if (
    !evidenceOverridePath &&
    lexicalPath !== ROOT &&
    !lexicalPath.startsWith(`${ROOT}${sep}`)
  ) {
    failures.push(`${context}: promotion evidence path escapes the repository`);
    return null;
  }
  if (!existsSync(lexicalPath)) {
    failures.push(`${context}: promotion evidence file does not exist: "${reference}"`);
    return null;
  }
  let evidencePath;
  try {
    evidencePath = realpathSync(lexicalPath);
  } catch (error) {
    failures.push(`${context}: promotion evidence cannot be resolved: ${error.message}`);
    return null;
  }
  if (
    !evidenceOverridePath &&
    evidencePath !== REAL_ROOT &&
    !evidencePath.startsWith(`${REAL_ROOT}${sep}`)
  ) {
    failures.push(`${context}: promotion evidence resolves outside the repository`);
    return null;
  }
  if (!statSync(evidencePath).isFile()) {
    failures.push(`${context}: promotion evidence must be a regular file`);
    return null;
  }
  let evidence;
  try {
    evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  } catch (error) {
    failures.push(`${context}: promotion evidence is not valid JSON: ${error.message}`);
    return null;
  }
  if (!validatePromotionEvidenceSchema(evidence)) {
    for (const error of validatePromotionEvidenceSchema.errors) {
      const where = error.instancePath || '(root)';
      failures.push(
        `${context} evidence schema ${where} ${error.message}`,
      );
    }
    return null;
  }
  validateIsoDate(`${context} evidence asOf`, evidence.asOf);
  const todayUtc = new Date().toISOString().slice(0, 10);
  if (evidence.asOf > todayUtc) {
    failures.push(`${context}: evidence asOf ${evidence.asOf} is later than UTC today ${todayUtc}`);
  }
  if (evidence.recipe !== expectedRecipe) {
    failures.push(
      `${context}: promotion evidence is bound to recipe "${evidence.recipe}", not "${expectedRecipe}"`,
    );
    return null;
  }
  return evidence;
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
const primitiveRootClasses = new Set(
  primitiveNames.map((name) => `${manifest.naming.cssClassPrefix}${name}`),
);
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
  const context = `recipe "${name}"`;
  const order = def.slotOrder ?? [];
  const orderSet = new Set(order);
  if (order.length !== orderSet.size) {
    failures.push(`recipe "${name}": slotOrder contains duplicates`);
  }

  for (const slot of def.requiredSlots ?? []) {
    if (!orderSet.has(slot)) failures.push(`recipe "${name}": required slot "${slot}" is absent from slotOrder`);
  }
  for (const slot of def.optionalSlots ?? []) {
    if (!orderSet.has(slot)) failures.push(`recipe "${name}": optional slot "${slot}" is absent from slotOrder`);
  }

  const req = new Set(def.requiredSlots ?? []);
  const opt = new Set(def.optionalSlots ?? []);
  for (const slot of req) {
    if (opt.has(slot)) failures.push(`recipe "${name}": slot "${slot}" is both required and optional`);
  }
  for (const slot of order) {
    if (!req.has(slot) && !opt.has(slot)) {
      failures.push(`recipe "${name}": slot "${slot}" appears in slotOrder but is neither required nor optional`);
    }
  }

  // Recipe axes and root anatomy are public just like primitive anatomy.
  for (const axis of def.axes ?? []) {
    if (!axisSet.has(axis)) {
      failures.push(`${context}: axis "${axis}" is not declared in axes`);
    }
  }

  validateElementContract(`${context} root`, def.root?.elements);
  validateAttributeContract(
    `${context} root`,
    def.root?.requiredAttributes,
    def.root?.forbiddenAttributes,
  );
  for (const className of def.root?.requiredClasses ?? []) {
    if (!primitiveRootClasses.has(className)) {
      failures.push(
        `${context} root: required class "${className}" is not a declared primitive root`,
      );
    }
  }
  for (const [attribute, values] of Object.entries(def.root?.requiredAttributes ?? {})) {
    if (!attribute.startsWith(manifest.naming.axisAttributePrefix)) continue;
    const axis = attribute.slice(manifest.naming.axisAttributePrefix.length);
    if (!axisSet.has(axis)) {
      failures.push(`${context} root: required attribute "${attribute}" names an unknown axis`);
      continue;
    }
    if (!(def.axes ?? []).includes(axis)) {
      failures.push(`${context} root: required axis "${axis}" is absent from recipe axes`);
    }
    for (const value of values) {
      if (value !== '*' && !manifest.axes[axis].includes(value)) {
        failures.push(`${context} root: "${value}" is not a valid ${axis} value`);
      }
    }
  }

  const partNames = keys(def.parts ?? {});
  const partSet = new Set(partNames);
  const partOrder = def.partOrder ?? [];
  const partOrderSet = new Set(partOrder);
  if (partOrder.length !== partOrderSet.size) {
    failures.push(`${context}: partOrder contains duplicates`);
  }
  for (const partName of partNames) {
    if (!partOrderSet.has(partName)) {
      failures.push(`${context}: part "${partName}" is absent from partOrder`);
    }
  }
  for (const partName of partOrder) {
    if (!partSet.has(partName)) {
      failures.push(`${context}: partOrder names undeclared part "${partName}"`);
    }
  }
  const hasParts = partNames.length > 0;
  if (hasParts === (def.partOrderPolicy === 'none')) {
    failures.push(`${context}: partOrderPolicy must be "none" if and only if parts is empty`);
  }
  for (const [partName, part] of entries(def.parts ?? {})) {
    validateElementContract(`${context} part "${partName}"`, part.elements);
    validateAttributeContract(
      `${context} part "${partName}"`,
      part.requiredAttributes,
      part.forbiddenAttributes,
    );
    for (const [attribute, values] of Object.entries(part.requiredAttributes ?? {})) {
      if (!attribute.startsWith(manifest.naming.axisAttributePrefix)) continue;
      const axis = attribute.slice(manifest.naming.axisAttributePrefix.length);
      if (!axisSet.has(axis)) {
        failures.push(`${context} part "${partName}": attribute "${attribute}" names an unknown axis`);
        continue;
      }
      if (!(def.axes ?? []).includes(axis)) {
        failures.push(`${context} part "${partName}": required axis "${axis}" is absent from recipe axes`);
      }
      for (const value of values) {
        if (value !== '*' && !manifest.axes[axis].includes(value)) {
          failures.push(`${context} part "${partName}": "${value}" is not a valid ${axis} value`);
        }
      }
    }
    if (part.parent !== 'root' && !partSet.has(part.parent)) {
      failures.push(
        `${context} part "${partName}": parent "${part.parent}" is not root or a declared part`,
      );
    }
    const ancestry = new Set([partName]);
    let parent = part.parent;
    while (parent && parent !== 'root' && partSet.has(parent)) {
      if (ancestry.has(parent)) {
        failures.push(`${context} part "${partName}": parent graph contains a cycle`);
        break;
      }
      ancestry.add(parent);
      parent = def.parts[parent]?.parent;
    }
  }

  // Every slot has exactly one declared structural parent, and no phantom
  // parent mapping exists outside slotOrder.
  const slotParentNames = keys(def.slotParents ?? {});
  if (!sameMembers(slotParentNames, order)) {
    failures.push(
      `${context}: slotParents must name slotOrder exactly; got ${formatMembers(slotParentNames)}`,
    );
  }
  for (const [slot, parent] of entries(def.slotParents ?? {})) {
    if (!orderSet.has(slot)) {
      failures.push(`${context}: slotParents names undeclared slot "${slot}"`);
    }
    if (parent !== 'root' && !partSet.has(parent)) {
      failures.push(`${context}: slot "${slot}" has undeclared parent "${parent}"`);
    }
  }

  for (const [slot, semantics] of entries(def.slotSemantics ?? {})) {
    if (!orderSet.has(slot)) {
      failures.push(`${context}: slotSemantics names undeclared slot "${slot}"`);
      continue;
    }
    validateAttributeContract(
      `${context} slot "${slot}"`,
      semantics.requiredAttributes,
      [],
    );
  }

  const conditionalParts = def.optionalSlotCollapse?.conditionalParts ?? {};
  for (const [partName, slots] of entries(conditionalParts)) {
    if (!partSet.has(partName)) {
      failures.push(`${context}: conditional part "${partName}" is not declared`);
      continue;
    }
    if (def.parts[partName]?.cardinality !== 'zero-or-one') {
      failures.push(`${context}: conditional part "${partName}" must have zero-or-one cardinality`);
    }
    for (const slot of slots) {
      if (!orderSet.has(slot)) {
        failures.push(`${context}: conditional part "${partName}" names unknown slot "${slot}"`);
      } else if (def.slotParents?.[slot] !== partName) {
        failures.push(
          `${context}: conditional part "${partName}" names slot "${slot}" whose parent is "${def.slotParents?.[slot]}"`,
        );
      }
    }
  }
  for (const partName of partNames) {
    const childSlots = order.filter((slot) => def.slotParents?.[slot] === partName);
    if (childSlots.length && !sameMembers(conditionalParts[partName] ?? [], childSlots)) {
      failures.push(
        `${context}: conditional part "${partName}" must name all and only its child slots (${formatMembers(childSlots)})`,
      );
    }
  }

  // Width names are fixed public proof points. They must remain exact and
  // strictly increasing; changing them requires an intentional contract edit.
  const widthValues = [
    def.widths?.minimumViable,
    def.widths?.preferred,
    def.widths?.wide,
  ];
  const widthNumbers = widthValues.map(remNumber);
  if (
    widthNumbers.some((value) => !Number.isFinite(value)) ||
    !(0 < widthNumbers[0] && widthNumbers[0] < widthNumbers[1] && widthNumbers[1] < widthNumbers[2])
  ) {
    failures.push(`${context}: widths must be positive rem values in strictly increasing order`);
  }
  if (
    name === 'compact-monitor' &&
    !sameMembers(widthValues, ['20rem', '36rem', '52rem'])
  ) {
    failures.push(`${context}: widths must remain 20rem < 36rem < 52rem`);
  }

  const slotReferenceGroups = [
    ['overflowBehavior.scrollSlots', def.overflowBehavior?.scrollSlots],
    ['truncationBehavior.ellipsisSlots', def.truncationBehavior?.ellipsisSlots],
    ['asyncBehavior.geometryPreservedSlotsOnLoading', def.asyncBehavior?.geometryPreservedSlotsOnLoading],
    ['asyncBehavior.retainedSlotsOnRefresh', def.asyncBehavior?.retainedSlotsOnRefresh],
    ['asyncBehavior.retainedSlotsWhenStale', def.asyncBehavior?.retainedSlotsWhenStale],
  ];
  for (const [field, slots] of slotReferenceGroups) {
    for (const slot of slots ?? []) {
      if (!orderSet.has(slot)) failures.push(`${context}: ${field} names unknown slot "${slot}"`);
    }
  }

  for (const activity of def.asyncBehavior?.ariaBusyActivities ?? []) {
    if (!manifest.axes.activity.includes(activity)) {
      failures.push(`${context}: ariaBusyActivities contains invalid activity "${activity}"`);
    }
  }
  if (!(def.axes ?? []).includes('activity') && (def.asyncBehavior?.ariaBusyActivities?.length ?? 0)) {
    failures.push(`${context}: ariaBusyActivities requires the activity axis`);
  }

  const densityValues = def.supportedDensities ?? [];
  const rootDensityValues = def.root?.requiredAttributes?.['data-oi-density'] ?? [];
  if (!sameMembers(rootDensityValues, densityValues)) {
    failures.push(`${context}: root density values must equal supportedDensities`);
  }
  if (!sameMembers(def.proofFixtures?.densities ?? [], densityValues)) {
    failures.push(`${context}: proof fixture densities must equal supportedDensities`);
  }
  if (!sameMembers(def.proofFixtures?.asyncScenarios ?? [], def.asyncBehavior?.scenarios ?? [])) {
    failures.push(`${context}: proof asyncScenarios must equal asyncBehavior.scenarios`);
  }

  const expectedProofWidths = ['minimum-viable', 'preferred', 'wide'];
  if (!sameMembers(def.proofFixtures?.widths ?? [], expectedProofWidths)) {
    failures.push(`${context}: proof width names must be ${expectedProofWidths.join(', ')}`);
  }
  const expectedMappings = ['dark-roast', 'night-shift', 'house-blend', 'alien'];
  if (!sameMembers(def.proofFixtures?.mappings ?? [], expectedMappings)) {
    failures.push(`${context}: proof mappings must be ${expectedMappings.join(', ')}`);
  }

  const supportedProofStates = new Set([
    'disabled',
    ...(def.axes ?? []).flatMap((axis) => manifest.axes[axis] ?? []),
  ]);
  for (const state of def.proofFixtures?.states ?? []) {
    if (!supportedProofStates.has(state)) {
      failures.push(`${context}: proof state "${state}" is not supplied by a supported axis or native disabled state`);
    }
  }

  if (name === 'compact-monitor') {
    if (!def.root?.requiredClasses?.includes('oi-surface')) {
      failures.push(`${context}: root must require the oi-surface primitive class`);
    }
    if (def.slotParents?.context !== 'chrome' || def.slotParents?.actions !== 'chrome') {
      failures.push(`${context}: context and actions must be children of chrome`);
    }
    if (!sameMembers(conditionalParts.chrome ?? [], ['context', 'actions'])) {
      failures.push(`${context}: chrome must be conditional on context or actions`);
    }
  }

  for (const density of densityValues) {
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

  const manualProofGates = def._manualProofGates ?? [];
  const manualGateSet = new Set(manualProofGates);
  const promotionEvidence = readPromotionEvidence(context, def._promotionEvidence, name);
  const adoptionEntries = Object.entries(promotionEvidence?.adoptions ?? {});
  const completeAdoptionIds = new Set();
  const qualifyingAdoptionIds = new Set();

  for (const [adoptionId, adoption] of adoptionEntries) {
    const adoptionContext = `${context} adoption "${adoptionId}"`;
    const manualGateNames = Object.keys(adoption.manualGates ?? {});
    if (!sameMembers(manualGateNames, manualProofGates)) {
      failures.push(
        `${adoptionContext}: manualGates must name every declared manual proof gate exactly; got ${formatMembers(manualGateNames)}`,
      );
    }

    validateEvidenceReference(
      `${adoptionContext} automated proof`,
      adoption.evidenceRef,
      `evidence-${adoptionId}-automated`,
    );
    validateEvidenceReference(
      `${adoptionContext} owner acceptance`,
      adoption.ownerAcceptance?.evidenceRef,
      `evidence-${adoptionId}-owner-acceptance`,
    );
    validateIsoDate(
      `${adoptionContext} owner acceptance`,
      adoption.ownerAcceptance?.acceptedOn,
    );
    if (adoption.ownerAcceptance?.acceptedOn > promotionEvidence.asOf) {
      failures.push(`${adoptionContext}: owner acceptance is later than evidence asOf`);
    }

    const versionsMatch =
      adoption.packageVersion === packageVersion &&
      adoption.contractVersion === manifest.version;

    let manualGatesComplete = manualGateNames.length === manualGateSet.size;
    for (const [gate, disposition] of Object.entries(adoption.manualGates ?? {})) {
      if (!manualGateSet.has(gate)) manualGatesComplete = false;
      if (disposition.disposition === 'pending') {
        manualGatesComplete = false;
      } else if (disposition.disposition === 'passed') {
        validateEvidenceReference(
          `${adoptionContext} manual gate "${gate}"`,
          disposition.evidenceRef,
          `evidence-${adoptionId}-${gate}`,
        );
      } else if (disposition.disposition === 'not-applicable') {
        validateEvidenceReference(
          `${adoptionContext} manual gate "${gate}"`,
          disposition.evidenceRef,
          `evidence-${adoptionId}-${gate}`,
        );
        if (!(disposition.rationale ?? '').trim()) {
          failures.push(`${adoptionContext} manual gate "${gate}": not-applicable requires rationale`);
        }
      }
    }
    if (manualGatesComplete) completeAdoptionIds.add(adoptionId);
    if (manualGatesComplete && versionsMatch) qualifyingAdoptionIds.add(adoptionId);
  }

  const maturityIndex = expectedStabilityLadder.indexOf(def.stability);
  const provenIndex = expectedStabilityLadder.indexOf('proven');
  const stableIndex = expectedStabilityLadder.indexOf('stable');
  if (maturityIndex >= provenIndex && qualifyingAdoptionIds.size === 0) {
    failures.push(
      `${context}: stability "${def.stability}" requires a qualifying adoption with owner acceptance and no pending manual proof gates (§18, §27)`,
    );
  }

  if (maturityIndex >= stableIndex) {
    const basis = promotionEvidence?.stableBasis;
    if (!basis) {
      failures.push(`${context}: stability "${def.stability}" requires stableBasis (§18)`);
    } else {
      validateEvidenceReference(
        `${context} stableBasis`,
        basis.evidenceRef,
        `stable-${name}-${basis.kind}`,
      );
      validateIsoDate(`${context} stableBasis`, basis.decidedOn);
      if (basis.decidedOn > promotionEvidence.asOf) {
        failures.push(`${context} stableBasis: decision is later than evidence asOf`);
      }
      if (!(basis.rationale ?? '').trim()) {
        failures.push(`${context} stableBasis: rationale must contain non-whitespace text`);
      }
      const referenced = basis.adoptionIds ?? [];
      for (const adoptionId of referenced) {
        if (!promotionEvidence.adoptions?.[adoptionId]) {
          failures.push(`${context} stableBasis: unknown adoption "${adoptionId}"`);
        } else if (!completeAdoptionIds.has(adoptionId)) {
          failures.push(`${context} stableBasis: adoption "${adoptionId}" is not complete`);
        }
      }
      if (basis.kind === 'second-consumer') {
        const referencedAdoptions = referenced
          .map((adoptionId) => promotionEvidence.adoptions?.[adoptionId])
          .filter(Boolean);
        const pairs = new Set(
          referencedAdoptions
            .map((adoption) => `${adoption.consumer}/${adoption.surface}`),
        );
        if (referenced.length < 2 || pairs.size < 2) {
          failures.push(
            `${context} stableBasis: second-consumer requires two materially different consumer/surface pairs`,
          );
        }
        for (const [field, value] of [
          ['verifiedCommit', (adoption) => adoption.verifiedCommit],
          ['automated evidence', (adoption) => adoption.evidenceRef],
          ['owner acceptance', (adoption) => adoption.ownerAcceptance?.evidenceRef],
        ]) {
          if (new Set(referencedAdoptions.map(value)).size < 2) {
            failures.push(
              `${context} stableBasis: second-consumer requires distinct ${field}`,
            );
          }
        }
      } else if (basis.kind === 'architecture-review' && referenced.length < 1) {
        failures.push(`${context} stableBasis: architecture-review requires one qualifying adoption`);
      }
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
