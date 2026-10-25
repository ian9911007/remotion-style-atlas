/** Created: 2026-10-25. Catalog/source/encoded-media integrity for original demos. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import collection from '../src/technology/original-demo-catalog.generated.json';
import {technologyCases,evidence} from '../src/technology/registry';
import {caseSourceHash} from '../scripts/technology-integrity';
const originals=collection.entries.filter(e=>e.source_kind==='original_editable_demo');
const sha=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
test('one source authority, three original IDs and honest link-only candidates',()=>{
 const file='../../Resources/motion-design-library/engine-adapters/original-demo-collection.json';
 assert.equal(collection.sourceHash,sha(file));assert.equal(originals.length,3);
 assert.equal(new Set(collection.entries.map(e=>e.id)).size,collection.entries.length);
 for(const e of collection.entries){assert.ok(['original_editable_demo','reference_only','prompt_seed','third_party_package_candidate'].includes(e.source_kind));if(e.source_kind==='original_editable_demo'){assert.equal(technologyCases.filter(c=>c.id===e.case_id).length,1);for(const p of e.source_files)assert.ok(existsSync('../../'+p));}else{assert.equal(e.preview,null);assert.equal(e.source_files.length,0);assert.equal(e.acquisition_status,'not_acquired')}}
});
test('actual preview files match source identity, hashes, dimensions and silent 6-second CFR contract',async()=>{
 for(const e of originals){const c=technologyCases.find(c=>c.id===e.case_id)!;const receipt=evidence[c.id];assert.equal(receipt.sourceHash,caseSourceHash(c));
  for(const kind of ['gallery','detail','poster'] as const){const file='public/'+e.preview![kind];assert.equal(sha(file),receipt.preview!.sha256![kind]);if(kind==='poster'){const m=await sharp(file).metadata();assert.equal(m.width,1280);assert.equal(m.height,720);continue;}
   const result=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-of','json',file],{encoding:'utf8'}));const streams=result.streams;const v=streams.find((s:any)=>s.codec_type==='video');assert.equal(v.codec_name,'h264');assert.equal(v.avg_frame_rate,'30/1');assert.equal(v.nb_frames,'180');assert.equal(v.width,kind==='gallery'?480:1280);assert.equal(v.height,kind==='gallery'?270:720);assert.equal(streams.some((s:any)=>s.codec_type==='audio'),false);
  }
 }
});
test('built source downloads are byte-identical to the real reusable source',()=>{
 for(const file of ['original-motion.ts','types.ts'])assert.equal(readFileSync('dist/source/'+file+'.txt','utf8'),readFileSync('technology-runtime/src/'+file,'utf8'));
});
