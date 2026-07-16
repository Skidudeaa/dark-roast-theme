#!/usr/bin/env node
// Keep the hand-authored acceptance gallery tied to companion source tokens.
// The browser cannot import local JSON from file://, so platform-only syntax
// and ANSI values are copied into the page and must be guarded against drift.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const gallery = readFileSync(join(ROOT, 'spec', 'theme-gallery.html'), 'utf8');
const variants = readdirSync(join(ROOT, 'src', 'variants'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(ROOT, 'src', 'variants', file), 'utf8')))
  .sort((first, second) => first.displayOrder - second.displayOrder);

const EXTENSION_ROLES = {
  '--spec-structural': ['platform', 'structural'],
  '--spec-sage': ['platform', 'sage'],
  '--spec-slate': ['platform', 'slate'],
  '--spec-mauve': ['platform', 'mauve'],
  '--spec-scarlet-bright': ['platform', 'scarletBright'],
  '--spec-sage-bright': ['platform', 'sageBright'],
  '--spec-slate-bright': ['platform', 'slateBright'],
  '--spec-mauve-bright': ['platform', 'mauveBright'],
  '--spec-teal-bright': ['platform', 'tealBright'],
  '--spec-function': ['colors', 'teal'],
  '--spec-punctuation': ['platform', 'structural'],
};

const errors = [];
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const variant of variants) {
  const stylesheet = `../dist/css/dark-roast-${variant.id}-scoped.css`;
  if (!gallery.includes(`href="${stylesheet}"`)) {
    errors.push(`${variant.id}: gallery must load ${stylesheet}`);
  }
  if (!gallery.includes(`data-theme-row="${variant.selector}"`)) {
    errors.push(`${variant.id}: gallery is missing its opaque palette proof row`);
  }
  if (!gallery.includes(`<option value="${variant.selector}">${variant.shortName}</option>`)) {
    errors.push(`${variant.id}: gallery theme selectors are missing ${variant.shortName}`);
  }

  const blockPattern = new RegExp(
    `\\[data-theme="${escapeRegExp(variant.selector)}"\\]\\s*\\{([\\s\\S]*?)\\n\\s*\\}`,
  );
  const block = gallery.match(blockPattern)?.[1];
  if (!block) {
    errors.push(`${variant.id}: gallery is missing its platform-extension variable block`);
    continue;
  }

  for (const [property, [group, key]] of Object.entries(EXTENSION_ROLES)) {
    const actual = block.match(new RegExp(`${escapeRegExp(property)}\\s*:\\s*(#[0-9A-Fa-f]{6})\\s*;`))?.[1];
    const expected = variant[group][key];
    if (!actual) errors.push(`${variant.id}: gallery is missing ${property}`);
    else if (actual.toUpperCase() !== expected.toUpperCase()) {
      errors.push(`${variant.id}: gallery ${property} is ${actual}, expected ${expected}`);
    }
  }
}

const linkedCompanions = [...gallery.matchAll(/dark-roast-([a-z-]+)-scoped\.css/g)].map((match) => match[1]);
const expectedCompanions = variants.map((variant) => variant.id);
for (const id of linkedCompanions) {
  if (!expectedCompanions.includes(id)) errors.push(`gallery loads stale or unknown companion ${id}`);
}

if (errors.length) {
  console.error(`FAIL gallery validation (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `PASS gallery: ${variants.length} companions; ` +
      `${variants.length * Object.keys(EXTENSION_ROLES).length} platform/syntax values match source`,
  );
}
