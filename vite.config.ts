import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFile, cp, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { catalogSchema } from "./src/catalog/schema";
export default defineConfig(({ command }) => {
  let outputDirectory = path.resolve("dist");
  return {
    plugins: [
      react(),
      {
        name: "published-media-only",
        configResolved(config) {
          outputDirectory = path.resolve(config.root, config.build.outDir);
        },
        async closeBundle() {
          if (command !== "build") return;
          const styles = catalogSchema.parse(
            JSON.parse(await readFile("src/catalog/published.json", "utf8")),
          );
          await mkdir(path.join(outputDirectory, "media"), { recursive: true });
          await copyFile(
            "public/favicon.svg",
            path.join(outputDirectory, "favicon.svg"),
          );
          for (const s of styles) {
            if (s.status !== "published")
              throw new Error(`Private content in build: ${s.id}`);
            for (const key of ["gallery", "detail", "poster"] as const)
              await copyFile(
                `public/${s.preview[key]}`,
                path.join(outputDirectory, s.preview[key]),
              );
          }
          const technologyEvidence = JSON.parse(
            await readFile("src/technology/evidence.json", "utf8"),
          );
          for (const entry of Object.values(technologyEvidence) as {
            preview?: { poster: string; gallery: string; detail?: string };
          }[]) {
            if (!entry.preview) continue;
            for (const file of [
              entry.preview.poster,
              entry.preview.gallery,
              entry.preview.detail,
            ]) {
              if (!file) continue;
              if (!/^media\/[a-z0-9.-]+$/.test(file))
                throw new Error(`Unsafe preview path: ${file}`);
              await copyFile(`public/${file}`, path.join(outputDirectory, file));
            }
          }
          await cp(
            "public/technology-assets",
            path.join(outputDirectory, "technology-assets"),
            { recursive: true },
          );
        },
      },
    ],
    publicDir: command === "build" ? false : "public",
    resolve: { dedupe: ["react", "react-dom", "remotion"] },
    optimizeDeps: { exclude: ["maplibre-gl"] },
    base: process.env.ATLAS_BASE || "./",
    build: { sourcemap: false, manifest: true },
    server: { port: 4173, strictPort: true },
  };
});
