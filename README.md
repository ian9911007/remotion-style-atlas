# Remotion Style Atlas

以實際影片與海報辨識效果，再複製可攜式 Codex 提示詞的繁體中文動態設計圖鑑。既有 React、TypeScript、Vite 網站保留原本 100 個風格及其 ID、網址與套用流程；新增技術能力案例沿用同一個畫廊。原有預覽採 Remotion 4.0.530，新案例依能力使用實際技術執行環境，重型套件按需載入。不需要 AI API、帳號或雲端渲染服務。

## 啟動與操作

需要 Node.js 22、npm，以及本機 `ffmpeg`、`ffprobe`。macOS 可使用既有 Homebrew 版本；其他位置可指定 `FFMPEG_PATH`、`FFPROBE_PATH`。Remotion 第一次渲染可能下載其 Chrome Headless Shell；已有相容瀏覽器時可用 `REMOTION_BROWSER_EXECUTABLE` 指定完整路徑。

```sh
npm ci
npm ci --prefix technology-runtime
npm run dev
```

也可在 Finder 雙擊 `start.command`；它會補裝缺少的主專案／技術執行環境相依套件，準備本機供應商資產後啟動。開發伺服器固定使用 `http://127.0.0.1:4173`，需等終端機確認啟動成功。`npm run studio` 開啟原有 Remotion 作者工作區。畫廊提供「全域／聚焦／靜態」模式、全域暫停、搜尋與獨立分類篩選；也可依能力、視覺方向、技術、互動、renderer 與驗證狀態尋找新案例。全域模式播放目前進入畫面的縮圖，離屏、背景分頁與靜態模式仍會暫停；聚焦模式維持受限播放數量。低動態偏好預設為靜態。鍵盤左右鍵可在卡片間移動焦點，上下鍵維持捲頁。詳細頁影片持續循環播放；開啟案例後直接載入互動 runtime，上方影片仍持續播放；頁面不可見、低動態偏好或關閉時遵守各自暫停及資源釋放規則。詳細頁也可複製完整提示詞、關鍵字或匯出結構化規格；剪貼簿失敗時提供可選取文字。

收藏、設定與參考草稿保存在目前瀏覽器；不會自動跨裝置同步，清除網站儲存空間可能移除它們。請使用版本化匯出保存中繼資料。參考附件保留在瀏覽器本機，中繼資料匯出不含附件原始內容；參考草稿不會自動成為正式風格，也不宣稱已分析不可存取的來源。

## 技術案例的來源與維護

Created: 2026-10-05

本網站沿用 Remotion Style Atlas 名稱、既有 ID 與操作流程，分類架構擴充為 Visual Motion Pattern Library。原有 100 個案例是歷史基準，全站案例數沒有固定上限。`src/technology/pattern-taxonomy.json` 維護視覺模式與參考來源詞彙；`pattern-library.ts` 維護既有案例的少量人工分類。新增分類可擴充此標註表，或使用該檔匯出的 `PatternCaseDefinition` 登錄選填 `patternLibrary`；既有 runtime 型別與預覽指紋保留。視覺模式、參考／靈感來源、實作技術、美術方向、用途、不適用情境、關鍵字與成本提示分別呈現；成本提示不代表量測結果。來源支援 React Bits、Remotion、HyperFrames、GSAP、Motion、Three.js、WebGL／shaders、CSS、SVG、自訂實作及未來來源。

React Bits 是選用的網站／動態模式參考，不是固定網站風格、runtime 相依套件或新增範例的來源宣稱。目前本次標註的六個既有案例均為自訂實作，沒有改標成 React Bits。來源篩選沒有結果時代表尚無該來源標註案例；未標註的歷史資料保留未知。新增案例仍自行選擇美術與品牌表現，不套用舊插畫或 demo 網站風格。AI Skills 中的唯一研究與轉譯規則位於 `.agents/skills/Skill-Web-SVG-Animation-Architect/references/technologies/react-bits.md`，網站只包含必要分類中繼資料，不打包 Skill 全文。

在 AI Skills workspace 新增或編輯案例前，先讀取 `.agents/skills/Skill-Web-SVG-Animation-Architect/references/technologies/gallery-case-authoring.md`。此指引維護既有 ID、註冊、路由、搜尋／篩選、預覽／詳情、播放、複製套用及驗證契約；網站外殼負責瀏覽與操作，每個案例自行決定隔離的美術、字型、色彩、背景、材質與版面。案例需延續網站功能，不代表套用舊案例的設計風格。此 Skill 留在 AI Skills workspace，不打包進網站，也不是瀏覽器執行時依賴。

2026-10-04：基準 100 個、新增 78 個、全站 178 個；新增案例 ready 78／partial 0／blocked 0／unverified 0。ready 代表已完成此處記錄的來源、預覽、執行與視覺檢查，不代表所有裝置、效能或影片輸出均已驗證。完整清單由 `docs/technology-coverage.json` 與 `.md` 自動產生。

47 個盤點名稱正規化為 45 個技術識別，44 個有實際示範；38 個擔任主要技術、11 個擔任支援角色，兩者可以重疊。Framer Motion／Motion One 保留為 Motion 歷史名稱的可搜尋入口，不重複計數；Popmotion 僅保留歷史選型參考。涵蓋 DOM／SVG、GPU／3D、Canvas 編輯、物理／粒子、動畫素材、資料視覺化、地圖與程式化影片。

補充案例包含 SA-151 資訊路線圖、SA-152 建築分層視差、SA-153 指標視差、SA-154 世界連線、SA-155 可旋轉地球及 SA-156 局部揭示全球再回焦。SA-152 使用共用投影修正樓板位置，滿版呈現木構接點、玻璃分格、樓板紋理與室內配置，沒有側欄文字；捲動時僅中央樓板位移，基地與內外木構框架固定。SA-156 採本機 Natural Earth 世界 1:50m／臺灣 1:10m 輪廓，滿版呈現臺北近景→世界連線範圍→臺北近景；相機固定同一焦點，以單一平滑進度完成縮放，不在途中另行平移。

- 技術定義與選型的唯一來源：workspace 的 `.agents/skills/Skill-Web-SVG-Animation-Architect/references/technologies/catalog.json` 及其按需載入的家族參考；Skill routing 由既有 Skill 與 `docs/SKILL_ROUTING.md` 負責。
- `scripts/sync-technology-references.ts` 將 catalog 產生為 `src/technology/technologies.generated.json` 的薄型投影，保留穩定技術 ID、別名、角色與來源。投影不可手動維護；獨立網站 repo 使用已提交的投影，不需要存取本機 Skill 路徑，也不把完整 Skill 文件送進瀏覽器。
- 具體案例來源為 `technology-runtime/src/*-cases.ts`，由 `src/technology/registry.ts` 彙整；實作為同目錄的 runtime modules。`src/technology/prompt.ts` 從案例 metadata 產生套用提示詞，區分鎖定效果、可編輯內容、技術適應、生命週期與驗證要求。
- `src/technology/evidence.json` 記錄實際執行、視覺檢查、預覽、效能與影片適用性的證據。`scripts/validate-technology.ts` 核對案例 ID、技術連結、來源 fingerprint、素材、預覽編碼與 hash；實作完成不自動等於驗證完成。

本次遇到的技術陷阱已回寫各家族參考：SVG 前後繪製與共同投影、GSAP 初始／反向 seek、手動捲動接管、WebKit 媒體重複清理、Three.js 版本限定的共用 texture 保留，以及量測結果的證據界線。`visual-quality.md` 保存精緻細節、依要求滿版、移除不相關文字及多階段遮擋驗收；`current-information.md` 要求即時或可能變動的資訊先聯網搜尋、核對第一手來源並記錄資料時間。Web SVG、Remotion 與 Scrollytelling 三個既有 Skill 依需求連到同一份規則，不複製個案美術或建立平行 Skill。

在 AI Skills workspace 的本專案目錄內更新技術投影與驗證：

```sh
node --import tsx scripts/sync-technology-references.ts
node --import tsx scripts/validate-technology.ts
```

新預覽由 `scripts/capture-technology.ts` 對真實案例 runtime 逐格 seek、以瀏覽器高像素密度擷取，再產生 480×270／30 fps 卡片影片、1280×720／30 fps 詳情影片及 1280×720 JPEG 海報；不是把低解析影片放大。卡片影片沿用舊案例的 480×270／30 fps／CRF 21 規格，詳情影片與海報使用 1280×720 像素來源。這個擷取器不是 Remotion recipe renderer。Remotion 可以作為另一種逐格合成主控，驅動 GSAP、SVG、Canvas、圖表、地圖或 3D renderer；只有明確接上影格時鐘、暫停該引擎自己的時鐘、等待資料與素材就緒並通過 seek/replay 驗證，才能宣稱是可重複的 Remotion 影片輸出。新案例目前展示的是各自登錄的網頁 runtime；不要把影片預覽載體當成動畫引擎。擷取與視覺審查必須針對變更案例執行，不能以建置成功或初始畫面代替。

列表仍以海報／短片發現效果，不會在載入網站時啟動所有即時技術 runtime。使用者開啟詳細頁時載入該案例 runtime；畫廊維持一個作用中的即時案例。全域模式依使用者要求，同時播放所有目前可視卡片的影片縮圖，不輪替或套用固定同播數上限；僅可視卡片載入影片來源，離屏卡片、背景分頁與靜態模式會暫停並釋放不需要的來源。聚焦模式仍採保守同播數量。這些是本專案的明確播放模式，不是通用安全值；長頁面的全域模式可能同時解碼較多可視影片。關閉詳情時釋放排程、事件、observer、worker 與即時 renderer 資源。

每個案例的 Shadow DOM 與 case-root tokens 明確設定字型、前景、背景和色彩，不繼承舊插畫集合的美術設定。只有 p5 2.3.4 與 tsParticles 4.4.0 因實測套件全域參照保留，使用可銷毀的同源 iframe realm；由主頁驅動時間並在關閉後移除，仍執行套件正常 teardown。這項隔離不代表已證明所有瀏覽器或 GPU 記憶體都可立即回收。影片相容性須依個案證據判定，能在瀏覽器播放不等於可重複渲染。

## 原有風格目錄與渲染

原有 100 個風格的唯一作者來源仍為 `src/catalog/styles.json`，由 `src/catalog/schema.ts` 驗證。`src/catalog/published.json` 是原有驗證器產生的正式網站資料，不應手動編輯；新技術案例不要求重寫這 100 筆資料。新增案例需分配全站未使用的穩定 `SA-###` ID，不可重新分配既有 ID；只有原有 recipe 型風格使用以下渲染流程。原始樣本放在 `public/assets/`，字型放在 `public/fonts/`；不得加入未授權第三方素材或私人參考內容。

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

2026-10-03 的歷史試跑於 Apple M4 Pro、24 GB RAM 執行 SA-047 的 10 秒詳細預覽：兩影格並行 15.95 秒，四影格並行 16.61 秒；這是單次比較，不足以推論所有風格、新技術案例或其他主機。四影格未顯示收益，因此原有渲染器維持兩影格。Mac Studio M1 Ultra／64 GB 未實測；該機仍應先以保守設定試跑，再依實際工作負載調整。未關閉其他創作應用程式，也未宣稱實機播放 FPS 或整體記憶體峰值。

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

瀏覽器檢查需本機測試伺服器與 Playwright 瀏覽器；實際驗證狀態以執行結果為準。Chromium／WebKit 自動測試不等於實機 Safari 或 iPhone 驗收。部署輸出須保留正式目錄、預覽、按需 runtime，以及所需的 `technology-assets/` 與套件授權文字；原有未發布媒體、原始樣本、manifest、作者目錄和私人參考內容仍不應進入交付包。路由使用 hash，可在 GitHub Pages 分享詳細頁並重新整理。`ATLAS_BASE` 設定網站 base；外部媒體伺服器可透過 `VITE_ASSET_BASE` 設定，部署前須驗證來源可存取性。

GitHub Pages 保留兩個既有入口：獨立網站 repository 使用本資料夾的 `.github/workflows/pages.yml`，觸發條件為 `main` push 或手動執行；workspace 使用根目錄 `.github/workflows/remotion-style-atlas-pages.yml`，只接受手動執行。兩者都安裝主專案與 `technology-runtime` 各自 lockfile 鎖定的相依套件，再準備供應商資產。本機 `npm run build` 不會發布；遠端結果以[既有 Pages 工作流程](https://github.com/ian9911007/remotion-style-atlas/actions/workflows/pages.yml)與公開頁面實測為準。啟用或執行遠端發布仍需發布權限與明確授權。建置輸出列出正式媒體大小；應另外檢查 `dist/` 整體大小及實際下載負擔。GitHub Pages 公開輸出前，確認來源素材、字型與授權適用範圍。

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

原有集合的樣本是本專案原創的建築、植物、產品程序化插畫，來源為 `scripts/create-assets.ts` 與 `public/assets/*.svg`，可用 `npm run assets` 重建；該集合的攝影版面類風格使用插畫示範裁切與視差。新案例的素材來源、實際格式、授權與標示要求由各案例 `assets` metadata 及必要的 provenance 檔記錄，不沿用舊集合「全部原創插畫」的假設。外部參考僅可記錄可觀察原則，未取得權利時不能將對方商標、影片、海報或受保護藝術作品加入公開素材。風格提示詞不保證逐像素重建；結構化規格提供更精確的補充依據。

`scripts/prepare-technology-assets.mjs` 從實際安裝的主專案與技術 runtime 直接相依套件複製 LICENSE／NOTICE／COPYING 等原文至 `public/technology-assets/licenses/`，並在 `package-notices.json` 記錄版本、來源檔名與 SHA-256。這些是建置產物，不可手動維護，也不能用 SPDX 名稱代替授權全文。`@react-three/fiber` 與 `@rive-app/canvas` 缺少隨套件附上的授權文字，現已補入同版本官方 commit 的原始 MIT 文件，建置離線核對 SHA-256；原文位於 `public/technology-assets/license-supplements/`，查核來源位於 `docs/technology-license-verification.json`。GSAP 仍依官方連結條款，SplitType 的發行套件及對應原始碼未找到授權全文，兩者明列 `upstream-link-only`，不製造替代文字；這份直接相依套件清單不等於完整遞移相依套件授權稽核。套件授權與實際圖片、字型、動畫、模型及地圖資料權利須分別查核。

## 整合驗證：2026-10-04

原有 `styles.json` SHA-256 維持 `1e8207db3454445592f7dbc0826446ba32df8a5a31c2067da05db442ced93d30`，原有 100 個 ID、300 個媒體輸出的雜湊與格式驗證通過。主專案 lockfile、原有 schema 與 Remotion recipe 來源未變更。

- 18 項單元測試、Chrome／Playwright WebKit 共 50 項瀏覽器檢查及 11 項技術 runtime 生命週期檢查通過；涵蓋搜尋與數字排序、能力篩選、路由、提示詞與複製、全域可視縮圖循環、背景／離屏暫停、詳情播放、方向鍵、低動態、觸控視窗與資源釋放。
- 新增 78 個 runtime 均通過 Google Chrome 154.0.8037.98 與 Playwright WebKit 26.0（build 2215）的掛載、多次 seek 與錯誤檢查。正式子路徑版本另通過全部 78 個 Chrome runtime；最後 Three.js 生命週期修正的 6 個案例重新執行受影響檢查。
- 78 組海報、卡片影片及詳情影片由實際 runtime 產生；海報／詳情影片為 1280×720，卡片影片為 480×270、30 fps。實際檢查全部 78 支卡片影片的 HTML video 解碼與循環，並逐案檢查詳情影片的 1280×720 中繼資料及正式產物存在；循環播放檢查不是即時 FPS 測量。SA-152 另驗證對齊、7 個動畫狀態、循環、鍵盤滾動、手機詳情縮放與低動態行為。
- TypeScript、原有與新增 registry／素材／來源 fingerprint、GitHub Pages `/remotion-style-atlas/` 正式子路徑建置、78 個懶載入 runtime 邊界與全部資產路徑檢查通過。Vite 仍回報大型延遲載入引擎 chunk、Lottie eval 與上游 Rollup 註解警告；技術案例不進初始 runtime graph。`docs/technology-build-verification.json` 保存正式輸出檔案大小；完整 Skill 文件未送進瀏覽器。
- 技術 catalog 驗證涵蓋 45 個正式識別／47 個盤點名稱；workspace 的 18 個驗證套件結果為 `PASS_WITH_WARNINGS`，保留原有警告。路由按需求載入家族參考，沒有把個別展示案例、美術方向、資料或套用提示詞複製進通用 Skills。

`docs/technology-preview-verification.json` 保存媒體檢查摘要，`docs/technology-resource-verification.json` 保存反覆開關及資源釋放的量測範圍。實作完成、正式建置、瀏覽器執行、視覺檢查與效能量測各自記錄，不互相替代。

SA-152 的木構繪製維持後側結構在樓板後、前方柱子與屋頂樑在樓板前；實際動畫只移動中央樓板，基地、外框架與屋頂構件維持固定。7 個動畫位置以實際像素檢查屋頂樑可見性，避免只驗證座標正確卻漏掉遮擋問題。SA-152、SA-153、SA-156 修正後均重新擷取執行證據與短片，Chrome 檢查非初始狀態有變化且指定回跳畫面重複一致；WebKit 與 Chrome 的方向鍵換卡及上下捲頁檢查通過。

Three.js 0.186.1 的共用 DFG lookup texture 曾保留已關閉 renderer 的 listener／canvas；現以公開 material compile hook 追蹤並在單一作用中 renderer 的清理邊界釋放。正式版 Three、R3F、Theatre 各 12 次開關後 DOM／listener 數量穩定，R3F 延長至 36 次亦固定。JavaScript heap 仍有小幅增加，原生 CSS 控制組也有增加；長時間 heap 是否收斂仍未驗證，不宣稱全面無洩漏或 GPU 記憶體已測量。

尚未驗證實機 Safari／iPhone、實體觸控、GPU 記憶體峰值或完整決定性影片輸出。影片適用性依個別 frame-driven／adapter-required／recorded-live 等狀態與證據判定；WebKit 測試不是實機 Safari 驗收。地圖輪廓是具來源日期的 Natural Earth 資料，沒有宣稱即時行政邊界、街道或衛星資料；Cesium 案例使用橢球，未宣稱已載入地形。Rive 以實際有效的 Boolean state-machine 素材示範，未以假的作者檔案擴充案例數。

相依套件稽核已修復可相容修正的項目；仍有 1 個 `image-size` ICNS 解析 DoS advisory（GHSA-w3rx-r6r6-pgpr）沿 texture-compressor／deck.gl 相依鏈列出 8 個受影響套件。現有展示只使用受控本機素材；沒有為消除報表而強制降版 deck.gl。版本、影響範圍與限制見 `docs/technology-dependency-verification.json`，此紀錄不是普遍安全保證。沒有未完成展示卡片；以上本機檢查不替代推送後的 GitHub Actions 與公開頁面確認，部署結果以該工作流程及實際公開頁面為準。

## 歷史驗證基準：2026-10-03，原有 100 筆

以下紀錄只適用當時原有集合與建置；本次新增案例的檢查見上方 2026-10-04 整合驗證。

2026-10-03：100 個獨立 recipe 已實作、渲染、審查並發布，包含 200 支 H.264 預覽及 100 張 JPEG 海報。已檢查全部風格的海報與多段影格，並在 Chromium 原生影片元素完整循環播放全部 gallery/detail；解碼畫格涵蓋各影片完整長度，無媒體解碼錯誤。畫格檢查證據為 `docs/review/frames-*.jpg`。SA-047 線條描繪與 SA-058 海報可讀性問題已修正並重新驗證。

10 項資料／提示詞／匯入／fingerprint／媒體完整性測試通過。正式建置於 `/remotion-style-atlas/` 子路徑完成 Chromium 19／19 與 WebKit 19／19 共 38 項瀏覽器測試：搜尋與複合篩選、收藏保存、鍵盤與詳情返回、完整剪貼簿與失敗備援、匯出匯入、Reference Inbox／IndexedDB 附件、hash 分享連結刷新、遺失媒體及播放預算／低動態／暫停行為。桌機 1600 px／平板 900 px／手機 390 px 分別為 5／3／2 欄，無水平溢出；精選截圖同樣保留於 `docs/review/`。目錄驗證確認 100 筆發布資料與 300 個輸出的 SHA-256、尺寸、H.264 格式、30 fps 及時長；TypeScript 與 GitHub Pages 子路徑正式建置通過。Workspace 驗證器 18 個測試套件通過，結果為 `PASS_WITH_WARNINGS`，保留既有警告。

Apple M4 Pro（12 核心、24 GB RAM），1 個渲染工作／2 影格並行：最終完整 100 筆批次 2,412.1 秒，零失敗；SA-058 海報調整另需 21.4 秒。正式建置 304 個檔案共 66,224,688 bytes（63.16 MiB），媒體 65,341,471 bytes（62.31 MiB）；JavaScript 855,480 bytes，gzip 164,032 bytes，CSS gzip 6,199 bytes。Vite 有單一 JavaScript chunk 超過 500 kB 的提示；目前目錄隨程式載入，影片與海報使用按需載入。未測量整體記憶體峰值或實機播放 FPS。

目前實際支援且已審查的比例為 16:9；攝影處理範例使用原創插畫，景深／視差範例屬 2.5D。未驗證實機 Safari、iPhone 或 Mac Studio M1 Ultra／64 GB；未執行 GitHub Actions 遠端部署。

Created: 2026-10-04
