// Created: 2026-10-06. Tested consumer normalization for this BT.709 native plate only.
import {copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

export const consumerColorFilter = 'colorspace=iall=bt709:irange=tv:all=bt709:trc=srgb:range=tv:format=yuv444p';

export function stageCommercialMedia(source: string, target: string, kind: 'image' | 'video') {
  if (kind === 'image') {copyFileSync(source, target); return;}
  // OffthreadVideo 4.0.530 decoded BT.709 transfer values as image RGB on this host.
  // Bake only the consumer transfer conversion; the original native media stays untouched.
  execFileSync('ffmpeg', ['-v', 'error', '-i', source, '-map', '0:v:0', '-an', '-vf', consumerColorFilter,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '0', '-threads', '1', '-pix_fmt', 'yuv444p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-color_range', 'tv', target],
  {timeout: 60000, stdio: 'pipe'});
}
