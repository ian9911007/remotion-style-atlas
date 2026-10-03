import { recipeRegistryA } from "./recipes-a";
import { recipeRegistryB } from "./recipes-b";
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
  rebound,
  sans,
  serif,
  mono,
  type RecipeProps,
} from "./helpers";

const SwissGrid: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.03, 0.22, 0.68, 0.98);
  return (
    <Canvas background={bg}>
      <rect x={844} y={0} width={436} height={720} fill={a} />
      <g opacity={0.18}>
        {Array.from({ length: 13 }, (_, i) => 76 + i * 94).map((x) => (
          <Line key={x} x1={x} y1={60} x2={x} y2={660} color={fg} />
        ))}
        {[60, 180, 360, 540, 660].map((y) => (
          <Line key={y} x1={76} y1={y} x2={1204} y2={y} color={fg} />
        ))}
      </g>
      <Text x={76} y={103} color={fg} size={20} spacing={2}>
        FORM / FUNCTION
      </Text>
      <Text x={1198} y={103} color={fg} size={20} anchor="end">
        01—24
      </Text>
      <defs>
        <clipPath id="swiss-type">
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={64 + i * 85}
              y={165}
              width={
                85 *
                (0.7 +
                  0.3 *
                    beat(
                      p,
                      0.025 + i * 0.008,
                      0.16 + i * 0.008,
                      0.71 + i * 0.003,
                      0.97,
                    ))
              }
              height={345}
            />
          ))}
        </clipPath>
      </defs>
      <g
        clipPath="url(#swiss-type)"
        transform={`translate(${Math.round(b * 4) * 5},0)`}
      >
        <Text
          x={64}
          y={312 - Math.round(b * 3) * 6}
          color={fg}
          size={171}
          weight={800}
          spacing={-11}
        >
          MAKE
        </Text>
        <Text
          x={64}
          y={483 + Math.round(b * 3) * 6}
          color={fg}
          size={171}
          weight={800}
          spacing={-11}
        >
          IT MATTER.
        </Text>
      </g>
      <g transform={`translate(0,${-b * 30})`}>
        <circle cx={1093} cy={539} r={94} fill={fg} />
        <path
          d="M1045 539h96m-35-36 36 36-36 36"
          fill="none"
          stroke={bg}
          strokeWidth={11}
        />
      </g>
      <Line x1={76} y1={570} x2={805} y2={570} color={fg} width={3} />
      <Text x={76} y={617} color={fg} size={31} weight={600}>
        秩序，讓觀點更清楚。
      </Text>
      <Text x={76} y={657} color={fg} size={18} spacing={3}>
        DESIGN IS A WAY OF SEEING.
      </Text>
      <rect x={576} y={616} width={230 * b + 30} height={12} fill={fg} />
    </Canvas>
  );
};

const LuxurySpread: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.1, 0.34, 0.66, 0.96);
  return (
    <Canvas background={bg}>
      <Media
        asset="architecture"
        x={537}
        y={47}
        width={690}
        height={627}
        scale={1.04 + 0.045 * turn(p)}
        panX={-10 * wave(p)}
        filter="saturate(.55) contrast(.91)"
      />
      <rect
        x={537}
        y={47}
        width={690}
        height={627}
        fill="#c8b79d"
        opacity={0.1}
      />
      <Text x={57} y={97} color={fg} size={19} spacing={4}>
        A STUDY IN STILLNESS
      </Text>
      <Text x={58} y={259} color={fg} size={94} font={serif} spacing={-4}>
        The art
      </Text>
      <Text x={58} y={352} color={fg} size={94} font={serif} spacing={-4}>
        of less.
      </Text>
      <Line x1={61} y1={407} x2={346 + 75 * b} y2={407} color={a} />
      <Text
        x={63}
        y={457}
        color={fg}
        size={28}
        opacity={0.65 + 0.35 * beat(p, 0.16, 0.34, 0.7, 0.97)}
      >
        留白，是另一種奢華。
      </Text>
      <Text
        x={63}
        y={508}
        color={fg}
        size={16}
        spacing={2}
        opacity={0.45 + 0.55 * beat(p, 0.22, 0.42, 0.72, 0.97)}
      >
        MATERIAL / LIGHT / SPACE
      </Text>
      <Text x={63} y={645} color={a} size={18} spacing={2}>
        VOL. 08
      </Text>
      <Text x={410} y={645} color={fg} size={16} anchor="end">
        2026
      </Text>
      <rect
        x={980}
        y={534 - b * 24}
        width={205}
        height={103}
        fill={bg}
        opacity={0.94}
      />
      <Text x={1005} y={573 - b * 24} color={fg} size={15} spacing={2}>
        ARCHITECTURAL NOTES
      </Text>
      <Text x={1005} y={609 - b * 24} color={fg} size={25} font={serif}>
        Quietly considered.
      </Text>
    </Canvas>
  );
};

const CinematicHorizon: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <defs>
        <linearGradient id="cine-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#172b35" />
          <stop offset=".64" stopColor="#30414a" />
          <stop offset="1" stopColor="#b59167" />
        </linearGradient>
        <linearGradient id="cine-water" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#85765e" />
          <stop offset=".18" stopColor="#233742" />
          <stop offset="1" stopColor={bg} />
        </linearGradient>
      </defs>
      <rect x={0} y={80} width={1280} height={370} fill="url(#cine-sky)" />
      <circle cx={824 + 25 * wave(p)} cy={364} r={56} fill={a} opacity={0.53} />
      <path
        d="M-80 429L91 378 204 393 331 316 433 350 558 262 634 314 760 292 892 360 1004 342 1121 400 1360 361V486H-80Z"
        fill="#20323a"
        transform={`translate(${22 * wave(p)},0)`}
      />
      <path
        d="M-80 444 162 420 319 439 510 393 660 422 874 402 1002 435 1360 403V477H-80Z"
        fill="#17262c"
        transform={`translate(${55 * wave(p)},0)`}
      />
      <rect x={0} y={447} width={1280} height={195} fill="url(#cine-water)" />
      <g opacity={0.18}>
        {Array.from({ length: 16 }, (_, i) => (
          <Line
            key={i}
            x1={670 + i * 2 - 55 * b}
            x2={900 - i * 6 + 35 * b}
            y1={459 + i * 10}
            y2={459 + i * 10}
            color={a}
            width={i % 3 === 0 ? 2 : 1}
          />
        ))}
      </g>
      <Text x={640} y={166} color={fg} size={16} spacing={7} anchor="middle">
        A JOURNEY BEYOND THE VISIBLE
      </Text>
      <Text
        x={640}
        y={345}
        color={fg}
        size={91}
        font={serif}
        spacing={10 + 4 * b}
        anchor="middle"
        opacity={0.65 + 0.35 * beat(p, 0.1, 0.36, 0.72, 0.97)}
      >
        HORIZON
      </Text>
      <Text
        x={640}
        y={394}
        color={fg}
        size={25}
        spacing={8}
        anchor="middle"
        opacity={0.5 + 0.5 * beat(p, 0.18, 0.4, 0.72, 0.97)}
      >
        未見之境
      </Text>
      <Line x1={610 - 35 * b} x2={670 + 35 * b} y1={548} y2={548} color={a} />
      <Text x={640} y={584} color={fg} size={15} spacing={4} anchor="middle">
        LIGHT LEAVES A TRACE.
      </Text>
      <rect x={0} y={0} width={1280} height={79} fill={bg} />
      <rect x={0} y={642} width={1280} height={78} fill={bg} />
      <Text x={47} y={47} color={fg} size={14} spacing={3}>
        ORIGINAL MOTION PICTURE
      </Text>
      <Text x={1230} y={688} color={fg} size={14} spacing={3} anchor="end">
        CHAPTER 01
      </Text>
    </Canvas>
  );
};

const KineticSport: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = rebound(p, 0.02, 0.17, 0.68, 0.96);
  const move = beat(p, 0.04, 0.14, 0.63, 0.96) * 95;
  return (
    <Canvas background={bg}>
      <path d="M820 0H1280V720H515Z" fill={fg} />
      <g transform={`translate(${move},0) skewX(-16)`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={925 + i * 53}
            y={-20}
            width={12 + i * 4}
            height={800}
            fill={bg}
            opacity={0.14 + i * 0.06}
          />
        ))}
      </g>
      <Text x={56} y={86} color={fg} size={21} weight={800} spacing={3}>
        BUILT FOR THE NEXT
      </Text>
      <g transform={`translate(${-b * 46},${b * 10}) skewX(-7)`}>
        <Text x={95} y={268} color={fg} size={181} weight={900} spacing={-11}>
          PUSH
        </Text>
        <Text x={94} y={431} color={fg} size={181} weight={900} spacing={-11}>
          FURTHER.
        </Text>
      </g>
      <g transform={`translate(${b * 70},${-b * 24})`}>
        <path
          d="M845 440c58-28 96-47 166-34l98 30 37 36-10 45H891l-54-36Z"
          fill={bg}
        />
        <path
          d="m930 444 92-8 72 31h-171"
          fill="none"
          stroke={fg}
          strokeWidth={10}
        />
        <path d="m881 510h270" stroke={a} strokeWidth={17} />
        <path d="m854 475 67-4" stroke={a} strokeWidth={8} />
        <path
          d="m955 435-13 26m39-24-10 28m38-26-9 25"
          stroke={fg}
          strokeWidth={5}
        />
      </g>
      <rect x={58} y={494} width={432} height={61} fill={a} />
      <Text x={77} y={536} color={fg} size={34} weight={800}>
        每一步，都超越自己。
      </Text>
      <Line x1={58} y1={617} x2={492} y2={617} color={fg} width={3} />
      <Text x={58} y={654} color={fg} size={19} weight={700} spacing={2}>
        MOVE / TRAIN / REPEAT
      </Text>
      <Text
        x={1199}
        y={96}
        color={bg}
        size={62}
        weight={800}
        anchor="end"
        font={mono}
      >
        02:48
      </Text>
      <Text x={1198} y={653} color={bg} size={17} spacing={3} anchor="end">
        NO FINISH LINE.
      </Text>
    </Canvas>
  );
};

const IndustrialBlueprint: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.04, 0.3, 0.68, 0.97);
  const angle = wave(p) * 14;
  return (
    <Canvas background={bg}>
      <defs>
        <pattern
          id="blue-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0H0V40"
            fill="none"
            stroke={fg}
            strokeWidth=".6"
            opacity=".12"
          />
        </pattern>
      </defs>
      <rect width={1280} height={720} fill="url(#blue-grid)" />
      <CornerMarks color={fg} />
      <Text x={69} y={96} color={fg} size={23} font={mono}>
        SYSTEM / 001
      </Text>
      <Text x={69} y={148} color={fg} size={39} weight={600}>
        精度，從結構開始。
      </Text>
      <g transform={`translate(731,367) rotate(${angle})`}>
        <circle
          r={180}
          fill="none"
          stroke={fg}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={0.35 * (1 - b)}
        />
        <circle
          r={143}
          fill="none"
          stroke={fg}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={0.3 * (1 - beat(p, 0.09, 0.35, 0.69, 0.97))}
        />
        <Ring x={0} y={0} r={112} color={fg} />
        <Ring x={0} y={0} r={43} color={a} width={4} />
        {Array.from({ length: 24 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 15})`}>
            <Line
              x1={0}
              y1={-164}
              x2={0}
              y2={-179}
              color={fg}
              width={i % 3 === 0 ? 3 : 1}
            />
          </g>
        ))}
        {[0, 90, 180, 270].map((r, i) => (
          <g
            key={r}
            transform={`rotate(${r}) translate(0,${-22 * beat(p, 0.15 + i * 0.02, 0.42 + i * 0.02, 0.7, 0.97)})`}
          >
            <rect
              x={-20}
              y={-135}
              width={40}
              height={55}
              fill={bg}
              stroke={fg}
            />
            <circle cx={0} cy={-105} r={8} fill="none" stroke={a} />
          </g>
        ))}
        <Line
          x1={-208}
          y1={0}
          x2={208}
          y2={0}
          color={fg}
          opacity={0.35}
          dash="6 6"
        />
        <Line
          x1={0}
          y1={-208}
          x2={0}
          y2={208}
          color={fg}
          opacity={0.35}
          dash="6 6"
        />
      </g>
      <path
        d={`M${551 - b * 35} 212H398V290H295`}
        fill="none"
        stroke={a}
        strokeWidth={2}
      />
      <circle cx={551 - b * 35} cy={212} r={5} fill={a} />
      <Text x={74} y={281} color={a} size={17} font={mono}>
        01 / ROTOR ASSEMBLY
      </Text>
      <Text x={74} y={319} color={fg} size={24}>
        精密轉子組件
      </Text>
      <path
        d="M875 460h178v65h132"
        fill="none"
        stroke={a}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0.5 * (1 - beat(p, 0.19, 0.43, 0.7, 0.97))}
      />
      <Text x={1000} y={561} color={fg} size={16} font={mono}>
        TOLERANCE ±0.02
      </Text>
      <Line x1={550} y1={592} x2={912} y2={592} color={fg} />
      <Line x1={550} y1={578} x2={550} y2={607} color={fg} />
      <Line x1={912} y1={578} x2={912} y2={607} color={fg} />
      <rect x={686} y={578} width={90} height={29} fill={bg} />
      <Text x={731} y={598} color={fg} size={17} font={mono} anchor="middle">
        Ø 360
      </Text>
      <Text x={70} y={647} color={fg} size={16} font={mono}>
        EXPLODED VIEW — REV. 03
      </Text>
      <Text x={1207} y={648} color={a} size={15} font={mono} anchor="end">
        DESIGNED TO ENDURE
      </Text>
      <rect x={72} y={394} width={255} height={127} fill={fg} opacity={0.055} />
      <Text x={88} y={424} color={fg} size={14} font={mono}>
        LOAD FACTOR
      </Text>
      {[0.68, 0.92, 0.45].map((v, i) => (
        <g key={i}>
          <rect
            x={88}
            y={442 + i * 21}
            width={205}
            height={7}
            fill={fg}
            opacity={0.1}
          />
          <rect
            x={88}
            y={442 + i * 21}
            width={205 * v * (0.75 + b * 0.25)}
            height={7}
            fill={i === 1 ? a : fg}
          />
        </g>
      ))}
    </Canvas>
  );
};

const SpatialOrbit: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p),
    w = wave(p);
  return (
    <Canvas background={bg}>
      <defs>
        <radialGradient id="orb" cx="35%" cy="28%">
          <stop offset="0" stopColor="#e9eeff" />
          <stop offset=".42" stopColor="#a9b8d9" />
          <stop offset=".79" stopColor="#5b739c" />
          <stop offset="1" stopColor="#34485f" />
        </radialGradient>
      </defs>
      <Text x={61} y={93} color={fg} size={18} spacing={3}>
        SPATIAL SYSTEMS / EXPLORATION 01
      </Text>
      <Text x={63} y={208} color={fg} size={70} weight={500} spacing={-3}>
        Beyond
      </Text>
      <Text x={63} y={282} color={fg} size={70} weight={500} spacing={-3}>
        the surface.
      </Text>
      <Text x={66} y={336} color={fg} size={27}>
        讓資訊，擁有空間。
      </Text>
      <ellipse
        cx={871}
        cy={571}
        rx={176 + b * 15}
        ry={24}
        fill={fg}
        opacity={0.1}
      />
      <g transform={`translate(868,342) rotate(${-12 + w * 8})`}>
        <ellipse
          rx={251}
          ry={88}
          fill="none"
          stroke={a}
          strokeWidth={1.5}
          opacity={0.45}
        />
        <ellipse
          rx={194}
          ry={181}
          fill="none"
          stroke={fg}
          strokeWidth={1}
          opacity={0.2}
          transform="rotate(35)"
        />
        <circle r={149} fill="url(#orb)" />
        <ellipse
          rx={251}
          ry={88}
          fill="none"
          stroke={a}
          strokeWidth={2}
          strokeDasharray="420 1000"
          transform="rotate(180)"
        />
        <circle
          cx={229 * Math.cos(p * Math.PI * 2)}
          cy={80 * Math.sin(p * Math.PI * 2)}
          r={10}
          fill={a}
        />
      </g>
      <g
        transform={`translate(${w * 13},${b * 16})`}
        opacity={0.4 + 0.6 * beat(p, 0.03, 0.21, 0.73, 0.98)}
      >
        <rect
          x={563}
          y={116}
          width={194}
          height={91}
          rx={7}
          fill="#fafcff"
          stroke="#cad4df"
        />
        <Text x={583} y={148} color={fg} size={13} font={mono}>
          DEPTH CHANNEL
        </Text>
        <Text x={583} y={182} color={a} size={25} font={mono}>
          z: 0.82
        </Text>
      </g>
      <g
        transform={`translate(${-w * 14},${-b * 17})`}
        opacity={0.4 + 0.6 * beat(p, 0.09, 0.3, 0.74, 0.98)}
      >
        <rect
          x={976}
          y={443}
          width={225}
          height={114}
          rx={7}
          fill="#fafcff"
          stroke="#cad4df"
        />
        <circle cx={998} cy={469} r={4} fill={a} />
        <Text x={1011} y={474} color={fg} size={13} spacing={1}>
          SURFACE CONNECTED
        </Text>
        <Line x1={998} y1={493} x2={1178} y2={493} color={fg} opacity={0.15} />
        <Text x={998} y={530} color={fg} size={25}>
          23.7°
        </Text>
        <Text x={1169} y={530} color={a} size={14} anchor="end">
          ORBIT
        </Text>
      </g>
      <Line x1={65} y1={568} x2={360} y2={568} color={fg} opacity={0.3} />
      <Text x={65} y={610} color={fg} size={17} spacing={1}>
        2.5D PARALLAX STUDY
      </Text>
      <Text x={65} y={643} color={fg} size={16} opacity={0.6}>
        複層介面・軌道・深度
      </Text>
    </Canvas>
  );
};

const PaperCollage: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.03, 0.26, 0.61, 0.97),
    w = wave(p);
  return (
    <Canvas background={bg}>
      <defs>
        <pattern
          id="paper-dots"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="3" r=".7" fill="#645642" opacity=".10" />
        </pattern>
      </defs>
      <rect width={1280} height={720} fill="url(#paper-dots)" />
      <path
        d="m691 66 395 21 63 467-490 30-23-194Z"
        fill="#f9f5e9"
        transform={`rotate(${2 + w * 1.5},900,350)`}
      />
      <g
        transform={`rotate(${-5 + 8 * rebound(p, 0.08, 0.31, 0.67, 0.96)},650,116) translate(${b * 15},${-b * 12})`}
      >
        <rect
          x={658}
          y={126}
          width={409}
          height={454}
          fill="#746652"
          opacity={0.2}
        />
        <Media
          asset="botanical"
          x={650}
          y={116}
          width={409}
          height={454}
          filter="saturate(.65) contrast(.95)"
        />
        <path
          d="m650 532 35 12 41-8 40 18 33-13 34 15 42-12 35 18 49-20 31 18 31-10 18 14v35H650Z"
          fill={bg}
        />
      </g>
      <g
        transform={`rotate(${-3 - 5 * rebound(p, 0.02, 0.22, 0.72, 0.97)},48,183)`}
      >
        <rect x={48} y={183} width={579} height={107} fill={a} />
        <Text
          x={70}
          y={263}
          color="#fff5df"
          size={82}
          weight={800}
          spacing={-4}
        >
          WILD THINGS
        </Text>
      </g>
      <g
        transform={`rotate(${3 + 7 * rebound(p, 0.12, 0.35, 0.63, 0.94)},83,303)`}
      >
        <rect x={83} y={303} width={399} height={97} fill={fg} />
        <Text x={107} y={375} color={bg} size={64} weight={800} spacing={-3}>
          GROW HERE.
        </Text>
      </g>
      <Text x={70} y={96} color={fg} size={19} font={mono}>
        FIELD NOTES / NO. 07
      </Text>
      <Text x={72} y={467} color={fg} size={31} weight={600}>
        把日常，拼成新的風景。
      </Text>
      <path
        d="m1047 147 100-69 65 143-59-23-43 66Z"
        fill={a}
        transform={`rotate(${w * 5},1123,168)`}
      />
      <path d="m1075 524 68-30 49 35-26 44-79 8Z" fill="#dfb640" />
      <rect
        x={809}
        y={89}
        width={122}
        height={33}
        fill="#d7c49f"
        opacity={0.9}
        transform="rotate(-7,870,105)"
      />
      <rect
        x={719}
        y={551}
        width={110}
        height={29}
        fill="#d7c49f"
        opacity={0.9}
        transform="rotate(8,773,563)"
      />
      <path
        d="M118 540c33-26 61-10 67 8s-25 47-54 40-16-43 12-53"
        fill="none"
        stroke={a}
        strokeWidth={4}
      />
      <Text x={76} y={647} color={fg} size={15} font={mono}>
        COLLECTED, CUT, REARRANGED.
      </Text>
      <Text x={1178} y={642} color={fg} size={25} font={serif} anchor="end">
        自然，從不整齊。
      </Text>
    </Canvas>
  );
};

const BroadcastRetro: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={fg}>
      <rect x={39} y={36} width={1202} height={648} rx={31} fill={bg} />
      <rect x={61} y={58} width={1158} height={604} rx={21} fill="#ebcb82" />
      <defs>
        <clipPath id="retro-screen">
          <rect x={61} y={58} width={1158} height={604} rx={21} />
        </clipPath>
        <pattern
          id="retro-scan"
          width="2"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <rect width="2" height="1" fill={fg} opacity=".09" />
        </pattern>
      </defs>
      <g clipPath="url(#retro-screen)">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${830 + i * 81} -30V350Q${830 + i * 81} ${470 + i * 33} ${650 - i * 34} ${470 + i * 33}H-80`}
            fill="none"
            stroke={[a, "#d16635", s, "#4c7163"][i]}
            strokeWidth={65}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={
              0.26 *
              (1 - beat(p, 0.03 + i * 0.025, 0.25 + i * 0.03, 0.68, 0.98))
            }
          />
        ))}
        <rect x={81} y={89} width={210} height={42} fill={fg} />
        <Text x={99} y={118} color={bg} size={22} font={mono} weight={700}>
          CHANNEL 08
        </Text>
        <Text x={122} y={287} color={fg} size={126} weight={800} spacing={-7}>
          GOOD
        </Text>
        <Text x={122} y={402} color={fg} size={126} weight={800} spacing={-7}>
          AFTERNOON.
        </Text>
        <g transform={`translate(1050,188) rotate(${b * 60})`}>
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={-10}
              y={-61}
              width={20}
              height={122}
              rx={5}
              fill={a}
              transform={`rotate(${i * 15})`}
            />
          ))}
          <circle r={26} fill="#ebcb82" />
        </g>
        <rect x={93} y={549} width={1094} height={73} fill={fg} />
        <Text x={118} y={597} color={bg} size={33} weight={700}>
          今天，也有值得期待的事。
        </Text>
        <Text x={1158} y={596} color={bg} size={25} font={mono} anchor="end">
          ON AIR ●
        </Text>
        <rect x={61} y={58} width={1158} height={604} fill="url(#retro-scan)" />
      </g>
      <Text
        x={640}
        y={709}
        color={bg}
        size={13}
        font={mono}
        anchor="middle"
        spacing={2}
      >
        A WARM SIGNAL, EVERY DAY.
      </Text>
    </Canvas>
  );
};

const MinimalObject: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = turn(p);
  return (
    <Canvas background={bg}>
      <Media
        asset="product"
        x={530}
        y={37}
        width={698}
        height={650}
        scale={1 + b * 0.035}
        panY={-18 * beat(p, 0.07, 0.31, 0.69, 0.97)}
        filter="saturate(.62)"
      />
      <rect x={0} y={0} width={490} height={720} fill={bg} />
      <Text x={69} y={91} color={fg} size={18} spacing={3}>
        OBJECT / 003
      </Text>
      <Text x={66} y={272} color={fg} size={79} weight={400} spacing={-4}>
        Made for
      </Text>
      <Text x={66} y={354} color={fg} size={79} weight={400} spacing={-4}>
        every day.
      </Text>
      <Text x={70} y={416} color={fg} size={29}>
        剛好，就很好。
      </Text>
      <Line x1={70} y1={470} x2={258 + b * 46} y2={470} color={a} />
      <Text
        x={70}
        y={519}
        color={fg}
        size={17}
        opacity={0.4 + 0.6 * beat(p, 0.29, 0.44, 0.7, 0.97)}
      >
        本質・觸感・平衡
      </Text>
      <Text x={70} y={639} color={fg} size={16} spacing={1}>
        LESS, WITH PURPOSE.
      </Text>
      <g opacity={0.55 + 0.35 * b}>
        <Line x1={982} y1={463} x2={1175} y2={463} color={fg} />
        <circle cx={982} cy={463} r={4} fill={a} />
        <Text x={1175} y={489} color={fg} size={14} anchor="end">
          DESIGNED AROUND YOU
        </Text>
      </g>
    </Canvas>
  );
};

const DataTopography: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.04, 0.33, 0.64, 0.97);
  return (
    <Canvas background={bg}>
      <defs>
        <pattern
          id="data-grid"
          width="35"
          height="35"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".8" fill={fg} opacity=".16" />
        </pattern>
        <clipPath id="data-map">
          <rect x={475} y={80} width={721} height={514} />
        </clipPath>
      </defs>
      <rect x={475} y={80} width={721} height={514} fill="url(#data-grid)" />
      <g clipPath="url(#data-map)" transform={`translate(${wave(p) * 7},0)`}>
        {Array.from({ length: 18 }, (_, i) => {
          const r = 38 + i * 18,
            cx = 814 + Math.sin(i * 0.32) * 42,
            cy = 349 + Math.cos(i * 0.34) * 26;
          return (
            <path
              key={i}
              d={`M${cx - r} ${cy}C${cx - r - 45} ${cy - r * 0.7} ${cx + r * 0.1} ${cy - r * 1.3} ${cx + r * 0.6} ${cy - r * 0.55}S${cx + r * 1.1} ${cy + r * 0.7} ${cx + r * 0.2} ${cy + r * 0.82}S${cx - r * 1.05} ${cy + r * 0.55} ${cx - r} ${cy}Z`}
              fill="none"
              stroke={i % 4 === 0 ? a : fg}
              opacity={i % 4 === 0 ? 0.6 : 0.23}
              strokeWidth={i % 4 === 0 ? 1.7 : 0.8}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={
                0.4 *
                (1 - beat(p, 0.02 + i * 0.006, 0.28 + i * 0.006, 0.7, 0.98))
              }
            />
          );
        })}
      </g>
      <Line x1={69} y1={98} x2={1196} y2={98} color={fg} opacity={0.25} />
      <Text x={69} y={74} color={fg} size={16} spacing={3}>
        FIELD / DATA / INSIGHT
      </Text>
      <Text x={1196} y={74} color={a} size={16} font={mono} anchor="end">
        24°09′N 120°40′E
      </Text>
      <Text x={66} y={231} color={fg} size={63} weight={500}>
        看見趨勢，
      </Text>
      <Text x={66} y={304} color={fg} size={63} weight={500}>
        理解地景。
      </Text>
      <Text x={66} y={408} color={a} size={97} font={sans} spacing={-5}>
        {(58.6 + 13.8 * b).toFixed(1)}
        <tspan fontSize={36}>%</tspan>
      </Text>
      <Text x={70} y={447} color={fg} size={17} spacing={2}>
        COVERAGE INDEX / SAMPLE DATA
      </Text>
      <g transform={`translate(${b * 63},${-b * 39})`}>
        <circle cx={816} cy={313} r={8} fill={a} />
        <Ring x={816} y={313} r={20 + b * 9} color={a} opacity={0.5} />
        <path d="M836 313h119v-71h102" fill="none" stroke={a} />
        <rect x={1011} y={195} width={170} height={43} fill={a} />
        <Text x={1026} y={224} color={bg} size={17} font={mono}>
          PEAK / 2,147m
        </Text>
      </g>
      <Line x1={70} y1={514} x2={391} y2={514} color={fg} opacity={0.25} />
      {[28, 61, 47, 94, 76, 113, 90, 139, 126, 158, 148, 174].map((h, i) => (
        <rect
          key={i}
          x={73 + i * 25}
          y={648 - h * (0.68 + 0.32 * b)}
          width={14}
          height={h * (0.68 + 0.32 * b)}
          fill={i > 8 ? a : fg}
          opacity={i > 8 ? 1 : 0.42}
        />
      ))}
      <Text x={484} y={648} color={fg} size={17} font={mono}>
        ELEVATION MODEL / ILLUSTRATIVE
      </Text>
      <Text x={1196} y={648} color={a} size={17} font={mono} anchor="end">
        01 — 12
      </Text>
    </Canvas>
  );
};

const ElasticGeometry: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const {
    background: bg,
    foreground: fg,
    accent: a,
    secondary: s,
  } = style.palette;
  const b = beat(p, 0.04, 0.23, 0.62, 0.97),
    w = wave(p);
  return (
    <Canvas background={bg}>
      <Text x={61} y={92} color={fg} size={18} weight={700} spacing={2}>
        SERIOUSLY PLAYFUL.
      </Text>
      <Text x={62} y={236} color={fg} size={83} weight={800} spacing={-4}>
        Ideas
      </Text>
      <Text x={62} y={320} color={fg} size={83} weight={800} spacing={-4}>
        in motion.
      </Text>
      <Text x={66} y={390} color={fg} size={30} weight={600}>
        想法，開始動起來。
      </Text>
      <g transform="translate(908,349)">
        <rect
          x={-240}
          y={-205}
          width={225 + 32 * rebound(p, 0.02, 0.24, 0.71, 0.98)}
          height={207 - 30 * rebound(p, 0.02, 0.24, 0.71, 0.98)}
          rx={26}
          fill={a}
        />
        <circle
          cx={124}
          cy={-94 - 43 * rebound(p, 0.08, 0.3, 0.7, 0.97)}
          r={112}
          fill={fg}
        />
        <path
          d="m-215 90 117-56 106 135-154 72Z"
          fill={s}
          transform={`rotate(${-23 * rebound(p, 0.14, 0.37, 0.68, 0.96)},-110,139)`}
        />
        <g
          transform={`translate(127,137) rotate(${100 * rebound(p, 0.19, 0.42, 0.66, 0.95)})`}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x={-15}
              y={-115}
              width={30}
              height={230}
              rx={15}
              fill={a}
              transform={`rotate(${i * 22.5})`}
            />
          ))}
          <circle r={45} fill={bg} />
        </g>
        <circle cx={-65 + b * 30} cy={12 - b * 20} r={49} fill={bg} />
        <circle cx={-64 + b * 30} cy={12 - b * 20} r={29} fill={fg} />
        <path
          d="m100-105 19 19 43-45"
          fill="none"
          stroke={bg}
          strokeWidth={11}
          strokeLinecap="round"
        />
      </g>
      <rect x={64} y={523} width={305} height={63} rx={31} fill={fg} />
      <Text x={216} y={565} color={bg} size={24} weight={600} anchor="middle">
        讓好奇心帶路 ↗
      </Text>
      <Text x={65} y={652} color={fg} size={16} spacing={3}>
        SHAPE / STRETCH / SURPRISE
      </Text>
      <Text x={1202} y={651} color={fg} size={20} weight={700} anchor="end">
        ◎ 03
      </Text>
    </Canvas>
  );
};

const DocumentaryContact: React.FC<RecipeProps> = ({ style, progress: p }) => {
  const { background: bg, foreground: fg, accent: a } = style.palette;
  const b = beat(p, 0.08, 0.32, 0.68, 0.95);
  return (
    <Canvas background={bg}>
      <Text x={54} y={77} color={fg} size={18} font={mono}>
        FIELD RECORD / 2026.06.14
      </Text>
      <Text x={1225} y={77} color={fg} size={16} font={mono} anchor="end">
        TAICHUNG, TAIWAN
      </Text>
      <rect x={51} y={108} width={1178} height={378} fill={fg} />
      <Media
        asset="architecture"
        x={67}
        y={135}
        width={554}
        height={323}
        scale={1 + 0.055 * turn(p)}
        filter="grayscale(1) contrast(1.1)"
        position="left"
        opacity={0.5 + 0.5 * beat(p, 0.03, 0.19, 0.74, 0.98)}
      />
      <Media
        asset="architecture"
        x={640}
        y={135}
        width={272}
        height={323}
        scale={1.65}
        filter="grayscale(1) contrast(1.08)"
        position="right"
        panX={-b * 19}
        opacity={0.5 + 0.5 * beat(p, 0.08, 0.25, 0.72, 0.98)}
      />
      <Media
        asset="botanical"
        x={930}
        y={135}
        width={282}
        height={323}
        scale={1.15}
        filter="grayscale(1) contrast(1.2)"
        opacity={0.5 + 0.5 * beat(p, 0.14, 0.31, 0.7, 0.98)}
      />
      {[
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
      ].map((i) => (
        <g key={i}>
          <rect
            x={67 + i * 58}
            y={115}
            width={22}
            height={10}
            rx={2}
            fill={bg}
          />
          <rect
            x={67 + i * 58}
            y={468}
            width={22}
            height={10}
            rx={2}
            fill={bg}
          />
        </g>
      ))}
      <rect x={87} y={385 - b * 15} width={282} height={48} fill={a} />
      <Text x={105} y={417 - b * 15} color="#fff9ee" size={22} weight={600}>
        人的尺度，城市的記憶。
      </Text>
      <Text x={54} y={569} color={fg} size={66} weight={700} spacing={-3}>
        Between the ordinary.
      </Text>
      <Text x={56} y={614} color={fg} size={25}>
        在日常之間，留下真實的線索。
      </Text>
      <Text x={1222} y={567} color={a} size={56} font={serif} anchor="end">
        01 / 12
      </Text>
      <Line x1={55} y1={649} x2={1223} y2={649} color={fg} opacity={0.35} />
      <Text x={55} y={682} color={fg} size={14} font={mono}>
        ORIGINAL IMAGE STUDIES / CONTACT SHEET
      </Text>
      <Text x={1223} y={682} color={fg} size={14} font={mono} anchor="end">
        OBSERVE. RECORD. REMEMBER.
      </Text>
      <path
        d={`M${640 + b * 30} 124h${263 - b * 60}v347H${640 + b * 30}Z`}
        fill="none"
        stroke={a}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0.75 * (1 - beat(p, 0.23, 0.48, 0.72, 0.98))}
      />
    </Canvas>
  );
};

export const recipeRegistry: Record<string, React.FC<RecipeProps>> = {
  ...recipeRegistryA,
  ...recipeRegistryB,
  "swiss-grid": SwissGrid,
  "luxury-spread": LuxurySpread,
  "cinematic-horizon": CinematicHorizon,
  "kinetic-sport": KineticSport,
  "industrial-blueprint": IndustrialBlueprint,
  "spatial-orbit": SpatialOrbit,
  "paper-collage": PaperCollage,
  "broadcast-retro": BroadcastRetro,
  "minimal-object": MinimalObject,
  "data-topography": DataTopography,
  "elastic-geometry": ElasticGeometry,
  "documentary-contact": DocumentaryContact,
};
