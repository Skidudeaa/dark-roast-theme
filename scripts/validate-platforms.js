#!/usr/bin/env node
// Validate generated companion-theme platform artifacts against src/variants.
// Zero dependencies: only Node's standard library and Python's plistlib are used.

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VARIANT_DIR = join(ROOT, 'src', 'variants');
const HEX_COLOR = /^#[0-9A-F]{6}$/i;

const CURRENT_VSCODE_ROLES = [
  'editorMultiCursor.primary.foreground',
  'toolbar.hoverBackground',
  'inlineEdit.gutterIndicator.primaryBorder',
  'multiDiffEditor.background',
  'terminalStickyScroll.background',
  'markdownAlert.note.foreground',
  'agentStatusIndicator.background',
];

const READABLE_STRUCTURAL_VSCODE_ROLES = [
  'editorLineNumber.dimmedForeground',
  'list.deemphasizedForeground',
  'commandCenter.inactiveForeground',
  'diffEditor.unchangedRegionForeground',
  'gitDecoration.ignoredResourceForeground',
  'debugIcon.breakpointDisabledForeground',
  'editor.inlineValuesForeground',
  'inlineChatInput.placeholderForeground',
];

const FORBIDDEN_VSCODE_KEYS = new Set([
  'minimap.foreground',
  'editorFoldIcon.foreground',
]);

const PYTHON_PLIST_INSPECTOR = String.raw`
import json
import plistlib
import sys
import math

def color_to_hex(value):
    if isinstance(value, str):
        if len(value) == 7 and value.startswith('#'):
            return value.upper()
        parts = value.split()
        if len(parts) < 4:
            return None
        try:
            channels = [float(part) for part in parts[:3]]
            alpha = float(parts[3])
        except ValueError:
            return None
    elif isinstance(value, dict):
        try:
            channels = [
                float(value['Red Component']),
                float(value['Green Component']),
                float(value['Blue Component']),
            ]
            alpha = float(value['Alpha Component'])
        except (KeyError, TypeError, ValueError):
            return None
    else:
        return None
    if not all(math.isfinite(channel) and 0.0 <= channel <= 1.0 for channel in channels):
        return None
    if not math.isfinite(alpha) or abs(alpha - 1.0) > 0.000001:
        return None
    values = [max(0, min(255, int(channel * 255 + 0.5))) for channel in channels]
    return '#' + ''.join(f'{value:02X}' for value in values)

requests = json.loads(sys.stdin.read())
results = []
for request in requests:
    result = {'label': request['label'], 'kind': request['kind']}
    try:
        # Deliberately read-only: platform validation must never rewrite a plist.
        with open(request['path'], 'rb') as handle:
            data = plistlib.load(handle)
        if not isinstance(data, dict):
            raise TypeError('plist root must be a dictionary')

        if request['kind'] == 'textastic':
            settings = data.get('settings')
            global_settings = {}
            if isinstance(settings, list) and settings and isinstance(settings[0], dict):
                candidate = settings[0].get('settings')
                if isinstance(candidate, dict):
                    global_settings = candidate
            result['metadata'] = {
                'name': data.get('name'),
                'uuid': data.get('uuid'),
                'semanticClass': data.get('semanticClass'),
            }
            result['colors'] = {
                key: global_settings.get(key)
                for key in ('background', 'foreground', 'caret')
            }
            result['rules'] = {
                entry.get('name'): color_to_hex(entry.get('settings', {}).get('foreground'))
                for entry in settings
                if isinstance(entry, dict)
                and isinstance(entry.get('name'), str)
                and isinstance(entry.get('settings'), dict)
            }
        elif request['kind'] == 'xcode':
            direct_keys = (
                'DVTSourceTextBackground',
                'DVTSourceTextInsertionPointColor',
                'DVTSourceTextSelectionColor',
                'DVTConsoleTextBackgroundColor',
                'DVTConsoleDebuggerInputTextColor',
                'DVTConsoleExectuableInputTextColor',
            )
            result['colors'] = {
                key: color_to_hex(data.get(key))
                for key in direct_keys
            }
            syntax = data.get('DVTSourceTextSyntaxColors')
            if not isinstance(syntax, dict):
                syntax = {}
            result['syntax'] = {
                key: color_to_hex(value)
                for key, value in syntax.items()
            }
        elif request['kind'] == 'iterm':
            result['colors'] = {
                key: color_to_hex(value)
                for key, value in data.items()
                if isinstance(value, dict)
            }
        else:
            raise ValueError('unknown plist kind')
        result['ok'] = True
    except Exception as error:
        result['ok'] = False
        result['error'] = f'{type(error).__name__}: {error}'
    results.append(result)

print(json.dumps(results, separators=(',', ':')))
`;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeHex(value) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value.toUpperCase() : value;
}

function stripCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\r\n]/g, ' '));
}

// JSONC comments must only be recognized outside JSON strings. Replacing
// comment bytes with spaces preserves offsets for duplicate-key diagnostics.
function stripJsonComments(source) {
  let output = '';
  let index = 0;
  let inString = false;
  let escaped = false;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (inString) {
      output += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      index += 1;
      continue;
    }

    if (character === '"') {
      inString = true;
      output += character;
      index += 1;
      continue;
    }

    if (character === '/' && next === '/') {
      output += '  ';
      index += 2;
      while (index < source.length && source[index] !== '\n' && source[index] !== '\r') {
        output += ' ';
        index += 1;
      }
      continue;
    }

    if (character === '/' && next === '*') {
      output += '  ';
      index += 2;
      let closed = false;
      while (index < source.length) {
        if (source[index] === '*' && source[index + 1] === '/') {
          output += '  ';
          index += 2;
          closed = true;
          break;
        }
        output += source[index] === '\n' || source[index] === '\r' ? source[index] : ' ';
        index += 1;
      }
      if (!closed) throw new Error('unterminated block comment');
      continue;
    }

    output += character;
    index += 1;
  }

  return output;
}

function stripTrailingJsonCommas(source) {
  let output = '';
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      output += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      output += character;
      continue;
    }
    if (character === ',') {
      let lookahead = index + 1;
      while (/\s/.test(source[lookahead] || '')) lookahead += 1;
      if (source[lookahead] === '}' || source[lookahead] === ']') {
        output += ' ';
        continue;
      }
    }
    output += character;
  }
  return output;
}

function skipWhitespace(source, start) {
  let index = start;
  while (/\s/.test(source[index] || '')) index += 1;
  return index;
}

function readJsonStringToken(source, start) {
  if (source[start] !== '"') throw new Error(`expected JSON string at offset ${start}`);
  let index = start + 1;
  let escaped = false;
  while (index < source.length) {
    const character = source[index];
    if (escaped) escaped = false;
    else if (character === '\\') escaped = true;
    else if (character === '"') {
      const end = index + 1;
      return { value: JSON.parse(source.slice(start, end)), end };
    }
    index += 1;
  }
  throw new Error(`unterminated JSON string at offset ${start}`);
}

function skipJsonValue(source, start) {
  let index = skipWhitespace(source, start);
  const character = source[index];
  if (character === '"') return readJsonStringToken(source, index).end;

  if (character === '{') {
    index += 1;
    index = skipWhitespace(source, index);
    if (source[index] === '}') return index + 1;
    while (index < source.length) {
      const key = readJsonStringToken(source, index);
      index = skipWhitespace(source, key.end);
      if (source[index] !== ':') throw new Error(`expected colon at offset ${index}`);
      index = skipWhitespace(source, skipJsonValue(source, index + 1));
      if (source[index] === '}') return index + 1;
      if (source[index] !== ',') throw new Error(`expected comma at offset ${index}`);
      index = skipWhitespace(source, index + 1);
    }
  }

  if (character === '[') {
    index += 1;
    index = skipWhitespace(source, index);
    if (source[index] === ']') return index + 1;
    while (index < source.length) {
      index = skipWhitespace(source, skipJsonValue(source, index));
      if (source[index] === ']') return index + 1;
      if (source[index] !== ',') throw new Error(`expected comma at offset ${index}`);
      index = skipWhitespace(source, index + 1);
    }
  }

  while (index < source.length && !/[\s,}\]]/.test(source[index])) index += 1;
  return index;
}

function jsonObjectEntriesAt(source, start) {
  let index = skipWhitespace(source, start);
  if (source[index] !== '{') throw new Error(`expected JSON object at offset ${index}`);
  index = skipWhitespace(source, index + 1);
  const entries = [];
  if (source[index] === '}') return entries;

  while (index < source.length) {
    const token = readJsonStringToken(source, index);
    index = skipWhitespace(source, token.end);
    if (source[index] !== ':') throw new Error(`expected colon at offset ${index}`);
    const valueStart = skipWhitespace(source, index + 1);
    const valueEnd = skipJsonValue(source, valueStart);
    entries.push({ key: token.value, valueStart, valueEnd });
    index = skipWhitespace(source, valueEnd);
    if (source[index] === '}') return entries;
    if (source[index] !== ',') throw new Error(`expected comma at offset ${index}`);
    index = skipWhitespace(source, index + 1);
  }
  throw new Error(`unterminated JSON object at offset ${start}`);
}

function duplicateKeys(entries) {
  const seen = new Set();
  const duplicates = new Set();
  for (const { key } of entries) {
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return [...duplicates].sort();
}

function duplicateKeysDeep(source, start, prefix = '') {
  const entries = jsonObjectEntriesAt(source, start);
  const duplicates = duplicateKeys(entries).map((key) => prefix ? `${prefix}.${key}` : key);
  for (const entry of entries) {
    if (source[entry.valueStart] !== '{') continue;
    const childPrefix = prefix ? `${prefix}.${entry.key}` : entry.key;
    duplicates.push(...duplicateKeysDeep(source, entry.valueStart, childPrefix));
  }
  return duplicates;
}

function stripYamlComment(line) {
  let quote = null;
  let escaped = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quote) {
      if (quote === '"' && escaped) escaped = false;
      else if (quote === '"' && character === '\\') escaped = true;
      else if (character === quote) {
        if (quote === "'" && line[index + 1] === "'") index += 1;
        else quote = null;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '#') {
      return line.slice(0, index);
    }
  }
  return line;
}

function decodeYamlScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try { return JSON.parse(trimmed); } catch { return trimmed.slice(1, -1); }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed;
}

function parseSimpleYamlScalars(source) {
  const values = new Map();
  const stack = [];
  for (const original of source.split(/\r?\n/)) {
    const line = stripYamlComment(original).replace(/\s+$/, '');
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();
    const match = content.match(/^(?:-\s+)?([A-Za-z_][\w-]*):(?:\s*(.*))?$/);
    if (!match) continue;
    while (stack.length && stack.at(-1).indent >= indent) stack.pop();
    const [, key, rawValue = ''] = match;
    const path = [...stack.map((entry) => entry.key), key].join('.');
    if (rawValue.trim() === '') {
      stack.push({ key, indent });
    } else {
      if (!values.has(path)) values.set(path, []);
      values.get(path).push(decodeYamlScalar(rawValue));
    }
  }
  return values;
}

function yamlListsForKey(source, key) {
  const lines = source.split(/\r?\n/).map(stripYamlComment);
  const lists = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].replace(/\s+$/, '');
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)[0].length;
    if (line.trim() !== `${key}:`) continue;
    const values = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const candidate = lines[cursor].replace(/\s+$/, '');
      if (!candidate.trim()) continue;
      const candidateIndent = candidate.match(/^\s*/)[0].length;
      if (candidateIndent <= indent) break;
      const match = candidate.trim().match(/^-\s+(.+)$/);
      if (match) values.push(decodeYamlScalar(match[1]));
    }
    lists.push(values);
  }
  return lists;
}

function findPythonDictionary(source, assignmentName) {
  const match = new RegExp(`\\b${escapeRegExp(assignmentName)}\\s*=\\s*\\{`).exec(source);
  if (!match) return null;
  const start = source.indexOf('{', match.index);
  let depth = 0;
  let quote = null;
  let triple = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (triple && source.startsWith(quote.repeat(3), index)) {
        quote = null;
        triple = false;
        index += 2;
      } else if (!triple && escaped) {
        escaped = false;
      } else if (!triple && character === '\\') {
        escaped = true;
      } else if (!triple && character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === '#') {
      while (index < source.length && source[index] !== '\n') index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      triple = source.startsWith(character.repeat(3), index);
      if (triple) index += 2;
      continue;
    }
    if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function parsePythonStringDictionary(block) {
  const entries = new Map();
  const duplicates = new Set();
  if (!block) return { entries, duplicates };
  const pattern = /^\s*["']([^"']+)["']\s*:\s*["']([^"']*)["']\s*,?/gm;
  for (const match of block.matchAll(pattern)) {
    if (entries.has(match[1])) duplicates.add(match[1]);
    entries.set(match[1], match[2]);
  }
  return { entries, duplicates };
}

function companionTextasticName(id) {
  return id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('-');
}

function ansiFor(variant) {
  const colors = variant.colors;
  const platform = variant.platform;
  const normal = [
    colors.obsidian,
    colors.scarlet,
    platform.sage,
    colors.amber,
    platform.slate,
    platform.mauve,
    colors.teal,
    colors.bone,
  ];
  const bright = [
    platform.structural,
    platform.scarletBright,
    platform.sageBright,
    colors.gold,
    platform.slateBright,
    platform.mauveBright,
    platform.tealBright,
    colors.crema,
  ];
  return { normal, bright, all: [...normal, ...bright] };
}

function compareColor(actual, expected) {
  return normalizeHex(actual) === normalizeHex(expected);
}

function validateCss(variant, readArtifact, fail) {
  const baseSource = readArtifact('dist/css/dark-roast.css');
  const baseUtilityClasses = baseSource === null
    ? []
    : [...new Set([...stripCssComments(baseSource).matchAll(/\.((?:dr-)[\w-]+)/g)].map((match) => match[1]))];
  const files = [
    {
      kind: 'standalone',
      relative: `dist/css/dark-roast-${variant.id}.css`,
      root: `.${variant.className}`,
    },
    {
      kind: 'scoped',
      relative: `dist/css/dark-roast-${variant.id}-scoped.css`,
      root: `[data-theme="${variant.selector}"]`,
    },
  ];

  for (const file of files) {
    const source = readArtifact(file.relative);
    if (source === null) continue;
    const css = stripCssComments(source);
    const rootPattern = file.kind === 'standalone'
      ? new RegExp(`(^|})\\s*\\.${escapeRegExp(variant.className)}\\s*\\{`, 'm')
      : new RegExp(`(^|[,}])\\s*\\[data-theme=["']${escapeRegExp(variant.selector)}["']\\]\\s*\\{`, 'm');
    if (!rootPattern.test(css)) fail(variant.id, `${file.relative} lacks exact ${file.root} root selector`);

    if (file.kind === 'standalone') {
      const classes = [...css.matchAll(/\.((?:dark-roast)[\w-]*)/g)].map((match) => match[1]);
      const wrong = [...new Set(classes.filter((value) => value !== variant.className))];
      if (wrong.length) fail(variant.id, `${file.relative} has foreign theme class selector(s): ${wrong.join(', ')}`);
      if (/\[\s*data-theme\s*=/.test(css)) fail(variant.id, `${file.relative} must use class selectors, not data-theme selectors`);
    } else {
      const attributes = [...css.matchAll(/\[\s*data-theme\b[^\]]*\]/g)].map((match) => match[0]);
      const exactAttribute = new RegExp(`^\\[\\s*data-theme\\s*=\\s*(["'])${escapeRegExp(variant.selector)}\\1\\s*\\]$`);
      const wrong = [...new Set(attributes.filter((attribute) => !exactAttribute.test(attribute)))];
      if (wrong.length) fail(variant.id, `${file.relative} has non-exact data-theme selector(s): ${wrong.join(', ')}`);
      if (!attributes.length) fail(variant.id, `${file.relative} has no data-theme selector`);
    }

    const structuralPattern = new RegExp(`--dr-structural\\s*:\\s*${escapeRegExp(variant.platform.structural)}\\s*;`, 'i');
    if (!structuralPattern.test(css)) {
      fail(variant.id, `${file.relative} must define --dr-structural as ${variant.platform.structural}`);
    }

    const tealChannels = [1, 3, 5].map((offset) => Number.parseInt(variant.colors.teal.slice(offset, offset + 2), 16));
    const tealGlow = css.match(/--dr-glow-teal\s*:\s*([^;]+);/);
    const tealRgba = new RegExp(`rgba\\(\\s*${tealChannels[0]}\\s*,\\s*${tealChannels[1]}\\s*,\\s*${tealChannels[2]}\\s*,`);
    if (!tealGlow || !tealRgba.test(tealGlow[1])) {
      fail(variant.id, `${file.relative} --dr-glow-teal must retain the companion teal hue`);
    }

    const amberChannels = [1, 3, 5].map((offset) => Number.parseInt(variant.colors.amber.slice(offset, offset + 2), 16));
    const selectionBlocks = [...css.matchAll(/::(?:-moz-)?selection\s*\{([^}]*)\}/g)];
    const amberSelection = new RegExp(`background\\s*:\\s*rgba\\(\\s*${amberChannels[0]}\\s*,\\s*${amberChannels[1]}\\s*,\\s*${amberChannels[2]}\\s*,\\s*0\\.22\\s*\\)`);
    if (selectionBlocks.length < 2 || selectionBlocks.some((match) => !amberSelection.test(match[1]))) {
      fail(variant.id, `${file.relative} selection rules must use companion amber at 22%`);
    }

    for (const utilityClass of baseUtilityClasses) {
      const utilityPattern = new RegExp(`\\.${escapeRegExp(utilityClass)}(?![\\w-])`);
      if (!utilityPattern.test(css)) {
        fail(variant.id, `${file.relative} dropped Black Label utility class .${utilityClass}`);
      }
    }

    const shimmerSelector = new RegExp(`${escapeRegExp(file.root)}\\s+\\.dr-shimmer-skeleton\\s*\\{`);
    if (!shimmerSelector.test(css)) fail(variant.id, `${file.relative} lacks scoped .dr-shimmer-skeleton utility`);

    const keyframes = [...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map((match) => match[1]);
    const namespace = `dr-${variant.id}-`;
    if (!keyframes.length) fail(variant.id, `${file.relative} defines no keyframes`);
    const unnamespaced = [...new Set(keyframes.filter((name) => !name.startsWith(namespace)))];
    if (unnamespaced.length) {
      fail(variant.id, `${file.relative} has unnamespaced keyframes: ${unnamespaced.join(', ')}`);
    }
    if (!keyframes.includes(`${namespace}shimmer-skeleton`)) {
      fail(variant.id, `${file.relative} lacks @keyframes ${namespace}shimmer-skeleton`);
    }
    const definedKeyframes = new Set(keyframes);
    const undefinedAnimations = new Set();
    for (const declaration of css.matchAll(/\banimation(?:-name)?\s*:\s*([^;]+)/g)) {
      // Ignore custom properties such as var(--dr-duration-ambient); only
      // bare dr-* animation identifiers are keyframe references.
      const names = declaration[1].match(/(?<![-\w])dr-[\w-]+\b/g) || [];
      const invalid = names.filter((name) => !name.startsWith(namespace));
      if (invalid.length) {
        fail(variant.id, `${file.relative} references unnamespaced animation(s): ${[...new Set(invalid)].join(', ')}`);
      }
      for (const name of names) {
        if (name.startsWith(namespace) && !definedKeyframes.has(name)) undefinedAnimations.add(name);
      }
    }
    if (undefinedAnimations.size) {
      fail(variant.id, `${file.relative} references undefined animation(s): ${[...undefinedAnimations].join(', ')}`);
    }

    const corruptedGlow = new RegExp(`--dr-${escapeRegExp(variant.id)}-glow(?:\\b|-)`);
    if (corruptedGlow.test(css)) {
      fail(variant.id, `${file.relative} contains corrupted --dr-${variant.id}-glow custom property`);
    }
  }
}

function validateVsCode(variant, readArtifact, fail) {
  const relative = `platforms/vscode/themes/dark-roast-${variant.id}-color-theme.json`;
  const source = readArtifact(relative);
  if (source === null) return;

  let stripped;
  let theme;
  try {
    stripped = stripTrailingJsonCommas(stripJsonComments(source.replace(/^\uFEFF/, '')));
    theme = JSON.parse(stripped);
  } catch (error) {
    fail(variant.id, `${relative} is invalid JSONC: ${error.message}`);
    return;
  }

  if (theme.name !== variant.name) fail(variant.id, `${relative} name must be ${JSON.stringify(variant.name)}`);
  if (theme.type !== 'dark') fail(variant.id, `${relative} type must be "dark"`);
  if (!theme.colors || typeof theme.colors !== 'object' || Array.isArray(theme.colors)) {
    fail(variant.id, `${relative} colors must be an object`);
    return;
  }
  if (!theme.semanticTokenColors || typeof theme.semanticTokenColors !== 'object' || Array.isArray(theme.semanticTokenColors)) {
    fail(variant.id, `${relative} semanticTokenColors must be an object`);
    return;
  }

  try {
    const rootEntries = jsonObjectEntriesAt(stripped, skipWhitespace(stripped, 0));
    for (const objectName of ['colors', 'semanticTokenColors']) {
      const targets = rootEntries.filter(({ key }) => key === objectName);
      if (targets.length !== 1) {
        fail(variant.id, `${relative} must contain exactly one top-level ${objectName} object`);
      }
      for (const target of targets) {
        const duplicates = duplicateKeysDeep(stripped, target.valueStart);
        if (duplicates.length) {
          fail(variant.id, `${relative} has duplicate ${objectName} key(s): ${duplicates.join(', ')}`);
        }
      }
    }
  } catch (error) {
    fail(variant.id, `${relative} duplicate-key scan failed: ${error.message}`);
  }

  for (const key of Object.keys(theme.colors)) {
    if (FORBIDDEN_VSCODE_KEYS.has(key) || key.startsWith('notification.')) {
      fail(variant.id, `${relative} contains obsolete color key ${key}`);
    }
  }
  for (const key of CURRENT_VSCODE_ROLES) {
    if (!Object.hasOwn(theme.colors, key)) {
      fail(variant.id, `${relative} is missing current color role ${key}`);
    } else if (!/^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/i.test(theme.colors[key])) {
      fail(variant.id, `${relative} current color role ${key} must be a hex color`);
    }
  }
  for (const key of READABLE_STRUCTURAL_VSCODE_ROLES) {
    if (!compareColor(theme.colors[key], variant.platform.structural)) {
      fail(variant.id, `${relative} ${key} must use readable structural foreground ${variant.platform.structural}`);
    }
  }

  const tokenRulesByName = new Map(
    Array.isArray(theme.tokenColors)
      ? theme.tokenColors.filter((rule) => rule && typeof rule.name === 'string').map((rule) => [rule.name, rule])
      : [],
  );
  for (const [name, expected] of [
    ['Function — SDK / built-in support', variant.platform.slate],
    ['Python — built-in function (print, len, range, type)', variant.platform.slate],
    ['CSS — function (calc, var, linear-gradient)', variant.platform.slate],
    ['Markdown — horizontal rule (---)', variant.platform.structural],
    ['Markdown — strikethrough', variant.platform.structural],
  ]) {
    const foreground = tokenRulesByName.get(name)?.settings?.foreground;
    if (!compareColor(foreground, expected)) {
      fail(variant.id, `${relative} TextMate rule ${JSON.stringify(name)} must be ${expected}`);
    }
  }

  for (const key of ['function', 'function.declaration', 'method', 'method.declaration']) {
    if (!compareColor(theme.semanticTokenColors[key], variant.colors.teal)) {
      fail(variant.id, `${relative} semantic ${key} must be ${variant.colors.teal}`);
    }
  }
  for (const key of ['function.defaultLibrary', 'method.defaultLibrary', 'variable.defaultLibrary']) {
    const value = theme.semanticTokenColors[key];
    const foreground = typeof value === 'string' ? value : value?.foreground;
    if (!compareColor(foreground, variant.platform.slate)) {
      fail(variant.id, `${relative} semantic ${key} foreground must be ${variant.platform.slate}`);
    }
  }

  const ansi = ansiFor(variant).all;
  const ansiKeys = [
    'terminal.ansiBlack',
    'terminal.ansiRed',
    'terminal.ansiGreen',
    'terminal.ansiYellow',
    'terminal.ansiBlue',
    'terminal.ansiMagenta',
    'terminal.ansiCyan',
    'terminal.ansiWhite',
    'terminal.ansiBrightBlack',
    'terminal.ansiBrightRed',
    'terminal.ansiBrightGreen',
    'terminal.ansiBrightYellow',
    'terminal.ansiBrightBlue',
    'terminal.ansiBrightMagenta',
    'terminal.ansiBrightCyan',
    'terminal.ansiBrightWhite',
  ];
  ansiKeys.forEach((key, index) => {
    if (!compareColor(theme.colors[key], ansi[index])) {
      fail(variant.id, `${relative} ${key} must be ${ansi[index]}`);
    }
  });
}

function validateTerminalFiles(variant, readArtifact, fail) {
  const colors = variant.colors;
  const platform = variant.platform;
  const ansi = ansiFor(variant);
  const normalNames = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

  const warpRelative = `platforms/warp/dark-roast-${variant.id}.yaml`;
  const warp = readArtifact(warpRelative);
  if (warp !== null) {
    const values = parseSimpleYamlScalars(warp);
    const expected = new Map([
      ['accent', colors.amber],
      ['background', colors.void],
      ['foreground', colors.crema],
      ['cursor', colors.teal],
    ]);
    normalNames.forEach((name, index) => expected.set(`terminal_colors.normal.${name}`, ansi.normal[index]));
    normalNames.forEach((name, index) => expected.set(`terminal_colors.bright.${name}`, ansi.bright[index]));
    for (const [path, color] of expected) {
      const actual = values.get(path) || [];
      if (actual.length !== 1 || !compareColor(actual[0], color)) {
        fail(variant.id, `${warpRelative} ${path} must be ${color}`);
      }
    }
    if (!warp.includes(`${variant.name} — Warp Terminal Theme`)) {
      fail(variant.id, `${warpRelative} header must name ${variant.name}`);
    }
    if (!warp.includes(`~/.warp/themes/dark-roast-${variant.id}.yaml`) || !warp.includes(`Select "dark-roast-${variant.id}"`)) {
      fail(variant.id, `${warpRelative} install instructions must use the companion filename and id`);
    }
  }

  const tabbyRelative = `platforms/tabby/dark-roast-${variant.id}.yaml`;
  const tabby = readArtifact(tabbyRelative);
  if (tabby !== null) {
    const values = parseSimpleYamlScalars(tabby);
    const scalarExpected = new Map([
      ['terminal.colorScheme.name', variant.name],
      ['terminal.customColorSchemes.name', variant.name],
      ['terminal.customColorSchemes.foreground', colors.crema],
      ['terminal.customColorSchemes.background', colors.void],
      ['terminal.customColorSchemes.cursor', colors.teal],
      ['terminal.customColorSchemes.cursorAccent', colors.void],
      ['terminal.customColorSchemes.selection', `${colors.espresso}66`],
      ['terminal.customColorSchemes.selectionForeground', colors.crema],
    ]);
    for (const [path, expected] of scalarExpected) {
      const actual = values.get(path) || [];
      const matches = path.endsWith('.name')
        ? actual.length === 1 && actual[0] === expected
        : actual.length === 1 && normalizeHex(actual[0]) === normalizeHex(expected);
      if (!matches) fail(variant.id, `${tabbyRelative} ${path} must be ${expected}`);
    }
    const palettes = yamlListsForKey(tabby, 'colors');
    if (palettes.length !== 1) {
      fail(variant.id, `${tabbyRelative} must contain exactly one colors palette (found ${palettes.length})`);
    }
    const palette = palettes[0] || [];
    if (palette.length !== 16) {
      fail(variant.id, `${tabbyRelative} colors must contain exactly 16 entries (found ${palette.length})`);
    } else {
      palette.forEach((actual, index) => {
        if (!compareColor(actual, ansi.all[index])) {
          fail(variant.id, `${tabbyRelative} ANSI ${index} must be ${ansi.all[index]}`);
        }
      });
    }
  }

  const terminalRelative = `platforms/terminal-app/generate-${variant.id}-profile.py`;
  const terminal = readArtifact(terminalRelative);
  if (terminal !== null) {
    const paletteBlock = findPythonDictionary(terminal, 'PALETTE');
    if (!paletteBlock) {
      fail(variant.id, `${terminalRelative} is missing PALETTE dictionary`);
    } else {
      const parsed = parsePythonStringDictionary(paletteBlock);
      if (parsed.duplicates.size) {
        fail(variant.id, `${terminalRelative} has duplicate PALETTE key(s): ${[...parsed.duplicates].join(', ')}`);
      }
      const expected = new Map([
        ['background', colors.void],
        ['foreground', colors.crema],
        ['cursor', colors.teal],
        ['cursor_text', colors.void],
        ['selection', colors.espresso],
        ['bold_text', colors.crema],
      ]);
      const pythonNames = [
        'ansi_black', 'ansi_red', 'ansi_green', 'ansi_yellow',
        'ansi_blue', 'ansi_magenta', 'ansi_cyan', 'ansi_white',
        'ansi_bright_black', 'ansi_bright_red', 'ansi_bright_green', 'ansi_bright_yellow',
        'ansi_bright_blue', 'ansi_bright_magenta', 'ansi_bright_cyan', 'ansi_bright_white',
      ];
      pythonNames.forEach((name, index) => expected.set(name, ansi.all[index]));
      for (const [key, color] of expected) {
        if (!compareColor(parsed.entries.get(key), color)) {
          fail(variant.id, `${terminalRelative} PALETTE[${JSON.stringify(key)}] must be ${color}`);
        }
      }
    }

    const profileBlock = findPythonDictionary(terminal, 'profile');
    const profile = parsePythonStringDictionary(profileBlock);
    const plainName = variant.name.replace(':', '');
    if (profile.entries.get('name') !== plainName) {
      fail(variant.id, `${terminalRelative} profile name must be ${JSON.stringify(plainName)}`);
    }
    if (profile.entries.get('type') !== 'Window Settings') {
      fail(variant.id, `${terminalRelative} profile type must be "Window Settings"`);
    }
    const terminalFilename = `${plainName}.terminal`;
    const outputPattern = new RegExp(`output_path\\s*=\\s*os\\.path\\.join\\(output_dir,\\s*["']${escapeRegExp(terminalFilename)}["']\\)`);
    if (!outputPattern.test(terminal)) {
      fail(variant.id, `${terminalRelative} output filename must be ${JSON.stringify(terminalFilename)}`);
    }
    if (!terminal.includes(`${variant.name} — Terminal.app Profile Generator`)) {
      fail(variant.id, `${terminalRelative} must name ${variant.name}`);
    }
    if (/from Foundation import[^\n]*\bNSColor\b/.test(terminal) || !/from AppKit import[^\n]*\bNSColor\b/.test(terminal)) {
      fail(variant.id, `${terminalRelative} must import NSColor from AppKit`);
    }
    if (!terminal.includes('def archive_nsobject(value):') || !terminal.includes('if isinstance(result, tuple):')) {
      fail(variant.id, `${terminalRelative} must handle PyObjC NSError out-parameter return tuples`);
    }
  }

  for (const [relative, source] of [[warpRelative, warp], [tabbyRelative, tabby], [terminalRelative, terminal]]) {
    if (source !== null && /\b(?:1\.6|18\.5)ms\b|\b(?:17\.08|18\.31):1\b|OLED-safe|near-black/i.test(source)) {
      fail(variant.id, `${relative} inherits a Black Label-only display claim`);
    }
  }
}

function plistRequestsFor(variant) {
  return [
    {
      label: `${variant.id}/Textastic`,
      kind: 'textastic',
      path: join(ROOT, 'platforms', 'textastic', `Dark-Roast-${companionTextasticName(variant.id)}.tmTheme`),
      variant,
    },
    {
      label: `${variant.id}/Xcode`,
      kind: 'xcode',
      path: join(ROOT, 'platforms', 'xcode', `Dark Roast ${variant.shortName}.dvtcolortheme`),
      variant,
    },
    {
      label: `${variant.id}/iTerm2`,
      kind: 'iterm',
      path: join(ROOT, 'platforms', 'iterm2', `Dark Roast ${variant.shortName}.itermcolors`),
      variant,
    },
  ];
}

function validatePlists(requests, fail) {
  for (const request of requests) {
    let source;
    try {
      source = readFileSync(request.path, 'utf8');
    } catch {
      continue;
    }
    if (/\b(?:1\.6|18\.5)ms\b|\b(?:17\.08|18\.31):1\b|OLED-safe|near-black/i.test(source)) {
      fail(request.variant.id, `${request.label} inherits a Black Label-only display claim`);
    }
    if (request.kind === 'iterm') {
      const filename = `Dark Roast ${request.variant.shortName}.itermcolors`;
      if (!source.includes(`"${filename}"`)) {
        fail(request.variant.id, `${request.label} install instructions must name ${filename}`);
      }
      const importedPreset = request.variant.name.replace(':', '');
      if (!source.includes(`"${importedPreset}"`) || source.includes(`"${request.variant.name}"`)) {
        fail(request.variant.id, `${request.label} install instructions must use filename-derived preset ${importedPreset}`);
      }
    }
  }
  const serialized = requests.map(({ label, kind, path }) => ({ label, kind, path }));
  const process = spawnSync('python3', ['-c', PYTHON_PLIST_INSPECTOR], {
    input: JSON.stringify(serialized),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  if (process.error) {
    fail('plist', `could not run python3/plistlib: ${process.error.message}`);
    return;
  }
  if (process.status !== 0) {
    fail('plist', `python3/plistlib exited ${process.status}: ${(process.stderr || '').trim() || 'no error output'}`);
    return;
  }

  let results;
  try {
    results = JSON.parse(process.stdout);
  } catch (error) {
    fail('plist', `could not read python3/plistlib results: ${error.message}`);
    return;
  }
  const requestByLabel = new Map(requests.map((request) => [request.label, request]));
  for (const result of results) {
    const request = requestByLabel.get(result.label);
    if (!request) {
      fail('plist', `python3/plistlib returned unknown result ${JSON.stringify(result.label)}`);
      continue;
    }
    const variant = request.variant;
    if (!result.ok) {
      fail(variant.id, `${result.label} plist is invalid: ${result.error}`);
      continue;
    }

    if (result.kind === 'textastic') {
      const expectedMetadata = {
        name: variant.name,
        uuid: variant.textasticUuid,
        semanticClass: `theme.dark.${variant.selector}`,
      };
      for (const [key, expected] of Object.entries(expectedMetadata)) {
        if (result.metadata?.[key] !== expected) {
          fail(variant.id, `${result.label} ${key} must be ${JSON.stringify(expected)}`);
        }
      }
      const expectedColors = {
        background: variant.colors.void,
        foreground: variant.colors.crema,
        caret: variant.colors.teal,
      };
      for (const [key, expected] of Object.entries(expectedColors)) {
        if (!compareColor(result.colors?.[key], expected)) {
          fail(variant.id, `${result.label} ${key} must be ${expected}`);
        }
      }
      const expectedRules = {
        'Function — Declaration Name': variant.colors.teal,
        'Function — Call / Invocation': variant.colors.teal,
        'Function — Built-in / Support': variant.platform.slate,
        'HTML / XML — Tag Name': variant.platform.mauve,
        'Punctuation — Separator / Terminator': variant.platform.structural,
      };
      for (const [name, expected] of Object.entries(expectedRules)) {
        if (!compareColor(result.rules?.[name], expected)) {
          fail(variant.id, `${result.label} rule ${JSON.stringify(name)} must be ${expected}`);
        }
      }
    } else if (result.kind === 'xcode') {
      const expectedDirect = {
        DVTSourceTextBackground: variant.colors.void,
        DVTSourceTextInsertionPointColor: variant.colors.teal,
        DVTSourceTextSelectionColor: variant.colors.espresso,
        DVTConsoleTextBackgroundColor: variant.colors.void,
        DVTConsoleDebuggerInputTextColor: variant.colors.crema,
        DVTConsoleExectuableInputTextColor: variant.colors.crema,
      };
      for (const [key, expected] of Object.entries(expectedDirect)) {
        if (!compareColor(result.colors?.[key], expected)) {
          fail(variant.id, `${result.label} ${key} must be ${expected}`);
        }
      }
      const expectedSyntax = {
        'xcode.syntax.plain': variant.colors.crema,
        'xcode.syntax.keyword': variant.platform.mauve,
        'xcode.syntax.string': variant.platform.sage,
        'xcode.syntax.number': variant.colors.amberHot,
        'xcode.syntax.comment': variant.colors.mocha,
        'xcode.syntax.url': variant.colors.teal,
        'xcode.syntax.identifier.function': variant.colors.teal,
        'xcode.syntax.identifier.class': variant.colors.gold,
        'xcode.syntax.identifier.function.system': variant.platform.slate,
      };
      for (const [key, expected] of Object.entries(expectedSyntax)) {
        if (!compareColor(result.syntax?.[key], expected)) {
          fail(variant.id, `${result.label} ${key} must be ${expected}`);
        }
      }
    } else if (result.kind === 'iterm') {
      const expected = {
        'Background Color': variant.colors.void,
        'Foreground Color': variant.colors.crema,
        'Bold Color': variant.colors.crema,
        'Cursor Color': variant.colors.teal,
        'Cursor Text Color': variant.colors.void,
        'Selection Color': variant.colors.espresso,
        'Selected Text Color': variant.colors.crema,
      };
      ansiFor(variant).all.forEach((color, index) => { expected[`Ansi ${index} Color`] = color; });
      for (const [key, color] of Object.entries(expected)) {
        if (!compareColor(result.colors?.[key], color)) {
          fail(variant.id, `${result.label} ${key} must be ${color}`);
        }
      }
    }
  }
  if (results.length !== requests.length) {
    fail('plist', `python3/plistlib returned ${results.length} result(s) for ${requests.length} file(s)`);
  }
}

async function validateThemeModule(variant, fail) {
  const relative = `dist/themes/${variant.id}/index.js`;
  const path = join(ROOT, relative);
  let module;
  try {
    module = await import(`${pathToFileURL(path).href}?platform-validator=${Date.now()}`);
  } catch (error) {
    fail(variant.id, `${relative} could not be imported: ${error.message}`);
    return;
  }
  const metadata = module.metadata;
  if (!metadata || typeof metadata !== 'object') {
    fail(variant.id, `${relative} must export metadata`);
  } else {
    for (const key of ['id', 'displayOrder', 'name', 'selector', 'className', 'description']) {
      if (metadata[key] !== variant[key]) {
        fail(variant.id, `${relative} metadata.${key} must match the registry`);
      }
    }
    if (!isDeepStrictEqual(metadata.intent, variant.intent)) {
      fail(variant.id, `${relative} metadata.intent must match the registry`);
    }
  }
  if (!isDeepStrictEqual(module.colors, variant.colors)) {
    fail(variant.id, `${relative} colors export must exactly match the registry`);
  }
  if (!module.default || module.default.metadata !== module.metadata || module.default.colors !== module.colors) {
    fail(variant.id, `${relative} default export must expose the named metadata and colors exports`);
  }
}

function validateEffectiveTokens(variant, readArtifact, fail) {
  const relative = `dist/themes/${variant.id}/tokens.json`;
  const source = readArtifact(relative);
  if (source === null) return;
  let tokens;
  try {
    tokens = JSON.parse(source);
  } catch (error) {
    fail(variant.id, `${relative} is invalid JSON: ${error.message}`);
    return;
  }
  for (const [name, expected] of Object.entries(variant.colors)) {
    if (!compareColor(tokens.colors?.[name], expected)) {
      fail(variant.id, `${relative} colors.${name} must be ${expected}`);
    }
  }
  for (const key of ['id', 'displayOrder', 'selector', 'baseVersion', 'baseFingerprint']) {
    if (tokens.variant?.[key] !== variant[key]) {
      fail(variant.id, `${relative} variant.${key} must match the source registry`);
    }
  }
  if (!isDeepStrictEqual(tokens.variant?.platform, variant.platform)) {
    fail(variant.id, `${relative} variant.platform must match the source registry`);
  }
  if (tokens.oledScience?.status !== 'unmeasured' || Object.keys(tokens.oledScience || {}).some((key) => /DelayMs$/.test(key))) {
    fail(variant.id, `${relative} must not inherit Black Label device timing measurements`);
  }
  if (tokens.printExport?.supported !== false || Object.hasOwn(tokens.printExport || {}, 'substitutions')) {
    fail(variant.id, `${relative} must mark inferred light/print substitution unsupported`);
  }
  if (tokens.accessibility?.assignedSurfaceValidation?.surface !== variant.quality?.contrastSurface ||
      tokens.accessibility?.assignedSurfaceValidation?.minimum !== variant.quality?.minimumInformationalContrast) {
    fail(variant.id, `${relative} assigned-surface quality contract must match the source registry`);
  }
}

async function main() {
  const errors = [];
  const fail = (scope, message) => errors.push(`${scope}: ${message}`);
  const readArtifact = (relative) => {
    try {
      return readFileSync(join(ROOT, relative), 'utf8');
    } catch (error) {
      fail('artifact', `${relative} cannot be read: ${error.message}`);
      return null;
    }
  };

  let variantFiles;
  try {
    variantFiles = readdirSync(VARIANT_DIR)
      .filter((name) => name.endsWith('.json'))
      .sort((first, second) => first.localeCompare(second));
  } catch (error) {
    console.error(`FAIL: cannot read src/variants: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  if (!variantFiles.length) {
    console.error('FAIL: src/variants contains no variant registries');
    process.exitCode = 1;
    return;
  }

  const variants = [];
  for (const file of variantFiles) {
    try {
      const variant = JSON.parse(readFileSync(join(VARIANT_DIR, file), 'utf8'));
      const requiredStrings = ['id', 'name', 'shortName', 'selector', 'className', 'description', 'textasticUuid'];
      const missing = requiredStrings.filter((key) => typeof variant[key] !== 'string' || !variant[key]);
      if (missing.length || !variant.colors || !variant.platform) {
        fail(file, `registry is missing required fields: ${[...missing, ...(!variant.colors ? ['colors'] : []), ...(!variant.platform ? ['platform'] : [])].join(', ')}`);
        continue;
      }
      const requiredColors = [
        'void', 'obsidian', 'espresso', 'crema', 'bone', 'mocha', 'amber',
        'amberHot', 'gold', 'scarlet', 'teal',
      ];
      const requiredPlatform = [
        'structural', 'sage', 'slate', 'mauve', 'scarletBright', 'sageBright',
        'slateBright', 'mauveBright', 'tealBright',
      ];
      const invalidColors = requiredColors
        .filter((key) => !HEX_COLOR.test(variant.colors[key] || ''))
        .map((key) => `colors.${key}`);
      const invalidPlatform = requiredPlatform
        .filter((key) => !HEX_COLOR.test(variant.platform[key] || ''))
        .map((key) => `platform.${key}`);
      if (invalidColors.length || invalidPlatform.length) {
        fail(file, `registry has missing/invalid platform colors: ${[...invalidColors, ...invalidPlatform].join(', ')}`);
        continue;
      }
      variants.push(variant);
    } catch (error) {
      fail(file, `invalid registry JSON: ${error.message}`);
    }
  }

  for (const variant of variants) {
    validateCss(variant, readArtifact, fail);
    validateVsCode(variant, readArtifact, fail);
    validateTerminalFiles(variant, readArtifact, fail);
    validateEffectiveTokens(variant, readArtifact, fail);
  }
  validatePlists(variants.flatMap(plistRequestsFor), fail);
  await Promise.all(variants.map((variant) => validateThemeModule(variant, fail)));

  if (errors.length) {
    console.error(`FAIL: platform validation found ${errors.length} problem(s)`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: ${variants.length} companion theme(s); CSS, VS Code, plist, terminal, and ESM outputs validated`);
}

main().catch((error) => {
  console.error(`FAIL: platform validator crashed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
