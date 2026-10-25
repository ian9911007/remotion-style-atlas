/** Created: 2026-10-25. Original bounded inputs and pure executable truth fixtures. */
export type MechanismConfig = {
  title: string;
  labels: string[];
  accent: string;
  duration: number;
  quote?: string;
  values?: number[];
  colors?: string[];
  topology?: string;
  material?: string;
  notes?: number[];
  geometry?: string;
};
export const mechanismDefaults: Record<string, MechanismConfig> = {
  "editorial-evidence-story": {
    title: "Evidence-led editorial story",
    labels: ["Observe", "Measure", "Decide"],
    accent: "#ba633f",
    duration: 18,
    quote: "A little evidence makes a clearer decision.",
    values: [34, 48, 65],
  },
  "palette-material-study": {
    title: "Palette and material study",
    labels: ["Choose", "Transform", "Keep the relationship"],
    accent: "#40766c",
    duration: 15,
    colors: ["#d36d45", "#497c72", "#ebc774"],
    topology: "fan",
    material: "paper",
  },
  "tiny-code-journey": {
    title: "Tiny code trace journey",
    labels: ["Input", "Transform", "Result"],
    accent: "#40766c",
    duration: 18,
    values: [2, 4, 6],
  },
  "causal-score-object": {
    title: "Causal score object",
    labels: ["Prepare", "Contact", "Resolve"],
    accent: "#40766c",
    duration: 15,
    notes: [60, 64, 67, 62, 69],
  },
  "paper-blueprint-light": {
    title: "Paper to blueprint to light",
    labels: ["Fold", "Trace", "Illuminate"],
    accent: "#ba633f",
    duration: 15,
    geometry: "pavilion",
  },
};
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => {
  n = clamp(n);
  return n * n * (3 - 2 * n);
};
export function readingSeconds(s: string) {
  const cjk = (s.match(/[\u3000-\u9fff]/g) || []).length;
  const words = s
    .replace(/[\u3000-\u9fff]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return cjk / 7 + words / 3 + 0.5;
}
export function validateMechanism(
  id: string,
  input: MechanismConfig,
): MechanismConfig {
  if (!mechanismDefaults[id]) throw Error("Unknown mechanism");
  const c = JSON.parse(JSON.stringify(input)) as MechanismConfig;
  if (
    typeof c.title !== "string" ||
    !c.title.trim() ||
    [...c.title].length > 48
  )
    throw Error("Title must contain 1–48 characters.");
  if (!/^#[a-f\d]{6}$/i.test(c.accent))
    throw Error("Accent must be a six-digit hex color.");
  if (!Number.isFinite(c.duration) || c.duration < 12 || c.duration > 20)
    throw Error("Duration must be 12–20 seconds.");
  if (
    !Array.isArray(c.labels) ||
    c.labels.length !== 3 ||
    c.labels.some(
      (s) => typeof s !== "string" || !s.trim() || [...s].length > 36,
    )
  )
    throw Error("Supply three labels of 1–36 characters.");
  if (c.labels.some((s) => readingSeconds(s) > (c.duration * 0.82) / 3 - 0.3))
    throw Error(
      "Copy exceeds the reading hold; shorten it or increase duration.",
    );
  const numbers = (
    a: unknown,
    count: number,
    lo: number,
    hi: number,
    integer = false,
  ) =>
    Array.isArray(a) &&
    a.length === count &&
    a.every(
      (n) =>
        typeof n === "number" &&
        Number.isFinite(n) &&
        n >= lo &&
        n <= hi &&
        (!integer || Number.isInteger(n)),
    );
  if (
    id === "editorial-evidence-story" &&
    (!numbers(c.values, 3, 0, 100) ||
      typeof c.quote !== "string" ||
      !c.quote.trim() ||
      [...c.quote].length > 90)
  )
    throw Error(
      "Use three 0–100 percentage values and an illustrative quote of 1–90 characters.",
    );
  if (id === "tiny-code-journey" && !numbers(c.values, 3, 0, 9, true))
    throw Error("Code fixture accepts three integers from 0 to 9.");
  if (
    id === "palette-material-study" &&
    (!Array.isArray(c.colors) ||
      c.colors.length !== 3 ||
      c.colors.some((s) => !/^#[a-f\d]{6}$/i.test(s)) ||
      !["fan", "grid"].includes(c.topology!) ||
      !["paper", "glaze"].includes(c.material!))
  )
    throw Error(
      "Supply three hex colors, fan/grid topology and paper/glaze material.",
    );
  if (id === "causal-score-object" && !numbers(c.notes, 5, 60, 81, true))
    throw Error("Use five original MIDI note numbers from 60 to 81.");
  if (
    id === "paper-blueprint-light" &&
    !["pavilion", "bridge"].includes(c.geometry!)
  )
    throw Error("Geometry must be pavilion or bridge.");
  return c;
}
export function traceJourney(values: number[]) {
  const input = [...values];
  const mapped = input.map((x) => x * 2);
  const filtered = mapped.filter((x) => x > 6);
  const result = filtered.reduce((sum, x) => sum + x, 0);
  return {
    nodes: ["input", "double", "retain", "sum"],
    edges: [
      ["input", "double"],
      ["double", "retain"],
      ["retain", "sum"],
    ],
    steps: [
      { id: "input", code: "input", value: input },
      { id: "double", code: "map(x => x * 2)", value: mapped },
      { id: "retain", code: "filter(x => x > 6)", value: filtered },
      { id: "sum", code: "reduce((a, x) => a + x, 0)", value: result },
    ],
    result,
  };
}
export function metricSummary(values: number[]) {
  return {
    domain: [0, 100],
    unit: "%",
    values: [...values],
    change: values[2] - values[0],
    synthetic: true,
  };
}
export function createScore(notes: number[], duration: number) {
  return notes.map((note, i) => ({
    id: "event-" + i,
    time: (duration * (i + 1)) / 7,
    key: i,
    ball: i % 2,
    note,
    velocity: 0.55,
  }));
}
export function scoreState(notes: number[], duration: number, time: number) {
  const events = createScore(notes, duration);
  const active = events.filter((e) => time >= e.time && time - e.time <= 0.18);
  const balls = [0, 1].map((ball) => {
    const own = events.filter((e) => e.ball === ball);
    const next = own.find((e) => e.time >= time) || own[own.length - 1];
    const prev = [...own].reverse().find((e) => e.time < time);
    const start = prev?.time ?? 0;
    const span = Math.max(0.001, next.time - start);
    const f = clamp((time - start) / span);
    const x =
      (prev?.key ?? next.key) + (next.key - (prev?.key ?? next.key)) * ease(f);
    return {
      ball,
      key: x,
      height:
        time > own[own.length - 1].time
          ? ease(
              (time - own[own.length - 1].time) /
                (duration - own[own.length - 1].time),
            ) * 1.2
          : 4 * f * (1 - f),
      contact: events.some(
        (e) => e.ball === ball && Math.abs(time - e.time) < 1e-7,
      ),
    };
  });
  return { events, active, balls };
}
export function noteName(note: number) {
  return (
    ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
      note % 12
    ] +
    (Math.floor(note / 12) - 1)
  );
}
export function geometryPanels(kind: string) {
  return kind === "bridge"
    ? [
        [
          [-150, 20],
          [-50, -25],
          [50, -25],
          [150, 20],
        ],
        [
          [-150, 20],
          [-150, 100],
          [-120, 100],
          [-120, 32],
        ],
        [
          [120, 32],
          [120, 100],
          [150, 100],
          [150, 20],
        ],
      ]
    : [
        [
          [-130, 10],
          [0, -100],
          [130, 10],
        ],
        [
          [-100, 10],
          [-100, 120],
          [0, 120],
          [0, 10],
        ],
        [
          [0, 10],
          [0, 120],
          [100, 120],
          [100, 10],
        ],
      ];
}
