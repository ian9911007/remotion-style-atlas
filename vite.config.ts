import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFile, mkdir, readFile } from "node:fs/promises";
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
      },
    },
  ],
  publicDir: command === "build" ? false : "public",
  base: process.env.ATLAS_BASE || "./",
  build: { sourcemap: false },
  server: { port: 4173, strictPort: true },
}));
