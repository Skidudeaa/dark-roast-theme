#!/usr/bin/env node
// Operational Interface Doctrine — primitive DOM contract validator.
//
// The manifest owns public primitive roots and owner-qualified part classes.
// This fixture proves that both reference mappings exercise exactly that DOM
// contract, including the native HTML and accessibility invariants that JSON
// Schema cannot express.

import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import postcss from 'postcss';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SYSTEM = join(ROOT, 'src', 'system');
const FIXTURE = join(ROOT, 'spec', 'system', 'primitives.html');
const FIXTURE_CSS = join(ROOT, 'spec', 'system', 'primitives-fixture.css');

const manifest = JSON.parse(
  readFileSync(join(SYSTEM, 'contract.json'), 'utf8'),
);
const html = readFileSync(FIXTURE, 'utf8');
const fixtureCss = readFileSync(FIXTURE_CSS, 'utf8');

const isMeta = (key) => key.startsWith('$') || key.startsWith('_');
const entries = (object) =>
  Object.entries(object).filter(([key]) => !isMeta(key));
const primitiveEntries = entries(manifest.primitives);
const primitiveNames = primitiveEntries.map(([name]) => name);
const primitiveClass = (name) => `${manifest.naming.cssClassPrefix}${name}`;
const partClass = (primitive, part) => `${primitiveClass(primitive)}__${part}`;

const primitiveClassToName = new Map(
  primitiveNames.map((name) => [primitiveClass(name), name]),
);
const declaredPartClasses = new Map(
  primitiveEntries.flatMap(([primitive, definition]) =>
    Object.keys(definition.parts).map((part) => [
      partClass(primitive, part),
      { primitive, part },
    ]),
  ),
);
const allowedOiClasses = new Set([
  'oi-root',
  ...primitiveClassToName.keys(),
  ...declaredPartClasses.keys(),
]);

const axisAttributeToName = new Map(
  entries(manifest.axes).map(([axis]) => [
    `${manifest.naming.axisAttributePrefix}${axis}`,
    axis,
  ]),
);
const semanticVariables = new Set(
  entries(manifest.semanticRoles).flatMap(([category, roles]) =>
    roles.map((role) => `${manifest.naming.cssVariablePrefix}${category}-${role}`),
  ),
);
const publicHookVariables = new Set([
  ...primitiveEntries.flatMap(([, definition]) => definition.publicHooks),
  ...entries(manifest.recipes).flatMap(([, definition]) =>
    definition.publicHooks ?? [],
  ),
]);
const primitiveHookToOwner = new Map(
  primitiveEntries.flatMap(([primitive, definition]) =>
    definition.publicHooks.map((hook) => [hook, primitive]),
  ),
);
const publicVariables = new Set([
  ...semanticVariables,
  ...publicHookVariables,
]);

const failures = [];
const seenFailures = new Set();

function relativePath(path) {
  return relative(ROOT, path).split('\\').join('/');
}

function locationFor(node) {
  const start = node?.sourceCodeLocation?.startTag?.startLine
    ? node.sourceCodeLocation.startTag
    : node?.sourceCodeLocation;
  return start?.startLine
    ? `:${start.startLine}:${start.startCol ?? 1}`
    : '';
}

function describe(node) {
  if (!isElement(node)) return node?.nodeName ?? 'document';
  const id = attribute(node, 'id');
  const className = attribute(node, 'class');
  return `<${node.tagName}${id ? `#${id}` : ''}${
    className ? `.${className.trim().split(/\s+/).join('.')}` : ''
  }>`;
}

function fail(node, message, file = FIXTURE) {
  const rendered = `${relativePath(file)}${locationFor(node)} ${message}`;
  if (!seenFailures.has(rendered)) {
    seenFailures.add(rendered);
    failures.push(rendered);
  }
}

function failPath(message, file = FIXTURE) {
  const rendered = `${relativePath(file)} ${message}`;
  if (!seenFailures.has(rendered)) {
    seenFailures.add(rendered);
    failures.push(rendered);
  }
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

function isElement(node) {
  return typeof node?.tagName === 'string';
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
    (attribute(node, 'class') ?? '').trim().split(/\s+/).filter(Boolean),
  );
}

function hasClass(node, className) {
  return classes(node).has(className);
}

function nearestAncestorWithClass(node, className) {
  for (let current = node?.parentNode; current; current = current.parentNode) {
    if (isElement(current) && hasClass(current, className)) return current;
  }
  return null;
}

function visibleText(node) {
  if (
    isElement(node) &&
    (hasAttribute(node, 'hidden') || attribute(node, 'aria-hidden') === 'true')
  ) {
    return '';
  }
  if (node?.nodeName === '#text') return node.value ?? '';
  return (node?.childNodes ?? []).map(visibleText).join(' ').replace(/\s+/g, ' ').trim();
}

function hasReadableSignalText(node) {
  return /[\p{L}\p{N}]/u.test(visibleText(node));
}

const allElements = descendants(document);
const ids = new Map();
for (const element of allElements) {
  if (!hasAttribute(element, 'id')) continue;
  const id = attribute(element, 'id').trim();
  if (!id) {
    fail(element, 'id must not be empty');
  } else if (ids.has(id)) {
    fail(element, `duplicate id "${id}"; first declared by ${describe(ids.get(id))}`);
  } else {
    ids.set(id, element);
  }
}

const IDREF_ATTRIBUTES = new Set([
  'aria-controls',
  'aria-describedby',
  'aria-labelledby',
  'aria-owns',
  'for',
  'headers',
]);
for (const element of allElements) {
  for (const [name, value] of attributes(element)) {
    if (!IDREF_ATTRIBUTES.has(name)) continue;
    const references = value.trim().split(/\s+/).filter(Boolean);
    if (references.length === 0) {
      fail(element, `${name} must contain at least one ID reference`);
      continue;
    }
    for (const reference of references) {
      if (!ids.has(reference)) {
        fail(element, `${name} references missing id "${reference}"`);
      }
    }
  }
}

function referencedText(node, attributeName) {
  const references = (attribute(node, attributeName) ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return references
    .map((reference) => visibleText(ids.get(reference)))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAccessibleName(node) {
  const ariaLabel = attribute(node, 'aria-label');
  if (ariaLabel?.trim()) return true;
  if (referencedText(node, 'aria-labelledby')) return true;

  if (node.tagName === 'meter') {
    const id = attribute(node, 'id');
    return Boolean(
      id &&
        allElements.some(
          (candidate) =>
            candidate.tagName === 'label' &&
            attribute(candidate, 'for') === id &&
            visibleText(candidate),
        ),
    );
  }

  return false;
}

function validateAccessibleName(node, rule, subject) {
  if (rule === 'contents' && !visibleText(node)) {
    fail(node, `${subject} requires nonempty visible text contents`);
  } else if (rule === 'required' && !hasAccessibleName(node)) {
    fail(node, `${subject} requires an accessible name`);
  }
}

function allowedElement(node, allowed) {
  return allowed.includes('*') || allowed.includes(node.tagName);
}

function validateAttributeContract(node, contract, subject) {
  const nodeAttributes = attributes(node);
  for (const [name, allowedValues] of Object.entries(
    contract.requiredAttributes,
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
  for (const name of contract.forbiddenAttributes) {
    if (nodeAttributes.has(name)) {
      fail(node, `${subject} must not declare ${name}`);
    }
  }
  validateAccessibleName(node, contract.accessibleName, subject);
}

function validatePrimitiveAxes(node, primitive, definition) {
  for (const [name, value] of attributes(node)) {
    if (!name.startsWith(manifest.naming.axisAttributePrefix)) continue;
    const axis = axisAttributeToName.get(name);
    if (!axis) {
      fail(node, `primitive "${primitive}" declares unknown contract attribute ${name}`);
      continue;
    }
    if (!definition.axes.includes(axis)) {
      fail(node, `primitive "${primitive}" does not consume axis "${axis}"`);
      continue;
    }
    if (!manifest.axes[axis].includes(value)) {
      fail(node, `primitive "${primitive}" has invalid ${axis} value "${value}"`);
    }
  }
}

function partInstances(root, primitive, part) {
  const rootClass = primitiveClass(primitive);
  const expectedClass = partClass(primitive, part);
  return descendants(root).filter(
    (node) =>
      hasClass(node, expectedClass) &&
      nearestAncestorWithClass(node, rootClass) === root,
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

function childPartName(node, primitive, definition) {
  const matches = Object.keys(definition.parts).filter((part) =>
    hasClass(node, partClass(primitive, part)),
  );
  return matches.length === 1 ? matches[0] : null;
}

function validatePartParentsAndCounts(root, primitive, definition) {
  const instances = new Map(
    Object.keys(definition.parts).map((part) => [
      part,
      partInstances(root, primitive, part),
    ]),
  );

  for (const [part, partDefinition] of Object.entries(definition.parts)) {
    for (const node of instances.get(part)) {
      const parent = node.parentNode;
      const validParent =
        partDefinition.parent === 'root'
          ? parent === root
          : isElement(parent) &&
            hasClass(parent, partClass(primitive, partDefinition.parent)) &&
            nearestAncestorWithClass(parent, primitiveClass(primitive)) === root;
      if (!validParent) {
        fail(
          node,
          `.${partClass(primitive, part)} must be a direct child of ${
            partDefinition.parent === 'root'
              ? `.${primitiveClass(primitive)}`
              : `.${partClass(primitive, partDefinition.parent)}`
          }`,
        );
      }
      if (!allowedElement(node, partDefinition.elements)) {
        fail(
          node,
          `.${partClass(primitive, part)} must use ${partDefinition.elements.join(' or ')}, found ${node.tagName}`,
        );
      }
      validateAttributeContract(
        node,
        partDefinition,
        `.${partClass(primitive, part)}`,
      );
    }

    const parents =
      partDefinition.parent === 'root'
        ? [root]
        : instances.get(partDefinition.parent) ?? [];
    for (const parent of parents) {
      const count = elementChildren(parent).filter((child) =>
        hasClass(child, partClass(primitive, part)),
      ).length;
      if (!cardinalitySatisfied(partDefinition.cardinality, count)) {
        fail(
          parent,
          `.${partClass(primitive, part)} requires ${expectedCardinality(
            partDefinition.cardinality,
          )} direct child per ${
            partDefinition.parent === 'root'
              ? 'primitive root'
              : `.${partClass(primitive, partDefinition.parent)}`
          }; found ${count}`,
        );
      }
    }
  }

  return instances;
}

function validatePartOrder(root, primitive, definition, instances) {
  if (definition.partOrderPolicy === 'none') return;

  const parentNames = new Set([
    'root',
    ...Object.values(definition.parts).map(({ parent }) => parent),
  ]);
  for (const parentName of parentNames) {
    const parents = parentName === 'root' ? [root] : instances.get(parentName) ?? [];
    const orderedParts = definition.partOrder.filter(
      (part) => definition.parts[part]?.parent === parentName,
    );
    if (orderedParts.length === 0) continue;

    for (const parent of parents) {
      const children = elementChildren(parent);
      const observed = children.map((child) =>
        childPartName(child, primitive, definition),
      );
      const expectedClasses = new Set(
        orderedParts.map((part) => partClass(primitive, part)),
      );
      for (let index = 0; index < children.length; index += 1) {
        if (!observed[index]) {
          fail(
            children[index],
            `${describe(parent)} may contain only declared direct parts: ${[
              ...expectedClasses,
            ]
              .map((name) => `.${name}`)
              .join(', ')}`,
          );
        }
      }

      const sequence = observed.filter(Boolean);
      if (definition.partOrderPolicy === 'either') {
        const forward = orderedParts.join('\0');
        const reverse = [...orderedParts].reverse().join('\0');
        const actual = sequence.join('\0');
        if (actual !== forward && actual !== reverse) {
          fail(
            parent,
            `.${primitiveClass(primitive)} parts must appear as ${orderedParts.join(
              ' -> ',
            )} or ${[...orderedParts].reverse().join(' -> ')}`,
          );
        }
        continue;
      }

      let priorIndex = -1;
      for (const part of sequence) {
        const currentIndex = orderedParts.indexOf(part);
        if (currentIndex < priorIndex) {
          fail(
            parent,
            `.${primitiveClass(primitive)} part order must follow ${orderedParts.join(
              ' -> ',
            )}`,
          );
          break;
        }
        priorIndex = currentIndex;
      }
    }
  }
}

function needsMetricProvenance(root) {
  const source = attribute(root, 'data-oi-source');
  const certainty = attribute(root, 'data-oi-certainty');
  const freshness = attribute(root, 'data-oi-freshness');
  const completeness = attribute(root, 'data-oi-completeness');
  return (
    (source !== undefined && source !== 'direct') ||
    (certainty !== undefined && certainty !== 'confirmed') ||
    (freshness !== undefined && !['live', 'recent'].includes(freshness)) ||
    (completeness !== undefined && completeness !== 'complete')
  );
}

function validateMetric(root, instances) {
  const provenance = instances.get('provenance');
  if (needsMetricProvenance(root)) {
    if (provenance.length !== 1) {
      fail(root, 'non-default metric truth requires exactly one provenance part');
    } else {
      const provenanceId = attribute(provenance[0], 'id');
      const describedBy = (attribute(root, 'aria-describedby') ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (!provenanceId || !describedBy.includes(provenanceId)) {
        fail(
          root,
          'non-default metric truth must reference its provenance part with aria-describedby',
        );
      }
      if (!visibleText(provenance[0])) {
        fail(provenance[0], 'metric provenance must contain visible text');
      }
    }
  }

  if (['missing', 'unavailable'].includes(attribute(root, 'data-oi-completeness'))) {
    const text = visibleText(instances.get('value')[0] ?? null);
    if (!text || /\p{N}/u.test(text)) {
      fail(
        root,
        'missing or unavailable metric data must render a visible nonnumeric textual value',
      );
    }
  }

  const trend = instances.get('trend')[0];
  if (trend && !hasReadableSignalText(trend)) {
    fail(trend, 'metric trend requires a textual non-color channel');
  }
}

function validateMeter(root, instances) {
  const label = instances.get('label')[0];
  const control = instances.get('control')[0];
  const valuePart = instances.get('value')[0];
  if (!label || !control || !valuePart) return;

  const controlId = attribute(control, 'id');
  if (attribute(label, 'for') !== controlId) {
    fail(label, 'meter label for must exactly match the native meter id');
  }

  const minimum = Number(attribute(control, 'min'));
  const maximum = Number(attribute(control, 'max'));
  const value = Number(attribute(control, 'value'));
  if (![minimum, maximum, value].every(Number.isFinite)) {
    fail(control, 'meter min, max, and value must be finite numbers');
  } else {
    if (!(minimum < maximum)) fail(control, 'meter min must be less than max');
    if (value < minimum || value > maximum) {
      fail(control, 'meter value must be within its declared min/max range');
    }
  }

  if (!hasReadableSignalText(valuePart)) {
    fail(valuePart, 'meter requires a visible non-color value channel');
  }
  if (!hasReadableSignalText(control)) {
    fail(control, 'native meter requires meaningful fallback text');
  }

  const visualValueDeclarations = styleDeclarations(root).filter(
    (declaration) => declaration.prop === '--oi-meter-value',
  );
  if (visualValueDeclarations.length !== 1) {
    fail(root, 'meter root must define --oi-meter-value exactly once');
  } else {
    const match = /^([+\-]?(?:\d+(?:\.\d*)?|\.\d+))%$/.exec(
      visualValueDeclarations[0].value.trim(),
    );
    if (!match) {
      fail(root, '--oi-meter-value must be an explicit percentage');
    } else if ([minimum, maximum, value].every(Number.isFinite) && minimum < maximum) {
      const visualPercentage = Number(match[1]);
      const semanticPercentage = ((value - minimum) / (maximum - minimum)) * 100;
      if (Math.abs(visualPercentage - semanticPercentage) > 0.001) {
        fail(
          root,
          `--oi-meter-value ${visualPercentage}% does not match native meter value ${semanticPercentage}%`,
        );
      }
    }
  }
}

const INTERACTIVE_TAGS = new Set([
  'button',
  'details',
  'embed',
  'iframe',
  'input',
  'object',
  'select',
  'summary',
  'textarea',
]);
const INTERACTIVE_ROLES = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'menuitem',
  'option',
  'radio',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
]);

function isInteractiveDescendant(node) {
  if (INTERACTIVE_TAGS.has(node.tagName)) return true;
  if (node.tagName === 'a' && hasAttribute(node, 'href')) return true;
  if (
    ['audio', 'video'].includes(node.tagName) &&
    hasAttribute(node, 'controls')
  ) {
    return true;
  }
  if (hasAttribute(node, 'tabindex')) return true;
  if (
    hasAttribute(node, 'contenteditable') &&
    attribute(node, 'contenteditable') !== 'false'
  ) {
    return true;
  }
  return INTERACTIVE_ROLES.has(attribute(node, 'role'));
}

function validateDisclosure(root, instances) {
  const summary = instances.get('summary')[0];
  if (!summary) return;
  if (elementChildren(root)[0] !== summary) {
    fail(summary, 'native disclosure summary must be the first element child');
  }
  for (const descendant of descendants(summary)) {
    if (isInteractiveDescendant(descendant)) {
      fail(descendant, 'disclosure summary must not contain interactive descendants');
    }
  }
}

function styleDeclarations(node) {
  const style = attribute(node, 'style');
  if (style === undefined) return [];
  try {
    const root = postcss.parse(`fixture { ${style} }`);
    return root.first?.nodes?.filter((child) => child.type === 'decl') ?? [];
  } catch (error) {
    fail(node, `inline style parse error: ${error.reason ?? error.message}`);
    return [];
  }
}

function validateHistory(root, instances) {
  const items = instances.get('item');
  let priorTime = null;
  for (const item of items) {
    const time = elementChildren(item).find((child) =>
      hasClass(child, partClass('history-strip', 'time')),
    );
    const value = elementChildren(item).find((child) =>
      hasClass(child, partClass('history-strip', 'value')),
    );
    if (time) {
      const parsed = Date.parse(attribute(time, 'datetime'));
      if (!Number.isFinite(parsed)) {
        fail(time, `history datetime "${attribute(time, 'datetime')}" is invalid`);
      } else if (priorTime !== null && parsed <= priorTime) {
        fail(time, 'history items must be strictly chronological, oldest to newest');
      } else {
        priorTime = parsed;
      }
    }

    if (!value || !hasReadableSignalText(value)) {
      fail(item, 'history item requires a visible non-color intensity value');
    }

    const intensityDeclarations = styleDeclarations(item).filter(
      (declaration) => declaration.prop === '--oi-history-intensity',
    );
    if (intensityDeclarations.length !== 1) {
      fail(item, 'history item must define --oi-history-intensity exactly once');
    } else {
      const intensity = Number(intensityDeclarations[0].value.trim());
      if (!Number.isFinite(intensity) || intensity < 0 || intensity > 1) {
        fail(item, '--oi-history-intensity must be a finite number from 0 through 1');
      }
    }
  }
}

function validateDivider(root) {
  const orientation = attribute(root, 'aria-orientation');
  if (orientation !== undefined && !['horizontal', 'vertical'].includes(orientation)) {
    fail(root, 'divider aria-orientation must be horizontal or vertical');
  }
  if (
    hasAttribute(root, 'autofocus') ||
    (hasAttribute(root, 'contenteditable') &&
      attribute(root, 'contenteditable') !== 'false')
  ) {
    fail(root, 'divider must remain nonfocusable');
  }
}

function validatePrimitive(root, primitive, definition) {
  if (!allowedElement(root, definition.root.elements)) {
    fail(
      root,
      `.${primitiveClass(primitive)} must use ${definition.root.elements.join(
        ' or ',
      )}, found ${root.tagName}`,
    );
  }
  validateAttributeContract(root, definition.root, `.${primitiveClass(primitive)}`);
  validatePrimitiveAxes(root, primitive, definition);

  const instances = validatePartParentsAndCounts(root, primitive, definition);
  validatePartOrder(root, primitive, definition, instances);

  if (primitive === 'metric') validateMetric(root, instances);
  else if (primitive === 'meter') validateMeter(root, instances);
  else if (primitive === 'disclosure') validateDisclosure(root, instances);
  else if (primitive === 'history-strip') validateHistory(root, instances);
  else if (primitive === 'divider') validateDivider(root);
}

for (const element of allElements) {
  const oiClasses = [...classes(element)].filter((className) =>
    className.startsWith(manifest.naming.cssClassPrefix),
  );
  for (const className of oiClasses) {
    if (!allowedOiClasses.has(className)) {
      fail(element, `fixture uses undeclared public class .${className}`);
    }
  }

  const ownerParts = oiClasses.filter((className) =>
    declaredPartClasses.has(className),
  );
  if (ownerParts.length > 1) {
    fail(element, `element must not implement multiple primitive parts: ${ownerParts.join(', ')}`);
  }
  for (const className of ownerParts) {
    const { primitive } = declaredPartClasses.get(className);
    if (!nearestAncestorWithClass(element, primitiveClass(primitive))) {
      fail(element, `.${className} appears outside .${primitiveClass(primitive)}`);
    }
  }

  for (const declaration of styleDeclarations(element)) {
    if (declaration.prop.startsWith('--oi-') && !publicVariables.has(declaration.prop)) {
      fail(element, `inline style defines undocumented public variable ${declaration.prop}`);
    }
    if (declaration.prop.startsWith('--dr-') || declaration.value.includes('--dr-')) {
      fail(element, 'fixture inline styles must not reference --dr-*');
    }
    const hookOwner = primitiveHookToOwner.get(declaration.prop);
    if (
      hookOwner &&
      !hasClass(element, primitiveClass(hookOwner)) &&
      !nearestAncestorWithClass(element, primitiveClass(hookOwner))
    ) {
      fail(
        element,
        `primitive hook ${declaration.prop} appears outside .${primitiveClass(hookOwner)}`,
      );
    }
  }
}

const expectedStylesheets = [
  '../../dist/css/dark-roast.css',
  '../../dist/system/index.css',
  '../../dist/system/mappings/dark-roast.css',
  './mappings/alien.css',
  './primitives-fixture.css',
];
const actualStylesheets = allElements
  .filter(
    (element) =>
      element.tagName === 'link' &&
      (attribute(element, 'rel') ?? '')
        .toLowerCase()
        .split(/\s+/)
        .includes('stylesheet'),
  )
  .map((element) => attribute(element, 'href'));
if (
  actualStylesheets.length !== expectedStylesheets.length ||
  actualStylesheets.some((href, index) => href !== expectedStylesheets[index])
) {
  failPath(
    `stylesheet order must be exactly: ${expectedStylesheets.join(' -> ')}`,
  );
}

const mappingRoots = allElements.filter((element) => hasClass(element, 'oi-root'));
if (mappingRoots.length !== 2) {
  failPath(`expected exactly two .oi-root mapping sections, found ${mappingRoots.length}`);
}
for (const root of mappingRoots) {
  if (root.tagName !== 'section') {
    fail(root, `.oi-root fixture mapping must use section, found ${root.tagName}`);
  }
}
const alienRoots = mappingRoots.filter(
  (root) => attribute(root, 'data-oi-mapping') === 'alien',
);
if (alienRoots.length !== 1) {
  failPath(`expected exactly one .oi-root[data-oi-mapping="alien"], found ${alienRoots.length}`);
}
const darkRoots = mappingRoots.filter(
  (root) => !hasAttribute(root, 'data-oi-mapping'),
);
if (darkRoots.length !== 1) {
  failPath(`expected exactly one default Dark Roast .oi-root, found ${darkRoots.length}`);
}
for (const root of mappingRoots) {
  if (
    hasAttribute(root, 'data-oi-mapping') &&
    attribute(root, 'data-oi-mapping') !== 'alien'
  ) {
    fail(root, `unknown fixture mapping "${attribute(root, 'data-oi-mapping')}"`);
  }

  for (const [primitive, definition] of primitiveEntries) {
    const roots = descendants(root).filter((node) =>
      hasClass(node, primitiveClass(primitive)),
    );
    if (roots.length !== 1) {
      fail(
        root,
        `mapping fixture requires exactly one .${primitiveClass(primitive)}, found ${roots.length}`,
      );
      continue;
    }
    validatePrimitive(roots[0], primitive, definition);
  }
}

for (const element of allElements) {
  for (const className of classes(element)) {
    if (!primitiveClassToName.has(className)) continue;
    if (!nearestAncestorWithClass(element, 'oi-root')) {
      fail(element, `.${className} must be contained by an .oi-root mapping`);
    }
  }
}

function validateFixtureCss() {
  let cssRoot;
  try {
    cssRoot = postcss.parse(fixtureCss, { from: FIXTURE_CSS });
  } catch (error) {
    failPath(`CSS parse error: ${error.reason ?? error.message}`, FIXTURE_CSS);
    return;
  }

  const substantive = cssRoot.nodes.filter((node) => node.type !== 'comment');
  if (
    substantive.length !== 1 ||
    substantive[0].type !== 'atrule' ||
    substantive[0].name.toLowerCase() !== 'layer' ||
    substantive[0].params.trim() !== 'product' ||
    !Array.isArray(substantive[0].nodes)
  ) {
    failPath('fixture CSS must be contained by exactly one @layer product block', FIXTURE_CSS);
  }

  cssRoot.walkDecls((declaration) => {
    if (
      declaration.prop.startsWith('--dr-') ||
      /--dr-[a-z0-9-]+/i.test(declaration.value)
    ) {
      fail(declaration, '--dr-* is prohibited in the product fixture', FIXTURE_CSS);
    }
    const references = declaration.value.match(/--oi-[a-z0-9-]+/g) ?? [];
    for (const reference of references) {
      if (!publicVariables.has(reference)) {
        fail(
          declaration,
          `fixture CSS references undocumented operational variable ${reference}`,
          FIXTURE_CSS,
        );
      }
    }
    if (
      /#[0-9a-f]{3,8}\b/i.test(declaration.value) ||
      /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i.test(
        declaration.value,
      )
    ) {
      fail(declaration, 'raw color is prohibited in the product fixture', FIXTURE_CSS);
    }
  });
}

validateFixtureCss();

const scannableFixture = `${html}\n${fixtureCss}`.toLowerCase();
for (const term of manifest.forbiddenDomainTerms.terms) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`\\b${escaped}\\b`, 'i').test(scannableFixture)) {
    failPath(`generic primitive fixture contains forbidden domain term "${term}"`);
  }
}

if (failures.length) {
  failures.sort();
  console.error(
    `FAIL system DOM (${failures.length} problem${failures.length === 1 ? '' : 's'})`,
  );
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

const partCount = primitiveEntries.reduce(
  (count, [, definition]) => count + Object.keys(definition.parts).length,
  0,
);
console.log(
  `PASS system DOM: 2 mappings, ${primitiveEntries.length * 2} primitive fixtures, ${partCount} declared parts`,
);
