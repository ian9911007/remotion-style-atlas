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
      `${style.media.depth}；React 19.2.0（本工作區版本）；${style.dependencies.join("；")}`,
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
      "影片提供原生播放控制與海報圖；製作新版本時提供文字摘要、可暫停預覽，並依專案需求製作低動態替代。",
    ],
    [
      "影片適用性",
      "適合 Remotion 逐影格輸出；案例提示及預覽存在不代表其他瀏覽器或裝置的輸出結果已驗證。",
    ],
    [
      "素材與授權",
      `${style.assets.length ? `需要素材：${style.assets.join("；")}。` : "不需要外部素材。"} ${style.provenance.notes} 替換素材前仍須確認授權與來源。`,
    ],
    [
      "已知限制與備援",
      `${style.limitations.join("；")} 備援：${style.avoid.join("；") || "缺少素材時保留構圖規則並使用已授權素材。"}`,
    ],
    [
      "驗證狀態",
      `${style.review.visual && style.review.motion ? "已記錄視覺與動態檢視" : "視覺或動態未完整檢視"}；${style.review.notes} 效能、行動裝置相容性及跨瀏覽器狀態未逐案量測。`,
    ],
    [
      "技術參考",
      "Remotion 官方文件與 Skill-Remotion-Video-Builder；依任務載入影格、標記、字型或渲染相關參考。",
    ],
    [
      "來源",
      `src/remotion/recipes.tsx → ${style.recipe}；案例規格及合成影格請分開檢視。`,
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
    </section>
  );
}
