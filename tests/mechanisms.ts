/** Created: 2026-10-25. Original executable fixtures and actual responsive browser checks. */
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import {
  mechanismDefaults,
  validateMechanism,
  traceJourney,
  metricSummary,
  createScore,
  scoreState,
  readingSeconds,
} from "../technology-runtime/src/mechanism-fixtures";
import { renderMechanism } from "../technology-runtime/src/mechanism-motion";
import collection from "../src/technology/original-demo-catalog.generated.json";
const chosen = collection.entries.filter(
  (e) => Number(e.case_id?.slice(3)) >= 229,
);
const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const base = process.env.ATLAS_URL || "http://127.0.0.1:4173/";
const evidence = process.env.MOTION_EVAL_EVIDENCE_DIR;
assert.deepEqual(
  traceJourney([2, 4, 6]).steps.map((s) => s.value),
  [[2, 4, 6], [4, 8, 12], [8, 12], 20],
);
assert.equal(traceJourney([1, 3, 5]).result, 10);
assert.deepEqual(metricSummary([34, 48, 65]), {
  domain: [0, 100],
  unit: "%",
  values: [34, 48, 65],
  change: 31,
  synthetic: true,
});
for (const e of createScore([60, 64, 67, 62, 69], 15)) {
  const state = scoreState([60, 64, 67, 62, 69], 15, e.time);
  const ball = state.balls[e.ball];
  assert.equal(ball.height, 0);
  assert.equal(ball.key, e.key);
  assert.equal(ball.contact, true);
  assert.ok(state.active.some((a) => a.note === e.note));
  assert.ok(
    !scoreState([60, 64, 67, 62, 69], 15, e.time - 0.01).active.some(
      (a) => a.id === e.id,
    ),
  );
}
const measure = (s: string, size: number) => [...s].length * size * 0.58;
for (const [id, c] of Object.entries(mechanismDefaults)) {
  assert.equal(
    renderMechanism(id, c, 0, false, measure),
    renderMechanism(id, c, c.duration, false, measure),
  );
  assert.equal(
    renderMechanism(id, c, 0, false, measure, true),
    renderMechanism(id, c, 4, false, measure, true),
  );
  for (const patch of [
    { duration: 1 },
    { title: "W".repeat(100) },
    { labels: ["one"] },
    {
      labels: [
        "這是一段沒有足夠閱讀停留時間的極長繁體中文標籤".repeat(4),
        "B",
        "C",
      ],
    },
  ])
    assert.throws(() => validateMechanism(id, { ...c, ...patch }));
  assert.ok(
    c.labels.every((s) => readingSeconds(s) <= (c.duration * 0.82) / 3 - 0.3),
  );
}
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.BROWSER_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const errors: string[] = [];
let scenes = 0;
try {
  for (const viewport of [
    { width: 1280, height: 1000 },
    { width: 390, height: 900 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    await context.addInitScript("globalThis.__name=(fn)=>fn");
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    for (const entry of chosen) {
      await page.goto(`${base}#/style/${entry.case_id}`);
      await page.waitForFunction(
        () =>
          document
            .querySelector(".technology-runtime")
            ?.getAttribute("data-ready") === "true",
      );
      const stage = page.locator(".runtime-stage");
      const shot = async () => {
        await stage.evaluate((el: HTMLElement) =>
          el.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        return stage.screenshot();
      };
      await stage.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(
          () => (window as any).__atlasRuntime.root().dataset.layout,
        ),
        viewport.width < 600 ? "portrait" : "landscape",
      );
      const seek = async (t: number) =>
        page.evaluate(async (t) => {
          await (window as any).__atlasRuntime.seek(t);
          await new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          );
        }, t);
      await seek(1);
      const still = hash(await shot());
      await seek(5);
      assert.equal(hash(await shot()), still);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const initialHTML = await page.evaluate(
        () => (window as any).__atlasRuntime.root().innerHTML,
      );
      let zeroHTML = "";
      let zeroPixels: Buffer = Buffer.alloc(0);
      const seen = new Map<number, string>();
      const duration = mechanismDefaults[entry.id].duration;
      for (const t of [
        0,
        duration * 0.2,
        duration * 0.55,
        duration * 0.8,
        duration - 1 / 30,
        duration * 0.2,
        0,
        duration,
      ]) {
        await seek(t);
        if (t === 0)
          zeroHTML = await page.evaluate(
            () => (window as any).__atlasRuntime.root().innerHTML,
          );
        const image = await shot();
        if (t === 0) zeroPixels = image;
        const pixels = hash(image);
        if (seen.has(t))
          assert.equal(pixels, seen.get(t), entry.id + " repeat");
        seen.set(t, pixels);
      }
      assert.equal(seen.get(0), seen.get(duration), entry.id + " loop");
      assert.notEqual(seen.get(0), seen.get(duration * 0.55));
      await seek(duration * 0.55);
      const baseline = hash(await shot());
      if (entry.id === "tiny-code-journey") {
        const overlap = await page.evaluate(() => {
          const r = (window as any).__atlasRuntime.root();
          const a = r.querySelector("[data-code-connector]").getBBox();
          const b = r.querySelector("[data-fixture-result]").getBBox();
          return a.y >= b.y && a.y <= b.y + b.height;
        });
        assert.equal(
          overlap,
          false,
          "code connector must not cross the actual result",
        );
      }
      if (entry.id === "causal-score-object") {
        for (const event of createScore(
          mechanismDefaults[entry.id].notes!,
          duration,
        )) {
          await seek(event.time * 0.82);
          const contact: { contact?: string | null; fill?: string | null } =
            await page.evaluate(
              ({ ball, key, accent, portrait }) => {
                const root = (window as any).__atlasRuntime.root();
                const node = root.querySelector(`circle[data-ball="${ball}"]`);
                const x =
                  (portrait ? 64 : 160) +
                  key * ((portrait ? 512 : 640) / 5) +
                  5;
                const keyNode = root.querySelector(
                  `rect[x="${x}"][y="${portrait ? 622 : 354}"]`,
                );
                return {
                  contact: node?.getAttribute("data-contact"),
                  fill: keyNode?.getAttribute("fill"),
                };
              },
              {
                ball: event.ball,
                key: event.key,
                accent: mechanismDefaults[entry.id].accent,
                portrait: viewport.width < 600,
              },
            );
          assert.equal(contact.contact, "true");
          assert.equal(contact.fill, mechanismDefaults[entry.id].accent);
        }
        await seek(duration * 0.55);
      }
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
      for (const data of [
        { title: "以證據把複雜故事說清楚" },
        { labels: ["觀察關鍵", "理解關係", "看見結果"] },
        { accent: "#9b593b" },
        { duration: 20 },
      ]) {
        await patch({ ...mechanismDefaults[entry.id], ...data });
        assert.notEqual(
          hash(await shot()),
          baseline,
          entry.id + JSON.stringify(data),
        );
        await patch(mechanismDefaults[entry.id]);
        assert.equal(hash(await shot()), baseline);
      }
      for (const [key, value] of Object.entries(
        (entry as any).extra_parameters,
      )) {
        const replacement =
          key === "quote"
            ? "這是清楚標示的示意文字，不是真實受訪者證言。"
            : key === "values"
              ? entry.id === "tiny-code-journey"
                ? [1, 3, 5]
                : [22, 44, 77]
              : key === "colors"
                ? ["#a95c45", "#3f6f8a", "#d6c17a"]
                : key === "topology"
                  ? "grid"
                  : key === "material"
                    ? "glaze"
                    : key === "geometry"
                      ? "bridge"
                      : [62, 65, 69, 64, 72];
        await patch({ ...mechanismDefaults[entry.id], [key]: replacement });
        assert.notEqual(hash(await shot()), baseline, entry.id + key);
        if (entry.id === "tiny-code-journey")
          assert.equal(
            await page.evaluate(
              () => (window as any).__atlasRuntime.root().dataset.fixtureResult,
            ),
            "10",
          );
        await patch(mechanismDefaults[entry.id]);
        assert.equal(hash(await shot()), baseline);
      }
      await patch({ title: "繁體中文溢位".repeat(30) });
      assert.ok(
        await page.evaluate(
          () => !!(window as any).__atlasRuntime.root().dataset.configError,
        ),
      );
      assert.equal(hash(await shot()), baseline);
      await patch(mechanismDefaults[entry.id]);
      const overflow = await page.evaluate(() => {
        const root = (window as any).__atlasRuntime.root();
        const svg = root.querySelector("svg");
        const view = svg.viewBox.baseVal;
        return Array.from(svg.querySelectorAll("text"))
          .filter((n: any) => {
            const b = n.getBBox();
            return (
              b.x < 0 ||
              b.y < 0 ||
              b.x + b.width > view.width ||
              b.y + b.height > view.height
            );
          })
          .map((n: any) => n.textContent);
      });
      assert.deepEqual(overflow, [], entry.id + " text bounds");
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      if (evidence) {
        await mkdir(evidence, { recursive: true });
        await stage.screenshot({
          path: path.join(evidence, `${entry.case_id}-${viewport.width}.png`),
        });
      }
      await page.getByRole("button", { name: "重播／重設" }).click();
      assert.ok(
        await page.evaluate(() => (window as any).__atlasRuntime.time() < 0.2),
      );
      await page.getByRole("button", { name: "暫停互動", exact: true }).click();
      await page.waitForTimeout(100);
      await seek(0);
      const restartHTML = await page.evaluate(
        () => (window as any).__atlasRuntime.root().innerHTML,
      );
      assert.equal(restartHTML, zeroHTML, entry.id + " exact restarted SVG");
      // Browser compositing can round scaled SVG edge antialiasing after active playback.
      // Keep SVG exact and bound only this restart raster comparison to <0.2% pixels, <=16/channel.
      const before = await sharp(zeroPixels).ensureAlpha().raw().toBuffer();
      const after = await sharp(await shot())
        .ensureAlpha()
        .raw()
        .toBuffer();
      assert.equal(before.length, after.length);
      let changed = 0,
        maxDelta = 0;
      for (let i = 0; i < before.length; i += 4) {
        let diff = false;
        for (let c = 0; c < 3; c++) {
          const d = Math.abs(before[i + c] - after[i + c]);
          maxDelta = Math.max(maxDelta, d);
          diff ||= d > 0;
        }
        if (diff) changed++;
      }
      assert.ok(
        maxDelta <= 16 && changed / (before.length / 4) < 0.002,
        entry.id +
          " restarted raster antialias bound: " +
          maxDelta +
          "/" +
          changed,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      scenes++;
    }
    await page.goto(base);
    await page.getByRole("button", { name: /Editable library/ }).click();
    await page.waitForFunction(
      () =>
        document
          .querySelector(".asset-library")
          ?.getAttribute("data-reference-count") === "703",
    );
    assert.equal(
      await page.locator("[data-kind=original_editable_demo]").count(),
      8,
    );
    await page.getByLabel("Asset source kind").selectOption("reference_only");
    assert.equal(await page.locator("[data-kind=reference_only]").count(), 24);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    assert.equal(await page.locator("[data-kind=reference_only]").count(), 24);
    await page.getByLabel("搜尋風格").fill("deedydas-407965");
    assert.equal(await page.locator("[data-kind=reference_only]").count(), 1);
    assert.equal(await page.locator(".asset-card video").count(), 0);
    await page.getByLabel("搜尋風格").fill("");
    await page
      .getByLabel("Asset source kind")
      .selectOption("original_editable_demo");
    for (const link of await page
      .locator("a.asset-source")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLAnchorElement).href),
      )) {
      const r = await page.request.get(link);
      assert.equal(r.status(), 200);
      assert.ok((await r.text()).includes("export"));
    }
    await page.goto(`${base}#/style/SA-231`);
    await page.waitForFunction(
      () =>
        document
          .querySelector(".technology-runtime")
          ?.getAttribute("data-ready") === "true",
    );
    await page.locator('[name="extra:values"]').fill("1, 3, 5");
    await page.getByRole("button", { name: "Apply parameters" }).click();
    await page
      .getByText("Applied to the active scene.", { exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => (window as any).__atlasRuntime.root().dataset.fixtureResult,
      ),
      "10",
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        result: "PASS",
        browser: browser.version(),
        scenes,
        checks: [
          "actual fixture result/graph",
          "contact ledger correspondence",
          "desktop/portrait composition",
          "CJK replacement and overflow rejection/recovery",
          "independent parameters",
          "repeated/backward/restarted/default-loop pixels",
          "reduced motion",
          "lazy 703 reference index/search/pagination",
          "real source resolution",
          "actual fixture form",
        ],
        audio: "absent by contract",
        limits: [
          "sampled still inspection separate",
          "no native Remotion/HyperFrames, physical mobile or audio proof",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
