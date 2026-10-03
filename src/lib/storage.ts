import { z } from "zod";
const id = z.string().regex(/^SA-\d{3}$/);
export const preferencesSchema = z
  .object({
    version: z.literal(1),
    favorites: z.array(id).max(1000),
    selections: z.array(id).max(3),
    mode: z.enum(["wall", "focus", "still"]),
    paused: z.boolean(),
  })
  .strict();
export type Preferences = z.infer<typeof preferencesSchema>;
const safeURL = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Only HTTP(S) source URLs are accepted.");
const text = z.string().max(20000);
export const referenceSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
    title: text,
    url: safeURL,
    creator: text,
    notes: text,
    timeRanges: text,
    tags: z.array(z.string().max(120)).max(50),
    relationships: z.array(id).max(20),
    rights: text,
    observations: text,
    interpretations: text,
    adaptations: text,
    unknowns: text,
    created: z.string().max(80),
    attachment: z
      .object({
        name: z.string().max(255),
        type: z.enum([
          "image/png",
          "image/jpeg",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ]),
        size: z.number().min(0).max(52428800),
        key: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
      })
      .optional(),
  })
  .strict();
export type ReferenceDraft = z.infer<typeof referenceSchema>;
const referenceList = z.array(referenceSchema).max(200);
const PREFS = "remotion-atlas.preferences.v1",
  REFS = "remotion-atlas.references.v1";
const defaults: Preferences = {
  version: 1,
  favorites: [],
  selections: [],
  mode: "focus",
  paused: false,
};
export function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS);
    return raw
      ? preferencesSchema.parse(JSON.parse(raw))
      : {
          ...defaults,
          mode: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "still"
            : "focus",
        };
  } catch {
    return { ...defaults, mode: "still" };
  }
}
export function savePreferences(prefs: Preferences) {
  localStorage.setItem(PREFS, JSON.stringify(preferencesSchema.parse(prefs)));
}
export function readReferences(): ReferenceDraft[] {
  try {
    return referenceList.parse(JSON.parse(localStorage.getItem(REFS) || "[]"));
  } catch {
    return [];
  }
}
export function saveReferences(refs: ReferenceDraft[]) {
  localStorage.setItem(REFS, JSON.stringify(referenceList.parse(refs)));
}
export function exportLocalState(
  preferences: Preferences,
  references: ReferenceDraft[],
): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      preferences: preferencesSchema.parse(preferences),
      references: referenceList.parse(references),
      attachmentMediaIncluded: false,
    },
    null,
    2,
  );
}
const stateSchema = z
  .object({
    schemaVersion: z.literal(1),
    preferences: preferencesSchema,
    references: referenceList,
    attachmentMediaIncluded: z.literal(false),
  })
  .strict();
export function parseLocalState(value: string, validIds: string[]) {
  if (value.length > 4_000_000) throw new Error("匯入檔案超過 4 MB。");
  const state = stateSchema.parse(JSON.parse(value));
  const valid = new Set(validIds);
  for (const v of [
    ...state.preferences.favorites,
    ...state.preferences.selections,
    ...state.references.flatMap((r) => r.relationships),
  ])
    if (!valid.has(v)) throw new Error(`未知風格 ID：${v}`);
  if (
    new Set(state.preferences.selections).size !==
    state.preferences.selections.length
  )
    throw new Error("選取風格不能重複。");
  return { preferences: state.preferences, references: state.references };
}
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("remotion-atlas.attachments", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
async function dbAction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction("files", mode);
    let result: T;
    let requestError: DOMException | null = null;
    let req: IDBRequest<T>;
    try {
      req = action(tx.objectStore("files"));
    } catch (error) {
      db.close();
      reject(error);
      return;
    }
    req.onsuccess = () => {
      result = req.result;
    };
    req.onerror = () => {
      requestError = req.error;
    };
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    const failure = () => {
      db.close();
      reject(
        requestError ||
          tx.error ||
          new Error("附件儲存中斷，請確認瀏覽器允許本機儲存。"),
      );
    };
    tx.onerror = failure;
    tx.onabort = failure;
  });
}
type StoredAttachment = { bytes: ArrayBuffer; type: string; size: number };
export async function putAttachment(key: string, file: File) {
  if (
    file.size > 52428800 ||
    ![
      "image/png",
      "image/jpeg",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ].includes(file.type)
  )
    throw new Error("只支援 50 MB 以下的圖片或影片。");
  const record: StoredAttachment = {
    bytes: await file.arrayBuffer(),
    type: file.type,
    size: file.size,
  };
  await dbAction("readwrite", (store) => store.put(record, key));
}
export async function getAttachment(key: string): Promise<Blob | undefined> {
  const stored = await dbAction<StoredAttachment | Blob | undefined>(
    "readonly",
    (store) => store.get(key),
  );
  if (!stored) return undefined;
  if (stored instanceof Blob) return stored;
  if (!(stored.bytes instanceof ArrayBuffer) || typeof stored.type !== "string")
    throw new Error("附件資料格式不正確。");
  return new Blob([stored.bytes], { type: stored.type });
}
export async function deleteAttachment(key: string) {
  await dbAction("readwrite", (store) => store.delete(key));
}
