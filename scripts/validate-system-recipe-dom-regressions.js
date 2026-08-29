#!/usr/bin/env node
// Mutation proof for manifest-driven slot semantics. These cases prevent the
// canonical fixture and validator from drifting together into a false green.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = join(ROOT, 'scripts', 'validate-system-recipe-dom.js');
const SOURCE = join(ROOT, 'spec', 'system', 'compact-monitor.html');
const base = readFileSync(SOURCE, 'utf8');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'oi-recipe-dom-regressions-'));

function rejectMutation(name, mutate, expected) {
  const html = mutate(base);
  assert.notEqual(html, base, `${name} mutation did not change the fixture`);
  const path = join(temporaryDirectory, `${name}.html`);
  writeFileSync(path, html);
  const result = spawnSync(process.execPath, [VALIDATOR, path], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  assert.notEqual(result.status, 0, `${name} should fail`);
  assert.match(output, expected, `${name} failed for the wrong reason`);
}

try {
  rejectMutation(
    'missing-role',
    (html) => html.replace(' data-oi-slot="status" role="status"', ' data-oi-slot="status"'),
    /missing required attribute role/,
  );
  rejectMutation(
    'missing-status-id',
    (html) => html.replace('id="proof-status" data-oi-slot="status"', 'data-oi-slot="status"'),
    /must have a nonempty id for root aria-describedby/,
  );
  rejectMutation(
    'missing-root-reference',
    (html) => html.replace('aria-describedby="proof-status"', 'aria-describedby="proof-title"'),
    /aria-describedby must reference slot "status" id "proof-status"/,
  );
  rejectMutation(
    'empty-status-text',
    (html) => html.replace(
      /<div id="proof-status" data-oi-slot="status" role="status">[\s\S]*?<\/div>\n          <div data-oi-slot="primary">/,
      '<div id="proof-status" data-oi-slot="status" role="status"></div>\n          <div data-oi-slot="primary">',
    ),
    /slot "status" requires nonempty visible text/,
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log('PASS recipe DOM regressions: status semantics fail closed');
