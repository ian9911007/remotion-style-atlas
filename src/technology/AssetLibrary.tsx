/** Created: 2026-10-25. A classified view of the existing library, not another gallery runtime. */
import { useEffect, useRef, useState } from "react";
import collection from "./original-demo-catalog.generated.json";
import { mediaUrl } from "../lib/playback";
export type AssetEntry = {
  id: string;
  title: string;
  category: string;
  use_cases: string[];
  source_kind: string;
  source_url: string;
  source_files: string[];
  engine: string;
  license_status: string;
  acquisition_status: string;
  tested_status: string;
  visual_review: string;
  preview: { poster: string; gallery: string; detail: string } | null;
  case_id?: string;
  prompt_seed?: string;
  slug?: string;
  author?: string;
  mechanism_tags?: string[];
  original_disposition?: string;
  original_traversed?: boolean;
  remake_traversed?: boolean;
  prompt_partial?: boolean;
  audio_reviewed?: boolean;
  every_frame_reviewed?: boolean;
  blockers?: unknown[];
  art_direction?: string;
  input_requirements?: string[];
  avoid_for?: string[];
  known_failure_modes?: string[];
};
export const assetEntries = collection.entries as AssetEntry[];
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
  const [kind, setKind] = useState("original_editable_demo"),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(0),
    [references, setReferences] = useState<AssetEntry[]>([]),
    [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    import("./reference-catalog.generated.json")
      .then(({ default: data }) => {
        if (active) setReferences(data.entries as AssetEntry[]);
      })
      .catch(() => {
        if (active)
          setLoadError(
            "Reference metadata unavailable; original demos remain available.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => setPage(0), [query, kind, category]);
  const referenceUrls = new Set(references.map((e) => e.source_url));
  const all = [
    ...assetEntries.filter(
      (e) =>
        e.source_kind !== "reference_only" || !referenceUrls.has(e.source_url),
    ),
    ...references,
  ];
  const originals = all.filter(
    (e) => e.source_kind === "original_editable_demo",
  ).length;
  const filtered = all.filter(
    (e) =>
      (!kind || e.source_kind === kind) &&
      (!category || e.category === category) &&
      JSON.stringify(e).toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 24));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * 24, (current + 1) * 24);
  return (
    <section className="asset-library" data-reference-count={references.length}>
      <div className="collection-heading">
        <div>
          <span className="eyebrow">ORIGINALS + REVIEWED REFERENCE INDEX</span>
          <h1>Editable asset library</h1>
          <p>
            {originals} local editable demos. Source films, prompt seeds and
            unacquired package candidates remain separate.
          </p>
          <p>
            Supplied research: 703 prompt/media dispositions; 688 original and
            418 remake normal-speed traversals with sparse observations. Fifteen
            originals unavailable. No frame-by-frame, audio or external code
            execution claim.
          </p>
          {loadError && <p role="alert">{loadError}</p>}
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
            {[...new Set(all.map((e) => e.category))].sort().map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <span>
          {filtered.length} matches · {originals} editable demos ·{" "}
          {references.length} reviewed references
        </span>
      </div>
      <nav className="asset-filters" aria-label="Asset library pages">
        <button disabled={current === 0} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {current + 1} of {pages}
        </span>
        <button
          disabled={current === pages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </nav>
      <div className="asset-grid">
        {shown.map((e) => (
          <article
            className="asset-card"
            key={e.id}
            data-asset-id={e.id}
            data-kind={e.source_kind}
          >
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
              <p>
                {e.author && `${e.author} · `}
                {e.slug ?? e.id}
              </p>
              <p>{e.use_cases.join(" · ")}</p>
              <p className="asset-meta">
                {e.engine} · {e.acquisition_status}
              </p>
              <p>{e.license_status}</p>
              <p>
                {e.tested_status} · {e.visual_review}
              </p>
              {e.input_requirements && (
                <details>
                  <summary>Adaptation inputs and boundaries</summary>
                  <p>{e.art_direction}</p>
                  <p>Inputs: {e.input_requirements.join(" · ")}</p>
                  <p>Avoid: {e.avoid_for?.join(" · ")}</p>
                  <p>Failure modes: {e.known_failure_modes?.join(" · ")}</p>
                </details>
              )}
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
              {e.prompt_seed && <pre>{e.prompt_seed}</pre>}
              {e.original_disposition && (
                <details>
                  <summary>Review coverage and limitations</summary>
                  <p>
                    Original: {e.original_disposition}. Traversed:{" "}
                    {String(e.original_traversed)}. Remake traversed:{" "}
                    {String(e.remake_traversed)}. Partial prompt declared:{" "}
                    {String(e.prompt_partial)}. Audio reviewed: false. Every
                    frame reviewed: false.
                  </p>
                </details>
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
