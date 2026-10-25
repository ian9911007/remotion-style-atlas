/** Created: 2026-10-16. Explicit generator; standalone deployment uses the checked-in projection. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { sha256 } from "./technology-integrity";
const source =
  "../../.agents/skills/Skill-Web-Visual-Experience-Architect/references/technologies/catalog.json";
if (!existsSync(source))
  throw new Error(
    "Canonical Skill catalog unavailable. Run this generator in the AI Skills workspace; standalone builds use the checked-in projection.",
  );
const raw = readFileSync(source, "utf8"),
  catalog = JSON.parse(raw);
const projection = {
  generatedFrom:
    ".agents/skills/Skill-Web-Visual-Experience-Architect/references/technologies/catalog.json",
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

// Project only the permitted original-demo and link-only discovery metadata.
// The shared motion library remains the authoring authority.
const demoSource =
  "../../Resources/motion-design-library/engine-adapters/original-demo-collection.json";
if (existsSync(demoSource)) {
  const demoRaw = readFileSync(demoSource, "utf8");
  const demos = JSON.parse(demoRaw);
  writeFileSync(
    "src/technology/original-demo-catalog.generated.json",
    JSON.stringify(
      {
        generatedFrom: demoSource.slice(6),
        sourceHash: sha256(demoRaw),
        entries: demos.entries,
      },
      null,
      2,
    ) + "\n",
  );
}

const referenceSource =
  "../../Resources/motion-design-library/provenance/opus-reviewed-catalog.json";
if (existsSync(referenceSource)) {
  const raw = readFileSync(referenceSource, "utf8");
  const source = JSON.parse(raw);
  writeFileSync(
    "src/technology/reference-catalog.generated.json",
    JSON.stringify(
      {
        generatedFrom: referenceSource.slice(6),
        sourceHash: sha256(raw),
        revision: source.revision,
        coverage: source.coverage,
        entries: source.entries,
      },
      null,
      2,
    ) + "\n",
  );
}
