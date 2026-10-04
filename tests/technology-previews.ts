/** Created: 2026-10-04. Decode every new preview through an actual looping HTML video. */
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { technologyCases, caseEvidence } from "../src/technology/registry";
const base = process.env.ATLAS_URL ?? "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.BROWSER_EXECUTABLE ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const results: unknown[] = [];
try {
  for (let i = 0; i < technologyCases.length; i += 6) {
    const batch = technologyCases.slice(i, i + 6);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 600 },
    });
    await context.addInitScript("globalThis.__name = (fn) => fn;");
    const page = await context.newPage();
    await page.goto(base);
    await page.evaluate(() => {
      document.getElementById("root")!.remove();
    });
    const clips = batch.map((c) => ({
      id: c.id,
      src: new URL(caseEvidence(c.id).preview!.gallery, base).href,
      duration: c.durationSeconds ?? 4,
    }));
    const measured = await page.evaluate(async (clips) => {
      return Promise.all(
        clips.map(
          (clip) =>
            new Promise<{
              id: string;
              duration: number;
              frames: number;
              wraps: number;
              error: string | null;
            }>((resolve) => {
              const v = document.createElement("video");
              Object.assign(v, {
                src: clip.src,
                muted: true,
                loop: true,
                playsInline: true,
              });
              v.style.cssText = "width:480px;height:270px";
              document.body.append(v);
              let frames = 0,
                wraps = 0,
                previous = 0,
                done = false;
              const finish = (error: string | null) => {
                if (done) return;
                done = true;
                clearTimeout(timeout);
                const result = {
                  id: clip.id,
                  duration: v.duration,
                  frames,
                  wraps,
                  error,
                };
                v.pause();
                v.removeAttribute("src");
                v.load();
                v.remove();
                resolve(result);
              };
              const timeout = setTimeout(
                () => finish("Timed out before a complete decode and loop"),
                (clip.duration * 2 + 5) * 1000,
              );
              v.onerror = () => finish(v.error?.message ?? "Media error");
              const tick = () => {
                if (done) return;
                frames++;
                if (
                  previous > clip.duration * 0.7 &&
                  v.currentTime < clip.duration * 0.3
                )
                  wraps++;
                previous = v.currentTime;
                if (wraps && frames >= clip.duration * 30 * 0.8) {
                  finish(null);
                  return;
                }
                v.requestVideoFrameCallback(tick);
              };
              v.requestVideoFrameCallback(tick);
              void v.play().catch((e) => finish(String(e)));
            }),
        ),
      );
    }, clips);
  for (const r of measured) {
      assert.equal(r.error, null, r.id);
      assert.ok(r.wraps > 0, r.id);
      console.log(`PASS ${r.id}: ${r.frames} decoded frames, ${r.wraps} loop`);
      results.push(r);
    }
    await context.close();
  }
  const detailSizes: { id: string; width: number; height: number }[] = [];
  for (let i = 0; i < technologyCases.length; i += 6) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const urls = technologyCases.slice(i, i + 6).map((c) => ({
      id: c.id,
      src: new URL(
        caseEvidence(c.id).preview!.detail ?? caseEvidence(c.id).preview!.gallery,
        base,
      ).href,
    }));
    detailSizes.push(
      ...(await page.evaluate(
        async (items) =>
          Promise.all(
            items.map(
              (item) =>
                new Promise<{ id: string; width: number; height: number }>(
                  (resolve, reject) => {
                    const video = document.createElement("video");
                    video.preload = "metadata";
                    video.src = item.src;
                    video.onloadedmetadata = () => {
                      const dimensions = {
                        id: item.id,
                        width: video.videoWidth,
                        height: video.videoHeight,
                      };
                      video.removeAttribute("src");
                      video.load();
                      resolve(dimensions);
                    };
                    video.onerror = () => reject(new Error(`${item.id}: detail media failed`));
                    document.body.append(video);
                  },
                ),
            ),
          ),
        urls,
      )),
    );
    await context.close();
  }
  for (const item of detailSizes) {
    assert.equal(item.width, 1280, `${item.id} detail width`);
    assert.equal(item.height, 720, `${item.id} detail height`);
  }
  writeFileSync(
    "docs/technology-preview-verification.json",
    JSON.stringify(
      {
        date: new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Taipei",
        }),
        browser: browser.version(),
        url: base,
        concurrency: 6,
        method:
          "Actual HTMLVideoElement decoding and observed loop boundary. This is playback integrity, not a frame-rate benchmark or a substitute for visual review.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
