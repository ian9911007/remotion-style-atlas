import { riveCases } from "../../technology-runtime/src/rive-cases";
import { supplementCases } from "../../technology-runtime/src/supplement-cases";
import { worldMapCases } from "../../technology-runtime/src/world-map-cases";
import { mapRevealCases } from "../../technology-runtime/src/map-reveal-cases";
import { videoAssetCases } from "../../technology-runtime/src/video-asset-cases";
import { dataMapCases } from "../../technology-runtime/src/data-map-cases";
import { gpuSceneCases } from "../../technology-runtime/src/gpu-scene-cases";
import type { StyleSpec } from "../catalog/schema";
import type { CaseDefinition } from "../../technology-runtime/src/types";
import { domCases } from "../../technology-runtime/src/dom-cases";
import technologies from "./technologies.generated.json";
import evidenceData from "./evidence.json";
export type Evidence = {
  status: "ready" | "partial" | "blocked" | "unverified";
  sourceHash?: string;
  runtime?: string[];
  visual?: string;
  preview?: {
    poster: string;
    gallery: string;
    sha256?: Record<string, string>;
  };
  performance?: {
    status: "measured" | "estimated" | "unverified";
    context: string;
    metrics?: Record<string, number>;
  };
  video?: string;
  notes?: string[];
  date?: string;
};
export const evidence = evidenceData as Record<string, Evidence>;
export const technologyCatalog = technologies.technologies;
export const technologyCases: CaseDefinition[] = [
  ...domCases,
  ...gpuSceneCases,
  ...dataMapCases,
  ...videoAssetCases,
  ...riveCases,
  ...supplementCases,
  ...worldMapCases,
  ...mapRevealCases,
];
export const caseById = new Map(technologyCases.map((c) => [c.id, c]));
export function caseEvidence(id: string): Evidence {
  return evidence[id] ?? { status: "unverified" };
}
export function technologyName(id: string) {
  return technologyCatalog.find((t) => t.id === id)?.name ?? id;
}
export function projectCase(c: CaseDefinition): StyleSpec {
  const e = caseEvidence(c.id),
    v = c.visual;
  return {
    id: c.id,
    slug: c.englishTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: c.title,
    englishName: c.englishTitle,
    description: c.summary,
    aliases: [
      c.direction,
      c.renderer,
      ...c.capabilities,
      ...c.interaction,
      ...[c.primary, ...(c.supporting ?? []).map((t) => t.id)].flatMap((id) => {
        const t = technologyCatalog.find((t) => t.id === id);
        return t ? [t.name, ...t.aliases] : [id];
      }),
    ],
    schemaVersion: 1,
    version: "1.0.0",
    family: "spatial",
    useCases: ["explainer"],
    moods: [c.direction],
    tags: c.capabilities,
    typography: { family: v.font, fallback: "system-ui", rules: [] },
    layout: { rules: [], safeArea: 0.04 },
    palette: {
      background: v.background,
      foreground: v.foreground,
      accent: v.accent,
      secondary: v.foreground,
      rules: [],
    },
    motion: {
      language: c.capabilities.join(", "),
      intensity: "moderate",
      pacing: "measured",
      easing: "Case-owned timing",
      rules: c.locked,
    },
    transitions: [],
    rhythm: c.instructions,
    media: {
      treatment: "graphic",
      rules: [],
      depth: c.renderer,
      effects: c.capabilities,
    },
    distinctive: c.locked,
    avoid: c.nonUses,
    assets: c.assets.map((a) => a.path),
    dependencies: c.dependencies,
    limitations: c.limitations,
    presentation: {
      typography: [],
      layout: [c.rationale],
      motion: [c.instructions],
      media: [c.renderer],
      limitations: c.limitations,
      avoid: c.nonUses,
    },
    variants: [{ ratio: "16:9", reviewed: !!e.visual }],
    recipe: c.variant,
    preview: {
      gallery:
        e.preview?.gallery ?? `media/${c.id.toLowerCase()}-technology.mp4`,
      detail:
        e.preview?.gallery ?? `media/${c.id.toLowerCase()}-technology.mp4`,
      poster: e.preview?.poster ?? `media/${c.id.toLowerCase()}-technology.jpg`,
      // Legacy StyleSpec uses a fixed 1280x720 display coordinate contract.
      // Actual new preview pixels are 480x270; the live root is 960x540.
      width: 1280,
      height: 720,
      galleryWidth: 480,
      galleryHeight: 270,
      fps: 30,
      galleryDuration: c.durationSeconds ?? 4,
      detailDuration: c.durationSeconds ?? 4,
      posterFrame: Math.round((c.durationSeconds ?? 4) * 0.3 * 30),
      fingerprint: e.sourceHash ?? "",
    },
    provenance: {
      kind: "original",
      creator: "Atlas technology cases",
      notes: c.assets.map((a) => a.attribution).join("; "),
      references: technologyCatalog
        .filter((t) =>
          [c.primary, ...(c.supporting ?? []).map((s) => s.id)].includes(t.id),
        )
        .flatMap((t) =>
          t.sources.slice(0, 1).map((url) => ({ title: t.name, url })),
        ),
    },
    status: e.status === "ready" ? "published" : "implemented",
    review: {
      visual: !!e.visual,
      motion: !!e.visual,
      reviewer: e.visual ?? "",
      notes: e.notes?.join(" ") ?? "Runtime and visual evidence pending.",
      date: e.date ?? "",
    },
    created: technologies.verifiedDate,
    updated: e.date ?? technologies.verifiedDate,
  };
}
