/** Created: 2026-10-25. A classified view of the existing library, not another gallery runtime. */
import { useEffect, useRef, useState } from "react";
import collection from "./original-demo-catalog.generated.json";
import { mediaUrl } from "../lib/playback";
export const assetEntries = collection.entries;
const kinds = [
  "original_editable_demo",
  "reference_only",
  "prompt_seed",
  "third_party_package_candidate",
];
export function sourceUrl(file: string) {
  return `${import.meta.env.BASE_URL}source/${file.split("/").pop()}.txt`;
}
function AssetPreview({
  title,
  preview,
}: {
  title: string;
  preview: { poster: string; detail: string };
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current!;
    video.src = mediaUrl(preview.detail);
    const pause = () => {
      if (
        document.hidden ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        video.pause();
    };
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) video.pause();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", pause);
    media.addEventListener("change", pause);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pause);
      media.removeEventListener("change", pause);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [preview.detail]);
  return (
    <video
      ref={ref}
      controls
      preload="none"
      playsInline
      poster={mediaUrl(preview.poster)}
      src={mediaUrl(preview.detail)}
      aria-label={`${title} preview`}
    />
  );
}
export function AssetLibrary({ query }: { query: string }) {
  const [kind, setKind] = useState("");
  const [category, setCategory] = useState("");
  const entries = assetEntries.filter(
    (e) =>
      (!kind || e.source_kind === kind) &&
      (!category || e.category === category) &&
      JSON.stringify(e).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="asset-library">
      <div className="collection-heading">
        <div>
          <span className="eyebrow">ORIGINAL MOTION STARTERS</span>
          <h1>Editable asset library</h1>
          <p>
            Three local editable demos. Reference links and package candidates
            are separate, with no acquired third-party files.
          </p>
        </div>
      </div>
      <div className="asset-filters">
        <label>
          Source kind{" "}
          <select
            aria-label="Asset source kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="">All kinds</option>
            {kinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label>
          Category{" "}
          <select
            aria-label="Asset category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {[...new Set(assetEntries.map((e) => e.category))].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <span>{entries.length} entries · 3 editable demos</span>
      </div>
      <div className="asset-grid">
        {entries.map((e) => (
          <article className="asset-card" key={e.id} data-asset-id={e.id}>
            {e.preview ? (
              <AssetPreview title={e.title} preview={e.preview} />
            ) : (
              <div className="link-only-preview">
                LINK ONLY · NO LOCAL SOURCE OR MEDIA
              </div>
            )}
            <div className="asset-card-body">
              <code>{e.source_kind}</code>
              <h2>{e.title}</h2>
              <p>{e.use_cases.join(" · ")}</p>
              <p className="asset-meta">
                {e.engine} · {e.acquisition_status}
              </p>
              <p>{e.license_status}</p>
              <p>
                {e.tested_status} · {e.visual_review}
              </p>
              {e.case_id && (
                <a className="asset-open" href={`#/style/${e.case_id}`}>
                  Open editable demo ↗
                </a>
              )}
              {e.source_files.map((file) => (
                <a
                  className="asset-source"
                  href={sourceUrl(file)}
                  key={file}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source: {file.split("/").pop()}
                </a>
              ))}
              {"prompt_seed" in e && e.prompt_seed && (
                <pre>{e.prompt_seed}</pre>
              )}
              <a href={e.source_url} target="_blank" rel="noreferrer">
                {e.source_kind === "original_editable_demo"
                  ? "General-pattern research link"
                  : "External reference / package link"}{" "}
                ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
