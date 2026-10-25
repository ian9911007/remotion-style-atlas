/** Created: 2026-10-25. Real original-demo browser/parameter/source/media checks. */
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import {
  defaults,
  sceneSVG,
  validateConfig,
} from "../technology-runtime/src/original-motion";
import collection from "../src/technology/original-demo-catalog.generated.json";
const protectedOriginals = collection.entries.filter((e) =>
  ["SA-226", "SA-227", "SA-228"].includes(e.case_id ?? ""),
);
const base = process.env.ATLAS_URL || "http://127.0.0.1:4173/";
const evidence = process.env.MOTION_EVAL_EVIDENCE_DIR;
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
for (const [id, c] of Object.entries(defaults)) {
  assert.notEqual(sceneSVG(id, c, 0), sceneSVG(id, c, 3));
  assert.equal(sceneSVG(id, c, 2), sceneSVG(id, c, 2));
  assert.equal(sceneSVG(id, c, 0, true), sceneSVG(id, c, 3, true));
  for (const patch of [
    { duration: 0 },
    { width: 999 },
    { labels: ["x"] },
    { title: "x".repeat(31) },
    { accent: "red" },
    { screenshot: "https://example.com/image.png" },
  ])
    assert.throws(() => validateConfig({ ...c, ...patch }));
}
assert.equal(protectedOriginals.length, 3);
for (const e of collection.entries) {
  for (const key of [
    "id",
    "title",
    "preview",
    "category",
    "use_cases",
    "editable_parameters",
    "source_files",
    "engine",
    "source_url",
    "source_kind",
    "license_status",
    "acquisition_status",
    "visual_review",
    "tested_status",
  ])
    assert.ok(key in e, `${e.id}: ${key}`);
  for (const file of e.source_files)
    await readFile(path.resolve("../..", file));
  if (e.source_kind !== "original_editable_demo") {
    assert.equal(e.preview, null);
    assert.equal(e.source_files.length, 0);
  }
}
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.BROWSER_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const errors: string[] = [];
let checked = 0;
try {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "no-preference",
    });
    await context.addInitScript("globalThis.__name=(fn)=>fn");
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    for (const entry of protectedOriginals) {
      await page.goto(`${base}?capture=${entry.case_id}`);
      await page.waitForFunction(
        () =>
          document
            .querySelector(".technology-runtime")
            ?.getAttribute("data-ready") === "true",
      );
      await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>(".capture-root")!;
        const width = Math.min(innerWidth, 960);
        root.style.width = width + "px";
        root.style.height = (width * 540) / 960 + "px";
      });
      await page.waitForTimeout(60);
      const stage = page.locator(".runtime-stage");
      const seek = async (time: number) =>
        page.evaluate(async (t) => {
          await (window as any).__atlasRuntime.seek(t);
        }, time);
      const patch = async (data: object) => {
        await page.evaluate(
          (data) =>
            window.dispatchEvent(
              new CustomEvent("atlas:demo-parameters", { detail: data }),
            ),
          data,
        );
        await page.waitForTimeout(70);
      };
      const frames = new Map<number, string>();
      for (const t of [0, 1.8, 3.4, 5.9, 1.8, 6, 0]) {
        await seek(t);
        const pixels = hash(await stage.screenshot());
        if (frames.has(t)) assert.equal(pixels, frames.get(t));
        frames.set(t, pixels);
      }
      assert.notEqual(frames.get(0), frames.get(3.4));
      assert.equal(frames.get(0), frames.get(6), `${entry.id}: loop closure`);
      await seek(3.4);
      const baseline = hash(await stage.screenshot());
      for (const data of [
        { title: "A fresh perspective" },
        { accent: "#a74b35" },
        { labels: ["Gather", "Connect", "Finish"] },
        { duration: 9 },
        ...(entry.id === "continuous-ui-morph" ? [{ width: 450 }] : []),
      ]) {
        await patch({ ...defaults[entry.id], ...data });
        assert.notEqual(
          hash(await stage.screenshot()),
          baseline,
          JSON.stringify(data),
        );
        await patch(defaults[entry.id]);
        assert.equal(hash(await stage.screenshot()), baseline);
      }
      await patch({ labels: ["W".repeat(22), "Connect", "Finish"] });
      assert.ok(
        await page.evaluate(
          () => !!(window as any).__atlasRuntime.root().dataset.configError,
        ),
      );
      assert.equal(hash(await stage.screenshot()), baseline);
      await patch(defaults[entry.id]);
      const overflow = await page.evaluate(() => {
        const root = (window as any).__atlasRuntime.root();
        return Array.from(root.querySelectorAll("svg text")).some(
          (node: any) => {
            const box = node.getBBox();
            return (
              box.x < 0 ||
              box.x + box.width > 960 ||
              box.y < 0 ||
              box.y + box.height > 540
            );
          },
        );
      });
      assert.equal(overflow, false);
      if (entry.id === "product-surface-reveal") {
        const png = await sharp({
          create: {
            width: 600,
            height: 300,
            channels: 3,
            background: "#e9b24c",
          },
        })
          .png()
          .toBuffer();
        await patch({
          screenshot: `data:image/png;base64,${png.toString("base64")}`,
        });
        await page.waitForTimeout(120);
        assert.notEqual(hash(await stage.screenshot()), baseline);
        await patch(defaults[entry.id]);
        assert.equal(hash(await stage.screenshot()), baseline);
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await seek(0);
      const reduced = hash(await stage.screenshot());
      await seek(4);
      assert.equal(hash(await stage.screenshot()), reduced);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await seek(3.4);
      if (evidence) {
        await mkdir(evidence, { recursive: true });
        await stage.screenshot({
          path: path.join(evidence, `${entry.id}-${viewport.width}.png`),
        });
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      checked++;
    }
    await page.goto(base);
    await page.getByRole("button", { name: /Editable library/ }).click();
    assert.equal(await page.locator("[data-asset-id]").count(), 8);
    await page
      .getByLabel("Asset source kind")
      .selectOption("original_editable_demo");
    assert.equal(await page.locator("[data-asset-id]").count(), 8);
    await page.getByLabel("搜尋風格").fill("assembly");
    assert.equal(await page.locator("[data-asset-id]").count(), 1);
    await page.getByLabel("搜尋風格").fill("");
    await page
      .getByLabel("Asset source kind")
      .selectOption("third_party_package_candidate");
    assert.equal(await page.locator("[data-asset-id]").count(), 2);
    assert.equal(await page.locator(".asset-card video").count(), 0);
    await page
      .getByLabel("Asset source kind")
      .selectOption("original_editable_demo");
    for (const link of await page
      .locator("a.asset-source")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLAnchorElement).href),
      )) {
      const response = await page.request.get(link);
      assert.equal(response.status(), 200);
      assert.ok((await response.text()).includes("export"));
    }
    if (process.argv.includes("--previews")) {
      for (const video of await page.locator(".asset-card video").all()) {
        await video.scrollIntoViewIfNeeded();
        await video.evaluate(async (v: any) => {
          v.load();
          await Promise.race([
            v.play(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(Error("Preview playback timed out")),
                10000,
              ),
            ),
          ]);
        });
        await page.waitForTimeout(400);
        const data = await video.evaluate((v: any) => ({
          width: v.videoWidth,
          height: v.videoHeight,
          time: v.currentTime,
          frames: v.getVideoPlaybackQuality().totalVideoFrames,
        }));
        assert.equal(data.width, 1280);
        assert.equal(data.height, 720);
        assert.ok(data.time > 0 && data.frames > 1);
        await video.evaluate((v: any) => v.pause());
      }
    }
    await page.goto(`${base}#/style/SA-226`);
    await page.waitForFunction(
      () =>
        document
          .querySelector(".technology-runtime")
          ?.getAttribute("data-ready") === "true",
    );
    await page
      .locator(".demo-parameters input[name=title]")
      .fill("An editable moment");
    await page.getByRole("button", { name: "Apply parameters" }).click();
    await page
      .getByText("Applied to the active scene.", { exact: true })
      .waitFor();
    assert.ok(
      await page.evaluate(() =>
        (window as any).__atlasRuntime
          .root()
          .textContent.includes("An editable moment"),
      ),
    );
    if (evidence)
      await page.screenshot({
        path: path.join(evidence, `detail-${viewport.width}.png`),
        fullPage: true,
      });
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        result: "PASS",
        browser: browser.version(),
        scenes: checked,
        checks: [
          "pure/repeated/nonsequential time",
          "individual parameter contribution/reset",
          "overflow rejection/recovery",
          "local screenshot decode/replacement",
          "actual glyph bounds",
          "desktop/narrow layout",
          "live reduced motion",
          "catalog kind/search filters",
          "real source links",
          "actual parameter form",
          ...(process.argv.includes("--previews")
            ? ["browser video decode and advancing playback"]
            : []),
        ],
        limits: [
          "sampled visual evidence separate",
          "no audio/physical mobile/native video-engine claim",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
