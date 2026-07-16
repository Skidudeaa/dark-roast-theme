#!/usr/bin/env node
// Deterministic Cold Brew generator: authored OKLCH seeds -> gamut-mapped sRGB.
//
// Cold Brew is the first positive-polarity (light) companion. Unlike the
// hand-picked hex companions (House Blend, Copper Roast), its palette is
// authored in perceptually-uniform OKLCH in src/variants/cold-brew.seeds.json
// and compiled to the standard hex variant registry (src/variants/cold-brew.json)
// here. sRGB gamut mapping is delegated to Culori (culorijs.org) so out-of-gamut
// seeds reduce chroma deterministically instead of clipping to arbitrary hex.
//
//   node scripts/build-cold-brew.js            # regenerate src/variants/cold-brew.json
//   node scripts/build-cold-brew.js --check     # fail if the registry is out of sync
//   node scripts/build-cold-brew.js --report    # print WCAG + chroma diagnostics
//
// WCAG 2.x contrast (mirrored by Culori's wcagContrast) is the shipping gate
// enforced by validate-themes.js. This script only compiles seeds -> hex.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clampChroma, formatHex, wcagContrast, wcagLuminance } from 'culori';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_PATH = join(ROOT, 'src', 'tokens.json');
const SEEDS_PATH = join(ROOT, 'src', 'cold-brew.seeds.json');
const OUT_PATH = join(ROOT, 'src', 'variants', 'cold-brew.json');

const flags = new Set(process.argv.slice(2));
const CHECK = flags.has('--check');
const REPORT = flags.has('--report');

// Deterministic OKLCH([l,c,h]) -> #RRGGBB with sRGB gamut mapping.
// clampChroma holds lightness + hue fixed and reduces chroma until the color is
// representable in sRGB — the deterministic mapping the plan asks for.
function seedToHex(seed) {
  const [l, c, h] = seed;
  const mapped = clampChroma({ mode: 'oklch', l, c, h: c === 0 ? undefined : h }, 'oklch', 'rgb');
  return formatHex(mapped).toUpperCase();
}

function main() {
  const tokenBytes = readFileSync(TOKENS_PATH);
  const tokens = JSON.parse(tokenBytes.toString('utf8'));
  const fingerprint = `sha256:${createHash('sha256').update(tokenBytes).digest('hex')}`;
  const packageVersion = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
  const seeds = JSON.parse(readFileSync(SEEDS_PATH, 'utf8'));

  const colors = {};
  for (const [name, seed] of Object.entries(seeds.seeds.colors)) colors[name] = seedToHex(seed);
  const platform = {};
  for (const [name, seed] of Object.entries(seeds.seeds.platform)) platform[name] = seedToHex(seed);

  // Standard variant registry shape (mirrors house-blend.json) plus the
  // light-polarity metadata: polarity, targets, sourceVersion. The base pin is
  // computed live so the registry always tracks the current Black Label source.
  const variant = {
    id: seeds.id,
    displayOrder: seeds.displayOrder,
    name: seeds.name,
    shortName: seeds.shortName,
    selector: seeds.selector,
    className: seeds.className,
    version: seeds.version,
    baseVersion: tokens.version,
    baseFingerprint: fingerprint,
    polarity: seeds.polarity,
    targets: seeds.targets,
    sourceVersion: packageVersion,
    description: seeds.description,
    intent: seeds.intent,
    colors,
    platform,
    quality: seeds.quality,
    textasticUuid: seeds.textasticUuid,
  };

  const serialized = JSON.stringify(variant, null, 2) + '\n';

  if (REPORT) {
    const surface = colors[variant.quality.contrastSurface];
    const canvas = colors.void;
    const min = variant.quality.minimumInformationalContrast;
    const informational = [
      'crema', 'warmWhite', 'bone', 'mocha', 'asparagus', 'amber', 'amberHot',
      'amberMuted', 'gold', 'brass', 'scarlet', 'burntSienna', 'teal', 'magenta',
      'harvest', 'olive',
    ];
    const platformInfo = ['structural', 'sage', 'slate', 'mauve'];
    const surfaceScale = ['void', 'obsidian', 'darkCacao', 'espresso', 'espressoHover', 'roastedBean', 'crater'];
    const borderScale = ['roastedBean', 'craterDeep', 'crater'];
    console.error(`\nCold Brew report (contrastSurface=${variant.quality.contrastSurface} ${surface}, canvas ${canvas})`);
    console.error('  surface ramp (must strictly DECREASE for light polarity):');
    for (const key of surfaceScale) console.error(`    ${key.padEnd(14)} ${colors[key]}  Y=${wcagLuminance(colors[key]).toFixed(4)}`);
    console.error('  border ramp (must strictly DECREASE):');
    for (const key of borderScale) console.error(`    ${key.padEnd(14)} ${colors[key]}  Y=${wcagLuminance(colors[key]).toFixed(4)}`);
    console.error(`  informational contrast vs ${variant.quality.contrastSurface} (need >= ${min}):`);
    for (const key of [...informational, ...platformInfo]) {
      const value = key in colors ? colors[key] : platform[key];
      const ratio = wcagContrast(value, surface);
      console.error(`    ${key.padEnd(14)} ${value}  ${ratio.toFixed(2)}:1${ratio < min ? '  BELOW' : ''}`);
    }
    console.error('  action contrast vs void canvas (need >= 4.5):');
    for (const key of ['amber', 'teal', 'scarlet']) {
      const ratio = wcagContrast(colors[key], canvas);
      console.error(`    ${key.padEnd(14)} ${colors[key]}  ${ratio.toFixed(2)}:1${ratio < 4.5 ? '  BELOW' : ''}`);
    }
  }

  if (CHECK) {
    let current = null;
    try { current = readFileSync(OUT_PATH, 'utf8'); } catch {}
    if (current !== serialized) {
      console.error('✗ stale: src/variants/cold-brew.json (run `npm run build:cold-brew`)');
      process.exit(1);
    }
    console.log('✓ cold-brew.json in sync with OKLCH seeds');
    return;
  }

  writeFileSync(OUT_PATH, serialized);
  console.log(`✓ wrote src/variants/cold-brew.json (${Object.keys(colors).length} colors, ${Object.keys(platform).length} platform)`);
}

main();
