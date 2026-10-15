// Created: 2026-10-15. Both package-manager layouts must invalidate case evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {caseSourceHash} from '../scripts/technology-integrity';
import type {CaseDefinition} from '../technology-runtime/src/types';
test('case evidence prefers the active pnpm lock and fails when no lock exists', () => {
 const cwd=process.cwd(), temporary=mkdtempSync(path.join(os.tmpdir(),'atlas-lock-test-'));
 try {
  mkdirSync(path.join(temporary,'technology-runtime/src'),{recursive:true});
  writeFileSync(path.join(temporary,'technology-runtime/src/case.ts'),'export const scene = 1;');
  process.chdir(temporary);
  const c={module:'case.ts',assets:[]} as unknown as CaseDefinition;
  assert.throws(()=>caseSourceHash(c));
  writeFileSync('technology-runtime/package-lock.json','legacy');
  const old=caseSourceHash(c);
  writeFileSync('technology-runtime/pnpm-lock.yaml','current');
  const current=caseSourceHash(c);
  assert.notEqual(current,old);
  writeFileSync('technology-runtime/package-lock.json','irrelevant legacy edit');
  assert.equal(caseSourceHash(c),current);
  writeFileSync('technology-runtime/pnpm-lock.yaml','changed dependency graph');
  assert.notEqual(caseSourceHash(c),current);
  unlinkSync('technology-runtime/pnpm-lock.yaml');
  assert.notEqual(caseSourceHash(c),current);
 } finally {process.chdir(cwd);rmSync(temporary,{recursive:true,force:true});}
});
