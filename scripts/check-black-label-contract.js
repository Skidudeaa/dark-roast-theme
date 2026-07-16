#!/usr/bin/env node
// Guard the user's explicit product boundary: companions are additive and the
// established Black Label files do not move incidentally.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = JSON.parse(readFileSync(join(ROOT, 'src', 'black-label-contract.json'), 'utf8'));
const failures = [];

for (const [relativePath, expected] of Object.entries(fixture.sha256)) {
  let bytes;
  try {
    bytes = readFileSync(join(ROOT, relativePath));
  } catch (error) {
    failures.push(`${relativePath}: ${error.code === 'ENOENT' ? 'missing' : error.message}`);
    continue;
  }
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) failures.push(`${relativePath}: expected ${expected}, got ${actual}`);
}

if (failures.length) {
  console.error(`FAIL Black Label contract (${failures.length} changed file${failures.length === 1 ? '' : 's'})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('Black Label changes require an explicit product decision; do not refresh this fixture for companion work.');
  process.exit(1);
}

console.log(`PASS Black Label contract: ${Object.keys(fixture.sha256).length} canonical files unchanged from ${fixture.lockedAt}`);
