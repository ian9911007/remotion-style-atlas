/** Created: 2026-10-04. Browser integration contract; no screenshot/evidence files by default.
 * Run: node --import tsx tests/technology-browser.ts
 * ATLAS_URL accepts the deployed base path. ATLAS_TEST_MATCH selects comma-separated test names.
 * ATLAS_TECH_RUNTIME_IDS bounds live lifecycle checks (default SVG, Canvas 2D, WebGL).
 * Touch/reduced-motion checks use Chromium emulation, not physical-device or Safari evidence.
 */
import assert from "node:assert/strict";
import {
  chromium,
  expect,
  type BrowserContextOptions,
  type Page,
} from "@playwright/test";
import { allStyles } from "../src/catalog/catalog";
import {
  technologyCases,
  technologyCatalog,
  caseEvidence,
  projectCase,
} from "../src/technology/registry";

const base = new URL(process.env.ATLAS_URL || "http://127.0.0.1:4173/");
base.hash = "";
base.search = "";
if (!base.pathname.endsWith("/")) base.pathname += "/";
const chromeExecutable =
  process.env.BROWSER_EXECUTABLE ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baselineIds = Array.from(
  { length: 100 },
  (_, i) => `SA-${String(i + 1).padStart(3, "0")}`,
);
const byId = new Map(technologyCases.map((c) => [c.id, c]));
const runtimeIds = (
  process.env.ATLAS_TECH_RUNTIME_IDS || "SA-131,SA-133,SA-143"
)
  .split(",")
  .filter(Boolean);
for (const id of runtimeIds)
  assert.ok(byId.has(id), `Unknown runtime case ${id}`);

type Metrics = {
  active: number;
  mounts: number;
  disposals: number;
  frames: number;
};
type RuntimeWindow = Window & {
  __atlasRuntime?: {
    seek: (seconds: number) => Promise<void>;
    time: () => number;
    root: () => HTMLElement;
    metrics: Metrics;
  };
  __technologyTestMetrics?: Metrics;
  __technologyCopiedText?: string;
  __atlasPlayback?: {
    snapshot: () => {
      playing: string[];
      sources: string[];
      visible: string[];
      limit: number;
    };
  };
};
type Check = {
  name: string;
  run: (page: Page, requests: string[]) => Promise<void>;
  context?: BrowserContextOptions;
};
const checks: Check[] = [];
const test = (
  name: string,
  run: Check["run"],
  context?: BrowserContextOptions,
) => checks.push({ name, run, context });
const card = (page: Page, id: string) =>
  page.locator(`.style-card[data-style-id="${id}"]`);
const cards = (page: Page) => page.locator(".style-card");
const route = (id: string) => {
  const url = new URL(base);
  url.hash = `/style/${id}`;
  return url.href;
};
const visibleIds = (page: Page) =>
  cards(page).evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("data-style-id")!),
  );
async function openCase(page: Page, id: string) {
  await page.goto(route(id), { waitUntil: "networkidle" });
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".detail-id")).toContainText(id);
}
async function closeCase(page: Page) {
  await page.getByRole("button", { name: "關閉風格檢視", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
async function startRuntime(page: Page) {
  await expect
    .poll(
      async () => {
        const node = page.locator(".technology-runtime");
        const error = await node.getAttribute("data-error");
        assert.equal(error, "", `Runtime initialization failed: ${error}`);
        return node.getAttribute("data-ready");
      },
      { timeout: 45000 },
    )
    .toBe("true");
  await page.evaluate(() => {
    const win = window as RuntimeWindow;
    assertRuntime(win.__atlasRuntime);
    function assertRuntime(value: unknown): asserts value {
      if (!value) throw new Error("Missing runtime API");
    }
    win.__technologyTestMetrics = win.__atlasRuntime.metrics;
  });
}
async function retainedMetrics(page: Page) {
  return page.evaluate(() => {
    const m = (window as RuntimeWindow).__technologyTestMetrics;
    if (!m) throw new Error("Missing retained test metrics");
    return { ...m };
  });
}
async function stopRuntime(page: Page) {
  await closeCase(page);
  await expect.poll(async () => (await retainedMetrics(page)).active).toBe(0);
  assert.equal(
    await page.evaluate(() => !!(window as RuntimeWindow).__atlasRuntime),
    false,
    "Closing the detail releases the runtime API.",
  );
  await expect(page.locator(".runtime-stage canvas")).toHaveCount(0);
  await expect(page.locator(".runtime-stage iframe")).toHaveCount(0);
}
async function clipboardStub(page: Page, reject = false) {
  await page.evaluate((fail) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          if (fail)
            throw new DOMException("Permission denied", "NotAllowedError");
          (window as RuntimeWindow).__technologyCopiedText = text;
        },
      },
    });
  }, reject);
}
async function currentPrompt(page: Page) {
  const area = page.getByRole("textbox", { name: "完整提示詞", exact: true });
  if (!(await area.isVisible()))
    await page.getByText("檢視完整提示詞", { exact: true }).click();
  return area.inputValue();
}
function heavyRequests(requests: string[]) {
  // Vite development module paths and production named chunks are both checked.
  const runtime =
    /\/technology-runtime\/src\/(?![^/?]*(?:-cases|-shared|-common|-kit|types)\.[tj]sx?(?:\?|$))[^/?]+\.[tj]sx?(?:\?|$)/;
  const chunks =
    /\/assets\/(?:data-(?:d3|echarts|vega|visx|plot)|maps-(?:maplibre|deck|cesium|leaflet)|scene-(?:three|r3f|babylon|theatre)|gpu-(?:pixi|regl)|editor-(?:konva|fabric)|physics-(?:matter|particles|elements)|generative-p5|dom-(?:gsap|motion|anime)|vector|native|video-|asset-|rive)[^/]*\.js(?:\?|$)/;
  const packages =
    /\/(?:node_modules|\.vite\/deps)\/[^?]*(?:three|pixi|echarts|maplibre|cesium|deck_gl|babylon|vega|konva|fabric|p5|rive)[^?]*\.m?js(?:\?|$)/;
  return requests.filter(
    (url) => runtime.test(url) || chunks.test(url) || packages.test(url),
  );
}

test("baseline IDs and legacy route remain intact", async (page) => {
  assert.deepEqual(
    allStyles.map((s) => s.id).sort(),
    baselineIds,
    "Canonical completed legacy set must remain SA-001 through SA-100.",
  );
  const ids = await visibleIds(page);
  assert.equal(new Set(ids).size, ids.length, "No duplicate case cards.");
  assert.equal(
    ids.length,
    100 + technologyCases.length,
    "Helpers/aliases must not inflate total case count.",
  );
  assert.ok(ids.length > 100);
  for (const id of baselineIds)
    assert.ok(ids.includes(id), `Preserved legacy ID ${id}`);
  await card(page, "SA-001").locator(".card-open").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".detail-id")).toContainText("SA-001");
  assert.equal(new URL(page.url()).hash, "#/style/SA-001");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await openCase(page, "SA-100");
  await closeCase(page);
});

test("runtime remains lazy until a technology detail opens", async (page, requests) => {
  assert.deepEqual(
    heavyRequests(requests),
    [],
    "Initial gallery must not fetch heavy runtime modules.",
  );
  await openCase(page, "SA-131");
  await startRuntime(page);
  assert.ok(
    heavyRequests(requests).some((url) => /data-d3/.test(url)),
    "Opening the detail loads the actual D3 runtime chunk.",
  );
  await stopRuntime(page);
});

test("SA-156 keeps its map focal point stable through the full zoom", async (page) => {
  await openCase(page, "SA-156");
  await startRuntime(page);
  const samples: {
    time: number;
    longitude: number;
    latitude: number;
    zoom: number;
    markerX: number;
    markerY: number;
  }[] = [];
  for (let frame = 0; frame <= 32; frame++) {
    const time = frame / 4;
    samples.push(
      await page.evaluate(async (time) => {
        const runtime = (window as RuntimeWindow).__atlasRuntime!;
        await runtime.seek(time);
        const root = runtime.root();
        const map = root.querySelector<HTMLElement>(".reveal")!;
        const marker = root.querySelector<HTMLElement>(".hero-label")!;
        const stage = document.querySelector(".runtime-stage")!;
        const markerRect = marker.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return {
          time,
          longitude: Number(map.dataset.longitude),
          latitude: Number(map.dataset.latitude),
          zoom: Number(map.dataset.zoom),
          markerX: markerRect.x + markerRect.width / 2 - stageRect.x,
          markerY: markerRect.y + markerRect.height / 2 - stageRect.y,
        };
      }, time),
    );
  }
  const anchor = samples[0];
  for (const sample of samples) {
    assert.ok(
      Math.abs(sample.longitude - anchor.longitude) < 0.0001,
      `Focal longitude drifted at ${sample.time}s: ${sample.longitude}`,
    );
    assert.ok(
      Math.abs(sample.latitude - anchor.latitude) < 0.0001,
      `Focal latitude drifted at ${sample.time}s: ${sample.latitude}`,
    );
    assert.ok(
      Math.abs(sample.markerX - anchor.markerX) < 1,
      `Taipei marker shifted horizontally at ${sample.time}s: ${sample.markerX}`,
    );
    assert.ok(
      Math.abs(sample.markerY - anchor.markerY) < 1,
      `Taipei marker shifted vertically at ${sample.time}s: ${sample.markerY}`,
    );
  }
  for (let i = 1; i < samples.length; i++)
    assert.ok(
      Math.abs(samples[i].zoom - samples[i - 1].zoom) < 0.6,
      `Zoom jumped between ${samples[i - 1].time}s and ${samples[i].time}s.`,
    );
  await closeCase(page);
});

test("effect-first filters and canonical aliases", async (page) => {
  await page.getByRole("button", { name: "篩選", exact: true }).click();
  await page
    .locator("#filter-panel")
    .getByLabel(/^選集/)
    .selectOption("legacy");
  await expect(cards(page)).toHaveCount(100);
  await page
    .locator("#filter-panel")
    .getByLabel(/^選集/)
    .selectOption("technology");
  await expect(cards(page)).toHaveCount(technologyCases.length);
  await page
    .locator("#filter-panel")
    .getByLabel(/^展示能力/)
    .selectOption("keyed-data-join");
  await expect(cards(page)).toHaveCount(1);
  await expect(card(page, "SA-132")).toHaveCount(1);
  await page
    .locator("#filter-panel")
    .getByLabel(/^展示能力/)
    .selectOption("");
  await page
    .locator("#filter-panel")
    .getByLabel(/^實作技術/)
    .selectOption("d3");
  await expect(cards(page)).toHaveCount(
    technologyCases.filter(
      (c) => c.primary === "d3" || c.supporting?.some((s) => s.id === "d3"),
    ).length,
  );
  await page
    .locator("#filter-panel")
    .getByLabel(/^繪製方式/)
    .selectOption("SVG");
  await page
    .locator("#filter-panel")
    .getByLabel(/^觸發方式/)
    .selectOption("keyboard");
  await expect(cards(page)).toHaveCount(
    technologyCases.filter(
      (c) =>
        (c.primary === "d3" || c.supporting?.some((s) => s.id === "d3")) &&
        c.renderer === "SVG" &&
        c.interaction.includes("keyboard"),
    ).length,
  );
  await page
    .locator("#filter-panel")
    .getByLabel(/^視覺方向/)
    .selectOption(byId.get("SA-131")!.direction);
  await expect(cards(page)).toHaveCount(1);
  await expect(card(page, "SA-131")).toHaveCount(1);
  for (const label of ["視覺方向", "實作技術", "繪製方式", "觸發方式"])
    await page
      .locator("#filter-panel")
      .getByLabel(new RegExp(`^${label}`))
      .selectOption("");
  const search = page.getByRole("textbox", { name: "搜尋風格", exact: true });
  await search.fill("SA-143");
  await expect(cards(page)).toHaveCount(1);
  await expect(card(page, "SA-143")).toHaveCount(1);
  const motion = technologyCatalog.find((t) => t.id === "motion");
  assert.ok(
    motion && motion.aliases.length,
    "Motion historical aliases remain searchable.",
  );
  await search.fill(motion.aliases[0]);
  for (const c of technologyCases.filter((c) => c.primary === "motion"))
    await expect(card(page, c.id)).toHaveCount(1);
});

test("Chinese visual intent search finds ready roadmap parallax and real maps", async (page) => {
  const intents: { query: string; required: string[] }[] = [
    { query: "資訊圖表", required: ["SA-151"] },
    { query: "地圖連線", required: ["SA-154", "SA-155"] },
    { query: "路線圖", required: ["SA-151"] },
    { query: "視差", required: ["SA-152", "SA-153"] },
    { query: "真實世界地圖", required: ["SA-154", "SA-155"] },
  ];
  await page.getByRole("button", { name: "篩選", exact: true }).click();
  const filters = page.locator("#filter-panel");
  await filters.getByLabel(/^選集/).selectOption("technology");
  await filters.getByLabel(/^完成狀態/).selectOption("ready");
  const search = page.getByRole("textbox", { name: "搜尋風格", exact: true });
  for (const { query, required } of intents) {
    await search.fill(query);
    for (const id of required) {
      assert.ok(byId.has(id), `${query}: canonical case ${id} must exist.`);
      assert.equal(
        caseEvidence(id).status,
        "ready",
        `${query}: ${id} must finish evidence reconciliation before final acceptance.`,
      );
      await expect(
        card(page, id),
        `${query}: the matching ready case ${id} must remain discoverable.`,
      ).toHaveCount(1);
    }
    const found = await visibleIds(page);
    assert.equal(
      new Set(found).size,
      found.length,
      "Search must not duplicate aliases or supporting technologies.",
    );
    for (const id of found) {
      assert.ok(
        byId.has(id),
        "The technology collection filter remains active.",
      );
      assert.equal(
        caseEvidence(id).status,
        "ready",
        "The readiness filter remains active with the text query.",
      );
    }
    // Exercise discovery -> detail without starting another live renderer.
    const selected = byId.get(required[0])!;
    await card(page, selected.id).locator(".card-open").click();
    await expect(page.locator(".detail-id")).toContainText(selected.id);
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: selected.title, exact: true }),
    ).toBeVisible();
    assert.ok(
      (await currentPrompt(page)).includes(
        `${selected.id} / ${selected.englishTitle}`,
      ),
      "Intent search opens the selected case's application prompt.",
    );
    await closeCase(page);
    await expect(search).toHaveValue(query);
  }
  await search.fill("");
  await filters.getByLabel(/^完成狀態/).selectOption("");
  await expect(cards(page)).toHaveCount(technologyCases.length);
});

test("case-aware clipboard text and fallback match selected case", async (page) => {
  let previous = "";
  for (const id of ["SA-131", "SA-143"]) {
    const c = byId.get(id)!;
    await openCase(page, id);
    await clipboardStub(page);
    const prompt = await currentPrompt(page);
    assert.ok(prompt.includes(`${id} / ${c.englishTitle}`));
    assert.ok(prompt.includes(`Primary: ${c.primary}.`));
    assert.ok(prompt.includes(`/${c.module} (variant ${c.variant})`));
    assert.ok(prompt.includes("LOCKED EFFECT REQUIREMENTS"));
    assert.ok(prompt.includes("EDITABLE CONTENT AND ART DIRECTION"));
    assert.ok(prompt.includes("TECHNICAL REFERENCES TO LOAD ON DEMAND"));
    await page
      .getByRole("button", { name: "複製完整提示詞", exact: true })
      .click();
    assert.equal(
      await page.evaluate(
        () => (window as RuntimeWindow).__technologyCopiedText,
      ),
      prompt,
      "CopyButton output equals the visible selected-case prompt.",
    );
    assert.notEqual(prompt, previous);
    previous = prompt;
    await closeCase(page);
  }
  await openCase(page, "SA-131");
  await page.getByText("加入你的專案內容", { exact: false }).click();
  await page
    .getByLabel("影片主題", { exact: true })
    .fill("Technology integration acceptance fixture");
  const contextual = await currentPrompt(page);
  assert.ok(contextual.includes("Technology integration acceptance fixture"));
  await clipboardStub(page, true);
  await page
    .getByRole("button", { name: "複製完整提示詞", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "手動複製完整內容", exact: true }),
  ).toHaveValue(contextual);
});

test("preview asset URLs honor the deployment base path", async (page) => {
  for (const id of ["SA-001", "SA-101", "SA-131", "SA-143"]) {
    const spec =
      allStyles.find((s) => s.id === id) ?? projectCase(byId.get(id)!);
    if (byId.has(id))
      assert.ok(
        caseEvidence(id).preview,
        `${id}: required preview generation has not finished.`,
      );
    for (const [path, type] of [
      [spec.preview.poster, "image/"],
      [spec.preview.gallery, "video/mp4"],
    ] as const) {
      const url = new URL(path, base);
      assert.equal(url.origin, base.origin);
      assert.ok(url.pathname.startsWith(base.pathname));
      const response = await page.request.get(url.href, {
        headers: type === "video/mp4" ? { Range: "bytes=0-1023" } : {},
      });
      assert.ok(
        [200, 206].includes(response.status()),
        `${id}: ${url.pathname} status ${response.status()}`,
      );
      assert.ok(
        (response.headers()["content-type"] ?? "").startsWith(type),
        `${id}: ${url.pathname} has the expected media content type.`,
      );
    }
  }
});

test("global visible preview playback and offscreen suspension", async (page) => {
  await page.getByRole("button", { name: "全域", exact: true }).click();
  await expect
    .poll(
      async () =>
        page.evaluate(
          () =>
            (window as RuntimeWindow).__atlasPlayback?.snapshot().playing
              .length ?? 0,
        ),
      { timeout: 15000 },
    )
    .toBeGreaterThan(0);
  const snapshot = () =>
    page.evaluate(() => (window as RuntimeWindow).__atlasPlayback!.snapshot());
  const initial = await snapshot();
  assert.deepEqual(
    [...initial.playing].sort(),
    [...initial.visible].sort(),
    "Global mode plays every visible preview, independent of focus-mode budget.",
  );
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(async () => {
      const state = await snapshot();
      return state.playing.some((id) => initial.playing.includes(id));
    })
    .toBe(false);
  const bottom = await snapshot();
  assert.deepEqual(
    [...bottom.playing].sort(),
    [...bottom.visible].sort(),
    "After scrolling, playback follows only the new visible set.",
  );
  await page.getByRole("button", { name: "靜態", exact: true }).click();
  await expect.poll(async () => (await snapshot()).playing.length).toBe(0);
});

test(
  "live runtime disposal across renderer families",
  async (page) => {
    for (const id of runtimeIds) {
      await openCase(page, id);
      let final: Metrics | undefined;
      for (let cycle = 0; cycle < 3; cycle++) {
        if (cycle > 0) {
          await card(page, id).locator(".card-open").click();
          await expect(page.locator(".detail-id")).toContainText(id);
        }
        await startRuntime(page);
        assert.equal(
          (await retainedMetrics(page)).active,
          1,
          "Only one live case may be active.",
        );
        await page.evaluate(async () => {
          await (window as RuntimeWindow).__atlasRuntime!.seek(2.7);
        });
        await stopRuntime(page);
        final = await retainedMetrics(page);
        assert.equal(
          final.mounts,
          final.disposals,
          "Every completed mount was disposed.",
        );
      }
      await card(page, id).locator(".card-open").click();
      await startRuntime(page);
      await closeCase(page);
      await expect
        .poll(async () => (await retainedMetrics(page)).active)
        .toBe(0);
      assert.equal(
        await page.evaluate(() => !!(window as RuntimeWindow).__atlasRuntime),
        false,
        "Closing the detail releases the runtime API.",
      );
      assert.ok(final && final.disposals >= 3);
    }
  },
  { reducedMotion: "reduce" },
);

test(
  "keyboard control and reduced-motion clock",
  async (page) => {
    await openCase(page, "SA-131");
    await startRuntime(page);
    await expect(
      page.getByRole("button", { name: "播放互動", exact: true }),
    ).toBeVisible();
    const first = await retainedMetrics(page);
    await page.waitForTimeout(220);
    assert.equal(
      (await retainedMetrics(page)).frames,
      first.frames,
      "Reduced motion must not advance the live clock without user playback.",
    );
    const before = await page.evaluate(
      () => (window as RuntimeWindow).__atlasRuntime!.root().innerText,
    );
    const button = page
      .locator(".runtime-stage")
      .getByRole("button", { name: "切換分類", exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    assert.notEqual(
      await page.evaluate(
        () => (window as RuntimeWindow).__atlasRuntime!.root().innerText,
      ),
      before,
      "Keyboard activates the actual case control.",
    );
    const time = page.getByRole("slider", { name: "案例時間", exact: true });
    const previousTime = await time.inputValue();
    await time.focus();
    await page.keyboard.press("ArrowRight");
    assert.notEqual(
      await time.inputValue(),
      previousTime,
      "Keyboard changes the explicit seek control.",
    );
    await closeCase(page);
  },
  { reducedMotion: "reduce" },
);

test(
  "detail runtime opens directly and its timeline reaches both exact ends",
  async (page) => {
    await openCase(page, "SA-131");
    await startRuntime(page);
    await expect(
      page.getByRole("button", { name: "啟動互動案例", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "停止並釋放", exact: true }),
    ).toHaveCount(0);

    const timeline = page.getByRole("slider", {
      name: "案例時間",
      exact: true,
    });
    await expect(timeline).toHaveAttribute("min", "0");
    await expect(timeline).toHaveAttribute("max", "4");
    await timeline.scrollIntoViewIfNeeded();
    const box = await timeline.boundingBox();
    assert.ok(
      box && box.width >= 200,
      "Timeline must have a usable drag target.",
    );
    const centerY = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width / 2, centerY);
    await page.mouse.down();
    await page.mouse.move(box.x + 1, centerY, { steps: 8 });
    await page.mouse.up();
    await expect(timeline).toHaveValue("0");
    assert.equal(
      await page.evaluate(() =>
        (window as RuntimeWindow).__atlasRuntime!.time(),
      ),
      0,
      "Dragging to the left endpoint seeks to the exact start.",
    );

    await page.mouse.move(box.x + 1, centerY);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 1, centerY, { steps: 8 });
    await page.mouse.up();
    await expect(timeline).toHaveValue("4");
    assert.equal(
      await page.evaluate(() =>
        (window as RuntimeWindow).__atlasRuntime!.time(),
      ),
      4,
      "Dragging to the right endpoint seeks to the exact loop boundary.",
    );

    await page.getByRole("button", { name: "重播／重設", exact: true }).click();
    await expect(timeline).toHaveValue("0");
    assert.equal(
      await page.evaluate(() =>
        (window as RuntimeWindow).__atlasRuntime!.time(),
      ),
      0,
      "Replay/reset returns to the opening state without remounting.",
    );
    await closeCase(page);
  },
  { reducedMotion: "reduce" },
);

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
])
  test(
    `touch viewport ${viewport.width} keeps the live case contained`,
    async (page) => {
      await openCase(page, "SA-131");
      await startRuntime(page);
      await expect(page.locator(".technology-runtime")).toHaveAttribute(
        "data-ready",
        "true",
        { timeout: 45000 },
      );
      const geometry = await page.evaluate(() => {
        const win = window as RuntimeWindow;
        const root = win.__atlasRuntime!.root().getBoundingClientRect();
        const stage = document
          .querySelector(".runtime-stage")!
          .getBoundingClientRect();
        const dialog = document.querySelector("dialog")!;
        return {
          root: root.width,
          stage: stage.width,
          overflow: dialog.scrollWidth - dialog.clientWidth,
          viewport: innerWidth,
        };
      });
      assert.ok(
        geometry.root > 0 && geometry.root <= geometry.stage + 1,
        "Case scales to the visible stage.",
      );
      assert.ok(geometry.stage <= geometry.viewport);
      assert.ok(
        geometry.overflow <= 1,
        "Dialog has no horizontal layout overflow.",
      );
      const before = await page.evaluate(
        () => (window as RuntimeWindow).__atlasRuntime!.root().innerText,
      );
      await page
        .locator(".runtime-stage")
        .getByRole("button", { name: "切換分類", exact: true })
        .tap();
      assert.notEqual(
        await page.evaluate(
          () => (window as RuntimeWindow).__atlasRuntime!.root().innerText,
        ),
        before,
        "Touch changes case state.",
      );
      await closeCase(page);
    },
    { viewport, hasTouch: true, reducedMotion: "reduce" },
  );

const selected = checks.filter(
  (c) =>
    !process.env.ATLAS_TEST_MATCH ||
    process.env.ATLAS_TEST_MATCH.split(",").some((match) =>
      c.name.includes(match),
    ),
);
assert.ok(
  selected.length,
  "ATLAS_TEST_MATCH did not select a technology browser check.",
);
const browser = await chromium.launch({
  headless: true,
  executablePath: chromeExecutable,
});
const results: { name: string; passed: boolean; error?: string }[] = [];
try {
  for (const check of selected) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "no-preference",
      ...check.context,
    });
    await context.addInitScript("globalThis.__name = (fn) => fn;");
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const requests: string[] = [];
    const errors: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "script") requests.push(r.url());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.goto(base.href, { waitUntil: "networkidle" });
      await expect(cards(page).first()).toBeVisible();
      await check.run(page, requests);
      assert.deepEqual(errors, [], "No uncaught application errors.");
      results.push({ name: check.name, passed: true });
      console.log(`PASS ${check.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ name: check.name, passed: false, error: message });
      console.error(`FAIL ${check.name}\n${message}`);
      console.error(
        "Visible runtime errors:",
        await page
          .locator('.technology-runtime[data-error]:not([data-error=""])')
          .getAttribute("data-error")
          .catch(() => null),
      );
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.passed).length;
console.log(
  JSON.stringify(
    {
      environment: {
        url: base.href,
        browser: chromeExecutable,
        viewportEvidence:
          "Chromium emulation; not physical-device/Safari verification",
        clipboardEvidence:
          "CopyButton exercised with clipboard API success/rejection stubs; system clipboard not modified",
        runtimeIds,
      },
      passed: results.length - failed,
      failed,
      results,
    },
    null,
    2,
  ),
);
if (failed) process.exitCode = 1;
