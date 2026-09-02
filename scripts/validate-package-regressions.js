#!/usr/bin/env node
// Mutate the excluded governance record while packing the real package. This
// proves a stale version or fake hash cannot turn artifact verification into a
// zero-match success.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = join(ROOT, 'scripts', 'validate-package.js');
const SOURCE = join(ROOT, 'governance', 'compact-monitor-promotion.json');
const base = JSON.parse(readFileSync(SOURCE, 'utf8'));
const packageVersion = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8'),
).version;
const contractVersion = JSON.parse(
  readFileSync(join(ROOT, 'src', 'system', 'contract.json'), 'utf8'),
).version;
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'oi-package-regressions-'));

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rejectMutation(name, mutate, expected) {
  const evidence = structuredClone(base);
  mutate(evidence.adoptions['project-control-source-health']);
  const path = join(temporaryDirectory, `${name}.json`);
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`);
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
    'old-package-version',
    (adoption) => {
      adoption.packageVersion = '0.0.0';
    },
    new RegExp(
      `has no artifact pin for package ${escapePattern(packageVersion)} and contract ${escapePattern(contractVersion)}`,
    ),
  );
  rejectMutation(
    'mismatched-artifact-tar-digest',
    (adoption) => {
      adoption.artifactTarSha256 = '0'.repeat(64);
    },
    /pins tar digest 0000000000000000000000000000000000000000000000000000000000000000/,
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log('PASS package regressions: version and artifact pins fail closed');
