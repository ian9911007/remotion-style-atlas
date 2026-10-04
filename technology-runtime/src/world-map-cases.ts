/** Created: 2026-10-04. Real geographic fixtures, illustrative connections. */
import type { CaseDefinition } from "./types";

const assets: CaseDefinition["assets"] = [
  {
    path: "technology-assets/maps/world-countries.geojson",
    source:
      "Natural Earth 4.1.0 Admin 0 1:110m, redistributed in world-atlas 2.0.2; rebuilt by scripts/prepare-world-map.py",
    license: "Natural Earth public domain; world-atlas ISC",
    attribution:
      "Made with Natural Earth. world-atlas redistribution by Mike Bostock (ISC).",
  },
  {
    path: "technology-assets/maps/provenance.json",
    source:
      "Pinned source URLs, hashes, ISC notice and five Natural Earth 4.1.0 populated-place coordinates",
    license: "Natural Earth public domain; world-atlas ISC",
    attribution:
      "Natural Earth; world-atlas. Connections are original illustrative data.",
  },
];
const common = {
  module: "maps-world.ts",
  durationSeconds: 6,
  interaction: ["time", "pointer", "keyboard", "touch", "state"],
  uses: ["國際據點與地理關係說明", "具真實地理背景的編輯式地圖敘事"],
  nonUses: [
    "即時航班、交通或導航",
    "最新行政邊界或領土立場判定",
    "高精度地方道路與地形分析",
  ],
  limitations: [
    "Natural Earth 4.1.0 是歷史小比例尺資料，不代表最新國界；保留來源資料的邊界表示。",
    "城市點位是 Natural Earth 的城市標籤位置，不是機場；連線與播放節奏為原創示意。",
    "尚未驗證實機 Safari、實體觸控裝置或跨 GPU 確定性影片。",
  ],
  fallback:
    "即時執行失敗時保留海報、真實地理資料來源及示意航線說明，不偽裝成已載入地圖。",
  editable: [
    "Replace illustrative city connections with verified production data; preserve longitude-latitude coordinate order and geographic semantics.",
    "Adjust geographic framing, labels, branding, palette and timing independently of the original illustration collection.",
  ],
  adaptation:
    "Use one host-owned time source. Load local GeoJSON and source provenance before rendering. Preserve attribution and dataset age; seed any added randomness. Test clipping, dateline crossings, reverse seeking and asset readiness before making deterministic export claims.",
  assets,
  video: "unverified" as const,
  complexity: "high" as const,
};
export const worldMapCases: CaseDefinition[] = [
  {
    ...common,
    id: "SA-154",
    title: "真實世界地圖與城市連線",
    englishTitle: "World city connection atlas",
    summary:
      "滿版真實世界底圖上，從臺北逐步描繪四條大圓地圖連線；選取城市可切換地理鏡頭，航線均為示意。",
    primary: "maplibre",
    supporting: [
      {
        id: "d3",
        role: "Great-circle interpolation, geographic distances and graticule generation.",
      },
    ],
    variant: "world-routes",
    renderer: "WebGL",
    capabilities: [
      "real-world-cartography",
      "great-circle-routes",
      "geographic-camera",
      "city-selection",
    ],
    direction: "滿版世界地圖與地理連線",
    rationale:
      "世界底圖填滿整個案例畫布，霧藍海域、紙感陸地、國界線與銅色航線清楚分層；城市選取與縮放控制以輕量疊加方式留在地圖上，不保留側欄文字。",
    why: "MapLibre 的實際地理相機、GeoJSON 圖層與地點選取適合可平移縮放的世界據點展示；D3 只負責球面幾何。",
    instructions:
      "在滿版地圖上點選城市節點或底部城市按鈕；可拖曳平移、使用＋／−縮放，再以「世界總覽」恢復自動鏡頭。",
    dependencies: ["maplibre-gl", "d3"],
    visual: {
      background: "#edf1ee",
      foreground: "#223c49",
      accent: "#a95839",
      font: "Arial, sans-serif",
    },
    locked: [
      "Render actual bundled Natural Earth country geometry with MapLibre GeoJSON layers, local worker and no remote tiles.",
      "Use geographic great-circle interpolation for illustrative routes; split dateline crossings and retain real city coordinates.",
      "Keep source attribution, dated-boundary caveat, route legend and keyboard-equivalent city selection visible.",
      "Fill the complete 960 by 540 case canvas with the geographic map; use only compact in-map labels and controls, with no adjacent text panel or route-list sidebar.",
    ],
  },
  {
    ...common,
    id: "SA-155",
    title: "真實世界地圖的正投影地球",
    englishTitle: "Orthographic world and hidden hemisphere",
    summary:
      "D3 正投影將真實國界映成球面；拖曳與鍵盤旋轉時，城市、地圖連線與國界會在地平線正確裁切。",
    primary: "d3",
    variant: "world-globe",
    renderer: "SVG",
    capabilities: [
      "orthographic-projection",
      "spherical-clipping",
      "great-circle-routes",
      "globe-rotation",
    ],
    direction: "具地球層次的航線資訊展板",
    rationale:
      "深靛背景與霧金陸地呈現地球輪廓，海域漸層、大氣邊緣與細經緯線建立深度；資訊面板保留精確地理語意。",
    why: "D3 geoOrthographic 與 geoPath 在 SVG 中完成球面投影與背面裁切，這個幾何展示不需要額外 3D 引擎。",
    instructions:
      "拖曳地球旋轉，或聚焦球面後按方向鍵；Home 回到起點。「查看背面」可驗證城市與航線裁切；城市按鈕直接對準該地點。",
    dependencies: ["d3"],
    visual: {
      background: "#132936",
      foreground: "#f1ead9",
      accent: "#dbac73",
      font: "Arial, sans-serif",
    },
    locked: [
      "Use d3.geoOrthographic with an explicit 90-degree spherical clip and real bundled country polygons.",
      "Clip great-circle routes and hide back-facing city markers using geographic angular distance; never draw routes through the opaque globe.",
      "Preserve drag, keyboard rotation, static reduced-motion state, atmosphere hierarchy and visible dataset provenance.",
    ],
  },
];
