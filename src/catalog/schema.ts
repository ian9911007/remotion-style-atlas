import { z } from "zod";
export const families = [
  "editorial",
  "luxury",
  "cinematic",
  "performance",
  "industrial",
  "spatial",
  "collage",
  "retro",
  "minimal",
  "data",
  "geometric",
  "documentary",
] as const;
export const familyLabels: Record<string, string> = {
  editorial: "字體與編輯",
  luxury: "精品與時尚",
  cinematic: "電影與片頭",
  performance: "運動與力量",
  industrial: "工業與技術",
  spatial: "空間與介面",
  collage: "拼貼與紙材",
  retro: "復古與廣播",
  minimal: "極簡與產品",
  data: "數據與資訊",
  geometric: "幾何與趣味",
  documentary: "紀實與敘事",
};
export const intensityLabels: Record<string, string> = {
  restrained: "輕柔",
  moderate: "適中",
  energetic: "強烈",
};
export const pacingLabels: Record<string, string> = {
  slow: "舒緩",
  measured: "從容",
  quick: "俐落",
};
export const mediaLabels: Record<string, string> = {
  graphic: "圖形",
  photographic: "攝影",
  mixed: "混合媒材",
};
export const useLabels: Record<string, string> = {
  advertisement: "廣告",
  explainer: "解說",
  product: "產品影片",
  title: "片頭",
  documentary: "紀錄片",
};
const safePath = z.string().regex(/^media\/[A-Za-z0-9._-]+$/);
const words = z.array(z.string().min(1)).min(1);
export const styleSchema = z
  .object({
    id: z.string().regex(/^SA-\d{3}$/),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    englishName: z.string(),
    description: z.string(),
    aliases: z.array(z.string()),
    schemaVersion: z.literal(1),
    version: z.string(),
    family: z.enum(families),
    useCases: z
      .array(
        z.enum([
          "advertisement",
          "explainer",
          "product",
          "title",
          "documentary",
        ]),
      )
      .min(1),
    moods: words,
    tags: words,
    typography: z.object({
      family: z.string(),
      fallback: z.string(),
      rules: words,
    }),
    layout: z.object({ rules: words, safeArea: z.number().min(0.04).max(0.2) }),
    palette: z.object({
      background: z.string(),
      foreground: z.string(),
      accent: z.string(),
      secondary: z.string(),
      rules: words,
    }),
    motion: z.object({
      language: z.string(),
      intensity: z.enum(["restrained", "moderate", "energetic"]),
      pacing: z.enum(["slow", "measured", "quick"]),
      easing: z.string(),
      rules: words,
    }),
    transitions: words,
    rhythm: z.string(),
    media: z.object({
      treatment: z.enum(["graphic", "photographic", "mixed"]),
      rules: words,
      depth: z.string(),
      effects: words,
    }),
    distinctive: words,
    avoid: words,
    assets: z.array(z.string()),
    dependencies: z.array(z.string()),
    limitations: words,
    presentation: z.object({
      typography: words,
      layout: words,
      motion: words,
      media: words,
      limitations: words,
      avoid: words,
    }),
    variants: z
      .array(z.object({ ratio: z.literal("16:9"), reviewed: z.boolean() }))
      .min(1),
    recipe: z.string().regex(/^[a-z][a-z0-9-]+$/),
    preview: z.object({
      gallery: safePath,
      detail: safePath,
      poster: safePath,
      width: z.literal(1280),
      height: z.literal(720),
      galleryWidth: z.literal(480),
      galleryHeight: z.literal(270),
      fps: z.literal(30),
      galleryDuration: z.number().min(3).max(6),
      detailDuration: z.number().min(8).max(12),
      posterFrame: z.number().int().min(0),
      fingerprint: z.string(),
    }),
    provenance: z.object({
      kind: z.literal("original"),
      creator: z.string(),
      notes: z.string(),
      references: z.array(
        z.object({ title: z.string(), url: z.string().url() }),
      ),
    }),
    status: z.enum([
      "reference-only",
      "draft",
      "implemented",
      "rendered",
      "reviewed",
      "published",
    ]),
    review: z.object({
      visual: z.boolean(),
      motion: z.boolean(),
      reviewer: z.string(),
      notes: z.string(),
      date: z.string(),
    }),
    created: z.string(),
    updated: z.string(),
  })
  .strict();
export type StyleSpec = z.infer<typeof styleSchema>;
export const catalogSchema = z.array(styleSchema).superRefine((styles, ctx) => {
  for (const key of ["id", "slug", "recipe"] as const) {
    const seen = new Set<string>();
    for (const s of styles) {
      if (seen.has(s[key]))
        ctx.addIssue({
          code: "custom",
          message: `Duplicate ${key}: ${s[key]}`,
        });
      seen.add(s[key]);
    }
  }
  for (const s of styles) {
    if (
      s.status === "published" &&
      (!s.review.visual ||
        !s.review.motion ||
        !s.variants.every((v) => v.reviewed) ||
        !s.preview.fingerprint)
    )
      ctx.addIssue({
        code: "custom",
        message: `Unreviewed publication ${s.id}`,
      });
  }
});
