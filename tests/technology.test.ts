/** Created: 2026-10-04. Regression boundaries for additive technology cases. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  technologyCases,
  technologyCatalog,
  projectCase,
} from "../src/technology/registry";
import { compilePrompt, compileBlend } from "../src/lib/prompt";
import { parseLocalState, exportLocalState } from "../src/lib/storage";
const legacy = JSON.parse(readFileSync("src/catalog/styles.json", "utf8"));
test("technology cases extend stable legacy identities without alias inflation", () => {
  const ids = [...legacy, ...technologyCases].map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length > legacy.length);
  const motion = technologyCatalog.find((t) => t.id === "motion")!;
  assert.ok(motion.aliases.some((a) => a.includes("Framer")));
  assert.ok(
    !technologyCases.some((c) =>
      ["framer-motion", "motion-one", "popmotion"].includes(c.primary),
    ),
  );
});
test("thirty physical studies select Canvas, PixiJS and Three.js by capability", () => {
  const cases = technologyCases.filter((c) => {
    const n = Number(c.id.slice(3));
    return n >= 196 && n <= 225;
  });
  assert.equal(cases.length, 30);
  assert.equal(new Set(cases.map((c) => c.variant)).size, 30);
  assert.equal(cases.filter((c) => c.primary === "threejs").length, 6);
  assert.equal(cases.filter((c) => c.primary === "pixijs").length, 2);
  assert.equal(cases.filter((c) => c.primary === "canvas2d").length, 22);
  assert.ok(
    cases
      .filter((c) => c.primary === "threejs")
      .every(
        (c) =>
          c.module === "physics-element-gpu.ts" &&
          c.dependencies.includes("three"),
      ),
  );
  assert.ok(
    cases
      .filter((c) => c.primary === "pixijs")
      .every(
        (c) =>
          c.module === "physics-element-pixi.ts" &&
          c.dependencies.includes("pixi.js"),
      ),
  );
  assert.ok(cases.every((c) => c.video === "adapter-required"));
  assert.ok(
    cases.every((c) => c.limitations.some((item) => /not|不是|非/.test(item))),
  );
  assert.ok(
    cases.every((c) => c.locked.some((item) => /seekable|單一/.test(item))),
  );
});
test("every application prompt is case-aware and preserves the adaptation boundary", () => {
  for (const c of technologyCases) {
    const text = compilePrompt(projectCase(c), {
      subject: "A new production",
      ratio: "9:16",
    });
    for (const expected of [
      c.id,
      c.englishTitle,
      c.primary,
      c.module,
      ...c.locked,
      "LOCKED EFFECT REQUIREMENTS",
      "EDITABLE CONTENT",
      "WEB AND VIDEO BOUNDARY",
      "A new production",
      "9:16",
    ])
      assert.ok(text.includes(expected), `${c.id}: missing ${expected}`);
    assert.ok(!text.startsWith("Implement an original Remotion composition"));
    assert.ok(!text.includes("botanical illustration"));
  }
});
test("saved selections round-trip across both collections", () => {
  const ids = [...legacy, ...technologyCases].map((c) => c.id);
  const preferences = {
    version: 2 as const,
    favorites: [legacy[0].id, technologyCases[0].id],
    selections: [technologyCases[1].id],
    mode: "focus" as const,
    paused: true,
  };
  assert.deepEqual(
    parseLocalState(exportLocalState(preferences, []), ids).preferences,
    preferences,
  );
});
test("mixed technology synthesis requires a single implementation owner", () => {
  const result = compileBlend({
    primary: projectCase(technologyCases[0]),
    motion: projectCase(technologyCases.find((c) => c.primary === "gsap")!),
  });
  assert.match(result.prompt, /SYNTHESIZED BRIEF/);
  assert.match(result.prompt, /one authoritative/);
  assert.ok(result.warnings.length > 0);
});
