import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  canonicalStyle,
  chooseStyles,
  fingerprintFor,
  projectRoot,
  readCatalog,
  renderingCodeHash,
  sha256,
  recordIsCurrent,
  type RenderRecord,
} from "../scripts/render";

const catalog = readCatalog();
test("incremental fingerprints ignore generated media and review state but include creative changes", () => {
  assert.ok(
    catalog.length >= 12,
    "The representative checkpoint contains at least 12 real styles",
  );
  const style = catalog[0];
  const updated = {
    ...style,
    status: "published" as const,
    updated: "2099-01-01",
    review: {
      visual: true,
      motion: true,
      reviewer: "Tester",
      notes: "Observed",
      date: "2099-01-01",
    },
    variants: style.variants.map((v) => ({ ...v, reviewed: !v.reviewed })),
    preview: {
      ...style.preview,
      fingerprint: "new",
      gallery: "media/new.mp4",
      detail: "media/detail.mp4",
      poster: "media/poster.jpg",
    },
  };
  assert.deepEqual(canonicalStyle(style), canonicalStyle(updated));
  assert.equal(fingerprintFor(style, "code"), fingerprintFor(updated, "code"));
  assert.notEqual(
    fingerprintFor(style, "code"),
    fingerprintFor(
      { ...style, motion: { ...style.motion, language: "new timing" } },
      "code",
    ),
  );
  assert.notEqual(
    fingerprintFor(style, "code"),
    fingerprintFor(style, "changed-code"),
  );
});
test("source assets and fonts invalidate code hash", () => {
  const root = mkdtempSync(path.join(tmpdir(), "atlas-fingerprint-"));
  try {
    mkdirSync(path.join(root, "src/remotion"), { recursive: true });
    mkdirSync(path.join(root, "public/assets"), { recursive: true });
    mkdirSync(path.join(root, "public/fonts"), { recursive: true });
    writeFileSync(path.join(root, "src/remotion/recipe.tsx"), "frame-driven");
    const initial = renderingCodeHash(root);
    writeFileSync(path.join(root, "public/assets/test.svg"), "<svg/>");
    assert.notEqual(initial, renderingCodeHash(root));
    const assets = renderingCodeHash(root);
    writeFileSync(path.join(root, "public/fonts/font.woff2"), "font");
    assert.notEqual(assets, renderingCodeHash(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test("recipe fingerprints isolate independent style implementations", () => {
  const sonar = renderingCodeHash(projectRoot, "sonar-depth");
  const ink = renderingCodeHash(projectRoot, "ink-bloom");
  assert.notEqual(sonar, ink);
});
test("selected rendering rejects unknown IDs and unimplemented drafts", () => {
  const style = catalog[0];
  assert.deepEqual(
    chooseStyles(catalog, [style.id]).map((s) => s.id),
    [style.id],
  );
  assert.throws(() => chooseStyles(catalog, ["SA-999"]), /Unknown style/);
  assert.throws(() => chooseStyles(catalog, []), /Supply/);
  assert.throws(
    () => chooseStyles([{ ...style, status: "draft" }], [style.id]),
    /Draft/,
  );
  assert.throws(() => chooseStyles(catalog, ["--all", "--changed"]), /Choose/);
});
test("cache integrity rejects changed output bytes, missing assets, and mismatched paths", () => {
  const root = mkdtempSync(path.join(tmpdir(), "atlas-media-"));
  try {
    mkdirSync(path.join(root, "public/media"), { recursive: true });
    const style = {
      ...catalog[0],
      preview: {
        ...catalog[0].preview,
        fingerprint: "fp",
        gallery: "media/g.mp4",
        detail: "media/d.mp4",
        poster: "media/p.jpg",
      },
    };
    const outputs = {} as RenderRecord["outputs"];
    for (const kind of ["gallery", "detail", "poster"] as const) {
      writeFileSync(path.join(root, "public", style.preview[kind]), kind);
      outputs[kind] = {
        path: style.preview[kind],
        bytes: kind.length,
        sha256: sha256(kind),
      };
    }
    const record: RenderRecord = {
      fingerprint: "fp",
      renderedAt: "date",
      outputs,
    };
    assert.equal(recordIsCurrent(style, record, "fp", root), true);
    writeFileSync(path.join(root, "public", style.preview.gallery), "corrupt");
    assert.equal(recordIsCurrent(style, record, "fp", root), false);
    assert.equal(recordIsCurrent(style, undefined, "fp", root), false);
    assert.equal(recordIsCurrent(style, record, "new", root), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
