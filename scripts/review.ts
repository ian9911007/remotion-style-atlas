import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import {
  atomicJson,
  binary,
  catalogPath,
  fingerprintFor,
  projectRoot,
  readCatalog,
  readManifest,
  recordIsCurrent,
  renderingCodeHash,
} from "./render";
import { validateCatalog } from "./validate";
const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
function option(args: string[], key: string) {
  const i = args.indexOf(key);
  if (i < 0) return "";
  if (!args[i + 1] || args[i + 1].startsWith("--"))
    throw new Error(`Missing ${key} value`);
  return args[i + 1];
}
export async function main(args = process.argv.slice(2)) {
  const flags = new Set([
    "--publish",
    "--record",
    "--visual-reviewed",
    "--motion-reviewed",
    "--all",
  ]);
  const valued = new Set(["--reviewer", "--notes"]);
  const ids: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (valued.has(args[i])) {
      i++;
      continue;
    }
    if (args[i].startsWith("--")) {
      if (!flags.has(args[i])) throw new Error(`Unknown option ${args[i]}`);
    } else ids.push(args[i]);
  }
  let catalog = readCatalog();
  const manifest = readManifest();
  for (const id of ids)
    if (!catalog.some((s) => s.id === id))
      throw new Error(`Unknown style ${id}`);
  const selected = catalog.filter(
    (s) =>
      (ids.length ? ids.includes(s.id) : args.includes("--all")) &&
      ["rendered", "reviewed", "published"].includes(s.status),
  );
  if (!selected.length) throw new Error("Supply rendered Style IDs or --all.");
  if (selected.length !== ids.length && ids.length)
    throw new Error("Every selected style must have rendered media.");
  for (const style of selected)
    if (
      !recordIsCurrent(
        style,
        manifest.styles[style.id],
        fingerprintFor(style, renderingCodeHash(projectRoot, style.recipe)),
      )
    )
      throw new Error(
        `${style.id}: media is stale, missing, or modified. Render before review.`,
      );
  if (args.includes("--record")) {
    const reviewer = option(args, "--reviewer"),
      notes = option(args, "--notes");
    if (
      !args.includes("--visual-reviewed") ||
      !args.includes("--motion-reviewed") ||
      !reviewer.trim() ||
      !notes.trim()
    )
      throw new Error(
        "Record requires explicit --visual-reviewed --motion-reviewed --reviewer and --notes after inspecting images AND watching loops.",
      );
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    catalog = catalog.map((s) =>
      selected.some((p) => p.id === s.id)
        ? {
            ...s,
            status: "reviewed",
            review: { visual: true, motion: true, reviewer, notes, date },
            variants: s.variants.map((v) => ({ ...v, reviewed: true })),
            updated: date,
          }
        : s,
    );
    atomicJson(catalogPath, catalog);
    console.log(
      `Recorded explicit human/agent review for ${selected.length} styles. No automatic visual judgement was made.`,
    );
  }
  if (args.includes("--publish")) {
    const target = catalog.filter((s) => selected.some((p) => p.id === s.id));
    for (const style of target)
      if (
        !["reviewed", "published"].includes(style.status) ||
        !style.review.visual ||
        !style.review.motion ||
        !style.review.reviewer ||
        !style.review.notes ||
        !style.variants.every((v) => v.reviewed)
      )
        throw new Error(
          `${style.id}: recorded visual AND motion review required before publication.`,
        );
    validateCatalog({ writePublished: false });
    catalog = catalog.map((s) =>
      target.some((t) => t.id === s.id) ? { ...s, status: "published" } : s,
    );
    atomicJson(catalogPath, catalog);
    validateCatalog();
    console.log(
      `Locally published ${target.length} validated styles. External deployment was not performed.`,
    );
    return;
  }
  if (args.includes("--record")) return;
  const directory = path.join(projectRoot, ".cache/review");
  mkdirSync(directory, { recursive: true });
  const temporary = path.join(directory, `frames-${process.pid}`);
  mkdirSync(temporary, { recursive: true });
  try {
    const tileWidth = 240,
      tileHeight = 135,
      rowHeight = 178,
      columns = 6;
    for (let start = 0; start < selected.length; start += 12) {
      const batch = selected.slice(start, start + 12);
      const overlays: sharp.OverlayOptions[] = [];
      for (let row = 0; row < batch.length; row++) {
        const style = batch[row];
        const frameCount = Math.round(style.preview.detailDuration * 30);
        const frames = [
          0,
          Math.round(frameCount * 0.15),
          Math.floor(frameCount * 0.5),
          Math.round(frameCount * 0.85),
          frameCount - 1,
        ];
        const files = [path.join(projectRoot, "public", style.preview.poster)];
        for (const frame of frames) {
          const output = path.join(temporary, `${style.id}-${frame}.jpg`);
          execFileSync(binary("ffmpeg"), [
            "-v",
            "error",
            "-i",
            path.join(projectRoot, "public", style.preview.detail),
            "-vf",
            `select=eq(n\\,${frame})`,
            "-frames:v",
            "1",
            "-y",
            output,
          ]);
          files.push(output);
        }
        for (let column = 0; column < columns; column++) {
          const input = await sharp(files[column])
            .resize(tileWidth, tileHeight)
            .jpeg({ quality: 90 })
            .toBuffer();
          overlays.push({
            input,
            left: column * tileWidth,
            top: row * rowHeight + 28,
          });
        }
        const text = `${style.id} · ${style.englishName} | poster · first · early · middle · late · last`;
        overlays.push({
          input: Buffer.from(
            `<svg width="${tileWidth * columns}" height="28"><rect width="100%" height="100%" fill="#17191e"/><text x="8" y="20" fill="#ededed" font-family="sans-serif" font-size="14">${xml(text)}</text></svg>`,
          ),
          left: 0,
          top: row * rowHeight,
        });
      }
      const filename = path.join(
        directory,
        `contact-${String(start / 12 + 1).padStart(2, "0")}.jpg`,
      );
      await sharp({
        create: {
          width: tileWidth * columns,
          height: rowHeight * batch.length,
          channels: 3,
          background: "#111318",
        },
      })
        .composite(overlays)
        .jpeg({ quality: 92 })
        .toFile(filename);
      console.log(filename);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  console.log(
    "Contact sheets are inspection aids, not motion approval. Watch detail AND gallery loops, including the end-to-start boundary, before recording review.",
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
