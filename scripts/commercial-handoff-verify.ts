// Created: 2026-10-06. Native sRGB image → encoded BT.709 → actual Remotion pixels.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp, readFile, rm, mkdir, copyFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import sharp from 'sharp';
import {consumerColorFilter, stageCommercialMedia} from './commercial-media';

const [plate, nativeFrame49, destination] = process.argv.slice(2);
if (!plate || !nativeFrame49 || !destination) throw new Error('Expected plate, original native frame49, and evidence directory');
const hash = async (file: string) => createHash('sha256').update(await readFile(file)).digest('hex');
const work = await mkdtemp(path.join(os.tmpdir(), 'form-handoff-'));
let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
const measurements = (actual: Buffer, expected: Buffer) => {
  assert.equal(actual.length, expected.length);
  const histogram = new Uint32Array(256), bias = [0, 0, 0]; let sum = 0;
  for (let i = 0; i < actual.length; i++) {const delta = actual[i] - expected[i], error = Math.abs(delta);
    sum += error; histogram[error]++; bias[i % 3] += delta;}
  const percentile = (p: number) => {let count = 0; for (let i = 0; i < histogram.length; i++) {
    count += histogram[i]; if (count >= actual.length * p) return i;} return 255;};
  return {meanAbsoluteError: sum / actual.length, p95: percentile(.95), p99: percentile(.99),
    meanChannelBias: bias.map(n => n / (actual.length / 3)), units: '8-bit RGB code values; all pixels'};
};
try {
  await mkdir(destination, {recursive: true}); await mkdir(path.join(work, 'public'));
  stageCommercialMedia(plate, path.join(work, 'public/plate.mp4'), 'video');
  const serveUrl = await bundle({entryPoint: path.resolve('evaluation/commercial-handoff.tsx'), outDir: path.join(work, 'bundle'),
    publicDir: path.join(work, 'public'), enableCaching: false});
  browser = await openBrowser('chrome', {browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', logLevel: 'warn'});
  const composition = await selectComposition({serveUrl, id: 'FormHandoffProbe', puppeteerInstance: browser});
  const consumer = path.join(destination, 'consumer-source48.png');
  await renderStill({serveUrl, composition, frame: 48, output: consumer, imageFormat: 'png', puppeteerInstance: browser});
  const pixels = await sharp(consumer).removeAlpha().raw().toBuffer();
  const native = await sharp(nativeFrame49).toColourspace('srgb').removeAlpha().raw().toBuffer();
  const decoded = execFileSync('ffmpeg', ['-v', 'error', '-i', plate, '-vf', 'select=eq(n\\,48),' + consumerColorFilter, '-frames:v', '1',
    '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], {maxBuffer: 8 * 1024 * 1024});
  await sharp(decoded, {raw: {width: 1280, height: 720, channels: 3}}).png().toFile(path.join(destination, 'decoded-source48-srgb.png'));
  await copyFile(nativeFrame49, path.join(destination, 'native-frame49.png'));
  const rgbToNative = measurements(pixels, native), rgbToDecode = measurements(pixels, decoded);
  const result = {status: rgbToNative.meanAbsoluteError <= 2 && rgbToNative.p95 <= 4 ? 'PASS' : 'REVIEW_REQUIRED',
    sourceFrame: 48, nativeFrame: 49, raster: [1280, 720], sourceSha256: await hash(plate), nativeFrameSha256: await hash(nativeFrame49),
    consumerSha256: await hash(consumer), nativeComparison: rgbToNative, encodedDecodeComparison: rgbToDecode,
    consumerNormalization: consumerColorFilter,
    method: 'Actual OffthreadVideo transparent/PNG 1:1 after explicit consumer normalization vs original Cycles display-referred sRGB and separately normalized decoded same video frame; no crop/overlay',
    acceptance: 'Mean <= 2 and p95 <= 4 RGB code values against native; inspect actual appearance separately',
    limits: ['Same host/software path', 'H264 loss and 16-to-8-bit quantization are retained', 'No monitor calibration or physical device claim']};
  await writeFile(path.join(destination, 'handoff-pixels.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (browser) await browser.close({silent: true});
  await rm(work, {recursive: true, force: true});
}
