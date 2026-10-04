/** Created: 2026-10-04. Verify actual emitted lazy boundaries and static-host assets. */
import assert from "node:assert/strict";
import {readFileSync, writeFileSync, existsSync, readdirSync, statSync} from "node:fs";
import {gzipSync} from "node:zlib";
import {technologyCases, caseEvidence} from "../src/technology/registry";
const manifest = JSON.parse(readFileSync("dist/.vite/manifest.json", "utf8"));
const eager = new Set<string>();
function visit(key: string) {
  if (eager.has(key)) return;
  eager.add(key);
  assert.ok(manifest[key], `Unknown build import ${key}`);
  for (const child of manifest[key].imports ?? []) visit(child);
}
for (const [key, entry] of Object.entries(manifest) as [string, any][]) if (entry.isEntry) visit(key);
assert.equal([...eager].filter(key => key.startsWith("technology-runtime/src/")).length, 0, "Heavy cases must not enter the initial import graph.");
const lazyImports = new Set<string>([...eager].flatMap(key => manifest[key].dynamicImports ?? []));
const caseEntries = new Map<string, string>();
for (const c of technologyCases) {
  const sourceKey = `technology-runtime/src/${c.module}`;
  // Rollup promotes shared dynamic entries to named chunks when a library's
  // own dynamic imports form a shared graph. Resolve the emitted identity,
  // then prove that it is only reached through the application's lazy edge.
  const matches = manifest[sourceKey] ? [sourceKey] : Object.keys(manifest).filter(key =>
    manifest[key].name === c.module.replace(/\.tsx?$/, "") && manifest[key].isDynamicEntry);
  assert.equal(matches.length, 1, `${c.id}: ambiguous or missing emitted runtime`);
  const key = matches[0];
  assert.ok(manifest[key]?.isDynamicEntry, `${c.id}: runtime must be a real lazy entry`);
  assert.ok(lazyImports.has(key), `${c.id}: missing application dynamic import`);
  assert.ok(!eager.has(key), `${c.id}: runtime entered the eager import graph`);
  caseEntries.set(c.id, key);
  const e=caseEvidence(c.id);
  for(const file of [e.preview?.poster,e.preview?.gallery,...c.assets.map(a=>a.path)])
    assert.ok(file && existsSync(`dist/${file}`), `${c.id}: missing deployed asset ${file}`);
}
function files(directory:string): string[] {return readdirSync(directory).flatMap(name=>{const file=`${directory}/${name}`;return statSync(file).isDirectory()?files(file):[file];});}
const all=files("dist");
assert.ok(!all.some(file=>file.includes("SKILL.md")||file.includes("references/technologies")),"Full Skills must not ship to the browser.");
const initialFiles=[...eager].map(key=>manifest[key].file);
const record={created:new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"}),scope:"Actual Vite output; bytes are file sizes, not memory usage or runtime performance.",caseCount:technologyCases.length,totalFileCount:all.length,totalBytes:all.reduce((sum,file)=>sum+statSync(file).size,0),initialJavaScriptBytes:initialFiles.reduce((sum,file)=>sum+statSync(`dist/${file}`).size,0),initialJavaScriptGzipBytes:initialFiles.reduce((sum,file)=>sum+gzipSync(readFileSync(`dist/${file}`)).length,0),initialImportKeys:[...eager],lazyCaseEntries:technologyCases.map(c=>({id:c.id,entry:manifest[caseEntries.get(c.id)!].file})),mediaBytes:all.filter(file=>file.startsWith("dist/media/")).reduce((sum,file)=>sum+statSync(file).size,0),unverified:["No universal dependency-size ranking, GPU memory peak, FPS claim or mobile performance conclusion."]};
writeFileSync("docs/technology-build-verification.json",JSON.stringify(record,null,2)+"\n");
console.log(JSON.stringify({caseCount:record.caseCount,totalBytes:record.totalBytes,initialJavaScriptBytes:record.initialJavaScriptBytes,lazyBoundaries:"PASS",deployedAssets:"PASS"}));
