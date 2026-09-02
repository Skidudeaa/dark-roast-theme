#!/usr/bin/env node
// Adversarial mutations for maturity governance. A metadata-only promotion must
// fail before generation unless its real-consumer and manual evidence is whole.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = join(ROOT, 'scripts', 'validate-contract.js');
const SOURCE = join(ROOT, 'src', 'system', 'contract.json');
const EVIDENCE_SOURCE = join(ROOT, 'governance', 'compact-monitor-promotion.json');
const FIXTURE_DOCUMENT = 'scripts/fixtures/VALIDATOR-PROMOTION-EVIDENCE.md';
const base = JSON.parse(readFileSync(SOURCE, 'utf8'));
const baseEvidence = JSON.parse(readFileSync(EVIDENCE_SOURCE, 'utf8'));
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'oi-contract-regressions-'));

function fixtureReference(anchor) {
  return `${FIXTURE_DOCUMENT}#${anchor}`;
}

function syntheticAdoption(adoptionId, consumer, surface, commitSeed) {
  const source = baseEvidence.adoptions['project-control-source-health'];
  return {
    consumer,
    surface,
    repository: `${adoptionId}-repository`,
    consumerCommit: commitSeed.repeat(40),
    verifiedCommit: String(Number(commitSeed) + 1).repeat(40),
    packageVersion: source.packageVersion,
    contractVersion: source.contractVersion,
    artifactPath: source.artifactPath,
    artifactSha256: source.artifactSha256,
    artifactTarSha256: source.artifactTarSha256,
    verification: structuredClone(source.verification),
    evidenceRef: fixtureReference(`evidence-${adoptionId}-automated`),
    ownerAcceptance: {
      acceptedOn: baseEvidence.asOf,
      evidenceRef: fixtureReference(
        `evidence-${adoptionId}-owner-acceptance`,
      ),
    },
    manualGates: Object.fromEntries(
      base.recipes['compact-monitor']._manualProofGates.map((gate) => [
        gate,
        {
          disposition: 'passed',
          evidenceRef: fixtureReference(`evidence-${adoptionId}-${gate}`),
        },
      ]),
    ),
  };
}

function useSyntheticPrimary(evidence) {
  evidence.adoptions = {
    'synthetic-primary': syntheticAdoption(
      'synthetic-primary',
      'synthetic-consumer',
      'synthetic-surface',
      '1',
    ),
  };
  delete evidence.stableBasis;
}

function runMutation(name, mutate, expectation) {
  const manifest = structuredClone(base);
  const evidence = structuredClone(baseEvidence);
  mutate(manifest, manifest.recipes['compact-monitor'], evidence);
  const slug = name.replace(/[^a-z0-9]+/gi, '-');
  const manifestPath = join(temporaryDirectory, `${slug}-contract.json`);
  const evidencePath = join(temporaryDirectory, `${slug}-evidence.json`);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  const result = spawnSync(
    process.execPath,
    [VALIDATOR, manifestPath, evidencePath],
    { cwd: ROOT, encoding: 'utf8' },
  );
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (expectation === true) {
    assert.equal(result.status, 0, `${name} should pass\n${output}`);
  } else {
    assert.notEqual(result.status, 0, `${name} should fail`);
    assert.match(output, expectation, `${name} failed for the wrong reason`);
  }
}

try {
  runMutation(
    'proven-without-evidence',
    (_manifest, recipe) => {
      recipe.stability = 'proven';
      delete recipe._promotionEvidence;
    },
    /requires a qualifying adoption/,
  );
  runMutation(
    'proven-with-pending-manual-gates',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'proven';
      evidence.adoptions['project-control-source-health'].manualGates.safari = {
        disposition: 'pending',
      };
    },
    /requires a qualifying adoption/,
  );
  runMutation(
    'wrong-recipe-evidence',
    (_manifest, _recipe, evidence) => {
      evidence.recipe = 'different-recipe';
    },
    /not "compact-monitor"/,
  );
  runMutation(
    'missing-manual-gate',
    (_manifest, _recipe, evidence) => {
      delete evidence.adoptions['project-control-source-health']
        .manualGates.voiceover;
    },
    /manualGates must name every declared manual proof gate exactly/,
  );
  runMutation(
    'extra-manual-gate',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health']
        .manualGates['invented-gate'] = { disposition: 'pending' };
    },
    /manualGates must name every declared manual proof gate exactly/,
  );
  runMutation(
    'undeclared-semantic-slot',
    (_manifest, recipe) => {
      recipe.slotSemantics.ghost = structuredClone(recipe.slotSemantics.status);
    },
    /slotSemantics names undeclared slot "ghost"/,
  );
  runMutation(
    'non-idref-root-reference',
    (_manifest, recipe) => {
      recipe.slotSemantics.status.rootReferenceAttribute = 'aria-live';
    },
    /schema/,
  );
  runMutation(
    'not-applicable-without-rationale',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health'].manualGates.nvda = {
        disposition: 'not-applicable',
        evidenceRef:
          'docs/OPERATIONAL-INTERFACE-DOCTRINE.md#evidence-project-control-source-health-nvda',
      };
    },
    /evidence schema/,
  );
  runMutation(
    'null-adoption',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health'] = null;
    },
    /evidence schema/,
  );
  runMutation(
    'wrong-manual-gates-type',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health'].manualGates = [];
    },
    /evidence schema/,
  );
  runMutation(
    'short-consumer-sha',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health'].consumerCommit =
        'deadbeef';
    },
    /evidence schema/,
  );
  runMutation(
    'impossible-owner-acceptance-date',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health']
        .ownerAcceptance.acceptedOn = '2026-02-31';
    },
    /is not a real ISO calendar date/,
  );
  runMutation(
    'future-owner-acceptance-date',
    (_manifest, _recipe, evidence) => {
      evidence.asOf = '2026-08-28';
    },
    /owner acceptance is later than evidence asOf/,
  );
  runMutation(
    'future-evidence-as-of',
    (_manifest, _recipe, evidence) => {
      evidence.asOf = '2099-01-01';
    },
    /evidence asOf 2099-01-01 is later than UTC today/,
  );
  runMutation(
    'old-package-version',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'proven';
      evidence.adoptions['project-control-source-health'].packageVersion =
        '5.10.0';
    },
    /requires a qualifying adoption/,
  );
  runMutation(
    'old-contract-version',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'proven';
      evidence.adoptions['project-control-source-health'].contractVersion =
        '0.4.0';
    },
    /requires a qualifying adoption/,
  );
  runMutation(
    'missing-evidence-file',
    (_manifest, _recipe, evidence) => {
      evidence.adoptions['project-control-source-health'].evidenceRef =
        'docs/missing.md#evidence-project-control-source-health-automated';
    },
    /evidence file does not exist/,
  );
  runMutation(
    'reused-owner-anchor-for-manual-gate',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'proven';
      useSyntheticPrimary(evidence);
      const adoption = evidence.adoptions['synthetic-primary'];
      adoption.manualGates.voiceover.evidenceRef =
        adoption.ownerAcceptance.evidenceRef;
    },
    /evidence anchor must be "evidence-synthetic-primary-voiceover"/,
  );
  runMutation(
    'reordered-stability-ladder',
    (manifest) => {
      [manifest.stabilityLadder.stages[0], manifest.stabilityLadder.stages[1]] =
        [manifest.stabilityLadder.stages[1], manifest.stabilityLadder.stages[0]];
    },
    /stages must remain study -> candidate/,
  );
  runMutation(
    'valid-proven',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'proven';
      useSyntheticPrimary(evidence);
    },
    true,
  );
  runMutation(
    'stable-without-basis',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'stable';
      useSyntheticPrimary(evidence);
    },
    /requires stableBasis/,
  );
  runMutation(
    'valid-architecture-review-stable',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'stable';
      useSyntheticPrimary(evidence);
      evidence.stableBasis = {
        kind: 'architecture-review',
        adoptionIds: ['synthetic-primary'],
        decidedOn: evidence.asOf,
        evidenceRef: fixtureReference(
          'stable-compact-monitor-architecture-review',
        ),
        rationale: 'Synthetic architecture-review validator fixture.',
      };
    },
    true,
  );
  runMutation(
    'duplicate-second-consumer-pair',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'stable';
      useSyntheticPrimary(evidence);
      evidence.adoptions['synthetic-secondary'] = syntheticAdoption(
        'synthetic-secondary',
        'synthetic-consumer',
        'synthetic-surface',
        '3',
      );
      evidence.stableBasis = {
        kind: 'second-consumer',
        adoptionIds: ['synthetic-primary', 'synthetic-secondary'],
        decidedOn: evidence.asOf,
        evidenceRef: fixtureReference(
          'stable-compact-monitor-second-consumer',
        ),
        rationale: 'Synthetic second-consumer validator fixture.',
      };
    },
    /requires two materially different consumer\/surface pairs/,
  );
  runMutation(
    'duplicate-second-consumer-commit',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'stable';
      useSyntheticPrimary(evidence);
      const second = syntheticAdoption(
        'synthetic-secondary',
        'second-consumer',
        'second-surface',
        '3',
      );
      second.verifiedCommit =
        evidence.adoptions['synthetic-primary'].verifiedCommit;
      evidence.adoptions['synthetic-secondary'] = second;
      evidence.stableBasis = {
        kind: 'second-consumer',
        adoptionIds: ['synthetic-primary', 'synthetic-secondary'],
        decidedOn: evidence.asOf,
        evidenceRef: fixtureReference(
          'stable-compact-monitor-second-consumer',
        ),
        rationale: 'Synthetic second-consumer validator fixture.',
      };
    },
    /requires distinct verifiedCommit/,
  );
  runMutation(
    'valid-second-consumer-stable',
    (_manifest, recipe, evidence) => {
      recipe.stability = 'stable';
      useSyntheticPrimary(evidence);
      evidence.adoptions['synthetic-secondary'] = syntheticAdoption(
        'synthetic-secondary',
        'second-consumer',
        'second-surface',
        '3',
      );
      evidence.stableBasis = {
        kind: 'second-consumer',
        adoptionIds: ['synthetic-primary', 'synthetic-secondary'],
        decidedOn: evidence.asOf,
        evidenceRef: fixtureReference(
          'stable-compact-monitor-second-consumer',
        ),
        rationale: 'Synthetic second-consumer validator fixture.',
      };
    },
    true,
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log('PASS contract regressions: promotion and stable maturity gates fail closed');
