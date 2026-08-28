#!/usr/bin/env node
// Operational Interface Doctrine — semantic CSS policy validator.
//
// Source CSS is hand-authored. Mapping CSS is generated. Both are parsed as
// CSS ASTs so contract enforcement does not depend on formatting or regex-only
// source scans (doctrine §17.1).

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import valueParser from 'postcss-value-parser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SYSTEM_SOURCE = join(ROOT, 'src', 'system');
const LAYERS_SOURCE = join(SYSTEM_SOURCE, 'layers.css');
const CONTRACTS_SOURCE = join(SYSTEM_SOURCE, 'contracts');
const PRIMITIVES_SOURCE = join(SYSTEM_SOURCE, 'primitives');
const RECIPES_SOURCE = join(SYSTEM_SOURCE, 'recipes');
const MAPPINGS_OUTPUT = join(ROOT, 'dist', 'system', 'mappings');
const DARK_ROAST_MAPPING = join(MAPPINGS_OUTPUT, 'dark-roast.css');
const ALIEN_MAPPING = join(ROOT, 'spec', 'system', 'mappings', 'alien.css');
const SOURCE_DIRECTORIES = [CONTRACTS_SOURCE, PRIMITIVES_SOURCE, RECIPES_SOURCE];
const EXPECTED_LAYER_ORDER = [
  'oi.mapping',
  'oi.contracts',
  'oi.primitives',
  'oi.recipes',
  'oi.utilities',
  'product',
];

const manifest = JSON.parse(
  readFileSync(join(SYSTEM_SOURCE, 'contract.json'), 'utf8'),
);

const isMeta = (key) => key.startsWith('$') || key.startsWith('_');
const entries = (object) =>
  Object.entries(object).filter(([key]) => !isMeta(key));

const axisValues = new Map(
  entries(manifest.axes).map(([axis, values]) => [
    `${manifest.naming.axisAttributePrefix}${axis}`,
    new Set(values),
  ]),
);
const slotAttribute = manifest.naming.slotAttribute;
const recipeSlots = new Map(
  entries(manifest.recipes).map(([recipe, definition]) => [
    recipe,
    new Set(definition.slotOrder),
  ]),
);
const allSlots = new Set(
  [...recipeSlots.values()].flatMap((slots) => [...slots]),
);
const semanticRoleVariables = new Set(
  entries(manifest.semanticRoles).flatMap(([category, roles]) =>
    roles.map(
      (role) => `${manifest.naming.cssVariablePrefix}${category}-${role}`,
    ),
  ),
);
const publicHookVariables = new Set(
  [
    ...entries(manifest.primitives).flatMap(([, primitive]) => primitive.publicHooks ?? []),
    ...entries(manifest.recipes).flatMap(([, recipe]) => recipe.publicHooks ?? []),
  ],
);
const primitiveHookToOwner = new Map(
  entries(manifest.primitives).flatMap(([name, primitive]) =>
    (primitive.publicHooks ?? []).map((hook) => [hook, name]),
  ),
);
const usedPrimitiveHooks = new Set();
const recipeHookToOwner = new Map(
  entries(manifest.recipes).flatMap(([name, recipe]) =>
    (recipe.publicHooks ?? []).map((hook) => [hook, name]),
  ),
);
const usedRecipeHooks = new Set();
const publicVariables = new Set([
  ...semanticRoleVariables,
  ...publicHookVariables,
]);

const primitiveClassToName = new Map(
  entries(manifest.primitives).map(([name]) => [`oi-${name}`, name]),
);
const primitiveClasses = new Set(primitiveClassToName.keys());
const primitivePartClassToOwner = new Map(
  entries(manifest.primitives).flatMap(([name, primitive]) =>
    entries(primitive.parts ?? {}).map(([part]) => [`oi-${name}__${part}`, name]),
  ),
);
const primitivePartClasses = new Set(primitivePartClassToOwner.keys());
const recipeClassToName = new Map(
  entries(manifest.recipes).map(([name]) => [`oi-recipe-${name}`, name]),
);
const recipePartClassToOwner = new Map(
  entries(manifest.recipes).flatMap(([name, recipe]) =>
    entries(recipe.parts ?? {}).map(([part]) => [
      `oi-recipe-${name}__${part}`,
      name,
    ]),
  ),
);
const recipePartClasses = new Set(recipePartClassToOwner.keys());
const componentClasses = new Set([
  ...primitiveClasses,
  ...primitivePartClasses,
  ...recipeClassToName.keys(),
  ...recipePartClasses,
]);
const exactAllowedOiClasses = new Set(['oi-root', ...componentClasses]);
const styledPrimitiveClasses = new Set();
const styledRecipeClasses = new Set();
const declaredRecipeContainerNames = new Set();
const seenRecipeContainerThresholds = new Map(
  entries(manifest.recipes).map(([name]) => [name, new Set()]),
);

const INTERACTIVE_TYPES = new Set([
  'a',
  'button',
  'input',
  'select',
  'summary',
  'textarea',
]);
const INTERACTION_ATTRIBUTES = new Set([
  'aria-busy',
  'aria-current',
  'aria-disabled',
  'aria-selected',
  'disabled',
  'role',
  'tabindex',
]);
const INTERACTION_PSEUDOS = new Set([
  ':active',
  ':checked',
  ':disabled',
  ':enabled',
  ':focus',
  ':focus-visible',
  ':hover',
  ':indeterminate',
  ':invalid',
  ':not',
  ':read-only',
  ':read-write',
  ':required',
  ':user-invalid',
  ':valid',
  ':where',
]);
const ACTIVE_ANIMATION_STATES = new Set(['live', 'loading', 'refreshing']);
const ELECTRON_ONLY_PROPERTIES = new Set(['-webkit-app-region']);
const POSITIONAL_PSEUDOS = new Set([
  ':first-child',
  ':first-of-type',
  ':last-child',
  ':last-of-type',
  ':nth-child',
  ':nth-last-child',
  ':nth-last-of-type',
  ':nth-of-type',
  ':only-child',
  ':only-of-type',
]);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const forbiddenTermPatterns = manifest.forbiddenDomainTerms.terms.map((term) => [
  term,
  new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i'),
]);

const COLOR_FUNCTIONS = new Set([
  'color',
  'color-mix',
  'device-cmyk',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'light-dark',
  'oklab',
  'oklch',
  'rgb',
  'rgba',
]);

// CSS Color 4 named colors. `currentColor` is deliberately absent: it carries
// inherited semantic color rather than introducing pigment. System colors are
// handled separately because they are valid only in forced-colors overrides.
const NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black
  blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse
  chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan
  darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta
  darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink
  deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen
  fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey
  honeydew hotpink indianred indigo ivory khaki lavender lavenderblush
  lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow
  lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
  lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime
  limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid
  mediumpurple mediumseagreen mediumslateblue mediumspringgreen
  mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin
  navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff
  peru pink plum powderblue purple rebeccapurple red rosybrown royalblue
  saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
  slateblue slategray slategrey snow springgreen steelblue tan teal thistle
  tomato transparent turquoise violet wheat white whitesmoke yellow
  yellowgreen`
    .split(/\s+/)
    .filter(Boolean),
);

const SYSTEM_COLORS = new Set(
  `accentcolor accentcolortext activetext buttonborder buttonface buttontext
  canvas canvastext field fieldtext graytext highlight highlighttext linktext
  mark marktext selecteditem selecteditemtext visitedtext`
    .split(/\s+/)
    .filter(Boolean),
);

const failures = [];
const seenFailures = new Set();

function relativePath(file) {
  return relative(ROOT, file).split('\\').join('/');
}

function fail(file, node, message) {
  const source =
    node?.source?.start ??
    (node?.line ? { line: node.line, column: node.column ?? 1 } : null);
  const location = source ? `:${source.line}:${source.column}` : '';
  const rendered = `${relativePath(file)}${location} ${message}`;
  if (!seenFailures.has(rendered)) {
    seenFailures.add(rendered);
    failures.push(rendered);
  }
}

function failPath(file, message) {
  const rendered = `${relativePath(file)} ${message}`;
  if (!seenFailures.has(rendered)) {
    seenFailures.add(rendered);
    failures.push(rendered);
  }
}

function collectCssFiles(directory) {
  if (!existsSync(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectCssFiles(path));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.css') {
      files.push(path);
    }
  }
  return files.sort();
}

function isDarkRoastMapping(file) {
  return file === DARK_ROAST_MAPPING;
}

function isAlienMapping(file) {
  return file === ALIEN_MAPPING;
}

function isWithin(directory, file) {
  const path = relative(directory, file);
  return path === '' || (!path.startsWith('..') && !path.startsWith('/'));
}

function expectedLayer(file) {
  if (isWithin(CONTRACTS_SOURCE, file)) return 'oi.contracts';
  if (isWithin(PRIMITIVES_SOURCE, file)) return 'oi.primitives';
  if (isWithin(RECIPES_SOURCE, file)) return 'oi.recipes';
  if (isWithin(MAPPINGS_OUTPUT, file) || isAlienMapping(file)) return 'oi.mapping';
  return null;
}

function isInsideForcedColors(node) {
  for (let current = node?.parent; current; current = current.parent) {
    if (
      current.type === 'atrule' &&
      current.name.toLowerCase() === 'media' &&
      /\(\s*forced-colors\s*:\s*active\s*\)/i.test(current.params)
    ) {
      return true;
    }
  }
  return false;
}

function isInsideKeyframes(rule) {
  for (let current = rule.parent; current; current = current.parent) {
    if (
      current.type === 'atrule' &&
      /^(?:-[a-z]+-)?keyframes$/i.test(current.name)
    ) {
      return true;
    }
  }
  return false;
}

function isAllowedOiClass(className) {
  return exactAllowedOiClasses.has(className);
}

function recipeNamesInSelector(selector) {
  const names = new Set();
  selector.walkClasses((classNode) => {
    const recipeName = recipeClassToName.get(classNode.value)
      ?? recipePartClassToOwner.get(classNode.value);
    if (recipeName) names.add(recipeName);
  });
  return names;
}

function recipeOwnerForFile(file) {
  return isWithin(RECIPES_SOURCE, file) ? basename(file, '.css') : null;
}

function selectorUsesDirectSlot(selector, attribute) {
  const index = selector.nodes.indexOf(attribute);
  if (index < 0) return false;
  const preceding = selector.nodes.slice(0, index);
  const combinators = preceding.filter((node) => node.type === 'combinator');
  const last = combinators.at(-1);
  return combinators.length === 1 && last?.value.trim() === '>';
}

function selectorDirectSlotParentClasses(selector, attribute) {
  const index = selector.nodes.indexOf(attribute);
  if (index < 0) return new Set();
  const combinatorIndex = selector.nodes
    .slice(0, index)
    .reduce(
      (last, node, nodeIndex) => (node.type === 'combinator' ? nodeIndex : last),
      -1,
    );
  return new Set(
    selector.nodes
      .slice(0, combinatorIndex)
      .filter((node) => node.type === 'class')
      .map((node) => node.value),
  );
}

function selectorHasOiScope(selector) {
  let scoped = false;
  selector.walkClasses((classNode) => {
    if (isAllowedOiClass(classNode.value)) scoped = true;
  });
  selector.walkAttributes((attribute) => {
    if (attribute.attribute?.startsWith(manifest.naming.axisAttributePrefix)) {
      scoped = true;
    }
  });
  return scoped;
}

function selectorTargetsPrimitiveRoot(selector) {
  const lastCombinator = selector.nodes.reduce(
    (last, node, index) => (node.type === 'combinator' ? index : last),
    -1,
  );
  const subject = selector.nodes.slice(lastCombinator + 1);
  const hasPseudoElement = subject.some(
    (node) =>
      node.type === 'pseudo' &&
      (node.value.startsWith('::') ||
        node.value === ':before' ||
        node.value === ':after'),
  );
  if (hasPseudoElement) return false;

  let targetsPrimitive = false;
  const inspect = (node) => {
    if (node.type === 'class' && primitiveClasses.has(node.value)) {
      targetsPrimitive = true;
      return;
    }
    if (
      node.type === 'pseudo' &&
      [':is', ':where'].includes(node.value) &&
      Array.isArray(node.nodes)
    ) {
      for (const child of node.nodes) child.each(inspect);
    }
  };
  for (const node of subject) inspect(node);
  return targetsPrimitive;
}

function selectorTargetsRecipeRoot(selector) {
  const lastCombinator = selector.nodes.reduce(
    (last, node, index) => (node.type === 'combinator' ? index : last),
    -1,
  );
  const subject = selector.nodes.slice(lastCombinator + 1);
  const hasPseudoElement = subject.some(
    (node) =>
      node.type === 'pseudo' &&
      (node.value.startsWith('::') ||
        node.value === ':before' ||
        node.value === ':after'),
  );
  if (hasPseudoElement) return false;

  let targetsRecipe = false;
  const inspect = (node) => {
    if (node.type === 'class' && recipeClassToName.has(node.value)) {
      targetsRecipe = true;
      return;
    }
    if (
      node.type === 'pseudo' &&
      [':is', ':where'].includes(node.value) &&
      Array.isArray(node.nodes)
    ) {
      for (const child of node.nodes) child.each(inspect);
    }
  };
  for (const node of subject) inspect(node);
  return targetsRecipe;
}

function isScopedInteractionFoundation(selector) {
  const combinators = selector.nodes.filter((node) => node.type === 'combinator');
  if (combinators.length !== 1 || combinators[0].value.trim() !== '') {
    return false;
  }

  const combinatorIndex = selector.nodes.indexOf(combinators[0]);
  const before = selector.nodes.slice(0, combinatorIndex);
  const after = selector.nodes.slice(combinatorIndex + 1);
  if (
    before.length !== 1 ||
    before[0].type !== 'class' ||
    before[0].value !== 'oi-root' ||
    after.length === 0 ||
    after[0].type !== 'pseudo' ||
    after[0].value !== ':where'
  ) {
    return false;
  }

  let valid = true;
  let hasInteractiveTarget = false;
  after[0].walk((node) => {
    if (node.type === 'selector' || node.type === 'root') return;
    if (node.type === 'tag') {
      hasInteractiveTarget = true;
      if (!INTERACTIVE_TYPES.has(node.value.toLowerCase())) valid = false;
    } else if (node.type === 'attribute') {
      hasInteractiveTarget = true;
      if (!INTERACTION_ATTRIBUTES.has(node.attribute)) valid = false;
    } else if (node.type === 'pseudo') {
      if (!INTERACTION_PSEUDOS.has(node.value)) valid = false;
    } else if (node.type === 'class' || node.type === 'id' || node.type === 'universal' || node.type === 'combinator') {
      valid = false;
    }
  });

  for (const node of after.slice(1)) {
    if (node.type !== 'pseudo' || !INTERACTION_PSEUDOS.has(node.value)) {
      valid = false;
    }
  }
  return valid && hasInteractiveTarget;
}

function validateAttribute(file, rule, selector, attribute) {
  const name = attribute.attribute;
  if (!name) return;

  if (
    name === 'class' &&
    attribute.value !== undefined &&
    attribute.value.includes(manifest.naming.cssClassPrefix)
  ) {
    fail(file, rule, 'oi-* public classes must use class selectors, not class attribute selectors');
    return;
  }

  if (name === 'data-state') {
    fail(file, rule, 'generic data-state is prohibited');
    return;
  }
  if (!name.startsWith(manifest.naming.axisAttributePrefix)) return;

  if (name === 'data-oi-mapping' && isAlienMapping(file)) {
    if (
      attribute.operator &&
      attribute.value !== undefined &&
      attribute.value !== 'alien'
    ) {
      fail(file, rule, `unknown proof mapping "${attribute.value}"`);
    }
    return;
  }

  if (name === slotAttribute) {
    const selectorRecipes = recipeNamesInSelector(selector);
    if (selectorRecipes.size !== 1) {
      fail(file, rule, 'recipe slot selectors must name exactly one owning recipe root or part');
      return;
    }
    const [selectorRecipe] = selectorRecipes;
    const fileOwner = recipeOwnerForFile(file);
    if (fileOwner !== selectorRecipe) {
      fail(
        file,
        rule,
        `recipe slot selector belongs in ${selectorRecipe}.css`,
      );
    }
    if (!selectorUsesDirectSlot(selector, attribute)) {
      fail(file, rule, 'recipe slot selectors must use one direct-child combinator');
    }
    if (!attribute.operator || attribute.value === undefined) return;
    const value = attribute.value;
    const allowed = selectorRecipes.size
      ? new Set(
          [...selectorRecipes].flatMap((recipe) => [
            ...(recipeSlots.get(recipe) ?? []),
          ]),
        )
      : allSlots;
    if (!allowed.has(value)) {
      fail(file, rule, `unknown recipe slot "${value}"`);
      return;
    }
    const parent = manifest.recipes[selectorRecipe]?.slotParents?.[value];
    const expectedParentClass = parent === 'root'
      ? `oi-recipe-${selectorRecipe}`
      : `oi-recipe-${selectorRecipe}__${parent}`;
    if (!selectorDirectSlotParentClasses(selector, attribute).has(expectedParentClass)) {
      fail(
        file,
        rule,
        `slot "${value}" must be selected as a direct child of .${expectedParentClass}`,
      );
    }
    return;
  }

  const allowed = axisValues.get(name);
  if (!allowed) {
    fail(file, rule, `unknown contract attribute "${name}"`);
    return;
  }
  if (
    attribute.operator &&
    attribute.value !== undefined &&
    !allowed.has(attribute.value)
  ) {
    fail(
      file,
      rule,
      `unknown ${name} value "${attribute.value}"`,
    );
  }
}

function validateStateAttributeCardinality(file, rule, selector, inheritedCount = 0) {
  const directCount = selector.nodes.filter(
    (node) => node.type === 'attribute' && axisValues.has(node.attribute),
  ).length;
  const branchCount = inheritedCount + directCount;
  if (branchCount > 1) {
    fail(file, rule, 'public selectors may address at most one state attribute');
  }

  for (const node of selector.nodes) {
    if (node.type !== 'pseudo' || !Array.isArray(node.nodes)) continue;
    for (const branch of node.nodes) {
      if (branch.type === 'selector') {
        validateStateAttributeCardinality(file, rule, branch, branchCount);
      }
    }
  }
}

function hasExactMappingRoot(file, selectorRoot) {
  if (selectorRoot.nodes.length !== 1) return false;
  const nodes = selectorRoot.nodes[0]?.nodes ?? [];
  if (
    nodes[0]?.type !== 'class' ||
    nodes[0].value !== 'oi-root'
  ) {
    return false;
  }
  if (isDarkRoastMapping(file)) return nodes.length === 1;
  return (
    isAlienMapping(file) &&
    nodes.length === 2 &&
    nodes[1].type === 'attribute' &&
    nodes[1].attribute === 'data-oi-mapping' &&
    nodes[1].operator === '=' &&
    nodes[1].value === 'alien'
  );
}

function validateSelectors(file, rule, primitiveMarginRules, recipeMarginRules) {
  if (isInsideKeyframes(rule)) return;

  let selectorRoot;
  try {
    selectorRoot = selectorParser().astSync(rule.selector);
  } catch (error) {
    fail(file, rule, `selector parse error: ${error.message}`);
    return;
  }

  if ((isDarkRoastMapping(file) || isAlienMapping(file)) && !hasExactMappingRoot(file, selectorRoot)) {
    const expected = isAlienMapping(file)
      ? '.oi-root[data-oi-mapping="alien"]'
      : '.oi-root';
    fail(file, rule, `semantic mapping selector must be exactly "${expected}"`);
  }

  let targetsPrimitiveRoot = false;
  let targetsRecipeRoot = false;
  for (const selector of selectorRoot.nodes) {
    validateStateAttributeCardinality(file, rule, selector);
    let combinatorCount = 0;
    let hasNonDirectCombinator = false;
    selector.walkCombinators((combinator) => {
      combinatorCount += 1;
      if (combinator.value.trim() !== '>') hasNonDirectCombinator = true;
    });

    if (combinatorCount > 1) {
      fail(file, rule, 'selector combinator depth exceeds one');
    }
    if (hasNonDirectCombinator && !isScopedInteractionFoundation(selector)) {
      fail(file, rule, 'non-direct selector coupling is prohibited');
    }

    selector.walkIds(() => {
      fail(file, rule, 'ID selectors are prohibited');
    });
    selector.walkPseudos((pseudo) => {
      if (POSITIONAL_PSEUDOS.has(pseudo.value)) {
        fail(file, rule, `brittle positional selector "${pseudo.value}"`);
      }
    });
    const ownsDeclarations = rule.nodes?.some((node) => node.type === 'decl');
    selector.walkClasses((classNode) => {
      if (
        classNode.value.startsWith(manifest.naming.cssClassPrefix) &&
        !isAllowedOiClass(classNode.value)
      ) {
        fail(
          file,
          rule,
          `undocumented public class ".${classNode.value}"`,
        );
      }
      if (
        ownsDeclarations &&
        (primitiveClasses.has(classNode.value) || primitivePartClasses.has(classNode.value))
      ) {
        if (!isWithin(PRIMITIVES_SOURCE, file)) {
          fail(file, rule, `primitive selector ".${classNode.value}" is outside src/system/primitives`);
        } else {
          const fileOwner = basename(file, '.css');
          const selectorOwner = primitiveClassToName.get(classNode.value)
            ?? primitivePartClassToOwner.get(classNode.value);
          if (selectorOwner !== fileOwner) {
            fail(
              file,
              rule,
              `primitive selector ".${classNode.value}" belongs in ${selectorOwner}.css`,
            );
          } else {
            styledPrimitiveClasses.add(classNode.value);
          }
        }
      }
      if (
        ownsDeclarations &&
        (recipeClassToName.has(classNode.value) || recipePartClasses.has(classNode.value))
      ) {
        if (!isWithin(RECIPES_SOURCE, file)) {
          fail(file, rule, `recipe selector ".${classNode.value}" is outside src/system/recipes`);
        } else {
          const fileOwner = basename(file, '.css');
          const selectorOwner = recipeClassToName.get(classNode.value)
            ?? recipePartClassToOwner.get(classNode.value);
          if (selectorOwner !== fileOwner) {
            fail(
              file,
              rule,
              `recipe selector ".${classNode.value}" belongs in ${selectorOwner}.css`,
            );
          } else {
            styledRecipeClasses.add(classNode.value);
          }
        }
      }
    });
    selector.walkAttributes((attribute) =>
      validateAttribute(file, rule, selector, attribute),
    );

    let hasTypeOrUniversal = false;
    selector.walkTags(() => {
      hasTypeOrUniversal = true;
    });
    selector.walkUniversals(() => {
      hasTypeOrUniversal = true;
    });
    if (hasTypeOrUniversal && !selectorHasOiScope(selector)) {
      fail(file, rule, 'unscoped type or universal selector');
    }

    if (selectorTargetsPrimitiveRoot(selector)) {
      targetsPrimitiveRoot = true;
    }
    if (selectorTargetsRecipeRoot(selector)) {
      targetsRecipeRoot = true;
    }
  }

  if (targetsPrimitiveRoot) primitiveMarginRules.add(rule);
  if (targetsRecipeRoot) recipeMarginRules.add(rule);
}

function parseValue(file, node, value, options = {}) {
  const {
    allowRawColors = false,
    allowDarkMappingBlend = false,
    forcedColors = false,
  } = options;
  const references = new Set();
  let parsed;

  try {
    parsed = valueParser(value);
  } catch (error) {
    fail(file, node, `value parse error: ${error.message}`);
    return references;
  }

  const inspectNodes = (nodes, insideAllowedBlend = false) => {
    for (const valueNode of nodes) {
      if (valueNode.unclosed) {
        fail(file, node, 'value parse error: unclosed token');
      }

      if (valueNode.type === 'word') {
        const token = valueNode.value;
        const lower = token.toLowerCase();
        if (token.startsWith('--oi-') || token.startsWith('--_oi-')) {
          references.add(token);
        }

        if (!allowRawColors) {
          if (/^#[0-9a-f]{3,4}(?:[0-9a-f]{3,4})?$/i.test(token)) {
            fail(file, node, `raw color literal "${token}"`);
          } else if (
            NAMED_COLORS.has(lower) &&
            !(allowDarkMappingBlend && insideAllowedBlend && lower === 'transparent')
          ) {
            fail(file, node, `raw color literal "${token}"`);
          } else if (SYSTEM_COLORS.has(lower) && !forcedColors) {
            fail(file, node, `system color "${token}" outside forced-colors`);
          }
        }
      } else if (valueNode.type === 'function') {
        const functionName = valueNode.value.toLowerCase();
        const allowedBlend = allowDarkMappingBlend && functionName === 'color-mix';
        if (
          !allowRawColors &&
          COLOR_FUNCTIONS.has(functionName) &&
          !allowedBlend
        ) {
          fail(file, node, `raw color function "${valueNode.value}()"`);
        }
        inspectNodes(valueNode.nodes ?? [], insideAllowedBlend || allowedBlend);
      }
    }
  };

  inspectNodes(parsed.nodes);

  return references;
}

function isPhysicalSpatialProperty(property) {
  const normalized = property.toLowerCase();
  return (
    /^(?:min-|max-)?(?:width|height)$/.test(normalized) ||
    /^(?:top|right|bottom|left)$/.test(normalized) ||
    /^(?:margin|padding|scroll-margin|scroll-padding)-(?:top|right|bottom|left)(?:-|$)/.test(
      normalized,
    ) ||
    /^border-(?:top|right|bottom|left)(?:-|$)/.test(normalized)
  );
}

function validateLayer(file, root) {
  const layer = expectedLayer(file);
  if (!layer) return;

  let foundLayer = false;
  for (const node of root.nodes) {
    if (node.type === 'comment') continue;
    if (
      node.type !== 'atrule' ||
      node.name.toLowerCase() !== 'layer' ||
      node.params.trim() !== layer ||
      !Array.isArray(node.nodes)
    ) {
      fail(file, node, `CSS must be contained by @layer ${layer}`);
    } else {
      foundLayer = true;
    }
  }
  if (!foundLayer) failPath(file, `missing @layer ${layer}`);
}

function validateRecipeConditionals(file, root) {
  const owner = recipeOwnerForFile(file);
  if (!owner) return;
  const definition = manifest.recipes[owner];
  if (!definition) return;

  root.walkAtRules('media', (atRule) => {
    if (
      /(?:^|[\s(])(?:min-|max-)?(?:width|height|inline-size|block-size)\s*:|\borientation\s*:|\baspect-ratio\s*:/i.test(
        atRule.params,
      )
    ) {
      fail(file, atRule, 'viewport geometry media queries are prohibited in recipe CSS; use the named container');
    }
  });

  const expectedName = `oi-${owner}`;
  const allowedThresholds = new Set([
    definition.widths.preferred,
    definition.widths.wide,
  ]);
  root.walkAtRules('container', (atRule) => {
    const match = /^([a-z][a-z0-9-]*)\s+\(\s*min-width\s*:\s*([^\s)]+)\s*\)$/.exec(
      atRule.params.trim(),
    );
    if (!match) {
      fail(
        file,
        atRule,
        `container query must be exactly "${expectedName} (min-width: <preferred-or-wide>)"`,
      );
      return;
    }
    const [, containerName, threshold] = match;
    if (containerName !== expectedName) {
      fail(file, atRule, `container query must use the declared name "${expectedName}"`);
    }
    if (!allowedThresholds.has(threshold)) {
      fail(
        file,
        atRule,
        `container threshold "${threshold}" must equal preferred ${definition.widths.preferred} or wide ${definition.widths.wide}`,
      );
      return;
    }
    const seen = seenRecipeContainerThresholds.get(owner);
    if (seen.has(threshold)) {
      fail(file, atRule, `duplicate named container threshold "${threshold}"`);
    }
    seen.add(threshold);
  });

  root.walkDecls('container-name', (declaration) => {
    if (declaration.value.trim() !== expectedName) {
      fail(file, declaration, `recipe container-name must be exactly "${expectedName}"`);
      return;
    }
    declaredRecipeContainerNames.add(owner);
  });
  root.walkDecls('container', (declaration) => {
    fail(file, declaration, 'recipe containers must declare container-name and container-type separately');
  });
}

function validateLayerOrder(file) {
  let root;
  try {
    root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
  } catch (error) {
    fail(file, error, `CSS parse error: ${error.reason ?? error.message}`);
    return;
  }

  const nodes = root.nodes.filter((node) => node.type !== 'comment');
  if (nodes.length !== 1) {
    failPath(
      file,
      'must contain exactly one layer-order statement and no global rules',
    );
    return;
  }

  const statement = nodes[0];
  const actualOrder =
    statement.type === 'atrule' && statement.name.toLowerCase() === 'layer'
      ? statement.params.split(',').map((name) => name.trim())
      : [];
  const correctOrder =
    actualOrder.length === EXPECTED_LAYER_ORDER.length &&
    actualOrder.every((name, index) => name === EXPECTED_LAYER_ORDER[index]);

  if (
    statement.type !== 'atrule' ||
    statement.name.toLowerCase() !== 'layer' ||
    Array.isArray(statement.nodes) ||
    !correctOrder
  ) {
    fail(
      file,
      statement,
      `layer order must be exactly "${EXPECTED_LAYER_ORDER.join(', ')}"`,
    );
  }
}

function validateForbiddenTerms(file, root) {
  const inspect = (node, text) => {
    for (const [term, pattern] of forbiddenTermPatterns) {
      if (pattern.test(text)) {
        fail(file, node, `forbidden domain term "${term}"`);
      }
    }
  };

  root.walk((node) => {
    if (node.type === 'rule') inspect(node, node.selector);
    else if (node.type === 'decl') inspect(node, `${node.prop} ${node.value}`);
    else if (node.type === 'atrule') inspect(node, `${node.name} ${node.params}`);
    else if (node.type === 'comment') inspect(node, node.text);
  });
}

function ruleOwnsActiveAnimation(rule) {
  try {
    const selectors = selectorParser().astSync(rule.selector).nodes;
    return selectors.every((selector) => {
      let owns = false;
      selector.walkAttributes((attribute) => {
        if (
          attribute.attribute === 'data-oi-activity' &&
          attribute.operator === '=' &&
          ACTIVE_ANIMATION_STATES.has(attribute.value)
        ) {
          owns = true;
        }
      });
      return owns;
    });
  } catch {
    return false;
  }
}

function valueContainsInfinite(value) {
  let found = false;
  valueParser(value).walk((node) => {
    if (node.type === 'word' && node.value.toLowerCase() === 'infinite') {
      found = true;
    }
  });
  return found;
}

function recordPrimitiveHookUse(file, node, hook) {
  const owner = primitiveHookToOwner.get(hook);
  if (!owner) return;
  if (!isWithin(PRIMITIVES_SOURCE, file) || basename(file, '.css') !== owner) {
    fail(file, node, `primitive hook "${hook}" belongs in ${owner}.css`);
    return;
  }
  usedPrimitiveHooks.add(hook);
}

function recordRecipeHookUse(file, node, hook) {
  const owner = recipeHookToOwner.get(hook);
  if (!owner) return;
  if (!isWithin(RECIPES_SOURCE, file) || basename(file, '.css') !== owner) {
    fail(file, node, `recipe hook "${hook}" belongs in ${owner}.css`);
    return;
  }
  usedRecipeHooks.add(hook);
}

function collectPrivateVariables(files) {
  const variables = new Set();
  for (const file of files) {
    let root;
    try {
      root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
    } catch {
      continue;
    }
    root.walkDecls((declaration) => {
      if (declaration.prop.startsWith('--_oi-')) variables.add(declaration.prop);
    });
    root.walkAtRules('property', (atRule) => {
      const property = atRule.params.trim();
      if (property.startsWith('--_oi-')) variables.add(property);
    });
  }
  return variables;
}

function validateFile(file, mappingFiles, privateVariables) {
  const css = readFileSync(file, 'utf8');
  let root;
  try {
    root = postcss.parse(css, { from: file });
  } catch (error) {
    fail(file, error, `CSS parse error: ${error.reason ?? error.message}`);
    return;
  }

  validateLayer(file, root);
  validateForbiddenTerms(file, root);
  validateRecipeConditionals(file, root);

  root.walkRules((rule) => {
    if (rule.parent?.type === 'rule') {
      fail(file, rule, 'nested style rules are prohibited in kernel CSS');
    }
  });
  root.walkAtRules((atRule) => {
    if (atRule.parent?.type === 'rule') {
      fail(file, atRule, 'nested conditional rules are prohibited in kernel CSS');
    }
  });

  root.walkDecls((declaration) => {
    if (
      !declaration.prop.startsWith('--_oi-') &&
      declaration.prop.startsWith('--oi-') &&
      !publicVariables.has(declaration.prop)
    ) {
      fail(
        file,
        declaration,
        `undocumented public variable definition "${declaration.prop}"`,
      );
    }
    recordPrimitiveHookUse(file, declaration, declaration.prop);
    recordRecipeHookUse(file, declaration, declaration.prop);
  });
  root.walkAtRules('property', (atRule) => {
    const property = atRule.params.trim();
    if (
      !property.startsWith('--_oi-') &&
      property.startsWith('--oi-') &&
      !publicVariables.has(property)
    ) {
      fail(file, atRule, `undocumented public variable definition "${property}"`);
    }
    recordPrimitiveHookUse(file, atRule, property);
    recordRecipeHookUse(file, atRule, property);
  });

  const primitiveMarginRules = new Set();
  const recipeMarginRules = new Set();
  root.walkRules((rule) =>
    validateSelectors(file, rule, primitiveMarginRules, recipeMarginRules),
  );

  const roleDefinitionCounts = new Map(
    [...semanticRoleVariables].map((variable) => [variable, 0]),
  );

  root.walkDecls((declaration) => {
    const property = declaration.prop;
    const forcedColors = isInsideForcedColors(declaration);

    if (declaration.important && !forcedColors) {
      fail(file, declaration, '!important outside forced-colors');
    }
    if (ELECTRON_ONLY_PROPERTIES.has(property.toLowerCase())) {
      fail(file, declaration, `Electron-only property "${property}"`);
    }
    if (isPhysicalSpatialProperty(property)) {
      fail(
        file,
        declaration,
        `physical spatial property "${property}" has a logical equivalent`,
      );
    }
    let enclosingRule = declaration.parent;
    while (enclosingRule && enclosingRule.type !== 'rule') {
      enclosingRule = enclosingRule.parent;
    }
    if (
      primitiveMarginRules.has(enclosingRule) &&
      (property === 'margin' || property.startsWith('margin-')) &&
      declaration.value.trim() !== '0'
    ) {
      fail(file, declaration, 'primitive roots must not own external margins');
    }
    if (
      recipeMarginRules.has(enclosingRule) &&
      (property === 'margin' || property.startsWith('margin-')) &&
      declaration.value.trim() !== '0'
    ) {
      fail(file, declaration, 'recipe roots must not own external margins');
    }
    if (property.startsWith('--dr-') && !isDarkRoastMapping(file)) {
      fail(file, declaration, '--dr-* is allowed only in the Dark Roast mapping');
    }

    const references = parseValue(file, declaration, declaration.value, {
      allowRawColors: isAlienMapping(file),
      allowDarkMappingBlend: isDarkRoastMapping(file),
      forcedColors,
    });
    for (const reference of references) {
      const declared = reference.startsWith('--_oi-')
        ? privateVariables.has(reference)
        : publicVariables.has(reference);
      if (!declared) {
        fail(
          file,
          declaration,
          `undeclared operational variable "${reference}"`,
        );
      }
      recordPrimitiveHookUse(file, declaration, reference);
      recordRecipeHookUse(file, declaration, reference);
    }

    if (
      (property === 'animation' || property === 'animation-iteration-count') &&
      valueContainsInfinite(declaration.value) &&
      declaration.parent?.type === 'rule' &&
      !ruleOwnsActiveAnimation(declaration.parent)
    ) {
      fail(
        file,
        declaration,
        'infinite animation requires live, loading, or refreshing activity ownership',
      );
    }

    const parsed = valueParser(declaration.value);
    parsed.walk((valueNode) => {
      if (
        valueNode.type === 'word' &&
        valueNode.value.startsWith('--dr-') &&
        !isDarkRoastMapping(file)
      ) {
        fail(
          file,
          declaration,
          '--dr-* is allowed only in the Dark Roast mapping',
        );
      }
    });

    if (mappingFiles.has(file) && roleDefinitionCounts.has(property)) {
      roleDefinitionCounts.set(property, roleDefinitionCounts.get(property) + 1);
    }
  });

  root.walkAtRules((atRule) => {
    if (
      atRule.name.toLowerCase() === 'property' &&
      atRule.params.trim().startsWith('--oi-')
    ) {
      return;
    }

    const references = parseValue(file, atRule, atRule.params, {
      allowRawColors:
        isAlienMapping(file) || atRule.name.toLowerCase() !== 'supports',
      forcedColors: isInsideForcedColors(atRule),
    });
    for (const reference of references) {
      const declared = reference.startsWith('--_oi-')
        ? privateVariables.has(reference)
        : publicVariables.has(reference);
      if (!declared) {
        fail(
          file,
          atRule,
          `undeclared operational variable "${reference}"`,
        );
      }
      recordPrimitiveHookUse(file, atRule, reference);
      recordRecipeHookUse(file, atRule, reference);
    }

    const parsed = valueParser(atRule.params);
    parsed.walk((valueNode) => {
      if (
        valueNode.type === 'word' &&
        valueNode.value.startsWith('--dr-') &&
        !isDarkRoastMapping(file)
      ) {
        fail(file, atRule, '--dr-* is allowed only in the Dark Roast mapping');
      }
    });
  });

  if (mappingFiles.has(file)) {
    for (const [variable, count] of roleDefinitionCounts) {
      if (count === 0) {
        failPath(file, `missing semantic role definition "${variable}"`);
      } else if (count > 1) {
        failPath(
          file,
          `semantic role "${variable}" is defined ${count} times`,
        );
      }
    }
  }
}

const expectedPrimitiveSourceFiles = entries(manifest.primitives).map(([name]) =>
  join(PRIMITIVES_SOURCE, `${name}.css`),
);
const discoveredPrimitiveSourceFiles = collectCssFiles(PRIMITIVES_SOURCE);
const expectedPrimitiveSourceSet = new Set(expectedPrimitiveSourceFiles);
const discoveredPrimitiveSourceSet = new Set(discoveredPrimitiveSourceFiles);
for (const file of expectedPrimitiveSourceFiles) {
  if (!discoveredPrimitiveSourceSet.has(file)) {
    failPath(file, 'required primitive CSS source is missing');
  }
}
for (const file of discoveredPrimitiveSourceFiles) {
  if (!expectedPrimitiveSourceSet.has(file)) {
    failPath(file, 'undeclared primitive CSS source');
  }
}

const expectedRecipeSourceFiles = entries(manifest.recipes).map(([name]) =>
  join(RECIPES_SOURCE, `${name}.css`),
);
const discoveredRecipeSourceFiles = collectCssFiles(RECIPES_SOURCE);
const expectedRecipeSourceSet = new Set(expectedRecipeSourceFiles);
const discoveredRecipeSourceSet = new Set(discoveredRecipeSourceFiles);
for (const file of expectedRecipeSourceFiles) {
  if (!discoveredRecipeSourceSet.has(file)) {
    failPath(file, 'required recipe CSS source is missing');
  }
}
for (const file of discoveredRecipeSourceFiles) {
  if (!expectedRecipeSourceSet.has(file)) {
    failPath(file, 'undeclared recipe CSS source');
  }
}

const sourceFiles = SOURCE_DIRECTORIES.flatMap(collectCssFiles).sort();
const privateVariables = collectPrivateVariables(sourceFiles);
const generatedMappingFiles = collectCssFiles(MAPPINGS_OUTPUT);
const proofMappingFiles = [DARK_ROAST_MAPPING, ALIEN_MAPPING].filter(existsSync);
const mappingFileSet = new Set(proofMappingFiles);
const sliceBPresent =
  sourceFiles.length > 0 || proofMappingFiles.length > 0 || existsSync(LAYERS_SOURCE);

if (sliceBPresent) {
  if (!existsSync(LAYERS_SOURCE)) {
    failPath(LAYERS_SOURCE, 'required layer-order manifest is missing');
  }
  if (!existsSync(DARK_ROAST_MAPPING)) {
    failPath(DARK_ROAST_MAPPING, 'required generated mapping is missing');
  }
  if (!existsSync(ALIEN_MAPPING)) {
    failPath(ALIEN_MAPPING, 'required proof mapping is missing');
  }
}

if (existsSync(LAYERS_SOURCE)) validateLayerOrder(LAYERS_SOURCE);

const files = [
  ...new Set([
    ...sourceFiles,
    ...generatedMappingFiles,
    ...proofMappingFiles,
    ...(existsSync(LAYERS_SOURCE) ? [LAYERS_SOURCE] : []),
  ]),
].sort();
for (const file of files) {
  if (file === LAYERS_SOURCE) continue;
  validateFile(file, mappingFileSet, privateVariables);
}

for (const [className, primitiveName] of primitiveClassToName) {
  if (!styledPrimitiveClasses.has(className)) {
    failPath(
      join(PRIMITIVES_SOURCE, `${primitiveName}.css`),
      `missing required primitive root selector ".${className}"`,
    );
  }
}
for (const [className, primitiveName] of primitivePartClassToOwner) {
  if (!styledPrimitiveClasses.has(className)) {
    failPath(
      join(PRIMITIVES_SOURCE, `${primitiveName}.css`),
      `missing required primitive part selector ".${className}"`,
    );
  }
}
for (const [hook, primitiveName] of primitiveHookToOwner) {
  if (!usedPrimitiveHooks.has(hook)) {
    failPath(
      join(PRIMITIVES_SOURCE, `${primitiveName}.css`),
      `declared primitive hook "${hook}" is unused`,
    );
  }
}
for (const [className, recipeName] of recipeClassToName) {
  if (!styledRecipeClasses.has(className)) {
    failPath(
      join(RECIPES_SOURCE, `${recipeName}.css`),
      `missing required recipe root selector ".${className}"`,
    );
  }
}
for (const [className, recipeName] of recipePartClassToOwner) {
  if (!styledRecipeClasses.has(className)) {
    failPath(
      join(RECIPES_SOURCE, `${recipeName}.css`),
      `missing required recipe part selector ".${className}"`,
    );
  }
}
for (const [hook, recipeName] of recipeHookToOwner) {
  if (!usedRecipeHooks.has(hook)) {
    failPath(
      join(RECIPES_SOURCE, `${recipeName}.css`),
      `declared recipe hook "${hook}" is unused`,
    );
  }
}
for (const [recipeName, definition] of entries(manifest.recipes)) {
  if (!declaredRecipeContainerNames.has(recipeName)) {
    failPath(
      join(RECIPES_SOURCE, `${recipeName}.css`),
      `missing required container-name "oi-${recipeName}"`,
    );
  }
  const expectedThresholds = [definition.widths.preferred, definition.widths.wide];
  const seen = seenRecipeContainerThresholds.get(recipeName) ?? new Set();
  for (const threshold of expectedThresholds) {
    if (!seen.has(threshold)) {
      failPath(
        join(RECIPES_SOURCE, `${recipeName}.css`),
        `missing named @container threshold "${threshold}"`,
      );
    }
  }
}

if (failures.length) {
  failures.sort();
  console.error(
    `FAIL system CSS (${failures.length} problem${failures.length === 1 ? '' : 's'})`,
  );
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

const fileCount = files.length;
if (fileCount === 0) {
  console.log('PASS system CSS: Slice B CSS is not present yet');
} else {
  console.log(
    `PASS system CSS: ${fileCount} file${fileCount === 1 ? '' : 's'}, ` +
      `${proofMappingFiles.length} mapping${proofMappingFiles.length === 1 ? '' : 's'}, ` +
      `${semanticRoleVariables.size} semantic roles`,
  );
}
