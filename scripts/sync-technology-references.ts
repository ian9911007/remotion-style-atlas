/** Created: 2026-10-04. Explicit generator; standalone deployment uses the checked-in projection. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { sha256 } from "./technology-integrity";
const source =
  "../../.agents/skills/Skill-Web-SVG-Animation-Architect/references/technologies/catalog.json";
if (!existsSync(source))
  throw new Error(
    "Canonical Skill catalog unavailable. Run this generator in the AI Skills workspace; standalone builds use the checked-in projection.",
  );
const raw = readFileSync(source, "utf8"),
  catalog = JSON.parse(raw);
const projection = {
  generatedFrom:
    ".agents/skills/Skill-Web-SVG-Animation-Architect/references/technologies/catalog.json",
  sourceHash: sha256(raw),
  verifiedDate: catalog.verifiedDate,
  technologies: catalog.technologies.map((t: Record<string, unknown>) =>
    Object.fromEntries(
      [
        "id",
        "name",
        "aliases",
        "role",
        "packages",
        "disposition",
        "family",
        "reference",
        "sources",
      ].map((k) => [k, t[k]]),
    ),
  ),
  inventoryResolution: catalog.inventoryResolution,
};
writeFileSync(
  "src/technology/technologies.generated.json",
  JSON.stringify(projection, null, 2) + "\n",
);
console.log(
  `Projected ${projection.technologies.length} canonical technologies; no Skill bodies enter the browser.`,
);
