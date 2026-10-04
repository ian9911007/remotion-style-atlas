// Created: 2026-10-04. Reproducible local vendor assets; no CDN or credentials.
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const safeSegment = (value) => value.replace(/[^a-zA-Z0-9._-]/g, "-");
const licenseName =
  /^(?:licen[cs]es?|copying|copyright|notice|third[ _-]?party[ _-]?(?:licen[cs]es?|notices?))(?:[._-].*)?$/i;

async function licenseFiles(
  folder,
  relative = "",
  insideLicenseDirectory = false,
) {
  const files = [];
  const entries = (
    await readdir(path.join(folder, relative), { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name, "en"));
  for (const entry of entries) {
    // Never follow symlinks or copy a dependency's nested node_modules.
    if (entry.isSymbolicLink() || entry.name === "node_modules") continue;
    const selected = insideLicenseDirectory || licenseName.test(entry.name);
    if (!selected) continue;
    const source = path.join(relative, entry.name);
    if (entry.isDirectory())
      files.push(...(await licenseFiles(folder, source, true)));
    else if (entry.isFile()) files.push(source);
  }
  return files;
}

// The explicit destination also permits verification without mutating live assets.
export async function prepareTechnologyAssets(
  outputDir = path.join(root, "public/technology-assets"),
) {
  const verifiedLicenses = JSON.parse(
    await readFile(
      path.join(root, "docs/technology-license-verification.json"),
      "utf8",
    ),
  ).packages;
  for (const dir of ["Workers", "Assets", "Widgets", "ThirdParty"]) {
    await mkdir(path.join(outputDir, "cesium"), { recursive: true });
    await cp(
      path.join(
        root,
        "technology-runtime/node_modules/cesium/Build/Cesium",
        dir,
      ),
      path.join(outputDir, "cesium", dir),
      { recursive: true },
    );
  }
  // This directory contains generated copies only; source packages remain untouched.
  await rm(path.join(outputDir, "licenses"), { recursive: true, force: true });
  await mkdir(path.join(outputDir, "licenses"), { recursive: true });
  const records = new Map();
  for (const prefix of ["", "technology-runtime"]) {
    const pkg = JSON.parse(
      await readFile(path.join(root, prefix, "package.json"), "utf8"),
    );
    for (const name of Object.keys(pkg.dependencies ?? {}).sort()) {
      const folder = path.join(root, prefix, "node_modules", name);
      const installed = JSON.parse(
        await readFile(path.join(folder, "package.json"), "utf8"),
      );
      const key = `${name}@${installed.version}`;
      if (records.has(key)) {
        records.get(key).installedFrom.push(prefix || "app");
        continue;
      }
      const packageDirectory = `${safeSegment(name)}-${hash(name).slice(0, 10)}-${safeSegment(installed.version)}`;
      const files = [];
      const destinations = new Set();
      for (const source of await licenseFiles(folder)) {
        const destination = source.split(path.sep).map(safeSegment).join("/");
        if (destinations.has(destination))
          throw new Error(`License path collision: ${key}/${source}`);
        destinations.add(destination);
        const file = `licenses/${packageDirectory}/${destination}`;
        const contents = await readFile(path.join(folder, source));
        await mkdir(path.dirname(path.join(outputDir, file)), {
          recursive: true,
        });
        await writeFile(path.join(outputDir, file), contents);
        files.push({
          source: source.split(path.sep).join("/"),
          path: file,
          sha256: hash(contents),
        });
      }
      const verified = verifiedLicenses.find(
        (entry) =>
          entry.name === name && entry.installedVersion === installed.version,
      );
      let licenseTextStatus = files.length
        ? "packaged-text-copied"
        : "not-packaged";
      if (!files.length && verified?.licenseEvidence.localSupplementPath) {
        const evidence = verified.licenseEvidence;
        const supplementRoot = path.resolve(
          root,
          "public/technology-assets/license-supplements",
        );
        const source = path.resolve(root, evidence.localSupplementPath);
        if (!source.startsWith(supplementRoot + path.sep))
          throw new Error(`Invalid license supplement path: ${key}`);
        const contents = await readFile(source);
        if (hash(contents) !== evidence.sha256)
          throw new Error(`License supplement checksum mismatch: ${key}`);
        const file = `licenses/${packageDirectory}/LICENSE`;
        await mkdir(path.dirname(path.join(outputDir, file)), {
          recursive: true,
        });
        await writeFile(path.join(outputDir, file), contents);
        files.push({
          source: evidence.localSupplementPath,
          path: file,
          sha256: evidence.sha256,
          provenance: "upstream-original-supplement",
          upstreamUrl: evidence.pinnedRawUrl,
          upstreamCommit: verified.commit,
        });
        licenseTextStatus = "upstream-original-supplement-copied";
      } else if (!files.length && verified) {
        licenseTextStatus = "upstream-link-only";
      }
      records.set(key, {
        name,
        version: installed.version,
        license: installed.license ?? "See upstream license",
        repository: installed.repository,
        installedFrom: [prefix || "app"],
        licenseTextStatus,
        ...(verified && {
          upstreamVerificationStatus: verified.status,
          upstreamLicenseReference:
            verified.licenseEvidence.pinnedRawUrl ??
            verified.licenseEvidence.officialTermsUrl ??
            verified.versionEvidence.browserUrl,
        }),
        licenseFiles: files,
      });
    }
  }
  const notices = [...records.values()].sort(
    (a, b) =>
      a.name.localeCompare(b.name, "en") ||
      a.version.localeCompare(b.version, "en"),
  );
  await writeFile(
    path.join(outputDir, "package-notices.json"),
    JSON.stringify(notices, null, 2) + "\n",
  );
  const missing = notices.filter((item) => !item.licenseFiles.length);
  if (missing.length)
    console.warn(
      `No license text packaged for: ${missing.map((item) => `${item.name}@${item.version}`).join(", ")}. Metadata is not a replacement for license text.`,
    );
  console.log(
    `Prepared Cesium support assets and ${notices.reduce((count, item) => count + item.licenseFiles.length, 0)} original license/notice files for ${notices.length} direct runtime packages.`,
  );
  return notices;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await prepareTechnologyAssets();
}
