import React from "react";
import {
  Canvas,
  Text,
  Line,
  Media,
  Cross,
  Ring,
  CornerMarks,
  beat,
  wave,
  turn,
  sans,
  serif,
  mono,
  type RecipeProps,
} from "./helpers";
const polygon = (x: number, y: number, r: number, count: number, offset = 0) =>
  Array.from(
    { length: count },
    (_, i) =>
      `${x + Math.cos((i * Math.PI * 2) / count + offset) * r},${y + Math.sin((i * Math.PI * 2) / count + offset) * r}`,
  ).join(" ");

const TilePress: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const step = Math.round(beat(p) * 5) / 5;
  return (
    <Canvas background={bg}>
      <Text x={52} y={90} size={39} color={fg} weight={800}>
        PRESS / PLAY
      </Text>
      <Text x={52} y={134} size={22} color={fg}>
        把想像，一塊塊拼起。
      </Text>
      <Text x={1198} y={87} size={20} color={fg} anchor="end" font={mono}>
        STUDY 057
      </Text>
      {Array.from({ length: 12 }, (_, i) => {
        const x = 58 + (i % 4) * 292,
          y = 184 + Math.floor(i / 4) * 146,
          offset = (i % 2 ? 1 : -1) * step * 16;
        return (
          <g
            key={i}
            transform={`translate(${offset},${-Math.floor(i / 4) * step * 9})`}
          >
            <rect
              x={x + 6}
              y={y + 7}
              width={274}
              height={128}
              rx={5}
              fill={fg}
              opacity={0.2}
            />
            <rect
              x={x}
              y={y}
              width={274}
              height={128}
              rx={5}
              fill={i % 3 === 0 ? a : s}
            />
            {i % 3 === 0 ? (
              <circle cx={x + 137} cy={y + 64} r={42} fill={bg} />
            ) : i % 3 === 1 ? (
              <path d={`M${x + 88} ${y + 94}l49-74 49 74Z`} fill={fg} />
            ) : (
              <path
                d={`M${x + 64} ${y + 66}h146m-44-38 44 38-44 38`}
                stroke={fg}
                strokeWidth={14}
                fill="none"
              />
            )}
            <Text x={x + 14} y={y + 26} size={13} color={fg} font={mono}>
              {String(i + 1).padStart(2, "0")}
            </Text>
          </g>
        );
      })}
      <Text x={58} y={684} size={16} color={fg} spacing={4}>
        TWELVE MODULES. FIVE MEASURED STEPS.
      </Text>
    </Canvas>
  );
};
const TransitFlaps: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const flip = 1 - 0.72 * beat(p, 0.12, 0.26, 0.6, 0.82);
  return (
    <Canvas background={bg}>
      <Text x={57} y={96} size={61} color={fg} weight={700}>
        DEPARTURES
      </Text>
      <Text x={1194} y={89} size={22} color={a} anchor="end" font={mono}>
        2026 / 08:45
      </Text>
      <Text x={60} y={142} size={23} color={fg}>
        下一站，新的可能。
      </Text>
      <Text x={60} y={207} size={15} color={s} spacing={3}>
        TIME
      </Text>
      <Text x={288} y={207} size={15} color={s} spacing={3}>
        DESTINATION
      </Text>
      <Text x={1100} y={207} size={15} color={s} spacing={3}>
        GATE
      </Text>
      {["NORTH", "STUDIO", "GARDEN", "FUTURE"].map((word, row) => (
        <g key={word}>
          <Text x={60} y={280 + row * 95} size={39} color={a} font={mono}>
            {["09:12", "10:08", "10:36", "11:24"][row]}
          </Text>
          {word
            .padEnd(7, " ")
            .split("")
            .map((letter, col) => (
              <g
                key={col}
                transform={`translate(0,${(264 + row * 95) * (1 - flip)}) scale(1,${flip})`}
              >
                <rect
                  x={290 + col * 105}
                  y={234 + row * 95}
                  width={92}
                  height={72}
                  rx={3}
                  fill={s}
                />
                <Text
                  x={336 + col * 105}
                  y={288 + row * 95}
                  size={53}
                  color={fg}
                  anchor="middle"
                  font={mono}
                >
                  {letter}
                </Text>
                <Line
                  x1={292 + col * 105}
                  x2={380 + col * 105}
                  y1={270 + row * 95}
                  y2={270 + row * 95}
                  color={bg}
                  width={2}
                />
              </g>
            ))}
          <Text
            x={1189}
            y={280 + row * 95}
            size={37}
            color={a}
            anchor="end"
            font={mono}
          >
            {row + 1}
          </Text>
        </g>
      ))}
      <Line x1={60} y1={648} x2={1200} y2={648} color={s} />
      <Text x={60} y={683} size={16} color={s} spacing={3}>
        FICTIONAL DESTINATIONS / MECHANICAL LETTERFORM STUDY
      </Text>
    </Canvas>
  );
};
const TypeScroll: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const shift = beat(p, 0.04, 0.32, 0.64, 0.98) * 192;
  return (
    <Canvas background={bg}>
      <Text x={62} y={90} size={20} color={fg} spacing={4}>
        WORDS IN TRANSIT
      </Text>
      <Text x={64} y={257} size={95} color={a} font={serif}>
        Read.
      </Text>
      <Text x={64} y={325} size={27} color={fg}>
        閱讀，持續向前。
      </Text>
      <Line x1={66} y1={376} x2={303} y2={376} color={fg} />
      <Text x={66} y={425} size={18} color={fg} spacing={2}>
        A VERTICAL TEXT SCORE
      </Text>
      <Text x={66} y={658} size={58} color={fg} font={mono}>
        03 / 09
      </Text>
      <defs>
        <clipPath id="b-scroll">
          <rect x={439} y={39} width={783} height={642} />
        </clipPath>
      </defs>
      <g clipPath="url(#b-scroll)">
        <g transform={`translate(0,${-shift})`}>
          {[
            "MAKE ROOM",
            "FOR NEW",
            "WAYS TO",
            "LOOK AT",
            "THE WORLD",
            "IN MOTION",
            "AND HOLD",
            "THAT THOUGHT",
            "FOR A MOMENT",
          ].map((t, i) => (
            <Text
              key={t}
              x={455}
              y={113 + i * 112}
              size={86}
              color={i % 3 === 0 ? a : fg}
              weight={800}
              spacing={-3}
            >
              {t}
            </Text>
          ))}
        </g>
      </g>
      <Line x1={408} y1={40} x2={408} y2={680} color={fg} />
    </Canvas>
  );
};
const IrisContact: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const radius = 124 + beat(p) * 34;
  return (
    <Canvas background={bg}>
      <Text x={52} y={89} size={37} color={fg} font={serif}>
        Through another lens.
      </Text>
      <Text x={1193} y={86} size={17} color={a} anchor="end" font={mono}>
        CONTACT / 060
      </Text>
      <rect x={35} y={169} width={1210} height={386} fill="#101010" />
      {["architecture", "botanical", "product"].map((asset, i) => (
        <g key={asset}>
          <defs>
            <clipPath id={`b-iris-${i}`}>
              <circle cx={244 + i * 396} cy={361} r={radius} />
            </clipPath>
          </defs>
          <g clipPath={`url(#b-iris-${i})`}>
            <Media
              asset={asset}
              x={67 + i * 396}
              y={184}
              width={354}
              height={354}
              scale={1.03 + 0.04 * turn(p)}
            />
          </g>
          <Ring x={244 + i * 396} y={361} r={173} color={a} width={2} />
          <Text
            x={244 + i * 396}
            y={599}
            size={18}
            color={fg}
            anchor="middle"
            font={mono}
          >
            FRAME 0{i + 1} / F 2.8
          </Text>
        </g>
      ))}
      {Array.from({ length: 28 }, (_, i) => (
        <g key={i}>
          <rect
            x={51 + i * 43}
            y={178}
            width={22}
            height={12}
            rx={2}
            fill={bg}
          />
          <rect
            x={51 + i * 43}
            y={534}
            width={22}
            height={12}
            rx={2}
            fill={bg}
          />
        </g>
      ))}
      <Text x={56} y={658} size={29} color={fg}>
        從框線之外，重新看見。
      </Text>
    </Canvas>
  );
};
const InkBloom: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const d = 24 * wave(p);
  const blob = `M786 113C945 ${57 + d} 1160 124 1174 283C1253 423 1090 602 962 575C818 693 609 597 636 437C522 ${252 - d} 648 105 786 113Z`;
  return (
    <Canvas background={bg}>
      <defs>
        <clipPath id="b-ink">
          <path d={blob} />
        </clipPath>
      </defs>
      <g clipPath="url(#b-ink)">
        <Media
          asset="botanical"
          x={536}
          y={76}
          width={686}
          height={580}
          scale={1.07 + 0.025 * turn(p)}
          filter="grayscale(1) contrast(1.18)"
        />
        <rect x={536} y={76} width={686} height={580} fill={a} opacity={0.34} />
      </g>
      <path d={blob} fill="none" stroke={fg} strokeWidth={1} />
      <Text x={55} y={118} size={23} color={fg} spacing={4}>
        LIQUID IMPRESSIONS
      </Text>
      <Text x={57} y={322} size={126} color={fg} font={serif}>
        Fluid.
      </Text>
      <Text x={63} y={385} size={28} color={fg}>
        形狀，保持開放。
      </Text>
      <Line x1={64} y1={444} x2={345} y2={444} color={fg} />
      <Text x={64} y={488} size={18} color={fg}>
        INK / IMAGE / ORGANIC EDGE
      </Text>
      <Text x={62} y={665} size={16} color={fg} spacing={3}>
        PROCEDURAL MASK / NOT A FLUID SIMULATION
      </Text>
    </Canvas>
  );
};
const SoftIcons: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={60} y={111} size={72} color={fg} weight={800} spacing={-3}>
        SOFT SIGNALS
      </Text>
      <Text x={64} y={160} size={26} color={fg}>
        柔軟，也有清楚的態度。
      </Text>
      {[
        [194, 421, 0],
        [485, 369, 1],
        [764, 452, 2],
        [1042, 344, 3],
      ].map(([x, y, i]) => (
        <g key={i}>
          <ellipse
            cx={x + 4}
            cy={y + 124}
            rx={107}
            ry={15}
            fill={fg}
            opacity={0.11}
          />
          <g
            transform={`translate(${x},${y - 23 * b * (i % 2 ? 1 : 0.6)}) scale(${1 + 0.025 * b},${1 - 0.045 * b})`}
          >
            <path
              d={
                i === 0
                  ? "M-68-42C-111-92-132-1-60 54L0 105 60 54C132-1 111-92 68-42L0 16Z"
                  : i === 1
                    ? "M-88-63H88V70H-88Z"
                    : i === 2
                      ? "M-91-17H4V-82L104 10 4 100V38H-91Z"
                      : "M0-110 26-36 104-34 44 13 64 92 0 43-64 92-44 13-104-34-26-36Z"
              }
              fill={i % 2 ? a : s}
            />
            <path
              d="M-57-40Q-12-75 39-43"
              fill="none"
              stroke={bg}
              strokeWidth={12}
              strokeLinecap="round"
              opacity={0.42}
            />
          </g>
          <Text
            x={x}
            y={y + 183}
            size={17}
            color={fg}
            anchor="middle"
            font={mono}
          >
            ICON / 0{i + 1}
          </Text>
        </g>
      ))}
      <Text x={62} y={680} size={15} color={fg} spacing={3}>
        FLAT VECTOR MATERIAL / SQUASH + LIFT / 2.5D STUDY
      </Text>
    </Canvas>
  );
};
const ModularSignal: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={58} y={98} size={52} color={fg} weight={800}>
        SIGNAL / SYSTEM
      </Text>
      <Text x={1196} y={96} size={19} color={fg} anchor="end" font={mono}>
        CHANNEL 07
      </Text>
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <path
            d={`M62 ${206 + row * 102}H${388 + row * 38}V${238 + row * 102}H1200`}
            fill="none"
            stroke={s}
            strokeWidth={4}
          />
          {Array.from({ length: 7 }, (_, col) => (
            <g
              key={col}
              transform={`translate(${Math.round(wave(p) * 3) * 12 * (row % 2 ? -1 : 1)},0)`}
            >
              <rect
                x={91 + col * 153}
                y={184 + row * 102}
                width={55 + row * 7}
                height={47}
                fill={(row + col) % 3 === 0 ? a : fg}
              />
              <Line
                x1={105 + col * 153}
                y1={201 + row * 102}
                x2={130 + col * 153}
                y2={201 + row * 102}
                color={bg}
                width={3}
              />
            </g>
          ))}
        </g>
      ))}
      <Text x={58} y={682} size={24} color={fg}>
        讓訊息，有自己的路徑。
      </Text>
    </Canvas>
  );
};
const PaperFold: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  const fold = 130 + 128 * b;
  return (
    <Canvas background={bg}>
      <Text x={61} y={94} size={21} color={fg} spacing={5}>
        THE LANGUAGE OF A CREASE
      </Text>
      <Text x={60} y={261} size={111} color={fg} font={serif}>
        Fold.
      </Text>
      <Text x={64} y={322} size={28} color={fg}>
        平面之中，藏著空間。
      </Text>
      <Text x={64} y={605} size={17} color={fg} spacing={2}>
        ONE SHEET / THREE PLANES
      </Text>
      <Text x={64} y={648} size={51} color={a} font={mono}>
        064
      </Text>
      <polygon
        points="617,139 1061,91 1210,582 732,636"
        fill={fg}
        opacity={0.12}
      />
      <polygon points={`597,119 1041,71 ${1188 - fold},545 712,616`} fill={s} />
      <polygon points={`1041,71 ${1188 - fold},545 1188,545`} fill={a} />
      <polygon points={`597,119 712,616 ${865 - fold * 0.32},347`} fill={bg} />
      <Line
        x1={597}
        y1={119}
        x2={1188 - fold}
        y2={545}
        color={fg}
        opacity={0.3}
      />
      <Line
        x1={1041}
        y1={71}
        x2={1188 - fold}
        y2={545}
        color={fg}
        opacity={0.3}
      />
    </Canvas>
  );
};
const UrbanWayfinding: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <rect x={0} y={0} width={310} height={720} fill={a} />
      <Text x={47} y={93} size={24} color={bg} weight={800}>
        ZONE
      </Text>
      <Text x={31} y={338} size={246} color={bg} weight={900}>
        A
      </Text>
      <Text x={51} y={615} size={26} color={bg}>
        從這裡開始。
      </Text>
      {[
        ["NORTH HALL", "北側展廳", "→"],
        ["PLATFORM 02", "第二月台", "↗"],
        ["CITY GARDEN", "城市花園", "←"],
      ].map(([english, chinese, arrow], i) => (
        <g
          key={english}
          transform={`translate(${(i % 2 ? 1 : -1) * b * 19},0)`}
        >
          <rect
            x={365}
            y={85 + i * 190}
            width={832}
            height={159}
            fill={i === 1 ? s : fg}
          />
          <Text x={397} y={149 + i * 190} size={42} color={bg} weight={800}>
            {english}
          </Text>
          <Text x={400} y={202 + i * 190} size={26} color={bg}>
            {chinese}
          </Text>
          <Text x={1156} y={204 + i * 190} size={93} color={bg} anchor="end">
            {arrow}
          </Text>
        </g>
      ))}
      <Text x={371} y={680} size={16} color={fg} spacing={3}>
        ORIGINAL SIGNAGE / NO REAL NAVIGATION DATA
      </Text>
    </Canvas>
  );
};
const KineticPunctuation: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={53} y={90} size={20} color={fg} spacing={3}>
        SAY MORE. WITH LESS.
      </Text>
      <Text x={69} y={483 - b * 32} size={414} color={a} weight={900}>
        ?
      </Text>
      <Text x={479} y={327 + b * 39} size={307} color={fg} font={serif}>
        &amp;
      </Text>
      <g transform={`rotate(${b * 8},994,420)`}>
        <Text
          x={961}
          y={573 - b * 17}
          size={465}
          color={s}
          weight={900}
          anchor="middle"
        >
          !
        </Text>
      </g>
      <Text x={68} y={622} size={31} color={fg}>
        疑問，連結，驚嘆。
      </Text>
      <Text x={69} y={674} size={17} color={fg} spacing={4}>
        PUNCTUATION IS A MOTION LANGUAGE
      </Text>
      <Line x1={496} y1={386} x2={803} y2={386} color={fg} width={3} />
      <Text x={493} y={443} size={25} color={fg}>
        WHAT IF / AND THEN
      </Text>
    </Canvas>
  );
};
const CalendarLeaves: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={51} y={112} size={83} color={fg} font={serif}>
        October
      </Text>
      <Text x={53} y={163} size={24} color={fg}>
        把時間，留給重要的事。
      </Text>
      <Text x={1195} y={108} size={65} color={a} anchor="end" font={mono}>
        2026
      </Text>
      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => (
        <Text key={d} x={80 + i * 167} y={221} size={17} color={fg} font={mono}>
          {d}
        </Text>
      ))}
      {Array.from({ length: 35 }, (_, i) => {
        const x = 52 + (i % 7) * 167,
          y = 249 + Math.floor(i / 7) * 77;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={155}
              height={68}
              fill={i === 12 || i === 23 ? a : s}
              opacity={i === 12 || i === 23 ? 0.5 + 0.4 * b : 1}
            />
            <Text x={x + 14} y={y + 47} size={27} color={fg} font={mono}>
              {i < 31 ? String(i + 1).padStart(2, "0") : ""}
            </Text>
            {i === 12 && (
              <path d={`M${x + 116} ${y}h39v${22 + 15 * b}Z`} fill={bg} />
            )}
          </g>
        );
      })}
      <Text x={55} y={683} size={16} color={fg} spacing={3}>
        A MONTH / A RHYTHM / A READABLE HOLD
      </Text>
    </Canvas>
  );
};
const SonarDepth: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <g opacity={0.22}>
        {Array.from({ length: 13 }, (_, i) => (
          <Line
            key={i}
            x1={42 + i * 59}
            x2={42 + i * 59}
            y1={45}
            y2={674}
            color={s}
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <Line
            key={i}
            x1={40}
            x2={789}
            y1={44 + i * 63}
            y2={44 + i * 63}
            color={s}
          />
        ))}
      </g>
      {[85, 160, 235, 309].map((r) => (
        <Ring key={r} x={405} y={359} r={r} color={s} opacity={0.55} />
      ))}
      <g transform={`rotate(${p * 360},405,359)`}>
        <path
          d="M405 359 690 220A315 315 0 0 1 716 380Z"
          fill={a}
          opacity={0.08}
        />
        <Line x1={405} y1={359} x2={692} y2={221} color={a} width={3} />
      </g>
      <circle cx={528} cy={225} r={7 + 4 * turn(p)} fill={a} />
      <Cross x={271} y={452} color={a} size={11} />
      <Cross x={405} y={359} color={fg} size={14} />
      <Text x={844} y={109} size={20} color={a} spacing={4}>
        DEEP FIELD
      </Text>
      <Text x={844} y={242} size={77} color={fg} weight={700}>
        Listen
      </Text>
      <Text x={844} y={327} size={77} color={fg} weight={700}>
        below.
      </Text>
      <Text x={847} y={392} size={27} color={fg}>
        看不見的，也有訊號。
      </Text>
      <Line x1={847} y1={451} x2={1200} y2={451} color={s} />
      <Text x={847} y={501} size={23} color={a} font={mono}>
        DEPTH / 028.4
      </Text>
      <Text x={847} y={550} size={17} color={fg} font={mono}>
        ILLUSTRATIVE DATA ONLY
      </Text>
    </Canvas>
  );
};
const ThermalContours: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const w = wave(p) * 12;
  return (
    <Canvas background={bg}>
      <Text x={59} y={98} size={19} color={fg} spacing={4}>
        PATTERNS OF ENERGY
      </Text>
      <Text x={61} y={254} size={75} color={fg} weight={700}>
        HEAT
      </Text>
      <Text x={61} y={333} size={75} color={fg} weight={700}>
        LEAVES
      </Text>
      <Text x={61} y={412} size={75} color={fg} weight={700}>
        A TRACE.
      </Text>
      <Text x={65} y={478} size={27} color={fg}>
        以輪廓，閱讀溫度。
      </Text>
      {["#573768", "#7c4872", a, "#f39866", "#f4cc82"].map((color, i) => (
        <path
          key={color}
          d={`M${842 + i * 6} ${77 + i * 49}C${1085 - i * 23} ${64 + i * 45 + w} ${1242 - i * 42} ${262 + i * 11} ${1133 - i * 39} ${476 - i * 18}C${1083 - i * 21} ${665 - i * 37} ${757 + i * 24} ${717 - i * 49} ${676 + i * 39} ${510 - i * 7}C${572 + i * 63} ${293 + i * 15 - w} ${665 + i * 44} ${112 + i * 45} ${842 + i * 6} ${77 + i * 49}Z`}
          fill={color}
        />
      ))}
      <Text x={68} y={644} size={16} color={fg} font={mono}>
        SIMULATED CONTOURS / NOT SENSOR FOOTAGE
      </Text>
      <Line x1={65} y1={584} x2={347} y2={584} color={fg} />
      <Text x={1176} y={682} size={18} color={fg} anchor="end" font={mono}>
        069 / ENERGY STUDY
      </Text>
    </Canvas>
  );
};
const RouteTopography: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={52} y={93} size={26} color={fg} spacing={3}>
        FOLLOW THE TERRAIN
      </Text>
      <Text x={53} y={145} size={22} color={fg}>
        把遠方，走成一條線。
      </Text>
      <defs>
        <clipPath id="b-topo">
          <rect x={39} y={194} width={821} height={469} />
        </clipPath>
      </defs>
      <g clipPath="url(#b-topo)">
        {Array.from({ length: 15 }, (_, i) => (
          <path
            key={i}
            d={`M${-100 + i * 40} 701C${-39 + i * 17} ${480 - i * 12} ${350 - i * 12} ${513 - i * 20} ${381 + i * 22} ${322 - i * 14}S${788 + i * 14} ${153 + i * 15} ${985 + i * 21} 57`}
            fill="none"
            stroke={s}
            strokeWidth={2}
          />
        ))}
        <path
          d="M98 596C213 493 313 579 400 416S580 457 663 302 739 363 800 228"
          fill="none"
          stroke={a}
          strokeWidth={7}
          strokeDasharray="1100"
          strokeDashoffset={-(1 - b) * 390}
        />
        <circle cx={98} cy={596} r={10} fill={a} />
        <circle cx={800} cy={228} r={10} fill={a} />
      </g>
      <Line x1={902} y1={191} x2={902} y2={665} color={fg} />
      <Text x={940} y={256} size={58} color={fg} font={mono}>
        12.8
      </Text>
      <Text x={942} y={292} size={17} color={fg} spacing={2}>
        FICTIONAL KILOMETRES
      </Text>
      <Text x={942} y={400} size={24} color={fg}>
        Elevation profile
      </Text>
      <path
        d="M946 567 981 525 1017 539 1047 469 1098 486 1166 402 1215 432"
        stroke={a}
        strokeWidth={4}
        fill="none"
      />
      <Text x={942} y={648} size={17} color={fg}>
        CONTOUR / ROUTE / HEIGHT
      </Text>
    </Canvas>
  );
};
const BotanicalAnatomy: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p) * 8;
  return (
    <Canvas background={bg}>
      <Text x={59} y={104} size={52} color={fg} font={serif}>
        Anatomy of growth.
      </Text>
      <Text x={62} y={151} size={25} color={fg}>
        每片葉子，都有它的秩序。
      </Text>
      <g transform={`translate(${w},0)`}>
        <path
          d="M670 647Q621 395 749 201"
          fill="none"
          stroke={a}
          strokeWidth={8}
        />
        {Array.from({ length: 9 }, (_, i) => {
          const x = 685 + i * 6,
            y = 585 - i * 43,
            side = i % 2 ? 1 : -1;
          return (
            <g key={i}>
              <path
                d={`M${x} ${y}Q${x + side * 118} ${y - 111} ${x + side * 166} ${y - 66}Q${x + side * 116} ${y + 20} ${x} ${y}Z`}
                fill={i % 3 === 0 ? s : a}
              />
              <path
                d={`M${x} ${y}l${side * 153} -65`}
                fill="none"
                stroke={bg}
                strokeWidth={2}
              />
            </g>
          );
        })}
      </g>
      {[
        [322, 291, 681, 346, "01 / VEIN"],
        [908, 370, 796, 415, "02 / LEAF"],
        [325, 530, 659, 547, "03 / STEM"],
      ].map(([x, y, tx, ty, t], i) => (
        <g key={i}>
          <path
            d={`M${tx} ${ty}H${Number(x) + (i === 1 ? 0 : 194)}V${y}H${x}`}
            stroke={fg}
            fill="none"
            strokeWidth={1}
          />
          <Text
            x={Number(x)}
            y={Number(y) - 13}
            size={19}
            color={fg}
            font={mono}
          >
            {t}
          </Text>
          <circle cx={Number(tx)} cy={Number(ty)} r={4} fill={fg} />
        </g>
      ))}
      <Text x={61} y={683} size={16} color={fg} spacing={3}>
        ORIGINAL BOTANICAL DIAGRAM / STYLISED, NOT SCIENTIFIC EVIDENCE
      </Text>
    </Canvas>
  );
};
const AcousticScore: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={57} y={97} size={71} color={fg} font={serif}>
        A score for silence.
      </Text>
      <Text x={61} y={146} size={24} color={fg}>
        聲音之前，先看見節奏。
      </Text>
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Line
              key={i}
              x1={62}
              x2={1200}
              y1={231 + row * 118 + i * 13}
              y2={231 + row * 118 + i * 13}
              color={fg}
              opacity={0.6}
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i} transform={`translate(${b * (i % 2 ? 12 : -12)},0)`}>
              <ellipse
                cx={141 + i * 150}
                cy={263 + row * 118 + (((i + row) % 4) - 2) * 9}
                rx={13}
                ry={9}
                fill={i % 3 === 0 ? a : fg}
                transform={`rotate(-24,${141 + i * 150},${263 + row * 118})`}
              />
              <Line
                x1={153 + i * 150}
                x2={153 + i * 150}
                y1={263 + row * 118 + (((i + row) % 4) - 2) * 9}
                y2={207 + row * 118}
                color={fg}
                width={3}
              />
            </g>
          ))}
        </g>
      ))}
      <Text x={63} y={666} size={19} color={fg} font={mono}>
        VISUAL SCORE / NO AUDIO-REACTIVE CLAIM
      </Text>
      <Text x={1196} y={666} size={19} color={a} anchor="end" font={mono}>
        ADAGIO / 072
      </Text>
    </Canvas>
  );
};
const MuseumLabels: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Media
        asset="product"
        x={55}
        y={75}
        width={723}
        height={570}
        scale={1.03 + 0.025 * turn(p)}
        filter="saturate(.55)"
      />
      <rect x={805} y={162} width={399} height={366} fill={a} opacity={0.1} />
      <Text x={841} y={219} size={16} color={fg} spacing={3}>
        OBJECT / 003
      </Text>
      <Text x={837} y={292} size={48} color={fg} font={serif}>
        Daily forms.
      </Text>
      <Text x={841} y={341} size={26} color={fg}>
        日常的形狀。
      </Text>
      <Line x1={841} y1={382} x2={1165} y2={382} color={fg} />
      <g opacity={0.7 + 0.3 * b}>
        <Text x={841} y={424} size={18} color={fg}>
          Glass, light, quiet attention.
        </Text>
        <Text x={841} y={465} size={16} color={fg}>
          Original sample / 2026
        </Text>
      </g>
      <Text x={63} y={688} size={16} color={fg} spacing={4}>
        THE ATLAS COLLECTION / LABEL FIRST, EXPLANATION SECOND
      </Text>
    </Canvas>
  );
};
const MedicalContours: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={58} y={96} size={34} color={fg} weight={700}>
        CONTOUR / OBSERVATION
      </Text>
      <Text x={1189} y={90} size={18} color={a} anchor="end" font={mono}>
        ILLUSTRATIVE / NOT DIAGNOSTIC
      </Text>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${398 + i * 25} ${169 + i * 13}C${218 + i * 30} ${209 + i * 21} ${269 + i * 18} ${459 - i * 18} ${338 + i * 20} ${502 - i * 13}L${330 + i * 23} ${603 - i * 20}H${579 - i * 21}L${565 - i * 9} ${521 - i * 11}Q${714 - i * 24} ${380 + i * 11} ${665 - i * 20} ${258 + i * 16}T${398 + i * 25} ${169 + i * 13}Z`}
          fill="none"
          stroke={i === 0 ? fg : s}
          strokeWidth={i === 0 ? 3 : 2}
        />
      ))}
      <Line
        x1={190}
        y1={244 + 285 * b}
        x2={728}
        y2={244 + 285 * b}
        color={a}
        width={3}
      />
      <Cross x={462} y={361} color={a} size={27} />
      <Line x1={791} y1={163} x2={791} y2={630} color={s} />
      <Text x={834} y={229} size={50} color={fg} font={mono}>
        SCAN 04
      </Text>
      <Text x={834} y={277} size={25} color={fg}>
        輪廓之內，還有輪廓。
      </Text>
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <Text x={836} y={354 + row * 91} size={15} color={s} font={mono}>
            PROFILE {row + 1}
          </Text>
          <path
            d={Array.from(
              { length: 42 },
              (_, i) =>
                `${i ? "L" : "M"}${836 + i * 8} ${390 + row * 91 + Math.sin(i * 0.49 + row) * 15 * (0.7 + 0.3 * b)}`,
            ).join("")}
            stroke={a}
            fill="none"
            strokeWidth={2}
          />
        </g>
      ))}
    </Canvas>
  );
};
const OpticalMoire: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const w = wave(p) * 6;
  return (
    <Canvas background={bg}>
      <defs>
        <clipPath id="b-moire">
          <rect x={428} y={44} width={815} height={629} />
        </clipPath>
      </defs>
      <g clipPath="url(#b-moire)">
        {Array.from({ length: 54 }, (_, i) => (
          <g key={i}>
            <circle
              cx={754}
              cy={359}
              r={i * 10 + 19}
              fill="none"
              stroke={fg}
              strokeWidth={2}
              opacity={0.65}
            />
            <circle
              cx={853 + w}
              cy={367 - w}
              r={i * 10 + 19}
              fill="none"
              stroke={a}
              strokeWidth={2}
              opacity={0.55}
            />
          </g>
        ))}
      </g>
      <rect x={45} y={166} width={510} height={282} fill={bg} />
      <Text x={58} y={234} size={73} color={fg} weight={800}>
        INTER
      </Text>
      <Text x={58} y={312} size={73} color={fg} weight={800}>
        FERENCE.
      </Text>
      <Text x={63} y={379} size={26} color={fg}>
        相遇，產生新的紋理。
      </Text>
      <Text x={61} y={90} size={19} color={fg} spacing={3}>
        OPTICAL STUDY / 075
      </Text>
      <Text x={61} y={657} size={16} color={fg} spacing={2}>
        SLOW GEOMETRIC DRIFT / NO HIGH-CONTRAST FLASHES
      </Text>
    </Canvas>
  );
};
const EmbossedSeal: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const light = 2 + 2 * turn(p);
  return (
    <Canvas background={bg}>
      <Text x={56} y={96} size={18} color={fg} spacing={4}>
        A MARK OF ATTENTION
      </Text>
      <Text x={57} y={273} size={92} color={fg} font={serif}>
        Made
      </Text>
      <Text x={58} y={368} size={92} color={fg} font={serif}>
        to last.
      </Text>
      <Text x={62} y={430} size={26} color={fg}>
        印記，留在細節裡。
      </Text>
      <Text x={62} y={636} size={18} color={a} spacing={3}>
        PAPER / PRESSURE / RELIEF
      </Text>
      <polygon points={polygon(894 + light, 361 + light, 243, 48)} fill={s} />
      <polygon
        points={polygon(894 - light, 361 - light, 243, 48)}
        fill={fg}
        opacity={0.06}
      />
      <polygon points={polygon(894, 361, 235, 48)} fill={bg} />
      {[205, 185, 156].map((r) => (
        <g key={r}>
          <Ring x={894 + light} y={361 + light} r={r} color={s} width={3} />
          <Ring
            x={894 - light}
            y={361 - light}
            r={r}
            color="#ffffff"
            width={3}
            opacity={0.65}
          />
        </g>
      ))}
      <Text
        x={894 + light}
        y={394 + light}
        size={88}
        color={s}
        anchor="middle"
        font={serif}
      >
        A
      </Text>
      <Text
        x={894 - light}
        y={394 - light}
        size={88}
        color="#ffffff"
        anchor="middle"
        font={serif}
      >
        A
      </Text>
      <Text x={894} y={266} size={16} color={a} anchor="middle" spacing={4}>
        ATLAS ORIGINAL
      </Text>
      <Text x={894} y={455} size={17} color={a} anchor="middle" spacing={3}>
        EST. 2026
      </Text>
    </Canvas>
  );
};
const BrutalModules: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <rect x={25} y={25} width={415 + b * 22} height={670} fill={fg} />
      <Text x={49} y={167} size={128} color={bg} weight={900}>
        BOLD
      </Text>
      <Text x={48} y={421} size={267} color={a} weight={900}>
        B.
      </Text>
      <Text x={52} y={620} size={28} color={bg}>
        把立場，放大。
      </Text>
      <rect
        x={463 + b * 22}
        y={25}
        width={790 - b * 22}
        height={184}
        fill={a}
      />
      <Text
        x={490 + b * 22}
        y={151}
        size={101}
        color={fg}
        weight={900}
        spacing={-6}
      >
        NO APOLOGY.
      </Text>
      <rect x={463} y={231} width={486} height={463} fill={fg} />
      <Text x={491} y={372} size={110} color={bg} weight={900}>
        FORM
      </Text>
      <Text x={491} y={494} size={110} color={bg} weight={900}>
        IS A
      </Text>
      <Text x={491} y={616} size={110} color={bg} weight={900}>
        VOICE.
      </Text>
      <rect x={971} y={231} width={282} height={463} fill={a} />
      <Text x={995} y={316} size={57} color={fg} font={mono}>
        077
      </Text>
      <g transform={`translate(0,${-b * 26})`}>
        <path
          d="M1023 506h178m-74-74 74 74-74 74"
          stroke={fg}
          strokeWidth={24}
          fill="none"
        />
      </g>
    </Canvas>
  );
};
const ConstructivistWedges: React.FC<RecipeProps> = ({
  style,
  progress: p,
}) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <polygon points={`0,${166 - b * 25} 1052,0 375,720 0,720`} fill={a} />
      <polygon points="738,0 1280,0 1280,720 521,720" fill={s} />
      <circle cx={1013} cy={182} r={147} fill={fg} />
      <circle cx={1013} cy={182} r={97} fill={bg} />
      <g transform={`rotate(-16,580,375) translate(${b * 17},0)`}>
        <rect x={63} y={216} width={1002} height={132} fill={fg} />
        <Text x={95} y={319} size={89} color={bg} weight={800} spacing={-2}>
          BUILD THE FUTURE
        </Text>
        <Text x={212} y={438} size={78} color={fg} weight={800}>
          FROM A NEW ANGLE.
        </Text>
      </g>
      <Text x={41} y={84} size={19} color={bg} spacing={3}>
        ORIGINAL CONSTRUCTION / 078
      </Text>
      <Text x={1174} y={657} size={26} color={fg} anchor="end">
        從另一個角度，開始。
      </Text>
    </Canvas>
  );
};
const IsometricRoom: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p) * 13;
  return (
    <Canvas background={bg}>
      <Text x={58} y={93} size={21} color={fg} spacing={3}>
        ROOM FOR AN IDEA
      </Text>
      <Text x={60} y={198} size={55} color={fg} font={serif}>
        A place
      </Text>
      <Text x={60} y={260} size={55} color={fg} font={serif}>
        to begin.
      </Text>
      <Text x={64} y={314} size={25} color={fg}>
        讓想法，有自己的房間。
      </Text>
      <g transform={`translate(${w},0)`}>
        <polygon points="477,361 831,170 1202,373 844,594" fill={s} />
        <polygon
          points="477,361 477,133 831,-54 831,170"
          fill={a}
          opacity={0.35}
        />
        <polygon
          points="831,170 831,-54 1202,153 1202,373"
          fill={a}
          opacity={0.65}
        />
        <polygon points="554,374 832,223 1111,375 836,539" fill={bg} />
        <polygon points="697,366 831,293 1000,386 866,459" fill={a} />
        <polygon points="697,366 697,448 866,541 866,459" fill={fg} />
        <polygon
          points="866,459 1000,386 1000,468 866,541"
          fill={fg}
          opacity={0.7}
        />
        <Line x1={1080} y1={226} x2={1080} y2={428} color={fg} width={6} />
        <polygon points="1008,237 1080,164 1152,237" fill={bg} />
        <ellipse cx={1080} cy={429} rx={39} ry={14} fill={fg} />
        <polygon points="579,236 689,176 689,259 579,319" fill={bg} />
        <Line x1={583} y1={275} x2={686} y2={217} color={s} width={3} />
      </g>
      <Text x={61} y={641} size={17} color={fg} font={mono}>
        2.5D VECTOR ROOM / FIXED ISOMETRIC VIEW
      </Text>
    </Canvas>
  );
};
const ScopeRouting: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={53} y={93} size={39} color={fg} font={mono}>
        ROUTING / 04
      </Text>
      <Text x={1199} y={87} size={19} color={a} anchor="end">
        每條路徑，都能被看見。
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={51} y={173 + i * 110} width={159} height={64} fill={s} />
          <Text x={76} y={213 + i * 110} size={21} color={fg} font={mono}>
            INPUT 0{i + 1}
          </Text>
          <path
            d={`M211 ${206 + i * 110}H${405 + i * 72}V${287 + i * 58}H836`}
            fill="none"
            stroke={a}
            strokeWidth={2}
          />
          <circle
            cx={226 + b * (170 + i * 20)}
            cy={206 + i * 110}
            r={7}
            fill={fg}
          />
          <rect
            x={849}
            y={197 + i * 90}
            width={344}
            height={71}
            fill="none"
            stroke={s}
          />
          <path
            d={Array.from(
              { length: 43 },
              (_, j) =>
                `${j ? "L" : "M"}${867 + j * 7.3} ${231 + i * 90 + Math.sin(j * 0.52 + i + b) * 16}`,
            ).join("")}
            fill="none"
            stroke={a}
            strokeWidth={2}
          />
        </g>
      ))}
      <Line x1={734} y1={176} x2={734} y2={613} color={fg} width={5} />
      <Text x={52} y={681} size={16} color={fg} font={mono}>
        ILLUSTRATIVE SIGNALS / NO LIVE MEASUREMENT
      </Text>
    </Canvas>
  );
};
const ZineStamps: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = Math.round(beat(p) * 4) / 4;
  return (
    <Canvas background={bg}>
      <g transform={`rotate(-6,430,355) translate(${b * 11},${-b * 6})`}>
        <rect x={53} y={97} width={711} height={539} fill={s} />
        <Media
          asset="architecture"
          x={79}
          y={123}
          width={659}
          height={373}
          filter="grayscale(1) contrast(1.1)"
        />
        <Text x={84} y={581} size={84} color={fg} weight={800}>
          LOCAL / PRESS
        </Text>
      </g>
      <g transform={`rotate(10,975,360) translate(${-b * 9},${b * 8})`}>
        <rect
          x={794}
          y={94}
          width={387}
          height={548}
          fill={bg}
          stroke={fg}
          strokeWidth={2}
        />
        {Array.from({ length: 20 }, (_, i) => (
          <g key={i}>
            <circle cx={794} cy={110 + i * 26} r={8} fill={s} />
            <circle cx={1181} cy={110 + i * 26} r={8} fill={s} />
          </g>
        ))}
        <Text x={829} y={194} size={40} color={fg} font={serif}>
          Small runs.
        </Text>
        <Text x={829} y={249} size={25} color={fg}>
          一小張，很多觀點。
        </Text>
        <Ring x={986} y={420} r={110} color={a} width={5} />
        <Text x={986} y={411} size={39} color={a} anchor="middle" weight={800}>
          ISSUE
        </Text>
        <Text x={986} y={469} size={54} color={a} anchor="middle" font={mono}>
          081
        </Text>
      </g>
      <Text x={41} y={689} size={16} color={fg} spacing={4}>
        ORIGINAL INDEPENDENT PUBLICATION / STAMPED + PERFORATED
      </Text>
    </Canvas>
  );
};
const LoomWeave: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p) * 10;
  return (
    <Canvas background={bg}>
      <Text x={57} y={105} size={76} color={fg} font={serif}>
        Threads of thought.
      </Text>
      <Text x={62} y={155} size={26} color={fg}>
        一來一往，交織成形。
      </Text>
      <rect x={46} y={220} width={1185} height={390} fill={s} opacity={0.35} />
      {Array.from({ length: 41 }, (_, i) => (
        <Line
          key={i}
          x1={63 + i * 28}
          x2={63 + i * 28}
          y1={230}
          y2={601}
          color={i % 4 === 0 ? a : fg}
          width={8}
          opacity={0.75}
        />
      ))}
      {Array.from({ length: 22 }, (_, row) => (
        <g key={row}>
          {Array.from({ length: 40 }, (_, col) => (
            <path
              key={col}
              d={`M${63 + col * 28} ${238 + row * 17}Q${76 + col * 28} ${238 + row * 17 + (col % 2 === row % 2 ? 5 : -5) + w * 0.22} ${91 + col * 28} ${238 + row * 17}`}
              fill="none"
              stroke={row % 3 === 0 ? a : bg}
              strokeWidth={8}
            />
          ))}
        </g>
      ))}
      <Text x={60} y={665} size={18} color={fg} font={mono}>
        WARP / WEFT / ALTERNATING OVERLAP
      </Text>
      <Text x={1201} y={665} size={18} color={fg} anchor="end" font={mono}>
        082 / TEXTILE STUDY
      </Text>
    </Canvas>
  );
};
const CeramicSlabs: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={59} y={91} size={23} color={fg} spacing={3}>
        MARKS IN THE MATERIAL
      </Text>
      <Text x={66} y={275} size={87} color={fg} font={serif}>
        Earth.
      </Text>
      <Text x={66} y={335} size={27} color={fg}>
        把觸感，留在畫面。
      </Text>
      <Text x={68} y={640} size={17} color={fg} font={mono}>
        VECTOR RELIEF / CERAMIC IMPRESSION
      </Text>
      <g transform={`translate(0,${-b * 9}) rotate(-5,754,351)`}>
        <path
          d="M575 104Q791 61 975 124L981 537Q808 606 574 549Z"
          fill={fg}
          opacity={0.13}
        />
        <path d="M564 94Q780 51 964 114L970 527Q797 596 563 539Z" fill={a} />
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M${604 + i * 17} ${170 + i * 21}Q${756} ${104 + i * 22} ${910 - i * 17} ${180 + i * 21}L${912 - i * 17} ${476 - i * 21}Q${757} ${544 - i * 22} ${604 + i * 17} ${466 - i * 21}Z`}
            fill="none"
            stroke={bg}
            strokeWidth={3}
            opacity={0.55}
          />
        ))}
      </g>
      <g transform={`translate(${b * 8},0) rotate(9,1061,464)`}>
        <path
          d="M957 319Q1080 293 1200 330L1194 639Q1090 665 961 629Z"
          fill={s}
        />
        <circle
          cx={1080}
          cy={467}
          r={64}
          fill="none"
          stroke={fg}
          strokeWidth={4}
          opacity={0.5}
        />
        <path
          d="M1028 583l34-31 27 20 38-43"
          stroke={fg}
          strokeWidth={5}
          fill="none"
          opacity={0.5}
        />
      </g>
    </Canvas>
  );
};
const BotanicalGlass: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p) * 13;
  return (
    <Canvas background={bg}>
      <Text x={57} y={94} size={22} color={fg} spacing={4}>
        LIVING MATERIAL
      </Text>
      <Text x={61} y={223} size={73} color={fg} font={serif}>
        Glass
      </Text>
      <Text x={61} y={302} size={73} color={fg} font={serif}>
        and green.
      </Text>
      <Text x={66} y={361} size={25} color={fg}>
        透明，讓生長被看見。
      </Text>
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          transform={`translate(${492 + i * 252},${44 + (i % 2) * 67})`}
        >
          <path
            d="M95 511Q115 357 48 195M98 439Q126 310 178 252"
            fill="none"
            stroke={a}
            strokeWidth={4}
          />
          <path
            d="M50 210Q-8 120 4 75Q82 93 50 210M170 266Q164 166 225 145Q239 221 170 266"
            fill={a}
            opacity={0.8}
          />
          <path
            d="M30 322Q-6 443 34 567H164Q204 443 168 322Z"
            fill={s}
            opacity={0.31}
          />
          <path
            d="M30 322Q-6 443 34 567H164Q204 443 168 322Z"
            fill="none"
            stroke={fg}
            strokeWidth={2}
            opacity={0.6}
          />
          <ellipse
            cx={99}
            cy={323}
            rx={68}
            ry={16}
            fill="none"
            stroke={fg}
            opacity={0.6}
          />
          <path
            d={`M${48 + w} 350Q${22 + w} 437 ${57 + w} 538`}
            stroke={fg}
            strokeWidth={9}
            fill="none"
            opacity={0.2}
          />
          <ellipse cx={99} cy={567} rx={65} ry={13} fill={fg} opacity={0.12} />
        </g>
      ))}
      <Text x={61} y={649} size={16} color={fg} spacing={2}>
        LAYERED VECTOR TRANSPARENCY / NOT PHYSICAL REFRACTION
      </Text>
    </Canvas>
  );
};
const CelestialChart: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={54} y={91} size={21} color={fg} spacing={4}>
        AN ATLAS OF ELSEWHERE
      </Text>
      <Text x={57} y={218} size={71} color={fg} font={serif}>
        Orbit
      </Text>
      <Text x={58} y={290} size={71} color={fg} font={serif}>
        by orbit.
      </Text>
      <Text x={61} y={348} size={26} color={fg}>
        用軌跡，記住方向。
      </Text>
      <Text x={61} y={630} size={17} color={fg} font={mono}>
        FICTIONAL CELESTIAL COORDINATES
      </Text>
      {[83, 151, 218, 282].map((r, i) => (
        <g key={r}>
          <Ring x={893} y={363} r={r} color={i % 2 ? a : s} width={1.5} />
          <circle
            cx={893 + Math.cos(p * Math.PI * 2 + i * 1.7) * r}
            cy={363 + Math.sin(p * Math.PI * 2 + i * 1.7) * r}
            r={7 + i * 2}
            fill={i % 2 ? fg : a}
          />
        </g>
      ))}
      {Array.from({ length: 36 }, (_, i) => (
        <Line
          key={i}
          x1={893 + Math.cos((i * Math.PI) / 18) * 287}
          y1={363 + Math.sin((i * Math.PI) / 18) * 287}
          x2={893 + Math.cos((i * Math.PI) / 18) * (i % 3 ? 294 : 305)}
          y2={363 + Math.sin((i * Math.PI) / 18) * (i % 3 ? 294 : 305)}
          color={fg}
        />
      ))}
      <Line x1={599} y1={363} x2={1187} y2={363} color={s} />
      <Line x1={893} y1={69} x2={893} y2={657} color={s} />
      <polygon points={polygon(893, 363, 34, 8, Math.PI / 8)} fill={a} />
    </Canvas>
  );
};
const FiscalWaterfall: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = 0.55 + 0.45 * beat(p);
  const tops = [470, 396, 318, 357, 275, 314, 238, 204];
  return (
    <Canvas background={bg}>
      <Text x={54} y={95} size={56} color={fg} weight={700}>
        A YEAR IN MOTION
      </Text>
      <Text x={59} y={146} size={25} color={fg}>
        每一步，都改變全貌。
      </Text>
      <Text x={1195} y={113} size={69} color={a} anchor="end" font={mono}>
        +28%
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Line
            x1={61}
            y1={258 + i * 90}
            x2={1200}
            y2={258 + i * 90}
            color={s}
          />
          <Text x={62} y={250 + i * 90} size={14} color={fg} font={mono}>
            {400 - i * 100}
          </Text>
        </g>
      ))}
      {tops.map((top, i) => {
        const prev = i ? tops[i - 1] : 563;
        const current = 563 - (563 - top) * b,
          start = 563 - (563 - prev) * b;
        return (
          <g key={i}>
            <rect
              x={119 + i * 135}
              y={Math.min(current, start)}
              width={87}
              height={Math.max(8, Math.abs(start - current))}
              fill={i === 0 || i === 7 ? fg : top < prev ? a : s}
            />
            {i < 7 && (
              <Line
                x1={206 + i * 135}
                x2={254 + i * 135}
                y1={current}
                y2={current}
                color={fg}
                dash="4 4"
              />
            )}
            <Text
              x={162 + i * 135}
              y={current - 16}
              size={21}
              color={fg}
              anchor="middle"
              font={mono}
            >
              {[84, 42, 39, -18, 46, -23, 52, 31][i]}
            </Text>
            <Text
              x={162 + i * 135}
              y={613}
              size={17}
              color={fg}
              anchor="middle"
              font={mono}
            >
              {["OPEN", "Q1", "Q2", "COST", "Q3", "TAX", "Q4", "CLOSE"][i]}
            </Text>
          </g>
        );
      })}
      <Text x={61} y={681} size={16} color={fg} font={mono}>
        FICTIONAL NUMBERS / BRIDGE CHART / NOT FINANCIAL ADVICE
      </Text>
    </Canvas>
  );
};
const MechanicalClock: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={59} y={97} size={24} color={fg} spacing={3}>
        TIME, BUILT IN.
      </Text>
      <Text x={57} y={238} size={86} color={fg} font={serif}>
        Measured
      </Text>
      <Text x={59} y={322} size={86} color={fg} font={serif}>
        movement.
      </Text>
      <Text x={65} y={388} size={26} color={fg}>
        每一秒，都有它的結構。
      </Text>
      {[
        [810, 300, 191, 1],
        [1044, 482, 116, -1],
        [752, 588, 88, -1],
      ].map(([x, y, r, dir], i) => (
        <g key={i} transform={`rotate(${p * 360 * dir},${x},${y})`}>
          <polygon
            points={Array.from({ length: 48 }, (_, k) => {
              const rr = r + (k % 4 < 2 ? 12 : -9);
              return `${x + Math.cos((k * Math.PI) / 24) * rr},${y + Math.sin((k * Math.PI) / 24) * rr}`;
            }).join(" ")}
            fill={i === 1 ? a : s}
            stroke={fg}
            strokeWidth={2}
          />
          <Ring x={x} y={y} r={r * 0.65} color={bg} width={26} />
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <Line
              key={j}
              x1={x}
              y1={y}
              x2={x + Math.cos((j * Math.PI) / 3) * r * 0.74}
              y2={y + Math.sin((j * Math.PI) / 3) * r * 0.74}
              color={fg}
              width={11}
            />
          ))}
          <circle cx={x} cy={y} r={20} fill={fg} />
        </g>
      ))}
      <Text x={61} y={645} size={17} color={fg} font={mono}>
        GEAR STUDY / CONTINUOUS CLOSED ROTATION
      </Text>
    </Canvas>
  );
};
const AnalogMeter: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const angle = -55 + 110 * turn(p);
  return (
    <Canvas background={bg}>
      <Text x={55} y={92} size={39} color={fg} font={mono}>
        LEVEL / FORM
      </Text>
      <Text x={1200} y={88} size={22} color={fg} anchor="end">
        讓力量，保持可讀。
      </Text>
      <rect x={52} y={144} width={1176} height={491} rx={14} fill={s} />
      <rect x={83} y={175} width={1114} height={388} rx={7} fill={bg} />
      <path
        d="M219 478A429 429 0 0 1 1061 478"
        fill="none"
        stroke={fg}
        strokeWidth={3}
      />
      {Array.from({ length: 31 }, (_, i) => {
        const r = i % 5 ? 420 : 392,
          t = Math.PI + (i * Math.PI) / 30;
        return (
          <Line
            key={i}
            x1={640 + Math.cos(t) * r}
            y1={493 + Math.sin(t) * r}
            x2={640 + Math.cos(t) * 437}
            y2={493 + Math.sin(t) * 437}
            color={i > 23 ? a : fg}
            width={i % 5 ? 2 : 4}
          />
        );
      })}
      <g transform={`rotate(${angle},640,502)`}>
        <path d="M635 504 639 191 644 504Z" fill={a} />
        <circle cx={640} cy={502} r={19} fill={fg} />
      </g>
      <Text x={640} y={470} size={47} color={fg} anchor="middle" font={mono}>
        -12 / +12
      </Text>
      <Text x={639} y={600} size={18} color={fg} anchor="middle" spacing={4}>
        SIMULATED ANALOG RESPONSE / NO LIVE AUDIO
      </Text>
    </Canvas>
  );
};
const MagneticPoetry: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = Math.round(beat(p) * 6) / 6;
  return (
    <Canvas background={bg}>
      <Text x={55} y={94} size={21} color={fg} spacing={3}>
        SMALL WORDS / MANY POSSIBILITIES
      </Text>
      <Text x={57} y={659} size={30} color={fg}>
        重組字句，也重組想像。
      </Text>
      {[
        [73, 174, 345, "MAKE"],
        [459, 174, 307, "ROOM"],
        [808, 174, 386, "FOR"],
        [151, 330, 414, "ANOTHER"],
        [608, 330, 500, "THOUGHT"],
        [68, 495, 518, "AND KEEP"],
        [630, 495, 482, "IT OPEN"],
      ].map(([x, y, width, t], i) => (
        <g
          key={i}
          transform={`translate(${(i % 2 ? -1 : 1) * b * 18},${((i % 3) - 1) * b * 8}) rotate(${(i % 2 ? 1 : -1) * (1 - b) * 2},${Number(x) + Number(width) / 2},${Number(y) + 57})`}
        >
          <rect
            x={Number(x) + 5}
            y={Number(y) + 7}
            width={Number(width)}
            height={115}
            fill={fg}
            opacity={0.15}
          />
          <rect
            x={Number(x)}
            y={Number(y)}
            width={Number(width)}
            height={115}
            rx={4}
            fill={i === 4 ? a : s}
          />
          <Text
            x={Number(x) + Number(width) / 2}
            y={Number(y) + 80}
            size={65}
            color={fg}
            weight={700}
            anchor="middle"
          >
            {t}
          </Text>
        </g>
      ))}
    </Canvas>
  );
};
const ContourType: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={57} y={95} size={19} color={fg} spacing={4}>
        THE DEPTH OF A LETTER
      </Text>
      {Array.from({ length: 17 }, (_, i) => (
        <g key={i} transform={`translate(${i * (3 + b * 0.6)},${i * 6})`}>
          <text
            x="52"
            y="282"
            fontFamily={sans}
            fontSize="157"
            fontWeight="900"
            letterSpacing="-7"
            fill={i === 0 ? bg : "none"}
            stroke={i === 0 ? fg : a}
            strokeWidth={i === 0 ? 2 : 1.2}
          >
            LETTER
          </text>
          <text
            x="444"
            y="509"
            fontFamily={sans}
            fontSize="174"
            fontWeight="900"
            letterSpacing="-8"
            fill={i === 0 ? bg : "none"}
            stroke={i === 0 ? fg : a}
            strokeWidth={i === 0 ? 2 : 1.2}
          >
            FORM.
          </text>
        </g>
      ))}
      <Text x={59} y={671} size={28} color={fg}>
        字的邊界，也是空間。
      </Text>
      <Text x={1196} y={87} size={17} color={fg} anchor="end" font={mono}>
        OUTLINE / 090
      </Text>
    </Canvas>
  );
};
const CardboardStage: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p) * 9;
  return (
    <Canvas background={bg}>
      <Text x={52} y={83} size={23} color={fg} spacing={3}>
        A LITTLE WORLD, ON PAPER
      </Text>
      <rect x={49} y={125} width={1182} height={526} fill={fg} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${80 + i * 91} 624V${331 + i * 13}Q640 ${27 + i * 112} ${1200 - i * 91} ${331 + i * 13}V624H${1120 - i * 88}V${355 + i * 13}Q640 ${110 + i * 106} ${160 + i * 88} ${355 + i * 13}V624Z`}
          fill={i === 1 ? a : s}
          opacity={1 - i * 0.14}
        />
      ))}
      <path
        d="M309 584 427 376 558 584 661 416 836 584 941 378 1067 584Z"
        fill={bg}
      />
      <g transform={`translate(${w},0)`}>
        <path
          d="M437 417Q484 365 522 426Q552 375 600 417"
          fill="none"
          stroke={a}
          strokeWidth={9}
        />
      </g>
      <Text x={640} y={524} size={53} color={fg} anchor="middle" font={serif}>
        Inside a small story.
      </Text>
      <rect x={276} y={597} width={728} height={24} fill={a} />
      <Text x={57} y={691} size={25} color={fg}>
        紙上舞台，容得下整個世界。
      </Text>
    </Canvas>
  );
};
const TileMap: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={56} y={91} size={47} color={fg} weight={700}>
        BUILD A PLACE
      </Text>
      <Text x={1198} y={87} size={23} color={fg} anchor="end">
        用小方格，想像一座城市。
      </Text>
      {Array.from({ length: 40 }, (_, i) => {
        const col = i % 8,
          row = Math.floor(i / 8),
          x = 70 + col * 143,
          y = 165 + row * 97,
          isWater = (col === 3 || col === 4) && row > 0;
        return (
          <g
            key={i}
            transform={`translate(0,${!isWater && i % 4 === 0 ? -10 * b : 0})`}
          >
            <rect
              x={x}
              y={y + 6}
              width={132}
              height={87}
              rx={3}
              fill={fg}
              opacity={0.13}
            />
            <rect
              x={x}
              y={y}
              width={132}
              height={87}
              rx={3}
              fill={isWater ? a : s}
            />
            {isWater ? (
              <path
                d={`M${x + 14} ${y + 30}q18-10 36 0t36 0m-59 21q18-10 36 0t36 0`}
                stroke={bg}
                fill="none"
                strokeWidth={3}
              />
            ) : i % 3 === 0 ? (
              <g>
                <rect x={x + 40} y={y + 38} width={53} height={31} fill={fg} />
                <path d={`M${x + 30} ${y + 39}l37-27 37 27Z`} fill={a} />
              </g>
            ) : i % 3 === 1 ? (
              <g>
                <circle cx={x + 67} cy={y + 35} r={24} fill={a} />
                <Line
                  x1={x + 67}
                  x2={x + 67}
                  y1={55 + y}
                  y2={72 + y}
                  color={fg}
                  width={5}
                />
              </g>
            ) : (
              <path
                d={`M${x + 12} ${y + 46}h108m-56-34v63`}
                stroke={bg}
                strokeWidth={16}
              />
            )}
          </g>
        );
      })}
      <Text x={70} y={690} size={16} color={fg} spacing={3}>
        FICTIONAL TILE WORLD / SYMBOLS, NOT GEOGRAPHIC DATA
      </Text>
    </Canvas>
  );
};
const BookBinding: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={55} y={85} size={20} color={fg} spacing={4}>
        AN OPEN BOOK / A NEW CHAPTER
      </Text>
      <path
        d="M60 149Q344 105 638 164Q930 105 1217 149V625Q930 581 638 640Q344 581 60 625Z"
        fill={s}
      />
      <path
        d={`M76 136Q346 ${92 - b * 7} 638 151V627Q346 ${576 - b * 7} 76 612Z`}
        fill={bg}
      />
      <path
        d={`M638 151Q924 ${92 + b * 7} 1201 136V612Q924 ${576 + b * 7} 638 627Z`}
        fill={bg}
      />
      <Line x1={638} y1={151} x2={638} y2={627} color={a} width={2} />
      <Text x={112} y={247} size={85} color={fg} font={serif}>
        Open
      </Text>
      <Text x={112} y={333} size={85} color={fg} font={serif}>
        another
      </Text>
      <Text x={112} y={419} size={85} color={fg} font={serif}>
        chapter.
      </Text>
      <Text x={119} y={522} size={25} color={fg}>
        翻開一頁，讓故事繼續。
      </Text>
      <Text x={683} y={231} size={20} color={fg} spacing={2}>
        NOTES ON POSSIBILITY
      </Text>
      {Array.from({ length: 12 }, (_, i) => (
        <Line
          key={i}
          x1={686}
          y1={277 + i * 21}
          x2={1131 - (i % 4) * 34}
          y2={277 + i * 21}
          color={fg}
          width={3}
          opacity={0.32}
        />
      ))}
      <Text x={1126} y={582} size={16} color={fg} anchor="end" font={mono}>
        093 / 094
      </Text>
    </Canvas>
  );
};
const NegativeLetterpress: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <defs>
        <mask id="b-negative">
          <rect width={1280} height={720} fill="white" />
          <text
            x="49"
            y="322"
            fontFamily={sans}
            fontSize="272"
            fontWeight="900"
            letterSpacing="-20"
            fill="black"
          >
            IN
          </text>
          <text
            x="45"
            y="607"
            fontFamily={sans}
            fontSize="268"
            fontWeight="900"
            letterSpacing="-18"
            fill="black"
          >
            VERSE
          </text>
        </mask>
      </defs>
      <rect width={1280} height={720} fill={a} />
      <g transform={`translate(${b * 52},0)`}>
        {Array.from({ length: 18 }, (_, i) => (
          <rect
            key={i}
            x={-80 + i * 87}
            y={0}
            width={40}
            height={720}
            fill={bg}
          />
        ))}
      </g>
      <rect
        x={25}
        y={24}
        width={1230}
        height={672}
        fill={fg}
        mask="url(#b-negative)"
      />
      <Text x={730} y={124} size={20} color={bg} spacing={3}>
        FORM THROUGH ABSENCE
      </Text>
      <Text x={731} y={232} size={37} color={bg}>
        留下空白，
      </Text>
      <Text x={731} y={280} size={37} color={bg}>
        讓字形說話。
      </Text>
      <Text x={68} y={667} size={15} color={bg} spacing={4}>
        NEGATIVE SPACE / ORIGINAL TYPE STUDY
      </Text>
    </Canvas>
  );
};
const StencilTransfer: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={55} y={95} size={22} color={fg} spacing={4}>
        REGISTER / ALIGN / PRINT
      </Text>
      <Text x={58} y={248} size={77} color={fg} weight={800}>
        Layer
      </Text>
      <Text x={58} y={329} size={77} color={fg} weight={800}>
        by layer.
      </Text>
      <Text x={63} y={387} size={26} color={fg}>
        套準之後，圖像才完整。
      </Text>
      <Text x={63} y={639} size={18} color={fg} font={mono}>
        ORIGINAL STENCIL / THREE PLATES
      </Text>
      {[s, a, fg].map((color, i) => (
        <g
          key={color}
          transform={`translate(${(2 - i) * (1 - b) * 24},${(i - 1) * (1 - b) * 17})`}
        >
          <rect
            x={578}
            y={137}
            width={575}
            height={450}
            fill={bg}
            stroke={color}
            opacity={i === 2 ? 0.75 : 0.25}
          />
          <Cross x={599} y={158} color={color} />
          <Cross x={1132} y={566} color={color} />
          <circle
            cx={863}
            cy={352}
            r={150}
            fill="none"
            stroke={color}
            strokeWidth={16}
            opacity={0.65}
          />
          <path
            d="M751 390 862 220 974 390Z"
            fill="none"
            stroke={color}
            strokeWidth={18}
            opacity={0.75}
          />
          <Line
            x1={736}
            y1={451}
            x2={990}
            y2={451}
            color={color}
            width={18}
            opacity={0.65}
          />
        </g>
      ))}
    </Canvas>
  );
};
const LightboxProof: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={53} y={86} size={32} color={fg} font={serif}>
        Proofs of a quiet afternoon.
      </Text>
      <Text x={1195} y={80} size={17} color={fg} anchor="end" font={mono}>
        LIGHTBOX / 096
      </Text>
      <rect
        x={41}
        y={123}
        width={1198}
        height={481}
        rx={10}
        fill="#f0ece0"
        stroke={fg}
        strokeWidth={2}
      />
      <g transform={`rotate(-3,429,360) translate(${b * 7},0)`}>
        <rect x={73} y={150} width={596} height={411} fill="#26282b" />
        <Media
          asset="architecture"
          x={96}
          y={178}
          width={550}
          height={355}
          filter="saturate(.55)"
        />
        <Text x={97} y={554} size={13} color="#eee9db" font={mono}>
          01 / SPACE / ORIGINAL SAMPLE
        </Text>
      </g>
      <g transform={`rotate(5,913,379) translate(${-b * 6},0)`}>
        <rect x={657} y={191} width={535} height={344} fill="#272629" />
        <Media
          asset="botanical"
          x={680}
          y={213}
          width={489}
          height={300}
          filter="saturate(.6)"
        />
        <Text x={681} y={529} size={12} color="#eee9db" font={mono}>
          02 / GROWTH / ORIGINAL SAMPLE
        </Text>
      </g>
      <path
        d="M1058 144 1186 144 1186 174"
        stroke={a}
        strokeWidth={4}
        fill="none"
      />
      <Text x={58} y={666} size={27} color={fg}>
        把光，攤開來看。
      </Text>
    </Canvas>
  );
};
const PencilDrafting: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p);
  return (
    <Canvas background={bg}>
      <Text x={54} y={94} size={35} color={fg} font={serif}>
        Before the final form.
      </Text>
      <Text x={58} y={137} size={23} color={fg}>
        從一條線，開始想像。
      </Text>
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          transform={`translate(${i * 1.4},${i * 0.7})`}
          opacity={i ? 0.24 : 0.85}
        >
          <path
            d="M242 592V302H523V592M523 302 922 169V470L523 592M242 302 635 168H922"
            fill="none"
            stroke={fg}
            strokeWidth={2}
          />
          <path
            d="M282 560V340H483V560M574 359 867 256V420L574 509"
            fill="none"
            stroke={fg}
            strokeWidth={1.4}
          />
          <path
            d="M574 435 867 339M638 335V486M720 306V460M798 277V438"
            stroke={fg}
            strokeWidth={1.3}
          />
        </g>
      ))}
      <Line x1={239} y1={626} x2={923} y2={626} color={a} />
      <Line x1={975} y1={168} x2={975} y2={592} color={a} />
      <Text x={584} y={653} size={17} color={fg} anchor="middle" font={mono}>
        ILLUSTRATIVE SCALE / 1:50
      </Text>
      <g transform={`translate(${968 - b * 103},${475 - b * 160}) rotate(-27)`}>
        <rect width={14} height={127} fill={a} />
        <path d="M0 127 7 154 14 127Z" fill={fg} />
      </g>
      <Text x={1189} y={104} size={17} color={fg} anchor="end" font={mono}>
        097 / DRAFT
      </Text>
    </Canvas>
  );
};
const ReceiptRoll: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const shift = beat(p) * 28;
  return (
    <Canvas background={bg}>
      <Text x={55} y={105} size={71} color={fg} weight={800}>
        EVERY
      </Text>
      <Text x={55} y={182} size={71} color={fg} weight={800}>
        DETAIL.
      </Text>
      <Text x={58} y={238} size={25} color={fg}>
        讓細節，有跡可循。
      </Text>
      <Text x={59} y={609} size={82} color={a} font={mono}>
        098
      </Text>
      <g transform={`translate(0,${shift})`}>
        <path
          d="M554 44H946V641L935 631 924 641 913 631 902 641 891 631 880 641 869 631 858 641 847 631 836 641 825 631 814 641 803 631 792 641 781 631 770 641 759 631 748 641 737 631 726 641 715 631 704 641 693 631 682 641 671 631 660 641 649 631 638 641 627 631 616 641 605 631 594 641 583 631 572 641 554 631Z"
          fill={s}
        />
        <Text x={750} y={105} size={26} color={fg} anchor="middle" font={mono}>
          ATLAS SUPPLY
        </Text>
        <Text x={750} y={147} size={14} color={fg} anchor="middle" font={mono}>
          ORIGINAL FICTIONAL RECEIPT
        </Text>
        <Line x1={583} y1={181} x2={917} y2={181} color={fg} dash="5 5" />
        {[
          ["IDEA", "01", "120"],
          ["SPACE", "02", "240"],
          ["TIME", "01", "180"],
          ["ATTENTION", "03", "360"],
        ].map(([t, n, v], i) => (
          <g key={t}>
            <Text x={585} y={225 + i * 51} size={20} color={fg} font={mono}>
              {t}
            </Text>
            <Text x={824} y={225 + i * 51} size={20} color={fg} font={mono}>
              {n}
            </Text>
            <Text
              x={917}
              y={225 + i * 51}
              size={20}
              color={fg}
              anchor="end"
              font={mono}
            >
              {v}
            </Text>
          </g>
        ))}
        <Line x1={583} y1={424} x2={917} y2={424} color={fg} dash="5 5" />
        <Text x={585} y={476} size={30} color={fg} font={mono}>
          TOTAL
        </Text>
        <Text x={917} y={476} size={30} color={a} anchor="end" font={mono}>
          900
        </Text>
        {Array.from({ length: 35 }, (_, i) => (
          <rect
            key={i}
            x={598 + i * 8.6}
            y={522}
            width={i % 3 ? 3 : 6}
            height={50}
            fill={fg}
          />
        ))}
        <Text x={750} y={607} size={16} color={fg} anchor="middle" font={mono}>
          THANK YOU FOR LOOKING.
        </Text>
      </g>
      <path d="M1008 187h127v296h-127" stroke={fg} fill="none" />
      <Text x={1072} y={544} size={17} color={fg} anchor="middle" font={mono}>
        ITEMS / 04
      </Text>
    </Canvas>
  );
};
const OrbitalRibbons: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p) * 20;
  return (
    <Canvas background={bg}>
      <Text x={53} y={95} size={23} color={fg} spacing={3}>
        A CONTINUOUS IDEA
      </Text>
      <Text x={58} y={511} size={72} color={fg} weight={800}>
        AROUND
      </Text>
      <Text x={58} y={587} size={72} color={fg} weight={800}>
        AND BEYOND.
      </Text>
      <Text x={60} y={650} size={26} color={fg}>
        一個想法，持續延伸。
      </Text>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`rotate(${i * 30 + w * 0.2},861,318)`}>
          <path
            d={`M633 328C578 ${68 + i * 14} 1130 ${49 + i * 13} 1111 344C1092 ${597 - i * 18} 606 ${629 - i * 11} 633 328Z`}
            fill="none"
            stroke={i % 2 ? a : s}
            strokeWidth={34 - i * 3}
          />
          <path
            d={`M635 328C580 ${74 + i * 14} 1126 ${54 + i * 13} 1109 337`}
            fill="none"
            stroke={bg}
            strokeWidth={4}
            opacity={0.35}
          />
        </g>
      ))}
      <Text x={1201} y={683} size={16} color={fg} anchor="end" font={mono}>
        FLAT RIBBON SYSTEM / CLOSED PERIODIC DRIFT
      </Text>
    </Canvas>
  );
};
const PaperTessellation: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={57} y={91} size={50} color={fg} font={serif}>
        Structure from a fold.
      </Text>
      <Text x={61} y={140} size={25} color={fg}>
        重複，也能長出新的形狀。
      </Text>
      {Array.from({ length: 18 }, (_, i) => {
        const x = 153 + (i % 6) * 194,
          y = 268 + Math.floor(i / 6) * 139,
          fold = 22 + 9 * b;
        return (
          <g key={i}>
            <polygon
              points={`${x - 90},${y} ${x},${y - 68} ${x + 90},${y} ${x},${y + 68}`}
              fill={s}
            />
            <polygon
              points={`${x - 90},${y} ${x},${y - 68} ${x + fold},${y}`}
              fill={a}
            />
            <polygon
              points={`${x + fold},${y} ${x + 90},${y} ${x},${y + 68}`}
              fill={fg}
              opacity={0.72}
            />
            <Line
              x1={x + fold}
              y1={y}
              x2={x}
              y2={y - 68}
              color={bg}
              opacity={0.45}
            />
            <Line
              x1={x + fold}
              y1={y}
              x2={x}
              y2={y + 68}
              color={bg}
              opacity={0.45}
            />
          </g>
        );
      })}
      <Text x={61} y={686} size={16} color={fg} spacing={3}>
        REPEATED VECTOR FACETS / AN HONEST 2.5D PAPER STUDY
      </Text>
    </Canvas>
  );
};

export const recipeRegistryB: Record<string, React.FC<RecipeProps>> = {
  "tile-press": TilePress,
  "transit-flaps": TransitFlaps,
  "type-scroll": TypeScroll,
  "iris-contact": IrisContact,
  "ink-bloom": InkBloom,
  "soft-icons": SoftIcons,
  "modular-signal": ModularSignal,
  "paper-fold": PaperFold,
  "urban-wayfinding": UrbanWayfinding,
  "kinetic-punctuation": KineticPunctuation,
  "calendar-leaves": CalendarLeaves,
  "sonar-depth": SonarDepth,
  "thermal-contours": ThermalContours,
  "route-topography": RouteTopography,
  "botanical-anatomy": BotanicalAnatomy,
  "acoustic-score": AcousticScore,
  "museum-labels": MuseumLabels,
  "medical-contours": MedicalContours,
  "optical-moire": OpticalMoire,
  "embossed-seal": EmbossedSeal,
  "brutal-modules": BrutalModules,
  "constructivist-wedges": ConstructivistWedges,
  "isometric-room": IsometricRoom,
  "scope-routing": ScopeRouting,
  "zine-stamps": ZineStamps,
  "loom-weave": LoomWeave,
  "ceramic-slabs": CeramicSlabs,
  "botanical-glass": BotanicalGlass,
  "celestial-chart": CelestialChart,
  "fiscal-waterfall": FiscalWaterfall,
  "mechanical-clock": MechanicalClock,
  "analog-meter": AnalogMeter,
  "magnetic-poetry": MagneticPoetry,
  "contour-type": ContourType,
  "cardboard-stage": CardboardStage,
  "tile-map": TileMap,
  "book-binding": BookBinding,
  "negative-letterpress": NegativeLetterpress,
  "stencil-transfer": StencilTransfer,
  "lightbox-proof": LightboxProof,
  "pencil-drafting": PencilDrafting,
  "receipt-roll": ReceiptRoll,
  "orbital-ribbons": OrbitalRibbons,
  "paper-tessellation": PaperTessellation,
};
