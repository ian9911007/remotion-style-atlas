// Created: 2026-10-15. Transfer unchanged, verified case receipts to pnpm lock identity.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { technologyCases, evidence } from '../src/technology/registry';
import { caseSourceHash, sha256 } from './technology-integrity';
import { projectRoot, atomicJson } from './render';
const baseline = 'ea25370f5581a88735a888e294799cfc6e40dc8f';
const prefix = 'tools/remotion-style-atlas';
const workspace = path.resolve(projectRoot, '../..');
const git = (...args: string[]) => execFileSync('git', ['-C', workspace, ...args]);
const proofFile = path.join(projectRoot, 'docs/package-render-receipt-migration.json');
const proof = JSON.parse(readFileSync(proofFile, 'utf8'));
const response = await fetch(proof.acceptedRun);
assert(response.ok);
const release = await response.json();
assert.equal(release.conclusion, 'success');
assert.equal(release.head_sha, proof.acceptedCommit);
assert.equal(git('rev-parse', `${baseline}:${prefix}`).toString().trim(), git('rev-parse', `${proof.acceptedCommit}^{tree}`).toString().trim());
assert.equal(git('diff', baseline, '--', `${prefix}/technology-runtime/src`, `${prefix}/src/technology/registry.ts`).length, 0,
  'Case implementation or definitions changed; new runtime verification is required.');
const oldPackage = JSON.parse(git('show', `${baseline}:${prefix}/technology-runtime/package.json`).toString());
const newPackage = JSON.parse(readFileSync('technology-runtime/package.json', 'utf8'));
assert.deepEqual(newPackage.dependencies, oldPackage.dependencies, 'Runtime versions changed.');
const originalEvidence = JSON.parse(git('show', `${baseline}:${prefix}/src/technology/evidence.json`).toString());
assert.deepEqual(evidence, originalEvidence, 'Evidence changed; refuse to overwrite.');
const temporary = mkdtempSync(path.join(os.tmpdir(), 'atlas-technology-migration-'));
const originalCwd = process.cwd();
try {
  const archive = path.join(temporary, 'snapshot.tar');
  git('archive', '--output='+archive, `${baseline}:${prefix}`);
  execFileSync('tar', ['-xf', archive, '-C', temporary]);
  rmSync(archive);
  symlinkSync(path.join(projectRoot, 'node_modules'), path.join(temporary, 'node_modules'));
  const legacy = await import(pathToFileURL(path.join(temporary, 'scripts/technology-integrity.ts')).href);
  const records = [];
  for (const c of technologyCases) {
    const e = evidence[c.id];
    if (e?.status !== 'ready') continue;
    process.chdir(temporary);
    assert.equal(legacy.caseSourceHash(c), e.sourceHash, `${c.id}: invalid historical source identity`);
    process.chdir(originalCwd);
    for (const kind of ['poster', 'gallery', 'detail']) {
      const file = e.preview?.[kind as 'poster' | 'gallery' | 'detail'];
      assert(file, `${c.id}: missing preview`);
      assert.equal(sha256(readFileSync(path.join(projectRoot, 'public', file))), e.preview?.sha256?.[kind], `${c.id}: altered reviewed media`);
    }
    const next = caseSourceHash(c);
    records.push({id:c.id, previous:e.sourceHash, current:next});
    e.sourceHash = next;
  }
  atomicJson(path.join(projectRoot, 'src/technology/evidence.json'), evidence);
  proof.technologyLockMigration = { directRuntimeVersionsUnchanged: true, implementationUnchanged: true,
    note: 'Preserves dated historical browser evidence and exact reviewed media; does not claim a new browser or visual review. Transitive security overrides remain separately recorded in dependency verification.', records };
  atomicJson(proofFile, proof);
  console.log(`Migrated ${records.length} technology receipts after source and media verification.`);
} finally {
  process.chdir(originalCwd);
  rmSync(temporary, {recursive:true,force:true});
}
