/** Created: 2026-10-04. Fingerprints include case metadata, local imports and exact runtime dependencies. */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { CaseDefinition } from "../technology-runtime/src/types";
export const sha256 = (data: Buffer | string) =>
  createHash("sha256").update(data).digest("hex");
export function caseSourceHash(c: CaseDefinition) {
  const visited = new Set<string>(),
    hash = createHash("sha256");
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const src = readFileSync(file, "utf8");
    hash.update(file);
    hash.update(src);
    for (const match of src.matchAll(
      /(?:from\s*|import\s*\(|new\s+URL\s*\()['"](\.\.?\/[^'"]+)['"]/g,
    )) {
      const base = path.resolve(path.dirname(file), match[1]);
      const next = [base, base + ".ts", base + ".tsx"].find((f) =>
        existsSync(f),
      );
      if (next) visit(path.relative(process.cwd(), next));
    }
  }
  hash.update(JSON.stringify(c));
  visit(`technology-runtime/src/${c.module}`);
  hash.update(readFileSync("technology-runtime/package-lock.json"));
  for (const a of c.assets)
    if (existsSync(`public/${a.path}`))
      hash.update(readFileSync(`public/${a.path}`));
  return hash.digest("hex");
}
