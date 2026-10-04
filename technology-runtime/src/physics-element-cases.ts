/** Created: 2026-10-04. Thirty distinct procedural physical studies; no claim of scientific CFD. */
import type { CaseDefinition } from "./types";
import { physicsElementScenes } from "./physics-element-scenes";

type Seed = {
  key: string;
  title: string;
  englishTitle: string;
  summary: string;
  capabilities: string[];
  why: string;
  uses: string[];
  nonUses: string[];
  instructions: string;
  model: string;
};
const seeds: Seed[] = [
  {
    key: "fire",
    title: "熱對流・火焰羽流",
    englishTitle: "Thermal Convection Flame Plume",
    summary:
      "燃燒核心向上拉升，外焰捲曲、火星脫離後熄散；以分層透明度與熱暈呈現羽流方向。",
    capabilities: ["thermal-convection", "turbulent-plume", "closed-loop-vfx"],
    why: "以時間函數控制分層羽流與粒子生命週期，讓上升速度、外焰捲曲及餘燼衰減在同一時間軸可重播。",
    uses: ["廣告與介面中的火焰視覺", "循環背景與合成素材"],
    nonUses: ["燃燒工程分析", "需要溫度場或燃料反應速率的科學模擬"],
    instructions:
      "觀察中心熱柱、外焰回捲與向上熄散火星；點擊或空白鍵觸發局部擾動。",
    model: "分層向上對流及程序式粒子近似，不是 CFD 或真實燃燒化學。",
  },
  {
    key: "smoke",
    title: "煙霧・渦旋捲吸",
    englishTitle: "Smoke Vortex Entrainment",
    summary:
      "多層煙絲先形成細柱，再被旋渦拉寬捲吸；稀薄邊緣與濃密核心保留可讀的體積感。",
    capabilities: [
      "vortex-entrainment",
      "volumetric-layering",
      "particle-fade",
    ],
    why: "多尺度曲線、密度衰減與柔和輻射暈直接對應捲吸感，避免以單一透明圓形假裝體積煙霧。",
    uses: ["短片氛圍煙霧", "舞台或產品背景的程序式煙流"],
    nonUses: ["煙霧安全／通風預測", "具有守恆量要求的流體力學研究"],
    instructions:
      "觀察細煙上升後逐步展寬、分岔及淡出；點擊可在畫面位置加入瞬時擾動。",
    model: "以分層曲線和粒子近似渦旋捲吸；沒有體積網格、流體求解或真實散射。",
  },
  {
    key: "splash",
    title: "水滴衝擊・皇冠飛濺",
    englishTitle: "Droplet Impact Crown Splash",
    summary:
      "液滴衝擊形成薄片與冠狀邊緣，水舌斷裂成拋物線水珠，底部漣漪擴張後回到完整循環。",
    capabilities: ["impact-splash", "ballistic-droplets", "concentric-ripples"],
    why: "衝擊時序、冠緣齒狀形態、飛濺軌跡和表面漣漪以共同事件相位同步，讓瞬間爆發具有明確的前後段。",
    uses: ["飲品或清潔用品廣告", "水滴與液體轉場合成"],
    nonUses: ["液體接觸面張力測量", "需要真實網格流體或液滴融合的特寫"],
    instructions: "留意衝擊、冠緣展開、液滴飛散與表面波的先後關係。",
    model: "以程序式水冠、拋物線粒子和漣漪近似；非 SPH、FLIP 或液體求解器。",
  },
  {
    key: "swell",
    title: "海浪群・相位疊加",
    englishTitle: "Ocean Swell Phase Group",
    summary:
      "不同相位與波長的波群沿岸推進，前景泡沫線與遠層海面錯開，呈現波峰傳遞而非整片背景平移。",
    capabilities: ["wave-superposition", "phase-propagation", "layered-foam"],
    why: "多個解析波函數疊加與獨立泡沫層可清楚表達波長、相位和前後景速度差，並能從任意時間直接求值。",
    uses: ["海洋資訊敘事", "品牌片與環境介面的海面動態"],
    nonUses: ["沿岸洪水或海況預報", "真實地形與風場耦合模擬"],
    instructions: "比較遠、中、近景波峰的相位差與泡沫線起伏。",
    model: "解析波形合成的海面圖像；沒有潮汐、風場或流體守恆求解。",
  },
  {
    key: "wind",
    title: "風場・流線偏折",
    englishTitle: "Wind Tunnel Streamline Deflection",
    summary:
      "細流線通過中央物體時分離、彎折並在尾流區逐步復原，局部標記沿線平穩輸送。",
    capabilities: ["advection", "boundary-layer-flow", "wake-deflection"],
    why: "程序式流線把方向、速度梯度與尾流區直接映射成可見幾何，適合解釋概念和製作視覺效果。",
    uses: ["空氣動力學概念動畫", "風場品牌視覺與資訊圖表"],
    nonUses: ["阻力係數預測", "產品風洞測試或航空安全判斷"],
    instructions: "沿流線從左向右追蹤，觀察障礙物前後的偏折與尾流恢復。",
    model: "流線與示蹤點是解析近似，不代表 Navier–Stokes 解或實際測量結果。",
  },
  {
    key: "lightning",
    title: "閃電・分岔電弧",
    englishTitle: "Branching Lightning Discharge",
    summary:
      "主電弧快速向下發展，次級分支逐層短化，短暫過曝照亮雲層後淡回暗場。",
    capabilities: [
      "branching-fractal-growth",
      "flash-envelope",
      "volumetric-light",
    ],
    why: "受限隨機分支、主次幹粗細和亮度包絡共同構成電弧可讀性；固定種子使每次尋格保留相同裂線。",
    uses: ["天氣／災害敘事的視覺化", "電影與舞台電弧合成"],
    nonUses: ["電氣絕緣設計", "雷擊路徑或電場工程預測"],
    instructions: "觀察主幹先出現、分支向外延伸、亮度脈衝再衰減。",
    model: "固定種子的風格化電弧，不是大氣電場或放電方程模擬。",
  },
  {
    key: "rain",
    title: "雨滴・玻璃徑流",
    englishTitle: "Rain on Glass Runoff",
    summary:
      "雨線以不同速度撞上玻璃，沿面形成細長水痕並在下緣匯集；窗格倒影提供材質深度。",
    capabilities: [
      "gravity-driven-runoff",
      "surface-tension-trails",
      "layered-reflection",
    ],
    why: "把雨滴下落、玻璃水痕及窗框反射拆成不同景深層，可以在輕量 2D 畫布呈現雨窗質感。",
    uses: ["情境式產品展示", "影像合成中的雨窗圖層"],
    nonUses: ["建築排水設計", "計算玻璃表面潤濕或接觸角"],
    instructions: "觀察遠近雨線、玻璃水痕與下緣反光帶的不同速度。",
    model: "程序式下落與水痕層，不計算液膜厚度、接觸角或窗外天氣資料。",
  },
  {
    key: "snow",
    title: "雪晶・側風漂移",
    englishTitle: "Snow Crystal Crosswind Drift",
    summary:
      "雪點隨側風緩慢漂移並受局部渦流偏轉，大小和速度層次讓遠近深度同時可讀。",
    capabilities: [
      "drag-dominated-motion",
      "crosswind-advection",
      "depth-layering",
    ],
    why: "低雷諾數風格化運動使用有限相位粒子和不同視差尺度，足以示範漂移、空氣阻力與場景深度。",
    uses: ["季節性介面與片頭", "冬季地景的粒子合成"],
    nonUses: ["雪載荷工程", "雪崩危險預測或氣象觀測"],
    instructions: "比較細雪與大雪花的下落速度及側向飄移。",
    model: "預先決定軌跡的雪粒視覺近似；不計算真實雪晶形狀或大氣湍流。",
  },
  {
    key: "sandfall",
    title: "沙漏・顆粒安息角",
    englishTitle: "Granular Hourglass Repose Angle",
    summary:
      "沙粒由窄頸連續落下，在下室堆成具有斜坡的錐狀顆粒床，流量隨週期緩起緩收。",
    capabilities: ["granular-cascade", "repose-pile", "particle-emission"],
    why: "以有限粒子軌跡和分層堆積輪廓展示連續顆粒流與安息角形狀，不必把效果誤稱為剛體求解。",
    uses: ["時間與材料概念動畫", "沙粒或粉末產品視覺"],
    nonUses: ["料槽流量或粉體製程設計", "粒徑分佈與顆粒接觸研究"],
    instructions: "觀看窄頸落料、擴散與沙堆逐層累積。",
    model: "粒流與堆面是可視化近似；沒有接觸網路、粒徑統計或 DEM 解算。",
  },
  {
    key: "ferrofluid",
    title: "磁性流體・尖峰成形",
    englishTitle: "Ferrofluid Field Spike Formation",
    summary:
      "磁場強度變化帶動液面尖峰沿徑向起伏，黑色流體輪廓與窄高光呈現磁性材料張力。",
    capabilities: [
      "field-responsive-surface",
      "spike-formation",
      "radial-symmetry",
    ],
    why: "以場方向控制界面尖峰和高光線條，使磁性應力的視覺特徵清晰；動態由絕對相位產生，無累積狀態。",
    uses: ["科學展演視覺", "材料與科技品牌動畫"],
    nonUses: ["磁性液體配方或裝置設計", "表面張力與磁化率測量"],
    instructions: "觀察磁場脈動時液面尖峰成形與回落。",
    model: "程序式界面形變，不是磁流體力學或實驗影像。",
  },
  {
    key: "bubble",
    title: "水中氣泡・浮力與聚合",
    englishTitle: "Underwater Bubble Buoyancy",
    summary:
      "不同尺寸氣泡帶著上升速度與細微擺動穿過水柱，局部高光和薄膜色彩表達折射、合併與逸出。",
    capabilities: [
      "buoyancy-rise",
      "size-dependent-drag",
      "thin-film-highlight",
    ],
    why: "依粒徑安排浮升速度、阻力擺動和高光比例，足以呈現氣泡群層級且不需昂貴氣液求解器。",
    uses: ["飲品與水下產品視覺", "泡泡介面回饋"],
    nonUses: ["氣泡尺寸量測", "真實氣液界面、壓力或溶解度模擬"],
    instructions: "比較不同尺寸氣泡的上升速度、薄膜高光與水面波動。",
    model: "2D 氣泡群程序動畫；不計算氣體膨脹、壓力或氣液耦合。",
  },
  {
    key: "lava",
    title: "熔岩流・黏滯地殼",
    englishTitle: "Lava Flow Viscous Crust",
    summary:
      "黏稠熔岩前緣分層推進，暗色薄殼在橙紅核心上滑移，熱點沿流面間歇浮現。",
    capabilities: [
      "viscous-flow-appearance",
      "crust-shear",
      "thermal-emission",
    ],
    why: "前緣、表皮及內部熾熱層分層偏移，可表現高黏度材料緩慢剪切的視覺線索。",
    uses: ["地質科普插畫動畫", "熔融材料風格化片段"],
    nonUses: ["火山熔岩流向預測", "熔岩溫度、黏度或危害評估"],
    instructions: "觀察外層暗殼和內層熔融亮帶以不同速度交錯。",
    model: "2D 黏滯材料外觀近似；不含熱傳、地形或材料方程。",
  },
  {
    key: "cloth",
    title: "布面・陣風傳播",
    englishTitle: "Cloth Surface Gust Propagation",
    summary:
      "固定布邊接受一陣側風，波峰由前緣傳向自由端，織線彎曲與側逆光分開呈現張力和布面起伏。",
    capabilities: [
      "traveling-membrane-wave",
      "edge-constraint",
      "gust-envelope",
    ],
    why: "受限邊界上的多模態波形能表達固定與自由邊差異，無須把布料風格圖形誤稱為完整布料求解。",
    uses: ["布料型錄動態背景", "布旗或軟性包裝概念視覺"],
    nonUses: ["裁片打版或垂墜工程", "真實褶皺碰撞與縫線模擬"],
    instructions: "由固定邊向自由端追蹤陣風波峰與縱向織紋。",
    model: "解析薄膜波形近似，沒有自碰撞、布料材料參數或 CFD 風場。",
  },
  {
    key: "pendulum",
    title: "耦合擺錘・相位轉移",
    englishTitle: "Coupled Pendulum Phase Transfer",
    summary:
      "不同長度的懸錘依序移相，細線、金屬球與殘影讓角動量轉移的節奏清楚可見。",
    capabilities: ["pendulum-oscillation", "phase-transfer", "periodic-motion"],
    why: "解析小角度週期配合不同自然頻率能穩定展示相位差並支援任意時間讀取；若要真實耦合能量需改用數值積分。",
    uses: ["力學概念展示", "儀器與鐘擺主視覺"],
    nonUses: ["精密擺鐘調校", "多體擺錘混沌研究"],
    instructions: "比較每顆擺錘的週期與相位，不同長度不會同時到達極端點。",
    model: "小角度振盪解析式視覺化；不是互相耦合擺錘的數值解算。",
  },
  {
    key: "domino",
    title: "骨牌・接觸連鎖",
    englishTitle: "Domino Contact Cascade",
    summary:
      "第一張骨牌緩慢傾倒，接觸力依序傳到下游；倒下後的停頓與節拍讓連鎖傳遞可讀。",
    capabilities: ["sequential-contact", "topple-propagation", "timed-cascade"],
    why: "以逐張接觸事件安排角度與延遲，突出連鎖時序，避免以同時翻倒的色塊假裝碰撞。",
    uses: ["流程連鎖與風險傳遞說明", "骨牌視覺轉場"],
    nonUses: ["骨牌穩定性預測", "接觸摩擦與衝擊能量分析"],
    instructions: "從首張骨牌追蹤觸發順序至末端，再觀察循環重設。",
    model: "按接觸順序設計的角度動畫，未使用剛體碰撞引擎。",
  },
  {
    key: "debris",
    title: "碎片・爆裂與落地",
    englishTitle: "Rigid Debris Burst and Settle",
    summary:
      "中央石塊爆裂成不同大小的幾何碎片，碎片受初速度、重力與旋轉影響，最後收斂回完整構圖。",
    capabilities: ["projectile-motion", "angular-rotation", "impact-burst"],
    why: "逐片拋射軌跡與尺寸分布讓爆裂密度和落地方向可控；以可逆週期式軌跡避免狀態累積及不可 seek。",
    uses: ["影片轉場碎裂效果", "產品結構或岩體碎片概念"],
    nonUses: ["結構破壞工程", "任意網格破碎與真實碎片碰撞"],
    instructions: "觀察碎片由中心向外拋出、旋轉、下落與循環收束。",
    model: "可逆的碎片軌跡合成，未解算材料破壞或碎片間碰撞。",
  },
  {
    key: "billiards",
    title: "彈性碰撞・動量交換",
    englishTitle: "Elastic Collision Momentum Transfer",
    summary:
      "球體沿可預測路徑相撞並交換速度，桌邊反彈及軌跡短線展示碰撞前後的方向變化。",
    capabilities: [
      "elastic-collision",
      "momentum-transfer",
      "boundary-reflection",
    ],
    why: "以解析碰撞時刻與反射路徑展示等質量理想彈性碰撞，便於任意 frame 重建且易於看懂。",
    uses: ["基礎力學教學", "桌球或碰撞主題動態圖表"],
    nonUses: ["真實球體自旋分析", "非彈性碰撞、摩擦或競賽預測"],
    instructions: "追蹤主球接觸後速度方向改變，以及桌面邊界反射。",
    model: "理想化等質量彈性碰撞視覺示意，非實驗數據或通用碰撞求解器。",
  },
  {
    key: "membrane",
    title: "薄膜・駐波模態",
    englishTitle: "Membrane Standing Wave Modes",
    summary:
      "矩形薄膜邊界固定，兩組空間模態以不同頻率疊加形成節線、波腹和細密反光。",
    capabilities: [
      "standing-wave-modes",
      "fixed-boundary",
      "wave-interference",
    ],
    why: "空間與時間分離的駐波模態直接顯示節線和振幅節點，特別適合以相位控制任意畫格。",
    uses: ["材料振動與聲學概念圖", "技術解說片中的薄膜視覺"],
    nonUses: ["膜片共振頻率判定", "非線性材料疲勞或模態分析"],
    instructions: "留意固定邊界、交錯波腹與隨頻率疊加形成的節線。",
    model: "理想邊界條件下的解析模態，無材料參數或有限元素分析。",
  },
  {
    key: "rope",
    title: "繩索・行進波與反射",
    englishTitle: "Rope Traveling Wave Reflection",
    summary:
      "一個波脈衝沿張緊繩索傳播，在末端反射並與後續波形疊加；多股線束強化受力方向。",
    capabilities: ["traveling-wave", "wave-reflection", "superposition"],
    why: "用解析波函數展示行進、末端反射及疊加；相位由絕對時間決定，不會累積繩節位置誤差。",
    uses: ["物理教育動畫", "繩索或纖維產品視覺"],
    nonUses: ["承載與斷裂測試", "含摩擦節點與複雜繩結模擬"],
    instructions: "從左端觀察脈衝行進，於右端反射後與後續波疊加。",
    model: "一維繩波近似；不求解真實繩索材料、張力變化或結點摩擦。",
  },
  {
    key: "orbit",
    title: "重力井・橢圓軌道",
    englishTitle: "Gravity Well Elliptic Orbits",
    summary:
      "多個天體沿不同離心率的封閉軌道運行，重力井、軌道線和殘影顯示週期與角速度差。",
    capabilities: [
      "elliptic-orbit",
      "orbital-period",
      "multi-body-visualization",
    ],
    why: "Kepler 形式的參數軌道可直接以週期和偏心率求任一時間狀態；若要多體攝動需加入數值積分。",
    uses: ["天文科普與資料敘事", "太空題材的資訊圖表"],
    nonUses: ["星曆、近地天體或航天任務導航", "N-body 長期穩定性計算"],
    instructions: "比較橢圓軌道上近星點和遠星點的表觀速度。",
    model: "封閉參數軌道示意，不是多體重力積分或真實天文位置。",
  },
  {
    key: "whirlpool",
    title: "漩渦・角動量內聚",
    englishTitle: "Whirlpool Angular Momentum Inflow",
    summary:
      "水面紋線逐漸向中心收束並加速旋轉，薄光環和泡沫點呈現旋渦半徑與角速度差。",
    capabilities: ["vortex-advection", "angular-momentum", "radial-inflow"],
    why: "半徑依速度場與角度相位變化，讓向心流動、旋轉和表面紋理同步可見。",
    uses: ["水域資料敘事的視覺比喻", "漩渦轉場與水面氛圍"],
    nonUses: ["排水安全評估", "真實速度場或渦量測量"],
    instructions: "由外圈沿螺旋向中心追蹤泡沫與波紋的移動。",
    model: "程序式 2D 旋渦流線，不代表三維自由液面求解。",
  },
  {
    key: "fountain",
    title: "噴泉・拋體水柱",
    englishTitle: "Fountain Ballistic Water Jets",
    summary:
      "多組噴嘴以不同相位送出拋物線水柱，水滴上升後回落，中央主流與周邊弧線分層呈現。",
    capabilities: ["ballistic-trajectory", "phased-emission", "gravity-fall"],
    why: "拋體方程與分批噴射把弧線高度、落點和節拍連在同一套時間參數中，可預覽也可 seek。",
    uses: ["建築水景概念演示", "清潔與飲品液體廣告"],
    nonUses: ["真實噴嘴流量或水壓計算", "泵浦與水景工程設計"],
    instructions: "觀察中央水柱與外側噴流的出射相位、最高點和落點。",
    model: "拋體水珠與水柱線稿，不含噴射壓力或液體破碎求解。",
  },
  {
    key: "shockwave",
    title: "壓力波・同心折射前緣",
    englishTitle: "Pressure Shockwave Refraction",
    summary:
      "瞬時壓力擾動由中心向外傳遞，疊層波前、折射環及稀薄尾跡讓速度與方向可見。",
    capabilities: [
      "wavefront-propagation",
      "pressure-pulse",
      "refraction-rings",
    ],
    why: "可控的徑向波前適合表達壓力脈衝的傳遞與衰減，並保留足夠留白呈現波面形變。",
    uses: ["聲波／衝擊波概念圖", "產品衝擊感轉場"],
    nonUses: ["爆炸超壓或結構損傷預測", "高馬赫數可壓縮流分析"],
    instructions: "觀察中心脈衝沿橢圓波前向外傳播並逐步衰減。",
    model: "風格化 2D 壓力環，沒有可壓縮流求解或物理尺度。",
  },
  {
    key: "magnetic",
    title: "磁場・鐵粉取向",
    englishTitle: "Magnetic Dipole Iron Filings",
    summary:
      "偶極磁場線與微小鐵粉沿局部方向排列，極點位置和場線密度建立清晰的磁場閱讀順序。",
    capabilities: ["dipole-field", "orientation-alignment", "vector-field"],
    why: "用偶極向量場求每個鐵粉方向，讓抽象場線和實物材料的排列方式互相對照。",
    uses: ["電磁概念教學", "磁性產品視覺與技術說明"],
    nonUses: ["磁場實測或電磁元件規格", "磁性顆粒動力學求解"],
    instructions: "比較偶極兩側場線方向與鐵粉取向，留意場強隨距離下降。",
    model: "理想平面偶極場方向示意；未模擬顆粒間作用或磁場實測。",
  },
  {
    key: "dust",
    title: "塵旋・熱對流柱",
    englishTitle: "Dust Devil Thermal Convection",
    summary:
      "地表熱點推起塵柱，粒子沿旋轉路徑上升並向外擴散；遠近顆粒和暖色逆光強化尺度。",
    capabilities: [
      "thermal-convection",
      "rotating-advection",
      "particle-dispersion",
    ],
    why: "以徑向擴張和高度函數組合形成旋轉塵柱，將上升對流與顆粒散逸分離控制。",
    uses: ["荒漠場景氛圍", "乾燥氣候或沙塵資訊敘事"],
    nonUses: ["龍捲風／塵暴危害預測", "真實地表熱通量或粒徑擴散分析"],
    instructions: "由地表熱源向上追蹤塵粒旋轉、擴張與淡出。",
    model: "可視化旋轉對流柱，不等同實際塵旋或大氣 CFD。",
  },
  {
    key: "paper",
    title: "紙片・升力翻轉",
    englishTitle: "Paper Flutter Lift and Drag",
    summary:
      "薄紙沿氣流反覆翻轉，折線兩翼因升力和阻力差產生不同振幅，紙面高光交替揭示正反面。",
    capabilities: ["flutter-instability", "lift-drag-cycle", "thin-sheet-fold"],
    why: "相位不同的翼面波形與轉角能表現薄片受流後的非穩態翻轉；幾何仍受限在易讀的平面構圖。",
    uses: ["包裝與印刷品動態視覺", "自然風中的紙片轉場"],
    nonUses: ["紙張空氣動力係數", "真實折痕、撕裂或自碰撞模擬"],
    instructions: "觀察中心折線、翼面翻轉和紙背明暗交替。",
    model: "薄片升阻力外觀的解析近似，非流固耦合求解。",
  },
  {
    key: "buoyancy",
    title: "浮體・排水回復力",
    englishTitle: "Floating Body Restoring Force",
    summary:
      "物體隨水面小幅升沉和傾斜，排水量變化形成回復節奏，水線反光與倒影強化接觸面。",
    capabilities: [
      "buoyant-restoring-force",
      "heave-and-roll",
      "waterline-contact",
    ],
    why: "使用有界升沉與傾斜函數對應浮體回復運動，避免背景水面與物體同幅平移。",
    uses: ["產品浮水展示", "船舶穩定概念動畫"],
    nonUses: ["船舶適航與穩性判定", "真實排水體積或波浪載荷分析"],
    instructions: "比較浮體升沉、微幅側傾與固定參考水線。",
    model: "小幅週期浮動的視覺化，不計算浮力、質量分布或波浪載荷。",
  },
  {
    key: "crystal",
    title: "晶體・枝狀沉積",
    englishTitle: "Dendritic Crystal Deposition",
    summary:
      "晶枝由核心沿固定晶向逐步生長，側枝依序分岔，切面亮線和微晶粉末呈現沉積層級。",
    capabilities: [
      "dendritic-growth",
      "branching-deposition",
      "crystal-facets",
    ],
    why: "有方向性的枝晶生長規則比通用粒子擴散更能清楚表達晶體的主軸、側枝與對稱關係。",
    uses: ["冬季晶體視覺與科技品牌片", "材料結構的概念圖解"],
    nonUses: ["晶體尺寸或相圖預測", "真實結晶動力學與材料研發"],
    instructions: "觀察主晶軸延長、側枝逐級形成及切面高光。",
    model: "固定晶向的程序式枝晶視覺，不是相場或分子動力學模擬。",
  },
  {
    key: "avalanche",
    title: "雪崩・坡面失穩",
    englishTitle: "Slope Failure Snow Avalanche",
    summary:
      "坡面雪層由弱層起裂，破壞前緣逐步下移，大小不同的雪塊與粉雪尾流拉開速度層次。",
    capabilities: ["slope-failure-front", "granular-cascade", "debris-cloud"],
    why: "以分批破壞前緣和雙尺度顆粒雲呈現失穩蔓延，比整團同步移動更能讀出起裂與後續衝擊。",
    uses: ["雪崩安全概念教育", "山岳題材的電影化圖解"],
    nonUses: ["雪崩風險預測或撤離決策", "坡度、雪層或地形資料分析"],
    instructions: "追蹤坡面初始裂口、前緣擴展、粉雪尾流與堆積區。",
    model: "合成坡面失穩序列，並非雪崩地形模型或危險評估。",
  },
  {
    key: "plasma",
    title: "太陽日珥・磁環噴發",
    englishTitle: "Solar Plasma Magnetic Loop Ejection",
    summary:
      "日冕磁環沿弧線抬升，亮色電漿沿磁力線流動，外拋粒子和中心輻射形成多層日珥。",
    capabilities: ["magnetic-loop-arc", "plasma-ejection", "coronal-glow"],
    why: "用磁環曲線、沿線粒子及分層日冕輝光建立電漿方向感，同時讓週期和曝光強度可逐格控制。",
    uses: ["太空科普與太陽主題視覺", "科技產品影片背景"],
    nonUses: ["太陽活動預警", "磁流體日冕模型或衛星資料分析"],
    instructions: "沿磁環觀察亮點流動，留意拋射與外層日冕光暈的先後。",
    model: "風格化磁環與輻射視覺，不是太陽觀測資料或 MHD 解算。",
  },
];
const sharedAdapter =
  "The browser showcase exposes a seek(timeSeconds) function and computes the core motion from an absolute cycle phase. To use Remotion, call the same pure scene update from useCurrentFrame()/fps (or an explicit adapter); do not add an independent requestAnimationFrame clock. Interaction-triggered impulses need timestamped inputs for deterministic export. The current gallery runtime is not a scientific simulator.";
const shaderVariants = new Set([
  "fire",
  "smoke",
  "splash",
  "lightning",
  "lava",
  "plasma",
]);
const pixiVariants = new Set(["snow", "sandfall"]);
export const physicsElementCases: CaseDefinition[] = seeds.map((x, i) => {
  const s = physicsElementScenes[i];
  const usesShader = shaderVariants.has(x.key);
  const usesPixi = pixiVariants.has(x.key);
  return {
    id: `SA-${String(196 + i).padStart(3, "0")}`,
    durationSeconds: 8,
    title: x.title,
    englishTitle: x.englishTitle,
    summary: x.summary,
    primary: usesShader ? "threejs" : usesPixi ? "pixijs" : "canvas2d",
    capabilities: usesShader
      ? [...x.capabilities, "procedural-fragment-shader"]
      : usesPixi
        ? [...x.capabilities, "gpu-particle-container"]
        : x.capabilities,
    module: usesShader
      ? "physics-element-gpu.ts"
      : usesPixi
        ? "physics-element-pixi.ts"
        : "physics-elements.ts",
    variant: x.key,
    renderer: usesShader
      ? "Three.js WebGLRenderer · GLSL"
      : usesPixi
        ? "PixiJS WebGL ParticleContainer"
        : "Canvas 2D",
    interaction: ["timeline", "pointer", "keyboard", "touch"],
    direction: s.direction,
    rationale: `${s.direction}；${x.summary}`,
    why: x.why,
    uses: x.uses,
    nonUses: x.nonUses,
    instructions: x.instructions,
    limitations: [
      x.model,
      "Original synthetic artwork and fixed procedural constants; no external service, live data, or third-party asset.",
      "Touch hardware and physical Safari have not been tested.",
    ],
    fallback:
      usesShader || usesPixi
        ? "If the GPU renderer is unavailable, fall back to the companion Canvas 2D rendition; keep the lower renderer fidelity visible in the case details."
        : "Use the generated poster; if Canvas 2D is unavailable, preserve the case description and report that the live simulation did not start.",
    visual: {
      background: s.background,
      foreground: s.ink,
      accent: s.accent,
      font: "Arial, sans-serif",
    },
    locked: [
      `Preserve the demonstrated motion model: ${x.capabilities.join(", ")}.`,
      "Use a single seekable time source, deterministic geometry, bounded draw count and explicit resource cleanup.",
      "Keep the animation full-bleed and case-specific; do not add unrelated side copy or inherit the legacy illustration collection's art direction.",
      "Keep the 8-second loop composition and ending continuous with its starting motion; inspect the encoded loop, not only a still frame.",
    ],
    editable: [
      "Replace the synthetic labels and theme with production-approved content while keeping the motion legible.",
      "Choose an independent palette, lighting, composition and material language appropriate to the new case.",
      "Adjust bounded particle count, scale and timing after checking the full loop and target viewport.",
    ],
    adaptation: sharedAdapter,
    dependencies: usesShader ? ["three"] : usesPixi ? ["pixi.js"] : [],
    assets: [],
    video: "adapter-required",
    complexity: "medium",
  };
});
