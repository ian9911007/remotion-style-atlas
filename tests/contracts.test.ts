import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalogSchema } from "../src/catalog/schema";
import {
  allStyles as publishedStyles,
  catalog as runtimeCatalog,
  reviewPreviewIds,
  selectReviewPreviews,
} from "../src/catalog/catalog";
import { compilePrompt, compileBlend } from "../src/lib/prompt";
import {
  parseLocalState,
  exportLocalState,
  preferencesSchema,
  referenceSchema,
  type Preferences,
} from "../src/lib/storage";
const styles = catalogSchema.parse(
  JSON.parse(
    readFileSync(
      new URL("../src/catalog/styles.json", import.meta.url),
      "utf8",
    ),
  ),
);
test("review-only legacy candidates stay local while published catalog remains intact", () => {
  const candidate = { ...styles[0], id: "SA-999", status: "reviewed" as const };
  const reviewOnly = selectReviewPreviews([styles[0], candidate]);
  assert.deepEqual(reviewOnly.map((style) => style.id), ["SA-999"]);
  assert.ok(publishedStyles.every((style) => style.status === "published"));
  assert.equal(publishedStyles.length, 100);
  assert.deepEqual(reviewPreviewIds, []);
  assert.ok(reviewOnly.every((style) => !runtimeCatalog.some((item) => item.id === style.id)));
  assert.ok(publishedStyles.every((style) => runtimeCatalog.some((item) => item.id === style.id)));
});
test("portable prompt includes all owned rules, identity and actual limitations", () => {
  for (const s of styles) {
    const prompt = compilePrompt(s, { subject: "An original brand" });
    for (const literal of [
      s.id,
      s.version,
      s.englishName,
      s.motion.easing,
      s.layout.rules[0],
      s.typography.rules[0],
      s.limitations[0],
      "An original brand",
      "ACCEPTANCE CRITERIA",
      "EDITABLE CONTENT",
    ])
      assert.ok(prompt.includes(literal), `${s.id} lacks ${literal}`);
    assert.equal(prompt, compilePrompt(s, { subject: "An original brand" }));
    assert.ok(prompt.length > 3500);
  }
});
test("blend resolves ownership and labels an unrendered synthesis", () => {
  const result = compileBlend({
    primary: styles[1],
    motion: styles[3],
    typography: styles[0],
  });
  assert.ok(result.prompt.startsWith("SYNTHESIZED BRIEF"));
  assert.match(result.prompt, /Preserve primary layout/);
  assert.match(result.prompt, /MOTION OVERRIDE/);
  assert.ok(result.warnings.length >= 2);
});
const prefs: Preferences = {
  version: 2,
  favorites: [styles[0].id],
  selections: [styles[1].id],
  mode: "focus",
  paused: true,
};
test("legacy playback default migrates to focus and new explicit global preference persists", () => {
  const oldDefault = preferencesSchema.parse({
    ...prefs,
    version: 1,
    mode: "wall",
  });
  assert.equal(oldDefault.version, 2);
  assert.equal(oldDefault.mode, "focus");
  assert.equal(
    preferencesSchema.parse({ ...prefs, mode: "wall" }).mode,
    "wall",
  );
});
test("preferences round trip preserves favorites, explicit pause and order", () =>
  assert.deepEqual(
    parseLocalState(
      exportLocalState(prefs, []),
      styles.map((s) => s.id),
    ).preferences,
    prefs,
  ));
test("imports reject unknown ids, schema versions, overfull tray and duplicate selection", () => {
  for (const change of [
    { favorites: ["SA-999"] },
    { selections: styles.slice(0, 4).map((s) => s.id) },
    { selections: ["SA-001", "SA-001"] },
  ])
    assert.throws(() =>
      parseLocalState(
        JSON.stringify({
          schemaVersion: 1,
          preferences: { ...prefs, ...change },
          references: [],
          attachmentMediaIncluded: false,
        }),
        styles.map((s) => s.id),
      ),
    );
  assert.throws(() => parseLocalState('{"schemaVersion":2}', []));
  assert.throws(() => parseLocalState("x".repeat(4000001), []));
});
test("references do not accept executable URLs, foreign paths or unknown properties", () => {
  const base = {
    id: "reference-1",
    title: "Study",
    url: "https://example.com/source",
    creator: "",
    notes: "",
    timeRanges: "",
    tags: [],
    relationships: [],
    rights: "Unknown",
    observations: "Visible layout only",
    interpretations: "",
    adaptations: "",
    unknowns: "Motion unobserved",
    created: "2026-10-03",
  };
  assert.equal(referenceSchema.parse(base).observations, base.observations);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///private/tmp/test",
    "https://user:pass@example.com",
  ])
    assert.throws(() => referenceSchema.parse({ ...base, url }));
  assert.throws(() => referenceSchema.parse({ ...base, execute: "untrusted" }));
  assert.throws(() =>
    referenceSchema.parse({
      ...base,
      attachment: {
        name: "x",
        key: "../../private",
        type: "image/jpeg",
        size: 20,
      },
    }),
  );
});
test("catalog refuses fake publication and duplicate identities", () => {
  assert.throws(() =>
    catalogSchema.parse([
      {
        ...styles[0],
        status: "published",
        review: { ...styles[0].review, visual: false },
      },
    ]),
  );
  assert.throws(() => catalogSchema.parse([styles[0], styles[0]]));
});
