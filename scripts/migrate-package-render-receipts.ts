// Created: 2026-10-15. One-time, evidence-checked npm-to-pnpm receipt migration.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as current from './render';

const baseline = 'ea25370f5581a88735a888e294799cfc6e40dc8f';
const acceptedCommit = '0ffb81b8a87653776e3d637e75b4fa02af7372cf';
const acceptedRun = 'https://api.github.com/repos/ian9911007/remotion-style-atlas/actions/runs/37245426344';
const prefix = 'tools/remotion-style-atlas';
const workspace = path.resolve(current.projectRoot, '../..');
const git = (...args: string[]) => execFileSync('git', ['-C', workspace, ...args]);
// The successful original release validated all 100 records. Bind that evidence
// to the exact historical subtree; dependency migration need not reproduce the
// historical toolchain to verify unchanged, already-reviewed video bytes.
const response = await fetch(acceptedRun);
assert(response.ok, 'Cannot independently verify the accepted release.');
const release = await response.json();
assert.equal(release.conclusion, 'success');
assert.equal(release.head_sha, acceptedCommit);
assert.equal(git('rev-parse', `${baseline}:${prefix}`).toString().trim(),
  git('rev-parse', `${acceptedCommit}^{tree}`).toString().trim());
const visualInputs = ['src/remotion', 'public/assets', 'public/fonts', 'src/catalog/schema.ts'];
// Refuse to transfer review evidence across any actual scene, asset or schema edit.
assert.equal(git('diff', baseline, '--', ...visualInputs.map(p => `${prefix}/${p}`)).length, 0,
  'Rendering inputs changed; rerender and review instead of migrating receipts.');
const legacyRender = git('show', `${baseline}:${prefix}/scripts/render.ts`).toString();
const expectedRender = '// Created: 2026-10-05\n' + legacyRender.replace(
  '    path.join(root, "package-lock.json"),',
  '    path.join(root, "package-lock.json"),\n    path.join(root, "pnpm-lock.yaml"),');
assert.equal(readFileSync(path.join(current.projectRoot, 'scripts/render.ts'), 'utf8'), expectedRender,
  'Renderer changes exceed the verified package-manager bookkeeping change.');
const legacyPackage = JSON.parse(git('show', `${baseline}:${prefix}/package.json`).toString());
const currentPackage = JSON.parse(readFileSync(path.join(current.projectRoot, 'package.json'), 'utf8'));
for (const name of ['react', 'react-dom', 'remotion', '@remotion/bundler', '@remotion/renderer']) {
  assert.equal(currentPackage.dependencies?.[name] ?? currentPackage.devDependencies?.[name],
    legacyPackage.dependencies?.[name] ?? legacyPackage.devDependencies?.[name],
    `Rendering dependency changed: ${name}`);
}
const temporary = mkdtempSync(path.join(os.tmpdir(), 'atlas-receipt-migration-'));
try {
  // Validate the original release snapshot and recorded binary integrity without
  // changing the production fingerprint or media-integrity gates.
  const archive = path.join(temporary, "snapshot.tar");
  git("archive", "--output=" + archive, `${baseline}:${prefix}`);
  execFileSync("tar", ["-xf", archive, "-C", temporary]);
  rmSync(archive);
  symlinkSync(path.join(current.projectRoot, 'node_modules'), path.join(temporary, 'node_modules'));
  const legacy = await import(pathToFileURL(path.join(temporary, 'scripts/render.ts')).href);
  const oldCatalog = legacy.readCatalog();
  const oldManifest = legacy.readManifest();
  const catalog = current.readCatalog();
  const manifest = current.readManifest();
  assert.deepEqual(catalog, oldCatalog, 'Authoring/review data changed; this migration is not applicable.');
  assert.deepEqual(manifest, oldManifest, 'Render receipts already changed; refuse to overwrite them.');
  const records = [];
  for (const style of catalog) {
    const record = manifest.styles[style.id];
    const previous = record.fingerprint;
    assert(legacy.recordIsCurrent(style, record, previous), `${style.id}: historical receipt or media invalid`);
    assert(current.recordIsCurrent(style, record, previous), `${style.id}: current media differs from reviewed evidence`);
    const next = current.fingerprintFor(style, current.renderingCodeHash(current.projectRoot, style.recipe));
    records.push({ id: style.id, previous, current: next });
    // Retain original binary hashes, paths, timestamps and human review records.
    style.preview.fingerprint = next;
    record.fingerprint = next;
  }
  current.atomicJson(current.catalogPath, catalog);
  current.atomicJson(current.manifestPath, manifest);
  current.atomicJson(path.join(current.projectRoot, 'docs/package-render-receipt-migration.json'), {
    baseline, acceptedCommit, acceptedRun, reason: 'Only render.ts bookkeeping and package-manager lock identity changed; scene sources, reviewed media and primary rendering versions are unchanged.',
    renderingInputsUnchanged: visualInputs, mediaOutputsUnchanged: true, records,
  });
  console.log(`Migrated ${records.length} receipts after verifying the successful historical release, stored receipts and all current media hashes. No rendering or new review was claimed.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
