# Original editable motion starters

Created: 2026-10-25

Use the existing Atlas and open **Editable library**, or direct routes `#/style/SA-226`, `#/style/SA-227`, `#/style/SA-228`. Global search applies to library metadata; source-kind/category filters distinguish the three original demos from link-only references, a prompt seed and unacquired third-party packages. Nothing is downloaded or purchased from Skillry.

The shared authority is `Resources/motion-design-library/engine-adapters/original-demo-collection.json`. Original executable source is `technology-runtime/src/original-motion.ts`; case projection is `original-demo-cases.ts`. Source links return those actual files in development and exact build-emitted copies in production. Use the exported `sceneSVG(id, config, time, reducedMotion)` function; `validateConfig` rejects unsupported values. Copy the small module/config and replace its host-specific mount if using a different host. There is no extra package environment.

Each scene supports title, three labels, accent and duration; the UI morph also visibly supports control width. Product reveal accepts a local PNG/JPEG/WebP screenshot (max 5 MB in the editor), decoded before applying and contained within the original UI surface. No upload or external request occurs. Uploaded screenshots remain flattened: label controls edit the synthetic UI, not pixels baked into a supplied screenshot. The image is contained rather than cropped. The preview cycle remains six seconds; configured duration changes scene timing and may require a delivery-cycle adjustment in a target project. The artwork is original procedural SVG and synthetic UI, not source-film reconstruction, scientific evidence or an actual product claim.

Native SVG is verified only after the checks below execute. Remotion, HyperFrames, audio, physical mobile and cross-GPU equivalence remain unverified. Default six-second scenes return to their starting composition; timing changes need a new cycle/readability review. Fixed 16:9 artwork scales at narrow viewport; it does not claim a purpose-designed portrait layout. Overflow is rejected rather than silently shrunk.

## Verification

Chrome 156.0.8078.48 on Mac Studio: six original scene/viewport runs (1280x900 and 390x844), independent parameter changes/reset, overflow rejection/recovery, local screenshot replacement, text bounds, repeat/nonsequential seeks, default loop closure, live reduced motion, library kind/search filters, exact source links and parameter form passed. Actual detail videos decoded at 1280x720 and advanced multiple browser frames. This is bounded playback evidence, not complete attended viewing.

Producer inspected desktop and narrow SVG samples: focal objects and primary labels remain within the composition; the assembly rail preserves ordered steps, and the product panel uses its own synthetic UI. Small secondary text becomes miniature on narrow screens; these are scaled 16:9 previews, not portrait production artwork. No aesthetic/client approval is inferred.

Actual preview files live in `public/media/sa-226-technology*`, `sa-227-technology*`, `sa-228-technology*`: each has a 480x270 gallery MP4, a 1280x720 detail MP4 and a 1280x720 JPEG poster. Silent 6-second / 180-frame / 30fps H.264; source fingerprints and SHA-256 receipts remain in the existing `src/technology/evidence.json`. No source-reference footage was acquired.

Use from the authoritative workspace:

```sh
./scripts/package-runtime pm tools/remotion-style-atlas exec node --import tsx tests/original-demos.ts --previews
./scripts/package-runtime pm tools/remotion-style-atlas exec node --import tsx --test tests/original-demo-integrity.ts
./scripts/package-runtime pm tools/remotion-style-atlas exec node --import tsx scripts/capture-technology.ts SA-226 SA-227 SA-228 --previews
```

Browser checks need the running existing Atlas server (`start.command` or its governed Vite command). Integrity checks compare actual media and source with existing receipts and built source downloads. The existing metadata sync generator projects the shared collection into a checked-in Atlas JSON file, retaining standalone builds without the shared workspace at runtime.

No new packages or runtime upgrade. Existing build warnings about license-text packaging, large/lazy engine chunks and third-party annotations remain separate from these original demos. No public website deployment, external package installation, native video-engine conversion, sound/listening, physical mobile or cross-GPU validation is claimed.
