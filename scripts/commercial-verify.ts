// Created: 2026-10-06. Real FORM render/encoded-playback verification, outside the gallery.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {mkdtemp, readFile, rm, mkdir, copyFile, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {chromium} from '@playwright/test';
import sharp from 'sharp';
import {stageCommercialMedia} from './commercial-media';

const [landscapeInput, portraitInput, batchReport, evidenceDirectory, outputReport] = process.argv.slice(2);
const executionId = randomUUID(), startedAt = new Date().toISOString();
if (!landscapeInput || !portraitInput || !batchReport || !evidenceDirectory || !outputReport) {
  throw new Error('Expected two derived inputs, successful batch report, selected-evidence directory and result JSON');
}
const inputs = await Promise.all([landscapeInput, portraitInput].map(async file => JSON.parse(await readFile(file, 'utf8'))));
const batch = JSON.parse(await readFile(batchReport, 'utf8'));
assert.equal(batch.status, 'PASS');
const media = batch.items.map((item: {id: string; package: string}) => ({id: item.id, file: path.join(item.package, 'video.mp4')}));
const work = await mkdtemp(path.join(os.tmpdir(), 'form-runtime-'));
const results: unknown[] = [];
let renderer: Awaited<ReturnType<typeof openBrowser>> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
const server = createServer(async (request, response) => {
  try {
    const match = /^\/(\d+)\.mp4$/.exec(request.url || '');
    const file = match && media[Number(match[1])]?.file;
    if (!file) {response.writeHead(404).end(); return;}
    const bytes = await readFile(file);
    const range = request.headers.range && /^bytes=(\d+)-(\d*)$/.exec(request.headers.range);
    if (range) {
      const from = Number(range[1]), to = range[2] ? Number(range[2]) : bytes.length - 1;
      response.writeHead(206, {'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${from}-${to}/${bytes.length}`, 'Content-Length': to - from + 1});
      response.end(bytes.subarray(from, to + 1));
    } else {response.writeHead(200, {'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': bytes.length}); response.end(bytes);}
  } catch {response.writeHead(500).end();}
});
try {
  await mkdir(path.join(work, 'public'));
  await mkdir(evidenceDirectory, {recursive: true});
  for (const asset of Object.values(inputs[0].assetFiles) as {absolute_path: string; file: string; kind: 'image' | 'video'}[]) {
    stageCommercialMedia(asset.absolute_path, path.join(work, 'public', asset.file), asset.kind);
  }
  const started = performance.now();
  const serveUrl = await bundle({entryPoint: inputs[0].entry, outDir: path.join(work, 'bundle'),
    publicDir: path.join(work, 'public'), enableCaching: false});
  renderer = await openBrowser('chrome', {browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', logLevel: 'warn'});
  for (const input of inputs) {
    const composition = await selectComposition({serveUrl, id: input.composition, inputProps: input.props, puppeteerInstance: renderer});
    const observedScenes = composition.props.scenes as {clip_id: string; source_id: string; source_in: number; source_out: number; start: number; duration: number}[];
    results.push({check: 'consumer composition timing readback', variant: input.props.variantId, status: 'PASS',
      composition: composition.id, fps: composition.fps, durationInFrames: composition.durationInFrames,
      scenes: observedScenes.map(scene => ({clipId: scene.clip_id, sourceId: scene.source_id,
        sourceRange: [scene.source_in, scene.source_out], recordRange: [scene.start, scene.start + scene.duration]})),
      example: {clipId: 'reveal', sourceFrame: 48, recordFrame: 120},
      source: 'selectComposition returned props from the exact render-input.json sidecar supplied to successful encode'});
    const frames = input.props.variantId === 'landscape' ? [120, 205, 120, 205, 28, 61, 71, 72, 145, 161, 162, 235, 251, 252, 282, 300, 359] : [28, 61, 120, 161, 162, 205, 251, 252, 300, 359];
    const prior = new Map<number, Buffer>();
    for (const [index, frame] of frames.entries()) {
      const file = path.join(work, `${input.props.variantId}-${index}.png`);
      await renderStill({serveUrl, composition, inputProps: input.props, frame, output: file,
        imageFormat: 'png', puppeteerInstance: renderer});
      const pixels = await sharp(file).ensureAlpha().raw().toBuffer();
      if (prior.has(frame)) assert.deepEqual(pixels, prior.get(frame), `Nondeterministic frame ${frame}`);
      prior.set(frame, pixels);
      if ([28, 61, 71, 72, 120, 161, 162, 205, 251, 252, 300, 359].includes(frame)) {
        await copyFile(file, path.join(evidenceDirectory, `${input.props.variantId}-${frame}.png`));
      }
    }
    assert.notDeepEqual(prior.get(28), prior.get(120));
    assert.notDeepEqual(prior.get(120), prior.get(205));
    results.push({check: 'public renderStill out-of-order / repeated frames / edit boundaries', variant: input.props.variantId,
      status: 'PASS', frames, comparison: 'exact RGBA on repeated states; same host; fresh capture pages, not a live seek API'});
  }
  await renderer.close({silent: true}); renderer = undefined;
  await new Promise<void>((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  const port = (server.address() as {port: number}).port;
  browser = await chromium.launch({executablePath: process.env.REMOTION_BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
  for (const [index, item] of media.entries()) {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<video muted playsinline preload="auto" src="http://127.0.0.1:${port}/${index}.mp4"></video>`);
    await page.waitForFunction(() => document.querySelector('video')!.readyState === 4);
    await page.evaluate(() => document.querySelector('video')!.play());
    await page.waitForFunction(() => document.querySelector('video')!.ended, {}, {timeout: 20000});
    const state = await page.evaluate(() => {const v = document.querySelector('video')!; return {time: v.currentTime,
      duration: v.duration, width: v.videoWidth, height: v.videoHeight, readyState: v.readyState, error: v.error?.code ?? null,
      frames: v.getVideoPlaybackQuality().totalVideoFrames, dropped: v.getVideoPlaybackQuality().droppedVideoFrames};});
    assert.equal(state.error, null); assert.equal(state.readyState, 4); assert.ok(state.time >= 12);
    assert.ok(state.frames >= 350); assert.deepEqual(errors, []);
    const expected = inputs.find(input => input.props.variantId === item.id)!.props.delivery;
    assert.equal(state.width, expected.width); assert.equal(state.height, expected.height);
    await page.evaluate(() => {const v = document.querySelector('video')!; v.currentTime = 0; return v.play();});
    await page.waitForFunction(() => document.querySelector('video')!.currentTime > .25);
    await page.evaluate(() => document.querySelector('video')!.pause());
    results.push({check: 'full encoded browser playback and restart', variant: item.id, status: 'PASS', ...state});
    await page.close();
  }
  const report = {status: 'PASS', execution_id: executionId, started_at: startedAt, observed_at: new Date().toISOString(),
    remotion_version: JSON.parse(await readFile(path.resolve('node_modules/remotion/package.json'), 'utf8')).version,
    browser: browser.version(), elapsedSeconds: (performance.now() - started) / 1000, results,
    limits: ['Same-host Chromium only', 'No physical display/device test', 'Intentional mute, no listening acceptance',
      'Creative review is separately observed and is not established by these assertions']};
  await writeFile(outputReport, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (renderer) await renderer.close({silent: true});
  if (browser) await browser.close();
  if (server.listening) await new Promise<void>(resolve => server.close(() => resolve()));
  await rm(work, {recursive: true, force: true});
}
