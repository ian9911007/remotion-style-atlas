/** Created: 2026-10-04. Read-only browser resource diagnostic; never imported by the gallery. */
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const caseId = process.env.RESOURCE_CASE ?? 'SA-001';
const cycles = Number(process.env.RESOURCE_CYCLES ?? 12);
const explicitClose = process.env.RESOURCE_NATIVE_CLOSE === '1';
const activate = process.env.RESOURCE_ACTIVATE === '1';
const settleMs = Number(process.env.RESOURCE_SETTLE_MS ?? 150);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem('remotion-atlas.preferences.v1', JSON.stringify({ version: 2, favorites: [], selections: [], mode: 'still', paused: true }));
});
const page = await context.newPage();
await page.routeWebSocket('**/*', socket => socket.close());
const session = await context.newCDPSession(page);
const errors: string[] = [];
page.on('pageerror', error => errors.push(error.message));
await session.send('Performance.enable');
try {
  await page.goto(process.env.ATLAS_URL ?? 'http://127.0.0.1:4173/');
  await page.locator('.gallery-grid').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const checkpoints: Record<string, number>[] = [];
  async function checkpoint(cycle: number) {
    await session.send('HeapProfiler.collectGarbage');
    const { metrics } = await session.send('Performance.getMetrics');
    checkpoints.push({ cycle, frames: page.frames().length, ...Object.fromEntries(metrics.filter(metric => ['JSHeapUsedSize', 'Nodes', 'JSEventListeners', 'Documents'].includes(metric.name)).map(metric => [metric.name, metric.value])) });
  }
  await checkpoint(0);
  for (let cycle = 1; cycle <= cycles; cycle++) {
    await page.evaluate(id => { location.hash = `/style/${id}`; }, caseId);
    await page.getByRole('button', { name: '關閉風格檢視', exact: true }).waitFor();
    if (activate) {
      // Locator waiting does not retain an ElementHandle in the DevTools context.
      // An undisposed waitForSelector result would retain the detached dialog.
      await page.locator('.technology-runtime[data-ready=true]').waitFor({ timeout: 45000 });
      await page.getByRole('button', { name: '暫停互動', exact: true }).click();
      await page.evaluate(async () => {
        await (window as unknown as { __atlasRuntime: { seek(time: number): Promise<void> } }).__atlasRuntime.seek(2);
      });
    }
    if (explicitClose) {
      // Browser-only candidate-repair experiment; no served source is modified.
      await page.evaluate(() => {
        const dialog = document.querySelector<HTMLDialogElement>('.detail-dialog');
        dialog?.close();
        dialog?.querySelector<HTMLButtonElement>('[aria-label="關閉風格檢視"]')?.click();
      });
    } else {
      await page.getByRole('button', { name: '關閉風格檢視', exact: true }).click();
    }
    await page.waitForFunction(() => !document.querySelector('.detail-dialog'));
    await page.waitForTimeout(settleMs);
    if (page.frames().length !== 1) throw new Error(`Retained child frame after cycle ${cycle}`);
    if (cycle % 3 === 0 || cycle === cycles) await checkpoint(cycle);
  }
  if (process.env.RESOURCE_HEAP_PATH) {
    const chunks: string[] = [];
    session.on('HeapProfiler.addHeapSnapshotChunk', event => chunks.push(event.chunk));
    await session.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
    await writeFile(process.env.RESOURCE_HEAP_PATH, chunks.join(''));
  }
  console.log(JSON.stringify({ caseId, cycles, activate, explicitClose, settleMs, browser: browser.version(), viewport: { width: 1200, height: 900 }, galleryMode: 'still', hotReloadBlocked: true, measurement: 'CDP Performance.getMetrics after HeapProfiler.collectGarbage; renderer process metrics, not GPU allocation measurements', checkpoints, errors }, null, 2));
} finally {
  await browser.close();
}
