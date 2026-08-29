#!/usr/bin/env node
// Operational Interface Doctrine — recipe DOM contract validator.
//
// The compact-monitor fixture is a single, complete ready-state baseline. Its
// browser harness mutates mapping, scenario, density, direction, stress, and
// optional-slot presence; this validator owns the static anatomy those runtime
// matrices start from.

import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = join(ROOT, 'src', 'system', 'contract.json');
const FIXTURE = process.argv[2]
  ? resolve(process.argv[2])
  : join(ROOT, 'spec', 'system', 'compact-monitor.html');

const manifest = JSON.parse(readFileSync(CONTRACT, 'utf8'));
const html = readFileSync(FIXTURE, 'utf8');

const isMeta = (key) => key.startsWith('$') || key.startsWith('_');
const entries = (object) =>
  Object.entries(object).filter(([key]) => !isMeta(key));
const recipeEntries = entries(manifest.recipes);
const recipeDefinitions = new Map(recipeEntries);
const recipeClass = (recipe) =>
  `${manifest.naming.cssClassPrefix}recipe-${recipe}`;
const recipePartClass = (recipe, part) => `${recipeClass(recipe)}__${part}`;

const failures = [];
const seenFailures = new Set();

function relativePath(path) {
  return relative(ROOT, path).split('\\').join('/');
}

function isElement(node) {
  return typeof node?.tagName === 'string';
}

function locationFor(node) {
  const location = node?.sourceCodeLocation?.startTag ?? node?.sourceCodeLocation;
  return location?.startLine
    ? `:${location.startLine}:${location.startCol ?? 1}`
    : '';
}

function attributes(node) {
  return new Map((node?.attrs ?? []).map(({ name, value }) => [name, value]));
}

function attribute(node, name) {
  return attributes(node).get(name);
}

function hasAttribute(node, name) {
  return attributes(node).has(name);
}

function classes(node) {
  return new Set(
    (attribute(node, 'class') ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean),
  );
}

function hasClass(node, className) {
  return classes(node).has(className);
}

function describe(node) {
  if (!isElement(node)) return node?.nodeName ?? 'document';
  const id = attribute(node, 'id');
  const className = attribute(node, 'class');
  return `<${node.tagName}${id ? `#${id}` : ''}${
    className ? `.${className.trim().split(/\s+/).join('.')}` : ''
  }>`;
}

function fail(node, message) {
  const rendered = `${relativePath(FIXTURE)}${locationFor(node)} ${message}`;
  if (!seenFailures.has(rendered)) {
    seenFailures.add(rendered);
    failures.push(rendered);
  }
}

function failPath(message) {
  const rendered = `${relativePath(FIXTURE)} ${message}`;
  if (!seenFailures.has(rendered)) {
    seenFailures.add(rendered);
    failures.push(rendered);
  }
}

function elementChildren(node) {
  return (node?.childNodes ?? []).filter(isElement);
}

function descendants(node, includeSelf = false) {
  const found = [];
  const visit = (current) => {
    if (isElement(current)) found.push(current);
    for (const child of current?.childNodes ?? []) visit(child);
  };
  if (includeSelf) visit(node);
  else for (const child of node?.childNodes ?? []) visit(child);
  return found;
}

function ancestors(node, stopBefore = null) {
  const found = [];
  for (let current = node?.parentNode; current && current !== stopBefore; current = current.parentNode) {
    if (isElement(current)) found.push(current);
  }
  return found;
}

const parseErrors = [];
const document = parse(html, {
  sourceCodeLocationInfo: true,
  onParseError: (error) => parseErrors.push(error),
});
for (const error of parseErrors) {
  failPath(
    `HTML parse error ${error.code} at ${error.startLine}:${error.startCol}`,
  );
}

const allElements = descendants(document);

function isStaticallyHidden(node) {
  for (let current = node; current; current = current.parentNode) {
    if (!isElement(current)) continue;
    if (hasAttribute(current, 'hidden')) return true;
    if ((attribute(current, 'aria-hidden') ?? '').toLowerCase() === 'true') {
      return true;
    }
    const style = (attribute(current, 'style') ?? '').toLowerCase();
    if (
      /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden|content-visibility\s*:\s*hidden)\s*(?:!important\s*)?(?:;|$)/.test(
        style,
      )
    ) {
      return true;
    }
  }
  return false;
}

function visibleText(node) {
  if (!node || isStaticallyHidden(node)) return '';
  if (node.nodeName === '#text') return node.value ?? '';
  return (node.childNodes ?? [])
    .map(visibleText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ids = new Map();
for (const element of allElements) {
  if (!hasAttribute(element, 'id')) continue;
  const id = attribute(element, 'id').trim();
  if (!id) {
    fail(element, 'id must not be empty');
  } else if (ids.has(id)) {
    fail(
      element,
      `duplicate id "${id}"; first declared by ${describe(ids.get(id))}`,
    );
  } else {
    ids.set(id, element);
  }
}

function idReferences(node, attributeName, { required = false } = {}) {
  if (!hasAttribute(node, attributeName)) {
    if (required) fail(node, `${attributeName} is required`);
    return [];
  }

  const references = attribute(node, attributeName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (references.length === 0) {
    fail(node, `${attributeName} must contain at least one ID reference`);
  }
  for (const reference of references) {
    if (!ids.has(reference)) {
      fail(node, `${attributeName} references missing id "${reference}"`);
    }
  }
  return references;
}

function referencedVisibleText(node, attributeName, options = {}) {
  const references = idReferences(node, attributeName, options);
  const text = references
    .map((reference) => visibleText(ids.get(reference)))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (options.required && references.length > 0 && !text) {
    fail(node, `${attributeName} must resolve to visible text`);
  }
  return text;
}

function hasAccessibleName(node) {
  if ((attribute(node, 'aria-label') ?? '').trim()) return true;
  return Boolean(referencedVisibleText(node, 'aria-labelledby'));
}

function validateAccessibleName(node, rule, subject) {
  if (rule === 'contents' && !visibleText(node)) {
    fail(node, `${subject} requires nonempty visible text contents`);
  } else if (rule === 'required' && !hasAccessibleName(node)) {
    fail(node, `${subject} requires an accessible name`);
  }
}

function hasMeaningfulContent(node) {
  if (visibleText(node)) return true;
  return descendants(node).some((descendant) => {
    if (isStaticallyHidden(descendant)) return false;
    if ((attribute(descendant, 'aria-label') ?? '').trim()) return true;
    if (referencedVisibleText(descendant, 'aria-labelledby')) return true;
    if (descendant.tagName === 'img' && (attribute(descendant, 'alt') ?? '').trim()) {
      return true;
    }
    return (
      ['input', 'output', 'progress', 'meter'].includes(descendant.tagName) &&
      (attribute(descendant, 'value') ?? '').trim().length > 0
    );
  });
}

function allowedElement(node, allowed) {
  return allowed.includes('*') || allowed.includes(node.tagName);
}

function validateAttributeContract(node, contract, subject) {
  const nodeAttributes = attributes(node);
  for (const [name, allowedValues] of Object.entries(
    contract.requiredAttributes ?? {},
  )) {
    if (!nodeAttributes.has(name)) {
      fail(node, `${subject} is missing required attribute ${name}`);
      continue;
    }
    const value = nodeAttributes.get(name);
    if (allowedValues.includes('*')) {
      if (!value.trim()) fail(node, `${subject} attribute ${name} must not be empty`);
    } else if (!allowedValues.includes(value)) {
      fail(
        node,
        `${subject} attribute ${name}="${value}" must be one of ${allowedValues.join(', ')}`,
      );
    }
  }

  for (const name of contract.forbiddenAttributes ?? []) {
    if (nodeAttributes.has(name)) {
      fail(node, `${subject} must not declare ${name}`);
    }
  }
  validateAccessibleName(node, contract.accessibleName, subject);
}

function recipeToken(className) {
  const prefix = `${manifest.naming.cssClassPrefix}recipe-`;
  if (!className.startsWith(prefix)) return null;
  const [recipe, part, ...rest] = className.slice(prefix.length).split('__');
  return {
    recipe,
    part: part ?? null,
    malformed: rest.length > 0 || !recipe || part === '',
  };
}

function rootRecipeName(node) {
  const matches = [...classes(node)]
    .map(recipeToken)
    .filter((token) => token && !token.malformed && token.part === null)
    .map((token) => token.recipe)
    .filter((recipe) => recipeDefinitions.has(recipe));
  return matches.length === 1 ? matches[0] : null;
}

function nearestRecipeRoot(node, includeSelf = false) {
  for (
    let current = includeSelf ? node : node?.parentNode;
    current;
    current = current.parentNode
  ) {
    if (isElement(current) && rootRecipeName(current)) return current;
  }
  return null;
}

function ownedDescendants(root) {
  return descendants(root).filter(
    (node) => nearestRecipeRoot(node, true) === root,
  );
}

function cardinalitySatisfied(cardinality, count) {
  if (cardinality === 'one') return count === 1;
  if (cardinality === 'zero-or-one') return count <= 1;
  if (cardinality === 'one-or-more') return count >= 1;
  return true;
}

function expectedCardinality(cardinality) {
  return {
    one: 'exactly one',
    'zero-or-one': 'at most one',
    'one-or-more': 'one or more',
    'zero-or-more': 'zero or more',
  }[cardinality];
}

function validateRecipeAxes(root, recipe, definition) {
  const axisPrefix = manifest.naming.axisAttributePrefix;
  const slotAttribute = manifest.naming.slotAttribute;
  for (const [name, value] of attributes(root)) {
    if (!name.startsWith(axisPrefix) || name === slotAttribute) continue;
    const axis = name.slice(axisPrefix.length);
    if (!Object.hasOwn(manifest.axes, axis)) {
      fail(root, `recipe "${recipe}" declares unknown contract attribute ${name}`);
      continue;
    }
    if (!definition.axes.includes(axis)) {
      fail(root, `recipe "${recipe}" does not consume axis "${axis}"`);
      continue;
    }
    if (!manifest.axes[axis].includes(value)) {
      fail(root, `recipe "${recipe}" has invalid ${axis} value "${value}"`);
    }
  }

  const density = attribute(root, `${axisPrefix}density`);
  if (!definition.supportedDensities.includes(density)) {
    fail(
      root,
      `recipe "${recipe}" density "${density ?? ''}" must be one of ${definition.supportedDensities.join(', ')}`,
    );
  }
}

function validatePartOwnership() {
  for (const element of allElements) {
    const tokens = [...classes(element)].map(recipeToken).filter(Boolean);
    const rootTokens = tokens.filter(
      (token) => !token.malformed && token.part === null,
    );
    const partTokens = tokens.filter((token) => token.part !== null);
    if (rootTokens.length > 1) {
      fail(
        element,
        `element must not implement multiple recipe roots: ${rootTokens
          .map(({ recipe }) => `.${recipeClass(recipe)}`)
          .join(', ')}`,
      );
    }
    if (partTokens.length > 1) {
      fail(
        element,
        `element must not implement multiple recipe parts: ${partTokens
          .map(({ recipe, part }) => `.${recipePartClass(recipe, part)}`)
          .join(', ')}`,
      );
    }

    for (const token of tokens) {
      if (token.malformed) {
        fail(element, `malformed public recipe class in ${describe(element)}`);
        continue;
      }
      const definition = recipeDefinitions.get(token.recipe);
      if (!definition) {
        fail(element, `fixture uses undeclared recipe class for "${token.recipe}"`);
        continue;
      }
      if (token.part === null) continue;
      if (!Object.hasOwn(definition.parts, token.part)) {
        fail(
          element,
          `fixture uses undeclared part .${recipePartClass(token.recipe, token.part)}`,
        );
        continue;
      }
      const owner = nearestRecipeRoot(element);
      if (!owner || rootRecipeName(owner) !== token.recipe) {
        fail(
          element,
          `.${recipePartClass(token.recipe, token.part)} must be owned by .${recipeClass(token.recipe)}`,
        );
      }
    }
  }
}

function validateParts(root, recipe, definition) {
  const owned = ownedDescendants(root);
  const instances = new Map(
    Object.keys(definition.parts).map((part) => [
      part,
      owned.filter((node) => hasClass(node, recipePartClass(recipe, part))),
    ]),
  );

  for (const [part, partDefinition] of Object.entries(definition.parts)) {
    const subject = `.${recipePartClass(recipe, part)}`;
    for (const node of instances.get(part)) {
      const expectedParent = partDefinition.parent;
      const validParent =
        expectedParent === 'root'
          ? node.parentNode === root
          : isElement(node.parentNode) &&
            hasClass(
              node.parentNode,
              recipePartClass(recipe, expectedParent),
            ) &&
            nearestRecipeRoot(node.parentNode, true) === root;
      if (!validParent) {
        fail(
          node,
          `${subject} must be a direct child of ${
            expectedParent === 'root'
              ? `.${recipeClass(recipe)}`
              : `.${recipePartClass(recipe, expectedParent)}`
          }`,
        );
      }
      if (!allowedElement(node, partDefinition.elements)) {
        fail(
          node,
          `${subject} must use ${partDefinition.elements.join(' or ')}, found ${node.tagName}`,
        );
      }
      validateAttributeContract(node, partDefinition, subject);
      if (hasAttribute(node, 'tabindex')) {
        fail(node, `${subject} wrapper must not declare tabindex`);
      }
    }

    const parents =
      partDefinition.parent === 'root'
        ? [root]
        : instances.get(partDefinition.parent) ?? [];
    for (const parent of parents) {
      const count = elementChildren(parent).filter((child) =>
        hasClass(child, recipePartClass(recipe, part)),
      ).length;
      if (!cardinalitySatisfied(partDefinition.cardinality, count)) {
        fail(
          parent,
          `${subject} requires ${expectedCardinality(partDefinition.cardinality)} direct child per ${
            partDefinition.parent === 'root'
              ? 'recipe root'
              : `.${recipePartClass(recipe, partDefinition.parent)}`
          }; found ${count}`,
        );
      }
    }
  }

  validatePartOrder(root, recipe, definition, instances);
  return instances;
}

function validatePartOrder(root, recipe, definition, instances) {
  if (definition.partOrderPolicy === 'none') return;
  const parentNames = new Set([
    'root',
    ...Object.values(definition.parts).map(({ parent }) => parent),
  ]);

  for (const parentName of parentNames) {
    const parents =
      parentName === 'root' ? [root] : instances.get(parentName) ?? [];
    const expected = definition.partOrder.filter(
      (part) => definition.parts[part]?.parent === parentName,
    );
    if (expected.length < 2) continue;

    for (const parent of parents) {
      const observed = elementChildren(parent)
        .flatMap((child) =>
          expected.filter((part) =>
            hasClass(child, recipePartClass(recipe, part)),
          ),
        );
      const presentExpected = expected.filter((part) => observed.includes(part));
      const forward = presentExpected.join('\0');
      const reverse = [...presentExpected].reverse().join('\0');
      const actual = observed.join('\0');
      const valid =
        definition.partOrderPolicy === 'either'
          ? actual === forward || actual === reverse
          : actual === forward;
      if (!valid) {
        fail(
          parent,
          `.${recipeClass(recipe)} part order must follow ${expected.join(' -> ')}${
            definition.partOrderPolicy === 'either'
              ? ` or ${[...expected].reverse().join(' -> ')}`
              : ''
          }`,
        );
      }
    }
  }
}

function validateSlots(root, recipe, definition, partInstances) {
  const slotAttribute = manifest.naming.slotAttribute;
  const owned = ownedDescendants(root);
  const slotNodes = owned.filter((node) => hasAttribute(node, slotAttribute));
  const instances = new Map(
    definition.slotOrder.map((slot) => [
      slot,
      slotNodes.filter((node) => attribute(node, slotAttribute) === slot),
    ]),
  );

  for (const node of slotNodes) {
    const slot = attribute(node, slotAttribute);
    if (!definition.slotOrder.includes(slot)) {
      fail(node, `recipe "${recipe}" uses undeclared slot "${slot}"`);
      continue;
    }
    if (hasAttribute(node, 'tabindex')) {
      fail(node, `slot "${slot}" wrapper must not declare tabindex`);
    }
    if (isStaticallyHidden(node)) {
      fail(node, `slot "${slot}" must be omitted instead of hidden`);
    }

    const expectedParent = definition.slotParents[slot];
    const validParent =
      expectedParent === 'root'
        ? node.parentNode === root
        : isElement(node.parentNode) &&
          hasClass(node.parentNode, recipePartClass(recipe, expectedParent)) &&
          nearestRecipeRoot(node.parentNode, true) === root;
    if (!validParent) {
      fail(
        node,
        `slot "${slot}" must be a direct child of ${
          expectedParent === 'root'
            ? `.${recipeClass(recipe)}`
            : `.${recipePartClass(recipe, expectedParent)}`
        }`,
      );
    }
  }

  for (const slot of definition.requiredSlots) {
    const nodes = instances.get(slot) ?? [];
    if (nodes.length !== 1) {
      fail(root, `required slot "${slot}" must appear exactly once; found ${nodes.length}`);
      continue;
    }
    if (isStaticallyHidden(nodes[0])) {
      fail(nodes[0], `required slot "${slot}" must remain visible`);
    }
    if (
      ancestors(nodes[0], root).some(
        (ancestor) =>
          ancestor.tagName === 'details' || hasClass(ancestor, 'oi-disclosure'),
      )
    ) {
      fail(
        nodes[0],
        `required slot "${slot}" must not be nested under details/disclosure`,
      );
    }
  }

  for (const slot of definition.optionalSlots) {
    const nodes = instances.get(slot) ?? [];
    if (nodes.length > 1) {
      fail(root, `optional slot "${slot}" may appear at most once; found ${nodes.length}`);
    }
    if (nodes.length === 1 && !hasMeaningfulContent(nodes[0])) {
      fail(nodes[0], `optional slot "${slot}" must be nonempty or omitted`);
    }
  }

  const observedOrder = slotNodes
    .map((node) => attribute(node, slotAttribute))
    .filter((slot) => definition.slotOrder.includes(slot));
  const expectedOrder = definition.slotOrder.filter(
    (slot) => (instances.get(slot) ?? []).length > 0,
  );
  if (
    observedOrder.length !== expectedOrder.length ||
    observedOrder.some((slot, index) => slot !== expectedOrder[index])
  ) {
    fail(
      root,
      `flattened slot order must be ${expectedOrder.join(' -> ')}; found ${observedOrder.join(' -> ')}`,
    );
  }

  for (const [part, conditionalSlots] of Object.entries(
    definition.optionalSlotCollapse?.conditionalParts ?? {},
  )) {
    const parts = partInstances.get(part) ?? [];
    const presentSlots = conditionalSlots.filter(
      (slot) => (instances.get(slot) ?? []).length > 0,
    );
    const expectedCount = presentSlots.length > 0 ? 1 : 0;
    if (parts.length !== expectedCount) {
      fail(
        root,
        `conditional part "${part}" must appear iff ${conditionalSlots.join(' or ')} is present; found ${parts.length}`,
      );
    }
    for (const partNode of parts) {
      for (const child of elementChildren(partNode)) {
        const slot = attribute(child, slotAttribute);
        if (!conditionalSlots.includes(slot)) {
          fail(
            child,
            `.${recipePartClass(recipe, part)} may directly contain only ${conditionalSlots
              .map((name) => `[${slotAttribute}="${name}"]`)
              .join(' or ')}`,
          );
        }
      }
      for (const slot of presentSlots) {
        if (!(instances.get(slot) ?? []).some((node) => node.parentNode === partNode)) {
          fail(
            partNode,
            `conditional part "${part}" must contain present slot "${slot}"`,
          );
        }
      }
    }
  }

  return instances;
}

function validateSlotSemantics(root, definition, slotInstances) {
  for (const [slot, semantics] of entries(definition.slotSemantics ?? {})) {
    for (const node of slotInstances.get(slot) ?? []) {
      const subject = `slot "${slot}"`;
      validateAttributeContract(
        node,
        {
          requiredAttributes: semantics.requiredAttributes,
          forbiddenAttributes: [],
          accessibleName: 'none',
        },
        subject,
      );
      if (semantics.visibleText === 'required' && !visibleText(node)) {
        fail(node, `${subject} requires nonempty visible text`);
      }
      if (semantics.rootReferenceAttribute) {
        const id = (attribute(node, 'id') ?? '').trim();
        if (!id) {
          fail(node, `${subject} must have a nonempty id for root ${semantics.rootReferenceAttribute}`);
          continue;
        }
        const references = idReferences(root, semantics.rootReferenceAttribute, {
          required: true,
        });
        if (!references.includes(id)) {
          fail(
            root,
            `${semantics.rootReferenceAttribute} must reference ${subject} id "${id}"`,
          );
        }
      }
    }
  }
}

function validateBusyState(root, definition) {
  if (!definition.asyncBehavior) return;
  const activity = attribute(
    root,
    `${manifest.naming.axisAttributePrefix}activity`,
  );
  const ariaBusy = attribute(root, 'aria-busy');
  if (definition.asyncBehavior.ariaBusyActivities.includes(activity)) {
    if (ariaBusy !== 'true') {
      fail(
        root,
        `activity "${activity}" requires aria-busy="true" on the recipe root`,
      );
    }
  } else if (ariaBusy !== undefined && ariaBusy !== 'false') {
    fail(
      root,
      `activity "${activity ?? 'unspecified'}" requires aria-busy to be absent or "false"`,
    );
  }
}

function validateRecipe(root, recipe, definition) {
  const rootClass = recipeClass(recipe);
  if (!allowedElement(root, definition.root.elements)) {
    fail(
      root,
      `.${rootClass} must use ${definition.root.elements.join(' or ')}, found ${root.tagName}`,
    );
  }
  for (const requiredClass of definition.root.requiredClasses ?? []) {
    if (!hasClass(root, requiredClass)) {
      fail(root, `.${rootClass} is missing required class .${requiredClass}`);
    }
  }
  validateAttributeContract(root, definition.root, `.${rootClass}`);
  validateRecipeAxes(root, recipe, definition);
  if (hasAttribute(root, 'tabindex')) {
    fail(root, `.${rootClass} wrapper must not declare tabindex`);
  }

  const partInstances = validateParts(root, recipe, definition);
  const slotInstances = validateSlots(root, recipe, definition, partInstances);
  validateSlotSemantics(root, definition, slotInstances);
  validateBusyState(root, definition);
  return { partInstances, slotInstances };
}

validatePartOwnership();

const mappingRoots = allElements.filter((element) => hasClass(element, 'oi-root'));
if (mappingRoots.length !== 1) {
  failPath(`expected exactly one .oi-root mapping wrapper, found ${mappingRoots.length}`);
}
for (const root of mappingRoots) {
  if (hasAttribute(root, 'tabindex')) {
    fail(root, '.oi-root mapping wrapper must not declare tabindex');
  }
}

const recipeRoots = allElements.filter((element) => rootRecipeName(element));
for (const root of recipeRoots) {
  const mappingRoot = ancestors(root).find((ancestor) => hasClass(ancestor, 'oi-root'));
  if (!mappingRoot) {
    fail(root, `.${recipeClass(rootRecipeName(root))} must be inside an .oi-root mapping wrapper`);
  } else if (mappingRoots.length === 1 && mappingRoot !== mappingRoots[0]) {
    fail(root, 'recipe root belongs to an unexpected .oi-root mapping wrapper');
  }
}

const proofRoots = allElements.filter((element) =>
  hasAttribute(element, 'data-proof-root'),
);
if (proofRoots.length !== 1) {
  failPath(`expected exactly one [data-proof-root], found ${proofRoots.length}`);
}

const compactRoots = recipeRoots.filter(
  (root) => rootRecipeName(root) === 'compact-monitor',
);
if (recipeDefinitions.has('compact-monitor') && compactRoots.length !== 1) {
  failPath(
    `expected exactly one .${recipeClass('compact-monitor')} fixture root, found ${compactRoots.length}`,
  );
}
if (recipeRoots.length !== 1) {
  failPath(`expected exactly one recipe fixture root, found ${recipeRoots.length}`);
}

let fixtureSlotCount = 0;
let fixturePartCount = 0;
for (const root of recipeRoots) {
  const recipe = rootRecipeName(root);
  const definition = recipeDefinitions.get(recipe);
  const { partInstances, slotInstances } = validateRecipe(
    root,
    recipe,
    definition,
  );
  fixtureSlotCount += [...slotInstances.values()].reduce(
    (count, nodes) => count + nodes.length,
    0,
  );
  fixturePartCount += [...partInstances.values()].reduce(
    (count, nodes) => count + nodes.length,
    0,
  );

  if (hasAttribute(root, 'data-proof-root')) {
    if (recipe !== 'compact-monitor') {
      fail(root, '[data-proof-root] must identify the compact-monitor fixture');
      continue;
    }
    if (root.tagName !== 'section') {
      fail(root, 'compact-monitor proof root must use section');
    }
    if (attribute(root, 'data-oi-surface') !== 'raised') {
      fail(root, 'compact-monitor proof root must start at data-oi-surface="raised"');
    }
    if (attribute(root, 'data-oi-density') !== 'compact') {
      fail(root, 'compact-monitor proof root must start at data-oi-density="compact"');
    }
    if (attribute(root, 'data-oi-activity') !== 'ready') {
      fail(root, 'compact-monitor proof root must start at data-oi-activity="ready"');
    }
    if (attribute(root, 'data-oi-completeness') !== 'complete') {
      fail(root, 'compact-monitor proof root must start at data-oi-completeness="complete"');
    }
    referencedVisibleText(root, 'aria-labelledby', { required: true });
    referencedVisibleText(root, 'aria-describedby', { required: true });
    for (const slot of definition.slotOrder) {
      const count = (slotInstances.get(slot) ?? []).length;
      if (count !== 1) {
        fail(
          root,
          `compact-monitor base proof must include slot "${slot}" exactly once; found ${count}`,
        );
      }
    }
  }
}

if (proofRoots.length === 1 && !recipeRoots.includes(proofRoots[0])) {
  fail(proofRoots[0], '[data-proof-root] must be declared on the recipe root');
}

for (const element of allElements) {
  if (!hasAttribute(element, manifest.naming.slotAttribute)) continue;
  if (!nearestRecipeRoot(element)) {
    fail(
      element,
      `[${manifest.naming.slotAttribute}] must be owned by a declared recipe root`,
    );
  }
}

if (failures.length) {
  failures.sort();
  console.error(
    `FAIL system recipe DOM (${failures.length} problem${failures.length === 1 ? '' : 's'})`,
  );
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `PASS system recipe DOM: ${mappingRoots.length} mapping wrapper, ${recipeRoots.length} recipe fixture, ${fixtureSlotCount} slots, ${fixturePartCount} part${fixturePartCount === 1 ? '' : 's'}`,
);
