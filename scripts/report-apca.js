#!/usr/bin/env node
// APCA (Lc) contrast report for the Dark Roast theme family — REPORT ONLY.
//
// WCAG 2.x is the shipping gate (see validate-themes.js). APCA Lc is a modern
// perceptual contrast model; this script emits a signed Lc report using the
// pinned apca-w3 implementation so reviewers can inspect perceptual headroom,
// especially for the light-polarity Cold Brew where WCAG ratios are known to be
// a coarse proxy. It NEVER fails the build and NEVER overrides a WCAG result.
//
//   node scripts/report-apca.js         # write reports/apca.{json,md}
//
// Lc sign convention (apca-w3): positive = dark text on light background
// (light themes), negative = light text on dark background (dark themes). The
// report uses |Lc| against APCA "bronze" guidance: >=75 small text, >=60 body,
// >=45 large/bold, >=30 non-text/disabled.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calcAPCA } from 'apca-w3';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(readFileSync(join(ROOT, 'src', 'tokens.json'), 'utf8'));
const variantFiles = ['house-blend', 'copper-roast', 'cold-brew'];

// Lc = APCA contrast of text on background. Returns a signed number.
function lc(text, bg) {
  return Number(calcAPCA(text, bg).toFixed(1));
}

function tierFor(absLc) {
  if (absLc >= 75) return 'small-text';
  if (absLc >= 60) return 'body-text';
  if (absLc >= 45) return 'large-text';
  if (absLc >= 30) return 'non-text';
  return 'below-30';
}

// Representative role pairs. `on` names a surface color key; text names a
// foreground/accent color key. Platform keys are prefixed `platform.`.
const PAIRS = [
  ['primary text (crema)', 'crema', 'void'],
  ['reading text (bone)', 'bone', 'void'],
  ['secondary text (mocha)', 'mocha', 'void'],
  ['tertiary (asparagus)', 'asparagus', 'void'],
  ['structural', 'platform.structural', 'void'],
  ['accent (amber)', 'amber', 'void'],
  ['success/live (teal)', 'teal', 'void'],
  ['critical (scarlet)', 'scarlet', 'void'],
  ['stable (gold)', 'gold', 'void'],
  ['severity worsening (magenta)', 'magenta', 'void'],
  ['severity improving (harvest)', 'harvest', 'void'],
  ['severity stable (olive)', 'olive', 'void'],
  ['accent on elevated (amber/darkCacao)', 'amber', 'darkCacao'],
  ['primary on elevated (crema/darkCacao)', 'crema', 'darkCacao'],
];

function resolve(theme, key) {
  if (key.startsWith('platform.')) return theme.platform[key.slice('platform.'.length)];
  return theme.colors[key];
}

function themeReport(id, theme, polarity) {
  const rows = PAIRS.map(([label, textKey, bgKey]) => {
    const text = resolve(theme, textKey);
    const bg = resolve(theme, bgKey);
    if (!text || !bg) return null;
    const value = lc(text, bg);
    return { label, text, bg, lc: value, abs: Math.abs(value), tier: tierFor(Math.abs(value)) };
  }).filter(Boolean);
  return { id, polarity, rows };
}

const reports = [
  themeReport('black-label', { colors: base.colors, platform: { structural: base.colors.crater } }, 'dark'),
];
for (const file of variantFiles) {
  const variant = JSON.parse(readFileSync(join(ROOT, 'src', 'variants', `${file}.json`), 'utf8'));
  reports.push(themeReport(variant.id, variant, variant.polarity || 'dark'));
}

const generatedFrom = `dark-roast-theme@${JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version}`;
const apcaVersion = JSON.parse(readFileSync(join(ROOT, 'node_modules', 'apca-w3', 'package.json'), 'utf8')).version;
const payload = {
  _note: 'APCA Lc report — informational only. WCAG 2.x remains the shipping gate.',
  generatedFrom,
  apcaImplementation: `apca-w3@${apcaVersion}`,
  signConvention: 'positive Lc = dark text on light bg; negative = light text on dark bg',
  themes: reports,
};
writeFileSync(join(ROOT, 'reports', 'apca.json'), JSON.stringify(payload, null, 2) + '\n');

const md = [];
md.push('# APCA Lc report (informational)');
md.push('');
md.push(`Generated from \`${generatedFrom}\` using \`apca-w3@${apcaVersion}\`.`);
md.push('');
md.push('**WCAG 2.x is the shipping gate.** APCA Lc is reported for perceptual insight only and never overrides a WCAG result. Sign: positive = dark-on-light, negative = light-on-dark. Tiers by |Lc|: small-text>=75, body-text>=60, large-text>=45, non-text>=30.');
for (const report of reports) {
  md.push('');
  md.push(`## ${report.id} (${report.polarity})`);
  md.push('');
  md.push('| role | text | on | Lc | tier |');
  md.push('| --- | --- | --- | ---: | --- |');
  for (const row of report.rows) {
    md.push(`| ${row.label} | \`${row.text}\` | \`${row.bg}\` | ${row.lc} | ${row.tier} |`);
  }
}
md.push('');
writeFileSync(join(ROOT, 'reports', 'apca.md'), md.join('\n'));

console.log(`✓ wrote reports/apca.json + reports/apca.md (${reports.length} themes, apca-w3@${apcaVersion})`);
for (const report of reports) {
  const weak = report.rows.filter((row) => row.abs < 45);
  console.log(`  ${report.id.padEnd(13)} ${report.rows.length} pairs; ${weak.length ? weak.length + ' below large-text (Lc<45): ' + weak.map((row) => row.label).join(', ') : 'all >= large-text tier'}`);
}
