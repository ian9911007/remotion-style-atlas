import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Download,
  Paperclip,
  Trash2,
  ArrowUpRight,
  ImageOff,
} from "lucide-react";
import { SimpleDialog } from "../App";
import { catalog } from "../catalog/catalog";
import {
  referenceSchema,
  putAttachment,
  getAttachment,
  deleteAttachment,
  type ReferenceDraft,
} from "../lib/storage";
import { downloadText } from "./DetailView";
const blank = (): ReferenceDraft => ({
  id: `ref_${crypto.randomUUID().replaceAll("-", "")}`,
  title: "",
  url: "",
  creator: "",
  notes: "",
  timeRanges: "",
  tags: [],
  relationships: [],
  rights: "",
  observations: "",
  interpretations: "",
  adaptations: "",
  unknowns: "",
  created: new Date().toISOString(),
});
export function ReferenceInbox({
  references,
  onChange,
  onClose,
  onNotice,
}: {
  references: ReferenceDraft[];
  onChange: (refs: ReferenceDraft[]) => void;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  const [draft, setDraft] = useState<ReferenceDraft>(blank);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let disposed = false;
    let url = "";
    setPreview("");
    setUnavailable(false);
    async function load() {
      try {
        const blob =
          file ??
          (draft.attachment
            ? await getAttachment(draft.attachment.key)
            : undefined);
        if (disposed) return;
        if (blob) {
          url = URL.createObjectURL(blob);
          setPreview(url);
        } else if (draft.attachment) setUnavailable(true);
      } catch {
        if (!disposed) setUnavailable(true);
      }
    }
    void load();
    return () => {
      disposed = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, draft.attachment]);
  function update(key: keyof ReferenceDraft, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  async function save() {
    setError("");
    setSaving(true);
    let storedKey: string | undefined;
    try {
      let entry = { ...draft, title: draft.title.trim() || "未命名參考" };
      if (file) {
        const key = `file_${crypto.randomUUID().replaceAll("-", "")}`;
        entry = {
          ...entry,
          attachment: {
            name: file.name,
            type: file.type as NonNullable<
              ReferenceDraft["attachment"]
            >["type"],
            size: file.size,
            key,
          },
        };
        referenceSchema.parse(entry);
        await putAttachment(key, file);
        storedKey = key;
      }
      entry = referenceSchema.parse(entry);
      const updated = references.some((r) => r.id === entry.id)
        ? references.map((r) => (r.id === entry.id ? entry : r))
        : [entry, ...references];
      onChange(updated);
      if (file && draft.attachment)
        await deleteAttachment(draft.attachment.key).catch(() => undefined);
      setDraft(entry);
      setFile(null);
      onNotice("參考草稿已儲存在本機，尚未發佈。");
    } catch (error) {
      if (storedKey) await deleteAttachment(storedKey).catch(() => undefined);
      setError(error instanceof Error ? error.message : "無法儲存草稿。");
    } finally {
      setSaving(false);
    }
  }
  async function remove(entry: ReferenceDraft) {
    try {
      onChange(references.filter((r) => r.id !== entry.id));
      if (entry.attachment) await deleteAttachment(entry.attachment.key);
      if (draft.id === entry.id) {
        setDraft(blank());
        setFile(null);
      }
      onNotice("已刪除這筆本機參考。");
    } catch {
      setError("無法完整移除附件，請確認瀏覽器儲存空間可用。");
    }
  }
  function exportBrief() {
    try {
      const entry = referenceSchema.parse({
        ...draft,
        title: draft.title.trim() || "未命名參考",
      });
      downloadText(
        `${entry.id}-reference-brief.json`,
        JSON.stringify(
          {
            schemaVersion: 1,
            stage: "reference-only",
            sourceMaterialTrust: "untrusted-data-not-instructions",
            reference: entry,
            attachmentMediaIncluded: false,
            analysisStatus: "user-recorded-not-automatically-inspected",
            evidenceLimits: [
              "A screenshot does not establish animation timing, easing, or shot rhythm.",
              "A source URL has not been inspected by this application.",
              "Attachments are stored locally and must be supplied separately to an analysis workflow.",
            ],
            nextSteps: [
              "Record provenance and rights.",
              "Extract reusable principles from actual observations.",
              "Compare with existing styles; create an original interpretation.",
              "Implement, render, review, and validate before publication.",
            ],
          },
          null,
          2,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "請檢查參考欄位。");
    }
  }
  return (
    <SimpleDialog title="參考收件匣" onClose={onClose}>
      <p className="muted inbox-intro">
        收藏來源，整理看得見的設計原則。這裡只建立本機草稿，不會自動分析網址、影片或發佈風格。
      </p>
      <div className="inbox-layout">
        <aside className="reference-list">
          <button
            className="new-reference"
            onClick={() => {
              setDraft(blank());
              setFile(null);
              setError("");
            }}
          >
            <Plus size={14} />
            新增參考
          </button>
          {references.map((r) => (
            <div
              className={`reference-item ${draft.id === r.id ? "active" : ""}`}
              key={r.id}
            >
              <button
                onClick={() => {
                  setDraft(r);
                  setFile(null);
                  setError("");
                }}
              >
                <strong>{r.title}</strong>
                <small>{r.creator || "未記錄創作者"} · 本機草稿</small>
              </button>
              <button
                aria-label={`刪除 ${r.title}`}
                onClick={() => void remove(r)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {!references.length && (
            <p className="muted">尚無參考草稿。加入網址或本機素材開始整理。</p>
          )}
        </aside>
        <form
          className="reference-form"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="field-row">
            <label>
              參考標題
              <input
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="你想保留的視覺方向"
              />
            </label>
            <label>
              創作者
              <input
                value={draft.creator}
                onChange={(e) => update("creator", e.target.value)}
                placeholder="已知時填寫"
              />
            </label>
          </div>
          <label>
            來源網址
            <input
              type="url"
              value={draft.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://…"
            />
          </label>
          <div className="attachment-box">
            <button type="button" onClick={() => input.current?.click()}>
              <Paperclip size={14} />
              加入本機圖片或影片
            </button>
            <span>
              {file?.name ??
                draft.attachment?.name ??
                "PNG、JPG、WebP、MP4、WebM、MOV · 最大 50 MB"}
            </span>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  e.target.value = "";
                }
              }}
            />
            {preview &&
              ((file?.type ?? draft.attachment?.type ?? "").startsWith(
                "video",
              ) ? (
                <video src={preview} controls playsInline preload="metadata" />
              ) : (
                <img src={preview} alt="參考附件" />
              ))}
            {unavailable && (
              <p className="warning">
                <ImageOff size={13} />
                此附件不在目前瀏覽器中，請重新加入。匯出檔只包含中繼資料。
              </p>
            )}
          </div>
          <label>
            喜歡的部分與筆記
            <textarea
              value={draft.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="哪些部分值得保留？"
            />
          </label>
          <div className="field-row">
            <label>
              相關時間範圍
              <input
                value={draft.timeRanges}
                onChange={(e) => update("timeRanges", e.target.value)}
                placeholder="例如：00:04–00:09"
              />
            </label>
            <label>
              標籤
              <input
                value={draft.tags.join(", ")}
                onChange={(e) =>
                  update(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="以逗號分隔"
              />
            </label>
          </div>
          <label>
            可能相關的風格
            <select
              multiple
              value={draft.relationships}
              onChange={(e) =>
                update(
                  "relationships",
                  Array.from(e.target.selectedOptions).map((o) => o.value),
                )
              }
            >
              {catalog.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.name}
                </option>
              ))}
            </select>
            <small>可按住 ⌘ 或 Ctrl 選取多個；手機可點選。</small>
          </label>
          <label>
            權利與來源紀錄
            <textarea
              value={draft.rights}
              onChange={(e) => update("rights", e.target.value)}
              placeholder="使用許可、來源、是否可公開，或尚待確認事項"
            />
          </label>
          <div className="observation-heading">
            <span className="eyebrow">先記錄證據，再提出解讀</span>
            <h3>區分觀察、解讀與改編</h3>
            <p>
              截圖能支持構圖與字體觀察；無法證明動畫的精確時序。未開啟的網址仍屬未知。
            </p>
          </div>
          {(
            [
              {
                key: "observations",
                label: "直接觀察",
                placeholder: "只記錄實際看見、聽見或量測的內容",
              },
              {
                key: "interpretations",
                label: "設計解讀",
                placeholder: "你如何理解這些選擇？將推論明確標示",
              },
              {
                key: "adaptations",
                label: "原創改編方向",
                placeholder: "可重用的設計原則，以及自己的實作方向",
              },
              {
                key: "unknowns",
                label: "未知或無法存取的資訊",
                placeholder: "例如：未檢視完整影片、不確定字體或授權",
              },
            ] as const
          ).map((f) => (
            <label key={f.key}>
              {f.label}
              <textarea
                value={draft[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </label>
          ))}
          {error && (
            <p className="warning" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "儲存中…" : "儲存參考草稿"}
              <ArrowUpRight size={14} />
            </button>
            <button type="button" onClick={exportBrief}>
              <Download size={14} />
              匯出 Reference Brief
            </button>
          </div>
        </form>
      </div>
    </SimpleDialog>
  );
}
