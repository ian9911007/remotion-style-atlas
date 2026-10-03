import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readCatalog, projectRoot } from "./render";
const ids = process.argv.slice(2);
const styles = readCatalog().filter(
  (s) =>
    (!ids.length || ids.includes(s.id)) &&
    ["rendered", "reviewed", "published"].includes(s.status),
);
if (!styles.length) throw new Error("No rendered entries.");
const base = process.env.ATLAS_URL || "http://127.0.0.1:4173";
const dir = path.join(projectRoot, ".cache/watch");
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
const results: unknown[] = [];
try {
  await page.goto(base);
  for (let offset = 0; offset < styles.length; offset += 6) {
    const batch = styles.slice(offset, offset + 6);
    for (const kind of ["gallery", "detail"] as const) {
      await page.setContent(
        `<html><head><style>body{margin:0;background:#101211;color:#fff;font:16px Arial}main{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:14px}video{width:100%;aspect-ratio:16/9;background:#131514}p{margin:8px 0}b{font-size:13px;color:#bec8b6}</style></head><body><main>${batch.map((s) => `<section><p>${s.id} ${s.englishName}<br/><b>${kind} · ${s.preview[kind === "gallery" ? "galleryDuration" : "detailDuration"]} sec</b></p><video id="${s.id}" muted playsinline loop src="${base}/${s.preview[kind]}"></video></section>`).join("")}</main></body></html>`,
      );
      await page.locator("video").evaluateAll(async (nodes) => {
        await Promise.all(
          nodes.map(
            (node) =>
              new Promise<void>((resolve, reject) => {
                const v = node as HTMLVideoElement;
                v.onloadeddata = () => resolve();
                v.onerror = () => reject(new Error("Video decode failed"));
                if (v.readyState >= 2) resolve();
              }),
          ),
        );
        await Promise.all(
          nodes.map((node) => (node as HTMLVideoElement).play()),
        );
      });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(dir, `batch-${offset / 6 + 1}-${kind}-early.jpg`),
        type: "jpeg",
        quality: 90,
      });
      await page.waitForTimeout(1900);
      await page.screenshot({
        path: path.join(dir, `batch-${offset / 6 + 1}-${kind}-motion.jpg`),
        type: "jpeg",
        quality: 90,
      });
      const max = Math.max(
        ...batch.map(
          (s) =>
            s.preview[
              kind === "gallery" ? "galleryDuration" : "detailDuration"
            ],
        ),
      );
      await page.waitForTimeout((max + 0.7) * 1000 - 2500);
      const decoded = await page.locator("video").evaluateAll((nodes) =>
        nodes.map((node) => {
          const v = node as HTMLVideoElement;
          return {
            id: v.id,
            currentTime: v.currentTime,
            duration: v.duration,
            readyState: v.readyState,
            paused: v.paused,
            error: v.error?.message || null,
            decodedFrames: v.getVideoPlaybackQuality().totalVideoFrames,
            droppedFrames: v.getVideoPlaybackQuality().droppedVideoFrames,
          };
        }),
      );
      if (
        decoded.some(
          (v) =>
            v.error || v.paused || v.readyState < 2 || v.decodedFrames < 30,
        )
      )
        throw new Error(`Playback failed ${JSON.stringify(decoded)}`);
      results.push({ kind, batch: offset / 6 + 1, decoded });
      await page.screenshot({
        path: path.join(dir, `batch-${offset / 6 + 1}-${kind}-loop.jpg`),
        type: "jpeg",
        quality: 90,
      });
      console.log(
        `${kind}: loop-played ${batch.map((s) => s.id).join(", ")}; decoded frames verified.`,
      );
    }
  }
  writeFileSync(
    path.join(dir, "observations.json"),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
