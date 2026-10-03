# Remotion Style Atlas

以實際影片與海報辨識風格，再複製可攜式 Codex 提示詞的繁體中文動態設計圖鑑。網站採 React、TypeScript、Vite；預覽採 Remotion 4.0.530，所有相容套件固定同一版。正式網站只讀取經驗證、已發布的目錄，不需要 AI API、帳號或雲端渲染服務。

## 啟動與操作

需要 Node.js 22、npm，以及本機 `ffmpeg`、`ffprobe`。macOS 可使用既有 Homebrew 版本；其他位置可指定 `FFMPEG_PATH`、`FFPROBE_PATH`。Remotion 第一次渲染可能下載其 Chrome Headless Shell；已有相容瀏覽器時可用 `REMOTION_BROWSER_EXECUTABLE` 指定完整路徑。

```sh
npm ci
npm run dev
```

也可在 Finder 雙擊 `start.command`。開發伺服器固定使用 `http://127.0.0.1:4173`，需等終端機確認啟動成功。`npm run studio` 開啟 Remotion 作者工作區。畫廊提供「輪播／聚焦／靜態」模式、全域暫停、搜尋與獨立分類篩選。輪播從可見卡片選擇有限播放數量；低動態偏好預設為靜態。詳細頁可複製完整提示詞、關鍵字或匯出結構化規格；剪貼簿失敗時提供可選取文字。

收藏、設定與參考草稿保存在目前瀏覽器；不會自動跨裝置同步，清除網站儲存空間可能移除它們。請使用版本化匯出保存中繼資料。參考附件保留在瀏覽器本機，中繼資料匯出不含附件原始內容；參考草稿不會自動成為正式風格，也不宣稱已分析不可存取的來源。

## 目錄與渲染

唯一作者來源為 `src/catalog/styles.json`，由 `src/catalog/schema.ts` 驗證。`src/catalog/published.json` 是驗證器產生的正式網站資料，不應手動編輯。新增風格需分配未使用的穩定 `SA-###` ID、slug 與可信任 recipe；不可重新分配既有 ID。原始樣本放在 `public/assets/`，字型放在 `public/fonts/`；不得加入未授權第三方素材或私人參考內容。

```sh
# Render selected implemented styles.
npm run render -- SA-001 SA-002
# Render only changed or missing outputs.
npm run render:changed
# Force a complete catalog render.
npm run render:all
# Validate canonical data, fingerprints, hashes, dimensions, codec, fps and duration.
npm run validate
# Generate temporary visual review contact sheets.
npm run review -- SA-001 SA-002
npm run review -- --all
```

每個風格產生 H.264 MP4：畫廊為 480×270、3–6 秒；詳細預覽為 1280×720、8–12 秒；30 fps，並依作者指定影格產生 JPEG 海報。recipe 必須使用 Remotion 影格驅動動畫。所有 gallery/detail 構圖共用 1280×720 設計座標，依輸出尺寸等比例縮放。preview duration、poster frame 可按風格調整，海報必須落在詳細影片範圍內。

渲染重用同一 bundle 與瀏覽器，固定一次一個工作、每工作兩個影格。這是保守預算，不代表任何 Mac 的效能保證。每個風格允許初次嘗試加最多兩次重試；三個輸出均完成且經 ffprobe 驗證後，才更新檔名、SHA-256 manifest 與目錄。失敗回傳非零狀態並保留既有有效輸出；可再次執行 changed 恢復。檔名含 fingerprint，可避免快取錯置。fingerprint 涵蓋創意規格、Remotion 程式、樣本、字型、套件鎖定與渲染設定；發布狀態、審查紀錄與產生檔名不會造成無限重新渲染。共用程式變更會使既有預覽需要重新產生與審查。

本次於 Apple M4 Pro、24 GB RAM 環境試跑 SA-047 的 10 秒詳細預覽：兩影格並行 15.95 秒，四影格並行 16.61 秒；這是單次比較，不足以推論所有風格或其他主機。四影格未顯示收益，因此維持兩影格。Mac Studio M1 Ultra／64 GB 未實測；該機仍應先以保守設定試跑，再依實際工作負載調整。未關閉其他創作應用程式，也未宣稱實機播放 FPS 或整體記憶體峰值。

## 審查與發布

狀態為 `reference-only → draft → implemented → rendered → reviewed → published`。未實作或尚未審查的項目不會成為完成數。渲染會清除舊審查記錄。聯絡表位於 `.cache/review/`，每列顯示海報及首／前段／中段／後段／末影格；它只能輔助視覺檢查，不能證明播放與循環接點良好。另需實際播放 gallery 與 detail、檢查末端返回起點、縮圖可讀性與媒體載入，才可明確記錄審查：

```sh
npm run review -- SA-001 --record --visual-reviewed --motion-reviewed --reviewer "Reviewer name" --notes "Describe actual frame, playback and loop-boundary checks."
npm run review -- SA-001 --publish
```

`--record` 是作者對已執行檢查的明確聲明，不是自動 AI 評分。`--publish` 只修改本機目錄；缺少完整審查、ratio 確認、fingerprint 或媒體驗證會被拒絕。完成檢查後移除暫存聯絡表與原始測試產物；本次要求交付的精選視覺驗證證據保留於 `docs/review/`，不參與網站或渲染執行。保留實際交付影片、作者來源與必要的維護資源。

## 測試與靜態部署

```sh
npm test
npm run test:browser
npm run build
# Repository-hosted GitHub Pages base path.
ATLAS_BASE=/remotion-style-atlas/ npm run build
# Preview that exact repository base locally.
ATLAS_BASE=/remotion-style-atlas/ npm run preview
```

瀏覽器檢查需本機測試伺服器與 Playwright 瀏覽器；實際驗證狀態以執行結果為準。Chromium／WebKit 自動測試不等於實機 Safari 或 iPhone 驗收。`dist/` 只保留正式目錄及其媒體、網站程式；原始樣本、未發布媒體、manifest、作者目錄和私人參考內容不會進入交付包。路由使用 hash，可在 GitHub Pages 分享詳細頁並重新整理。`ATLAS_BASE` 設定網站 base；外部媒體伺服器可透過 `VITE_ASSET_BASE` 設定，部署前須驗證來源可存取性。

本專案提供兩種 GitHub Pages 手動部署入口：作為獨立 GitHub repository 根目錄時使用本資料夾內的 `.github/workflows/pages.yml`；作為 AI Skills workspace 子目錄時，使用 workspace 根目錄 `.github/workflows/remotion-style-atlas-pages.yml`。workflow 只接受手動觸發；需先在 repository 設定啟用 GitHub Pages／GitHub Actions，並由有發布權限者明確執行。本站建置不會自行發布。建置輸出列出正式媒體大小；應另外檢查 `dist/` 整體大小及實際下載負擔。GitHub Pages 公開輸出前，確認來源素材、字型與授權適用範圍。

## 唯一維護來源與雙向 Git 同步

AI Skills workspace 的 `tools/remotion-style-atlas/` 是唯一維護來源；獨立公開 repo `ian9911007/remotion-style-atlas` 是網站發布副本，不要在兩邊各自維護。先在 AI Skills repo 提交本次相關變更，再由此目錄執行：

```sh
npm run sync:push
```

這個入口會以 Git subtree 同步網站 repo 的 `main`，接著推送 AI Skills 的 `main`。網站 repo 收到更新後，GitHub Actions 會自動建置與發布 Pages。若有人直接在網站 repo 做了變更，先提交至網站 repo，再從唯一工作區副本執行：

```sh
npm run sync:pull
```

它會把網站 repo 的變更合併到 AI Skills 子目錄，再推送 AI Skills。兩個同步動作都要求該資產沒有未提交修改；發生合併衝突時先在 AI Skills workspace 解決並提交，再執行 `npm run sync:push`。一般 Git `push` 不會觸發另一個 repository；後續請使用以上入口。首次同步前需先建立並設定公開網站 repo，並完成兩個 GitHub remotes 的登入授權。

## 授權與素材來源

2026-10-03 查核的 [Remotion 官方授權頁](https://www.remotion.dev/docs/license/pricing)：個人及最多三人的公司可依條款使用免費授權；合作情境及四人以上公司需要公司授權，方案依創作／自動化用途而定。未判定目前組織是否符合免費資格，也未購買或啟用付費服務；投入商業或團隊使用前需自行確認適用條款。官方價格與條款可能更新，以上連結為目前查核入口。

樣本是本專案原創的建築、植物、產品程序化插畫，來源為 `scripts/create-assets.ts` 與 `public/assets/*.svg`，可用 `npm run assets` 重建。沒有使用第三方照片、海報、商標或付費素材；攝影版面類風格目前使用插畫示範裁切與視差。外部參考僅可記錄可觀察原則，未取得權利時不能將對方商標、影片、海報或受保護藝術作品加入公開素材。風格提示詞不保證逐像素重建；結構化規格提供更精確的補充依據。

## 本次交付驗證

2026-10-03：100 個獨立 recipe 已實作、渲染、審查並發布，包含 200 支 H.264 預覽及 100 張 JPEG 海報。已檢查全部風格的海報與多段影格，並在 Chromium 原生影片元素完整循環播放全部 gallery/detail；解碼畫格涵蓋各影片完整長度，無媒體解碼錯誤。畫格檢查證據為 `docs/review/frames-*.jpg`。SA-047 線條描繪與 SA-058 海報可讀性問題已修正並重新驗證。

10 項資料／提示詞／匯入／fingerprint／媒體完整性測試通過。正式建置於 `/remotion-style-atlas/` 子路徑完成 Chromium 19／19 與 WebKit 19／19 共 38 項瀏覽器測試：搜尋與複合篩選、收藏保存、鍵盤與詳情返回、完整剪貼簿與失敗備援、匯出匯入、Reference Inbox／IndexedDB 附件、hash 分享連結刷新、遺失媒體及播放預算／低動態／暫停行為。桌機 1600 px／平板 900 px／手機 390 px 分別為 5／3／2 欄，無水平溢出；精選截圖同樣保留於 `docs/review/`。目錄驗證確認 100 筆發布資料與 300 個輸出的 SHA-256、尺寸、H.264 格式、30 fps 及時長；TypeScript 與 GitHub Pages 子路徑正式建置通過。Workspace 驗證器 18 個測試套件通過，結果為 `PASS_WITH_WARNINGS`，保留既有警告。

Apple M4 Pro（12 核心、24 GB RAM），1 個渲染工作／2 影格並行：最終完整 100 筆批次 2,412.1 秒，零失敗；SA-058 海報調整另需 21.4 秒。正式建置 304 個檔案共 66,224,688 bytes（63.16 MiB），媒體 65,341,471 bytes（62.31 MiB）；JavaScript 855,480 bytes，gzip 164,032 bytes，CSS gzip 6,199 bytes。Vite 有單一 JavaScript chunk 超過 500 kB 的提示；目前目錄隨程式載入，影片與海報使用按需載入。未測量整體記憶體峰值或實機播放 FPS。

目前實際支援且已審查的比例為 16:9；攝影處理範例使用原創插畫，景深／視差範例屬 2.5D。未驗證實機 Safari、iPhone 或 Mac Studio M1 Ultra／64 GB；未執行 GitHub Actions 遠端部署。

Created: 2026-10-03
