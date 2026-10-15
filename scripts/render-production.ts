// Created: 2026-10-06
// Engine-local adapter. Never modifies Atlas catalog, media or review status.
import {readFileSync, mkdirSync, rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia, renderStill} from '@remotion/renderer';

const [inputPath, outputPath, mode = 'video'] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error('Expected derived input JSON and staging output path');
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const props = input.props;
const work = path.join(path.dirname(outputPath), `.render-${process.pid}`);
mkdirSync(work, {recursive: true});
let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
try {
  const serveUrl = await bundle({entryPoint: input.entry, outDir: path.join(work, 'bundle'),
    publicDir: path.resolve('evaluation/public'), enableCaching: false});
  browser = await openBrowser('chrome', {
    browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    logLevel: 'warn',
  });
  const composition = await selectComposition({serveUrl, id: input.composition, inputProps: props, puppeteerInstance: browser});
  if (mode.startsWith('still:')) {
    const frame = Number(mode.slice(6));
    await renderStill({serveUrl, composition, inputProps: props, frame, output: outputPath,
      imageFormat: 'png', puppeteerInstance: browser});
  } else {
    const alpha = props.delivery.alpha !== 'none';
    const separateAudio = props.delivery.audio;
    const silentVideo = path.join(work, `picture${path.extname(outputPath)}`);
    const pcmAudio = path.join(work, 'narration.wav');
    await renderMedia({serveUrl, composition, inputProps: props, outputLocation: separateAudio ? silentVideo : outputPath,
      codec: props.delivery.codec, imageFormat: 'png', pixelFormat: alpha ? 'yuva444p10le' : 'yuv420p',
      ...(props.delivery.codec === 'prores' ? {proResProfile: '4444' as const} : {crf: 18, x264Preset: 'fast' as const}),
      ...(separateAudio ? {audioCodec: 'pcm-16' as const, separateAudioTo: pcmAudio} : {}),
      colorSpace: 'bt709', sampleRate: props.delivery.sample_rate, concurrency: 1,
      puppeteerInstance: browser, logLevel: 'warn',
    });
    if (separateAudio) {
      // Preserve Remotion's authoritative edit/audio mapping in lossless PCM.
      // Encode AAC directly into MP4 so priming metadata survives; the installed
      // raw-AAC intermediate path measured a 2048-sample delay in this fixture.
      // Copy video bytes, encode audio once; never compensate with a guessed offset.
      execFileSync('ffmpeg', ['-v','error','-y','-i',silentVideo,'-i',pcmAudio,
        '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a',props.delivery.codec === 'prores' ? 'pcm_s16le' : 'aac',
        '-ar',String(props.delivery.sample_rate),'-movflags','+faststart',outputPath], {timeout:120000,stdio:'pipe'});
    }
  }
} finally {
  if (browser) await browser.close({silent: true});
  rmSync(work, {recursive: true, force: true});
}
