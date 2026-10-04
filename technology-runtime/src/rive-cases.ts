/** Created: 2026-10-04. Asset-specific demonstration metadata, not generalized Skill content. */
import type { CaseDefinition } from "./types";
export const riveCases: CaseDefinition[] = [
  {
    id: "SA-195",
    durationSeconds: 8,
    title: "輸入驅動的向量按鈕",
    englishTitle: "Input driven vector state machine",
    summary:
      "實際讀取 .riv 狀態機，以布林輸入改變素材的動作；按鈕與狀態文字可用鍵盤和觸控操作。",
    primary: "rive",
    capabilities: ["vector-state-machine", "authored-asset-input"],
    module: "asset-rive.ts",
    variant: "boolean-input",
    renderer: "Canvas 2D / WASM",
    interaction: ["time", "state", "pointer", "keyboard", "touch"],
    direction: "淺灰互動元件展示",
    rationale:
      "保留授權素材的珊瑚色與立體按鈕造形，搭配中性介面及明確輸入值，讓狀態差異成為視覺重點。",
    why: "展示設計工具已定義的向量狀態機，前端只改變真實輸入，不重寫素材內部動畫。",
    uses: ["有有效 .riv 素材的互動元件", "設計與前端分工的狀態機整合"],
    nonUses: [
      "沒有 Rive 素材而只需 CSS hover 的介面",
      "未驗證任意素材即宣稱完整匯出相容",
    ],
    instructions:
      "按「切換素材輸入」切換 Boolean 1；「回到自動展示」恢復四秒切換、八秒回到原狀的循環。鍵盤 Tab 後用 Enter 或空白鍵啟動。",
    limitations: [
      "只示範已驗證的 Artboard、State Machine 1、Boolean 1；其他素材需另查名稱與輸入型別。",
      "低階 runtime 由 host 固定步進；互動後的輸入歷史未輸出為影片重播契約。",
      "未宣稱實體 Safari／iPhone 或跨 GPU 像素一致性。",
    ],
    fallback:
      "保留真實預覽與素材來源；WASM 或 .riv 載入失敗時顯示錯誤，不以 CSS 模仿冒充 Rive。",
    visual: {
      background: "#f0f0f0",
      foreground: "#282d31",
      accent: "#ef7477",
      font: "Arial, sans-serif",
    },
    locked: [
      "Load the licensed .riv with the actual Rive WASM runtime; preserve attribution.",
      "Bind the existing Boolean 1 boolean input in State Machine 1 on Artboard.",
      "Advance the state machine and artboard from one host clock and release all owned WASM instances.",
    ],
    editable: [
      "Replace the .riv only with an explicitly licensed valid asset and re-inspect its actual inputs.",
      "Adapt surrounding labels, layout, branding and state schedules independently from the authored artwork.",
    ],
    adaptation:
      "Use the locally bundled matching WASM with CDN fallback disabled. Explicitly reset and replay fixed steps for backward seeks. Re-verify replay and assets before claiming deterministic video support.",
    dependencies: ["@rive-app/canvas"],
    assets: [
      {
        path: "technology-assets/rive/put-it-anywhere.riv",
        source: "https://www.rive.app/marketplace/27860-52644-put-it-anywhere/",
        license: "CC-BY-4.0",
        attribution:
          "put it anywhere by kikkojinji1 · CC BY 4.0 · original .riv unmodified",
      },
    ],
    video: "adapter-required",
    complexity: "medium",
  },
];
