import React from "react";
import {
  Canvas,
  Text,
  Line,
  Media,
  Ring,
  Cross,
  beat,
  wave,
  turn,
  rebound,
  serif,
  mono,
  sans,
  type RecipeProps,
} from "./helpers";

const EditorialSplit: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.03, 0.22, 0.69, 0.97);
  return (
    <Canvas background={bg}>
      <rect x={640} width={640} height={720} fill={fg} />
      <Line x1={53} y1={115} x2={1227} y2={115} color={a} />
      <Text x={53} y={77} color={fg} size={20} spacing={3}>
        TWO SIDES. ONE QUESTION.
      </Text>
      <Text x={1227} y={77} color={bg} size={20} anchor="end">
        觀點 / 01
      </Text>
      <defs>
        <clipPath id="split-left">
          <rect x={0} y={152} width={640} height={370} />
        </clipPath>
        <clipPath id="split-right">
          <rect x={640} y={152} width={640} height={370} />
        </clipPath>
      </defs>
      <g clipPath="url(#split-left)" transform={`translate(0,${b * 24})`}>
        <Text x={57} y={314} color={fg} size={170} font={serif} spacing={-7}>
          Different
        </Text>
        <Text x={57} y={468} color={fg} size={170} font={serif} spacing={-7}>
          perspectives.
        </Text>
      </g>
      <g clipPath="url(#split-right)" transform={`translate(0,${-b * 24})`}>
        <Text x={57} y={314} color={bg} size={170} font={serif} spacing={-7}>
          Different
        </Text>
        <Text x={57} y={468} color={bg} size={170} font={serif} spacing={-7}>
          perspectives.
        </Text>
      </g>
      <rect x={576 - b * 42} y={520} width={128 + b * 84} height={8} fill={a} />
      <Text x={58} y={608} color={fg} size={32}>
        換一個位置，看見另一面。
      </Text>
      <Text x={1217} y={610} color={bg} size={19} spacing={3} anchor="end">
        OPEN THE CONVERSATION.
      </Text>
    </Canvas>
  );
};

const EditorialNewspaper: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  return (
    <Canvas background={bg}>
      <Text
        x={640}
        y={95}
        color={fg}
        size={79}
        font={serif}
        anchor="middle"
        spacing={-3}
      >
        The Everyday Review
      </Text>
      <Line x1={55} y1={116} x2={1225} y2={116} color={fg} width={3} />
      <Text x={56} y={145} color={fg} size={15} font={mono}>
        VOL. 12 / CITY EDITION
      </Text>
      <Text x={1224} y={145} color={fg} size={15} font={mono} anchor="end">
        SATURDAY, OCTOBER 03
      </Text>
      <Line x1={55} y1={163} x2={1225} y2={163} color={fg} />
      <Media
        asset="architecture"
        x={55}
        y={190}
        width={454}
        height={339}
        filter="grayscale(1) contrast(1.1)"
        scale={1 + 0.02 * turn(p)}
      />
      <Text x={58} y={578} color={fg} size={37} font={serif}>
        Where the city begins.
      </Text>
      <Text x={58} y={622} color={fg} size={25}>
        城市，從日常開始。
      </Text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Line
            x1={536 + i * 236}
            y1={189}
            x2={536 + i * 236}
            y2={649}
            color={fg}
            opacity={0.35}
          />
          <Text x={554 + i * 236} y={221} color={a} size={16} font={mono}>
            0{i + 1} / OBSERVATIONS
          </Text>
          <defs>
            <clipPath id={`news-${i}`}>
              <rect
                x={554 + i * 236}
                y={242}
                width={208}
                height={
                  118 *
                  (0.55 +
                    0.45 * beat(p, 0.04 + i * 0.06, 0.25 + i * 0.06, 0.7, 0.98))
                }
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#news-${i})`}>
            <Text x={554 + i * 236} y={281} color={fg} size={31} font={serif}>
              {["Quiet", "Common", "New"][i]}
            </Text>
            <Text x={554 + i * 236} y={323} color={fg} size={31} font={serif}>
              {["spaces.", "ground.", "patterns."][i]}
            </Text>
          </g>
          {Array.from({ length: 13 }, (_, j) => (
            <Line
              key={j}
              x1={554 + i * 236}
              x2={748 + i * 236 - (j % 4) * 19}
              y1={383 + j * 17}
              y2={383 + j * 17}
              color={fg}
              opacity={0.3}
              width={2}
            />
          ))}
        </g>
      ))}
      <Line x1={55} y1={666} x2={1225} y2={666} color={fg} />
      <Text x={640} y={695} color={fg} size={14} font={mono} anchor="middle">
        AN ORIGINAL EDITORIAL STUDY / NOT A NEWS PUBLICATION
      </Text>
    </Canvas>
  );
};

const EditorialIndex: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.04, 0.2, 0.72, 0.97);
  return (
    <Canvas background={bg}>
      <Text x={51} y={95} color={fg} size={23} weight={700}>
        CONTENTS / IDEAS IN ORDER
      </Text>
      <Text x={1218} y={95} color={fg} size={21} anchor="end">
        目錄編排
      </Text>
      <Text
        x={19}
        y={624}
        color={fg}
        size={591}
        weight={800}
        spacing={-64}
        style={{ scale: `${1 - 0.04 * b} 1`, transformOrigin: "left center" }}
      >
        01
      </Text>
      <rect x={611} y={142} width={9} height={483} fill={a} />
      {[
        "A point of departure",
        "A different direction",
        "A clear intention",
        "A lasting impression",
      ].map((s, i) => (
        <g key={s} transform={`translate(${i % 2 ? b * 18 : -b * 18},0)`}>
          <Text x={660} y={214 + i * 118} color={a} size={18} font={mono}>
            0{i + 1}
          </Text>
          <Text x={712} y={217 + i * 118} color={fg} size={29} weight={600}>
            {s}
          </Text>
          <Line
            x1={660}
            x2={1205}
            y1={250 + i * 118}
            y2={250 + i * 118}
            color={fg}
            opacity={0.3}
          />
        </g>
      ))}
      <Text x={659} y={659} color={fg} size={26}>
        把想法，整理成方向。
      </Text>
    </Canvas>
  );
};

const EditorialVertical: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  return (
    <Canvas background={bg}>
      <Media
        asset="botanical"
        x={62}
        y={93}
        width={409}
        height={544}
        filter="saturate(.3) contrast(.9)"
        scale={1 + 0.03 * turn(p)}
      />
      <rect
        x={75}
        y={106}
        width={383}
        height={518}
        fill="none"
        stroke={fg}
        opacity={0.5}
      />
      {["靜觀萬物", "日常成詩", "留白有聲"].map((v, i) => (
        <g key={v}>
          <defs>
            <clipPath id={`vertical-${i}`}>
              <rect
                x={1040 - i * 179}
                y={90}
                width={132}
                height={
                  547 *
                  (0.75 +
                    0.25 * beat(p, 0.04 + i * 0.05, 0.28 + i * 0.05, 0.7, 0.97))
                }
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#vertical-${i})`}>
            {[...v].map((c, j) => (
              <Text
                key={j}
                x={1100 - i * 179}
                y={186 + j * 128}
                color={fg}
                size={87}
                font={serif}
                anchor="middle"
              >
                {c}
              </Text>
            ))}
          </g>
        </g>
      ))}
      <rect x={1104} y={617} width={78} height={50} fill={a} />
      <Text x={1143} y={651} color={bg} size={22} anchor="middle">
        拾光
      </Text>
      <Text x={66} y={676} color={fg} size={16} spacing={4}>
        A QUIET CULTURAL STUDY
      </Text>
    </Canvas>
  );
};

const LuxuryBotanical: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Media
        asset="botanical"
        x={0}
        y={0}
        width={1280}
        height={720}
        scale={1.12 + 0.08 * b}
        panX={18 * wave(p)}
        filter="saturate(.45) brightness(.75)"
      />
      <rect
        x={61}
        y={53}
        width={1158}
        height={614}
        fill="none"
        stroke={fg}
        opacity={0.72}
      />
      <rect x={310} y={142} width={660} height={444} fill={bg} opacity={0.9} />
      <Text x={640} y={207} color={a} size={16} spacing={5} anchor="middle">
        BOTANICAL EDITION / 01
      </Text>
      <Text x={640} y={336} color={fg} size={93} font={serif} anchor="middle">
        Naturally
      </Text>
      <Text x={640} y={427} color={fg} size={93} font={serif} anchor="middle">
        extraordinary.
      </Text>
      <Line x1={576 - 30 * b} y1={469} x2={704 + 30 * b} y2={469} color={a} />
      <Text x={640} y={524} color={fg} size={27} anchor="middle">
        自然，本就非凡。
      </Text>
      <Text x={640} y={629} color={fg} size={17} spacing={4} anchor="middle">
        SPECIMEN NO. 027
      </Text>
    </Canvas>
  );
};

const LuxuryJewel: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={58} y={89} color={fg} size={18} spacing={4}>
        PRECISION / BRILLIANCE
      </Text>
      <Text x={60} y={284} color={fg} size={101} font={serif} spacing={-4}>
        Rare
      </Text>
      <Text x={60} y={382} color={fg} size={101} font={serif} spacing={-4}>
        by design.
      </Text>
      <Text x={64} y={456} color={fg} size={27}>
        每一道切面，都有用意。
      </Text>
      <g transform={`translate(899,341) rotate(${wave(p) * 5})`}>
        <ellipse cx={0} cy={222} rx={166} ry={17} fill={fg} opacity={0.08} />
        <path d="m-216-93 70-99h287l77 99L0 205Z" fill={a} />
        <path d="m-146-192 42 99H-216Z" fill={s} />
        <path d="m-104-93 58-99 66 99Z" fill={fg} opacity={0.25} />
        <path d="m20-93 54-99 67 0 77 99Z" fill={fg} opacity={0.4} />
        <path d="m-216-93 112 0L0 205Z" fill={fg} opacity={0.5} />
        <path d="m-104-93 124 0L0 205Z" fill={bg} opacity={0.25 + 0.16 * b} />
        <path d="m20-93 198 0L0 205Z" fill={fg} opacity={0.22} />
        <path
          d="m-216-93h434m-364-99 42 99 104 298 20-298 54-99"
          fill="none"
          stroke={bg}
          opacity={0.45}
        />
      </g>
      <Line x1={65} y1={570} x2={364} y2={570} color={a} />
      <Text x={65} y={615} color={fg} size={16} spacing={3}>
        CUT WITH INTENTION.
      </Text>
      <Text x={1210} y={660} color={a} size={17} anchor="end" font={mono}>
        FACET STUDY / 008
      </Text>
    </Canvas>
  );
};

const LuxuryDiptych: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const w = wave(p);
  return (
    <Canvas background={bg}>
      <Text x={640} y={74} color={fg} size={18} spacing={5} anchor="middle">
        MATERIAL CONVERSATIONS
      </Text>
      <Media
        asset="product"
        x={56}
        y={111}
        width={567}
        height={447}
        scale={1.18}
        panX={w * 14}
        filter="saturate(.3)"
      />
      <Media
        asset="architecture"
        x={644}
        y={111}
        width={580}
        height={447}
        scale={1.17}
        panX={-w * 14}
        filter="saturate(.35)"
      />
      <Text x={57} y={589} color={a} size={16} spacing={3}>
        01 / OBJECT
      </Text>
      <Text x={644} y={589} color={a} size={16} spacing={3}>
        02 / SPACE
      </Text>
      <Text x={57} y={654} color={fg} size={44} font={serif}>
        A dialogue in texture.
      </Text>
      <Text x={1222} y={653} color={fg} size={25} anchor="end">
        材質之間，有一種對話。
      </Text>
    </Canvas>
  );
};

const LuxurySalon: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.06, 0.33, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <path
        d="M289 665V332a351 351 0 0 1 702 0v333"
        fill="none"
        stroke={a}
        strokeWidth={2}
      />
      <path
        d="M312 665V332a328 328 0 0 1 656 0v333"
        fill="none"
        stroke={a}
        opacity={0.35}
      />
      <Text x={640} y={211} color={a} size={18} spacing={5} anchor="middle">
        A PRIVATE VIEWING
      </Text>
      <Text x={640} y={359} color={fg} size={99} font={serif} anchor="middle">
        An invitation
      </Text>
      <Text x={640} y={462} color={fg} size={99} font={serif} anchor="middle">
        to pause.
      </Text>
      <Text x={640} y={545} color={fg} size={28} anchor="middle">
        邀請你，暫停片刻。
      </Text>
      <rect x={72} y={105} width={199 - 53 * b} height={545} fill={fg} />
      <rect
        x={1009 + 53 * b}
        y={105}
        width={199 - 53 * b}
        height={545}
        fill={fg}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Line
            x1={106 + i * 54 - 13 * b}
            y1={128}
            x2={106 + i * 54 - 13 * b}
            y2={627}
            color={a}
            opacity={0.5}
          />
          <Line
            x1={1043 + i * 54 + 13 * b}
            y1={128}
            x2={1043 + i * 54 + 13 * b}
            y2={627}
            color={a}
            opacity={0.5}
          />
        </g>
      ))}
      <Text x={640} y={655} color={a} size={16} spacing={4} anchor="middle">
        SPACE / TIME / CONSIDERATION
      </Text>
    </Canvas>
  );
};

const CinematicStarfield: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.05, 0.35, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <g transform={`translate(${wave(p) * 9},${turn(p) * 6})`}>
        {Array.from({ length: 110 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 379 + Math.sin(i) * 140 + 140) % 1280}
            cy={(i * 191 + Math.cos(i) * 90 + 90) % 720}
            r={i % 7 === 0 ? 1.8 : 0.8}
            fill={fg}
            opacity={0.25 + (i % 5) * 0.1}
          />
        ))}
        <Ring x={804} y={351} r={243} color={a} opacity={0.18} />
        <Ring x={804} y={351} r={179} color={a} opacity={0.25} />
        <path
          d="m643 228 134 83 162-114 104 267-247 86-153-322"
          fill="none"
          stroke={a}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={0.6 * (1 - b)}
        />
        {[
          [643, 228],
          [777, 311],
          [939, 197],
          [1043, 464],
          [796, 550],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill={a} />
            <Text x={x + 12} y={y - 9} color={fg} size={14} font={mono}>
              0{i + 1}
            </Text>
          </g>
        ))}
      </g>
      <Text x={56} y={93} color={fg} size={16} spacing={5}>
        AN EXPLORATION OF DISTANCE
      </Text>
      <Text x={56} y={297} color={fg} size={81} font={serif} spacing={5}>
        DISTANT
      </Text>
      <Text x={56} y={386} color={fg} size={81} font={serif} spacing={5}>
        SIGNALS
      </Text>
      <Text x={60} y={449} color={fg} size={26} spacing={4}>
        遙遠的訊號
      </Text>
      <Text x={61} y={650} color={a} size={16} font={mono}>
        NOT A SCIENTIFIC STAR CHART
      </Text>
    </Canvas>
  );
};

const CinematicProjector: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <path d="M278 350 510 220V484Z" fill={a} opacity={0.2 + 0.12 * b} />
      <path d="M69 400h176l18 20H58Z" fill={s} />
      <rect x={76} y={310} width={171} height={92} rx={13} fill={fg} />
      <path d="M91 321h139v70H91z" fill={s} />
      <rect x={99} y={331} width={72} height={48} rx={3} fill={bg} />
      <rect x={177} y={331} width={41} height={48} rx={3} fill={bg} />
      <rect x={224} y={338} width={25} height={35} rx={4} fill={fg} />
      <rect x={244} y={344} width={29} height={23} rx={5} fill={s} />
      <circle cx={276} cy={355} r={17} fill={bg} stroke={fg} strokeWidth={5} />
      <circle cx={276} cy={355} r={7} fill={a} />
      <path
        d="M279 346h10v18h-10zM111 309V292m108 17v-17"
        fill="none"
        stroke={fg}
        strokeWidth={5}
      />
      {[126, 218].map((x, reel) => {
        const y = 252;
        const r = 35;
        const rotation = p * 360 * (reel === 0 ? 1 : -1);
        return (
          <g key={x}>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={bg}
              stroke={fg}
              strokeWidth={10}
            />
            <g transform={`rotate(${rotation}, ${x}, ${y})`}>
              <circle cx={x} cy={y} r={8} fill={a} />
              {[0, 1, 2, 3, 4].map((spoke) => (
                <Line
                  key={spoke}
                  x1={x + Math.cos((spoke * Math.PI * 2) / 5) * 10}
                  y1={y + Math.sin((spoke * Math.PI * 2) / 5) * 10}
                  x2={x + Math.cos((spoke * Math.PI * 2) / 5) * (r - 7)}
                  y2={y + Math.sin((spoke * Math.PI * 2) / 5) * (r - 7)}
                  color={fg}
                  width={3}
                />
              ))}
              <circle cx={x} cy={y} r={3} fill={fg} />
            </g>
          </g>
        );
      })}
      <path
        d="M126 288q18 12 0 22M218 288q-18 12 0 22"
        fill="none"
        stroke={a}
        strokeWidth={3}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Line
          key={i}
          x1={100 + i * 18}
          y1={345}
          x2={100 + i * 18}
          y2={365}
          color={bg}
          width={3}
        />
      ))}
      <path d="M92 402v13m145-13v13" stroke={fg} strokeWidth={7} />
      <Media
        asset="architecture"
        x={468}
        y={95}
        width={733}
        height={504}
        scale={1.12 + 0.03 * b}
        filter="grayscale(1) sepia(.35) brightness(.83)"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={501 + i * 186 + wave(p) * 20}
          y={95}
          width={11}
          height={504}
          fill={bg}
          opacity={0.35}
        />
      ))}
      <Text x={54} y={74} color={fg} size={16} spacing={4}>
        LIGHT THROUGH TIME
      </Text>
      <Text x={54} y={541} color={fg} size={67} font={serif}>
        After the image.
      </Text>
      <Text x={57} y={596} color={fg} size={26}>
        影像之後，光仍然在。
      </Text>
      <Line x1={57} y1={636} x2={1204} y2={636} color={a} opacity={0.5} />
      <Text x={57} y={673} color={fg} size={15} spacing={3}>
        A STUDY OF PROJECTED MEMORY
      </Text>
    </Canvas>
  );
};

const CinematicSpotlight: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <path
        d="M358 44 178 566Q358 638 538 566Z"
        fill={a}
        opacity={0.24 + 0.2 * b}
      />
      <path
        d="M358 48 274 560Q358 600 442 560Z"
        fill={fg}
        opacity={0.035 + 0.055 * b}
      />
      <ellipse
        cx={359}
        cy={608}
        rx={92 + b * 30}
        ry={27 + b * 6}
        fill={a}
        opacity={0.28 + b * 0.16}
      />
      <circle cx={358} cy={374} r={29} fill={fg} />
      <path
        d="m344 402-29 27-19 87h24l13-69 2 95-12 80h23l14-72 14 72h22l-13-82 1-96 18 68h22l-25-86-35-24Z"
        fill={fg}
      />
      <Text x={584} y={219} color={fg} size={19} spacing={7}>
        ONE VOICE. A WHOLE WORLD.
      </Text>
      <Text x={580} y={336} color={fg} size={96} font={serif}>
        The space
      </Text>
      <Text x={580} y={433} color={fg} size={96} font={serif}>
        between words.
      </Text>
      <Text x={586} y={503} color={fg} size={28}>
        話語之間，有整個世界。
      </Text>
      <Line x1={586} y1={550} x2={1095} y2={550} color={a} opacity={0.4} />
      <Text x={586} y={594} color={fg} size={15} spacing={4}>
        A STAGE FOR THE UNSPOKEN
      </Text>
      <rect x={0} width={1280} height={40} fill={bg} />
      <rect x={0} y={676} width={1280} height={44} fill={bg} />
    </Canvas>
  );
};

const CinematicStrata: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p);
  return (
    <Canvas background={bg}>
      <Text x={640} y={100} color={fg} size={16} spacing={7} anchor="middle">
        TIME LEAVES ITS OWN ARCHITECTURE
      </Text>
      <Text
        x={640}
        y={258}
        color={fg}
        size={101}
        font={serif}
        spacing={13}
        anchor="middle"
      >
        LAYERS
      </Text>
      <Text x={640} y={312} color={fg} size={28} spacing={6} anchor="middle">
        時間的地層
      </Text>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M-80 ${393 + i * 59}Q170 ${310 + i * 65} 404 ${405 + i * 48}T777 ${404 + i * 56}T1360 ${347 + i * 60}V800H-80Z`}
          fill={[s, a, "#8c6756", "#664f44", fg][i]}
          transform={`translate(${w * (16 + i * 12)},0)`}
        />
      ))}
      <Text x={55} y={675} color={bg} size={15} spacing={4}>
        AN ORIGINAL GEOLOGICAL IMAGINATION
      </Text>
      <Text x={1226} y={675} color={bg} size={15} spacing={4} anchor="end">
        PART I
      </Text>
    </Canvas>
  );
};

const PerformanceTrack: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.03, 0.18, 0.73, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={56} y={88} color={fg} size={22} weight={800} spacing={2}>
        EVERY SECOND COUNTS.
      </Text>
      <Text x={48} y={352} color={fg} size={244} weight={900} spacing={-20}>
        0{Math.round(3 - 2 * b)}
      </Text>
      <Text x={58} y={426} color={fg} size={38} weight={700}>
        下一秒，突破。
      </Text>
      <Text x={59} y={505} color={fg} size={20} font={mono}>
        LANE 04 / READY TO MOVE
      </Text>
      <g transform="translate(780,356) rotate(-19)">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={-153 - i * 39}
            y={-163 - i * 39}
            width={306 + i * 78}
            height={326 + i * 78}
            rx={153 + i * 39}
            fill="none"
            stroke={fg}
            strokeWidth={i === 4 ? 5 : 2}
          />
        ))}
        <rect x={-13} y={-310} width={26} height={132} fill={a} />
        <path
          d={`M0 -243A243 243 0 0 1 ${243 * Math.sin(b * 2.8)} ${-243 * Math.cos(b * 2.8)}`}
          fill="none"
          stroke={a}
          strokeWidth={18}
        />
        <Text x={0} y={20} color={fg} size={57} weight={800} anchor="middle">
          GO.
        </Text>
      </g>
      <rect x={58} y={609} width={397} height={19} fill={fg} />
      <rect x={58} y={609} width={397 * b} height={19} fill={a} />
      <Text x={58} y={665} color={fg} size={20} weight={700}>
        START WITH INTENTION.
      </Text>
    </Canvas>
  );
};

const PerformanceImpact: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = rebound(p, 0.04, 0.19, 0.72, 0.97);
  return (
    <Canvas background={bg}>
      <rect x={610} width={670} height={720} fill={fg} />
      <path
        d="M-20 481 1300 218v136L-20 617Z"
        fill={a}
        transform={`translate(${b * 35},${-b * 12})`}
      />
      <Text x={51} y={86} color={fg} size={23} weight={700}>
        NO SHORTCUTS.
      </Text>
      <Text x={1219} y={86} color={bg} size={19} font={mono} anchor="end">
        ROUND / 03
      </Text>
      <Text
        x={38 - 27 * b}
        y={300}
        color={fg}
        size={201}
        weight={900}
        spacing={-12}
      >
        SHOW
      </Text>
      <Text
        x={619 + 28 * b}
        y={615}
        color={bg}
        size={200}
        weight={900}
        spacing={-12}
      >
        UP.
      </Text>
      <g transform={`translate(835,300) rotate(${-23 + b * 9})`}>
        <path
          d="M-97-40q-28-49-80-24t-12 113l69 54h126q77-16 66-91t-117-86q-42-2-52 34Z"
          fill={bg}
        />
        <rect x={-49} y={93} width={124} height={76} rx={9} fill={a} />
        <path
          d="M-89-27q26 26 84 27M-61 75h114"
          stroke={fg}
          strokeWidth={8}
          fill="none"
        />
      </g>
      <Text x={57} y={668} color={fg} size={28} weight={700}>
        每一次出場，都算數。
      </Text>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1141 + i * 37 - 12 * b}
          y={170}
          width={11}
          height={76}
          fill={a}
        />
      ))}
    </Canvas>
  );
};

const PerformanceAscent: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.03, 0.43, 0.74, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={58} y={86} color={fg} size={20} spacing={3}>
        ELEVATION / ENDURANCE
      </Text>
      <Text x={49} y={261} color={fg} size={119} weight={900} spacing={-8}>
        RISE
      </Text>
      <Text x={49} y={375} color={fg} size={119} weight={900} spacing={-8}>
        AGAIN.
      </Text>
      <Text x={57} y={445} color={fg} size={31} weight={700}>
        向上，不只是一個方向。
      </Text>
      <g>
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`M${520 + i * 33} 712 680 ${560 - i * 16} 830 ${475 - i * 20} 967 ${224 - i * 10} 1150 ${128 + i * 16} 1310 ${231 + i * 14}`}
            fill="none"
            stroke={fg}
            opacity={0.22}
            strokeWidth={2}
          />
        ))}
      </g>
      <path
        d="M655 610 776 495 864 468 963 267 1126 152"
        fill="none"
        stroke={a}
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0.7 * (1 - b)}
      />
      {[
        [655, 610],
        [776, 495],
        [864, 468],
        [963, 267],
        [1126, 152],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 4 ? 14 : 7} fill={a} />
          <Text x={x - 22} y={y - 19} color={fg} size={18} font={mono}>
            0{i + 1}
          </Text>
        </g>
      ))}
      <Text x={58} y={598} color={a} size={79} weight={700}>
        +{Math.round(240 + 620 * b)}
        <tspan fontSize={26}>m</tspan>
      </Text>
      <Text x={60} y={653} color={fg} size={17} font={mono}>
        ILLUSTRATIVE ROUTE / KEEP CLIMBING
      </Text>
    </Canvas>
  );
};

const PerformanceCourt: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Text x={57} y={85} color={fg} size={24} weight={800}>
        PLAY WITH PURPOSE.
      </Text>
      <Text x={1221} y={85} color={fg} size={20} font={mono} anchor="end">
        TACTICAL STUDY / 05
      </Text>
      <rect x={405} y={139} width={815} height={507} fill={s} />
      <rect
        x={425}
        y={158}
        width={774}
        height={469}
        fill="none"
        stroke={fg}
        strokeWidth={3}
      />
      <Line x1={812} y1={158} x2={812} y2={627} color={fg} width={3} />
      <Ring x={812} y={393} r={76} color={fg} width={3} />
      {[425, 1199].map((x, i) => (
        <g key={x}>
          <rect
            x={i ? 1081 : 425}
            y={283}
            width={118}
            height={218}
            fill="none"
            stroke={fg}
            strokeWidth={3}
          />
          <path
            d={`M${x} 197Q${i ? x - 267 : x + 267} 393 ${x} 588`}
            fill="none"
            stroke={fg}
            strokeWidth={3}
          />
        </g>
      ))}
      <path
        d="m616 515 96-180 231 92 129-178"
        fill="none"
        stroke={a}
        strokeWidth={5}
        strokeDasharray="14 11"
        strokeDashoffset={b * 32}
      />
      {[
        [616, 515],
        [712, 335],
        [943, 427],
        [1072, 249],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={24} fill={a} />
          <Text
            x={x}
            y={y + 7}
            color={bg}
            size={21}
            weight={700}
            anchor="middle"
          >
            {i + 1}
          </Text>
        </g>
      ))}
      <circle cx={712 + 231 * b} cy={335 + 92 * b} r={9} fill={fg} />
      <Text x={57} y={225} color={fg} size={87} weight={900}>
        04
      </Text>
      <Text x={60} y={268} color={fg} size={21} font={mono}>
        CONNECTED PLAYS
      </Text>
      <Text x={58} y={392} color={fg} size={36} weight={700}>
        讓默契，
      </Text>
      <Text x={58} y={439} color={fg} size={36} weight={700}>
        成為節奏。
      </Text>
      <Line x1={58} y1={501} x2={335} y2={501} color={fg} />
      <Text x={60} y={548} color={fg} size={18}>
        路線・空間・時機
      </Text>
    </Canvas>
  );
};

const IndustrialExploded: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.08, 0.34, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={62} y={87} color={fg} size={18} font={mono}>
        ASSEMBLY / SECTION A—A
      </Text>
      <Text x={62} y={180} color={fg} size={56} weight={500}>
        每個部件，
      </Text>
      <Text x={62} y={246} color={fg} size={56} weight={500}>
        各司其職。
      </Text>
      <Text x={65} y={312} color={a} size={20} font={mono}>
        FORM FOLLOWS FUNCTION.
      </Text>
      <Line
        x1={795}
        y1={84}
        x2={795}
        y2={650}
        color={fg}
        opacity={0.4}
        dash="8 6"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <g
          key={i}
          transform={`translate(795,${209 + i * 71 + (i - 2) * 26 * b})`}
        >
          <ellipse
            rx={i === 2 ? 142 : 117}
            ry={34}
            fill={bg}
            stroke={fg}
            strokeWidth={2}
          />
          <path
            d={`M${i === 2 ? -142 : -117} 0v28a${i === 2 ? 142 : 117} 34 0 0 0 ${i === 2 ? 284 : 234} 0V0`}
            fill={bg}
            stroke={fg}
            strokeWidth={2}
          />
          <ellipse
            cy={28}
            rx={i === 2 ? 142 : 117}
            ry={34}
            fill="none"
            stroke={fg}
            opacity={0.3}
          />
          <ellipse rx={47} ry={14} fill="none" stroke={a} strokeWidth={2} />
          <Line x1={144} y1={0} x2={275} y2={0} color={a} />
          <Text x={285} y={6} color={fg} size={16} font={mono}>
            PART 0{i + 1}
          </Text>
        </g>
      ))}
      <rect x={66} y={492} width={252} height={101} fill={fg} opacity={0.08} />
      <Text x={85} y={528} color={fg} size={16} font={mono}>
        AXIAL DISPLACEMENT
      </Text>
      <Text x={85} y={569} color={a} size={24} font={mono}>
        {(26 * b).toFixed(1)} mm / DEMO
      </Text>
      <Text x={67} y={655} color={fg} size={16} font={mono}>
        SIMPLIFIED VECTOR PARTS / NOT CAD DATA
      </Text>
    </Canvas>
  );
};

const IndustrialConsole: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const w = wave(p);
  return (
    <Canvas background={bg}>
      <Text x={53} y={82} color={fg} size={24} font={mono}>
        CONTROL ROOM / LIVE SIMULATION
      </Text>
      <Text x={1222} y={81} color={a} size={17} font={mono} anchor="end">
        NORMAL OPERATION
      </Text>
      <rect x={54} y={112} width={1172} height={9} fill={a} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={54 + i * 397}
          y={161}
          width={376}
          height={452}
          rx={4}
          fill={fg}
          opacity={0.07}
        />
      ))}
      <Ring x={242} y={346} r={121} color={fg} />
      <Ring x={242} y={346} r={104} color={fg} opacity={0.25} />
      {Array.from({ length: 15 }, (_, i) => (
        <Line
          key={i}
          x1={242 + 108 * Math.cos(((i * 15 + 165) * Math.PI) / 180)}
          y1={346 + 108 * Math.sin(((i * 15 + 165) * Math.PI) / 180)}
          x2={242 + 121 * Math.cos(((i * 15 + 165) * Math.PI) / 180)}
          y2={346 + 121 * Math.sin(((i * 15 + 165) * Math.PI) / 180)}
          color={fg}
        />
      ))}
      <Line
        x1={242}
        y1={346}
        x2={242 + 91 * Math.cos((-0.5 + w * 0.22) * Math.PI)}
        y2={346 + 91 * Math.sin((-0.5 + w * 0.22) * Math.PI)}
        color={a}
        width={5}
      />
      <circle cx={242} cy={346} r={13} fill={a} />
      <Text x={242} y={534} color={fg} size={19} font={mono} anchor="middle">
        PRESSURE / 1.02 BAR
      </Text>
      <Text x={474} y={209} color={fg} size={17} font={mono}>
        CHANNEL 02 / OSCILLATOR
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <Line
          key={i}
          x1={474}
          y1={267 + i * 63}
          x2={797}
          y2={267 + i * 63}
          color={fg}
          opacity={0.13}
        />
      ))}
      <polyline
        points={Array.from(
          { length: 110 },
          (_, i) =>
            `${474 + i * 2.95},${365 + Math.sin(i * 0.18 + p * Math.PI * 2) * 55 + Math.sin(i * 0.47) * 18}`,
        ).join(" ")}
        fill="none"
        stroke={a}
        strokeWidth={3}
      />
      <Text x={474} y={541} color={fg} size={38} font={mono}>
        SIGNAL / STABLE
      </Text>
      <Text x={873} y={209} color={fg} size={17} font={mono}>
        SYSTEM STATE
      </Text>
      {["POWER", "FLOW", "THERMAL", "OUTPUT"].map((t, i) => (
        <g key={t}>
          <rect
            x={875}
            y={247 + i * 77}
            width={68}
            height={30}
            rx={15}
            fill={i === 2 ? s : a}
          />
          <circle cx={926} cy={262 + i * 77} r={10} fill={bg} />
          <Text x={965} y={270 + i * 77} color={fg} size={20} font={mono}>
            {t}
          </Text>
        </g>
      ))}
      <Text x={54} y={675} color={fg} size={26}>
        讓複雜，維持在掌握之中。
      </Text>
    </Canvas>
  );
};

const IndustrialAxonometric: React.FC<RecipeProps> = ({
  style,
  progress: p,
}) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p, 0.04, 0.35, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={54} y={86} color={fg} size={20} font={mono}>
        MODULAR STRUCTURE / ISO VIEW
      </Text>
      <Text x={55} y={241} color={fg} size={59} weight={600}>
        從單元，
      </Text>
      <Text x={55} y={308} color={fg} size={59} weight={600}>
        到系統。
      </Text>
      <Text x={58} y={369} color={a} size={19} font={mono}>
        ONE MODULE. MANY POSSIBILITIES.
      </Text>
      <g transform="translate(843,500)">
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            transform={`translate(0,${-i * (67 + 18 * beat(p, 0.04 + i * 0.04, 0.27 + i * 0.04, 0.7, 0.98))})`}
          >
            <path
              d="M-242 0 0-117 242 0 0 117Z"
              fill={bg}
              stroke={fg}
              strokeWidth={2}
            />
            <path d="M-242 0v29L0 146V117Z" fill={s} stroke={fg} />
            <path
              d="M242 0v29L0 146V117Z"
              fill={fg}
              opacity={0.2}
              stroke={fg}
            />
            <path d="M-163 0 0-79 163 0 0 79Z" fill="none" stroke={a} />
            <path d="M-80-78v117m160-117v117" stroke={fg} opacity={0.35} />
          </g>
        ))}
      </g>
      <path d="M572 184v416m-13-416h26m-26 416h26" fill="none" stroke={a} />
      <Text x={554} y={411} color={a} size={17} font={mono} anchor="end">
        H {(268 + 54 * b).toFixed(0)}
      </Text>
      <Text x={61} y={605} color={fg} size={17} font={mono}>
        SIMPLIFIED AXONOMETRIC ILLUSTRATION
      </Text>
      <Text x={61} y={650} color={fg} size={27}>
        可讀、可擴充、可重組。
      </Text>
    </Canvas>
  );
};

const IndustrialScan: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <defs>
        <pattern
          id="scan-hatch"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path d="m-3 3 6-6m-3 15 12-12m-3 15 6-6" stroke={fg} opacity=".5" />
        </pattern>
        <clipPath id="scan-reveal">
          <rect x={80} y={166} width={795 * (0.45 + 0.55 * b)} height={351} />
        </clipPath>
      </defs>
      <Text x={54} y={87} color={fg} size={21} font={mono}>
        MATERIAL / CROSS SECTION
      </Text>
      <rect
        x={53}
        y={134}
        width={849}
        height={411}
        fill="none"
        stroke={fg}
        opacity={0.4}
      />
      <path
        d="M110 425V252h96l55 74 88-54 75 25 56-108h120l72 143 137-56 57 174H110Z"
        fill="none"
        stroke={fg}
      />
      <g clipPath="url(#scan-reveal)">
        <path
          d="M110 425V252h96l55 74 88-54 75 25 56-108h120l72 143 137-56 57 174H110Z"
          fill="url(#scan-hatch)"
          stroke={a}
          strokeWidth={2}
        />
        <circle cx={477} cy={352} r={66} fill={bg} stroke={a} />
        <rect x={655} y={350} width={78} height={35} fill={bg} stroke={a} />
      </g>
      <Line
        x1={80 + 795 * (0.45 + 0.55 * b)}
        y1={148}
        x2={80 + 795 * (0.45 + 0.55 * b)}
        y2={530}
        color={a}
        width={3}
      />
      <Text x={948} y={212} color={fg} size={20} font={mono}>
        01 / DENSITY
      </Text>
      <Text x={949} y={264} color={a} size={50} font={mono}>
        0.84
      </Text>
      <Line x1={947} y1={301} x2={1215} y2={301} color={fg} opacity={0.3} />
      <Text x={948} y={356} color={fg} size={20} font={mono}>
        02 / STRUCTURE
      </Text>
      <Text x={949} y={409} color={fg} size={32}>
        內在，也很重要。
      </Text>
      <Text x={55} y={625} color={fg} size={48} weight={500}>
        LOOK BELOW THE SURFACE.
      </Text>
      <Text x={58} y={677} color={fg} size={15} font={mono}>
        ILLUSTRATIVE SECTION / NOT A MATERIAL TEST
      </Text>
    </Canvas>
  );
};

const SpatialPlanes: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.04, 0.31, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={59} y={86} color={fg} size={19} spacing={3}>
        INFORMATION, UNFOLDED.
      </Text>
      {[3, 2, 1, 0].map((i) => (
        <g
          key={i}
          transform={`translate(${511 + i * (47 + 18 * b)},${151 + i * (55 + 13 * b)}) skewY(-12)`}
        >
          <rect
            width={483}
            height={261}
            rx={9}
            fill={i === 0 ? "#ffffff" : bg}
            stroke={fg}
            opacity={i === 0 ? 1 : 0.78}
          />
          <rect
            x={25}
            y={29}
            width={150}
            height={12}
            rx={6}
            fill={i === 0 ? a : fg}
            opacity={0.7}
          />
          <Line x1={25} y1={69} x2={458} y2={69} color={fg} opacity={0.2} />
          <Text x={26} y={111} color={fg} size={19} font={mono}>
            LAYER 0{i + 1}
          </Text>
          <rect
            x={25}
            y={142}
            width={130}
            height={89}
            fill={a}
            opacity={0.15}
          />
          {[0, 1, 2].map((j) => (
            <rect
              key={j}
              x={182}
              y={148 + j * 28}
              width={j === 2 ? 157 : 238}
              height={9}
              rx={4}
              fill={fg}
              opacity={0.18}
            />
          ))}
        </g>
      ))}
      <Text x={60} y={461} color={fg} size={69} weight={500}>
        A clearer
      </Text>
      <Text x={60} y={535} color={fg} size={69} weight={500}>
        dimension.
      </Text>
      <Text x={65} y={594} color={fg} size={27}>
        展開，讓關係更清楚。
      </Text>
      <Text x={66} y={660} color={fg} size={15} font={mono}>
        2.5D OFFSET PLANES / NOT FULL 3D
      </Text>
    </Canvas>
  );
};

const SpatialVoxels: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p, 0.05, 0.33, 0.7, 0.98);
  const cube = (x: number, y: number, z: number, c: string, k: string) => (
    <g key={k} transform={`translate(${x},${y - z})`}>
      <path d="m0 0 75-42 75 42-75 43Z" fill={c} />
      <path d="m0 0v76l75 43V43Z" fill={c} opacity={0.65} />
      <path d="m75 43 75-43v76l-75 43Z" fill={c} opacity={0.85} />
    </g>
  );
  return (
    <Canvas background={bg}>
      <Text x={61} y={88} color={fg} size={20} spacing={3}>
        SMALL UNITS / BIG CONNECTIONS
      </Text>
      <g opacity={0.12}>
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <Line
              x1={494 + i * 75}
              y1={393 + i * 42}
              x2={1094 + i * 75}
              y2={57 + i * 42}
              color={fg}
            />
            <Line
              x1={494 + i * 75}
              y1={393 - i * 42}
              x2={1094 + i * 75}
              y2={729 - i * 42}
              color={fg}
            />
          </g>
        ))}
      </g>
      {cube(643, 453, 0, s, "a")}
      {cube(793, 537, 0, a, "b")}
      {cube(868, 411, 0, fg, "c")}
      {cube(718, 327, 40 * b, a, "d")}
      {cube(793, 201, 83 * b, s, "e")}
      <path
        d={`M718 ${365 - 40 * b}V${235 - 83 * b}h150`}
        fill="none"
        stroke={a}
        strokeDasharray="5 5"
      />
      <circle cx={872} cy={235 - 83 * b} r={7} fill={a} />
      <Text x={54} y={272} color={fg} size={88} weight={700} spacing={-4}>
        Built
      </Text>
      <Text x={54} y={361} color={fg} size={88} weight={700} spacing={-4}>
        together.
      </Text>
      <Text x={59} y={429} color={fg} size={27}>
        每個單元，都能連結。
      </Text>
      <Text x={61} y={649} color={fg} size={17} font={mono}>
        ILLUSTRATED ISOMETRIC VOXELS
      </Text>
    </Canvas>
  );
};

const SpatialCity: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={60} y={84} color={fg} size={19} spacing={3}>
        A CITY IN MINIATURE
      </Text>
      <g transform={`translate(${wave(p) * 12},0)`}>
        <path d="M335 460 799 192 1263 460 799 728Z" fill={fg} opacity={0.06} />
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 4,
            row = Math.floor(i / 4),
            x = 449 + col * 116 + row * 99,
            y = 400 - col * 67 + row * 57,
            h = 40 + ((i * 47) % 140);
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <path d={`m0 0 55-32 60 34v${-h}l-60-34-55 32Z`} fill={s} />
              <path d={`m0 0v${-h}l55 32V32Z`} fill={a} opacity={0.6} />
              <path d={`m55 32 60-34v${-h}l-60 34Z`} fill={fg} opacity={0.6} />
              <path d={`m0 ${-h} 55-32 60 34-60 33Z`} fill={a} />
              {[0, 1, 2].map((j) => (
                <Line
                  key={j}
                  x1={68}
                  y1={-h + 45 + j * 21}
                  x2={101}
                  y2={-h + 26 + j * 21}
                  color={bg}
                  opacity={0.4}
                />
              ))}
            </g>
          );
        })}
        <path
          d="M481 499 791 320 1084 489"
          fill="none"
          stroke={a}
          strokeWidth={7}
          pathLength={1}
          strokeDasharray=".25 .03"
          strokeDashoffset={turn(p) * 0.3}
        />
      </g>
      <Text x={61} y={203} color={fg} size={64} weight={600}>
        Small scale.
      </Text>
      <Text x={61} y={270} color={fg} size={64} weight={600}>
        Big stories.
      </Text>
      <Text x={65} y={331} color={fg} size={27}>
        縮小尺度，放大想像。
      </Text>
      <Text x={66} y={640} color={fg} size={16} font={mono}>
        2.5D CITY BLOCK STUDY / 012
      </Text>
    </Canvas>
  );
};

const SpatialTunnel: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <defs>
        <clipPath id="tunnel-frame">
          <rect x={42} y={44} width={1196} height={632} />
        </clipPath>
      </defs>
      <g clipPath="url(#tunnel-frame)">
        {Array.from({ length: 11 }, (_, i) => {
          const s = 0.14 + i * 0.096 + 0.052 * b;
          return (
            <rect
              key={i}
              x={640 - 610 * s}
              y={336 - 360 * s}
              width={1220 * s}
              height={720 * s}
              fill="none"
              stroke={fg}
              opacity={0.16 + i * 0.045}
            />
          );
        })}
        {[
          [42, 44],
          [1238, 44],
          [42, 676],
          [1238, 676],
        ].map(([x, y], i) => (
          <Line
            key={i}
            x1={x}
            y1={y}
            x2={640}
            y2={336}
            color={fg}
            opacity={0.4}
          />
        ))}
      </g>
      <rect
        x={408 - b * 70}
        y={221 - b * 8}
        width={464 + b * 140}
        height={203 + b * 16}
        fill={bg}
      />
      <Text x={640} y={294} color={a} size={16} spacing={4} anchor="middle">
        WAYFINDING / AHEAD
      </Text>
      <Text x={640} y={367} color={fg} size={66} weight={600} anchor="middle">
        KEEP GOING →
      </Text>
      <Text x={640} y={487} color={fg} size={27} anchor="middle">
        方向，讓空間有了意義。
      </Text>
      <Text x={63} y={650} color={fg} size={16} font={mono}>
        PERSPECTIVE LINE STUDY / SIMPLIFIED 2.5D
      </Text>
    </Canvas>
  );
};

const CollageStrips: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={57} y={80} color={fg} size={20} font={mono}>
        CITY FRAGMENTS / RECOMPOSED
      </Text>
      {Array.from({ length: 7 }, (_, i) => (
        <g
          key={i}
          transform={`translate(0,${(i % 2 ? 1 : -1) * 24 * beat(p, 0.03 + i * 0.018, 0.25 + i * 0.018, 0.7, 0.98)}) rotate(${i % 2 ? 1.2 : -1.2},${73 + i * 161},352)`}
        >
          <rect
            x={62 + i * 161}
            y={151}
            width={158}
            height={428}
            fill="#f4ebd7"
          />
          <Media
            asset="architecture"
            x={70 + i * 161}
            y={163}
            width={141}
            height={400}
            scale={1.7}
            position={`${i * 16}% center`}
            filter="grayscale(1)"
          />
          <path
            d={`m${70 + i * 161} 524 28 8 21-15 25 12 31-4 36 13v30h-141Z`}
            fill={bg}
          />
        </g>
      ))}
      <g transform="rotate(-3,440,415)">
        <rect x={92} y={353} width={803} height={116} fill={a} />
        <Text x={115} y={436} color={bg} size={78} weight={900} spacing={-3}>
          A DIFFERENT CITY.
        </Text>
      </g>
      <Text x={61} y={642} color={fg} size={31} weight={600}>
        同一座城市，不同的拼法。
      </Text>
      <Text x={1219} y={662} color={fg} size={16} font={mono} anchor="end">
        CUT / SHIFT / REFRAME
      </Text>
    </Canvas>
  );
};

const CollagePinboard: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.02, 0.29, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <defs>
        <pattern id="cork" width="19" height="17" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="7" r="1" fill={fg} opacity=".08" />
          <circle cx="14" cy="3" r=".7" fill={fg} opacity=".1" />
        </pattern>
      </defs>
      <rect width={1280} height={720} fill="url(#cork)" />
      <path
        d="m278 153 465 19 298 278-711 105-52-402"
        stroke={a}
        fill="none"
        strokeWidth={3}
      />
      {["architecture", "botanical", "product"].map((asset, i) => {
        const settle = beat(p, 0.03 + i * 0.14, 0.18 + i * 0.14, 0.76, 0.98);
        const tilt = [-7, 5, -4][i] + (1 - settle) * (i % 2 ? 4 : -4);
        return (
        <g
          key={asset}
          transform={`translate(0,${-82 * (1 - settle)}) rotate(${tilt},${[249, 730, 1023][i]},${[350, 320, 476][i]})`}
        >
          <rect
            x={[91, 554, 876][i]}
            y={[153, 135, 304][i]}
            width={[326, 352, 287][i]}
            height={[363, 357, 314][i]}
            fill="#f8f1de"
          />
          <Media
            asset={asset}
            x={[107, 570, 892][i]}
            y={[169, 151, 320][i]}
            width={[294, 320, 255][i]}
            height={[288, 284, 241][i]}
            filter="saturate(.4)"
          />
          <circle
            cx={[250, 729, 1022][i]}
            cy={[163, 146, 315][i]}
            r={7}
            fill={a}
          />
          <Text
            x={[109, 572, 894][i]}
            y={[493, 469, 594][i]}
            color={fg}
            size={19}
            font={mono}
          >
            NOTE / 0{i + 1}
          </Text>
        </g>
        );
      })}
      <Text x={59} y={92} color={fg} size={49} font={serif}>
        Connections, collected.
      </Text>
      <rect
        x={70}
        y={548}
        width={532}
        height={73}
        fill={a}
        transform={`rotate(${-2 - b},330,580)`}
      />
      <Text x={89} y={597} color={bg} size={34} weight={700}>
        把靈感，連成一條線。
      </Text>
      <Text x={64} y={677} color={fg} size={16} font={mono}>
        ORIGINAL ILLUSTRATION PINBOARD
      </Text>
    </Canvas>
  );
};

const CollageRansom: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={61} y={81} color={fg} size={19} font={mono}>
        NO TWO LETTERS ALIKE.
      </Text>
      <path d="m-20 150 1320 52-31 360-1321-37Z" fill={s} />
      {["MAKE", "ROOM"].map((word, row) => (
        <g key={word}>
          {[...word].map((letter, i) => {
            const b = rebound(
                p,
                0.03 + (row * 4 + i) * 0.025,
                0.24 + (row * 4 + i) * 0.025,
                0.7,
                0.98,
              ),
              x = 240 + i * 207,
              y = 196 + row * 185;
            return (
              <g
                key={i}
                transform={`translate(${x},${y + (1 - b) * 15}) rotate(${[-5, 6, -3, 4][i] + (1 - b) * (i % 2 ? 8 : -8)})`}
              >
                <rect
                  x={-12}
                  y={-24}
                  width={178}
                  height={172}
                  fill={i % 2 ? fg : a}
                />
                <Text
                  x={76}
                  y={109}
                  color={bg}
                  size={145}
                  weight={i % 2 ? 800 : 400}
                  font={i % 2 ? sans : serif}
                  anchor="middle"
                >
                  {letter}
                </Text>
              </g>
            );
          })}
        </g>
      ))}
      <Text x={63} y={639} color={fg} size={34} weight={700}>
        為不同的聲音，留下位置。
      </Text>
      <Text x={1220} y={674} color={fg} size={16} font={mono} anchor="end">
        CUT-TYPE MANIFESTO / 04
      </Text>
    </Canvas>
  );
};

const CollageHerbarium: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.07, 0.31, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <rect
        x={148}
        y={48}
        width={641}
        height={637}
        fill={fg}
        opacity={0.08}
        transform="rotate(-2,460,360)"
      />
      <g transform={`rotate(${-3 + b * 2},161,61)`}>
        <rect x={161} y={61} width={641} height={623} fill="#f8f3e5" />
        <Media
          asset="botanical"
          x={230}
          y={105}
          width={485}
          height={488}
          filter="saturate(.35)"
        />
        <rect x={230} y={620} width={455} height={28} fill={bg} />
        <Text x={242} y={641} color={fg} size={16} font={mono}>
          SPECIMEN 027 / BOTANICAL STUDY
        </Text>
        <rect x={414} y={90} width={126} height={27} fill={bg} opacity={0.9} />
      </g>
      <Text x={866} y={145} color={a} size={18} font={mono}>
        FIELD COLLECTION
      </Text>
      <Text x={857} y={261} color={fg} size={77} font={serif}>
        Grown
      </Text>
      <Text x={857} y={339} color={fg} size={77} font={serif}>
        with time.
      </Text>
      <Text x={863} y={400} color={fg} size={27}>
        收藏，一段生長。
      </Text>
      <path
        d="M722 393h94v70h354"
        fill="none"
        stroke={a}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0.65 * (1 - b)}
      />
      <Text x={871} y={514} color={fg} size={16} font={mono}>
        DATE / 2026.06.14
      </Text>
      <Text x={870} y={553} color={fg} size={16} font={mono}>
        PLACE / ORIGINAL STUDY
      </Text>
      <Ring x={1111} y={613} r={45} color={a} width={2} />
      <Text x={1111} y={620} color={a} size={18} font={mono} anchor="middle">
        FILED
      </Text>
    </Canvas>
  );
};

const RetroSunburst: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <defs>
        <clipPath id="sun-half">
          <rect x={505} y={82} width={682} height={397} />
        </clipPath>
      </defs>
      <g clipPath="url(#sun-half)">
        <circle cx={846} cy={478} r={315} fill={a} />
        {Array.from({ length: 11 }, (_, i) => (
          <rect
            key={i}
            x={500}
            y={171 + i * 30 + 15 * b}
            width={700}
            height={i * 0.7 + 4}
            fill={bg}
          />
        ))}
      </g>
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M-50 ${495 + i * 44}Q310 ${370 + i * 48} 600 ${488 + i * 40}T1330 ${473 + i * 39}`}
          fill="none"
          stroke={[s, a, fg, s][i]}
          strokeWidth={35}
          transform={`translate(${wave(p) * (25 + i * 8)},0)`}
        />
      ))}
      <Text x={51} y={97} color={fg} size={19} spacing={3}>
        TOMORROW FEELS WARM.
      </Text>
      <Text
        x={50}
        y={290}
        color={fg}
        size={110}
        font={serif}
        weight={700}
        spacing={-4}
      >
        Good
      </Text>
      <Text
        x={50}
        y={396}
        color={fg}
        size={110}
        font={serif}
        weight={700}
        spacing={-4}
      >
        days ahead.
      </Text>
      <Text x={54} y={674} color={fg} size={31} weight={700}>
        把好日子，放在眼前。
      </Text>
    </Canvas>
  );
};

const RetroPixel: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const phase = ((p + 1) % 1) * 3;
  const platform = Math.min(2, Math.floor(phase));
  const jump = phase - platform;
  const easedJump = jump * jump * (3 - 2 * jump);
  const platformX = [529, 625, 721][platform];
  const platformY = [466, 417, 368][platform];
  const nextPlatform = (platform + 1) % 3;
  const nextX = [529, 625, 721][nextPlatform];
  const nextY = [466, 417, 368][nextPlatform];
  const characterX = platformX + 8 + (nextX - platformX) * easedJump;
  const characterY = platformY - 64 + (nextY - platformY) * easedJump - 44 * Math.sin(jump * Math.PI);
  return (
    <Canvas background={bg}>
      <Text x={56} y={74} color={fg} size={23} font={mono} weight={700}>
        SCORE 002400
      </Text>
      <Text
        x={1224}
        y={74}
        color={fg}
        size={23}
        font={mono}
        weight={700}
        anchor="end"
      >
        LEVEL 01 / EXPLORE
      </Text>
      <Text
        x={640}
        y={223}
        color={fg}
        size={90}
        font={mono}
        weight={700}
        anchor="middle"
      >
        NEW ADVENTURES
      </Text>
      <Text x={640} y={289} color={fg} size={28} anchor="middle">
        下一個轉角，還有新發現。
      </Text>
      {[
        [113, 354],
        [831, 342],
        [1053, 185],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={72} height={24} fill={fg} opacity={0.6} />
          <rect
            x={x + 16}
            y={y - 16}
            width={24}
            height={16}
            fill={fg}
            opacity={0.6}
          />
        </g>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i}>
          <rect x={i * 64} y={618} width={64} height={102} fill={fg} />
          <rect x={i * 64 + 4} y={620} width={56} height={14} fill={s} />
          <rect
            x={i * 64 + 9}
            y={649}
            width={8}
            height={8}
            fill={bg}
            opacity={0.2}
          />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={529 + i * 96}
            y={466 - i * 49}
            width={96}
            height={28}
            fill={s}
          />
          <rect
            x={533 + i * 96}
            y={472 - i * 49}
            width={88}
            height={5}
            fill={a}
          />
        </g>
      ))}
      <g transform={`translate(${characterX},${characterY})`}>
        <rect x={8} y={0} width={32} height={16} fill={a} />
        <rect x={0} y={16} width={48} height={24} fill={a} />
        <rect x={16} y={8} width={8} height={8} fill={fg} />
        <rect x={0} y={40} width={16} height={24} fill={fg} />
        <rect x={32} y={40} width={16} height={24} fill={fg} />
      </g>
      <rect x={980} y={462} width={8} height={156} fill={a} />
      <path d="m988 462h104v64H988Z" fill={a} />
      <Text x={1038} y={507} color={fg} size={26} font={mono} anchor="middle">
        GO
      </Text>
    </Canvas>
  );
};

const RetroTeletext: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const row = Math.round(turn(p) * 3);
  return (
    <Canvas background={bg}>
      <rect x={49} y={45} width={1182} height={56} fill={a} />
      <Text x={65} y={84} color={bg} size={30} font={mono} weight={700}>
        P108 TEXT SERVICES
      </Text>
      <Text x={1214} y={83} color={bg} size={24} font={mono} anchor="end">
        SAT 03 OCT
      </Text>
      <Text x={55} y={168} color={fg} size={49} font={mono} weight={700}>
        THE DAILY SIGNAL
      </Text>
      <Text x={55} y={219} color={s} size={25}>
        今天，有什麼新訊息？
      </Text>
      <Line x1={56} y1={257} x2={1225} y2={257} color={fg} width={2} />
      {[
        "301  CITY & CULTURE",
        "302  DESIGN JOURNAL",
        "303  FIELD REPORT",
        "304  WEEKEND NOTES",
      ].map((v, i) => (
        <g key={v}>
          <rect
            x={55}
            y={287 + i * 71}
            width={736}
            height={57}
            fill={i === row ? a : bg}
          />
          <Text
            x={71}
            y={326 + i * 71}
            color={i === row ? bg : fg}
            size={31}
            font={mono}
            weight={700}
          >
            {v}
          </Text>
        </g>
      ))}
      <rect x={842} y={287} width={379} height={270} fill={fg} />
      <Text x={865} y={333} color={bg} size={25} font={mono}>
        WEATHER / DEMO
      </Text>
      <circle cx={936} cy={413} r={35} fill={a} />
      <path d="M967 416q20-41 45-10 36-3 40 30h-107q-17-16 22-20" fill={bg} />
      <Text x={865} y={523} color={bg} size={37} font={mono}>
        25°C / CLEAR
      </Text>
      <rect x={55} y={612} width={1170} height={55} fill={s} />
      <Text x={71} y={649} color={bg} size={22} font={mono}>
        INDEX NEXT PAGE HOLD ORIGINAL GRAPHIC STUDY
      </Text>
    </Canvas>
  );
};

const RetroHalftone: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const w = wave(p) * 24;
  return (
    <Canvas background={bg}>
      <defs>
        <pattern
          id="halftone-large"
          width="13"
          height="13"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="6.5" cy="6.5" r="4.2" fill={fg} />
        </pattern>
        <clipPath id="half-circle">
          <circle cx={899} cy={332} r={249} />
        </clipPath>
      </defs>
      <path d="M0 0h766L502 720H0Z" fill={a} />
      <circle
        cx={899}
        cy={332}
        r={255}
        fill={a}
        transform={`translate(${w},0)`}
      />
      <rect
        x={640}
        y={65}
        width={520}
        height={520}
        fill="url(#halftone-large)"
        clipPath="url(#half-circle)"
        transform={`translate(${-w},${w})`}
      />
      <path
        d="M895 161 939 268l117-19-84 84 62 103-116-34-66 96-3-118-114-35 108-42Z"
        fill={bg}
        stroke={fg}
        strokeWidth={4}
      />
      <g transform={`translate(${w},${-w}) rotate(-7,333,365)`}>
        <Text x={49} y={270} color={bg} size={117} weight={900} spacing={-5}>
          MAKE
        </Text>
        <Text x={49} y={387} color={bg} size={117} weight={900} spacing={-5}>
          A MARK.
        </Text>
      </g>
      <Text x={58} y={90} color={bg} size={20} font={mono} weight={700}>
        PRINT IT LOUD.
      </Text>
      <Text x={56} y={637} color={bg} size={31} weight={700}>
        讓想法，留下印記。
      </Text>
      <Text x={1222} y={674} color={fg} size={16} font={mono} anchor="end">
        INK / DOT / PAPER
      </Text>
    </Canvas>
  );
};

const MinimalSpecimen: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Media
        asset="product"
        x={319}
        y={42}
        width={642}
        height={641}
        scale={1 + 0.065 * turn(p)}
        filter="saturate(.4)"
      />
      <Text x={61} y={85} color={fg} size={16} font={mono}>
        OBJECT STUDY / 04
      </Text>
      <Text x={1215} y={85} color={fg} size={16} font={mono} anchor="end">
        ESSENTIAL FORM
      </Text>
      <path
        d={`M${295 - 68 * b} 150v390m-25-390h50m-50 390h50`}
        fill="none"
        stroke={a}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - b}
      />
      <path
        d={`M465 ${594 + 68 * b}h352m-352-25v50m352-50v50`}
        fill="none"
        stroke={a}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - b}
      />
      <Text
        x={251 - 42 * b}
        y={355}
        color={fg}
        size={18}
        font={mono}
        anchor="end"
      >
        H / 180
      </Text>
      <Text
        x={641}
        y={638 + 42 * b}
        color={fg}
        size={17}
        font={mono}
        anchor="middle"
      >
        W / 124
      </Text>
      <Text x={61} y={590} color={fg} size={47} weight={400}>
        The essential
      </Text>
      <Text x={61} y={642} color={fg} size={47} weight={400}>
        details.
      </Text>
      <Text x={1216} y={653} color={fg} size={26} anchor="end">
        細節，回到本質。
      </Text>
    </Canvas>
  );
};

const MinimalZen: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.07, 0.39, 0.72, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={66} y={100} color={fg} size={17} spacing={5}>
        ONE LEAF. A WHOLE SEASON.
      </Text>
      <Text x={67} y={293} color={fg} size={114} font={serif}>
        一葉
      </Text>
      <Text x={68} y={418} color={fg} size={114} font={serif}>
        之間
      </Text>
      <Text x={73} y={508} color={fg} size={25}>
        在安靜裡，看見生長。
      </Text>
      <path
        d="M811 564Q564 259 973 144Q1161 407 811 564Z"
        fill={a}
        opacity={0.2}
      />
      <path
        d="M749 610Q857 422 973 144"
        fill="none"
        stroke={a}
        strokeWidth={4}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0.6 * (1 - b)}
      />
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={`M${812 + i * 15} ${509 - i * 40}Q${730 + i * 20} ${434 - i * 31} ${769 + i * 17} ${294 - i * 17}`}
          fill="none"
          stroke={a}
          opacity={0.3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={0.7 * (1 - b)}
        />
      ))}
      <rect x={76} y={599} width={44} height={44} fill={a} />
      <Text x={98} y={629} color={bg} size={22} font={serif} anchor="middle">
        靜
      </Text>
      <Text x={1210} y={667} color={fg} size={15} font={mono} anchor="end">
        ORIGINAL VECTOR BOTANICAL
      </Text>
    </Canvas>
  );
};

const MinimalMonoline: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={58} y={85} color={fg} size={17} spacing={4}>
        A SINGLE CONTINUOUS THOUGHT
      </Text>
      {[
        "M424 591V286q0-123 128-123h164q126 0 126 123v305",
        "M424 347h418",
        "M424 484h418",
        "M444 347l-20 244",
        "M822 347l20 244",
        "M552 163v184",
        "M716 163v184",
      ].map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={fg}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={
            0.62 * (1 - beat(p, 0.04 + i * 0.025, 0.29 + i * 0.025, 0.73, 0.98))
          }
        />
      ))}
      <circle cx={424} cy={591} r={5} fill={a} />
      <circle cx={842} cy={591} r={5} fill={a} />
      <Text x={60} y={613} color={fg} size={53} font={serif}>
        One line.
      </Text>
      <Text x={60} y={669} color={fg} size={26}>
        一筆，回到日常。
      </Text>
      <Text x={1218} y={666} color={fg} size={16} font={mono} anchor="end">
        FORM WITHOUT EXCESS
      </Text>
    </Canvas>
  );
};

const DataRadial: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p, 0.04, 0.34, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={55} y={89} color={fg} size={20} spacing={3}>
        A FULLER PICTURE.
      </Text>
      <g transform="translate(431,364) rotate(-90)">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Ring
              x={0}
              y={0}
              r={216 - i * 49}
              color={fg}
              width={24}
              opacity={0.1}
            />
            <circle
              r={216 - i * 49}
              fill="none"
              stroke={[a, s, fg][i]}
              strokeWidth={24}
              pathLength={1}
              strokeDasharray={`${0.37 + 0.31 * b - i * 0.09} 1`}
            />
          </g>
        ))}
      </g>
      <Text x={431} y={356} color={a} size={92} weight={500} anchor="middle">
        {Math.round(41 + 27 * b)}%
      </Text>
      <Text x={431} y={404} color={fg} size={17} spacing={3} anchor="middle">
        TOTAL COVERAGE
      </Text>
      <Text x={765} y={205} color={fg} size={61} weight={500}>
        More than
      </Text>
      <Text x={765} y={272} color={fg} size={61} weight={500}>
        a number.
      </Text>
      <Text x={770} y={336} color={fg} size={27}>
        數字之外，還有全貌。
      </Text>
      {["CONNECTION / 68%", "BALANCE / 59%", "REACH / 50%"].map((v, i) => (
        <g key={v}>
          <rect
            x={774}
            y={400 + i * 64}
            width={15}
            height={15}
            fill={[a, s, fg][i]}
          />
          <Text x={812} y={414 + i * 64} color={fg} size={20} font={mono}>
            {v}
          </Text>
        </g>
      ))}
      <Text x={55} y={666} color={fg} size={16} font={mono}>
        ILLUSTRATIVE INDICATORS / NOT MEASURED RESULTS
      </Text>
    </Canvas>
  );
};

const DataFlow: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p, 0.04, 0.34, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={56} y={87} color={fg} size={59} weight={500}>
        See where it goes.
      </Text>
      <Text x={1220} y={83} color={fg} size={25} anchor="end">
        理解，每一種流向。
      </Text>
      <defs>
        <clipPath id="flow-reveal">
          <rect x={125} y={177} width={1010 * (0.4 + 0.6 * b)} height={384} />
        </clipPath>
      </defs>
      <g clipPath="url(#flow-reveal)">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path
              d={`M152 ${248 + i * 117}C373 ${248 + i * 117} 399 ${224 + i * 92} 626 ${224 + i * 92}S890 ${287 + i * 91} 1121 ${287 + i * 91}`}
              fill="none"
              stroke={[a, s, fg][i]}
              opacity={0.6}
              strokeWidth={[72, 48, 29][i]}
            />
          </g>
        ))}
      </g>
      {[152, 626, 1121].map((x, i) => (
        <g key={i}>
          <rect x={x - 7} y={183} width={14} height={356} fill={fg} />
          <Text x={x} y={597} color={fg} size={18} font={mono} anchor="middle">
            {["SOURCE", "PROCESS", "OUTCOME"][i]}
          </Text>
          <Text x={x} y={157} color={a} size={22} font={mono} anchor="middle">
            0{i + 1}
          </Text>
        </g>
      ))}
      <Text x={56} y={669} color={fg} size={16} font={mono}>
        ILLUSTRATIVE FLOW STUDY / BAND WIDTHS ARE DEMONSTRATION VALUES
      </Text>
    </Canvas>
  );
};

const DataTimeline: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  const breath = 1 + 0.035 * Math.cos(2 * Math.PI * p);
  return (
    <Canvas background={bg}>
      <Text x={55} y={86} color={fg} size={22} spacing={3}>
        PATTERNS THROUGH TIME
      </Text>
      <Text x={55} y={190} color={fg} size={65} weight={500}>
        The shape of change.
      </Text>
      <Text x={59} y={244} color={fg} size={27}>
        每個變化，都留下形狀。
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0,500) scale(1,${breath}) translate(0,-500)`}>
          <path
            d={`M62 ${493 - i * 37}C245 ${391 - i * 16 + b * 10} 330 ${464 - i * 20} 494 ${408 - i * 41}S785 ${309 - i * 26 - b * 12} 957 ${411 - i * 35}S1123 ${361 - i * 24} 1218 ${371 - i * 44}V${536 - i * 26}C1052 ${566 - i * 35} 1030 ${469 - i * 23} 895 ${517 - i * 27}S629 ${542 - i * 28} 482 ${542 - i * 40}S271 ${590 - i * 32} 62 ${557 - i * 25}Z`}
            fill={[fg, s, a, "#cee3bb"][i]}
            opacity={0.75}
          />
        </g>
      ))}
      <Line x1={62} y1={595} x2={1218} y2={595} color={fg} opacity={0.5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <Line
            x1={62 + i * 231}
            y1={585}
            x2={62 + i * 231}
            y2={605}
            color={fg}
          />
          <Text
            x={62 + i * 231}
            y={639}
            color={fg}
            size={18}
            font={mono}
            anchor={i === 5 ? "end" : "start"}
          >
            Q{i + 1}
          </Text>
        </g>
      ))}
      <Line
        x1={335 + 584 * b}
        y1={289}
        x2={335 + 584 * b}
        y2={595}
        color={fg}
        width={2}
      />
      <circle
        cx={335 + 584 * b}
        cy={391}
        r={7}
        fill={bg}
        stroke={fg}
        strokeWidth={2}
      />
      <Text x={62} y={690} color={fg} size={14} font={mono}>
        ILLUSTRATIVE STREAMGRAPH / FICTIONAL SERIES
      </Text>
    </Canvas>
  );
};

const GeometricCharacter: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = rebound(p, 0.05, 0.27, 0.7, 0.98),
    w = wave(p);
  return (
    <Canvas background={bg}>
      <Text x={57} y={86} color={fg} size={20} weight={700} spacing={3}>
        HELLO, POSSIBILITY.
      </Text>
      <Text x={53} y={237} color={fg} size={92} weight={800} spacing={-4}>
        Stay
      </Text>
      <Text x={53} y={331} color={fg} size={92} weight={800} spacing={-4}>
        curious.
      </Text>
      <Text x={60} y={402} color={fg} size={31} weight={600}>
        好奇，是一種方向。
      </Text>
      <g
        transform={`translate(912,402) scale(${1 + 0.035 * b},${1 - 0.045 * b})`}
      >
        <path d="M-236 123q-35-270 133-333t278 83q150 180 33 250Z" fill={a} />
        <ellipse cx={-61} cy={-60} rx={65} ry={90} fill={bg} />
        <ellipse cx={90} cy={-60} rx={65} ry={90} fill={bg} />
        <ellipse cx={-61 + 16 * w} cy={-50} rx={25} ry={37} fill={fg} />
        <ellipse cx={90 + 16 * w} cy={-50} rx={25} ry={37} fill={fg} />
        <path
          d="M-47 81q56 49 111 0"
          fill="none"
          stroke={fg}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <circle cx={-155} cy={50} r={21} fill={s} />
        <circle cx={172} cy={49} r={21} fill={s} />
      </g>
      <path d="m514 143 14-32 15 32 34 9-34 9-15 32-14-32-34-9Z" fill={s} />
      <Text x={61} y={643} color={fg} size={18} spacing={3}>
        A LITTLE WONDER GOES A LONG WAY.
      </Text>
    </Canvas>
  );
};

const GeometricMosaic: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const sequentialPose = (index: number, count: number) => {
    const slot = 0.62 / count;
    const start = 0.04 + index * slot;
    const settle = 0.76 + ((count - 1 - index) * 0.17) / count;
    return beat(p, start, start + slot * 0.68, settle, settle + 0.045);
  };
  return (
    <Canvas background={bg}>
      {Array.from({ length: 12 }, (_, i) => {
        const x = 72 + (i % 6) * 190,
          y = 55 + Math.floor(i / 6) * 225,
          c = [a, fg, s][i % 3],
          pulse = sequentialPose(i, 12),
          scale = 1 + pulse * 0.15;
        return (
          <g
            key={i}
            data-sequence-node={`mosaic-${i}`}
            data-sequence-progress={pulse}
            transform={`translate(${x + 92},${y + 102 - 22 * pulse}) scale(${scale})`}
          >
            <rect
              x={-90}
              y={-102}
              width={180}
              height={204}
              fill={c}
              opacity={0.12 + 0.40 * pulse}
            />
            <rect
              x={-89}
              y={-101}
              width={178}
              height={202}
              fill="none"
              stroke={bg}
              strokeWidth={2 + 2 * pulse}
              opacity={0.8 * pulse}
            />
            {i % 3 === 0 ? (
              <path d="M-90-102H90V102Q-90 102-90-102Z" fill={c} />
            ) : i % 3 === 1 ? (
              <path d="M-90-102 90 102H-90Z" fill={c} />
            ) : (
              <g>
                <circle cx={0} cy={0} r={81} fill={c} />
                <circle cx={0} cy={0} r={38} fill={bg} />
              </g>
            )}
            <rect
              x={-90}
              y={-102}
              width={180}
              height={204}
              fill={a}
              opacity={0.2 * pulse}
              stroke={bg}
              strokeWidth={1 + 4 * pulse}
            />
          </g>
        );
      })}
      <Text x={72} y={613} color={fg} size={71} weight={800} spacing={-3}>
        Order, with a twist.
      </Text>
      <Text x={72} y={672} color={fg} size={28}>
        秩序，也可以很好玩。
      </Text>
      <Text x={1210} y={670} color={fg} size={16} font={mono} anchor="end">
        SEQUENTIAL MOSAIC PULSE
      </Text>
    </Canvas>
  );
};

const GeometricMobile: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  return (
    <Canvas background={bg}>
      <Text x={55} y={85} color={fg} size={19} spacing={3}>
        BALANCE IS A MOVING THING.
      </Text>
      <g transform={`rotate(${wave(p) * 3},809,57)`}>
        <Line x1={809} y1={56} x2={809} y2={154} color={fg} width={3} />
        <Line x1={593} y1={154} x2={1025} y2={154} color={fg} width={3} />
        <g transform={`rotate(${wave(p) * -6},593,154)`}>
          <Line x1={593} y1={154} x2={593} y2={317} color={fg} width={3} />
          <circle cx={593} cy={383} r={66} fill={a} />
        </g>
        <g transform={`rotate(${wave(p) * 5},1025,154)`}>
          <Line x1={1025} y1={154} x2={1025} y2={294} color={fg} width={3} />
          <Line x1={925} y1={294} x2={1125} y2={294} color={fg} width={3} />
          <Line x1={925} y1={294} x2={925} y2={465} color={fg} width={3} />
          <path d="m858 466h135l-67 123Z" fill={s} />
          <Line x1={1125} y1={294} x2={1125} y2={410} color={fg} width={3} />
          <rect x={1082} y={410} width={86} height={121} rx={9} fill={fg} />
        </g>
      </g>
      <Text x={55} y={266} color={fg} size={72} font={serif}>
        In good
      </Text>
      <Text x={55} y={345} color={fg} size={72} font={serif}>
        balance.
      </Text>
      <Text x={60} y={413} color={fg} size={29}>
        在移動之中，找到平衡。
      </Text>
      <Text x={61} y={657} color={fg} size={16} font={mono}>
        HARMONIC VECTOR MOBILE / NOT A PHYSICS SIMULATION
      </Text>
    </Canvas>
  );
};

const DocumentaryMap: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.05, 0.37, 0.7, 0.98);
  return (
    <Canvas background={bg}>
      <Text x={58} y={84} color={fg} size={19} font={mono}>
        FIELD WALK / OBSERVATION 014
      </Text>
      <Text x={1214} y={84} color={fg} size={18} font={mono} anchor="end">
        ILLUSTRATIVE MAP
      </Text>
      <rect x={56} y={124} width={728} height={490} fill={fg} opacity={0.06} />
      {Array.from({ length: 35 }, (_, i) => (
        <rect
          key={i}
          x={75 + (i % 7) * 102 + (Math.floor(i / 7) % 2) * 17}
          y={147 + Math.floor(i / 7) * 89}
          width={70 + (i % 3) * 9}
          height={58 + (i % 2) * 10}
          fill={fg}
          opacity={0.11 + (i % 4) * 0.025}
        />
      ))}
      <path
        d="M87 510 274 510 274 247 583 247 583 442 725 442"
        fill="none"
        stroke={a}
        strokeWidth={6}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0.7 * (1 - b)}
      />
      {[
        [87, 510],
        [274, 247],
        [583, 442],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={16} fill={a} />
          <Text
            x={x}
            y={y + 6}
            color={bg}
            size={16}
            font={mono}
            anchor="middle"
          >
            {i + 1}
          </Text>
        </g>
      ))}
      <Media
        asset="architecture"
        x={816}
        y={124}
        width={397}
        height={213}
        filter="grayscale(1)"
      />
      <Media
        asset="botanical"
        x={816}
        y={357}
        width={397}
        height={184}
        filter="grayscale(1)"
      />
      <Text x={817} y={591} color={fg} size={22}>
        「每一次走過，都看見不同。」
      </Text>
      <Text x={57} y={668} color={fg} size={43} weight={600}>
        Along the way.　沿途，留下線索。
      </Text>
    </Canvas>
  );
};

const DocumentarySubtitle: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.05, 0.35, 0.72, 0.98);
  return (
    <Canvas background={bg}>
      <Media
        asset="architecture"
        x={0}
        y={0}
        width={1280}
        height={720}
        scale={1.09 + 0.02 * turn(p)}
        filter="grayscale(1) brightness(.53)"
      />
      <Text x={56} y={80} color={bg} size={18} font={mono}>
        ORAL ARCHIVE / DEMONSTRATION TEXT
      </Text>
      <Text x={1216} y={80} color={bg} size={18} font={mono} anchor="end">
        00:01:24 / 014
      </Text>
      <rect x={49} y={416} width={837} height={72} fill={fg} opacity={0.86} />
      <Text x={69} y={466} color={bg} size={39} weight={500}>
        「日常，是慢慢累積起來的。」
      </Text>
      <rect
        x={49}
        y={500}
        width={698 * (0.7 + 0.3 * b)}
        height={56}
        fill={fg}
        opacity={0.86}
      />
      <defs>
        <clipPath id="subtitle-reveal">
          <rect x={49} y={500} width={698 * (0.7 + 0.3 * b)} height={56} />
        </clipPath>
      </defs>
      <Text
        x={69}
        y={539}
        color={bg}
        size={29}
        style={{ clipPath: "url(#subtitle-reveal)" }}
      >
        Each ordinary day leaves something behind.
      </Text>
      <Line x1={55} y1={607} x2={1223} y2={607} color={bg} opacity={0.45} />
      {Array.from({ length: 120 }, (_, i) => (
        <rect
          key={i}
          x={57 + i * 6.6}
          y={638 - (8 + 17 * Math.abs(Math.sin(i * 0.49))) / 2}
          width={3}
          height={8 + 17 * Math.abs(Math.sin(i * 0.49))}
          fill={i < Math.round(35 + 80 * b) ? a : bg}
          opacity={0.85}
        />
      ))}
      <Text x={56} y={688} color={bg} size={15} font={mono}>
        SYNTHETIC WAVEFORM / NO AUDIO CLAIM
      </Text>
      <Text x={1223} y={688} color={bg} size={15} font={mono} anchor="end">
        OBSERVE / RECORD / LISTEN
      </Text>
    </Canvas>
  );
};

const DocumentaryDossier: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.05, 0.34, 0.72, 0.98);
  return (
    <Canvas background={bg}>
      <rect x={61} y={93} width={1158} height={559} fill="#eeeadd" />
      <rect x={63} y={95} width={205 + 29 * b} height={30} fill={a} />
      <Text x={81} y={117} color={bg} size={17} font={mono}>
        FILE / FIELD 014
      </Text>
      <g transform={`rotate(${-3 + 2 * b},120,163)`}>
        <rect
          x={92}
          y={155}
          width={434}
          height={398}
          fill={fg}
          opacity={0.08}
        />
        <Media
          asset="architecture"
          x={109}
          y={173}
          width={400}
          height={317}
          filter="grayscale(1) contrast(1.1)"
        />
        <Text x={114} y={526} color={fg} size={17} font={mono}>
          01 / BUILT ENVIRONMENT
        </Text>
      </g>
      <g transform="rotate(5,540,431)">
        <rect x={347} y={407} width={249} height={205} fill="#f8f3e5" />
        <Media
          asset="botanical"
          x={359}
          y={419}
          width={225}
          height={158}
          filter="grayscale(1)"
        />
        <Text x={361} y={597} color={fg} size={14} font={mono}>
          02 / NATURAL DETAIL
        </Text>
      </g>
      <Text x={650} y={209} color={fg} size={59} font={serif}>
        Evidence of
      </Text>
      <Text x={650} y={271} color={fg} size={59} font={serif}>
        the everyday.
      </Text>
      <Text x={654} y={336} color={fg} size={29}>
        日常，也值得成為檔案。
      </Text>
      <Text x={654} y={393} color={fg} size={18} font={mono}>
        OBSERVATION / ORIGINAL STUDY
      </Text>
      {[
        "Materials remember touch.",
        "Places carry small changes.",
        "Details deserve attention.",
      ].map((v, i) => (
        <Text
          key={v}
          x={654}
          y={436 + i * 39}
          color={fg}
          size={22}
          font={serif}
        >
          {v}
        </Text>
      ))}
      <Line x1={654} y1={482} x2={654 + 421 * b} y2={482} color={a} width={3} />
      <rect
        x={1028}
        y={531}
        width={142}
        height={55}
        fill="none"
        stroke={a}
        strokeWidth={3}
        transform="rotate(-9,1099,558)"
      />
      <Text
        x={1100}
        y={565}
        color={a}
        size={24}
        font={mono}
        anchor="middle"
        style={{ rotate: "-9deg", transformOrigin: "1100px 565px" }}
      >
        ARCHIVED
      </Text>
      <Text x={60} y={691} color={fg} size={15} font={mono}>
        ILLUSTRATED DOSSIER / NOT A HISTORICAL SOURCE RECORD
      </Text>
    </Canvas>
  );
};

export const recipeRegistryA: Record<string, React.FC<RecipeProps>> = {
  "editorial-split": EditorialSplit,
  "editorial-newspaper": EditorialNewspaper,
  "editorial-index": EditorialIndex,
  "editorial-vertical": EditorialVertical,
  "luxury-botanical": LuxuryBotanical,
  "luxury-jewel": LuxuryJewel,
  "luxury-diptych": LuxuryDiptych,
  "luxury-salon": LuxurySalon,
  "cinematic-starfield": CinematicStarfield,
  "cinematic-projector": CinematicProjector,
  "cinematic-spotlight": CinematicSpotlight,
  "cinematic-strata": CinematicStrata,
  "performance-track": PerformanceTrack,
  "performance-impact": PerformanceImpact,
  "performance-ascent": PerformanceAscent,
  "performance-court": PerformanceCourt,
  "industrial-exploded": IndustrialExploded,
  "industrial-console": IndustrialConsole,
  "industrial-axonometric": IndustrialAxonometric,
  "industrial-scan": IndustrialScan,
  "spatial-planes": SpatialPlanes,
  "spatial-voxels": SpatialVoxels,
  "spatial-city": SpatialCity,
  "spatial-tunnel": SpatialTunnel,
  "collage-strips": CollageStrips,
  "collage-pinboard": CollagePinboard,
  "collage-ransom": CollageRansom,
  "collage-herbarium": CollageHerbarium,
  "retro-sunburst": RetroSunburst,
  "retro-pixel": RetroPixel,
  "retro-teletext": RetroTeletext,
  "retro-halftone": RetroHalftone,
  "minimal-specimen": MinimalSpecimen,
  "minimal-zen": MinimalZen,
  "minimal-monoline": MinimalMonoline,
  "data-radial": DataRadial,
  "data-flow": DataFlow,
  "data-timeline": DataTimeline,
  "geometric-character": GeometricCharacter,
  "geometric-mosaic": GeometricMosaic,
  "geometric-mobile": GeometricMobile,
  "documentary-map": DocumentaryMap,
  "documentary-subtitle": DocumentarySubtitle,
  "documentary-dossier": DocumentaryDossier,
};
