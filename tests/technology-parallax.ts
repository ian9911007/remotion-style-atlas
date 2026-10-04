/** Created: 2026-10-04. SA-152 visible bounds, shared projection and scroll ownership.
 * Run: node --import tsx tests/technology-parallax.ts
 * ATLAS_URL may include the production base path. Screenshots are opt-in with
 * ATLAS_PARALLAX_CAPTURE_DIR; default execution leaves no generated evidence.
 */
import assert from "node:assert/strict";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, expect, type Page } from "@playwright/test";

const base = new URL(process.env.ATLAS_URL || "http://127.0.0.1:4173/");
base.hash = "";
base.search = "?capture=SA-152";
const screenshots = process.env.ATLAS_PARALLAX_CAPTURE_DIR;
if (screenshots) await mkdir(screenshots, { recursive: true });
type RuntimeWindow = Window & {
  __atlasRuntime: {
    seek: (seconds: number) => Promise<void>;
    root: () => HTMLElement;
  };
};
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.BROWSER_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const errors: string[] = [];

async function open(page: Page) {
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript("globalThis.__name = (fn) => fn;");
  await page.goto(base.href);
  await expect(
    page.locator('.technology-runtime[data-ready="true"]'),
  ).toHaveCount(1);
  await expect(page.locator(".technology-runtime")).toHaveAttribute(
    "data-error",
    "",
  );
}
async function seek(page: Page, seconds: number) {
  await page.evaluate(async (time) => {
    await (window as unknown as RuntimeWindow).__atlasRuntime.seek(time);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }, seconds);
}
async function snapshot(page: Page) {
  return page.evaluate(() => {
    const root = (window as unknown as RuntimeWindow).__atlasRuntime.root();
    const scene = root.querySelector<HTMLElement>(".sp-scene")!;
    const boundary = scene.getBoundingClientRect();
    const scale = boundary.width / 960;
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return {
        left: (box.left - boundary.left) / scale,
        top: (box.top - boundary.top) / scale,
        right: (box.right - boundary.left) / scale,
        bottom: (box.bottom - boundary.top) / scale,
      };
    };
    return {
      layers: [
        ...scene.querySelectorAll<SVGGraphicsElement>("[data-layer-content]"),
      ].map(rect),
      labels: rect(scene.querySelector("[data-ground-guide]")!),
      footprints: [
        ...scene.querySelectorAll<SVGPolygonElement>("[data-footprint]"),
      ].map((polygon) => {
        const matrix = polygon.getScreenCTM()!;
        return [...polygon.points].map((point) => {
          const projected = new DOMPoint(point.x, point.y).matrixTransform(
            matrix,
          );
          return {
            x: (projected.x - boundary.left) / scale,
            y: (projected.y - boundary.top) / scale,
          };
        });
      }),
      animations: [...scene.querySelectorAll<HTMLElement>(".sp-layer")].flatMap(
        (layer) =>
          layer.getAnimations().map((animation) => ({
            state: animation.playState,
            time: animation.currentTime,
          })),
      ),
    };
  });
}
type Snapshot = Awaited<ReturnType<typeof snapshot>>;
function checkBounds(frame: Snapshot, name: string) {
  for (const [i, box] of [...frame.layers, frame.labels].entries()) {
    // A four-pixel safety allowance includes the widest visible strokes. Shadows
    // are real polygons inside the measured groups, not unmeasured filter blur.
    assert.ok(
      box.left >= 8 && box.right <= 952 && box.top >= 8 && box.bottom <= 532,
      `${name}, group ${i}: visible geometry approaches/clips the drawing boundary: ${JSON.stringify(box)}`,
    );
  }
  assert.equal(frame.layers.length, 4);
  assert.equal(frame.animations.length, 4);
  assert.ok(
    frame.animations.every((animation) => animation.state === "paused"),
    `${name}: WAAPI must be seek-driven`,
  );
  for (const plane of frame.footprints.slice(1)) {
    const datum = frame.footprints[0];
    const verticalOffset = plane[0].y - datum[0].y;
    plane.forEach((corner, i) => {
      assert.ok(
        Math.abs(corner.x - datum[i].x) < 0.05,
        `${name}: footprint corner ${i} drifts horizontally`,
      );
      assert.ok(
        Math.abs(corner.y - datum[i].y - verticalOffset) < 0.05,
        `${name}: footprint corner ${i} uses inconsistent projection`,
      );
    });
  }
}
function nearEqual(a: unknown, b: unknown) {
  // Browser transforms may differ at floating-point precision after seeking.
  return (
    JSON.stringify(a, (_key, value) =>
      typeof value === "number" ? Math.round(value * 100) : value,
    ) ===
    JSON.stringify(b, (_key, value) =>
      typeof value === "number" ? Math.round(value * 100) : value,
    )
  );
}

try {
  const context = await browser.newContext({
    viewport: { width: 960, height: 540 },
  });
  const page = await context.newPage();
  await open(page);
  const composition = await page.evaluate(() => {
    const root = (window as unknown as RuntimeWindow).__atlasRuntime.root();
    const scene = root.querySelector<HTMLElement>(".sp-scene")!;
    return {
      sceneWidth: scene.offsetWidth,
      sceneHeight: scene.offsetHeight,
      headers: root.querySelectorAll("header, .data-caption, .sp-chapter")
        .length,
      sidebarText: root.querySelector(".sp-scroller")?.textContent?.trim(),
      materials: [
        ...new Set(
          [...scene.querySelectorAll<HTMLElement>("[data-material]")].map(
            (element) => element.dataset.material,
          ),
        ),
      ].sort(),
      joinery: scene.querySelectorAll('[data-component="joinery"]').length,
      floorPlan: scene.querySelectorAll('[data-component="floor-plan"]').length,
      defaultResumeHidden: root.querySelector<HTMLButtonElement>(
        '[aria-label="恢復自動展示"]',
      )!.hidden,
    };
  });
  assert.equal(composition.sceneWidth, 960);
  assert.equal(composition.sceneHeight, 540);
  assert.equal(
    composition.headers,
    0,
    "Full-bleed case must not retain shell/chapter text",
  );
  assert.equal(composition.sidebarText, "");
  assert.deepEqual(composition.materials, ["concrete", "glass", "timber"]);
  assert.equal(composition.joinery, 1);
  assert.equal(composition.floorPlan, 1);
  assert.equal(composition.defaultResumeHidden, true);
  const frames = new Map<number, Snapshot>();
  for (const time of [0, 1, 1.2, 2, 2.8, 3, 4]) {
    await seek(page, time);
    const frame = await snapshot(page);
    checkBounds(frame, `960px / ${time}s`);
    frames.set(time, frame);
    // Probe the visible front roof-beam face at a point overlapped by the floor
    // at full separation. This checks actual pixels, not just DOM layer order.
    const roof = frame.footprints[2];
    const probeX = Math.round(roof[3].x * 0.43 + roof[2].x * 0.57);
    const probeY = Math.round(roof[3].y * 0.43 + roof[2].y * 0.57 + 6);
    const { data, info } = await sharp(
      await page.locator(".runtime-stage").screenshot(),
    )
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixel = (probeY * info.width + probeX) * info.channels;
    const expected = [148, 114, 75];
    assert.ok(
      expected.every(
        (value, channel) => Math.abs(data[pixel + channel] - value) <= 3,
      ),
      `${time}s: front roof beam is obscured by the slab`,
    );
    if (screenshots)
      await page.screenshot({ path: join(screenshots, `SA-152-${time}.png`) });
  }
  assert.ok(
    nearEqual(frames.get(0), frames.get(4)),
    "Four-second preview must close its loop without a jump",
  );
  assert.ok(
    nearEqual(frames.get(1), frames.get(3)),
    "Return leg must follow the same projection",
  );
  const start = frames.get(0)!,
    peak = frames.get(2)!;
  const spans = start.layers.map((box, i) => box.top - peak.layers[i].top);
  assert.ok(
    Math.abs(spans[0]) < 0.05 &&
      Math.abs(spans[1]) < 0.05 &&
      spans[2] > 0 &&
      Math.abs(spans[3]) < 0.05,
    "Only the central slab moves; foundation and both outer-frame paint passes stay stationary",
  );
  for (const frame of frames.values())
    assert.ok(
      nearEqual(start.labels, frame.labels),
      "Drawing labels/rulers must remain fixed",
    );

  const scroll = page.getByRole("region", {
    name: "建築剖面捲動控制；方向鍵、Page Down、Home 與 End 可調整深度",
  });
  await page.bringToFront();
  await scroll.focus();
  await page.keyboard.press("End");
  await expect
    .poll(async () =>
      scroll.evaluate(
        (element) =>
          element.scrollTop / (element.scrollHeight - element.clientHeight),
      ),
    )
    .toBeGreaterThan(0.99);
  const manual = await snapshot(page);
  checkBounds(manual, "Keyboard scroll endpoint");
  await seek(page, 0);
  assert.ok(
    nearEqual(manual, await snapshot(page)),
    "Host clock must not overwrite manual scroll ownership",
  );
  await page.keyboard.press("Home");
  await expect
    .poll(async () => scroll.evaluate((element) => element.scrollTop))
    .toBe(0);
  await page.keyboard.press("PageDown");
  await expect
    .poll(async () => scroll.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "恢復自動展示", exact: true }).click();
  await seek(page, 2);
  assert.ok(
    nearEqual(peak, await snapshot(page)),
    "Automatic control must resume at the requested host time",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  // Capture routes intentionally remain 960px wide. Responsive acceptance must
  // exercise the real detail route and its host-owned scale, not crop a capture.
  await page.evaluate(() => {
    localStorage.setItem(
      "remotion-atlas.preferences.v1",
      JSON.stringify({
        version: 2,
        favorites: [],
        selections: [],
        mode: "still",
        paused: true,
      }),
    );
  });
  const detail = new URL(base);
  detail.search = "";
  detail.hash = "/style/SA-152";
  await page.goto(detail.href);
  await page.locator('.technology-runtime[data-ready="true"]').waitFor();
  await page.getByRole("button", { name: "暫停互動", exact: true }).click();
  await page.locator(".runtime-stage").scrollIntoViewIfNeeded();
  const responsive = await page.evaluate(() => {
    const root = (window as unknown as RuntimeWindow).__atlasRuntime.root();
    const box = root.getBoundingClientRect();
    const host = document
      .querySelector(".runtime-stage")!
      .getBoundingClientRect();
    return {
      viewport: innerWidth,
      screenLeft: box.left,
      screenRight: box.right,
      screenTop: box.top,
      screenBottom: box.bottom,
      visibleWidth: box.width,
      hostWidth: host.width,
      scale: box.width / 960,
      documentWidth: document.documentElement.scrollWidth,
      viewportHeight: innerHeight,
    };
  });
  assert.ok(
    responsive.screenLeft >= 0 && responsive.screenRight <= responsive.viewport,
  );
  assert.ok(
    responsive.screenTop >= 0 &&
      responsive.screenBottom <= responsive.viewportHeight,
  );
  assert.ok(Math.abs(responsive.visibleWidth - responsive.hostWidth) < 0.5);
  assert.ok(responsive.scale > 0 && responsive.scale < 1);
  assert.equal(responsive.documentWidth, responsive.viewport);
  for (const time of [0, 1, 2, 3, 4]) {
    await seek(page, time);
    checkBounds(await snapshot(page), `390px normal detail / ${time}s`);
  }
  if (screenshots)
    await page
      .locator(".runtime-stage")
      .screenshot({ path: join(screenshots, "SA-152-390-detail.png") });
  await context.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 960, height: 540 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await open(reducedPage);
  await seek(reducedPage, 0);
  const reduced = await snapshot(reducedPage);
  checkBounds(reduced, "Reduced motion");
  await seek(reducedPage, 2);
  assert.ok(
    nearEqual(reduced, await snapshot(reducedPage)),
    "Reduced motion must preserve a fixed composed state",
  );
  assert.ok(
    nearEqual(reduced.layers, frames.get(1)!.layers),
    "Reduced-motion geometry must use the aligned midpoint",
  );
  await reducedContext.close();
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        caseId: "SA-152",
        states: [...frames.keys()],
        viewports: [960, 390],
        responsive,
        composition,
        bounds: start.layers,
        displacement: spans,
        checks: [
          "visible bounds including shadows",
          "shared projection",
          "front roof beam visible above the slab at all seven sampled states",
          "stationary front and rear frame passes stay aligned",
          "fixed ground guide",
          "closed preview loop",
          "native keyboard scroll",
          "manual ownership",
          "compact resume control",
          "reduced motion",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
