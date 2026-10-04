import { caseSourceHash } from "./technology-integrity";
/** Created: 2026-10-04. Capture real case runtimes; never render surrogate artwork. */
import { chromium, webkit, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import { technologyCases, type Evidence } from "../src/technology/registry";
const args = process.argv.slice(2),
  ids = args.filter((x) => /^SA-\d+$/.test(x));
const preview = args.includes("--previews"),
  wk = args.includes("--webkit"),
  readOnly = args.includes("--read-only"),
  url = process.env.ATLAS_URL ?? "http://127.0.0.1:4173/";
const root = process.cwd(),
  out = path.join(root, `.cache/technology-review${wk ? "-webkit" : ""}`);
await mkdir(out, { recursive: true });
const browser = await (wk
  ? webkit.launch({ headless: true })
  : chromium.launch({
      headless: true,
      executablePath:
        process.env.BROWSER_EXECUTABLE ??
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    }));
const version = browser.version(),
  evidence: Record<string, Evidence> = JSON.parse(
    await readFile("src/technology/evidence.json", "utf8"),
  );
const hash = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");

const report: Record<string, unknown>[] = [];
const previewInteractions: Record<string, string> = {
  "SA-128": "切換動作",
  "SA-131": "切換分類",
  "SA-134": "下一日",
  "SA-139": "下一個分類",
  "SA-141": "切換累積分布",
  "SA-142": "切換觀測窗",
  "SA-144": "下一個分區",
  "SA-145": "切換高值篩選",
  "SA-149": "下一站",
  "SA-150": "切換高值區域",
};
async function seek(page: Page, t: number) {
  await page.evaluate(async (time) => {
    await (window as any).__atlasRuntime.seek(time);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  }, t);
}
try {
  for (const c of technologyCases.filter(
    (c) => !ids.length || ids.includes(c.id),
  )) {
    const context = await browser.newContext({
      viewport: { width: 960, height: 620 },
      // Render on a 1280x720 backing surface for native detail-media pixels.
      deviceScaleFactor: 4 / 3,
      reducedMotion: "no-preference",
    });
    await context.addInitScript("globalThis.__name = (fn) => fn;");
    const page = await context.newPage();
    await page.routeWebSocket("**/*", socket => socket.close());
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const start = performance.now();
    const sourceHash = caseSourceHash(c);
    try {
      await page.goto(`${url}?capture=${c.id}`, { waitUntil: "load" });
      await page.waitForFunction(
        () =>
          document
            .querySelector(".technology-runtime")
            ?.getAttribute("data-ready") === "true" ||
          !!document
            .querySelector(".technology-runtime")
            ?.getAttribute("data-error"),
        {},
        { timeout: 45000 },
      );
      const error = await page
        .locator(".technology-runtime")
        .getAttribute("data-error");
      if (error) throw new Error(error);
      const stage = page.locator(".runtime-stage");
      const duration = c.durationSeconds ?? 4;
      const shots: Buffer[] = [];
      for (const t of [0, duration * 0.3, duration * 0.7, duration * 0.3]) {
        await seek(page, t);
        await page.waitForTimeout(70);
        shots.push(await stage.screenshot({ scale: "device" }));
      }
      const repeat = hash(shots[1]) === hash(shots[3]);
      const different = hash(shots[0]) !== hash(shots[2]);
      if (errors.length) throw new Error(errors.join("; "));
      const sheet = await sharp({
        create: { width: 960, height: 180, channels: 3, background: "#fff" },
      })
        .composite(
          await Promise.all(
            shots.slice(0, 3).map(async (b, i) => ({
              input: await sharp(b).resize(320, 180).toBuffer(),
              left: i * 320,
              top: 0,
            })),
          ),
        )
        .jpeg({ quality: 85 })
        .toBuffer();
      await writeFile(path.join(out, `${c.id}.jpg`), sheet);
      let media: Evidence["preview"] = evidence[c.id]?.preview;
      if (preview) {
        const frames = path.join(out, c.id);
        await mkdir(frames, { recursive: true });
        await seek(page, 0);
        const frameRate = 30;
        const drawing =
            c.variant === "draw" && ["konva", "fabricjs"].includes(c.primary),
          drag = c.primary === "motion" && c.variant === "gesture",
          transform = ["konva", "fabricjs"].includes(c.primary) && !drawing;
        for (let f = 0; f < duration * frameRate; f++) {
          await seek(page, f / frameRate);
          if (previewInteractions[c.id] && [15, 40].includes(f)) {
            await stage
              .getByRole("button", {
                name: previewInteractions[c.id],
                exact: true,
              })
              .click();
            await page.waitForTimeout(100);
          }
          if (drawing || drag || transform) {
            const b = await stage.boundingBox();
            if (b) {
              const startX = drag ? 465 : transform ? 245 : 200;
              const startY = drag ? 240 : transform ? 240 : 300;
              if (f === 10) {
                await page.mouse.move(b.x + startX, b.y + startY);
                await page.mouse.down();
              }
              if (f >= 10 && f < 42)
                await page.mouse.move(
                  b.x + startX + (f - 10) * (drag ? 6 : transform ? 8 : 15),
                  b.y + startY + 60 * Math.sin((f - 10) * 0.18),
                );
              if (f === 42) await page.mouse.up();
            }
          }
          if (c.video === "recorded-live") await page.waitForTimeout(35);
          await stage.screenshot({
            path: path.join(frames, `${String(f).padStart(4, "0")}.png`),
            scale: "device",
          });
        }
        const poster = `media/${c.id.toLowerCase()}-technology.jpg`,
          gallery = `media/${c.id.toLowerCase()}-technology.mp4`,
          detail = `media/${c.id.toLowerCase()}-technology-detail.mp4`;
        const captured = await sharp(shots[1]).metadata();
        if (captured.width !== 1280 || captured.height !== 720)
          throw new Error(
            `Expected native 1280x720 capture, got ${captured.width}x${captured.height}`,
          );
        await sharp(shots[1])
          .jpeg({ quality: 90 })
          .toFile(path.join(root, "public", poster));
        execFileSync(process.env.FFMPEG_PATH ?? "ffmpeg", [
          "-y",
          "-v",
          "error",
          "-framerate",
          String(frameRate),
          "-i",
          path.join(frames, "%04d.png"),
          "-vf",
          "scale=480:270:flags=lanczos",
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "21",
          "-pix_fmt",
          "yuv420p",
          "-r",
          "30",
          "-movflags",
          "+faststart",
          path.join(root, "public", gallery),
        ]);
        execFileSync(process.env.FFMPEG_PATH ?? "ffmpeg", [
          "-y", "-v", "error", "-framerate", String(frameRate), "-i",
          path.join(frames, "%04d.png"), "-vf", "scale=1280:720:flags=lanczos",
          "-c:v", "libx264", "-preset", "fast", "-crf", "21", "-pix_fmt",
          "yuv420p", "-r", "30", "-movflags", "+faststart",
          path.join(root, "public", detail),
        ]);
        media = {
          poster,
          gallery,
          detail,
          sha256: {
            poster: hash(readFileSync(path.join(root, "public", poster))),
            gallery: hash(readFileSync(path.join(root, "public", gallery))),
            detail: hash(readFileSync(path.join(root, "public", detail))),
          },
        };
        await rm(frames, { recursive: true });
      }
      if (caseSourceHash(c) !== sourceHash) throw new Error("Case source changed during capture; discard this verification and retry after source freeze.");
      evidence[c.id] = {
        ...evidence[c.id],
        status: evidence[c.id]?.status === "ready" ? "ready" : "partial",
        sourceHash,
        runtime: [
          ...new Set([
            ...(evidence[c.id]?.runtime ?? []),
            `${wk ? "Playwright WebKit" : "Google Chrome"} ${version}: mount, four seeks, no uncaught errors`,
          ]),
        ],
        preview: media,
        video:
          repeat && c.video === "frame-driven"
            ? "Representative nonsequential seeks repeat pixel-identically in the tested browser; no full production export or cross-device claim."
            : `${c.video}; deterministic export unverified.`,
        performance: {
          status: "measured",
          context: `Single case at 960x540 DPR1 in ${wk ? "WebKit" : "Chrome"} ${version}; elapsed includes navigation and screenshot work, not an FPS benchmark.`,
          metrics: { inspectionMs: Math.round(performance.now() - start) },
        },
        date: new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Taipei",
        }),
        notes: [
          `Noninitial frame changed: ${different}; repeated sampled frame identical: ${repeat}.`,
          "Physical Safari/iPhone not tested.",
        ],
      };
      report.push({ id: c.id, pass: true, different, repeat });
      console.log(
        `PASS ${c.id} ${c.primary} changed=${different} repeat=${repeat}`,
      );
    } catch (error) {
      report.push({ id: c.id, pass: false, error: String(error) });
      evidence[c.id] = {
        ...evidence[c.id],
        status: "partial",
        notes: [String(error)],
      };
      console.error(`FAIL ${c.id}: ${error}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (!readOnly)
  await writeFile(
    "src/technology/evidence.json",
    JSON.stringify(evidence, null, 2) + "\n",
  );
await writeFile(
  path.join(out, `runtime-${wk ? "webkit" : "chrome"}.json`),
  JSON.stringify(report, null, 2) + "\n",
);
const sheets = readdirSync(out)
  .filter((x) => /^SA-\d+\.jpg$/.test(x))
  .sort();
for (let i = 0; i < sheets.length; i += 12) {
  const page = sheets.slice(i, i + 12);
  await sharp({
    create: {
      width: 960,
      height: 210 * page.length,
      channels: 3,
      background: "#fff",
    },
  })
    .composite(
      (
        await Promise.all(
          page.map(async (f, j) => [
            {
              input: Buffer.from(
                `<svg width="960" height="30"><text x="12" y="22" font-size="20">${f.slice(0, -4)}</text></svg>`,
              ),
              left: 0,
              top: j * 210,
            },
            {
              input: await readFile(path.join(out, f)),
              left: 0,
              top: j * 210 + 30,
            },
          ]),
        )
      ).flat(),
    )
    .jpeg({ quality: 85 })
    .toFile(path.join(out, `contact-${i / 12 + 1}.jpg`));
}
console.log(
  JSON.stringify({
    tested: report.length,
    passed: report.filter((x) => x.pass).length,
    failed: report.filter((x) => !x.pass).length,
  }),
);
if (report.some((x) => !x.pass)) process.exitCode = 1;
