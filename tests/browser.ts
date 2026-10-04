/** Real-browser acceptance checks. WebKit automation is not real-device Safari validation. */
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  chromium,
  webkit,
  expect,
  type Browser,
  type BrowserContextOptions,
  type Page,
} from "@playwright/test";

const baseURL = process.env.ATLAS_URL || "http://127.0.0.1:4173/";
const chromeExecutable =
  process.env.BROWSER_EXECUTABLE ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const screenshotDirectory = fileURLToPath(
  new URL("../.cache/browser/", import.meta.url),
);
const PREFS = "remotion-atlas.preferences.v1";
const REFS = "remotion-atlas.references.v1";
type Snapshot = {
  limit: number;
  playing: string[];
  sources: string[];
  mode: string;
  paused: boolean;
  blocked: boolean;
};
type Test = {
  name: string;
  run: (page: Page) => Promise<void>;
  context?: BrowserContextOptions;
};
const checks: Test[] = [];
const test = (
  name: string,
  run: Test["run"],
  context?: BrowserContextOptions,
) => checks.push({ name, run, context });
const card = (page: Page, id = "SA-001") =>
  page.locator(`.style-card[data-style-id="${id}"]`);
const snapshot = (page: Page) =>
  page.evaluate(() =>
    (
      window as unknown as { __atlasPlayback: { snapshot: () => Snapshot } }
    ).__atlasPlayback.snapshot(),
  );
async function allPaused(page: Page) {
  await expect.poll(async () => (await snapshot(page)).playing.length).toBe(0);
}
async function settledPlayback(page: Page) {
  await page.getByRole("button", { name: "全域", exact: true }).click();
  await expect
    .poll(async () => (await snapshot(page)).playing.length, { timeout: 15000 })
    .toBeGreaterThan(0);
}
async function openFirst(page: Page) {
  await card(page).locator(".card-open").click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
async function installClipboard(page: Page, reject = false) {
  await page.evaluate((fail) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          if (fail)
            throw new DOMException("Permission denied", "NotAllowedError");
          (window as unknown as { __copiedText: string }).__copiedText = text;
        },
      },
    });
  }, reject);
}
async function stored(page: Page, key: string) {
  return page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k) || "null"),
    key,
  );
}
async function seedReference(page: Page) {
  await page.getByRole("button", { name: "參考收件匣", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "參考收件匣" });
  await dialog.getByLabel("參考標題", { exact: true }).fill("測試：紙材與留白");
  await dialog
    .getByLabel("來源網址", { exact: true })
    .fill("https://example.com/reference");
  await dialog
    .getByLabel("直接觀察", { exact: true })
    .fill("標題位於左上角，中央可見紙張重疊。");
  await dialog
    .getByLabel("未知或無法存取的資訊", { exact: true })
    .fill("尚未檢視動畫，因此無法確認時序。");
  await dialog.getByRole("button", { name: "儲存參考草稿" }).click();
  await expect(page.getByRole("status")).toContainText("尚未發佈");
}

test("search aliases, feeling, ID, combined dimensional filters and stable ordering", async (page) => {
  const ids = await page
    .locator(".style-card")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-style-id")),
    );
  if (process.env.ATLAS_EXPECT_STYLES !== undefined) {
    const expectedStyles = Number(process.env.ATLAS_EXPECT_STYLES);
    assert.ok(
      Number.isSafeInteger(expectedStyles) && expectedStyles > 0,
      "ATLAS_EXPECT_STYLES must be a positive integer.",
    );
    assert.equal(ids.length, expectedStyles, "Exact published style count.");
  } else {
    assert.ok(
      ids.length >= 12,
      "At least the completed first twelve published styles must be available.",
    );
  }
  const search = page.getByRole("textbox", { name: "搜尋風格" });
  await search.fill("SA-003");
  await expect(page.locator(".style-card")).toHaveCount(1);
  await expect(card(page, "SA-003")).toBeVisible();
  await search.fill("理性");
  await expect(card(page)).toBeVisible();
  await search.fill("swiss grid manifesto");
  await expect(card(page)).toBeVisible();
  await search.fill("no-such-style-unfindable");
  await expect(page.locator(".empty-state")).toContainText("沒有符合");
  await search.fill("");
  await page.getByRole("button", { name: "篩選", exact: true }).click();
  await page
    .locator("#filter-panel")
    .getByLabel("視覺家族")
    .selectOption("editorial");
  await page
    .locator("#filter-panel")
    .getByLabel("動態強度")
    .selectOption("moderate");
  const filtered = await page
    .locator(".style-card")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-style-id")),
    );
  assert.ok(
    filtered.length > 0,
    "The test catalog must contain a moderate editorial style.",
  );
  assert.deepEqual(
    filtered,
    ids.filter((id) => filtered.includes(id)),
    "Filtering preserves original IDs and relative order.",
  );
  await page
    .locator("#filter-panel")
    .getByRole("button", { name: "重設" })
    .click();
  assert.deepEqual(
    await page
      .locator(".style-card")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-style-id")),
      ),
    ids,
  );
});

test("favorites persist after refresh and favorite collection works", async (page) => {
  await card(page)
    .getByRole("button", { name: /^收藏 / })
    .click();
  assert.deepEqual((await stored(page, PREFS)).favorites, ["SA-001"]);
  await page.reload();
  await expect(
    card(page).getByRole("button", { name: /^取消收藏 / }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /已收藏/ }).click();
  await expect(page.locator(".style-card")).toHaveCount(1);
  await card(page)
    .getByRole("button", { name: /^取消收藏 / })
    .click();
  await expect(page.locator(".empty-state")).toContainText("還沒有收藏");
});

test("detail preserves scroll, search, focus, keyboard Escape and hash refresh", async (page) => {
  await page.evaluate(() => {
    document.querySelector("main")!.setAttribute("style", "min-height:2000px");
  });
  await page.evaluate(() => window.scrollTo(0, 150));
  const opening = card(page).locator(".card-open");
  await opening.focus();
  const before = await page.evaluate(() => window.scrollY);
  await opening.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole("dialog")
        .locator(".detail-player video")
        .evaluate((node: HTMLVideoElement) => !node.paused),
    )
    .toBe(true);
  assert.ok(page.url().endsWith("#/style/SA-001"));
  await expect.poll(async () => (await snapshot(page)).blocked).toBe(true);
  await allPaused(page);
  const focused = await page.evaluate(() =>
    document.querySelector("dialog")?.contains(document.activeElement),
  );
  assert.equal(focused, true);
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() =>
      document.querySelector("dialog")?.contains(document.activeElement),
    ),
    true,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opening).toBeFocused();
  assert.equal(await page.evaluate(() => window.scrollY), before);
  await page.getByRole("textbox", { name: "搜尋風格" }).fill("SA-001");
  await openFirst(page);
  await page.getByRole("button", { name: "關閉風格檢視" }).click();
  await expect(page.getByRole("textbox", { name: "搜尋風格" })).toHaveValue(
    "SA-001",
  );
  await expect(page.locator(".style-card")).toHaveCount(1);
  await page.goto(`${baseURL}#/style/SA-001`);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("h1")).not.toBeEmpty();
  await expect(
    page.getByRole("dialog").locator(".detail-player video"),
  ).toHaveAttribute("src", /detail\.mp4$/);
});

test("SA-022, SA-084 and SA-093 detail movies autoplay and advance", async (page) => {
  for (const id of ["SA-022", "SA-084", "SA-093"]) {
    await page.goto(`${baseURL}#/style/${id}`);
    const video = page.getByRole("dialog").locator(".detail-player video");
    await expect(video).toBeVisible();
    await expect
      .poll(() =>
        video.evaluate(
          (node: HTMLVideoElement) => !node.paused && node.currentTime > 0.2,
        ),
      )
      .toBe(true);
    const start = await video.evaluate(
      (node: HTMLVideoElement) => node.currentTime,
    );
    await page.waitForTimeout(700);
    const end = await video.evaluate(
      (node: HTMLVideoElement) => node.currentTime,
    );
    assert.ok(end > start, `${id} detail preview advances after opening.`);
    assert.equal(
      await video.evaluate((node: HTMLVideoElement) => node.muted),
      true,
    );
    await page.getByRole("button", { name: "關閉風格檢視" }).click();
  }
});

test("clipboard copies full portable prompt and context only after success", async (page) => {
  await installClipboard(page);
  await openFirst(page);
  const dialog = page.getByRole("dialog");
  await dialog.locator(".context-fields summary").click();
  await dialog.getByLabel("影片主題", { exact: true }).fill("獨立品牌產品影片");
  await dialog.getByLabel("影片長度", { exact: true }).fill("30 seconds");
  await dialog
    .getByRole("button", { name: "複製完整提示詞", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "已複製", exact: true }),
  ).toBeVisible();
  const copied = await page.evaluate(
    () => (window as unknown as { __copiedText: string }).__copiedText,
  );
  assert.ok(copied.length > 3500);
  assert.ok(copied.includes("ACCEPTANCE CRITERIA"));
  assert.ok(copied.includes("REMOTION IMPLEMENTATION"));
  assert.ok(copied.includes("獨立品牌產品影片"));
  assert.ok(copied.includes("30 seconds"));
});

test("clipboard denial offers selectable complete text with no false success", async (page) => {
  await installClipboard(page, true);
  await openFirst(page);
  await page
    .getByRole("button", { name: "複製完整提示詞", exact: true })
    .click();
  const fallback = page.getByLabel("手動複製完整內容");
  await expect(fallback).toBeVisible();
  assert.ok((await fallback.inputValue()).length > 3500);
  await expect(fallback).toBeFocused();
  const selected = await fallback.evaluate((node) => {
    const input = node as HTMLTextAreaElement;
    return input.selectionEnd - input.selectionStart;
  });
  assert.equal(selected, (await fallback.inputValue()).length);
  await expect(
    page.getByRole("button", { name: "已複製", exact: true }),
  ).toHaveCount(0);
});

test("style export is validated JSON companion and includes canonical identity", async (page) => {
  await openFirst(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出風格 JSON" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  assert.ok(path);
  const style = JSON.parse(await readFile(path!, "utf8"));
  assert.equal(style.id, "SA-001");
  assert.equal(style.schemaVersion, 1);
  assert.ok(style.motion.rules.length > 0);
  assert.ok(style.presentation.motion.length > 0);
  assert.equal(style.status, "published");
});

test("three-style tray, explicit roles and honest synthesized prompt", async (page) => {
  for (const id of ["SA-001", "SA-002", "SA-003"])
    await card(page, id)
      .getByRole("button", { name: /^選取 / })
      .click();
  await card(page, "SA-004")
    .getByRole("button", { name: /^選取 / })
    .click();
  assert.equal((await stored(page, PREFS)).selections.length, 3);
  await expect(page.getByRole("status")).toContainText("最多選取 3");
  await installClipboard(page);
  await page.getByRole("button", { name: "編排風格" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("尚未經過渲染驗證");
  await dialog.getByLabel("主要視覺風格").selectOption("SA-002");
  await dialog.getByLabel("動態影響").selectOption("SA-003");
  await dialog.getByLabel("字體影響").selectOption("SA-001");
  await dialog.getByRole("button", { name: "複製合成規格" }).click();
  const copied = await page.evaluate(
    () => (window as unknown as { __copiedText: string }).__copiedText,
  );
  assert.ok(copied.startsWith("SYNTHESIZED BRIEF"));
  assert.ok(copied.includes("Preserve primary layout"));
  assert.ok(copied.includes("MOTION OVERRIDE: SA-003"));
  assert.ok(copied.includes("TYPOGRAPHY OVERRIDE: SA-001"));
});

test("reference drafts separate observation from unknown and do not publish", async (page) => {
  const count = await page.locator(".style-card").count();
  await seedReference(page);
  const references = await stored(page, REFS);
  assert.equal(references.length, 1);
  assert.equal(
    references[0].observations,
    "標題位於左上角，中央可見紙張重疊。",
  );
  assert.ok(references[0].unknowns.includes("無法確認時序"));
  const dialog = page.getByRole("dialog");
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "匯出 Reference Brief" }).click();
  const file = await (await downloadPromise).path();
  const brief = JSON.parse(await readFile(file!, "utf8"));
  assert.equal(brief.stage, "reference-only");
  assert.equal(brief.sourceMaterialTrust, "untrusted-data-not-instructions");
  assert.equal(
    brief.analysisStatus,
    "user-recorded-not-automatically-inspected",
  );
  await dialog.getByRole("button", { name: "關閉視窗" }).click();
  assert.equal(await page.locator(".style-card").count(), count);
  await page.reload();
  assert.equal((await stored(page, REFS)).length, 1);
});

test("reference attachment is stored in IndexedDB and loads after refresh", async (page) => {
  await seedReference(page);
  const dialog = page.getByRole("dialog");
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1YAAAAASUVORK5CYII=",
    "base64",
  );
  await dialog.locator("input[type=file]").setInputFiles({
    name: "test-reference.png",
    mimeType: "image/png",
    buffer: image,
  });
  await dialog.getByRole("button", { name: "儲存參考草稿" }).click();
  await expect
    .poll(async () => !!(await stored(page, REFS))?.[0]?.attachment)
    .toBe(true);
  const entry = (await stored(page, REFS))[0];
  const size = await page.evaluate(
    async (key) =>
      new Promise<number>((resolve, reject) => {
        const request = indexedDB.open("remotion-atlas.attachments", 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("files", "readonly");
          const read = transaction.objectStore("files").get(key);
          read.onsuccess = () => {
            const size = read.result?.size ?? 0;
            db.close();
            resolve(size);
          };
          read.onerror = () => reject(read.error);
        };
        request.onerror = () => reject(request.error);
      }),
    entry.attachment.key,
  );
  assert.equal(size, image.length);
  await dialog.getByRole("button", { name: "關閉視窗" }).click();
  await page.reload();
  await page.getByRole("button", { name: "參考收件匣", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /測試：紙材與留白.*本機草稿/ })
    .click();
  await expect(page.locator(".attachment-box img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
});

test("versioned local export/import round trip and malformed import rejection", async (page) => {
  await card(page)
    .getByRole("button", { name: /^收藏 / })
    .click();
  await card(page, "SA-002")
    .getByRole("button", { name: /^選取 / })
    .click();
  await seedReference(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "關閉視窗" })
    .click();
  const expectedPreferences = await stored(page, PREFS);
  const expectedReferences = await stored(page, REFS);
  await page.getByRole("button", { name: "本機資料匯出與匯入" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出本機資料" }).click();
  const path = await (await downloadPromise).path();
  const payload = await readFile(path!);
  assert.equal(JSON.parse(payload.toString()).attachmentMediaIncluded, false);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "關閉視窗" })
    .click();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "本機資料匯出與匯入" }).click();
  await page.getByRole("dialog").locator("input[type=file]").setInputFiles({
    name: "state.json",
    mimeType: "application/json",
    buffer: payload,
  });
  await expect(page.getByRole("status")).toContainText("本機資料已匯入");
  assert.deepEqual(await stored(page, PREFS), expectedPreferences);
  assert.deepEqual(await stored(page, REFS), expectedReferences);
  const malicious = { ...JSON.parse(payload.toString()), schemaVersion: 99 };
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(malicious)),
    });
  await expect(page.getByRole("status")).toContainText("匯入失敗");
  assert.deepEqual(await stored(page, PREFS), expectedPreferences);
});

test("new visitors default to focus; global mode respects visible decoder budget and pause/still stop playback", async (page) => {
  await expect(
    page.getByRole("button", { name: "聚焦", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await allPaused(page);
  await settledPlayback(page);
  assert.ok(
    (await snapshot(page)).playing.length <= (await snapshot(page)).limit,
  );
  await page.getByRole("button", { name: "暫停所有預覽" }).click();
  await allPaused(page);
  await card(page, "SA-003").hover();
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(200);
  await allPaused(page);
  assert.equal((await snapshot(page)).paused, true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "繼續所有預覽" }),
  ).toBeVisible();
  await allPaused(page);
  await page.getByRole("button", { name: "繼續所有預覽" }).click();
  await page.getByRole("button", { name: "靜態", exact: true }).click();
  await allPaused(page);
  await card(page).hover();
  await allPaused(page);
});

test("saved legacy carousel default migrates to focus once and explicit global choice persists", async (page) => {
  await page.evaluate((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        favorites: [],
        selections: [],
        mode: "wall",
        paused: false,
      }),
    );
  }, PREFS);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "聚焦", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  assert.deepEqual(await stored(page, PREFS), {
    version: 2,
    favorites: [],
    selections: [],
    mode: "focus",
    paused: false,
  });
  await page.getByRole("button", { name: "全域", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "全域", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("focus mode plays the hovered card and its surrounding grid neighbors", async (page) => {
  await page.getByRole("button", { name: "聚焦", exact: true }).click();
  await page.mouse.move(0, 0);
  await allPaused(page);
  await card(page, "SA-010").hover();
  await expect
    .poll(async () => (await snapshot(page)).playing.length)
    .toBeGreaterThan(1);
  const group = await snapshot(page);
  assert.ok(group.playing.includes("SA-010"));
  assert.ok(group.playing.length <= group.limit);
});

test("global playback follows visible cards after scrolling", async (page) => {
  await page.getByRole("button", { name: "全域", exact: true }).click();
  await card(page, "SA-061").scrollIntoViewIfNeeded();
  await expect(card(page, "SA-061")).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).playing.includes("SA-061"), {
      timeout: 15000,
      intervals: [250, 500, 1000],
    })
    .toBe(true);
  assert.ok(
    (await snapshot(page)).playing.length <= (await snapshot(page)).limit,
  );
});

test("focus mode updates the neighboring group on hover and keyboard focus", async (page) => {
  await page.getByRole("button", { name: "聚焦", exact: true }).click();
  await page.mouse.move(0, 0);
  await allPaused(page);
  await card(page, "SA-003").hover();
  await expect
    .poll(async () => (await snapshot(page)).playing.length)
    .toBeGreaterThan(1);
  assert.ok((await snapshot(page)).playing.includes("SA-003"));
  await page.mouse.move(0, 0);
  await allPaused(page);
  await card(page, "SA-002").locator(".card-open").focus();
  await expect
    .poll(async () => (await snapshot(page)).playing.length)
    .toBeGreaterThan(1);
  assert.ok((await snapshot(page)).playing.includes("SA-002"));
});

test("global mode pauses offscreen and hidden-document videos", async (page) => {
  await settledPlayback(page);
  await page.evaluate(() => {
    document.querySelector("footer")!.setAttribute("style", "height:2500px");
  });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await allPaused(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settledPlayback(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await allPaused(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await settledPlayback(page);
  assert.ok(
    (await snapshot(page)).playing.length <= (await snapshot(page)).limit,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
});

test(
  "reduced motion defaults to still with no attached gallery sources",
  async (page) => {
    await expect(
      page.getByRole("button", { name: "靜態", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(300);
    const state = await snapshot(page);
    assert.equal(state.playing.length, 0);
    assert.equal(state.sources.length, 0);
    await card(page).hover();
    await allPaused(page);
  },
  { reducedMotion: "reduce" },
);

test(
  "coarse pointer preserves two-column phone layout and touch detail",
  async (page) => {
    await settledPlayback(page);
    const state = await snapshot(page);
    assert.ok(state.playing.length > 0);
    const columns = await page
      .locator(".gallery-grid")
      .evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(" ").length,
      );
    assert.equal(columns, 2);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
    );
    await card(page).locator(".card-open").tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await allPaused(page);
    await page.getByRole("button", { name: "關閉風格檢視" }).tap();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  },
  {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  },
);

test("autoplay rejection leaves a poster and explicit retry control", async (page) => {
  await page.evaluate(() => {
    HTMLMediaElement.prototype.play = function () {
      return Promise.reject(
        new DOMException("Autoplay denied", "NotAllowedError"),
      );
    };
  });
  await page.getByRole("button", { name: "靜態", exact: true }).click();
  await page.getByRole("button", { name: "全域", exact: true }).click();
  await expect(page.locator(".media-retry").first()).toBeVisible();
  await expect(page.locator(".card-media img").first()).toBeVisible();
  await allPaused(page);
  await page.locator(".media-retry").first().click();
  await expect(page.locator(".media-retry").first()).toBeVisible();
});

test("missing gallery video, detail video and poster have usable failure states", async (page) => {
  await page.route("**/media/*gallery.mp4", (route) => route.abort("failed"));
  await page.route("**/media/*detail.mp4", (route) => route.abort("failed"));
  await page.route("**/media/*poster.jpg", (route) => route.abort("failed"));
  await page.reload();
  await page.getByRole("button", { name: "全域", exact: true }).click();
  await expect(page.locator(".poster-fallback").first()).toBeVisible();
  await expect(page.locator(".media-retry").first()).toBeVisible();
  await openFirst(page);
  await expect(page.locator(".detail-video-fallback")).toContainText(
    "影片暫時無法載入",
  );
  await expect(
    page.getByRole("button", { name: "重新載入影片" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "複製完整提示詞", exact: true }),
  ).toBeVisible();
});

test("unavailable preference storage leaves a working UI and a visible warning", async (page) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage not permitted", "SecurityError");
    };
  });
  await card(page)
    .getByRole("button", { name: /^收藏 / })
    .click();
  await expect(page.getByRole("status")).toContainText("瀏覽器未允許儲存偏好");
  await expect(
    card(page).getByRole("button", { name: /^取消收藏 / }),
  ).toHaveAttribute("aria-pressed", "true");
  assert.deepEqual((await stored(page, PREFS)).favorites, []);
  await page.getByRole("textbox", { name: "搜尋風格" }).fill("SA-003");
  await expect(card(page, "SA-003")).toBeVisible();
});

test("desktop, tablet and phone layouts have no horizontal Chinese overflow", async (page) => {
  for (const [label, width, height, columns] of [
    ["desktop", 1600, 1050, 5],
    ["tablet", 900, 1100, 3],
    ["phone", 390, 844, 2],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(150);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
      `${label} page overflow`,
    );
    assert.equal(
      await page
        .locator(".gallery-grid")
        .evaluate(
          (node) =>
            getComputedStyle(node).gridTemplateColumns.split(" ").length,
        ),
      columns,
    );
    await page.screenshot({
      path: `${screenshotDirectory}/${currentBrowser}-${label}.png`,
      fullPage: false,
    });
    await openFirst(page);
    assert.equal(
      await page
        .getByRole("dialog")
        .evaluate((node) => node.scrollWidth > node.clientWidth),
      false,
      `${label} detail overflow`,
    );
    await page.screenshot({
      path: `${screenshotDirectory}/${currentBrowser}-${label}-detail.png`,
      fullPage: false,
    });
    await page.getByRole("button", { name: "關閉風格檢視" }).click();
  }
});

const selectedChecks = checks.filter(
  (check) =>
    !process.env.ATLAS_TEST_MATCH ||
    process.env.ATLAS_TEST_MATCH.split(",").some((match) =>
      check.name.includes(match),
    ),
);
if (!selectedChecks.length)
  throw new Error("ATLAS_TEST_MATCH did not select any browser checks.");
let currentBrowser = "";
await mkdir(screenshotDirectory, { recursive: true });
const results: {
  browser: string;
  test: string;
  passed: boolean;
  error?: string;
}[] = [];
for (const [name, launch] of [
  [
    "chromium",
    () => chromium.launch({ headless: true, executablePath: chromeExecutable }),
  ],
  ["webkit", () => webkit.launch({ headless: true })],
] as const) {
  if (
    process.env.ATLAS_BROWSERS &&
    !process.env.ATLAS_BROWSERS.split(",").includes(name)
  )
    continue;
  currentBrowser = name;
  let browser: Browser;
  try {
    browser = await launch();
  } catch (error) {
    results.push({
      browser: name,
      test: "browser launch",
      passed: false,
      error: String(error),
    });
    console.error(`FAIL ${name} launch: ${error}`);
    continue;
  }
  for (const check of selectedChecks) {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1050 },
      reducedMotion: "no-preference",
      acceptDownloads: true,
      ...check.context,
    });
    /* tsx preserves callback names using this helper in serialized browser functions. */ await context.addInitScript(
      "globalThis.__name = (fn) => fn;",
    );
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await expect(page.locator(".style-card").first()).toBeVisible();
      await check.run(page);
      assert.deepEqual(errors, [], "No uncaught application errors.");
      results.push({ browser: name, test: check.name, passed: true });
      console.log(`PASS ${name}: ${check.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        browser: name,
        test: check.name,
        passed: false,
        error: message,
      });
      console.error(`FAIL ${name}: ${check.name}\n${message}`);
      await page
        .screenshot({
          path: `${screenshotDirectory}/${name}-failure-${checks.indexOf(check) + 1}.png`,
          fullPage: true,
        })
        .catch(() => undefined);
      console.error(
        "Visible diagnostics:",
        await page.locator(".warning").allTextContents(),
      );
    } finally {
      await context.close();
    }
  }
  await browser.close();
}
const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;
console.log(
  JSON.stringify(
    {
      environment: {
        url: baseURL,
        chromiumExecutable: chromeExecutable,
        webkit: "Playwright WebKit automation; not real-device Safari",
      },
      passed,
      failed,
      results,
    },
    null,
    2,
  ),
);
if (failed) process.exitCode = 1;
