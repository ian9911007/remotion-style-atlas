import { caseById, caseEvidence, technologyName } from "../technology/registry";
import { RuntimeView } from "../technology/RuntimeView";
import { CaseDetails } from "../technology/CaseDetails";
import { patternMetadata } from "../technology/pattern-library";
import { LegacyCaseDetails } from "../technology/LegacyCaseDetails";
import { useEffect, useRef, useState } from "react";
import { X, Heart, Copy, Check, Download, Play } from "lucide-react";
import type { StyleSpec } from "../catalog/schema";
import { mediaUrl } from "../lib/playback";
import { compilePrompt } from "../lib/prompt";
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CopyButton({
  text,
  label = "複製完整提示詞",
  secondary = false,
}: {
  text: string;
  label?: string;
  secondary?: boolean;
}) {
  const [state, setState] = useState<"idle" | "success" | "fallback">("idle");
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setState("idle");
  }, [text]);
  useEffect(() => {
    if (state === "fallback") {
      area.current?.focus();
      area.current?.select();
    }
    if (state === "success") {
      const t = setTimeout(() => setState("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);
  return (
    <div className="copy-control">
      <button
        className={
          secondary ? "secondary-button" : "primary-button copy-primary"
        }
        onClick={async () => {
          try {
            if (!navigator.clipboard?.writeText)
              throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(text);
            setState("success");
          } catch {
            setState("fallback");
          }
        }}
      >
        {state === "success" ? <Check size={15} /> : <Copy size={15} />}
        <span>{state === "success" ? "已複製" : label}</span>
      </button>
      {state === "fallback" && (
        <div className="copy-fallback" role="status">
          <p>瀏覽器未允許複製。完整內容已選取，請按 ⌘C 或 Ctrl+C。</p>
          <textarea
            ref={area}
            readOnly
            value={text}
            aria-label="手動複製完整內容"
          />
        </div>
      )}
    </div>
  );
}

export function DetailView({
  style,
  onClose,
  favorite,
  onFavorite,
}: {
  style: StyleSpec;
  onClose: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [context, setContext] = useState({
    subject: "",
    duration: "",
    ratio: "16:9",
    assets: "",
  });
  const prompt = compilePrompt(style, context);
  const technologyCase = caseById.get(style.id);
  useEffect(() => {
    const focused = document.activeElement as HTMLElement;
    const scroll = window.scrollY;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      window.scrollTo(0, scroll);
      focused?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    setVideoFailed(false);
    const node = video.current;
    if (!node) return;
    node.src = mediaUrl(style.preview.detail);
    // Muted inline playback is permitted by most browsers; keep the native
    // controls available when a browser or user preference blocks autoplay.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    const syncPlayback = () => {
      if (document.hidden || !inView || reduced.matches) node.pause();
      else void node.play().catch(() => {});
    };
    syncPlayback();
    const motionPreference = () => syncPlayback();
    reduced.addEventListener("change", motionPreference);
    const observer = new IntersectionObserver((entries) => {
      inView = !!entries[0]?.isIntersecting;
      syncPlayback();
    });
    observer.observe(node);
    const visibility = () => syncPlayback();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", motionPreference);
      observer.disconnect();
      node.pause();
      node.removeAttribute("src");
      node.load();
    };
  }, [style]);
  return (
    <dialog
      ref={dialog}
      className="detail-dialog"
      aria-label={`${style.name} 風格檢視`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="detail-shell">
        <header className="detail-header">
          <div>
            <span className="eyebrow">風格檢視</span>
            <span className="detail-id">
              {style.id} <span> / v{style.version}</span>
            </span>
            {["rendered", "reviewed"].includes(style.status) && (
              <span className="review-preview-label">本機審查預覽 · 尚未發布</span>
            )}
          </div>
          <div>
            <button
              className={favorite ? "favorited" : ""}
              aria-label={favorite ? "取消收藏" : "收藏風格"}
              aria-pressed={favorite}
              onClick={onFavorite}
            >
              <Heart size={17} fill={favorite ? "currentColor" : "none"} />
            </button>
            <button aria-label="關閉風格檢視" onClick={onClose}>
              <X size={22} />
            </button>
          </div>
        </header>
        <div className="detail-body">
          <div className="detail-visual">
            <div className="detail-player">
              {!videoFailed ? (
                <video
                  ref={video}
                  src={mediaUrl(style.preview.detail)}
                  poster={mediaUrl(style.preview.poster)}
                  controls
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  onError={() => setVideoFailed(true)}
                />
              ) : (
                <div className="detail-video-fallback">
                  <img src={mediaUrl(style.preview.poster)} alt={style.name} />
                  <div>
                    <p>影片暫時無法載入，仍可檢視風格與提示詞。</p>
                    <button onClick={() => setVideoFailed(false)}>
                      <Play size={14} />
                      重新載入影片
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="visual-caption">
              <span>{style.englishName}</span>
              <span>
                1280 × 720 · {style.preview.fps} fps ·{" "}
                {technologyCase?.durationSeconds ??
                  style.preview.detailDuration}
                s
              </span>
            </div>
            <section className="style-intro">
              <div className="style-family">
                {technologyCase?.direction ?? style.family}
              </div>
              <h1>{style.name}</h1>
              <p>{style.description}</p>
              <div className="tag-list">
                <span
                  className="primary-tech-tag"
                  title="主要製作技術"
                  aria-label={`主要製作技術：${technologyName(technologyCase?.primary ?? "remotion")}`}
                >
                  {technologyName(technologyCase?.primary ?? "remotion")}
                </span>
                {[...style.moods, ...style.tags].map((tag, i) => (
                  <span key={`${tag}-${i}`}>{tag}</span>
                ))}
              </div>
            </section>
            {technologyCase && (
              <>
                <RuntimeView definition={technologyCase} />
                <CaseDetails definition={technologyCase} />
              </>
            )}
            {!technologyCase && <LegacyCaseDetails style={style} />}
            {technologyCase && (
              <>
                <div className="mobile-preview-copy">
                  <CopyButton text={prompt} label="複製風格規格" />
                </div>
              </>
            )}
          </div>
          <aside className="prompt-panel">
            <span className="eyebrow">將風格帶入你的專案</span>
            <h2>
              讓這個風格，
              <br />
              {technologyCase ? "帶入新的製作情境。" : "成為你的下一支影片。"}
            </h2>
            <p>
              完整規格包含視覺規則、動態語法、製作限制與驗收條件，可直接交給其他專案的
              Codex。
            </p>
            <CopyButton text={prompt} />
            <div className="secondary-exports">
              <CopyButton
                text={[...style.moods, ...style.tags].join(", ")}
                label="複製關鍵字"
                secondary
              />
              <button
                onClick={() =>
                  downloadText(
                    `${style.id}-${style.slug}.json`,
                    JSON.stringify(
                      technologyCase
                        ? {
                            collection: "technology",
                            definition: technologyCase,
                            patternLibrary: patternMetadata(technologyCase),
                            verification: caseEvidence(style.id),
                            technicalReferenceIds: [
                              technologyCase.primary,
                              ...(technologyCase.supporting ?? []).map(
                                (t) => t.id,
                              ),
                            ],
                          }
                        : style,
                      null,
                      2,
                    ),
                  )
                }
              >
                <Download size={13} />
                匯出風格 JSON
              </button>
            </div>
            <details className="context-fields">
              <summary>
                加入你的專案內容 <span>選填</span>
              </summary>
              <label>
                影片主題
                <input
                  placeholder="例如：建築展覽形象影片"
                  value={context.subject}
                  onChange={(e) =>
                    setContext((c) => ({ ...c, subject: e.target.value }))
                  }
                />
              </label>
              <div className="field-row">
                <label>
                  影片長度
                  <input
                    placeholder="例如：30 seconds"
                    value={context.duration}
                    onChange={(e) =>
                      setContext((c) => ({ ...c, duration: e.target.value }))
                    }
                  />
                </label>
                <label>
                  輸出比例
                  <select
                    value={context.ratio}
                    onChange={(e) =>
                      setContext((c) => ({ ...c, ratio: e.target.value }))
                    }
                  >
                    <option value="16:9">16:9（已審查）</option>
                    <option value="9:16">9:16（需重新排版與審查）</option>
                    <option value="1:1">1:1（需重新排版與審查）</option>
                  </select>
                </label>
              </div>
              <label>
                可用素材
                <textarea
                  placeholder="照片、產品影片、Logo、品牌字體…"
                  value={context.assets}
                  onChange={(e) =>
                    setContext((c) => ({ ...c, assets: e.target.value }))
                  }
                />
              </label>
            </details>
            <details className="prompt-disclosure">
              <summary>檢視完整提示詞</summary>
              <textarea readOnly value={prompt} aria-label="完整提示詞" />
            </details>
            <div className="portability-note">
              <span>↗</span>
              <p>
                提示詞保留風格邏輯，實際成果依素材與製作而異。JSON
                是更精確的結構化伴隨資料。
              </p>
            </div>
          </aside>
        </div>
      </div>
    </dialog>
  );
}
