#!/usr/bin/env node
// Executable predicates for the generated browser/runtime contract.

import assert from 'node:assert/strict';
import {
  assertAxisValue,
  missingRequiredSlots,
  requiresProvenanceDisclosure,
} from '../dist/system/contract.js';

assert.equal(assertAxisValue('severity', 'critical'), true);

const previousEnvironment = process.env.NODE_ENV;
try {
  delete process.env.NODE_ENV;
  assert.throws(
    () => assertAxisValue('severity', 'catastrophic'),
    /not a valid severity/,
  );

  process.env.NODE_ENV = 'production';
  assert.equal(assertAxisValue('severity', 'catastrophic'), false);
} finally {
  if (previousEnvironment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousEnvironment;
}

assert.deepEqual(
  missingRequiredSlots('compact-monitor', ['context', 'status']),
  ['primary'],
);
assert.equal(
  requiresProvenanceDisclosure({
    source: 'direct',
    freshness: 'recent',
    certainty: 'confirmed',
    completeness: 'complete',
  }),
  false,
);
assert.equal(requiresProvenanceDisclosure({ source: 'generated' }), true);

const processDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
try {
  delete globalThis.process;
  const browserContract = await import(
    new URL('../dist/system/contract.js?browser-runtime', import.meta.url).href
  );
  assert.equal(
    browserContract.assertAxisValue('severity', 'catastrophic'),
    false,
  );
  assert.throws(
    () => browserContract.assertAxisValue(
      'severity',
      'catastrophic',
      { development: true },
    ),
    /not a valid severity/,
  );
} finally {
  if (processDescriptor) {
    Object.defineProperty(globalThis, 'process', processDescriptor);
  }
}

console.log('PASS system runtime: dev, production, browser, slots, and provenance predicates');
