/** Created: 2026-10-05. Pattern/source metadata is independent of engine and artwork. */
import { z } from "zod";
import taxonomy from "./pattern-taxonomy.json";
import type { CaseDefinition } from "../../technology-runtime/src/types";

export const patternTaxonomy = taxonomy;
const member = (entries: { id: string }[]) =>
  z.string().refine((id) => entries.some((entry) => entry.id === id), "Unknown taxonomy ID");
export const patternMetadataSchema = z.object({
  patterns: z.array(member(taxonomy.patterns)).min(1),
  sources: z.array(member(taxonomy.sources)).min(1),
  keywords: z.array(z.string().min(1)),
  performanceNote: z.string().min(1),
}).strict();
export type PatternMetadata = z.infer<typeof patternMetadataSchema>;
export type PatternCaseDefinition = CaseDefinition & { patternLibrary?: PatternMetadata };

// Curated discovery annotations for existing cases, not a migration of their
// runtime metadata or preview fingerprints. No React Bits provenance is inferred.
const annotations: Record<string, PatternMetadata> = {
  "SA-101": { patterns: ["ui-transition"], sources: ["custom-implementation"], keywords: ["disclosure", "展開"], performanceNote: "可變高度可能觸發版面計算；尚未量測。" },
  "SA-103": { patterns: ["title-reveal", "kinetic-typography"], sources: ["custom-implementation"], keywords: ["文字揭示", "seek"], performanceNote: "分段文字增加節點；尚未量測。" },
  "SA-104": { patterns: ["cursor-reactive", "product-spotlight"], sources: ["custom-implementation"], keywords: ["材質掃描", "pointer"], performanceNote: "定位裁切需要檢查重繪與輸入頻率；尚未量測。" },
  "SA-105": { patterns: ["scroll-reveal"], sources: ["custom-implementation"], keywords: ["捲動進度", "scroll"], performanceNote: "原生捲動 API 支援需個別確認；尚未量測。" },
  "SA-109": { patterns: ["title-reveal", "kinetic-typography"], sources: ["custom-implementation"], keywords: ["字體遮罩", "stagger"], performanceNote: "遮罩與分段節點成本依內容密度而變；尚未量測。" },
  "SA-110": { patterns: ["product-spotlight"], sources: ["custom-implementation"], keywords: ["分層組裝", "assembly"], performanceNote: "DOM 分層動畫，非真實 3D；尚未量測。" },
};
export function patternMetadata(c: Pick<PatternCaseDefinition, "id" | "patternLibrary">): PatternMetadata | undefined {
  return c.patternLibrary ?? annotations[c.id];
}
export function patternLabel(id: string) {
  return taxonomy.patterns.find((entry) => entry.id === id)?.label ?? id;
}
export function sourceLabel(id: string) {
  return taxonomy.sources.find((entry) => entry.id === id)?.label ?? id;
}
export function patternSearchTerms(c: CaseDefinition): string[] {
  const metadata = patternMetadata(c);
  return metadata ? [...metadata.patterns.flatMap((id) => [id, patternLabel(id)]), ...metadata.sources.flatMap((id) => [id, sourceLabel(id)]), ...metadata.keywords] : [];
}
