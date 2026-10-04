/** Created: 2026-10-05. Roadmap and two distinct parallax interaction models. */
import type { CaseDefinition } from "./types";
const common = {
  assets: [],
  video: "unverified",
  complexity: "medium",
  fallback: "即時執行器無法啟動時保留海報與案例說明，明示互動功能不可用。",
  editable: [
    "Replace original synthetic labels, product content, and geometric details with production-approved material.",
    "Choose a new palette, typography, layer spacing, and timing without inheriting the legacy illustration collection.",
  ],
  adaptation:
    "Preserve one authoritative progress source and explicit handoff to user input. Honor reduced motion, supply keyboard alternatives, and dispose all animations and input handlers on close. Browser execution is not deterministic video verification.",
} satisfies Partial<CaseDefinition>;
export const supplementCases: CaseDefinition[] = [
  {
    ...common,
    id: "SA-151",
    title: "階段式依存路線圖",
    englishTitle: "Staged dependency roadmap",
    summary:
      "以資訊圖表呈現四階段路線圖、雙軌里程碑、週序示意與前置依存線，並連動目前階段詳情。",
    primary: "d3",
    capabilities: ["dependency-roadmap", "staged-graph-reveal"],
    module: "supplement-diagram.ts",
    variant: "roadmap",
    renderer: "SVG",
    interaction: ["time", "state", "keyboard", "touch"],
    direction: "工程規劃的編輯式路線圖",
    rationale:
      "垂直階段帶區分進程，雙軌節點保留平行工作，曲線只表示前置依存而不冒充工期。",
    why: "D3 scalePoint、keyed joins 與 linkHorizontal 可將明確依存資料映射成可調整的 SVG 路線圖。",
    uses: ["技術導入路線圖", "階段式流程與依存關係說明"],
    nonUses: ["未提供真實排程卻要推算交期", "只有線性文字清單的簡單步驟"],
    instructions:
      "播放依序揭示階段；按「上一階段」或「下一階段」接管進度，「自動展示」交回主時鐘。",
    limitations: [
      "節點與依存為原創示意，不代表正式專案計畫、關鍵路徑或工期。",
      "圖形使用固定四階段版面；大量節點需要重新設計佈局。",
    ],
    visual: {
      background: "#f4f3ed",
      foreground: "#223b48",
      accent: "#a25838",
      font: "Arial, sans-serif",
    },
    dependencies: ["d3"],
    locked: [
      "Use actual D3 keyed SVG joins, a stage scale, and linkHorizontal dependency paths.",
      "Keep stable milestone IDs and distinguish prerequisite edges from duration or calendar data.",
      "Drive path reveal and milestone emphasis from one host progress value with explicit button takeover.",
    ],
  },
  {
    ...common,
    id: "SA-152",
    durationSeconds: 4,
    title: "建築剖面捲動視差",
    englishTitle: "Architectural section scroll parallax",
    summary:
      "滿版木構建築剖面呈現玻璃窗框、梁柱接點、地坪與室內配置；捲動時僅中央樓板沿垂直軸分離，外框架保持定位。",
    primary: "waapi",
    capabilities: ["scroll-parallax", "multi-layer-depth"],
    module: "supplement-parallax.ts",
    variant: "section",
    renderer: "DOM + SVG",
    interaction: ["scroll", "time", "keyboard", "touch"],
    direction: "滿版木構建築剖面",
    rationale:
      "取消標題框與旁側說明，讓建築佔滿畫面；木紋、混凝土剖面、接點與玻璃層次呈現材料關係，只有中央樓板分離，基地和外框架維持固定。",
    why: "Web Animations API 可建立可暫停、可定位的多層 transform 動畫，再由單一捲動或主時鐘進度控制 currentTime。",
    uses: ["空間分層敘事", "建築或技術結構的網頁章節"],
    nonUses: [
      "需要真實相機、遮擋與光照的 3D 模型",
      "低動態需求下仍強制大幅視差",
    ],
    instructions:
      "直接在建築畫面捲動或觸控滑動；中央樓板分離時，基地與木構外框固定。聚焦後用方向鍵、Page Down、Home 或 End。手動接管後，右下「自動」可交回主時鐘，或使用外部重設控制。",
    limitations: [
      "這是原創合成 SVG 建築示意，無真實建築資料、物理尺度或工程驗證；不作為可量測的設計模型。",
      "低動態模式保持各層固定；正式觸控裝置與影片回放仍需各自驗證。",
    ],
    visual: {
      background: "#efeee6",
      foreground: "#29423e",
      accent: "#a9583b",
      font: "Arial, sans-serif",
    },
    dependencies: [],
    editable: [
      "Adapt the shared building footprint, window bays, joinery, interior plan and timber/concrete palette without introducing unrelated display text.",
      "Tune the common projection and the central-slab displacement together; keep the foundation and all outer timber-frame passes stationary, recheck bounds at every progress endpoint, and preserve the four-second cosine return cycle.",
    ],
    locked: [
      "Create paused Web Animations API transforms on the four logical paint layers. Paint rear frame behind the slab and front columns/roof beams above it; keep foundation, rear-frame and front-frame transforms at zero, and move only the central slab along the shared vertical axis.",
      "Set every Animation.currentTime from one normalized progress source; use one bounded displacement for the central slab and no displacement for the outer frame.",
      "Provide a transparent full-stage native scroll region with keyboard scrolling; manual input takes ownership and a compact resume control returns ownership to the host.",
      "Generate site, frame, and slab from one shared isometric footprint; change depth only on the common vertical axis. Use the complete 960 by 540 stage without a header, explanatory sidebar or chapter text. Keep the small ground guide fixed and bound every material detail and shadow at every progress value.",
    ],
  },
  {
    ...common,
    id: "SA-153",
    title: "指標驅動多平面規格卡",
    englishTitle: "Pointer-driven layered specification card",
    summary:
      "滿版精密產品構圖以背景網格、內容平面與前景標籤呈現 CSS 2.5D 指標視差；觸控或方向鍵可即時改變視角。",
    primary: "css-transitions",
    capabilities: ["pointer-parallax", "layered-perspective-interface"],
    module: "supplement-parallax.ts",
    variant: "planes",
    renderer: "DOM / CSS 2.5D",
    interaction: ["pointer", "touch", "keyboard", "state", "time"],
    direction: "滿版精密產品展示",
    rationale:
      "產品卡置於滿版紙材與定位網格上，透過不同深度的鏡片、內容與標籤讀出層次；移除共用標題欄與旁側註解，讓產品成為唯一主視覺。",
    why: "少量 DOM 平面的指標傾斜可用 CSS perspective、translateZ 與 transitions 完成，無須載入真正 3D 引擎。",
    uses: ["產品規格與功能導覽", "少量多層介面資訊"],
    nonUses: ["真實鏡頭或光學模擬", "需要大量材質、動態光照與三維碰撞的場景"],
    instructions:
      "在滿版案例上移動指標或觸控拖曳；聚焦案例後使用方向鍵傾斜、Home 歸位，也可使用右上角按鈕。",
    limitations: [
      "CSS 2.5D 透視不是 WebGL 或真正 3D 模型；光學內容為原創概念示意。",
      "互動使用 CSS Transitions 的瀏覽器時間；自動示範由主時鐘定位，尚未驗證正式影片輸出。",
      "低動態模式保持平面固定並更新控制讀值。",
    ],
    visual: {
      background: "#f4efe9",
      foreground: "#362e31",
      accent: "#8e534a",
      font: "Arial, sans-serif",
    },
    dependencies: [],
    locked: [
      "Use real CSS perspective and transform-style: preserve-3d with independently offset translateZ planes.",
      "Use CSS Transitions for pointer, touch, and keyboard state changes; host-driven preview seeking must not start an independent timer.",
      "Normalize pointer coordinates against the scaled element bounding box and provide directional buttons plus Home reset.",
      "Explicitly label this as a 2.5D interface and preserve content readability across the tilt range.",
      "Use the complete 960 by 540 case canvas for the product scene; remove the shared header, sidebar callouts and caption rail.",
    ],
  },
];
