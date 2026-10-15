// Created: 2026-10-06. Local FORM media adapter; exact source copies, no gallery mutation.
import {mkdirSync, readFileSync, rmSync} from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {stageCommercialMedia} from './commercial-media';

const [inputPath, outputPath, mode = 'video'] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error('Expected derived input JSON and output path');
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const work = path.join(path.dirname(outputPath), `.commercial-render-${process.pid}`);
mkdirSync(path.join(work, 'public'), {recursive: true});
let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
try {
  for (const asset of Object.values(input.assetFiles) as {absolute_path: string; file: string; kind: 'image' | 'video'}[]) {
    if (path.basename(asset.file) !== asset.file) throw new Error('UNSAFE_ASSET_NAME');
    stageCommercialMedia(asset.absolute_path, path.join(work, 'public', asset.file), asset.kind);
  }
  const serveUrl = await bundle({entryPoint: input.entry, outDir: path.join(work, 'bundle'),
    publicDir: path.join(work, 'public'), enableCaching: false});
  browser = await openBrowser('chrome', {browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', logLevel: 'warn'});
  const composition = await selectComposition({serveUrl, id: input.composition, inputProps: input.props, puppeteerInstance: browser});
  if (mode.startsWith('still:')) {
    await renderStill({serveUrl, composition, inputProps: input.props, frame: Number(mode.slice(6)),
      output: outputPath, imageFormat: 'png', puppeteerInstance: browser});
  } else {
    await renderMedia({serveUrl, composition, inputProps: input.props, outputLocation: outputPath,
      codec: 'h264', imageFormat: 'png', pixelFormat: 'yuv420p', colorSpace: 'bt709', crf: 17,
      x264Preset: 'fast', concurrency: 1, puppeteerInstance: browser, logLevel: 'warn', muted: true});
  }
} finally {
  if (browser) await browser.close({silent: true});
  rmSync(work, {recursive: true, force: true});
}
