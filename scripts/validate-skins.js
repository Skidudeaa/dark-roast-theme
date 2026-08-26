#!/usr/bin/env node
// Skins are product-facing consumers of a Dark Roast companion (e.g. the
// somaCura census UI on Night Shift). A skin legitimately owns product-specific
// values, but it must never re-declare a value the theme already owns.
//
// That distinction is not academic. The espresso widening in 9a40e50
// (#21160F -> #251A11) never reached somaCura, because the skin had copied the
// old literal instead of referencing the token. This check makes that class of
// silent divergence impossible.
//
// Invariants, per skin in src/skins/:
//   1. No hex literal may equal a color token of the skin's target theme.
//      Use var(--dr-*) instead so the theme remains the single source of truth.
//   2. Every var(--dr-*) reference must resolve to a custom property the
//      target theme actually declares.
//   3. The skin must be reachable through package.json "exports".
//
// Target theme is derived from the skin filename: the longest src/variants/*.json
// id contained in the basename wins (somacura-night-shift -> night-shift).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIN_DIR = join(ROOT, 'src', 'skins');

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

if (!existsSync(SKIN_DIR)) {
  console.log('PASS skins: no src/skins/ directory; nothing to validate');
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const exportTargets = new Set(
  Object.values(pkg.exports).map((v) => (typeof v === 'string' ? v : v.default)),
);

const variantIds = readdirSync(join(ROOT, 'src', 'variants'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => basename(f, '.json'))
  .sort((a, b) => b.length - a.length);

const skins = readdirSync(SKIN_DIR).filter((f) => f.endsWith('.css'));
const failures = [];
let checkedVars = 0;
let mappedVars = 0;

for (const file of skins) {
  const label = `src/skins/${file}`;
  const css = readFileSync(join(SKIN_DIR, file), 'utf8');

  if (!exportTargets.has(`./${label}`)) {
    failures.push(`${label}: not reachable — add "./skins/${basename(file, '.css')}" to package.json exports`);
  }

  const themeId = variantIds.find((id) => basename(file, '.css').includes(id));
  if (!themeId) {
    failures.push(`${label}: cannot infer target theme; basename must contain a src/variants/*.json id`);
    continue;
  }

  const themeCssPath = join(ROOT, 'dist', 'css', `dark-roast-${themeId}.css`);
  const tokensPath = join(ROOT, 'dist', 'themes', themeId, 'tokens.json');
  if (!existsSync(themeCssPath) || !existsSync(tokensPath)) {
    failures.push(`${label}: target theme "${themeId}" has no generated output; run \`npm run build\``);
    continue;
  }

  // Custom properties the theme actually declares.
  const declared = new Set(
    [...readFileSync(themeCssPath, 'utf8').matchAll(/(--dr-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  );

  // Token values, indexed by uppercase hex, so a duplicated literal is findable.
  const colors = JSON.parse(readFileSync(tokensPath, 'utf8')).colors;
  const byHex = new Map();
  for (const [name, value] of Object.entries(colors)) {
    if (name.startsWith('_') || typeof value !== 'string') continue;
    if (/^#[0-9a-fA-F]{6}$/.test(value)) byHex.set(value.toUpperCase(), kebab(name));
  }

  // Invariant 1: no literal may duplicate a token value.
  for (const [, hex] of css.matchAll(/(#[0-9a-fA-F]{6})\b/g)) {
    const token = byHex.get(hex.toUpperCase());
    if (token) {
      failures.push(
        `${label}: literal ${hex} duplicates ${themeId} token --dr-${token}; use var(--dr-${token})`,
      );
    }
  }

  // Invariant 2: every --dr-* reference must resolve.
  for (const [, name] of css.matchAll(/var\(\s*(--dr-[a-z0-9-]+)/g)) {
    checkedVars += 1;
    if (declared.has(name)) mappedVars += 1;
    else failures.push(`${label}: var(${name}) is not declared by ${themeId}`);
  }
}

if (failures.length) {
  console.error(`FAIL skins (${failures.length} problem${failures.length === 1 ? '' : 's'})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('A skin may own product-specific values, but never a copy of a theme token.');
  process.exit(1);
}

console.log(
  `PASS ${skins.length} skin(s); ${mappedVars}/${checkedVars} token reference(s) resolved, no duplicated literals`,
);
