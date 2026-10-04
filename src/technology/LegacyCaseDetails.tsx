import type { StyleSpec } from "../catalog/schema";

/** Created: 2026-10-04. Shared technical-spec projection for original Remotion cases. */
export function LegacyCaseDetails({ style }: { style: StyleSpec }) {
  const rows: [string, string][] = [
    [
      "展示能力",
      [...style.tags, style.motion.language, ...style.media.effects]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "主要技術",
      "Remotion 4.0.530（本工作區版本）— 以 React 元件建立可逐影格控制的影片合成。",
    ],
    [
      "支援工具",
      "React — 合成介面與案例元件；SVG／CSS — 依該案例的視覺與版面規則呈現。",
    ],
    [
      "採用理由",
      "此案例的核心交付是可逐影格重現的動態影像；Remotion 適合需要時間定位、影格檢查與影片輸出的製作流程。",
    ],
    [
      "美術方向",
      `${style.family}；${style.description} 個案配色：背景 ${style.palette.background}、文字 ${style.palette.foreground}、重點 ${style.palette.accent}。`,
    ],
    [
      "互動方式",
      "預覽影片可播放、暫停與拖曳定位；案例本身是預先算好的影格序列，並非即時互動引擎。",
    ],
    [
      "適用",
      `${style.useCases.join("、")}；定時長影片、影格可重現的片頭或動態圖像。`,
    ],
    [
      "不適用",
      "需要即時使用者輸入、持續網路資料、互動式地圖或長時間即時模擬時，應改用合適的網頁執行期。",
    ],
    [
      "執行需求",
      `Remotion Player／React 19.2.0（本工作區版本）；${style.media.depth}；${style.dependencies.join("；") || "無額外執行期套件"}`,
    ],
    [
      "響應式",
      `目前案例構圖以 ${style.variants.map((v) => v.ratio).join("、")} 為準；其他比例需重新排版、輸出並檢查。`,
    ],
    [
      "版面與座標",
      `${style.layout.rules.join("；")} 安全留白至少 ${Math.round(style.layout.safeArea * 100)}%。`,
    ],
    [
      "字體與文字",
      `${style.typography.family}；${style.typography.rules.join("；")} 輸出前等待字型載入，並檢查繁體中文字形及實際換行。`,
    ],
    [
      "時間軸與生命週期",
      `以 ${style.preview.fps} fps 影格時間控制；按需求從影格重算，不以瀏覽器 wall-clock timer 推進；字型及素材就緒後再輸出。`,
    ],
    [
      "效能與資源",
      `預覽片 ${style.preview.galleryWidth}×${style.preview.galleryHeight}；詳情片 ${style.preview.width}×${style.preview.height}。資源耗用未逐案量測，不能據此推論其他裝置的即時播放效能。`,
    ],
    [
      "無障礙與低動態",
      "預覽提供原生播放、暫停與時間定位控制；頁面依低動態偏好暫停自動播放。案例以影片呈現，改作互動介面時須另提供文字替代與低動態方案。",
    ],
    [
      "影片適用性",
      "適合 Remotion 逐影格輸出；案例提示及預覽存在不代表其他瀏覽器或裝置的輸出結果已驗證。",
    ],
    [
      "素材與授權",
      `${style.assets.length ? `素材：${style.assets.join("；")}。` : "不需要外部素材。"} ${style.provenance.notes} 替換素材前仍須確認授權與來源。`,
    ],
    ["已知限制", style.limitations.join("；")],
    [
      "備援",
      style.avoid.join("；") ||
        "依原始構圖與素材規格重建；缺少授權素材時不要以來源不明檔案替代。",
    ],
    [
      "效能證據",
      "未逐案量測即時 FPS、記憶體或解碼成本；不以影片可播放推論其他裝置效能。",
    ],
    [
      "驗證狀態",
      `${style.status}；${style.review.visual && style.review.motion ? "已記錄視覺與動態審查" : "視覺或動態審查未完整"}；跨瀏覽器、實體行動裝置與逐案輸出未驗證。`,
    ],
    [
      "視覺審查",
      `${style.review.reviewer || "未記錄審查者"} · ${style.review.date || "日期未記錄"} · ${style.review.notes}`,
    ],
    [
      "來源",
      `src/remotion/Root.tsx → src/remotion/recipes.tsx → recipeRegistry["${style.recipe}"]；該 registry 由子登錄表及直接 recipe 組成。`,
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
      <h3>可重用技術參考</h3>
      <p>
        Skill-Remotion-Video-Builder → Remotion frame-driven
        合成、預覽與輸出路由
      </p>
      <p>
        <a
          href="https://www.remotion.dev/docs/the-fundamentals"
          target="_blank"
          rel="noopener noreferrer"
        >
          Remotion 官方文件 ↗
        </a>
        <br />
        <small>React composition · frame-based rendering</small>
      </p>
    </section>
  );
}
