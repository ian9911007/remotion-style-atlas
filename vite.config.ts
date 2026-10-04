import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFile, cp, mkdir, readFile } from "node:fs/promises";
import { catalogSchema } from "./src/catalog/schema";
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: "published-media-only",
      async closeBundle() {
        if (command !== "build") return;
        const styles = catalogSchema.parse(
          JSON.parse(await readFile("src/catalog/published.json", "utf8")),
        );
        await mkdir("dist/media", { recursive: true });
        await copyFile("public/favicon.svg", "dist/favicon.svg");
        for (const s of styles) {
          if (s.status !== "published")
            throw new Error(`Private content in build: ${s.id}`);
          for (const key of ["gallery", "detail", "poster"] as const)
            await copyFile(
              `public/${s.preview[key]}`,
              `dist/${s.preview[key]}`,
            );
        }
        const technologyEvidence = JSON.parse(
          await readFile("src/technology/evidence.json", "utf8"),
        );
        for (const entry of Object.values(technologyEvidence) as {
          preview?: { poster: string; gallery: string };
        }[]) {
          if (!entry.preview) continue;
          for (const file of [entry.preview.poster, entry.preview.gallery]) {
            if (!/^media\/[a-z0-9.-]+$/.test(file))
              throw new Error(`Unsafe preview path: ${file}`);
            await copyFile(`public/${file}`, `dist/${file}`);
          }
        }
        await cp("public/technology-assets", "dist/technology-assets", {
          recursive: true,
        });
      },
    },
  ],
  publicDir: command === "build" ? false : "public",
  resolve: { dedupe: ["react", "react-dom", "remotion"] },
  optimizeDeps: { exclude: ["maplibre-gl"] },
  base: process.env.ATLAS_BASE || "./",
  build: { sourcemap: false, manifest: true },
  server: { port: 4173, strictPort: true },
}));
