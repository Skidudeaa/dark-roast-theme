#!/usr/bin/env node
// Node's "exports" field is an allowlist: any path not listed is unreachable,
// even when the file ships inside the tarball. Before this check, 8 generated
// stylesheets and 4 theme modules (cascara, flash-chilled, night-shift, nitro)
// were built and published but could not be imported at all — which is why the
// somaCura skin hand-copied the Night Shift palette instead of consuming it.
//
// Three invariants:
//   1. Reachable — every consumer-facing artifact has an export entry.
//   2. Resolvable — every export entry points at a file that exists.
//   3. Shipped — every export target is covered by package.json "files".

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const entries = Object.entries(pkg.exports).map(([subpath, value]) => [
  subpath,
  typeof value === 'string' ? value : value.default,
]);
const targets = new Set(entries.map(([, target]) => target));

// Conditional exports may also declare a "types" path. It is not a subpath of
// its own, but a dangling one silently breaks TypeScript consumers.
const typePaths = Object.entries(pkg.exports)
  .filter(([, value]) => typeof value === 'object' && value.types)
  .map(([subpath, value]) => [subpath, value.types]);

const failures = [];

// ── 1. Reachable ────────────────────────────────────────────
// Consumer-facing artifacts, by directory and extension.
const required = [];
const collect = (relDir, filter) => {
  const abs = join(ROOT, relDir);
  if (!existsSync(abs)) return;
  for (const name of readdirSync(abs)) {
    const rel = `${relDir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) continue;
    if (filter(name)) required.push(`./${rel}`);
  }
};

collect('dist/css', (n) => n.endsWith('.css'));
collect('dist/tokens', (n) => n.endsWith('.js'));
collect('src/skins', (n) => n.endsWith('.css'));
// dist/system carries the doctrine contract. Declaration files are reached via
// a "types" condition rather than their own subpath, so they are not required
// here — they are checked for existence below instead.
collect('dist/system', (n) => n.endsWith('.js') || n.endsWith('.json'));

const themesDir = join(ROOT, 'dist', 'themes');
if (existsSync(themesDir)) {
  for (const name of readdirSync(themesDir)) {
    if (!statSync(join(themesDir, name)).isDirectory()) continue;
    required.push(`./dist/themes/${name}/index.js`);
    required.push(`./dist/themes/${name}/tokens.json`);
  }
}

for (const rel of required) {
  if (!targets.has(rel)) failures.push(`unreachable: ${rel} is built but has no "exports" entry`);
}

// ── 2. Resolvable ───────────────────────────────────────
for (const [subpath, target] of entries) {
  if (!existsSync(join(ROOT, target))) {
    failures.push(`dangling: "${subpath}" points at ${target}, which does not exist`);
  }
}
for (const [subpath, types] of typePaths) {
  if (!existsSync(join(ROOT, types))) {
    failures.push(`dangling types: "${subpath}" declares ${types}, which does not exist`);
  }
}

// ── 3. Shipped ──────────────────────────────────────────────
const shipped = (rel) =>
  pkg.files.some((f) => (f.endsWith('/') ? rel.startsWith(f) : rel === f));

for (const [subpath, target] of entries) {
  const rel = target.replace(/^\.\//, '');
  if (!shipped(rel)) {
    failures.push(`not shipped: "${subpath}" -> ${rel} is excluded by package.json "files"`);
  }
}

if (failures.length) {
  console.error(`FAIL exports (${failures.length} problem${failures.length === 1 ? '' : 's'})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('A generated artifact that consumers cannot import is a silent invitation to copy it by hand.');
  process.exit(1);
}

console.log(
  `PASS exports: ${entries.length} subpath(s) resolve and ship; ${required.length} generated artifact(s) reachable`,
);
