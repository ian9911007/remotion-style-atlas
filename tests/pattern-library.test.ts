/** Created: 2026-10-05. Source provenance is independent from engines and visual style. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { patternMetadata, patternMetadataSchema, patternSearchTerms, patternTaxonomy } from "../src/technology/pattern-library";
import { projectCase, technologyCases, technologyCatalog } from "../src/technology/registry";
import { compileCasePrompt } from "../src/technology/prompt";

test("unannotated cases stay unknown, while curated mechanics are searchable", () => {
  assert.equal(patternMetadata({ id: "SA-999" }), undefined);
  const c = technologyCases.find((c) => c.id === "SA-109")!;
  assert.equal(c.primary, "gsap");
  assert.deepEqual(patternMetadata(c)?.sources, ["custom-implementation"]);
  assert.ok(projectCase(c).aliases.includes("title-reveal"));
  assert.ok(!patternSearchTerms(c).includes("react-bits"));
  assert.ok(!technologyCatalog.some((t) => t.id === "react-bits"));
});

test("a future React Bits reference preserves renderer, art direction and constraints", () => {
  const original = technologyCases.find((c) => c.id === "SA-109")!;
  const c = { ...original, patternLibrary: { patterns: ["title-reveal"], sources: ["react-bits"], keywords: ["mask"], performanceNote: "Estimated DOM cost; unmeasured." } };
  assert.ok(patternMetadataSchema.safeParse(c.patternLibrary).success);
  assert.equal(projectCase(c).palette.background, original.visual.background);
  assert.equal(c.primary, "gsap");
  assert.deepEqual(c.dependencies, original.dependencies);
  const prompt = compileCasePrompt(c);
  for (const value of [...original.locked, "react-bits", "Implementation source does not determine visual style", "Estimated DOM cost"])
    assert.ok(prompt.includes(value));
});

test("unknown source or pattern identifiers fail instead of silently misattributing", () => {
  const data = { patterns: ["title-reveal"], sources: ["react-bits"], keywords: [], performanceNote: "Unmeasured." };
  assert.ok(!patternMetadataSchema.safeParse({ ...data, patterns: ["not-a-pattern"] }).success);
  assert.ok(!patternMetadataSchema.safeParse({ ...data, sources: ["not-a-source"] }).success);
  for (const list of [patternTaxonomy.patterns, patternTaxonomy.sources])
    assert.equal(new Set(list.map((x) => x.id)).size, list.length);
  for (const c of technologyCases) {
    const data = patternMetadata(c);
    if (data) assert.ok(patternMetadataSchema.safeParse(data).success, c.id);
  }
});
