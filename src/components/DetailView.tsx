import { useEffect, useRef, useState } from "react";
import {
  X,
  Heart,
  Copy,
  Check,
  Download,
  ArrowUpRight,
  Play,
} from "lucide-react";
import type { StyleSpec } from "../catalog/schema";
import {
  familyLabels,
  useLabels,
  intensityLabels,
  pacingLabels,
  mediaLabels,
} from "../catalog/schema";
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

const paletteRuleLabels: Record<string, string> = {
  "Foreground text must contrast with its immediate background.":
    "文字須與其所在的底色保持清晰對比。",
  "Use accent only for hierarchy, markers or directional focus; preserve muted secondary hierarchy.":
    "重點色只用於層級、標記與視線引導；輔助色保持低調的次要層次。",
};
function RuleGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rule-group">
      <h3>{title}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
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
    const visibility = () => {
      if (document.hidden) node.pause();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
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
                {style.preview.width} × {style.preview.height} ·{" "}
                {style.preview.fps} fps · {style.preview.detailDuration}s
              </span>
            </div>
            <div className="mobile-preview-copy">
              <CopyButton text={prompt} label="複製風格規格" />
            </div>
            <section className="style-intro">
              <div className="style-family">{familyLabels[style.family]}</div>
              <h1>{style.name}</h1>
              <p>{style.description}</p>
              <div className="tag-list">
                {[...style.moods, ...style.tags].map((tag, i) => (
                  <span key={`${tag}-${i}`}>{tag}</span>
                ))}
              </div>
            </section>
            <div className="style-facts">
              <div>
                <span>動態強度</span>
                <strong>{intensityLabels[style.motion.intensity]}</strong>
              </div>
              <div>
                <span>節奏</span>
                <strong>{pacingLabels[style.motion.pacing]}</strong>
              </div>
              <div>
                <span>媒材</span>
                <strong>{mediaLabels[style.media.treatment]}</strong>
              </div>
              <div>
                <span>適合用途</span>
                <strong>
                  {style.useCases.map((u) => useLabels[u]).join("、")}
                </strong>
              </div>
            </div>
            <section className="palette-section" aria-label="風格色彩">
              <h3>色彩與對比</h3>
              <div className="palette-swatches">
                {(
                  [
                    ["background", "底色"],
                    ["foreground", "文字"],
                    ["accent", "重點"],
                    ["secondary", "輔助"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <i
                      style={{ backgroundColor: style.palette[key] }}
                      aria-hidden="true"
                    />
                    <span>
                      {label}
                      <small>{style.palette[key]}</small>
                    </span>
                  </div>
                ))}
              </div>
              {style.palette.rules.map((rule, i) => (
                <p key={i}>
                  {paletteRuleLabels[rule] ??
                    "其他色彩關係請見完整提示詞與 JSON。"}
                </p>
              ))}
            </section>
            <div className="detail-rules">
              <RuleGroup
                title="不可缺少的視覺特徵"
                items={[style.description]}
              />
              <RuleGroup
                title="字體與版面"
                items={[
                  `${style.typography.family}；缺字或無法載入時，使用支援繁體中文的系統字型。`,
                  ...style.presentation.typography,
                  ...style.presentation.layout,
                ]}
              />
              <RuleGroup
                title="動態、轉場與節奏"
                items={style.presentation.motion}
              />
              <RuleGroup
                title="媒材、深度與效果"
                items={style.presentation.media}
              />
              <RuleGroup title="避免事項" items={style.presentation.avoid} />
              <RuleGroup
                title="製作需求與限制"
                items={[
                  ...style.presentation.limitations,
                  "製作需求：React 與同版 Remotion、SVG 元件；需支援繁體中文的字型。",
                ]}
              />
            </div>
            <section className="provenance">
              <h3>來源與審查</h3>
              <p>原創設計 · {style.provenance.creator}</p>
              <p>
                原創構圖與範例插畫，無第三方素材；針對 16:9 進行影格與循環檢查。
              </p>
              {style.provenance.references.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.title}
                  <ArrowUpRight size={12} />
                </a>
              ))}
              <p>
                視覺與動態審查：{style.review.reviewer} · {style.review.date}
              </p>
              <p className="muted">{style.review.notes}</p>
            </section>
          </div>
          <aside className="prompt-panel">
            <span className="eyebrow">將風格帶入你的專案</span>
            <h2>
              讓這個風格，
              <br />
              成為你的下一支影片。
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
                    JSON.stringify(style, null, 2),
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
