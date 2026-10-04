/** Created: 2026-10-05. Validate additive cases without migrating the legacy schema. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { z } from "zod";
import {
  technologyCases,
  technologyCatalog,
  evidence,
} from "../src/technology/registry";
import { caseSourceHash, sha256 } from "./technology-integrity";
import { patternMetadata, patternMetadataSchema, patternTaxonomy } from "../src/technology/pattern-library";
const words = z.array(z.string().min(1)).min(1),
  definition = z
    .object({
      id: z.string().regex(/^SA-\d{3}$/),
      patternLibrary: patternMetadataSchema.optional(),
      title: z.string().min(1),
      englishTitle: z.string().min(1),
      summary: z.string().min(1),
      primary: z.string(),
      supporting: z
        .array(z.object({ id: z.string(), role: z.string().min(1) }))
        .optional(),
      capabilities: words,
      module: z.string().regex(/^[a-z0-9-]+\.tsx?$/),
      variant: z.string().min(1),
      renderer: z.string().min(1),
      interaction: words,
      direction: z.string().min(1),
      rationale: z.string().min(1),
      why: z.string().min(1),
      uses: words,
      nonUses: words,
      instructions: z.string().min(1),
      limitations: words,
      fallback: z.string().min(1),
      visual: z.object({
        background: z.string(),
        foreground: z.string(),
        accent: z.string(),
        font: z.string(),
      }),
      locked: words,
      editable: words,
      adaptation: z.string().min(1),
      dependencies: z.array(z.string()),
      assets: z.array(
        z.object({
          path: z.string(),
          source: z.string().min(1),
          license: z.string().min(1),
          attribution: z.string().min(1),
        }),
      ),
      video: z.enum([
        "frame-driven",
        "adapter-required",
        "recorded-live",
        "unsupported",
        "unverified",
      ]),
      complexity: z.enum(["low", "medium", "high"]),
      comparison: z.string().optional(),
      durationSeconds: z.number().min(1).max(20).optional(),
    })
    .strict();
const baseline = JSON.parse(
  readFileSync("src/catalog/styles.json", "utf8"),
) as { id: string }[];
const ids = new Set(baseline.map((c) => c.id)),
  techIds = new Set(technologyCatalog.map((t) => t.id));
const packages = JSON.parse(
  readFileSync("technology-runtime/package.json", "utf8"),
).dependencies;
const errors: string[] = [],
  warnings: string[] = [];
for (const entries of [patternTaxonomy.patterns, patternTaxonomy.sources]) {
  if (new Set(entries.map((item) => item.id)).size !== entries.length)
    errors.push("Duplicate pattern/source taxonomy ID");
}
for (const t of technologyCatalog) {
  if (!t.sources.length || t.sources.some((s) => !s.startsWith("https://")))
    errors.push(`${t.id}: invalid official source`);
  if (!["new", "conditional", "legacy", "unverified"].includes(t.disposition))
    errors.push(`${t.id}: missing disposition`);
}
for (const c of technologyCases) {
  const pattern = patternMetadata(c);
  if (pattern && !patternMetadataSchema.safeParse(pattern).success)
    errors.push(`${c.id}: invalid pattern/source metadata`);
  const result = definition.safeParse(c);
  if (!result.success) {
    errors.push(`${c.id}: ${result.error}`);
    continue;
  }
  if (ids.has(c.id)) errors.push(`Duplicate ID ${c.id}`);
  ids.add(c.id);
  for (const id of [c.primary, ...(c.supporting ?? []).map((t) => t.id)])
    if (!techIds.has(id)) errors.push(`${c.id}: unknown technology ${id}`);
  if (!existsSync(`technology-runtime/src/${c.module}`))
    errors.push(`${c.id}: source missing`);
  for (const dep of c.dependencies)
    if (!packages[dep]) errors.push(`${c.id}: undeclared dependency ${dep}`);
  for (const a of c.assets)
    if (a.path.includes("..") || !existsSync(`public/${a.path}`))
      errors.push(`${c.id}: missing/unsafe asset ${a.path}`);
  const e = evidence[c.id];
  const physicalStudy = /^SA-(19[6-9]|2(?:0\d|1\d|2[0-5]))$/.test(c.id);
  if (physicalStudy) {
    const media = {
      poster:
        e?.preview?.poster ?? `media/${c.id.toLowerCase()}-technology.jpg`,
      gallery:
        e?.preview?.gallery ?? `media/${c.id.toLowerCase()}-technology.mp4`,
      detail:
        e?.preview?.detail ??
        `media/${c.id.toLowerCase()}-technology-detail.mp4`,
    };
    for (const [kind, file] of Object.entries(media)) {
      if (!/^media\/[a-z0-9.-]+$/.test(file) || !existsSync(`public/${file}`))
        errors.push(`${c.id}: missing ${kind} media ${file}`);
    }
    if (existsSync(`public/${media.poster}`)) {
      const posterPath = `public/${media.poster}`;
      const metadata = await sharp(posterPath).metadata();
      if (metadata.width !== 1280 || metadata.height !== 720)
        errors.push(`${c.id}: poster must be 1280x720`);
      const stats = await sharp(posterPath)
        .resize(64, 36, { fit: "fill" })
        .stats();
      const rgb = stats.channels.slice(0, 3);
      const mean = rgb.reduce((sum, channel) => sum + channel.mean, 0) / 3;
      const deviation =
        rgb.reduce((sum, channel) => sum + channel.stdev, 0) / 3;
      if (mean < 2 || deviation < 2)
        errors.push(
          `${c.id}: poster is visually blank/black (mean=${mean.toFixed(2)}, deviation=${deviation.toFixed(2)})`,
        );
    }
    for (const [kind, dimensions] of [
      ["gallery", [480, 270]],
      ["detail", [1280, 720]],
    ] as const) {
      const file = media[kind];
      if (!existsSync(`public/${file}`)) continue;
      try {
        const metadata = JSON.parse(
          execFileSync(
            process.env.FFPROBE_PATH ?? "ffprobe",
            [
              "-v",
              "error",
              "-select_streams",
              "v:0",
              "-show_entries",
              "stream=width,height,codec_name,r_frame_rate:format=duration",
              "-of",
              "json",
              `public/${file}`,
            ],
            { encoding: "utf8" },
          ),
        );
        const stream = metadata.streams[0];
        if (
          stream?.width !== dimensions[0] ||
          stream?.height !== dimensions[1] ||
          stream?.codec_name !== "h264" ||
          stream?.r_frame_rate !== "30/1" ||
          Math.abs(
            Number(metadata.format.duration) - (c.durationSeconds ?? 4),
          ) > 0.15
        )
          errors.push(`${c.id}: invalid ${kind} video (${file})`);
      } catch (error) {
        errors.push(
          `${c.id}: unreadable ${kind} video ${file}: ${String(error)}`,
        );
      }
    }
  }
  if (!e || e.status !== "ready") {
    warnings.push(`${c.id}: ${e?.status ?? "unverified"}`);
    continue;
  }
  if (e.sourceHash !== caseSourceHash(c))
    errors.push(`${c.id}: stale runtime evidence`);
  if (!e.runtime?.length || !e.visual || !e.date)
    errors.push(`${c.id}: readiness lacks runtime/visual/date evidence`);
  for (const kind of ["poster", "gallery", "detail"] as const) {
    const file = e.preview?.[kind];
    if (
      !file ||
      !/^media\/[a-z0-9.-]+$/.test(file) ||
      !existsSync(`public/${file}`)
    ) {
      errors.push(`${c.id}: missing ${kind}`);
      continue;
    }
    if (e.preview?.sha256?.[kind] !== sha256(readFileSync(`public/${file}`)))
      errors.push(`${c.id}: altered ${kind}`);
    if (kind === "poster") {
      const meta = JSON.parse(
        execFileSync(
          process.env.FFPROBE_PATH ?? "ffprobe",
          [
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "json",
            `public/${file}`,
          ],
          { encoding: "utf8" },
        ),
      );
      if (meta.streams[0]?.width !== 1280 || meta.streams[0]?.height !== 720)
        errors.push(`${c.id}: incorrect poster dimensions`);
    }
  }
  if (e.preview?.gallery && existsSync(`public/${e.preview.gallery}`)) {
    const meta = JSON.parse(
      execFileSync(
        process.env.FFPROBE_PATH ?? "ffprobe",
        [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-show_entries",
          "stream=width,height,codec_name,r_frame_rate:format=duration",
          "-of",
          "json",
          `public/${e.preview.gallery}`,
        ],
        { encoding: "utf8" },
      ),
    );
    const stream = meta.streams[0];
    if (
      stream.width !== 480 ||
      stream.height !== 270 ||
      stream.codec_name !== "h264" ||
      stream.r_frame_rate !== "30/1" ||
      Math.abs(Number(meta.format.duration) - (c.durationSeconds ?? 4)) > 0.15
    )
      errors.push(`${c.id}: incorrect preview encoding`);
  }
  if (e.preview?.detail && existsSync(`public/${e.preview.detail}`)) {
    const meta = JSON.parse(
      execFileSync(
        process.env.FFPROBE_PATH ?? "ffprobe",
        [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-show_entries",
          "stream=width,height,codec_name,r_frame_rate:format=duration",
          "-of",
          "json",
          `public/${e.preview.detail}`,
        ],
        { encoding: "utf8" },
      ),
    );
    const stream = meta.streams[0];
    if (
      stream.width !== 1280 ||
      stream.height !== 720 ||
      stream.codec_name !== "h264" ||
      stream.r_frame_rate !== "30/1"
    )
      errors.push(`${c.id}: incorrect detail preview encoding`);
  }
}
const projection = JSON.parse(
  readFileSync("src/technology/technologies.generated.json", "utf8"),
);
const canonical =
  "../../.agents/skills/Skill-Web-SVG-Animation-Architect/references/technologies/catalog.json";
if (
  existsSync(canonical) &&
  projection.sourceHash !== sha256(readFileSync(canonical))
)
  errors.push("Stale technology projection; run sync:technology");
const statuses = ["ready", "partial", "blocked", "unverified"];
const counts = Object.fromEntries(
  statuses.map((s) => [
    s,
    technologyCases.filter(
      (c) => (evidence[c.id]?.status ?? "unverified") === s,
    ).length,
  ]),
);
const matrix = technologyCatalog.map((t) => ({
  technology: t.id,
  name: t.name,
  role: t.role,
  disposition: t.disposition,
  referenceStatus: "official-sources-reviewed",
  reference: t.reference,
  primary: technologyCases.filter((c) => c.primary === t.id).map((c) => c.id),
  supporting: technologyCases
    .filter((c) => c.supporting?.some((s) => s.id === t.id))
    .map((c) => c.id),
  capabilities: [
    ...new Set(
      technologyCases
        .filter(
          (c) => c.primary === t.id || c.supporting?.some((s) => s.id === t.id),
        )
        .flatMap((c) => c.capabilities),
    ),
  ],
  cases: technologyCases
    .filter(
      (c) => c.primary === t.id || c.supporting?.some((s) => s.id === t.id),
    )
    .map((c) => ({
      id: c.id,
      status: evidence[c.id]?.status ?? "unverified",
      preview: !!evidence[c.id]?.preview,
      runtime: evidence[c.id]?.runtime ?? [],
      limitations: c.limitations,
    })),
  limitations:
    t.id === "popmotion"
      ? [
          "Legacy reference: not installed as a competing contemporary Motion stack.",
        ]
      : [],
}));
const coverage = {
  generated: true,
  authority:
    "Derived from case registry, canonical technology projection and evidence.json; do not edit.",
  baseline: baseline.length,
  added: technologyCases.length,
  total: ids.size,
  counts,
  matrix,
};
if (process.argv.includes("--write-coverage")) {
  writeFileSync(
    "docs/technology-coverage.json",
    JSON.stringify(coverage, null, 2) + "\n",
  );
  writeFileSync(
    "docs/technology-coverage.md",
    `# Technology capability coverage\n\nCreated: ${projection.verifiedDate}\n\nGenerated by validate-technology.ts from canonical technology identities, case definitions and actual evidence. Do not edit this projection.\n\nBaseline ${baseline.length}; added ${technologyCases.length}; total ${ids.size}. States: ${JSON.stringify(counts)}.\n\n| Technology | Role | Disposition | Primary cases | Supporting cases |\n| --- | --- | --- | --- | --- |\n${matrix.map((t) => `| ${t.name} | ${t.role} | ${t.disposition} | ${t.primary.join(", ") || "—"} | ${t.supporting.join(", ") || "—"} |`).join("\n")}\n\nExact preview/runtime evidence and limitations are in technology-coverage.json. Documentation verification does not prove execution. Popmotion remains a legacy reference; aliases do not create cases.\n`,
  );
}
console.log(
  JSON.stringify({
    baseline: baseline.length,
    added: technologyCases.length,
    total: ids.size,
    counts,
    errors,
    warnings,
  }),
);
if (errors.length) process.exitCode = 1;
