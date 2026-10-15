// Created: 2026-10-06. Explicit runtime test; not part of fast unit tests.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp, readFile, rm, mkdir, copyFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {chromium, type Page} from '@playwright/test';
import sharp from 'sharp';

const [inputFile, reportFile, repeatFile, evidenceDirectory] = process.argv.slice(2);
if (!inputFile || !reportFile || !repeatFile) throw new Error('Expected derived input, successful batch report and independently rendered canary');
const input = JSON.parse(await readFile(inputFile, 'utf8'));
const report = JSON.parse(await readFile(reportFile, 'utf8'));
assert.equal(report.status, 'PASS');
const media = report.items.filter((item: {id:string}) => item.id !== 'alpha').map((item: {id:string;package:string}) => ({id:item.id,file:path.join(item.package,'video.mp4')}));
const work = await mkdtemp(path.join(os.tmpdir(), 'remotion-production-runtime-'));
const results: unknown[] = [];
let renderer: Awaited<ReturnType<typeof openBrowser>> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
const server = createServer(async (request, response) => {
  try {
    const match = /^\/(\d+)\.mp4$/.exec(request.url || '');
    const file = match && media[Number(match[1])]?.file;
    if (!file) {response.writeHead(404).end(); return;}
    const bytes = await readFile(file);
    response.writeHead(200, {'Content-Type':'video/mp4','Content-Length':bytes.length});
    response.end(bytes);
  } catch {response.writeHead(500).end();}
});
try {
  const started = performance.now();
  const serveUrl = await bundle({entryPoint:input.entry,outDir:path.join(work,'bundle'),publicDir:path.resolve('evaluation/public'),enableCaching:false});
  renderer = await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',logLevel:'warn'});
  const composition = await selectComposition({serveUrl,id:input.composition,inputProps:input.props,puppeteerInstance:renderer});
  const frames = [180,6,270,180,6,0,119,120,239,240,359];
  const prior = new Map<number,Buffer>();
  for (let index=0;index<frames.length;index++) {
    const frame=frames[index], file=path.join(work,`${index}.png`);
    await renderStill({serveUrl,composition,inputProps:input.props,frame,output:file,imageFormat:'png',puppeteerInstance:renderer});
    const pixels=await sharp(file).ensureAlpha().raw().toBuffer();
    if(prior.has(frame)) assert.deepEqual(pixels,prior.get(frame),`Nonsequential repeated frame ${frame}`);
    prior.set(frame,pixels);
    if(evidenceDirectory && [0,6,180,270,359].includes(frame)) {
      await mkdir(evidenceDirectory,{recursive:true});
      await copyFile(file,path.join(evidenceDirectory,`remotion-frame-${frame}.png`));
    }
  }
  assert.notDeepEqual(prior.get(6),prior.get(180));
  assert.notDeepEqual(prior.get(180),prior.get(270));
  // Each public renderStill request creates a capture page. This checks frame-order
  // independence across requests, not an undocumented live-page seek API.
  results.push({check:'public renderStill out-of-order/repeat/boundaries',status:'PASS',frames,comparison:'exact RGBA; same host; fresh capture pages'});
  await renderer.close({silent:true}); renderer=undefined;
  const frameHashes=(file:string)=>execFileSync('ffmpeg',['-v','error','-i',file,'-map','0:v:0','-pix_fmt','rgb24','-f','framemd5','-'],{maxBuffer:8*1024*1024});
  assert.deepEqual(frameHashes(media.find((m:{id:string})=>m.id==='en-landscape')!.file),frameHashes(repeatFile));
  results.push({check:'independent encoded canary repeat',status:'PASS',frames:360,comparison:'exact decoded RGB frame hashes; same host'});
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const port=(server.address() as {port:number}).port;
  browser=await chromium.launch({executablePath:process.env.REMOTION_BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  for(let index=0;index<media.length;index++) {
    const page: Page=await browser.newPage();
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setContent(`<video muted playsinline preload="auto" src="http://127.0.0.1:${port}/${index}.mp4"></video>`);
    await page.waitForFunction(()=>document.querySelector('video')!.readyState===4);
    await page.evaluate(()=>document.querySelector('video')!.play());
    await page.waitForFunction(()=>document.querySelector('video')!.ended,{},{timeout:18000});
    const state=await page.evaluate(()=>{const v=document.querySelector('video')!;return {time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,readyState:v.readyState,error:v.error?.code ?? null,quality:v.getVideoPlaybackQuality().totalVideoFrames};});
    assert.equal(state.error,null); assert.equal(state.readyState,4); assert.ok(state.time>=12); assert.ok(state.quality>=350); assert.deepEqual(errors,[]);
    await page.evaluate(()=>{const v=document.querySelector('video')!;v.currentTime=0;return v.play();});
    await page.waitForFunction(()=>document.querySelector('video')!.currentTime>.25);
    await page.evaluate(()=>document.querySelector('video')!.pause());
    results.push({check:'full encoded playback and restart',variant:media[index].id,status:'PASS',...state});
    await page.close();
  }
  console.log(JSON.stringify({status:'PASS',browser:browser.version(),elapsedSeconds:(performance.now()-started)/1000,results},null,2));
} finally {
  if(renderer) await renderer.close({silent:true});
  if(browser) await browser.close();
  if(server.listening) await new Promise<void>(resolve=>server.close(()=>resolve()));
  await rm(work,{recursive:true,force:true});
}
