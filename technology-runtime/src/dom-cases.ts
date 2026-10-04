import type { CaseDefinition } from "./types";
type Entry = [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
const entries: Entry[] = [
  [
    101,
    "按需展開的材料目錄",
    "Material disclosure",
    "css-transitions",
    "native.ts",
    "transition",
    "layout-disclosure",
    "極簡編輯介面",
    "利用可變高度讓補充資訊自然進入閱讀順序，保留原生按鈕語意。",
  ],
  [
    102,
    "軌道與呼吸週期",
    "Orbital timing",
    "css-keyframes",
    "native.ts",
    "keyframes",
    "phase-offset",
    "科學圖誌",
    "以同心軌道區分週期與相位，避免以複雜引擎描述單純重複動作。",
  ],
  [
    103,
    "原生文字時間軸",
    "Native type timeline",
    "waapi",
    "native.ts",
    "reveal",
    "seekable-timeline",
    "瑞士字體設計",
    "用可任意定位的字體揭示凸顯 Animation.currentTime 的控制能力。",
  ],
  [
    104,
    "指標控制的材質掃描",
    "Pointer driven material scan",
    "waapi",
    "native.ts",
    "scrub",
    "pointer-scrubbing",
    "工業材質展示",
    "指標位置直接定位原生動畫的裁切範圍，讓雙層材質的關係可被操作。",
  ],
  [
    105,
    "高度敘事捲動尺",
    "Altitude scroll narrative",
    "scroll-timeline",
    "native.ts",
    "scroll",
    "scroll-progress",
    "戶外資訊設計",
    "進度直接跟隨局部捲軸；地景符號作為閱讀位置參考。",
  ],
  [
    106,
    "編輯目錄版面交接",
    "Editorial view handoff",
    "view-transitions",
    "native.ts",
    "view",
    "snapshot-transition",
    "雙色出版物",
    "由瀏覽器快照連接兩個真實版面狀態，保留可操作的按鈕。",
  ],
  [
    107,
    "減色光學研究",
    "Subtractive optical study",
    "canvas2d",
    "native.ts",
    "composite",
    "blend-compositing",
    "印刷色彩研究",
    "三個色面實際以 multiply 混合，讓交疊區直接說明合成模式。",
  ],
  [
    108,
    "背景執行緒向量場",
    "Worker vector field",
    "offscreen-canvas",
    "native.ts",
    "worker",
    "worker-rendering",
    "計算科學圖誌",
    "密集方向場在 Worker 內繪製；主執行緒保留播放與互動控制。",
  ],
  [
    109,
    "逐字遮罩編舞",
    "Masked type choreography",
    "gsap",
    "dom-gsap.ts",
    "mask",
    "typography-masking",
    "高對比編輯排版",
    "逐字位移與底線不同步入場，以明確主從關係展示時間軸。",
  ],
  [
    110,
    "產品分層組裝",
    "Product assembly sequence",
    "gsap",
    "dom-gsap.ts",
    "assembly",
    "multi-layer-timeline",
    "淺色產品簡報",
    "瓶蓋、容器與註解分別編排；此案例是 DOM 產品示意，不宣稱真實 3D。",
  ],
  [
    111,
    "三章地景敘事",
    "Three chapter landscape",
    "gsap",
    "dom-gsap.ts",
    "scroll",
    "scroll-choreography",
    "地景出版設計",
    "章節編號與進度線共享局部捲軸，Lenis 支援 ScrollTrigger 的捲動輸入。",
  ],
  [
    112,
    "內容驅動的共享空間",
    "Content aware layout",
    "motion",
    "dom-motion.tsx",
    "layout",
    "shared-layout",
    "安靜的產品介面",
    "卡片按選取內容重新分配寬度，呈現 React layout 動畫的真實用途。",
  ],
  [
    113,
    "有邊界的拖曳彈簧",
    "Bounded gesture spring",
    "motion",
    "dom-motion.tsx",
    "gesture",
    "drag-spring",
    "觸控產品介面",
    "可拖曳卡片的邊界與回彈讓直接操作的規則可見。",
  ],
  [
    114,
    "訊號路徑描繪",
    "Signal path drawing",
    "animejs",
    "dom-anime.ts",
    "draw",
    "svg-drawing",
    "電路資訊圖",
    "兩條路徑有不同起始時刻，實際使用 SVG drawable 控制描繪範圍。",
  ],
  [
    115,
    "由中心擴散的節奏場",
    "Distributed grid timing",
    "animejs",
    "dom-anime.ts",
    "grid",
    "grid-stagger",
    "幾何平面設計",
    "從中心與尾端分別展開、收束，呈現網格 stagger 的位置語意。",
  ],
  [
    116,
    "參數化柱列立面",
    "Parametric elevation",
    "svgjs",
    "vector.ts",
    "construct",
    "vector-construction",
    "建築技術圖",
    "柱列高度與屋頂曲線可獨立更新，構造保持 SVG 可檢查節點。",
  ],
  [
    117,
    "移動的向量取樣窗",
    "Vector sampling lens",
    "svgjs",
    "vector.ts",
    "clip",
    "vector-clipping",
    "光學平面研究",
    "真實 clipPath 切出移動觀察窗，展示座標與分組轉換。",
  ],
  [
    118,
    "剛性到有機的形變",
    "Rigid to organic form",
    "svgjs",
    "vector.ts",
    "morph",
    "path-interpolation",
    "抽象形態研究",
    "異拓撲封閉路徑以取樣插值過渡；這是有界形變，不宣稱通用形狀完美對應。",
  ],
  [
    119,
    "有手繪質感的流程圖",
    "Rough process structure",
    "roughjs",
    "vector.ts",
    "rough-diagram",
    "seeded-diagram",
    "白板技術說明",
    "有控制的手繪線條區分流程節點與連線，固定 seed 保持重播一致。",
  ],
  [
    120,
    "估計區間的圖形語言",
    "Estimate range language",
    "roughjs",
    "vector.ts",
    "rough-range",
    "uncertainty-encoding",
    "研究筆記",
    "交叉線紋與區間線表達示意估計；數值為原創示意，並非真實統計結論。",
  ],
  [
    121,
    "可選取的平面構圖",
    "Selectable spatial composition",
    "konva",
    "editor-konva.ts",
    "transform",
    "selection-transform",
    "平面設計工作台",
    "實際選取、拖曳、旋轉與縮放節點，將編輯互動與純播放分開。",
  ],
  [
    122,
    "畫布註記圖層",
    "Canvas annotation layer",
    "konva",
    "editor-konva.ts",
    "draw",
    "pointer-drawing",
    "分析註記工作台",
    "以 pointer 筆跡疊加固定線圖，保留圖層與事件命中關係。",
  ],
  [
    123,
    "可序列化的設計物件",
    "Serializable design objects",
    "fabricjs",
    "editor-fabric.ts",
    "objects",
    "object-serialization",
    "物件式設計工作台",
    "Canvas 中的物件可選取與變形，序列化按鈕讀取真實物件模型。",
  ],
  [
    124,
    "筆刷與保留向量",
    "Freehand retained vectors",
    "fabricjs",
    "editor-fabric.ts",
    "draw",
    "freehand-brush",
    "混合向量畫板",
    "自由筆畫與既有物件共同存在，清除筆跡只移除畫筆產生的 Path。",
  ],
  [
    129,
    "相位空間的軌跡",
    "Phase space traces",
    "canvas2d",
    "native.ts",
    "trails",
    "analytic-trails",
    "訊號科學視覺",
    "軌跡由指定時間重新計算，不依賴前一畫格的殘影緩衝。",
  ],
];
const visuals: Record<string, CaseDefinition["visual"]> = {
  native: {
    background: "#f0e9df",
    foreground: "#302c28",
    accent: "#b65a38",
    font: "system-ui, sans-serif",
  },
  gsap: {
    background: "#e9ede6",
    foreground: "#21342f",
    accent: "#d33325",
    font: "Arial, sans-serif",
  },
  motion: {
    background: "#edf0e9",
    foreground: "#203a32",
    accent: "#164b42",
    font: "system-ui, sans-serif",
  },
  animejs: {
    background: "#f1eee5",
    foreground: "#313b35",
    accent: "#dc522f",
    font: "system-ui, sans-serif",
  },
};
export const domCases: CaseDefinition[] = entries.map(
  ([
    n,
    title,
    englishTitle,
    primary,
    module,
    variant,
    capability,
    direction,
    rationale,
  ]) => ({
    id: `SA-${n}`,
    title,
    englishTitle,
    summary: rationale,
    primary,
    module,
    variant,
    capabilities: [capability],
    renderer:
      primary === "offscreen-canvas"
        ? "Canvas 2D / Worker"
        : primary === "canvas2d" || ["konva", "fabricjs"].includes(primary)
          ? "Canvas 2D"
          : ["svgjs", "flubber", "roughjs"].includes(primary)
            ? "SVG"
            : "DOM / SVG",
    interaction:
      variant === "scroll"
        ? ["scroll", "keyboard"]
        : ["konva", "fabricjs"].includes(primary)
          ? ["pointer", "touch", "keyboard"]
          : primary === "motion" || variant === "scrub"
            ? ["state", "pointer", "touch", "keyboard"]
            : ["time", "keyboard"],
    direction,
    rationale,
    why: rationale,
    uses: [
      ["konva", "fabricjs"].includes(primary)
        ? "需要保留物件或笔跡的互動編輯"
        : "需要此能力與清楚時間控制的網頁內容",
    ],
    nonUses: [
      ["konva", "fabricjs"].includes(primary)
        ? "只有靜態圖形且不需物件編輯"
        : "無需動畫的文字內容或缺少可讀性替代的核心資訊",
    ],
    instructions:
      variant === "scroll"
        ? "在案例內捲動或使用方向鍵；輸入後由使用者控制進度。"
        : ["konva", "fabricjs"].includes(primary)
          ? "使用畫布進行選取、拖曳或畫線；可用重播重新建立初始狀態。"
          : primary === "motion"
            ? "點選或拖曳案例內控制；使用鍵盤 Tab、Enter 或方向鍵。"
            : "播放時間軸或拖曳下方時間控制，觀察建立、過渡與結束狀態。",
    limitations: [
      primary === "view-transitions" || primary === "scroll-timeline"
        ? "需要實際瀏覽器提供原生 API；不以 CSS 模擬冒充。"
        : "僅固定 960×540 設計座標等比縮放；直式版需重新構圖。",
      "瀏覽器自動化通過不等於 iPhone 或實機 Safari 驗證。",
    ],
    fallback: "保留海報、已錄製預覽與可複製規格；不啟動替代引擎。",
    visual: visuals[primary] ?? visuals.native,
    locked: [
      `Demonstrate ${capability} using ${primary}.`,
      `Retain the real ${variant} implementation and observable interaction semantics.`,
    ],
    editable: [
      "Replace text, colors, labels and original demonstration shapes.",
      "Adapt duration, density and layout while retaining readable focus and interaction targets.",
    ],
    adaptation:
      "Inspect existing dependencies first. Use the declared runtime for reproduction; document any simpler adaptation as an adaptation, not the same technology case. Keep the case root isolated and the host as the only time owner.",
    dependencies:
      variant === "morph"
        ? ["@svgdotjs/svg.js", "flubber"]
        : primary === "gsap"
          ? [
              "gsap",
              ...(variant === "mask"
                ? ["split-type"]
                : variant === "scroll"
                  ? ["lenis"]
                  : []),
            ]
          : ((
              {
                motion: ["motion", "react", "react-dom"],
                animejs: ["animejs"],
                svgjs: ["@svgdotjs/svg.js"],
                flubber: ["flubber", "@svgdotjs/svg.js"],
                roughjs: ["roughjs", "@svgdotjs/svg.js"],
                konva: ["konva"],
                fabricjs: ["fabric"],
              } as Record<string, string[]>
            )[primary] ?? []),
    supporting:
      variant === "morph"
        ? [
            {
              id: "flubber",
              role: "Closed-path interpolation supporting the SVG renderer",
            },
          ]
        : primary === "gsap" && variant === "mask"
          ? [
              {
                id: "splittype",
                role: "Character segmentation after font readiness",
              },
            ]
          : primary === "gsap" && variant === "scroll"
            ? [
                {
                  id: "scrolltrigger",
                  role: "Local scroll-to-timeline coordination",
                },
                {
                  id: "lenis",
                  role: "Local scroll smoothing, driven by the host clock",
                },
              ]
            : ["flubber", "roughjs"].includes(primary)
              ? [{ id: "svgjs", role: "Retained SVG construction" }]
              : primary === "offscreen-canvas"
                ? [{ id: "canvas2d", role: "Worker drawing context" }]
                : [],
    assets: [],
    video: [
      "konva",
      "fabricjs",
      "motion",
      "view-transitions",
      "css-transitions",
    ].includes(primary)
      ? "recorded-live"
      : variant === "scroll"
        ? "adapter-required"
        : "frame-driven",
    complexity: ["konva", "fabricjs", "motion"].includes(primary)
      ? "medium"
      : "low",
  }),
);
