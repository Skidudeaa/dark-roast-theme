#!/usr/bin/env node
// Starter page proof.
//
// starter/ is what `dark-roast-theme init` copies into a fresh project. If it
// drifts from the contract, every new adoption starts wrong. This gate runs the
// shipped CLI exactly as a consumer would, then holds the product stylesheet
// to the same discipline as the kernel fixtures.

import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import postcss from 'postcss';

import {
  forbiddenDomainTerms,
  primitiveContracts,
  recipeContracts,
  semanticRoleVariables,
} from '../dist/system/contract.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STARTER = join(ROOT, 'starter');
const CLI = join(ROOT, 'bin', 'dark-roast-theme.js');
const THEME_DIR = join(STARTER, 'theme');
const failures = [];
const fail = (message) => failures.push(message);

function cli(args, cwd = ROOT) {
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

// ── 1. Generated assets: write (gitignored), then verify like a consumer ──
const write = cli(['assets', 'starter/theme']);
if (write.status !== 0) fail(`assets write failed:\n${write.output}`);
const check = cli(['assets', 'starter/theme', '--check']);
if (check.status !== 0 || !check.output.includes('PASS')) {
  fail(`assets --check failed:\n${check.output}`);
}
for (const name of ['dark-roast.css', 'oi-system.css', 'oi-mapping-dark-roast.css', 'dark-roast-assets.json']) {
  if (!existsSync(join(THEME_DIR, name))) fail(`starter/theme/${name} was not generated`);
}
const manifest = JSON.parse(readFileSync(join(THEME_DIR, 'dark-roast-assets.json'), 'utf8'));
const packageVersion = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
if (manifest.packageVersion !== packageVersion) {
  fail(`asset manifest records package ${manifest.packageVersion}, expected ${packageVersion}`);
}

// ── 2. The shipped checker passes the starter page ──
const conformance = cli(['check', 'starter/index.html']);
if (conformance.status !== 0 || !/PASS starter\/index\.html: \d+ primitive root\(s\), 1 recipe root\(s\)/.test(conformance.output)) {
  fail(`check starter/index.html did not pass:\n${conformance.output}`);
}

// ── 3. The checker fails closed on a broken copy of the starter ──
const html = readFileSync(join(STARTER, 'index.html'), 'utf8');
{
  const broken = html.replace('role="status"', '');
  if (broken === html) fail('starter status slot mutation did not apply');
  const temporary = mkdtempSync(join(tmpdir(), 'oi-starter-'));
  try {
    const path = join(temporary, 'broken.html');
    const { writeFileSync } = await import('node:fs');
    writeFileSync(path, broken);
    const result = cli(['check', path]);
    if (result.status === 0 || !result.output.includes('[attribute-required]')) {
      fail(`check must reject a starter page without role="status":\n${result.output}`);
    }
  } finally {
    const resolved = resolve(temporary);
    if (!resolved.startsWith(`${resolve(tmpdir())}${sep}oi-starter-`)) {
      throw new Error(`refusing to remove unexpected temporary path: ${resolved}`);
    }
    rmSync(resolved, { recursive: true, force: true });
  }
}

// ── 4. init scaffolds a working project into an empty directory ──
{
  const temporary = mkdtempSync(join(tmpdir(), 'oi-starter-init-'));
  try {
    const init = cli(['init', join(temporary, 'ui'), '--theme', 'night-shift']);
    if (init.status !== 0) fail(`init failed:\n${init.output}`);
    const scaffolded = join(temporary, 'ui');
    for (const name of ['index.html', 'starter.css', 'README.md', 'theme/dark-roast.css', 'theme/oi-system.css', 'theme/oi-mapping-dark-roast.css', 'theme/dark-roast-assets.json']) {
      if (!existsSync(join(scaffolded, name))) fail(`init did not write ${name}`);
    }
    const page = readFileSync(join(scaffolded, 'index.html'), 'utf8');
    if (!page.includes('<body class="dark-roast-night-shift oi-root"')) {
      fail('init --theme night-shift must rewrite the body class');
    }
    const initCheck = cli(['check', join(scaffolded, 'index.html')]);
    if (initCheck.status !== 0) fail(`scaffolded page failed check:\n${initCheck.output}`);
    const assetsCheck = cli(['assets', join(scaffolded, 'theme'), '--theme', 'night-shift', '--check']);
    if (assetsCheck.status !== 0) fail(`scaffolded assets failed --check:\n${assetsCheck.output}`);
    const refuse = cli(['init', join(temporary, 'ui')]);
    if (refuse.status === 0 || !refuse.output.includes('--force')) {
      fail('init must refuse to overwrite an existing starter without --force');
    }
  } finally {
    const resolved = resolve(temporary);
    if (!resolved.startsWith(`${resolve(tmpdir())}${sep}oi-starter-init-`)) {
      throw new Error(`refusing to remove unexpected temporary path: ${resolved}`);
    }
    rmSync(resolved, { recursive: true, force: true });
  }
}

// ── 5. Stylesheet order and mapping wrapper in the page ──
const document = parse(html);
const elements = [];
const visit = (node) => {
  if (typeof node.tagName === 'string') elements.push(node);
  for (const child of node.childNodes ?? []) visit(child);
};
visit(document);
const attribute = (node, name) => node.attrs?.find((entry) => entry.name === name)?.value;
const links = elements
  .filter((node) => node.tagName === 'link' && (attribute(node, 'rel') ?? '').split(/\s+/).includes('stylesheet'))
  .map((node) => attribute(node, 'href'));
const expectedLinks = ['./theme/dark-roast.css', './theme/oi-system.css', './theme/oi-mapping-dark-roast.css', './starter.css'];
if (JSON.stringify(links) !== JSON.stringify(expectedLinks)) {
  fail(`starter stylesheet order must be ${expectedLinks.join(' -> ')}; found ${links.join(' -> ')}`);
}
const body = elements.find((node) => node.tagName === 'body');
if (!body || attribute(body, 'class') !== 'dark-roast oi-root') {
  fail('starter body must carry exactly class="dark-roast oi-root" so init can rewrite it');
}

// ── 6. Product CSS discipline: one product layer, roles only, no palette ──
const publicVariables = new Set([
  ...semanticRoleVariables,
  ...Object.values(primitiveContracts).flatMap((contract) => contract.publicHooks),
  ...Object.values(recipeContracts).flatMap((contract) => contract.publicHooks ?? []),
]);
const cssPath = join(STARTER, 'starter.css');
const css = readFileSync(cssPath, 'utf8');
let cssRoot;
try {
  cssRoot = postcss.parse(css, { from: cssPath });
} catch (error) {
  fail(`starter.css parse error: ${error.reason ?? error.message}`);
}
if (cssRoot) {
  const substantive = cssRoot.nodes.filter((node) => node.type !== 'comment');
  if (
    substantive.length !== 1 ||
    substantive[0].type !== 'atrule' ||
    substantive[0].name !== 'layer' ||
    substantive[0].params.trim() !== 'product'
  ) {
    fail('starter.css must be exactly one @layer product block');
  }
  cssRoot.walkDecls((declaration) => {
    const where = `starter/starter.css:${declaration.source?.start?.line ?? '?'}`;
    if (declaration.prop.startsWith('--dr-') || /--dr-[a-z0-9-]+/i.test(declaration.value)) {
      fail(`${where} references --dr-*; product CSS reads --oi-* roles only`);
    }
    for (const reference of declaration.value.match(/--oi-[a-z0-9-]+/g) ?? []) {
      if (!publicVariables.has(reference)) fail(`${where} references undocumented ${reference}`);
    }
    if (declaration.prop.startsWith('--oi-') && !publicVariables.has(declaration.prop)) {
      fail(`${where} defines undocumented ${declaration.prop}`);
    }
    if (
      /#[0-9a-f]{3,8}\b/i.test(declaration.value) ||
      /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i.test(declaration.value)
    ) {
      fail(`${where} hardcodes a raw color`);
    }
  });
}

// ── 7. The starter is generic kernel material ──
const scannable = `${html}\n${css}\n${readFileSync(join(STARTER, 'README.md'), 'utf8')}`.toLowerCase();
for (const term of forbiddenDomainTerms) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`\\b${escaped}\\b`, 'i').test(scannable)) {
    fail(`starter contains forbidden domain term "${term}"`);
  }
}

if (failures.length) {
  console.error(`FAIL starter (${failures.length} problem${failures.length === 1 ? '' : 's'})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `PASS starter: assets regenerated and verified, page conforms via the shipped CLI, init scaffolds a checked project, product CSS reads roles only (${relative(ROOT, cssPath)})`,
);
