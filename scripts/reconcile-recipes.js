#!/usr/bin/env node
// Compile src/recipes/*.json into companion registries under src/variants/.
//
//   node scripts/reconcile-recipes.js          # write brewed registries
//   node scripts/reconcile-recipes.js --check  # fail when a registry has drifted
//   node scripts/reconcile-recipes.js --adopt  # claim registries brewed before
//                                              # provenance tracking existed
//
// Only registries this script owns are ever written. Companions authored by
// hand (house-blend, copper-roast, velvet) or compiled by a different generator
// (cold-brew, via scripts/build-cold-brew.js from src/cold-brew.seeds.json) are
// refused, because a recipe of the same id silently overwrote Cold Brew's
// shipped palette once already.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { generatePalette } from '../lib/brew-engine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RECIPES_DIR = join(ROOT, 'src/recipes');
const VARIANTS_DIR = join(ROOT, 'src/variants');
const TOKENS_PATH = join(ROOT, 'src/tokens.json');
const GENERATOR = 'brew-engine';

const check = process.argv.includes('--check');
// One-time migration: registries brewed before provenance tracking carry no
// `generator` field. --adopt claims those, and only those — a registry marked
// with a different generator is still refused.
const adopt = process.argv.includes('--adopt');
const tokenBytes = readFileSync(TOKENS_PATH);
const tokens = JSON.parse(tokenBytes.toString('utf8'));
const fingerprint = `sha256:${createHash('sha256').update(tokenBytes).digest('hex')}`;
const packageVersion = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

// Stable UUIDv5 (RFC 4122, SHA-1 over a fixed namespace) so a registry's
// Textastic identity never changes between runs. A random UUID would rewrite
// the committed file — and every generated .tmTheme — on every brew.
const UUID_NAMESPACE = 'dark-roast-theme/brew-engine';
function deterministicUuid(id) {
  const digest = createHash('sha1').update(`${UUID_NAMESPACE}:${id}`).digest();
  const bytes = Buffer.from(digest.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = bytes.toString('hex');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

const recipes = readdirSync(RECIPES_DIR).filter((file) => file.endsWith('.json')).sort();
let stale = 0;
let refused = 0;

for (const file of recipes) {
  const recipe = JSON.parse(readFileSync(join(RECIPES_DIR, file), 'utf8'));
  const outPath = join(VARIANTS_DIR, `${recipe.id}.json`);

  if (existsSync(outPath)) {
    const existing = JSON.parse(readFileSync(outPath, 'utf8'));
    const unclaimed = existing.generator === undefined && adopt;
    if (existing.generator !== GENERATOR && !unclaimed) {
      console.error(
        `✗ refusing to overwrite src/variants/${recipe.id}.json: it is owned by ` +
          `${existing.generator ? `"${existing.generator}"` : 'another author'}, not ${GENERATOR}. ` +
          `Remove src/recipes/${file} or rename the recipe id.`,
      );
      refused += 1;
      continue;
    }
  }

  const variant = generatePalette(recipe);
  variant.generator = GENERATOR;
  variant.version = packageVersion;
  variant.shortName = recipe.name.includes(':') ? recipe.name.split(':')[1].trim() : recipe.name;
  variant.baseVersion = tokens.version;
  variant.baseFingerprint = fingerprint;
  variant.selector = `dark-roast-${variant.id}`;
  variant.className = `dark-roast-${variant.id}`;
  variant.sourceVersion = packageVersion;
  variant.targets = recipe.targets || ['web', 'editor', 'terminal', 'native'];
  variant.textasticUuid = deterministicUuid(variant.id).toUpperCase();

  const serialized = JSON.stringify(variant, null, 2) + '\n';
  if (check) {
    let current = null;
    try { current = readFileSync(outPath, 'utf8'); } catch {}
    if (current !== serialized) {
      stale += 1;
      console.error(`✗ stale: src/variants/${variant.id}.json (run \`npm run brew\`)`);
    }
  } else {
    writeFileSync(outPath, serialized);
    console.log(`✓ brewed ${variant.id} -> src/variants/${variant.id}.json`);
  }
}

if (refused) process.exitCode = 1;
if (check && stale) {
  console.error(`\n${stale} brewed registry file(s) out of sync. Run \`npm run brew\`.`);
  process.exitCode = 1;
} else if (check && !refused) {
  console.log(`✓ ${recipes.length} brewed registr${recipes.length === 1 ? 'y' : 'ies'} in sync`);
}
