#!/usr/bin/env node
// Cross-repository release attestation. Kernel CI is intentionally portable and
// cannot inspect consumer Git objects; run this explicitly at promotion review.

import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REAL_ROOT = realpathSync(ROOT);

const repositoryArguments = new Map();
for (const argument of process.argv.slice(2)) {
  const separator = argument.indexOf('=');
  if (separator <= 0 || separator === argument.length - 1) {
    throw new Error(
      'usage: node scripts/verify-promotion-consumer.js project-control=../../project-control [other-repository=...]',
    );
  }
  const repositoryId = argument.slice(0, separator);
  const repositoryPath = resolve(argument.slice(separator + 1));
  if (repositoryArguments.has(repositoryId)) {
    throw new Error(`duplicate repository mapping: ${repositoryId}`);
  }
  if (!existsSync(repositoryPath)) {
    throw new Error(`consumer repository does not exist: ${repositoryPath}`);
  }
  repositoryArguments.set(repositoryId, realpathSync(repositoryPath));
}
if (repositoryArguments.size === 0) {
  throw new Error(
    'usage: node scripts/verify-promotion-consumer.js project-control=../../project-control [other-repository=...]',
  );
}

function git(repositoryRoot, args, { binary = false } = {}) {
  const result = spawnSync('git', ['-C', repositoryRoot, ...args], {
    encoding: binary ? null : 'utf8',
    maxBuffer: 100 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = binary
      ? result.stderr?.toString('utf8')
      : result.stderr;
    throw new Error(`git ${args.join(' ')} failed: ${(detail ?? '').trim()}`);
  }
  return result.stdout;
}

function fileAt(repositoryRoot, commit, path, options) {
  return git(repositoryRoot, ['show', `${commit}:${path}`], options);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed in ${cwd}: ` +
        `${[result.stdout, result.stderr].filter(Boolean).join('\n').trim()}`,
    );
  }
  return [result.stdout, result.stderr].filter(Boolean).join('\n');
}

function verifyCommittedAdoption(repositoryRoot, commit, commands) {
  const temporaryDirectory = mkdtempSync(
    join(tmpdir(), 'oi-consumer-attestation-'),
  );
  try {
    const archive = git(
      repositoryRoot,
      ['archive', '--format=tar', commit],
      { binary: true },
    );
    const extract = spawnSync(
      'tar',
      ['-xf', '-', '-C', temporaryDirectory],
      { input: archive, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 },
    );
    if (extract.error) throw extract.error;
    if (extract.status !== 0) {
      throw new Error(`tar extraction failed: ${(extract.stderr ?? '').trim()}`);
    }
    for (const descriptor of commands) {
      const [command, ...args] = descriptor.argv;
      const output = run(command, args, temporaryDirectory);
      if (
        descriptor.outputContains &&
        !output.includes(descriptor.outputContains)
      ) {
        throw new Error(
          `${command} ${args.join(' ')} output lacks ` +
            JSON.stringify(descriptor.outputContains),
        );
      }
    }
  } finally {
    const resolved = realpathSync(temporaryDirectory);
    const safePrefix = `${realpathSync(tmpdir())}${sep}oi-consumer-attestation-`;
    if (!resolved.startsWith(safePrefix)) {
      throw new Error(`refusing to remove unexpected temporary path: ${resolved}`);
    }
    rmSync(resolved, { recursive: true, force: true });
  }
}

function confinedEvidencePath(recipeName, relativePath) {
  const lexicalPath = resolve(ROOT, relativePath);
  if (!lexicalPath.startsWith(`${resolve(ROOT)}${sep}`)) {
    throw new Error(`${recipeName} promotion evidence escapes the kernel repository`);
  }
  if (!existsSync(lexicalPath)) {
    throw new Error(`${recipeName} promotion evidence does not exist`);
  }
  const evidencePath = realpathSync(lexicalPath);
  if (
    evidencePath !== REAL_ROOT &&
    !evidencePath.startsWith(`${REAL_ROOT}${sep}`)
  ) {
    throw new Error(`${recipeName} promotion evidence resolves outside the kernel repository`);
  }
  if (!statSync(evidencePath).isFile()) {
    throw new Error(`${recipeName} promotion evidence is not a regular file`);
  }
  return evidencePath;
}

const contract = JSON.parse(
  readFileSync(join(ROOT, 'src', 'system', 'contract.json'), 'utf8'),
);
let verified = 0;
const verifiedCommandSets = new Set();

for (const [recipeName, recipe] of Object.entries(contract.recipes)) {
  if (!recipe._promotionEvidence) continue;
  const evidencePath = confinedEvidencePath(
    recipeName,
    recipe._promotionEvidence,
  );
  const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  if (evidence.recipe !== recipeName) {
    throw new Error(`${recipe._promotionEvidence} is bound to ${evidence.recipe}`);
  }

  for (const [adoptionId, adoption] of Object.entries(evidence.adoptions)) {
    const repositoryRoot = repositoryArguments.get(adoption.repository);
    if (!repositoryRoot) {
      throw new Error(
        `${adoptionId} requires a repository mapping for ${adoption.repository}`,
      );
    }
    git(repositoryRoot, ['rev-parse', '--is-inside-work-tree']);
    git(repositoryRoot, ['cat-file', '-e', `${adoption.consumerCommit}^{commit}`]);
    git(repositoryRoot, ['cat-file', '-e', `${adoption.verifiedCommit}^{commit}`]);
    git(repositoryRoot, [
      'merge-base',
      '--is-ancestor',
      adoption.consumerCommit,
      adoption.verifiedCommit,
    ]);

    const tarball = fileAt(
      repositoryRoot,
      adoption.verifiedCommit,
      adoption.artifactPath,
      { binary: true },
    );
    const sha256 = createHash('sha256').update(tarball).digest('hex');
    if (sha256 !== adoption.artifactSha256) {
      throw new Error(
        `${adoptionId} ${adoption.artifactPath} is ${sha256}, expected ${adoption.artifactSha256}`,
      );
    }
    const tarSha256 = createHash('sha256').update(gunzipSync(tarball)).digest('hex');
    if (tarSha256 !== adoption.artifactTarSha256) {
      throw new Error(
        `${adoptionId} ${adoption.artifactPath} tar stream is ${tarSha256}, expected ${adoption.artifactTarSha256}`,
      );
    }

    for (const assertion of adoption.verification.fileAssertions) {
      const contents = fileAt(
        repositoryRoot,
        adoption.verifiedCommit,
        assertion.path,
      ).toString();
      if (!contents.includes(assertion.contains)) {
        throw new Error(
          `${adoptionId} ${assertion.path} lacks ${JSON.stringify(assertion.contains)}`,
        );
      }
    }

    const npmDependency = adoption.verification.npmFileDependency;
    if (npmDependency) {
      const packageJson = JSON.parse(
        fileAt(
          repositoryRoot,
          adoption.verifiedCommit,
          npmDependency.manifestPath,
        ).toString(),
      );
      const expectedDependency = `file:${adoption.artifactPath}`;
      if (packageJson.dependencies?.[npmDependency.packageName] !== expectedDependency) {
        throw new Error(
          `${adoptionId} ${npmDependency.manifestPath} does not pin ${expectedDependency}`,
        );
      }
      const packageLock = JSON.parse(
        fileAt(
          repositoryRoot,
          adoption.verifiedCommit,
          npmDependency.lockfilePath,
        ).toString(),
      );
      const lockEntry =
        packageLock.packages?.[`node_modules/${npmDependency.packageName}`];
      const sha512 = createHash('sha512').update(tarball).digest('base64');
      if (
        lockEntry?.version !== adoption.packageVersion ||
        lockEntry?.resolved !== expectedDependency ||
        lockEntry?.integrity !== `sha512-${sha512}`
      ) {
        throw new Error(
          `${adoptionId} ${npmDependency.lockfilePath} does not attest the vendored bytes`,
        );
      }
    }

    const commandKey = JSON.stringify([
      adoption.repository,
      adoption.verifiedCommit,
      adoption.verification.commands,
    ]);
    if (!verifiedCommandSets.has(commandKey)) {
      verifyCommittedAdoption(
        repositoryRoot,
        adoption.verifiedCommit,
        adoption.verification.commands,
      );
      verifiedCommandSets.add(commandKey);
    }

    verified += 1;
    console.log(
      `PASS consumer ${adoptionId}: ${adoption.repository}@` +
        `${adoption.verifiedCommit.slice(0, 7)} ${adoption.artifactPath} ${sha256}`,
    );
  }
}

if (verified === 0) throw new Error('no promotion consumer evidence was found');
console.log(`PASS promotion consumer attestation: ${verified} adoption(s)`);
