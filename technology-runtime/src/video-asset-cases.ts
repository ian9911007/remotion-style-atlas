import type { CaseDefinition } from "./types";
const entries = [
  [
    125,
    "可定位的向量素材",
    "Seekable vector asset",
    "lottie",
    "asset-lottie.ts",
    "playback",
    "asset-playback",
  ],
  [
    126,
    "進度映射向量動作",
    "Progress mapped vector motion",
    "lottie",
    "asset-lottie.ts",
    "progress",
    "progress-control",
  ],
  [
    127,
    "壓縮封裝向量播放",
    "Packaged vector playback",
    "dotlottie",
    "asset-dotlottie.ts",
    "archive",
    "archive-playback",
  ],
  [
    128,
    "多動作封裝切換",
    "Multi animation archive",
    "dotlottie",
    "asset-dotlottie.ts",
    "segment",
    "multi-animation-archive",
  ],
  [
    191,
    "逐幀編輯字體短片",
    "Frame driven editorial",
    "remotion",
    "video-remotion.tsx",
    "editorial",
    "frame-composition",
  ],
  [
    192,
    "有次序的資料短片",
    "Frame driven data reveal",
    "remotion",
    "video-remotion.tsx",
    "data",
    "frame-stagger",
  ],
  [
    193,
    "請求生命週期解說",
    "Request lifecycle explainer",
    "motion-canvas",
    "video-motion-canvas.ts",
    "diagram",
    "generator-choreography",
  ],
  [
    194,
    "連續到離散的解說",
    "Sampling explainer",
    "motion-canvas",
    "video-motion-canvas.ts",
    "sampling",
    "signal-sequencing",
  ],
] as const;
export const videoAssetCases: CaseDefinition[] = entries.map(
  ([id, title, englishTitle, primary, module, variant, capability]) => ({
    id: `SA-${id}`,
    title,
    englishTitle,
    primary,
    module,
    variant,
    capabilities: [capability],
    summary:
      primary === "remotion"
        ? "React 構圖由影格決定狀態，任意定位時可還原相同畫面。"
        : primary === "motion-canvas"
          ? "用 generator 編排可見節點、連線與解說節奏，由同一影格時間控制。"
          : "以實際格式與播放器驗證素材載入、定位及播放控制。",
    renderer:
      primary === "remotion"
        ? "DOM / SVG"
        : primary === "lottie"
          ? "SVG"
          : "Canvas 2D",
    interaction: [
      "time",
      "keyboard",
      ...(primary === "lottie" || primary === "dotlottie"
        ? ["state", "touch"]
        : []),
    ],
    direction:
      primary === "remotion"
        ? variant === "editorial"
          ? "紅白編輯字體"
          : "淺色資料影片"
        : primary === "motion-canvas"
          ? "技術流程解說"
          : "抽象形狀與印刷配色",
    rationale:
      "以清楚形狀與留白讓時間控制與狀態差異可觀察，避免額外裝飾遮蔽技術行為。",
    why:
      primary === "remotion"
        ? "既有 React 影片工作流需要可逐幀定位的宣告式構圖。"
        : primary === "motion-canvas"
          ? "generator 與 signal 適合順序清楚的程式化技術解說。"
          : "用正式播放器讀取本機有效素材，保留其向量與時間資料。",
    uses:
      primary === "remotion" || primary === "motion-canvas"
        ? ["可重播的程式化影片與技術說明"]
        : ["產品介面的素材播放", "有明確素材製作流程的動作控制"],
    nonUses:
      primary === "remotion" || primary === "motion-canvas"
        ? ["只需一次 CSS hover 的介面"]
        : ["缺少有效素材卻以 CSS 假冒播放器的展示"],
    instructions: "播放或拖曳時間軸；有片段按鈕時可切換素材狀態。",
    limitations: [
      primary === "motion-canvas"
        ? "使用鎖定 3.17.2 的程式化 Scene2D／PlaybackManager 整合，未包含獨立編輯器 UI。"
        : "原創示意素材；沒有外部字型、圖片或聲音。",
      "實體 Safari、iPhone 與不同 GPU 的像素一致性仍需另驗。",
    ],
    fallback: "保留預覽、海報與實作規格；顯示素材或 runtime 載入失敗原因。",
    visual: {
      background:
        primary === "remotion" && variant === "editorial"
          ? "#d9472d"
          : "#eee9df",
      foreground: "#263c38",
      accent: "#b8543d",
      font: "Arial, sans-serif",
    },
    locked: [
      `Use the actual ${primary} runtime for ${capability}.`,
      "Use the host frame as the only playback authority and wait for asset readiness.",
    ],
    editable: [
      "Replace original geometric artwork or text with licensed production assets.",
      "Adapt palette, timing and content without changing the clock ownership.",
    ],
    adaptation:
      "Inspect the installed version before adapting. Do not claim that loading arbitrary vector files guarantees supported export features. Keep asset formats and source provenance explicit.",
    dependencies:
      primary === "remotion"
        ? ["remotion", "@remotion/player", "react", "react-dom"]
        : primary === "motion-canvas"
          ? ["@motion-canvas/core", "@motion-canvas/2d"]
          : primary === "lottie"
            ? ["lottie-web"]
            : ["@lottiefiles/dotlottie-web"],
    assets:
      primary === "lottie" || primary === "dotlottie"
        ? [
            {
              path: `technology-assets/vector/${primary === "lottie" && variant === "progress" ? "progress" : "capsules"}.${primary === "lottie" ? "json" : "lottie"}`,
              source:
                "Original programmatically authored vector geometry in this repository; not an After Effects export.",
              license: "Original project artwork",
              attribution: "Atlas original capsule sequence",
            },
          ]
        : [],
    video: "frame-driven",
    complexity: "medium",
    comparison:
      id === 125 || id === 127 ? "vector-capsule-playback" : undefined,
  }),
);
