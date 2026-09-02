#!/usr/bin/env node
// Operational Interface Doctrine — public conformance checker proof.
//
// dist/system/conformance.js is what consumers run against their own pages.
// The in-repo validators (validate-system-dom.js, validate-system-recipe-dom.js)
// remain the exhaustive fixture gates; this proves the shipped checker agrees
// with them: the canonical fixtures produce zero findings, and every mutation
// the kernel rejects is rejected by the public checker with a stable code.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

import {
  checkConformance,
  formatFindings,
  fromParse5,
} from '../dist/system/conformance.js';
import { primitives, recipes } from '../dist/system/contract.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRIMITIVES = readFileSync(join(ROOT, 'spec', 'system', 'primitives.html'), 'utf8');
const RECIPE = readFileSync(join(ROOT, 'spec', 'system', 'compact-monitor.html'), 'utf8');

function report(html) {
  return checkConformance(fromParse5(parse(html, { sourceCodeLocationInfo: true })));
}

function expectClean(label, html, expected) {
  const result = report(html);
  assert.deepEqual(
    formatFindings(result.findings, label),
    [],
    `${label} must produce zero findings`,
  );
  assert.equal(result.primitives, expected.primitives, `${label} primitive root count`);
  assert.equal(result.recipes, expected.recipes, `${label} recipe root count`);
}

function expectRejected(name, html, mutate, code, pattern) {
  const mutated = mutate(html);
  assert.notEqual(mutated, html, `${name} mutation did not change the fixture`);
  const result = report(mutated);
  const matching = result.findings.filter((finding) => finding.code === code);
  assert.ok(
    matching.length > 0,
    `${name} should produce a ${code} finding; got ${JSON.stringify(formatFindings(result.findings))}`,
  );
  assert.ok(
    matching.some((finding) => pattern.test(finding.message)),
    `${name} ${code} message should match ${pattern}; got ${JSON.stringify(matching.map((f) => f.message))}`,
  );
  for (const finding of result.findings) {
    assert.ok(finding.subject.line, `${name} finding must carry a source line`);
  }
}

// ── canonical fixtures are clean ──
expectClean('spec/system/primitives.html', PRIMITIVES, {
  primitives: primitives.length * 2,
  recipes: 0,
});
expectClean('spec/system/compact-monitor.html', RECIPE, {
  primitives: 1,
  recipes: recipes.length,
});

// ── recipe mutations (mirrors validate-system-recipe-dom-regressions.js) ──
const recipeCases = [
  ['missing-role', (h) => h.replace(' data-oi-slot="status" role="status"', ' data-oi-slot="status"'), 'attribute-required', /missing required attribute role/],
  ['missing-status-id', (h) => h.replace('id="proof-status" data-oi-slot="status"', 'data-oi-slot="status"'), 'slot-semantics', /nonempty id for root aria-describedby/],
  ['missing-root-reference', (h) => h.replace('aria-describedby="proof-status"', 'aria-describedby="proof-title"'), 'slot-semantics', /aria-describedby must reference slot "status"/],
  ['empty-status-text', (h) => h.replace(/<div id="proof-status" data-oi-slot="status" role="status">[\s\S]*?<\/div>\n(\s*)<div data-oi-slot="primary">/, '<div id="proof-status" data-oi-slot="status" role="status"></div>\n$1<div data-oi-slot="primary">'), 'slot-semantics', /requires nonempty visible text/],
  ['unsupported-density', (h) => h.replace('data-oi-density="compact"', 'data-oi-density="spacious"'), 'density-unsupported', /must be one of compact, standard/],
  ['invalid-axis-value', (h) => h.replace('data-oi-severity="neutral"', 'data-oi-severity="catastrophic"'), 'axis-value', /invalid severity value "catastrophic"/],
  ['unknown-axis', (h) => h.replace('data-oi-severity="neutral"', 'data-oi-severity="neutral" data-oi-mood="calm"'), 'axis-unknown', /unknown contract attribute data-oi-mood/],
  ['loading-without-busy', (h) => h.replace('data-oi-activity="ready"', 'data-oi-activity="loading"'), 'busy-state', /requires aria-busy="true"/],
  ['stale-busy', (h) => h.replace('data-oi-activity="ready"', 'data-oi-activity="ready" aria-busy="true"'), 'busy-state', /aria-busy to be absent/],
  ['hidden-required-slot', (h) => h.replace('<div data-oi-slot="primary">', '<div data-oi-slot="primary" hidden>'), 'slot-hidden', /must remain visible/],
  ['missing-required-slot', (h) => h.replace('<div data-oi-slot="primary">37.5 percent</div>', ''), 'slot-required', /required slot "primary" must appear exactly once/],
  ['slot-order', (h) => h.replace('<div data-oi-slot="history">Four recent intervals are available.</div>\n          <div data-oi-slot="settings">Display settings are available.</div>', '<div data-oi-slot="settings">Display settings are available.</div>\n          <div data-oi-slot="history">Four recent intervals are available.</div>'), 'slot-order', /flattened slot order/],
  ['undeclared-slot', (h) => h.replace('data-oi-slot="settings"', 'data-oi-slot="footer"'), 'slot-undeclared', /undeclared slot "footer"/],
  ['empty-optional-slot', (h) => h.replace('<div data-oi-slot="details">Additional details are available.</div>', '<div data-oi-slot="details"></div>'), 'slot-empty', /must be nonempty or omitted/],
  ['chrome-without-slots', (h) => h.replace(/<header class="oi-recipe-compact-monitor__chrome">[\s\S]*?<\/header>/, '<header class="oi-recipe-compact-monitor__chrome"></header>'), 'conditional-part', /must appear iff context or actions is present/],
  ['focusable-root', (h) => h.replace('data-proof-root', 'data-proof-root tabindex="0"'), 'attribute-forbidden', /must not declare tabindex/],
  ['wrong-root-element', (h) => h.replace('<section\n          class="oi-surface oi-recipe-compact-monitor"', '<div\n          class="oi-surface oi-recipe-compact-monitor"').replace('</section>\n        <p\n          id="proof-refresh-announcement"', '</div>\n        <p\n          id="proof-refresh-announcement"'), 'root-element', /must use section, found div/],
  ['undeclared-class', (h) => h.replace('class="oi-surface oi-recipe-compact-monitor"', 'class="oi-surface oi-recipe-compact-monitor oi-card"'), 'class-undeclared', /undeclared public class \.oi-card/],
  ['outside-mapping-root', (h) => h.replace('class="oi-root proof-mapping"', 'class="proof-mapping"'), 'root-mapping', /must be inside an \.oi-root mapping wrapper/],
  ['palette-inline-style', (h) => h.replace('data-proof-root', 'data-proof-root style="--oi-compact-monitor-gap: var(--dr-amber)"'), 'style-palette', /must not reference --dr-\*/],
  ['undocumented-variable', (h) => h.replace('data-proof-root', 'data-proof-root style="--oi-secret: 1"'), 'style-variable', /undocumented public variable --oi-secret/],
  ['duplicate-id', (h) => h.replace('id="proof-status-detail"', 'id="proof-title"'), 'id-duplicate', /duplicate id "proof-title"/],
];
for (const [name, mutate, code, pattern] of recipeCases) {
  expectRejected(name, RECIPE, mutate, code, pattern);
}

// ── primitive mutations (mirrors validate-system-dom.js obligations) ──
const primitiveCases = [
  ['meter-visual-mismatch', (h) => h.replace('--oi-meter-value: 64%', '--oi-meter-value: 60%'), 'meter-visual-value', /60% does not match native meter value 64%/],
  ['meter-label-for', (h) => h.replace('for="dark-meter-control"', 'for="dark-meter-controls"'), 'meter-label-for', /must exactly match the native meter id/],
  ['meter-out-of-range', (h) => h.replace('value="64"\n              >64 of 100', 'value="164"\n              >64 of 100'), 'meter-range', /within its declared min\/max range/],
  ['metric-part-order', (h) => h.replace('<dt class="oi-metric__label">Current measure</dt>\n              <dd class="oi-metric__value">37.5</dd>', '<dd class="oi-metric__value">37.5</dd>\n              <dt class="oi-metric__label">Current measure</dt>'), 'part-order', /label -> value -> unit -> trend -> provenance/],
  ['metric-missing-provenance', (h) => h.replace('<dd id="alien-metric-provenance" class="oi-metric__provenance">\n                Generated, inferred, updated one day ago, partial.\n              </dd>', ''), 'metric-provenance', /requires exactly one provenance part/],
  ['metric-numeric-missing-value', (h) => h.replace('data-oi-completeness="complete"\n              aria-describedby="dark-metric-provenance"', 'data-oi-completeness="missing"\n              aria-describedby="dark-metric-provenance"'), 'metric-textual-value', /nonnumeric textual value/],
  ['history-out-of-order', (h) => h.replace('datetime="2026-08-24"', 'datetime="2026-08-22"'), 'history-order', /strictly chronological/],
  ['history-intensity-range', (h) => h.replace('--oi-history-intensity: 0.8', '--oi-history-intensity: 1.8'), 'history-intensity', /from 0 through 1/],
  ['history-unnamed', (h) => h.replace('aria-label="Four-interval recent history on a zero-to-ten intensity scale, oldest to newest"', ''), 'accessible-name', /oi-history-strip requires an accessible name/],
  ['disclosure-interactive-summary', (h) => h.replace('<summary class="oi-disclosure__summary">Additional context</summary>', '<summary class="oi-disclosure__summary">Additional <button type="button">context</button></summary>'), 'disclosure-summary', /must not contain interactive descendants/],
  ['disclosure-aria-expanded', (h) => h.replace('<details class="oi-disclosure" data-oi-density="standard">', '<details class="oi-disclosure" data-oi-density="standard" aria-expanded="false">'), 'attribute-forbidden', /must not declare aria-expanded/],
  ['rail-missing-content', (h) => h.replace('<div class="oi-rail__content">\n                Fluid content retains its minimum readable width before collapse.\n              </div>', ''), 'part-cardinality', /oi-rail__content requires exactly one direct child/],
  ['inset-wrong-surface', (h) => h.replace('class="oi-inset" data-oi-surface="inset" aria-label="Contained evidence region"', 'class="oi-inset" data-oi-surface="raised" aria-label="Contained evidence region"'), 'attribute-value', /data-oi-surface="raised" must be one of inset/],
  ['divider-orientation', (h) => h.replace('aria-orientation="horizontal"', 'aria-orientation="diagonal"'), 'divider-orientation', /must be horizontal or vertical/],
  ['part-outside-owner', (h) => h.replace('<p>Structure before the break.</p>', '<p class="oi-metric__label">Structure before the break.</p>'), 'part-orphan', /appears outside \.oi-metric/],
  ['hook-outside-owner', (h) => h.replace('<p>Structure after the break.</p>', '<p class="oi-cluster" style="--oi-meter-value: 10%">Structure after the break.</p>'), 'hook-owner', /--oi-meter-value appears outside \.oi-meter/],
  ['unconsumed-axis', (h) => h.replace('<hr class="oi-divider" data-oi-emphasis="quiet"', '<hr class="oi-divider" data-oi-emphasis="quiet" data-oi-severity="critical"'), 'axis-unconsumed', /primitive "divider" does not consume axis "severity"/],
];
for (const [name, mutate, code, pattern] of primitiveCases) {
  expectRejected(name, PRIMITIVES, mutate, code, pattern);
}

// ── the checker never throws on hostile markup ──
for (const html of ['', '<div class="oi-recipe-">', '<dl class="oi-metric"></dl>', '<section class="oi-recipe-compact-monitor"></section>']) {
  assert.doesNotThrow(() => report(html), `checker must report, not throw, on ${JSON.stringify(html)}`);
}
assert.throws(() => checkConformance({}), /expects a tree/);

console.log(
  `PASS system conformance: 2 clean fixtures, ${recipeCases.length} recipe and ${primitiveCases.length} primitive mutations rejected with stable codes`,
);
