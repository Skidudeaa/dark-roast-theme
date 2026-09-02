#!/usr/bin/env node
// dark-roast-theme command line.
//
// The first consumer of the operational interface kernel had to hand-write an
// asset copier, a manifest check, and a DOM validator before its first page
// could be trusted. Those three chores are the whole job of a fresh adoption,
// so the package now ships them:
//
//   dark-roast-theme init   <dir>   scaffold a starter page and its stylesheets
//   dark-roast-theme assets <dir>   copy the palette, system, and mapping CSS
//   dark-roast-theme check  <html>  report Operational Interface conformance
//
// Zero runtime dependencies. `check` needs parse5 in the consumer's project
// because Node has no HTML parser; it says so instead of failing obscurely.

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'));
const { CONTRACT_VERSION } = await import(
  new URL('../dist/system/contract.js', import.meta.url).href
);

const MANIFEST_NAME = 'dark-roast-assets.json';
const DEFAULT_THEME = 'black-label';
const STARTER_FILES = ['index.html', 'starter.css', 'README.md'];

const HELP = `dark-roast-theme ${packageJson.version} (doctrine ${CONTRACT_VERSION})

Usage
  dark-roast-theme init <dir> [--theme <id>] [--force]
      Scaffold a starter page (index.html, starter.css, README.md) into <dir>
      and copy the stylesheets into <dir>/theme. Refuses to overwrite files
      unless --force is given.

  dark-roast-theme assets <dir> [--theme <id>] [--check]
      Copy the palette, operational-interface system, and Dark Roast mapping
      stylesheets into <dir> with a ${MANIFEST_NAME} manifest. --check
      exits 1 if the directory is missing or differs from the package.

  dark-roast-theme check <file.html> [...]
      Parse each page and report Operational Interface conformance findings.
      Requires parse5 in your project: npm install --save-dev parse5

  dark-roast-theme themes
      List theme ids accepted by --theme.

  dark-roast-theme --version | --help
`;

function fail(message) {
  console.error(`dark-roast-theme: ${message}`);
  process.exit(2);
}

function parseArguments(argv) {
  const positional = [];
  const flags = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) {
      positional.push(argument);
      continue;
    }
    const name = argument.slice(2);
    if (name === 'theme') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) fail('--theme requires a theme id; run `dark-roast-theme themes`');
      flags.set(name, value);
      index += 1;
      continue;
    }
    if (['check', 'force', 'help', 'version'].includes(name)) {
      flags.set(name, true);
      continue;
    }
    fail(`unknown option --${name}`);
  }
  return { positional, flags };
}

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

// ── themes ──────────────────────────────────────────────────
function themeIds() {
  const ids = [DEFAULT_THEME];
  for (const name of readdirSync(join(PACKAGE_ROOT, 'dist', 'css')).sort()) {
    const match = /^dark-roast-([a-z0-9-]+)\.css$/.exec(name);
    if (match && match[1] !== 'scoped' && !match[1].endsWith('-scoped')) ids.push(match[1]);
  }
  return ids;
}

function themeStylesheet(theme) {
  if (!themeIds().includes(theme)) {
    fail(`unknown theme "${theme}"; expected one of ${themeIds().join(', ')}`);
  }
  return theme === DEFAULT_THEME ? 'dist/css/dark-roast.css' : `dist/css/dark-roast-${theme}.css`;
}

function themeBodyClass(theme) {
  return theme === DEFAULT_THEME ? 'dark-roast' : `dark-roast-${theme}`;
}

// ── assets ──────────────────────────────────────────────────
function assetPlan(theme) {
  return {
    'dark-roast.css': themeStylesheet(theme),
    'oi-system.css': 'dist/system/index.css',
    'oi-mapping-dark-roast.css': 'dist/system/mappings/dark-roast.css',
  };
}

function buildAssets(theme) {
  const files = {};
  const contents = {};
  for (const [name, source] of Object.entries(assetPlan(theme))) {
    const bytes = readFileSync(join(PACKAGE_ROOT, source));
    if (!bytes.length) fail(`${source} is empty in the installed package`);
    contents[name] = bytes;
    files[name] = { source, sha256: sha256(bytes) };
  }
  const manifest = {
    generator: 'dark-roast-theme',
    packageVersion: packageJson.version,
    contractVersion: CONTRACT_VERSION,
    theme,
    bodyClass: `${themeBodyClass(theme)} oi-root`,
    files,
  };
  contents[MANIFEST_NAME] = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return contents;
}

function assets(directory, { theme, check }) {
  const target = resolve(directory);
  const expected = buildAssets(theme);
  if (check) {
    const stale = [];
    for (const [name, bytes] of Object.entries(expected)) {
      const path = join(target, name);
      if (!existsSync(path) || !readFileSync(path).equals(bytes)) stale.push(name);
    }
    if (stale.length) {
      console.error(
        `FAIL ${relative(process.cwd(), target) || '.'}: ${stale.length} stale or missing asset(s): ${stale.join(', ')}\n` +
          `Run: dark-roast-theme assets ${relative(process.cwd(), target) || '.'}${theme === DEFAULT_THEME ? '' : ` --theme ${theme}`}`,
      );
      process.exit(1);
    }
    console.log(
      `PASS ${relative(process.cwd(), target) || '.'}: ${Object.keys(expected).length} asset(s) match dark-roast-theme ${packageJson.version} (${theme})`,
    );
    return;
  }
  mkdirSync(target, { recursive: true });
  for (const [name, bytes] of Object.entries(expected)) writeFileSync(join(target, name), bytes);
  console.log(
    `WROTE ${Object.keys(expected).length} file(s) to ${relative(process.cwd(), target) || '.'} from dark-roast-theme ${packageJson.version} (${theme})`,
  );
  console.log(linkSnippet(relative(process.cwd(), target) || '.'));
}

function linkSnippet(prefix) {
  const base = prefix.replace(/\\/g, '/').replace(/\/$/, '');
  return [
    'Link them in this order, before your own stylesheet:',
    `  <link rel="stylesheet" href="${base}/dark-roast.css">`,
    `  <link rel="stylesheet" href="${base}/oi-system.css">`,
    `  <link rel="stylesheet" href="${base}/oi-mapping-dark-roast.css">`,
  ].join('\n');
}

// ── init ────────────────────────────────────────────────────
function init(directory, { theme, force }) {
  const target = resolve(directory);
  const starterRoot = join(PACKAGE_ROOT, 'starter');
  const bodyClass = `${themeBodyClass(theme)} oi-root`;
  const collisions = STARTER_FILES.filter((name) => existsSync(join(target, name)));
  if (collisions.length && !force) {
    fail(`${collisions.join(', ')} already exist in ${target}; pass --force to overwrite`);
  }
  mkdirSync(target, { recursive: true });
  for (const name of STARTER_FILES) {
    let contents = readFileSync(join(starterRoot, name), 'utf8');
    if (name === 'index.html') {
      contents = contents.replace('<body class="dark-roast oi-root"', `<body class="${bodyClass}"`);
    }
    writeFileSync(join(target, name), contents);
  }
  assets(join(target, 'theme'), { theme, check: false });
  console.log(
    `\nStarter written to ${relative(process.cwd(), target) || '.'}. Open index.html with any static server, then run:\n` +
      `  dark-roast-theme check ${join(relative(process.cwd(), target) || '.', 'index.html')}`,
  );
}

// ── check ───────────────────────────────────────────────────
async function loadParse5() {
  try {
    return await import('parse5');
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      fail('`check` needs parse5 to read HTML. Install it in your project: npm install --save-dev parse5');
    }
    throw error;
  }
}

async function check(files) {
  if (files.length === 0) fail('check requires at least one HTML file');
  const { parse } = await loadParse5();
  const { checkConformance, fromParse5, formatFindings } = await import(
    new URL('../dist/system/conformance.js', import.meta.url).href
  );
  let failures = 0;
  for (const file of files) {
    const path = resolve(file);
    if (!existsSync(path) || !statSync(path).isFile()) fail(`${file} is not a file`);
    const label = relative(process.cwd(), path) || basename(path);
    const parseErrors = [];
    const document = parse(readFileSync(path, 'utf8'), {
      sourceCodeLocationInfo: true,
      onParseError: (error) => parseErrors.push(error),
    });
    const report = checkConformance(fromParse5(document));
    const lines = [
      ...parseErrors.map(
        (error) => `${label}:${error.startLine}:${error.startCol} [html-parse] ${error.code}`,
      ),
      ...formatFindings(report.findings, label),
    ];
    if (lines.length) {
      failures += 1;
      console.error(`FAIL ${label}: ${lines.length} finding(s)`);
      for (const line of lines) console.error(`  - ${line}`);
      continue;
    }
    console.log(
      `PASS ${label}: ${report.primitives} primitive root(s), ${report.recipes} recipe root(s) conform to doctrine ${CONTRACT_VERSION}`,
    );
  }
  if (failures) process.exit(1);
}

// ── dispatch ────────────────────────────────────────────────
const { positional, flags } = parseArguments(process.argv.slice(2));
const [command, ...rest] = positional;
const theme = flags.get('theme') ?? DEFAULT_THEME;

if (flags.has('version')) {
  console.log(packageJson.version);
} else if (flags.has('help') || !command) {
  console.log(HELP);
} else if (command === 'themes') {
  console.log(themeIds().join('\n'));
} else if (command === 'assets') {
  if (rest.length !== 1) fail('assets requires exactly one target directory');
  assets(rest[0], { theme, check: flags.has('check') });
} else if (command === 'init') {
  if (rest.length !== 1) fail('init requires exactly one target directory');
  init(rest[0], { theme, force: flags.has('force') });
} else if (command === 'check') {
  await check(rest);
} else {
  fail(`unknown command "${command}"\n\n${HELP}`);
}
