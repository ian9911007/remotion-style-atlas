import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  renameSync,
  rmSync,
  openSync,
  closeSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import { catalogSchema, type StyleSpec } from "../src/catalog/schema";

export const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const catalogPath = path.join(projectRoot, "src/catalog/styles.json");
export const manifestPath = path.join(
  projectRoot,
  "public/media/render-manifest.json",
);
export const rendererSettings = {
  version: 1,
  codec: "h264",
  pixelFormat: "yuv420p",
  crf: 21,
  x264Preset: "fast",
  frameConcurrency: 2,
  jobConcurrency: 1,
  posterFormat: "jpeg",
  posterQuality: 90,
  fps: 30,
} as const;
export type OutputRecord = { path: string; sha256: string; bytes: number };
export type RenderRecord = {
  fingerprint: string;
  renderedAt: string;
  outputs: Record<"gallery" | "detail" | "poster", OutputRecord>;
};
export type Manifest = {
  schemaVersion: 1;
  styles: Record<string, RenderRecord>;
};
export const readCatalog = () =>
  catalogSchema.parse(JSON.parse(readFileSync(catalogPath, "utf8")));
export const readManifest = (): Manifest =>
  existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : { schemaVersion: 1, styles: {} };
export const atomicJson = (filename: string, data: unknown) => {
  mkdirSync(path.dirname(filename), { recursive: true });
  const temp = `${filename}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(data, null, 2) + "\n");
  renameSync(temp, filename);
};
export const sha256 = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");
export function canonicalStyle(style: StyleSpec): unknown {
  const { status, review, updated, preview, variants, ...authoring } = style;
  const { gallery, detail, poster, fingerprint, ...previewConfig } = preview;
  return {
    ...authoring,
    variants: variants.map(({ reviewed, ...v }) => v),
    preview: previewConfig,
  };
}
function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) =>
      e.isDirectory()
        ? walk(path.join(directory, e.name))
        : e.isFile()
          ? [path.join(directory, e.name)]
          : [],
    );
}
export function renderingCodeHash(root = projectRoot): string {
  const files = [
    ...walk(path.join(root, "src/remotion")),
    ...walk(path.join(root, "public/assets")),
    ...walk(path.join(root, "public/fonts")),
    path.join(root, "src/catalog/schema.ts"),
    path.join(root, "scripts/render.ts"),
    path.join(root, "package-lock.json"),
  ].filter(existsSync);
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(root, file));
    hash.update(readFileSync(file));
  }
  return hash.digest("hex");
}
export const fingerprintFor = (style: StyleSpec, codeHash: string) =>
  sha256(
    JSON.stringify({
      style: canonicalStyle(style),
      codeHash,
      rendererSettings,
    }),
  );
export function recordIsCurrent(
  style: StyleSpec,
  record: RenderRecord | undefined,
  fingerprint: string,
  root = projectRoot,
): boolean {
  return Boolean(
    record &&
    record.fingerprint === fingerprint &&
    style.preview.fingerprint === fingerprint &&
    (["gallery", "detail", "poster"] as const).every((kind) => {
      const output = record.outputs[kind];
      return (
        output?.path === style.preview[kind] &&
        existsSync(path.join(root, "public", output.path)) &&
        sha256(readFileSync(path.join(root, "public", output.path))) ===
          output.sha256
      );
    }),
  );
}
export function chooseStyles(
  catalog: StyleSpec[],
  args: string[],
): StyleSpec[] {
  const options = new Set(["--all", "--changed"]);
  const unknown = args.filter((a) => a.startsWith("-") && !options.has(a));
  if (unknown.length) throw new Error(`Unknown options: ${unknown.join(", ")}`);
  if (args.includes("--all") && args.includes("--changed"))
    throw new Error("Choose --all or --changed.");
  const ids = args.filter((a) => !a.startsWith("-"));
  if (!ids.length && !args.length)
    throw new Error("Supply Style IDs, --changed, or --all.");
  for (const id of ids)
    if (!catalog.some((s) => s.id === id))
      throw new Error(`Unknown style: ${id}`);
  const eligible = catalog.filter(
    (s) => !["draft", "reference-only"].includes(s.status),
  );
  if (ids.some((id) => !eligible.some((s) => s.id === id)))
    throw new Error(
      "Draft/reference-only styles cannot render. Implement them first.",
    );
  return ids.length ? eligible.filter((s) => ids.includes(s.id)) : eligible;
}
export function binary(name: "ffmpeg" | "ffprobe"): string {
  const override = process.env[name.toUpperCase() + "_PATH"];
  if (override) return override;
  const homebrew = `/opt/homebrew/bin/${name}`;
  return existsSync(homebrew) ? homebrew : name;
}
export function probe(filename: string) {
  return JSON.parse(
    execFileSync(
      binary("ffprobe"),
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=codec_name,width,height,r_frame_rate,nb_frames,duration:format=duration",
        "-of",
        "json",
        filename,
      ],
      { encoding: "utf8" },
    ),
  );
}
export function checkOutput(
  filename: string,
  kind: "gallery" | "detail" | "poster",
  style: StyleSpec,
) {
  const data = probe(filename);
  const stream = data.streams?.[0];
  if (!stream) throw new Error(`No image/video stream: ${filename}`);
  const width = kind === "gallery" ? 480 : 1280,
    height = kind === "gallery" ? 270 : 720;
  if (stream.width !== width || stream.height !== height)
    throw new Error(
      `Wrong ${kind} dimensions: ${stream.width}×${stream.height}`,
    );
  if (kind === "poster") {
    if (stream.codec_name !== "mjpeg") throw new Error("Poster must be JPEG.");
    return;
  }
  const [numerator, denominator] = String(stream.r_frame_rate)
    .split("/")
    .map(Number);
  if (stream.codec_name !== "h264" || numerator / denominator !== 30)
    throw new Error(`Wrong ${kind} codec/fps`);
  const expected =
    style.preview[kind === "gallery" ? "galleryDuration" : "detailDuration"];
  const duration = Number(stream.duration ?? data.format?.duration);
  if (Math.abs(duration - expected) > 1 / 30 + 0.001)
    throw new Error(
      `Wrong ${kind} duration: ${duration}, expected ${expected}`,
    );
  if (
    stream.nb_frames &&
    Number(stream.nb_frames) !== Math.round(expected * 30)
  )
    throw new Error(`Wrong ${kind} frame count`);
}
export async function main(args = process.argv.slice(2)) {
  const started = Date.now();
  let catalog = readCatalog();
  const manifest = readManifest();
  const codeHash = renderingCodeHash();
  let styles = chooseStyles(catalog, args);
  if (args.includes("--changed"))
    styles = styles.filter(
      (s) =>
        !recordIsCurrent(s, manifest.styles[s.id], fingerprintFor(s, codeHash)),
    );
  if (!styles.length) {
    console.log(
      "No changed styles; existing media and publication states preserved.",
    );
    return;
  }
  const cache = path.join(projectRoot, ".cache");
  mkdirSync(cache, { recursive: true });
  const lock = path.join(cache, "render.lock");
  let fd: number;
  try {
    fd = openSync(lock, "wx");
    writeFileSync(fd, String(process.pid));
  } catch {
    throw new Error(
      `Another render owns ${lock}. Check that process before removing a stale lock.`,
    );
  }
  const work = path.join(cache, `render-${process.pid}`);
  mkdirSync(work, { recursive: true });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const failed: string[] = [];
  try {
    // Symlinking public assets avoids repeatedly copying existing previews into a throwaway bundle.
    const serveUrl = await bundle({
      entryPoint: path.join(projectRoot, "src/remotion/index.tsx"),
      outDir: path.join(work, "bundle"),
      symlinkPublicDir: true,
      enableCaching: false,
    });
    browser = await openBrowser("chrome", {
      browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE,
      logLevel: "warn",
    });
    for (const style of styles) {
      const fingerprint = fingerprintFor(style, codeHash);
      const stem = `${style.id.toLowerCase()}-${fingerprint.slice(0, 16)}`;
      let success = false;
      for (let attempt = 1; attempt <= 3 && !success; attempt++) {
        const transaction = path.join(work, `${style.id}-${attempt}`);
        mkdirSync(transaction, { recursive: true });
        const outputs = {} as RenderRecord["outputs"];
        try {
          for (const kind of ["gallery", "detail"] as const) {
            const composition = await selectComposition({
              serveUrl,
              id: `${style.id}-${kind}`,
              inputProps: { style },
              puppeteerInstance: browser,
              logLevel: "warn",
            });
            const filename = path.join(transaction, `${stem}-${kind}.mp4`);
            await renderMedia({
              serveUrl,
              composition,
              inputProps: { style },
              outputLocation: filename,
              codec: "h264",
              pixelFormat: "yuv420p",
              crf: rendererSettings.crf,
              x264Preset: rendererSettings.x264Preset,
              concurrency: 2,
              puppeteerInstance: browser,
              logLevel: "warn",
              muted: true,
            });
            checkOutput(filename, kind, style);
            outputs[kind] = {
              path: `media/${path.basename(filename)}`,
              sha256: sha256(readFileSync(filename)),
              bytes: readFileSync(filename).byteLength,
            };
          }
          const detail = await selectComposition({
            serveUrl,
            id: `${style.id}-detail`,
            inputProps: { style },
            puppeteerInstance: browser,
            logLevel: "warn",
          });
          if (style.preview.posterFrame >= detail.durationInFrames)
            throw new Error("Poster frame is outside the detail sequence.");
          const poster = path.join(transaction, `${stem}-poster.jpg`);
          await renderStill({
            serveUrl,
            composition: detail,
            inputProps: { style },
            output: poster,
            frame: style.preview.posterFrame,
            imageFormat: "jpeg",
            jpegQuality: 90,
            puppeteerInstance: browser,
            logLevel: "warn",
          });
          checkOutput(poster, "poster", style);
          outputs.poster = {
            path: `media/${path.basename(poster)}`,
            sha256: sha256(readFileSync(poster)),
            bytes: readFileSync(poster).byteLength,
          };
          const oldRecord = manifest.styles[style.id];
          const previousCatalog = readFileSync(catalogPath, "utf8");
          const previousManifest = existsSync(manifestPath)
            ? readFileSync(manifestPath, "utf8")
            : null;
          const moved: string[] = [];
          const backups = new Map<string, string>();
          try {
            for (const out of Object.values(outputs)) {
              const destination = path.join(projectRoot, "public", out.path);
              mkdirSync(path.dirname(destination), { recursive: true });
              if (existsSync(destination)) {
                const backup = path.join(
                  transaction,
                  path.basename(out.path) + ".previous",
                );
                renameSync(destination, backup);
                backups.set(destination, backup);
              }
              renameSync(
                path.join(transaction, path.basename(out.path)),
                destination,
              );
              moved.push(destination);
            }
            const date = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Taipei",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date());
            catalog = catalog.map((s) =>
              s.id === style.id
                ? {
                    ...s,
                    status: "rendered",
                    updated: date,
                    variants: s.variants.map((v) => ({
                      ...v,
                      reviewed: false,
                    })),
                    review: {
                      visual: false,
                      motion: false,
                      reviewer: "",
                      notes: "",
                      date: "",
                    },
                    preview: {
                      ...s.preview,
                      gallery: outputs.gallery.path,
                      detail: outputs.detail.path,
                      poster: outputs.poster.path,
                      fingerprint,
                    },
                  }
                : s,
            );
            manifest.styles[style.id] = {
              fingerprint,
              renderedAt: new Date().toISOString(),
              outputs,
            };
            atomicJson(manifestPath, manifest);
            atomicJson(catalogPath, catalog);
          } catch (error) {
            writeFileSync(catalogPath, previousCatalog);
            if (previousManifest !== null)
              writeFileSync(manifestPath, previousManifest);
            else rmSync(manifestPath, { force: true });
            for (const file of moved) rmSync(file, { force: true });
            for (const [destination, backup] of backups)
              renameSync(backup, destination);
            catalog = JSON.parse(previousCatalog);
            if (oldRecord) manifest.styles[style.id] = oldRecord;
            else delete manifest.styles[style.id];
            throw error;
          }
          // Old, task-generated previews are removed only after replacement and only when unreferenced.
          const publishedPath = path.join(
            projectRoot,
            "src/catalog/published.json",
          );
          const releaseStyles: StyleSpec[] = existsSync(publishedPath)
            ? JSON.parse(readFileSync(publishedPath, "utf8"))
            : [];
          if (oldRecord)
            for (const out of Object.values(oldRecord.outputs)) {
              if (
                /^media\/sa-\d{3}-[a-f0-9]{16}-(gallery|detail|poster)\.(mp4|jpg)$/.test(
                  out.path,
                ) &&
                !catalog.some((s) =>
                  Object.values(s.preview).includes(out.path),
                ) &&
                !releaseStyles.some((s) =>
                  Object.values(s.preview).includes(out.path),
                )
              )
                rmSync(path.join(projectRoot, "public", out.path), {
                  force: true,
                });
            }
          success = true;
          console.log(
            `${style.id}: rendered 3 verified outputs (${attempt} attempt${attempt === 1 ? "" : "s"}); review required.`,
          );
        } catch (error) {
          console.error(
            `${style.id} attempt ${attempt}/3:`,
            error instanceof Error ? error.message : error,
          );
        } finally {
          rmSync(transaction, { recursive: true, force: true });
        }
      }
      if (!success) failed.push(style.id);
    }
  } finally {
    if (browser) await browser.close({ silent: true });
    closeSync(fd);
    rmSync(lock, { force: true });
    rmSync(work, { recursive: true, force: true });
  }
  console.log(
    JSON.stringify({
      rendered: styles.length - failed.length,
      failed,
      elapsedSeconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      jobConcurrency: 1,
      frameConcurrency: 2,
    }),
  );
  if (failed.length)
    throw new Error(
      `Failed styles: ${failed.join(", ")}; previous media retained, no new publication.`,
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
