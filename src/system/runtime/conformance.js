// Operational Interface Doctrine — public conformance checker.
//
// Hand-authored runtime source. scripts/build-system.js copies this file
// byte-for-byte to dist/system/conformance.js beside the generated contract,
// which is why it imports './contract.js' rather than a src path.
//
// The first live adoption (Project Control) had to re-implement the recipe DOM
// rules in its own repository before it could trust its template. This module
// is that check, shipped: the same manifest-driven root/part/slot/axis/ARIA
// obligations the kernel fixtures are held to, runnable against a real browser
// DOM (fromDom) or a parse5 tree (fromParse5). Zero dependencies.
//
// It reports findings; it never mutates the tree and never throws for markup
// problems. Contract drift throws, because that is a build error.

import {
  axes as AXES,
  axisAttributePrefix,
  cssClassPrefix,
  cssVariablePrefix,
  primitiveContracts,
  recipeContracts,
  semanticRoleVariables,
  slotAttribute,
} from './contract.js';

// ── tree model ──────────────────────────────────────────────
// { kind: 'document' | 'element' | 'text', tag, attrs: Map, children, parent,
//   text, location: { line, column } | null, source: original node }

function element(tag, parent, source, location = null) {
  return {
    kind: 'element',
    tag,
    attrs: new Map(),
    children: [],
    parent,
    text: '',
    location,
    source,
  };
}

/**
 * Build a checkable tree from a live DOM Document, DocumentFragment, or Element.
 *
 * Passing an Element checks only that subtree, but the whole document is still
 * read so ancestors (the .oi-root wrapper) and ID references outside the
 * subtree resolve exactly as they do in the browser.
 * @param {Node} node
 */
export function fromDom(node) {
  if (!node || typeof node.nodeType !== 'number') {
    throw new TypeError('[oi] fromDom expects a DOM Node');
  }
  const built = new Map();
  const build = (domNode, parent) => {
    switch (domNode.nodeType) {
      case 1: {
        const current = element(String(domNode.tagName).toLowerCase(), parent, domNode);
        built.set(domNode, current);
        for (const name of domNode.getAttributeNames()) {
          current.attrs.set(name.toLowerCase(), domNode.getAttribute(name) ?? '');
        }
        for (const child of domNode.childNodes) {
          const childNode = build(child, current);
          if (childNode) current.children.push(childNode);
        }
        return current;
      }
      case 3:
        return { kind: 'text', tag: '#text', attrs: new Map(), children: [], parent, text: domNode.data ?? '', location: null, source: domNode };
      case 9:
      case 11: {
        const document = element('#document', parent, domNode);
        document.kind = 'document';
        for (const child of domNode.childNodes) {
          const childNode = build(child, document);
          if (childNode) document.children.push(childNode);
        }
        return document;
      }
      default:
        return null;
    }
  };
  const top = typeof node.getRootNode === 'function' ? node.getRootNode() : node;
  const tree = build(top === node || (top.nodeType !== 9 && top.nodeType !== 11) ? node : top, null);
  if (node.nodeType === 1 && built.get(node) !== tree) tree.scope = built.get(node) ?? null;
  return tree;
}

/**
 * Build a checkable tree from a parse5 document or element node. Parse with
 * `sourceCodeLocationInfo: true` to receive line/column positions. Passing an
 * element checks only that subtree while ancestors and IDs resolve document-wide.
 * @param {object} node
 */
export function fromParse5(node) {
  if (!node || typeof node.nodeName !== 'string') {
    throw new TypeError('[oi] fromParse5 expects a parse5 node');
  }
  const built = new Map();
  const build = (p5, parent) => {
    if (p5.nodeName === '#text') {
      return { kind: 'text', tag: '#text', attrs: new Map(), children: [], parent, text: p5.value ?? '', location: null, source: p5 };
    }
    if (p5.nodeName === '#comment' || p5.nodeName === '#documentType') return null;
    const isDocument = p5.nodeName === '#document' || p5.nodeName === '#document-fragment';
    if (!isDocument && typeof p5.tagName !== 'string') return null;
    const start = p5.sourceCodeLocation?.startTag ?? p5.sourceCodeLocation ?? null;
    const current = element(
      isDocument ? '#document' : p5.tagName.toLowerCase(),
      parent,
      p5,
      start?.startLine ? { line: start.startLine, column: start.startCol ?? 1 } : null,
    );
    if (isDocument) current.kind = 'document';
    built.set(p5, current);
    for (const { name, value } of p5.attrs ?? []) current.attrs.set(name.toLowerCase(), value);
    const children = p5.nodeName === 'template' && p5.content ? p5.content.childNodes : p5.childNodes;
    for (const child of children ?? []) {
      const childNode = build(child, current);
      if (childNode) current.children.push(childNode);
    }
    return current;
  };
  let top = node;
  while (top.parentNode) top = top.parentNode;
  const tree = build(top, null);
  if (top !== node && built.get(node) !== tree) tree.scope = built.get(node) ?? null;
  return tree;
}

// ── tree helpers ────────────────────────────────────────────
const isElement = (node) => node?.kind === 'element';
const attr = (node, name) => node?.attrs?.get(name);
const has = (node, name) => Boolean(node?.attrs?.has(name));
const classes = (node) =>
  new Set((attr(node, 'class') ?? '').trim().split(/\s+/).filter(Boolean));
const hasClass = (node, name) => classes(node).has(name);
const elementChildren = (node) => (node?.children ?? []).filter(isElement);

function descendants(node, includeSelf = false) {
  const found = [];
  const visit = (current) => {
    if (isElement(current)) found.push(current);
    for (const child of current?.children ?? []) visit(child);
  };
  if (includeSelf) visit(node);
  else for (const child of node?.children ?? []) visit(child);
  return found;
}

function ancestors(node, stopBefore = null) {
  const found = [];
  for (let current = node?.parent; current && current !== stopBefore; current = current.parent) {
    if (isElement(current)) found.push(current);
  }
  return found;
}

function nearestAncestorWithClass(node, className) {
  for (let current = node?.parent; current; current = current.parent) {
    if (isElement(current) && hasClass(current, className)) return current;
  }
  return null;
}

const HIDDEN_STYLE =
  /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden|content-visibility\s*:\s*hidden)\s*(?:!important\s*)?(?:;|$)/;

function isHiddenNode(node) {
  return (
    has(node, 'hidden') ||
    (attr(node, 'aria-hidden') ?? '').toLowerCase() === 'true' ||
    HIDDEN_STYLE.test((attr(node, 'style') ?? '').toLowerCase())
  );
}

function isStaticallyHidden(node) {
  for (let current = node; current; current = current.parent) {
    if (isElement(current) && isHiddenNode(current)) return true;
  }
  return false;
}

function visibleText(node) {
  if (!node) return '';
  if (node.kind === 'text') return node.text ?? '';
  if (isStaticallyHidden(node)) return '';
  return node.children.map(visibleText).join(' ').replace(/\s+/g, ' ').trim();
}

const hasReadableSignalText = (node) => /[\p{L}\p{N}]/u.test(visibleText(node));

function styleDeclarations(node) {
  const style = attr(node, 'style');
  if (style === undefined) return [];
  return style
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf(':');
      if (separator <= 0) return null;
      return { prop: part.slice(0, separator).trim(), value: part.slice(separator + 1).trim() };
    })
    .filter(Boolean);
}

function describe(node) {
  if (!isElement(node)) return node?.tag ?? 'document';
  const id = attr(node, 'id');
  const className = attr(node, 'class');
  return `<${node.tag}${id ? `#${id}` : ''}${
    className ? `.${className.trim().split(/\s+/).join('.')}` : ''
  }>`;
}

// ── contract derivations ────────────────────────────────────
const primitiveEntries = Object.entries(primitiveContracts);
const recipeEntries = Object.entries(recipeContracts);
const primitiveClass = (name) => `${cssClassPrefix}${name}`;
const primitivePartClass = (primitive, part) => `${primitiveClass(primitive)}__${part}`;
const recipeClass = (recipe) => `${cssClassPrefix}recipe-${recipe}`;
const recipePartClass = (recipe, part) => `${recipeClass(recipe)}__${part}`;
const RECIPE_CLASS_PREFIX = `${cssClassPrefix}recipe-`;
const ROOT_CLASS = `${cssClassPrefix}root`;

const primitiveByClass = new Map(primitiveEntries.map(([name]) => [primitiveClass(name), name]));
const primitivePartByClass = new Map(
  primitiveEntries.flatMap(([primitive, contract]) =>
    Object.keys(contract.parts).map((part) => [
      primitivePartClass(primitive, part),
      { primitive, part },
    ]),
  ),
);
const semanticVariables = new Set(semanticRoleVariables);
const publicHookVariables = new Set([
  ...primitiveEntries.flatMap(([, contract]) => contract.publicHooks),
  ...recipeEntries.flatMap(([, contract]) => contract.publicHooks ?? []),
]);
const primitiveHookOwner = new Map(
  primitiveEntries.flatMap(([primitive, contract]) =>
    contract.publicHooks.map((hook) => [hook, primitive]),
  ),
);
const recipeHookOwner = new Map(
  recipeEntries.flatMap(([recipe, contract]) =>
    (contract.publicHooks ?? []).map((hook) => [hook, recipe]),
  ),
);
const publicVariables = new Set([...semanticVariables, ...publicHookVariables]);
const palettePrefix = '--dr-';

function recipeToken(className) {
  if (!className.startsWith(RECIPE_CLASS_PREFIX)) return null;
  const [recipe, part, ...rest] = className.slice(RECIPE_CLASS_PREFIX.length).split('__');
  return { recipe, part: part ?? null, malformed: rest.length > 0 || !recipe || part === '' };
}

function rootRecipeName(node) {
  const matches = [...classes(node)]
    .map(recipeToken)
    .filter((token) => token && !token.malformed && token.part === null)
    .map((token) => token.recipe)
    .filter((recipe) => Object.hasOwn(recipeContracts, recipe));
  return matches.length === 1 ? matches[0] : null;
}

function nearestRecipeRoot(node, includeSelf = false) {
  for (let current = includeSelf ? node : node?.parent; current; current = current.parent) {
    if (isElement(current) && rootRecipeName(current)) return current;
  }
  return null;
}

const cardinalitySatisfied = (cardinality, count) =>
  cardinality === 'one'
    ? count === 1
    : cardinality === 'zero-or-one'
      ? count <= 1
      : cardinality === 'one-or-more'
        ? count >= 1
        : true;

const expectedCardinality = (cardinality) =>
  ({
    one: 'exactly one',
    'zero-or-one': 'at most one',
    'one-or-more': 'one or more',
    'zero-or-more': 'zero or more',
  })[cardinality];

const allowedElement = (node, allowed) => allowed.includes('*') || allowed.includes(node.tag);

// ── checker ─────────────────────────────────────────────────

/**
 * Check every Operational Interface primitive and recipe root in a tree
 * against the generated contract.
 *
 * @param {object} tree A tree from fromDom() or fromParse5().
 * @returns {{ findings: OiFinding[], primitives: number, recipes: number }}
 */
export function checkConformance(tree) {
  if (!tree || (tree.kind !== 'document' && tree.kind !== 'element')) {
    throw new TypeError('[oi] checkConformance expects a tree from fromDom() or fromParse5()');
  }

  const findings = [];
  const seen = new Set();
  const report = (node, code, message) => {
    const key = `${code}\0${message}\0${node?.location?.line ?? ''}\0${describe(node)}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(Object.freeze({
      code,
      message,
      subject: Object.freeze({
        tag: isElement(node) ? node.tag : null,
        id: attr(node, 'id') ?? null,
        classes: Object.freeze([...classes(node)]),
        description: describe(node),
        line: node?.location?.line ?? null,
        column: node?.location?.column ?? null,
        node: node?.source ?? null,
      }),
    }));
  };

  // Everything resolves document-wide; only nodes inside the scope are judged.
  const everything = descendants(tree, tree.kind === 'element');
  const scope = tree.scope ?? tree;
  const all = scope === tree ? everything : descendants(scope, true);
  const inScope = scope === tree ? () => true : new Set(all).has.bind(new Set(all));

  // ── ids and references ──
  const ids = new Map();
  for (const node of everything) {
    if (!has(node, 'id')) continue;
    const id = attr(node, 'id').trim();
    if (!id) {
      if (inScope(node)) report(node, 'id-empty', 'id must not be empty');
    } else if (ids.has(id)) {
      if (inScope(node)) report(node, 'id-duplicate', `duplicate id "${id}"; first declared by ${describe(ids.get(id))}`);
    } else ids.set(id, node);
  }

  function idReferences(node, name, { required = false } = {}) {
    if (!has(node, name)) {
      if (required) report(node, 'attribute-required', `${name} is required`);
      return [];
    }
    const references = attr(node, name).trim().split(/\s+/).filter(Boolean);
    if (references.length === 0) {
      report(node, 'idref-empty', `${name} must contain at least one ID reference`);
    }
    for (const reference of references) {
      if (!ids.has(reference)) report(node, 'idref-missing', `${name} references missing id "${reference}"`);
    }
    return references;
  }

  function referencedVisibleText(node, name, options = {}) {
    const references = idReferences(node, name, options);
    const text = references
      .map((reference) => visibleText(ids.get(reference)))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (options.required && references.length > 0 && !text) {
      report(node, 'idref-text', `${name} must resolve to visible text`);
    }
    return text;
  }

  function hasAccessibleName(node) {
    if ((attr(node, 'aria-label') ?? '').trim()) return true;
    if (referencedVisibleText(node, 'aria-labelledby')) return true;
    if (node.tag === 'meter') {
      const id = attr(node, 'id');
      return Boolean(
        id &&
          everything.some(
            (candidate) =>
              candidate.tag === 'label' && attr(candidate, 'for') === id && visibleText(candidate),
          ),
      );
    }
    return false;
  }

  function checkAccessibleName(node, rule, subject) {
    if (rule === 'contents' && !visibleText(node)) {
      report(node, 'accessible-name', `${subject} requires nonempty visible text contents`);
    } else if (rule === 'required' && !hasAccessibleName(node)) {
      report(node, 'accessible-name', `${subject} requires an accessible name`);
    }
  }

  function hasMeaningfulContent(node) {
    if (visibleText(node)) return true;
    return descendants(node).some((descendant) => {
      if (isStaticallyHidden(descendant)) return false;
      if ((attr(descendant, 'aria-label') ?? '').trim()) return true;
      if (referencedVisibleText(descendant, 'aria-labelledby')) return true;
      if (descendant.tag === 'img' && (attr(descendant, 'alt') ?? '').trim()) return true;
      return (
        ['input', 'output', 'progress', 'meter'].includes(descendant.tag) &&
        (attr(descendant, 'value') ?? '').trim().length > 0
      );
    });
  }

  function checkAttributeContract(node, contract, subject) {
    for (const [name, allowedValues] of Object.entries(contract.requiredAttributes ?? {})) {
      if (!has(node, name)) {
        report(node, 'attribute-required', `${subject} is missing required attribute ${name}`);
        continue;
      }
      const value = attr(node, name);
      if (allowedValues.includes('*')) {
        if (!value.trim()) report(node, 'attribute-value', `${subject} attribute ${name} must not be empty`);
      } else if (!allowedValues.includes(value)) {
        report(
          node,
          'attribute-value',
          `${subject} attribute ${name}="${value}" must be one of ${allowedValues.join(', ')}`,
        );
      }
    }
    for (const name of contract.forbiddenAttributes ?? []) {
      if (has(node, name)) report(node, 'attribute-forbidden', `${subject} must not declare ${name}`);
    }
    checkAccessibleName(node, contract.accessibleName, subject);
  }

  // An element may be a primitive root and a recipe root at once (the
  // compact-monitor root is also an oi-surface), so an axis is consumed when
  // any contract on that element consumes it.
  function consumedAxes(node) {
    const consumed = new Set();
    for (const className of classes(node)) {
      const primitive = primitiveByClass.get(className);
      if (primitive) for (const axis of primitiveContracts[primitive].axes) consumed.add(axis);
    }
    const recipe = rootRecipeName(node);
    if (recipe) for (const axis of recipeContracts[recipe].axes) consumed.add(axis);
    return consumed;
  }

  function checkAxes(node, kind, name, contract) {
    const consumed = consumedAxes(node);
    for (const [attributeName, value] of node.attrs) {
      if (!attributeName.startsWith(axisAttributePrefix) || attributeName === slotAttribute) continue;
      const axis = attributeName.slice(axisAttributePrefix.length);
      if (!Object.hasOwn(AXES, axis)) {
        report(node, 'axis-unknown', `${kind} "${name}" declares unknown contract attribute ${attributeName}`);
        continue;
      }
      if (!contract.axes.includes(axis) && !consumed.has(axis)) {
        report(node, 'axis-unconsumed', `${kind} "${name}" does not consume axis "${axis}"`);
        continue;
      }
      if (!AXES[axis].includes(value)) {
        report(node, 'axis-value', `${kind} "${name}" has invalid ${axis} value "${value}"`);
      }
    }
  }

  // ── public class and inline style discipline ──
  for (const node of all) {
    const oiClasses = [...classes(node)].filter((name) => name.startsWith(cssClassPrefix));
    const partClasses = [];
    const recipeRootTokens = [];
    const recipePartTokens = [];
    for (const name of oiClasses) {
      const token = recipeToken(name);
      if (token) {
        if (token.malformed) {
          report(node, 'class-undeclared', `malformed public recipe class .${name}`);
          continue;
        }
        if (!Object.hasOwn(recipeContracts, token.recipe)) {
          report(node, 'class-undeclared', `undeclared recipe class .${name}`);
          continue;
        }
        if (token.part === null) recipeRootTokens.push(token);
        else recipePartTokens.push({ ...token, name });
        continue;
      }
      if (name === ROOT_CLASS || primitiveByClass.has(name)) continue;
      if (primitivePartByClass.has(name)) {
        partClasses.push(name);
        continue;
      }
      report(node, 'class-undeclared', `undeclared public class .${name}`);
    }

    if (partClasses.length > 1) {
      report(node, 'part-multiple', `element must not implement multiple primitive parts: ${partClasses.join(', ')}`);
    }
    for (const name of partClasses) {
      const { primitive } = primitivePartByClass.get(name);
      if (!nearestAncestorWithClass(node, primitiveClass(primitive))) {
        report(node, 'part-orphan', `.${name} appears outside .${primitiveClass(primitive)}`);
      }
    }

    if (recipeRootTokens.length > 1) {
      report(
        node,
        'recipe-multiple',
        `element must not implement multiple recipe roots: ${recipeRootTokens.map(({ recipe }) => `.${recipeClass(recipe)}`).join(', ')}`,
      );
    }
    if (recipePartTokens.length > 1) {
      report(
        node,
        'part-multiple',
        `element must not implement multiple recipe parts: ${recipePartTokens.map(({ name }) => `.${name}`).join(', ')}`,
      );
    }
    for (const token of recipePartTokens) {
      const contract = recipeContracts[token.recipe];
      if (!Object.hasOwn(contract.parts, token.part)) {
        report(node, 'class-undeclared', `undeclared recipe part .${token.name}`);
        continue;
      }
      const owner = nearestRecipeRoot(node);
      if (!owner || rootRecipeName(owner) !== token.recipe) {
        report(node, 'part-orphan', `.${token.name} must be owned by .${recipeClass(token.recipe)}`);
      }
    }

    if (has(node, slotAttribute) && !nearestRecipeRoot(node)) {
      report(node, 'slot-orphan', `[${slotAttribute}] must be owned by a declared recipe root`);
    }

    const owned =
      oiClasses.length > 0 || has(node, slotAttribute) ||
      [...node.attrs.keys()].some((name) => name.startsWith(axisAttributePrefix));
    if (!owned) continue;
    for (const declaration of styleDeclarations(node)) {
      if (declaration.prop.startsWith(cssVariablePrefix) && !publicVariables.has(declaration.prop)) {
        report(node, 'style-variable', `inline style defines undocumented public variable ${declaration.prop}`);
      }
      if (declaration.prop.startsWith(palettePrefix) || declaration.value.includes(palettePrefix)) {
        report(node, 'style-palette', `inline styles on operational elements must not reference ${palettePrefix}* tokens`);
      }
      const primitiveOwner = primitiveHookOwner.get(declaration.prop);
      if (
        primitiveOwner &&
        !hasClass(node, primitiveClass(primitiveOwner)) &&
        !nearestAncestorWithClass(node, primitiveClass(primitiveOwner))
      ) {
        report(node, 'hook-owner', `primitive hook ${declaration.prop} appears outside .${primitiveClass(primitiveOwner)}`);
      }
      const recipeOwner = recipeHookOwner.get(declaration.prop);
      if (recipeOwner && rootRecipeName(node) !== recipeOwner) {
        const owner = nearestRecipeRoot(node);
        if (!owner || rootRecipeName(owner) !== recipeOwner) {
          report(node, 'hook-owner', `recipe hook ${declaration.prop} appears outside .${recipeClass(recipeOwner)}`);
        }
      }
    }
  }

  // ── primitives ──
  function primitivePartInstances(root, primitive, part) {
    const rootClass = primitiveClass(primitive);
    const expected = primitivePartClass(primitive, part);
    return descendants(root).filter(
      (node) => hasClass(node, expected) && nearestAncestorWithClass(node, rootClass) === root,
    );
  }

  function checkPrimitiveParts(root, primitive, contract) {
    const instances = new Map(
      Object.keys(contract.parts).map((part) => [part, primitivePartInstances(root, primitive, part)]),
    );
    for (const [part, partContract] of Object.entries(contract.parts)) {
      const subject = `.${primitivePartClass(primitive, part)}`;
      for (const node of instances.get(part)) {
        const parent = node.parent;
        const validParent =
          partContract.parent === 'root'
            ? parent === root
            : isElement(parent) &&
              hasClass(parent, primitivePartClass(primitive, partContract.parent)) &&
              nearestAncestorWithClass(parent, primitiveClass(primitive)) === root;
        if (!validParent) {
          report(
            node,
            'part-parent',
            `${subject} must be a direct child of ${
              partContract.parent === 'root'
                ? `.${primitiveClass(primitive)}`
                : `.${primitivePartClass(primitive, partContract.parent)}`
            }`,
          );
        }
        if (!allowedElement(node, partContract.elements)) {
          report(node, 'part-element', `${subject} must use ${partContract.elements.join(' or ')}, found ${node.tag}`);
        }
        checkAttributeContract(node, partContract, subject);
      }
      const parents = partContract.parent === 'root' ? [root] : instances.get(partContract.parent) ?? [];
      for (const parent of parents) {
        const count = elementChildren(parent).filter((child) =>
          hasClass(child, primitivePartClass(primitive, part)),
        ).length;
        if (!cardinalitySatisfied(partContract.cardinality, count)) {
          report(
            parent,
            'part-cardinality',
            `${subject} requires ${expectedCardinality(partContract.cardinality)} direct child per ${
              partContract.parent === 'root' ? 'primitive root' : `.${primitivePartClass(primitive, partContract.parent)}`
            }; found ${count}`,
          );
        }
      }
    }
    return instances;
  }

  function checkPrimitivePartOrder(root, primitive, contract, instances) {
    if (contract.partOrderPolicy === 'none') return;
    const parentNames = new Set(['root', ...Object.values(contract.parts).map(({ parent }) => parent)]);
    for (const parentName of parentNames) {
      const parents = parentName === 'root' ? [root] : instances.get(parentName) ?? [];
      const ordered = contract.partOrder.filter((part) => contract.parts[part]?.parent === parentName);
      if (ordered.length === 0) continue;
      const childPartName = (node) => {
        const matches = ordered.filter((part) => hasClass(node, primitivePartClass(primitive, part)));
        return matches.length === 1 ? matches[0] : null;
      };
      for (const parent of parents) {
        const children = elementChildren(parent);
        const observed = children.map(childPartName);
        for (let index = 0; index < children.length; index += 1) {
          if (!observed[index]) {
            report(
              children[index],
              'part-undeclared-child',
              `${describe(parent)} may contain only declared direct parts: ${ordered
                .map((part) => `.${primitivePartClass(primitive, part)}`)
                .join(', ')}`,
            );
          }
        }
        const sequence = observed.filter(Boolean);
        if (contract.partOrderPolicy === 'either') {
          const forward = ordered.join('\0');
          const reverse = [...ordered].reverse().join('\0');
          const actual = sequence.join('\0');
          if (actual !== forward && actual !== reverse) {
            report(
              parent,
              'part-order',
              `.${primitiveClass(primitive)} parts must appear as ${ordered.join(' -> ')} or ${[...ordered].reverse().join(' -> ')}`,
            );
          }
          continue;
        }
        let prior = -1;
        for (const part of sequence) {
          const index = ordered.indexOf(part);
          if (index < prior) {
            report(parent, 'part-order', `.${primitiveClass(primitive)} part order must follow ${ordered.join(' -> ')}`);
            break;
          }
          prior = index;
        }
      }
    }
  }

  function needsMetricProvenance(root) {
    const source = attr(root, `${axisAttributePrefix}source`);
    const certainty = attr(root, `${axisAttributePrefix}certainty`);
    const freshness = attr(root, `${axisAttributePrefix}freshness`);
    const completeness = attr(root, `${axisAttributePrefix}completeness`);
    return (
      (source !== undefined && source !== 'direct') ||
      (certainty !== undefined && certainty !== 'confirmed') ||
      (freshness !== undefined && !['live', 'recent'].includes(freshness)) ||
      (completeness !== undefined && completeness !== 'complete')
    );
  }

  function checkMetric(root, instances) {
    const provenance = instances.get('provenance');
    if (needsMetricProvenance(root)) {
      if (provenance.length !== 1) {
        report(root, 'metric-provenance', 'non-default metric truth requires exactly one provenance part');
      } else {
        const provenanceId = attr(provenance[0], 'id');
        const describedBy = (attr(root, 'aria-describedby') ?? '').trim().split(/\s+/).filter(Boolean);
        if (!provenanceId || !describedBy.includes(provenanceId)) {
          report(root, 'metric-provenance', 'non-default metric truth must reference its provenance part with aria-describedby');
        }
        if (!visibleText(provenance[0])) {
          report(provenance[0], 'metric-provenance', 'metric provenance must contain visible text');
        }
      }
    }
    if (['missing', 'unavailable'].includes(attr(root, `${axisAttributePrefix}completeness`))) {
      const text = visibleText(instances.get('value')[0] ?? null);
      if (!text || /\p{N}/u.test(text)) {
        report(root, 'metric-textual-value', 'missing or unavailable metric data must render a visible nonnumeric textual value');
      }
    }
    const trend = instances.get('trend')[0];
    if (trend && !hasReadableSignalText(trend)) {
      report(trend, 'metric-trend-text', 'metric trend requires a textual non-color channel');
    }
  }

  function checkMeter(root, instances) {
    const label = instances.get('label')[0];
    const control = instances.get('control')[0];
    const valuePart = instances.get('value')[0];
    if (!label || !control || !valuePart) return;
    const controlId = attr(control, 'id');
    if (attr(label, 'for') !== controlId) {
      report(label, 'meter-label-for', 'meter label for must exactly match the native meter id');
    }
    const minimum = Number(attr(control, 'min'));
    const maximum = Number(attr(control, 'max'));
    const value = Number(attr(control, 'value'));
    const finite = [minimum, maximum, value].every(Number.isFinite);
    if (!finite) {
      report(control, 'meter-range', 'meter min, max, and value must be finite numbers');
    } else {
      if (!(minimum < maximum)) report(control, 'meter-range', 'meter min must be less than max');
      if (value < minimum || value > maximum) {
        report(control, 'meter-range', 'meter value must be within its declared min/max range');
      }
    }
    if (!hasReadableSignalText(valuePart)) {
      report(valuePart, 'meter-value-text', 'meter requires a visible non-color value channel');
    }
    if (!hasReadableSignalText(control)) {
      report(control, 'meter-value-text', 'native meter requires meaningful fallback text');
    }
    const visual = styleDeclarations(root).filter((declaration) => declaration.prop === '--oi-meter-value');
    if (visual.length !== 1) {
      report(root, 'meter-visual-value', 'meter root must define --oi-meter-value exactly once');
      return;
    }
    const match = /^([+\-]?(?:\d+(?:\.\d*)?|\.\d+))%$/.exec(visual[0].value.trim());
    if (!match) {
      report(root, 'meter-visual-value', '--oi-meter-value must be an explicit percentage');
    } else if (finite && minimum < maximum) {
      const visualPercentage = Number(match[1]);
      const semanticPercentage = ((value - minimum) / (maximum - minimum)) * 100;
      if (Math.abs(visualPercentage - semanticPercentage) > 0.001) {
        report(
          root,
          'meter-visual-value',
          `--oi-meter-value ${visualPercentage}% does not match native meter value ${semanticPercentage}%`,
        );
      }
    }
  }

  const INTERACTIVE_TAGS = new Set(['button', 'details', 'embed', 'iframe', 'input', 'object', 'select', 'summary', 'textarea']);
  const INTERACTIVE_ROLES = new Set(['button', 'checkbox', 'combobox', 'link', 'menuitem', 'option', 'radio', 'slider', 'spinbutton', 'switch', 'tab', 'textbox']);
  function isInteractive(node) {
    if (INTERACTIVE_TAGS.has(node.tag)) return true;
    if (node.tag === 'a' && has(node, 'href')) return true;
    if (['audio', 'video'].includes(node.tag) && has(node, 'controls')) return true;
    if (has(node, 'tabindex')) return true;
    if (has(node, 'contenteditable') && attr(node, 'contenteditable') !== 'false') return true;
    return INTERACTIVE_ROLES.has(attr(node, 'role'));
  }

  function checkDisclosure(root, instances) {
    const summary = instances.get('summary')[0];
    if (!summary) return;
    if (elementChildren(root)[0] !== summary) {
      report(summary, 'disclosure-summary', 'native disclosure summary must be the first element child');
    }
    for (const descendant of descendants(summary)) {
      if (isInteractive(descendant)) {
        report(descendant, 'disclosure-summary', 'disclosure summary must not contain interactive descendants');
      }
    }
  }

  function checkHistory(root, instances) {
    let priorTime = null;
    for (const item of instances.get('item')) {
      const time = elementChildren(item).find((child) => hasClass(child, primitivePartClass('history-strip', 'time')));
      const value = elementChildren(item).find((child) => hasClass(child, primitivePartClass('history-strip', 'value')));
      if (time) {
        const parsed = Date.parse(attr(time, 'datetime'));
        if (!Number.isFinite(parsed)) {
          report(time, 'history-time', `history datetime "${attr(time, 'datetime')}" is invalid`);
        } else if (priorTime !== null && parsed <= priorTime) {
          report(time, 'history-order', 'history items must be strictly chronological, oldest to newest');
        } else {
          priorTime = parsed;
        }
      }
      if (!value || !hasReadableSignalText(value)) {
        report(item, 'history-value', 'history item requires a visible non-color intensity value');
      }
      const intensity = styleDeclarations(item).filter((declaration) => declaration.prop === '--oi-history-intensity');
      if (intensity.length !== 1) {
        report(item, 'history-intensity', 'history item must define --oi-history-intensity exactly once');
      } else {
        const number = Number(intensity[0].value.trim());
        if (!Number.isFinite(number) || number < 0 || number > 1) {
          report(item, 'history-intensity', '--oi-history-intensity must be a finite number from 0 through 1');
        }
      }
    }
  }

  function checkDivider(root) {
    const orientation = attr(root, 'aria-orientation');
    if (orientation !== undefined && !['horizontal', 'vertical'].includes(orientation)) {
      report(root, 'divider-orientation', 'divider aria-orientation must be horizontal or vertical');
    }
    if (has(root, 'autofocus') || (has(root, 'contenteditable') && attr(root, 'contenteditable') !== 'false')) {
      report(root, 'divider-focus', 'divider must remain nonfocusable');
    }
  }

  function checkPrimitive(root, primitive, contract) {
    const subject = `.${primitiveClass(primitive)}`;
    if (!allowedElement(root, contract.root.elements)) {
      report(root, 'root-element', `${subject} must use ${contract.root.elements.join(' or ')}, found ${root.tag}`);
    }
    checkAttributeContract(root, contract.root, subject);
    checkAxes(root, 'primitive', primitive, contract);
    if (!nearestAncestorWithClass(root, ROOT_CLASS)) {
      report(root, 'root-mapping', `${subject} must be contained by an .${ROOT_CLASS} mapping wrapper`);
    }
    const instances = checkPrimitiveParts(root, primitive, contract);
    checkPrimitivePartOrder(root, primitive, contract, instances);
    if (primitive === 'metric') checkMetric(root, instances);
    else if (primitive === 'meter') checkMeter(root, instances);
    else if (primitive === 'disclosure') checkDisclosure(root, instances);
    else if (primitive === 'history-strip') checkHistory(root, instances);
    else if (primitive === 'divider') checkDivider(root);
  }

  let primitiveCount = 0;
  for (const node of all) {
    for (const className of classes(node)) {
      const primitive = primitiveByClass.get(className);
      if (!primitive) continue;
      primitiveCount += 1;
      checkPrimitive(node, primitive, primitiveContracts[primitive]);
    }
  }

  // ── recipes ──
  function ownedDescendants(root) {
    return descendants(root).filter((node) => nearestRecipeRoot(node, true) === root);
  }

  function checkRecipeParts(root, recipe, contract) {
    const owned = ownedDescendants(root);
    const instances = new Map(
      Object.keys(contract.parts).map((part) => [
        part,
        owned.filter((node) => hasClass(node, recipePartClass(recipe, part))),
      ]),
    );
    for (const [part, partContract] of Object.entries(contract.parts)) {
      const subject = `.${recipePartClass(recipe, part)}`;
      for (const node of instances.get(part)) {
        const expectedParent = partContract.parent;
        const validParent =
          expectedParent === 'root'
            ? node.parent === root
            : isElement(node.parent) &&
              hasClass(node.parent, recipePartClass(recipe, expectedParent)) &&
              nearestRecipeRoot(node.parent, true) === root;
        if (!validParent) {
          report(
            node,
            'part-parent',
            `${subject} must be a direct child of ${
              expectedParent === 'root' ? `.${recipeClass(recipe)}` : `.${recipePartClass(recipe, expectedParent)}`
            }`,
          );
        }
        if (!allowedElement(node, partContract.elements)) {
          report(node, 'part-element', `${subject} must use ${partContract.elements.join(' or ')}, found ${node.tag}`);
        }
        checkAttributeContract(node, partContract, subject);
        if (has(node, 'tabindex')) report(node, 'tabindex', `${subject} wrapper must not declare tabindex`);
      }
      const parents = partContract.parent === 'root' ? [root] : instances.get(partContract.parent) ?? [];
      for (const parent of parents) {
        const count = elementChildren(parent).filter((child) => hasClass(child, recipePartClass(recipe, part))).length;
        if (!cardinalitySatisfied(partContract.cardinality, count)) {
          report(
            parent,
            'part-cardinality',
            `${subject} requires ${expectedCardinality(partContract.cardinality)} direct child per ${
              partContract.parent === 'root' ? 'recipe root' : `.${recipePartClass(recipe, partContract.parent)}`
            }; found ${count}`,
          );
        }
      }
    }

    if (contract.partOrderPolicy !== 'none') {
      const parentNames = new Set(['root', ...Object.values(contract.parts).map(({ parent }) => parent)]);
      for (const parentName of parentNames) {
        const parents = parentName === 'root' ? [root] : instances.get(parentName) ?? [];
        const expected = contract.partOrder.filter((part) => contract.parts[part]?.parent === parentName);
        if (expected.length < 2) continue;
        for (const parent of parents) {
          const observed = elementChildren(parent).flatMap((child) =>
            expected.filter((part) => hasClass(child, recipePartClass(recipe, part))),
          );
          const present = expected.filter((part) => observed.includes(part));
          const forward = present.join('\0');
          const reverse = [...present].reverse().join('\0');
          const actual = observed.join('\0');
          const valid = contract.partOrderPolicy === 'either' ? actual === forward || actual === reverse : actual === forward;
          if (!valid) {
            report(
              parent,
              'part-order',
              `.${recipeClass(recipe)} part order must follow ${expected.join(' -> ')}${
                contract.partOrderPolicy === 'either' ? ` or ${[...expected].reverse().join(' -> ')}` : ''
              }`,
            );
          }
        }
      }
    }
    return instances;
  }

  function checkRecipeSlots(root, recipe, contract, partInstances) {
    const owned = ownedDescendants(root);
    const slotNodes = owned.filter((node) => has(node, slotAttribute));
    const instances = new Map(
      contract.slotOrder.map((slot) => [slot, slotNodes.filter((node) => attr(node, slotAttribute) === slot)]),
    );

    for (const node of slotNodes) {
      const slot = attr(node, slotAttribute);
      if (!contract.slotOrder.includes(slot)) {
        report(node, 'slot-undeclared', `recipe "${recipe}" uses undeclared slot "${slot}"`);
        continue;
      }
      if (has(node, 'tabindex')) report(node, 'tabindex', `slot "${slot}" wrapper must not declare tabindex`);
      if (isStaticallyHidden(node)) report(node, 'slot-hidden', `slot "${slot}" must be omitted instead of hidden`);
      const expectedParent = contract.slotParents[slot];
      const validParent =
        expectedParent === 'root'
          ? node.parent === root
          : isElement(node.parent) &&
            hasClass(node.parent, recipePartClass(recipe, expectedParent)) &&
            nearestRecipeRoot(node.parent, true) === root;
      if (!validParent) {
        report(
          node,
          'slot-parent',
          `slot "${slot}" must be a direct child of ${
            expectedParent === 'root' ? `.${recipeClass(recipe)}` : `.${recipePartClass(recipe, expectedParent)}`
          }`,
        );
      }
    }

    for (const slot of contract.requiredSlots) {
      const nodes = instances.get(slot) ?? [];
      if (nodes.length !== 1) {
        report(root, 'slot-required', `required slot "${slot}" must appear exactly once; found ${nodes.length}`);
        continue;
      }
      if (isStaticallyHidden(nodes[0])) report(nodes[0], 'slot-hidden', `required slot "${slot}" must remain visible`);
      if (
        ancestors(nodes[0], root).some(
          (ancestor) => ancestor.tag === 'details' || hasClass(ancestor, primitiveClass('disclosure')),
        )
      ) {
        report(nodes[0], 'slot-nested-disclosure', `required slot "${slot}" must not be nested under details/disclosure`);
      }
    }

    for (const slot of contract.optionalSlots) {
      const nodes = instances.get(slot) ?? [];
      if (nodes.length > 1) {
        report(root, 'slot-optional-count', `optional slot "${slot}" may appear at most once; found ${nodes.length}`);
      }
      if (nodes.length === 1 && !hasMeaningfulContent(nodes[0])) {
        report(nodes[0], 'slot-empty', `optional slot "${slot}" must be nonempty or omitted`);
      }
    }

    const observedOrder = slotNodes
      .map((node) => attr(node, slotAttribute))
      .filter((slot) => contract.slotOrder.includes(slot));
    const expectedOrder = contract.slotOrder.filter((slot) => (instances.get(slot) ?? []).length > 0);
    if (
      observedOrder.length !== expectedOrder.length ||
      observedOrder.some((slot, index) => slot !== expectedOrder[index])
    ) {
      report(
        root,
        'slot-order',
        `flattened slot order must be ${expectedOrder.join(' -> ')}; found ${observedOrder.join(' -> ')}`,
      );
    }

    for (const [part, conditionalSlots] of Object.entries(contract.optionalSlotCollapse?.conditionalParts ?? {})) {
      const parts = partInstances.get(part) ?? [];
      const presentSlots = conditionalSlots.filter((slot) => (instances.get(slot) ?? []).length > 0);
      const expectedCount = presentSlots.length > 0 ? 1 : 0;
      if (parts.length !== expectedCount) {
        report(
          root,
          'conditional-part',
          `conditional part "${part}" must appear iff ${conditionalSlots.join(' or ')} is present; found ${parts.length}`,
        );
      }
      for (const partNode of parts) {
        for (const child of elementChildren(partNode)) {
          if (!conditionalSlots.includes(attr(child, slotAttribute))) {
            report(
              child,
              'conditional-part',
              `.${recipePartClass(recipe, part)} may directly contain only ${conditionalSlots
                .map((name) => `[${slotAttribute}="${name}"]`)
                .join(' or ')}`,
            );
          }
        }
        for (const slot of presentSlots) {
          if (!(instances.get(slot) ?? []).some((node) => node.parent === partNode)) {
            report(partNode, 'conditional-part', `conditional part "${part}" must contain present slot "${slot}"`);
          }
        }
      }
    }

    for (const [slot, semantics] of Object.entries(contract.slotSemantics ?? {})) {
      for (const node of instances.get(slot) ?? []) {
        const subject = `slot "${slot}"`;
        checkAttributeContract(
          node,
          { requiredAttributes: semantics.requiredAttributes, forbiddenAttributes: [], accessibleName: 'none' },
          subject,
        );
        if (semantics.visibleText === 'required' && !visibleText(node)) {
          report(node, 'slot-semantics', `${subject} requires nonempty visible text`);
        }
        if (semantics.rootReferenceAttribute) {
          const id = (attr(node, 'id') ?? '').trim();
          if (!id) {
            report(node, 'slot-semantics', `${subject} must have a nonempty id for root ${semantics.rootReferenceAttribute}`);
            continue;
          }
          const references = idReferences(root, semantics.rootReferenceAttribute, { required: true });
          if (!references.includes(id)) {
            report(root, 'slot-semantics', `${semantics.rootReferenceAttribute} must reference ${subject} id "${id}"`);
          }
        }
      }
    }
    return instances;
  }

  function checkBusyState(root, contract) {
    if (!contract.asyncBehavior) return;
    const activity = attr(root, `${axisAttributePrefix}activity`);
    const ariaBusy = attr(root, 'aria-busy');
    if (contract.asyncBehavior.ariaBusyActivities.includes(activity)) {
      if (ariaBusy !== 'true') {
        report(root, 'busy-state', `activity "${activity}" requires aria-busy="true" on the recipe root`);
      }
    } else if (ariaBusy !== undefined && ariaBusy !== 'false') {
      report(root, 'busy-state', `activity "${activity ?? 'unspecified'}" requires aria-busy to be absent or "false"`);
    }
  }

  function checkRecipe(root, recipe, contract) {
    const subject = `.${recipeClass(recipe)}`;
    if (!allowedElement(root, contract.root.elements)) {
      report(root, 'root-element', `${subject} must use ${contract.root.elements.join(' or ')}, found ${root.tag}`);
    }
    for (const requiredClass of contract.root.requiredClasses ?? []) {
      if (!hasClass(root, requiredClass)) {
        report(root, 'root-class', `${subject} is missing required class .${requiredClass}`);
      }
    }
    checkAttributeContract(root, contract.root, subject);
    checkAxes(root, 'recipe', recipe, contract);
    const density = attr(root, `${axisAttributePrefix}density`);
    if (!contract.supportedDensities.includes(density)) {
      report(
        root,
        'density-unsupported',
        `recipe "${recipe}" density "${density ?? ''}" must be one of ${contract.supportedDensities.join(', ')}`,
      );
    }
    if (has(root, 'tabindex')) report(root, 'tabindex', `${subject} wrapper must not declare tabindex`);
    if (!nearestAncestorWithClass(root, ROOT_CLASS)) {
      report(root, 'root-mapping', `${subject} must be inside an .${ROOT_CLASS} mapping wrapper`);
    }
    const partInstances = checkRecipeParts(root, recipe, contract);
    checkRecipeSlots(root, recipe, contract, partInstances);
    checkBusyState(root, contract);
  }

  let recipeCount = 0;
  for (const node of all) {
    const recipe = rootRecipeName(node);
    if (!recipe) continue;
    recipeCount += 1;
    checkRecipe(node, recipe, recipeContracts[recipe]);
  }

  return Object.freeze({
    findings: Object.freeze(findings),
    primitives: primitiveCount,
    recipes: recipeCount,
  });
}

/**
 * Render findings as stable one-line strings, sorted, for logs and test output.
 * @param {readonly OiFinding[]} findings
 * @param {string} [label] Prefix such as a file path.
 */
export function formatFindings(findings, label = '') {
  return findings
    .map(({ code, message, subject }) => {
      const position = subject.line ? `:${subject.line}:${subject.column ?? 1}` : '';
      return `${label}${position} [${code}] ${message} (${subject.description})`;
    })
    .sort();
}
