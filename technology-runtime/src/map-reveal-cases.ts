/** Created: 2026-10-04. Geographic reveal with one locked origin and host time. */
import type { CaseDefinition } from "./types";

export const mapRevealCases: CaseDefinition[] = [
  {
    id: "SA-156",
    title: "滿版真實世界地圖：從臺北拉遠再聚焦",
    englishTitle: "Taipei to world and back",
    summary:
      "滿版真實世界地圖動畫：沿細緻海岸線從臺北區域拉遠，展開城市地圖連線，再以同一地理鏡頭回到臺北；全程由八秒時間軸控制。",
    primary: "maplibre",
    supporting: [
      {
        id: "d3",
        role: "Great-circle route interpolation and geographic dateline clipping.",
      },
    ],
    capabilities: [
      "geographic-zoom-reveal",
      "local-to-world-camera",
      "locked-origin-return",
      "full-bleed-cartography",
    ],
    module: "maps-reveal.ts",
    variant: "taipei-world-return",
    renderer: "WebGL",
    durationSeconds: 8,
    interaction: ["time", "keyboard"],
    direction: "滿版海岸線與地理鏡頭敘事",
    rationale:
      "讓真實國界、島嶼與細緻臺灣海岸線佔滿畫面，以地理鏡頭的尺度改變建立敘事；只保留城市標籤與角落來源標示。",
    why: "MapLibre 真正改變地理相機中心與縮放層級；D3 支援球面路徑及日期線裁切，採用本機真實地理輪廓。",
    uses: ["品牌據點到全球布局的開場", "地理起點與國際連結的敘事揭示"],
    nonUses: [
      "街道、門牌或即時導航",
      "需要最新國界與即時航班",
      "不允許長距離鏡頭移動且無低動態替代時",
    ],
    instructions:
      "使用畫廊外側的播放、暫停與時間控制，觀看臺北區域 → 世界 → 返回臺北。案例內保持滿版地圖；低動態偏好固定顯示世界全景。",
    limitations: [
      "Natural Earth 4.1.0 是歷史概化國界資料：世界使用 1:50m，臺灣替換為 1:10m；近景仍是區域輪廓，不含街道、建築或地形。",
      "原點使用 Natural Earth 的臺北城市標籤座標，不是機場；其他城市連線為示意。",
      "單一 Chrome 中的影格重播不等於跨 GPU、Safari 或實體觸控裝置驗證。",
    ],
    fallback:
      "無法載入地理資料或啟動 WebGL 時，保留海報與地理來源說明，不顯示假地圖。",
    visual: {
      background: "#d5e6e8",
      foreground: "#25444b",
      accent: "#a7643e",
      font: "Arial, sans-serif",
    },
    locked: [
      "Use actual MapLibre camera center and zoom changes, driven solely by one eight-second host timeline.",
      "Keep the Taipei origin coordinates locked across the regional opening and closing; use a world reveal between them.",
      "Render local Natural Earth 1:50m world country geometry with the Taiwan feature replaced by its 1:10m counterpart, preserving coastlines and dateline clipping. This is regional cartography, not a street map.",
      "Fill the complete case viewport with the map. Do not add a sidebar, header, inset map, timeline panel or case-level controls; keep only necessary city labels and compact source attribution.",
      "Disable independent camera easing and style transitions; await renderer idle after time changes before capture.",
    ],
    editable: [
      "Replace the locked hero location and connections only with verified geographic coordinates, updating geographic labels and camera framing together.",
      "Adjust palette, typography, route content and phase durations while preserving local-to-world-to-same-origin continuity.",
    ],
    adaptation:
      "Provide explicit time input and synchronous phase state. Wait for local geometry and fonts, stop independent animation, and await map idle after each seek. Reduced motion shows a fixed world overview. Keep playback and seeking in the host controls, outside the full-bleed map. Verify forward/reverse seek, repeatable frames and selected export settings before deterministic video use.",
    dependencies: ["maplibre-gl", "d3"],
    assets: [
      {
        path: "technology-assets/maps/reveal-provenance.json",
        source:
          "Pinned source hashes, mixed-scale geometry conversion and historical dataset limitations",
        license: "Natural Earth public domain; world-atlas ISC",
        attribution:
          "Natural Earth; world-atlas redistribution by Mike Bostock (ISC).",
      },
      {
        path: "technology-assets/maps/reveal-countries.geojson",
        source:
          "Natural Earth 4.1.0 Admin 0 1:50m world with the Taiwan feature replaced by 1:10m via pinned world-atlas 2.0.2; scripts/prepare-region-map.py",
        license: "Natural Earth public domain; world-atlas ISC",
        attribution:
          "Made with Natural Earth. world-atlas redistribution by Mike Bostock (ISC).",
      },
      {
        path: "technology-assets/maps/provenance.json",
        source:
          "Pinned dataset provenance and Natural Earth 4.1.0 populated-place coordinates",
        license: "Natural Earth public domain; world-atlas ISC",
        attribution:
          "Natural Earth; world-atlas. City connections are original illustrative data.",
      },
    ],
    video: "adapter-required",
    complexity: "high",
  },
];
