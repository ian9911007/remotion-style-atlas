import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { recipeRegistry } from "../src/remotion/recipes";
import {
  atomicJson,
  checkOutput,
  fingerprintFor,
  projectRoot,
  readCatalog,
  readManifest,
  recordIsCurrent,
  renderingCodeHash,
} from "./render";

export function validateCatalog({ writePublished = true } = {}) {
  const catalog = readCatalog();
  const manifest = readManifest();
  const hash = renderingCodeHash();
  const errors: string[] = [];
  if (manifest.schemaVersion !== 1)
    errors.push("Unsupported render manifest schema.");
  for (const style of catalog) {
    if (["draft", "reference-only"].includes(style.status)) continue;
    if (!recipeRegistry[style.recipe])
      errors.push(`${style.id}: no trusted recipe ${style.recipe}`);
    for (const asset of style.assets) {
      if (
        !/^assets\/[A-Za-z0-9/._-]+$/.test(asset) ||
        asset.split("/").includes("..") ||
        !existsSync(path.join(projectRoot, "public", asset))
      )
        errors.push(`${style.id}: unsafe or missing asset ${asset}`);
    }
    if (
      style.preview.posterFrame >= Math.round(style.preview.detailDuration * 30)
    )
      errors.push(`${style.id}: poster outside sequence`);
    if (style.status === "implemented") continue;
    const record = manifest.styles[style.id];
    if (!recordIsCurrent(style, record, fingerprintFor(style, hash))) {
      errors.push(
        `${style.id}: missing, stale, or modified media; run render:changed and review again`,
      );
      continue;
    }
    for (const kind of ["gallery", "detail", "poster"] as const) {
      try {
        checkOutput(
          path.join(projectRoot, "public", style.preview[kind]),
          kind,
          style,
        );
      } catch (error) {
        errors.push(
          `${style.id}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
    if (
      ["reviewed", "published"].includes(style.status) &&
      (!style.review.visual ||
        !style.review.motion ||
        !style.review.reviewer.trim() ||
        !style.review.notes.trim() ||
        !/^\d{4}-\d{2}-\d{2}$/.test(style.review.date) ||
        !style.variants.every((v) => v.reviewed))
    )
      errors.push(
        `${style.id}: publication requires documented visual, motion, and ratio review`,
      );
  }
  if (errors.length) throw new Error(errors.join("\n"));
  const published = catalog.filter((s) => s.status === "published");
  if (writePublished)
    atomicJson(path.join(projectRoot, "src/catalog/published.json"), published);
  const counts = Object.fromEntries(
    [
      "reference-only",
      "draft",
      "implemented",
      "rendered",
      "reviewed",
      "published",
    ].map((status) => [
      status,
      catalog.filter((s) => s.status === status).length,
    ]),
  );
  const mediaBytes = published.reduce(
    (sum, s) =>
      sum +
      ["gallery", "detail", "poster"].reduce(
        (total, kind) =>
          total +
          statSync(
            path.join(
              projectRoot,
              "public",
              s.preview[kind as "gallery" | "detail" | "poster"],
            ),
          ).size,
        0,
      ),
    0,
  );
  console.log(
    JSON.stringify({
      validated: true,
      total: catalog.length,
      counts,
      publishedMediaMiB: Number((mediaBytes / 1024 / 1024).toFixed(2)),
    }),
  );
  return { catalog, published, counts, mediaBytes };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    validateCatalog();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
