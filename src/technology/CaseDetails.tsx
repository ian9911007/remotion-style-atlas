import type { CaseDefinition } from "../../technology-runtime/src/types";
import {
  caseEvidence,
  technologyCatalog,
  technologyName,
  technologyCases,
} from "./registry";
export function CaseDetails({ definition: c }: { definition: CaseDefinition }) {
  const e = caseEvidence(c.id);
  const rows: [string, string][] = [
    ["展示能力", c.capabilities.join(" · ")],
    ["主要技術", technologyName(c.primary)],
    [
      "支援工具",
      (c.supporting ?? [])
        .map((s) => `${technologyName(s.id)} — ${s.role}`)
        .join("；") || "無",
    ],
    ["採用理由", c.why],
    ["美術方向", `${c.direction}：${c.rationale}`],
    ["互動方式", c.instructions],
    ["適用", c.uses.join("；")],
    ["不適用", c.nonUses.join("；")],
    [
      "執行需求",
      `${c.renderer} · ${c.dependencies.join(", ") || "原生瀏覽器 API"}`,
    ],
    ["響應式", "960×540 等比縮放；手機保留控制列，直式構圖尚未設計。"],
    ["已知限制", c.limitations.join("；")],
    ["備援", c.fallback],
    [
      "無障礙與低動態",
      "尊重系統低動態偏好；播放需主動啟動，可暫停與停止；Canvas 內容以本頁文字補充。",
    ],
    ["影片適用性", `${c.video} · ${e.video ?? "尚未驗證逐幀輸出"}`],
    [
      "效能證據",
      e.performance
        ? `${e.performance.status} · ${e.performance.context}`
        : "尚未量測；不推論跨裝置效能。",
    ],
    [
      "驗證狀態",
      `${e.status} · ${e.runtime?.join("；") ?? "尚未執行瀏覽器驗證"}`,
    ],
    ["視覺審查", e.visual ?? "尚未審查"],
    ["來源", `technology-runtime/src/${c.module} → ${c.variant}`],
    [
      "素材與授權",
      c.assets.length
        ? c.assets
            .map((a) => `${a.path} · ${a.license} · ${a.attribution}`)
            .join("；")
        : "原創程序化幾何／合成資料；未使用第三方圖像、字型或地圖服務。",
    ],
  ];
  return (
    <section className="case-details">
      <h3>技術案例規格</h3>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {c.comparison && (
        <section>
          <h3>相同內容的受控比較</h3>
          <p>
            共用原創向量素材、960×540 畫面、30 fps
            素材時基與主畫廊時間控制。Lottie 案例以 JavaScript／SVG
            播放；dotLottie 案例讀取壓縮封裝並以 WASM／Canvas
            播放。兩者都需要文字替代與輸出重驗，這份比較沒有速度優劣或記憶體用量的量測結論。
          </p>
          <p>
            Lottie 的整合重點是 JSON、SVG 節點及 destroy；dotLottie 另需封裝
            manifest、WASM 就緒與
            destroy。下載成本取決於素材、執行器與快取；更換版本時要重驗各自支援的匯出特性。
          </p>
          {technologyCases
            .filter(
              (other) => other.comparison === c.comparison && other.id !== c.id,
            )
            .map((other) => (
              <a key={other.id} href={`#/style/${other.id}`}>
                {other.id} · {other.title}
              </a>
            ))}
        </section>
      )}
      <h3>可重用技術參考</h3>
      <p>
        Skill-Web-SVG-Animation-Architect → effect-first 路由 → 對應 family
        reference
      </p>
      {technologyCatalog
        .filter((t) =>
          [c.primary, ...(c.supporting ?? []).map((s) => s.id)].includes(t.id),
        )
        .map((t) => (
          <p key={t.id}>
            <a href={t.sources[0]} target="_blank" rel="noopener noreferrer">
              {t.name} 官方文件 ↗
            </a>
            <br />
            <small>
              {t.id} · references/technologies/{t.reference}
            </small>
          </p>
        ))}
    </section>
  );
}
