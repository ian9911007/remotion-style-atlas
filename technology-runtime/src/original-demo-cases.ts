/** Created: 2026-10-25. Original cases projected from the shared motion-library catalog. */
import collection from "../../src/technology/original-demo-catalog.generated.json";
import type { CaseDefinition } from "./types";
export const originalDemoCases: CaseDefinition[] = collection.entries
  .filter((e) => e.source_kind === "original_editable_demo")
  .map((e) => ({
    id: e.case_id!,
    title: e.title,
    englishTitle: e.title,
    summary: `Original editable ${e.category} demo. Replace copy, color and timing in the live controls.`,
    primary: "native-svg",
    module:
      Number(e.case_id!.slice(3)) >= 229
        ? "mechanism-motion.ts"
        : "original-motion.ts",
    variant: e.id,
    renderer: "SVG",
    durationSeconds: e.editable_parameters.duration ?? 6,
    capabilities: [e.category, "original_editable_demo", "editable-parameters"],
    interaction: ["time", "data", "keyboard"],
    direction:
      e.art_direction ??
      [
        "Porcelain blue interface",
        "Warm botanical assembly",
        "Quiet green workspace",
      ][["SA-226", "SA-227", "SA-228"].indexOf(e.case_id!)],
    rationale:
      "Original composition with a clear focal object, meaningful state changes and readable holds.",
    why: "Native SVG keeps the small reusable scene editable and directly addressable by time.",
    uses: e.use_cases,
    nonUses: e.avoid_for ?? [
      "Faithful source-work reproduction",
      "Scientific or product claims",
      "Arbitrary text or screenshot sizes without revalidation",
    ],
    instructions:
      "Use the existing time scrubber; apply the editable parameters below the preview. The scene uses the same explicit time for every property.",
    limitations: e.limitations!,
    fallback:
      "Static resolved state under reduced motion; invalid parameters retain the last valid scene.",
    visual: {
      background: e.art_direction ? "#f3f3e9" : "#edf1fa",
      foreground: e.art_direction ? "#213d37" : "#182b34",
      accent: e.editable_parameters.accent!,
      font: e.art_direction
        ? "Arial, PingFang TC, sans-serif"
        : "Arial, sans-serif",
    },
    locked: [
      "One explicit time source",
      "Original procedural geometry; preserve source rights",
      "No silent truncation or shrinking",
    ],
    editable: e.art_direction
      ? [
          "Title (1–48 characters)",
          "Three labels (1–36 characters, measured bounds and reading budget)",
          "Accent; duration 12–20 seconds",
          ...Object.keys(e.extra_parameters ?? {}),
        ]
      : [
          "Title (1–30 characters)",
          "Three labels (1–22 characters; actual glyph bounds checked)",
          "Accent color",
          "Duration (3–12 seconds)",
          "Control width (320–460)",
          "Product case: local PNG/JPEG/WebP screenshot",
        ],
    adaptation: e.art_direction
      ? "Copy mechanism-motion.ts and mechanism-fixtures.ts with the configuration; bind renderMechanism to the target clock. Video engine parity is unverified."
      : "Copy the original module and its small configuration into the target project. Bind sceneSVG to the target clock; video engine parity is unverified.",
    dependencies: [],
    assets: [],
    video: "frame-driven",
    complexity: "low",
  }));
