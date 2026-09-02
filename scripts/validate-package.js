#!/usr/bin/env node
// Validate the artifact consumers actually receive, not an approximation based
// on package.json globs. The pack runs with lifecycle scripts disabled so this
// check can safely join npm test without recursing through prepublishOnly.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REAL_ROOT = realpathSync(ROOT);
const TEMP_PREFIX = join(tmpdir(), 'dark-roast-package-');
const evidenceOverridePath = process.argv[2] ? resolve(process.argv[2]) : null;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(
      `${command} ${args.join(' ')} exited ${result.status ?? `on signal ${result.signal}`}` +
        (detail ? `\n${detail}` : ''),
    );
  }
  return result.stdout;
}

function assertNoRuntimeDependencies(pkg, source) {
  for (const field of ['dependencies', 'optionalDependencies']) {
    const names = Object.keys(pkg[field] ?? {});
    if (names.length) {
      throw new Error(`${source} declares runtime ${field}: ${names.join(', ')}`);
    }
  }

  const requiredPeers = Object.keys(pkg.peerDependencies ?? {}).filter(
    (name) => pkg.peerDependenciesMeta?.[name]?.optional !== true,
  );
  if (requiredPeers.length) {
    throw new Error(`${source} declares required runtime peers: ${requiredPeers.join(', ')}`);
  }
}

function exportTargets(pkg) {
  const targets = [];
  for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
    if (typeof value === 'string') {
      targets.push({ subpath, condition: 'default', target: value });
      continue;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`invalid export descriptor for ${subpath}`);
    }
    if (typeof value.default === 'string') {
      targets.push({ subpath, condition: 'default', target: value.default });
    }
    if (typeof value.types === 'string') {
      targets.push({ subpath, condition: 'types', target: value.types });
    }
  }
  return targets;
}

function relativeExportTarget({ subpath, condition, target }) {
  if (!target.startsWith('./')) {
    throw new Error(`${subpath} ${condition} target must be package-relative, got ${target}`);
  }
  const relative = target.slice(2);
  const parts = relative.split('/');
  if (!relative || parts.includes('') || parts.includes('.') || parts.includes('..')) {
    throw new Error(`${subpath} ${condition} target is not a safe file path: ${target}`);
  }
  return relative;
}

function archiveFiles(tarball) {
  const listing = run('tar', ['-tzf', tarball]);
  const files = new Set();
  for (const raw of listing.split(/\r?\n/).filter(Boolean)) {
    if (raw === 'package/' || raw === 'package') continue;
    if (!raw.startsWith('package/')) {
      throw new Error(`tarball entry escapes package root: ${raw}`);
    }
    const relative = raw.slice('package/'.length).replace(/\/$/, '');
    const parts = relative.split('/');
    if (parts.includes('..')) throw new Error(`tarball contains traversal entry: ${raw}`);
    if (relative) files.add(relative);
  }
  return files;
}

function assertNoForbiddenFiles(files) {
  const forbidden = [];
  for (const file of files) {
    const parts = file.split('/');
    if (
      [
        'scripts',
        'lib',
        'codecompanion-src',
        'tests',
        'output',
        'playwright-report',
        'test-results',
        'governance',
      ].includes(parts[0]) ||
      file.startsWith('starter/theme/') ||
      file === 'playwright.config.js' ||
      parts.some((part) => part.endsWith('-snapshots')) ||
      parts.includes('node_modules') ||
      parts.includes('.env')
    ) {
      forbidden.push(file);
    }
  }
  if (forbidden.length) {
    throw new Error(`tarball contains forbidden path(s): ${forbidden.sort().join(', ')}`);
  }
}

async function validateTarget(packageRoot, record) {
  const relative = relativeExportTarget(record);
  const root = resolve(packageRoot);
  const path = resolve(root, relative);
  if (!path.startsWith(`${root}${sep}`)) {
    throw new Error(`${record.subpath} ${record.condition} target escapes package root`);
  }
  if (!existsSync(path)) {
    throw new Error(`${record.subpath} ${record.condition} target is absent after extraction: ${relative}`);
  }

  if (relative.endsWith('.js')) {
    await import(`${pathToFileURL(path).href}?package-integrity=${encodeURIComponent(record.subpath)}`);
    return;
  }

  const contents = readFileSync(path, 'utf8');
  if (contents.trim() === '') {
    throw new Error(`${record.subpath} ${record.condition} target is empty: ${relative}`);
  }
  if (relative.endsWith('.json')) JSON.parse(contents);
}

let tempDirectory;
try {
  const sourcePackage = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const sourceContract = JSON.parse(
    readFileSync(join(ROOT, 'src', 'system', 'contract.json'), 'utf8'),
  );
  assertNoRuntimeDependencies(sourcePackage, 'package.json');
  const targets = exportTargets(sourcePackage);
  if (targets.length === 0) throw new Error('package.json exports no default or types targets');

  tempDirectory = mkdtempSync(TEMP_PREFIX);
  const packOutput = run('npm', [
    'pack',
    '--json',
    '--ignore-scripts',
    '--pack-destination',
    tempDirectory,
  ]);
  const reports = JSON.parse(packOutput);
  if (!Array.isArray(reports) || reports.length !== 1 || typeof reports[0].filename !== 'string') {
    throw new Error('npm pack did not return exactly one tarball report');
  }

  const filename = reports[0].filename;
  if (filename !== basename(filename)) throw new Error(`npm pack returned an unsafe filename: ${filename}`);
  const tarball = join(tempDirectory, filename);
  if (!existsSync(tarball)) throw new Error(`npm pack did not create ${tarball}`);

  // The gzip layer is not reproducible across platforms: Linux and macOS Node
  // builds compress the identical tar stream into different bytes. The consumer
  // pins the exact bytes it vendored (artifactSha256, attested by its lockfile
  // and verify-promotion-consumer.js); this portable gate pins the tar stream.
  const packedBytes = readFileSync(tarball);
  const packedTarSha256 = createHash('sha256').update(gunzipSync(packedBytes)).digest('hex');
  const currentArtifactPins = [];
  for (const [recipeName, recipe] of Object.entries(sourceContract.recipes)) {
    if (!recipe._promotionEvidence) continue;
    const lexicalEvidencePath =
      evidenceOverridePath ?? resolve(ROOT, recipe._promotionEvidence);
    if (
      !evidenceOverridePath &&
      !lexicalEvidencePath.startsWith(`${resolve(ROOT)}${sep}`)
    ) {
      throw new Error(`recipe ${recipeName} promotion evidence escapes the repository`);
    }
    if (!existsSync(lexicalEvidencePath)) {
      throw new Error(`recipe ${recipeName} promotion evidence does not exist`);
    }
    const evidencePath = realpathSync(lexicalEvidencePath);
    if (
      !evidenceOverridePath &&
      evidencePath !== REAL_ROOT &&
      !evidencePath.startsWith(`${REAL_ROOT}${sep}`)
    ) {
      throw new Error(`recipe ${recipeName} promotion evidence resolves outside the repository`);
    }
    if (!statSync(evidencePath).isFile()) {
      throw new Error(`recipe ${recipeName} promotion evidence is not a regular file`);
    }
    const promotionEvidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
    const recipePins = Object.entries(promotionEvidence.adoptions)
      .filter(([, adoption]) =>
        adoption.packageVersion === sourcePackage.version &&
        adoption.contractVersion === sourceContract.version
      );
    if (recipePins.length === 0) {
      throw new Error(
        `recipe ${recipeName} has no artifact pin for package ${sourcePackage.version} ` +
          `and contract ${sourceContract.version}`,
      );
    }
    for (const [adoptionId, adoption] of recipePins) {
      if (adoption.artifactTarSha256 !== packedTarSha256) {
        throw new Error(
          `promotion evidence ${recipeName}/${adoptionId} pins tar digest ${adoption.artifactTarSha256}, ` +
            `but the tar stream inside ${filename} is ${packedTarSha256}`,
        );
      }
      currentArtifactPins.push(`${recipeName}/${adoptionId}`);
    }
  }

  const files = archiveFiles(tarball);
  assertNoForbiddenFiles(files);
  for (const record of targets) {
    const relative = relativeExportTarget(record);
    if (!files.has(relative)) {
      throw new Error(
        `${record.subpath} ${record.condition} target is absent from the tarball: ${relative}`,
      );
    }
  }

  const extracted = join(tempDirectory, 'extracted');
  mkdirSync(extracted);
  run('tar', ['-xzf', tarball, '-C', extracted]);
  const packageRoot = join(extracted, 'package');
  const packedPackage = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  assertNoRuntimeDependencies(packedPackage, 'packed package.json');

  for (const record of targets) await validateTarget(packageRoot, record);

  console.log(
    `PASS package: ${filename}; ${files.size} file(s); ` +
      `${targets.length} default/types export target(s) resolve; ` +
      `${currentArtifactPins.length} adoption artifact pin(s) match; zero runtime dependencies`,
  );
} catch (error) {
  console.error(`FAIL package integrity: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (tempDirectory) {
    const resolvedTemp = resolve(tempDirectory);
    const safePrefix = `${resolve(tmpdir())}${sep}dark-roast-package-`;
    if (!resolvedTemp.startsWith(safePrefix)) {
      throw new Error(`refusing to remove unexpected temporary path: ${resolvedTemp}`);
    }
    rmSync(resolvedTemp, { recursive: true, force: true });
  }
}
