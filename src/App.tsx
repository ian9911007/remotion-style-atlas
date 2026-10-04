import {
  caseById,
  caseEvidence,
  technologyCatalog,
  technologyCases,
} from "./technology/registry";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Heart,
  SlidersHorizontal,
  Pause,
  Play,
  Grid2X2,
  MousePointer2,
  Image,
  Inbox,
  ArrowUpRight,
  X,
  Download,
  Upload,
  Layers,
  Check,
  Copy,
} from "lucide-react";
import { catalog } from "./catalog/catalog";
import {
  familyLabels,
  intensityLabels,
  pacingLabels,
  mediaLabels,
  useLabels,
  type StyleSpec,
} from "./catalog/schema";
import { PlaybackScheduler, type PlaybackMode } from "./lib/playback";
import { compileBlend } from "./lib/prompt";
import {
  readPreferences,
  savePreferences,
  readReferences,
  saveReferences,
  exportLocalState,
  parseLocalState,
  type ReferenceDraft,
} from "./lib/storage";
import { StyleCard } from "./components/StyleCard";
import { DetailView, CopyButton, downloadText } from "./components/DetailView";
import { ReferenceInbox } from "./components/ReferenceInbox";
import "./app.css";
import { patternMetadata, patternTaxonomy } from "./technology/pattern-library";
type Filters = {
  pattern: string;
  source: string;
  family: string;
  intensity: string;
  pacing: string;
  media: string;
  use: string;
  ratio: string;
  collection: string;
  technology: string;
  renderer: string;
  interaction: string;
  readiness: string;
  direction: string;
  capability: string;
  medium: string;
};
const emptyFilters: Filters = {
  pattern: "",
  source: "",
  family: "",
  intensity: "",
  pacing: "",
  media: "",
  use: "",
  ratio: "",
  collection: "",
  technology: "",
  renderer: "",
  interaction: "",
  readiness: "",
  direction: "",
  capability: "",
  medium: "",
};
function routeStyle() {
  const match = window.location.hash.match(/^#\/style\/(SA-\d{3})$/);
  return match ? (catalog.find((s) => s.id === match[1]) ?? null) : null;
}
export function App() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<"all" | "favorites" | "recent">("all");
  const [detail, setDetail] = useState<StyleSpec | null>(routeStyle);
  const [inbox, setInbox] = useState(false);
  const [references, setReferences] =
    useState<ReferenceDraft[]>(readReferences);
  const [notice, setNotice] = useState("");
  const [blendOpen, setBlendOpen] = useState(false);
  const [roles, setRoles] = useState({
    primary: "",
    motion: "",
    typography: "",
  });
  const [localOpen, setLocalOpen] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const scheduler = useMemo(() => new PlaybackScheduler(), []);
  useEffect(() => {
    scheduler.start();
    Object.assign(window, { __atlasPlayback: scheduler });
    return () => {
      scheduler.destroy();
      delete (window as unknown as Record<string, unknown>).__atlasPlayback;
    };
  }, [scheduler]);
  useEffect(() => {
    try {
      savePreferences(preferences);
    } catch {
      setNotice("瀏覽器未允許儲存偏好，這次操作仍可使用。");
    }
    scheduler.configure(
      preferences.mode,
      preferences.paused,
      !!detail || inbox || blendOpen || localOpen,
    );
  }, [preferences, detail, inbox, blendOpen, localOpen, scheduler]);
  useEffect(() => {
    const listener = () => setDetail(routeStyle());
    window.addEventListener("hashchange", listener);
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("hashchange", listener);
      window.removeEventListener("popstate", listener);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timeout);
  }, [notice]);
  const results = useMemo(() => {
    const text = query.trim().toLocaleLowerCase();
    let styles = catalog.filter(
      (s) =>
        (!text ||
          [
            s.id,
            s.name,
            s.englishName,
            s.description,
            ...s.aliases,
            ...s.tags,
            ...s.moods,
          ]
            .join(" ")
            .toLocaleLowerCase()
            .includes(text)) &&
        (!filters.collection ||
          (caseById.has(s.id) ? "technology" : "legacy") ===
            filters.collection) &&
        (!filters.pattern ||
          !!patternMetadata(caseById.get(s.id) ?? { id: s.id })?.patterns.includes(filters.pattern)) &&
        (!filters.source ||
          !!patternMetadata(caseById.get(s.id) ?? { id: s.id })?.sources.includes(filters.source)) &&
        (!filters.technology ||
          [
            caseById.get(s.id)?.primary,
            ...(caseById.get(s.id)?.supporting ?? []).map((t) => t.id),
          ].includes(filters.technology)) &&
        (!filters.renderer ||
          caseById.get(s.id)?.renderer === filters.renderer) &&
        (!filters.interaction ||
          caseById.get(s.id)?.interaction.includes(filters.interaction)) &&
        (!filters.readiness ||
          (caseById.has(s.id) ? caseEvidence(s.id).status : "ready") ===
            filters.readiness) &&
        (!filters.direction ||
          caseById.get(s.id)?.direction === filters.direction) &&
        (!filters.capability ||
          caseById.get(s.id)?.capabilities.includes(filters.capability)) &&
        (!filters.medium ||
          (caseById.has(s.id)
            ? ["remotion", "motion-canvas"].includes(
                caseById.get(s.id)!.primary,
              )
              ? "video"
              : ["frame-driven", "adapter-required"].includes(
                    caseById.get(s.id)!.video,
                  )
                ? "web-video"
                : "web"
            : "video") === filters.medium) &&
        (!filters.family ||
          (!caseById.has(s.id) && s.family === filters.family)) &&
        (!filters.intensity ||
          (!caseById.has(s.id) && s.motion.intensity === filters.intensity)) &&
        (!filters.pacing ||
          (!caseById.has(s.id) && s.motion.pacing === filters.pacing)) &&
        (!filters.media ||
          (!caseById.has(s.id) && s.media.treatment === filters.media)) &&
        (!filters.use ||
          (!caseById.has(s.id) && s.useCases.includes(filters.use as never))) &&
        (!filters.ratio ||
          s.variants.some((v) => v.ratio === filters.ratio && v.reviewed)) &&
        (view !== "favorites" || preferences.favorites.includes(s.id)),
    );
    if (view === "recent")
      styles = styles
        .slice()
        .sort(
          (a, b) =>
            b.created.localeCompare(a.created) ||
            Number(b.id.slice(3)) - Number(a.id.slice(3)),
        );
    return styles;
  }, [query, filters, view, preferences.favorites]);
  const selected = preferences.selections
    .map((id) => catalog.find((s) => s.id === id))
    .filter((s): s is StyleSpec => !!s);
  function toggleFavorite(id: string) {
    setPreferences((p) => ({
      ...p,
      favorites: p.favorites.includes(id)
        ? p.favorites.filter((x) => x !== id)
        : [...p.favorites, id],
    }));
  }
  function toggleSelection(id: string) {
    if (
      !preferences.selections.includes(id) &&
      preferences.selections.length >= 3
    ) {
      setNotice("最多選取 3 個風格。請先移除一個風格。");
      return;
    }
    setPreferences((p) => ({
      ...p,
      selections: p.selections.includes(id)
        ? p.selections.filter((x) => x !== id)
        : [...p.selections, id],
    }));
  }
  function openStyle(style: StyleSpec) {
    returnFocus.current = document.activeElement as HTMLElement;
    history.pushState(null, "", `#/style/${style.id}`);
    setDetail(style);
  }
  function navigateDetail(id: string) {
    const style = catalog.find((candidate) => candidate.id === id);
    if (!style) return;
    history.replaceState(null, "", `#/style/${style.id}`);
    setDetail(style);
  }
  function closeStyle() {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    setDetail(null);
    requestAnimationFrame(() =>
      returnFocus.current?.focus({ preventScroll: true }),
    );
  }
  function openBlend() {
    setRoles({
      primary: selected[0]?.id ?? "",
      motion: selected[1]?.id ?? "",
      typography: selected[2]?.id ?? "",
    });
    setBlendOpen(true);
  }
  const primary = selected.find((s) => s.id === roles.primary);
  const synthesis = primary
    ? compileBlend({
        primary,
        motion: selected.find((s) => s.id === roles.motion),
        typography: selected.find((s) => s.id === roles.typography),
      })
    : null;
  async function importData(file: File) {
    try {
      const parsed = parseLocalState(
        await file.text(),
        catalog.map((s) => s.id),
      );
      saveReferences(parsed.references);
      setReferences(parsed.references);
      setPreferences(parsed.preferences);
      setNotice("本機資料已匯入。附件媒體仍需另行加入。");
    } catch (error) {
      setNotice(
        `匯入失敗：${error instanceof Error ? error.message : "檔案格式不正確"}`,
      );
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  }
  const filterCount = Object.values(filters).filter(Boolean).length;
  return (
    <>
      <header className="site-header">
        <div className="header-main">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setQuery("");
              setFilters(emptyFilters);
              setView("all");
            }}
            aria-label="Remotion Style Atlas 首頁"
          >
            <span className="brand-mark">
              a<span>↗</span>
            </span>
            <span>
              Remotion
              <br />
              <strong>Style Atlas</strong>
            </span>
          </a>
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="搜尋風格"
              placeholder="用感覺找風格，例如：沉穩、紙材、俐落…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="清除搜尋" onClick={() => setQuery("")}>
                <X size={15} />
              </button>
            )}
            <kbd>/</kbd>
          </div>
          <div className="header-actions">
            <button
              className={filterOpen ? "active" : ""}
              onClick={() => setFilterOpen(!filterOpen)}
              aria-expanded={filterOpen}
              aria-controls="filter-panel"
            >
              <SlidersHorizontal size={16} />
              <span>篩選</span>
              {filterCount > 0 && <b>{filterCount}</b>}
            </button>
            <button onClick={() => setInbox(true)}>
              <Inbox size={16} />
              <span>參考收件匣</span>
            </button>
            <button
              className="local-button"
              onClick={() => setLocalOpen(true)}
              aria-label="本機資料匯出與匯入"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        <div className="header-secondary">
          <nav aria-label="風格集">
            <button
              className={view === "all" ? "active" : ""}
              onClick={() => setView("all")}
            >
              所有風格 <span>{catalog.length.toString().padStart(2, "0")}</span>
            </button>
            <button
              className={view === "favorites" ? "active" : ""}
              onClick={() => setView("favorites")}
            >
              <Heart size={12} />
              已收藏 <span>{preferences.favorites.length}</span>
            </button>
            <button
              className={view === "recent" ? "active" : ""}
              onClick={() => setView("recent")}
            >
              最近加入
            </button>
          </nav>
          <div className="playback-controls">
            <span className="playback-label">預覽</span>
            {(
              [
                ["wall", "全域", Grid2X2],
                ["focus", "聚焦", MousePointer2],
                ["still", "靜態", Image],
              ] as const
            ).map(([mode, label, Icon]) => (
              <button
                key={mode}
                className={preferences.mode === mode ? "active" : ""}
                title={
                  {
                    wall: "播放所有風格預覽",
                    focus: "播放滑鼠所在卡片及周圍八張預覽",
                    still: "僅顯示靜態海報",
                  }[mode]
                }
                aria-pressed={preferences.mode === mode}
                onClick={() =>
                  setPreferences((p) => ({ ...p, mode: mode as PlaybackMode }))
                }
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
            <span className="control-divider" />
            <button
              className="global-pause"
              aria-label={preferences.paused ? "繼續所有預覽" : "暫停所有預覽"}
              aria-pressed={preferences.paused}
              onClick={() =>
                setPreferences((p) => ({ ...p, paused: !p.paused }))
              }
            >
              {preferences.paused ? <Play size={13} /> : <Pause size={13} />}
              <span>{preferences.paused ? "繼續" : "暫停"}</span>
            </button>
          </div>
        </div>
        {filterOpen && (
          <div className="filter-panel" id="filter-panel">
            {(
              [
                {
                  key: "capability",
                  label: "展示能力",
                  values: Object.fromEntries(
                    technologyCases.flatMap((c) =>
                      c.capabilities.map((x) => [x, `${c.title} / ${x}`]),
                    ),
                  ),
                },
                {
                  key: "pattern",
                  label: "視覺模式",
                  values: Object.fromEntries(patternTaxonomy.patterns.map((p) => [p.id, p.label])),
                },
                {
                  key: "source",
                  label: "參考／靈感來源",
                  values: Object.fromEntries(patternTaxonomy.sources.map((s) => [s.id, s.label])),
                },
                {
                  key: "direction",
                  label: "視覺方向",
                  values: Object.fromEntries(
                    technologyCases.map((c) => [c.direction, c.direction]),
                  ),
                },
                {
                  key: "medium",
                  label: "目標媒介",
                  values: {
                    web: "互動網頁",
                    "web-video": "網頁／逐幀適配",
                    video: "影片",
                  },
                },
                {
                  key: "collection",
                  label: "選集",
                  values: {
                    legacy: "原有風格選集",
                    technology: "技術能力案例",
                  },
                },
                {
                  key: "technology",
                  label: "實作技術",
                  values: Object.fromEntries(
                    technologyCatalog.map((t) => [t.id, t.name]),
                  ),
                },
                {
                  key: "renderer",
                  label: "繪製方式",
                  values: Object.fromEntries(
                    [...new Set(technologyCases.map((c) => c.renderer))].map(
                      (x) => [x, x],
                    ),
                  ),
                },
                {
                  key: "interaction",
                  label: "觸發方式",
                  values: {
                    time: "時間",
                    pointer: "指標",
                    touch: "觸控",
                    keyboard: "鍵盤",
                    scroll: "捲動",
                    state: "狀態",
                    data: "資料",
                  },
                },
                {
                  key: "readiness",
                  label: "完成狀態",
                  values: {
                    ready: "已就緒",
                    partial: "部分完成",
                    blocked: "受阻",
                    unverified: "待驗證",
                  },
                },
                { key: "family", label: "視覺家族", values: familyLabels },
                {
                  key: "intensity",
                  label: "動態強度",
                  values: intensityLabels,
                },
                { key: "pacing", label: "節奏", values: pacingLabels },
                { key: "media", label: "媒材", values: mediaLabels },
                { key: "use", label: "適合用途", values: useLabels },
                {
                  key: "ratio",
                  label: "已審查比例",
                  values: { "16:9": "16:9 橫式" },
                },
              ] as const
            ).map((f) => (
              <label key={f.key}>
                {f.label}
                <select
                  aria-label={f.label}
                  value={filters[f.key]}
                  onChange={(e) =>
                    setFilters((x) => ({ ...x, [f.key]: e.target.value }))
                  }
                >
                  <option value="">全部</option>
                  {Object.entries(f.values).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button
              className="text-button"
              onClick={() => setFilters(emptyFilters)}
            >
              重設
            </button>
          </div>
        )}
      </header>
      <main className="gallery-main">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">動態視覺語言選集</span>
            <h1>
              {view === "favorites"
                ? "你的風格收藏"
                : view === "recent"
                  ? "新加入的視覺語言"
                  : "看見風格，找到方向。"}
            </h1>
          </div>
          <p>
            <span className="status-dot" />
            {results.length} 個已審查風格
            <span className="heading-note">原創設計 · 真實動態預覽</span>
          </p>
        </div>
        {results.length ? (
          <div className="gallery-grid">
            {results.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                scheduler={scheduler}
                favorite={preferences.favorites.includes(style.id)}
                selected={preferences.selections.includes(style.id)}
                onOpen={() => openStyle(style)}
                onFavorite={() => toggleFavorite(style.id)}
                onSelect={() => toggleSelection(style.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={28} />
            <h2>
              {view === "favorites" && !preferences.favorites.length
                ? "還沒有收藏風格"
                : "沒有符合的風格"}
            </h2>
            <p>
              {view === "favorites"
                ? "點選卡片上的愛心，把想用的風格留在這裡。"
                : "試試其他關鍵字，或放寬篩選條件。"}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setFilters(emptyFilters);
                setView("all");
              }}
            >
              瀏覽全部風格 <ArrowUpRight size={14} />
            </button>
          </div>
        )}
        <footer className="site-footer">
          <p>
            <span className="footer-brand">風格圖鑑</span>
            風格是起點，內容由你決定。
          </p>
          <button onClick={() => setLocalOpen(true)}>
            本機資料與隱私 <ArrowUpRight size={11} />
          </button>
        </footer>
      </main>
      {selected.length > 0 && (
        <aside className="selection-tray" aria-label="選取的風格">
          <div className="tray-label">
            <Layers size={16} />
            <span>
              風格組合 <small>{selected.length}/3</small>
            </span>
          </div>
          <div className="tray-items">
            {selected.map((s) => (
              <div key={s.id}>
                <span>{s.name}</span>
                <button
                  aria-label={`移除 ${s.name}`}
                  onClick={() => toggleSelection(s.id)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <button className="primary-button" onClick={openBlend}>
            編排風格 <ArrowUpRight size={14} />
          </button>
          <button
            className="tray-clear"
            aria-label="清除選取"
            onClick={() => setPreferences((p) => ({ ...p, selections: [] }))}
          >
            <X size={16} />
          </button>
        </aside>
      )}
      {detail && (
        <DetailView
          style={detail}
          onClose={closeStyle}
          favorite={preferences.favorites.includes(detail.id)}
          onFavorite={() => toggleFavorite(detail.id)}
        />
      )}
      {inbox && (
        <ReferenceInbox
          references={references}
          onChange={(refs) => {
            saveReferences(refs);
            setReferences(refs);
          }}
          onClose={() => setInbox(false)}
          onNotice={setNotice}
        />
      )}
      {blendOpen && (
        <SimpleDialog
          title="編排你的風格語言"
          onClose={() => setBlendOpen(false)}
        >
          <p className="muted">
            合成創意規格尚未經過渲染驗證。主風格保留構圖與版面，其他風格只影響指定面向。
          </p>
          <div className="role-fields">
            {(
              [
                { key: "primary", label: "主要視覺風格" },
                { key: "motion", label: "動態影響" },
                { key: "typography", label: "字體影響" },
              ] as const
            ).map(({ key, label }) => (
              <label key={key}>
                {label}
                <select
                  value={roles[key]}
                  onChange={(e) =>
                    setRoles((r) => ({ ...r, [key]: e.target.value }))
                  }
                >
                  {key !== "primary" && <option value="">不加入</option>}
                  {selected.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.id}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {synthesis && (
            <>
              {synthesis.warnings.map((warning, i) => (
                <p className="warning" key={i}>
                  {warning}
                </p>
              ))}
              <CopyButton text={synthesis.prompt} label="複製合成規格" />
              <details className="prompt-disclosure">
                <summary>檢視完整合成規格</summary>
                <textarea
                  readOnly
                  value={synthesis.prompt}
                  aria-label="合成創意規格"
                />
              </details>
            </>
          )}
        </SimpleDialog>
      )}
      {localOpen && (
        <SimpleDialog title="你的本機資料" onClose={() => setLocalOpen(false)}>
          <p>
            收藏、選取與參考草稿儲存在這個瀏覽器，沒有自動跨裝置同步。清除瀏覽器儲存空間可能移除資料。
          </p>
          <p className="muted">
            匯出包含中繼資料，不包含附件媒體。匯入會取代目前的收藏、選取與參考草稿；新增草稿不會發佈到公開風格集。
          </p>
          <div className="dialog-actions">
            <button
              className="primary-button"
              onClick={() =>
                downloadText(
                  "style-atlas-local-state.json",
                  exportLocalState(preferences, references),
                )
              }
            >
              <Download size={14} />
              匯出本機資料
            </button>
            <button onClick={() => importInput.current?.click()}>
              <Upload size={14} />
              匯入資料
            </button>
          </div>
          <input
            ref={importInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importData(file);
            }}
          />
          <p className="storage-note">
            官方風格集更新須經原始碼編輯 → 渲染 → 審查 → 建置與發佈。
          </p>
        </SimpleDialog>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="關閉通知">
            <X size={14} />
          </button>
        </div>
      )}
      <SearchShortcut
        caseIds={results.map((style) => style.id)}
        detailId={detail?.id ?? null}
        onNavigate={navigateDetail}
      />
    </>
  );
}
function SearchShortcut({
  caseIds,
  detailId,
  onNavigate,
}: {
  caseIds: string[];
  detailId: string | null;
  onNavigate: (id: string) => void;
}) {
  const latest = useRef({ caseIds, detailId, onNavigate });
  latest.current = { caseIds, detailId, onNavigate };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const galleryCard = target.closest(".gallery-grid .card-open");
      const typing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable;
      const dialog = document.querySelector<HTMLDialogElement>(
        ".detail-dialog[open]",
      );
      const dialogOwnsArrows = !!target.closest(
        "input[type='range'], [contenteditable='true']",
      );
      if (e.key === "/" && !typing && !dialog) {
        e.preventDefault();
        (
          document.querySelector(
            'input[aria-label="搜尋風格"]',
          ) as HTMLInputElement
        )?.focus();
      }
      if (
        !typing &&
        !dialogOwnsArrows &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")
      ) {
        if (dialog) {
          const { caseIds, detailId, onNavigate } = latest.current;
          const current = detailId ? caseIds.indexOf(detailId) : -1;
          const next = current + (e.key === "ArrowRight" ? 1 : -1);
          e.preventDefault();
          if (current >= 0 && next >= 0 && next < caseIds.length)
            onNavigate(caseIds[next]);
          return;
        }
        if (target !== document.body && !galleryCard) return;
        const cards = [
          ...document.querySelectorAll<HTMLButtonElement>(
            ".gallery-grid .card-open",
          ),
        ];
        if (!cards.length) return;
        e.preventDefault();
        const current = cards.indexOf(
          target.closest(".card-open") as HTMLButtonElement,
        );
        const start = current < 0 ? (e.key === "ArrowRight" ? -1 : 0) : current;
        const next = start + (e.key === "ArrowRight" ? 1 : -1);
        if (next >= 0 && next < cards.length) cards[next].focus();
      }
      if (
        !typing &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        if (dialog && !dialogOwnsArrows) {
          const scroller = dialog.querySelector<HTMLElement>(".detail-shell");
          if (!scroller) return;
          e.preventDefault();
          scroller.scrollBy({
            top:
              (e.key === "ArrowDown" ? 1 : -1) *
              Math.round(scroller.clientHeight * 0.2),
            behavior: "auto",
          });
          return;
        }
        if (dialog || !galleryCard) return;
        e.preventDefault();
        window.scrollBy({
          top:
            (e.key === "ArrowDown" ? 1 : -1) *
            Math.round(window.innerHeight * 0.2),
          behavior: "auto",
        });
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  return null;
}
export function SimpleDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const scroll = window.scrollY;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      window.scrollTo(0, scroll);
      before?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="simple-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="simple-dialog-content">
        <header>
          <h2>{title}</h2>
          <button aria-label="關閉視窗" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
