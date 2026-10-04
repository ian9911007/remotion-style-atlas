/** Created: 2026-10-04. Host owns the only playback clock and root lifetime. */
export type RuntimeHandle = {
  seek: (seconds: number) => void | Promise<void>;
  dispose: () => void;
  pause?: () => void;
  resume?: () => void;
};
export type MountOptions = {
  variant: string;
  reducedMotion: boolean;
  signal: AbortSignal;
};
export type Mount = (
  root: HTMLElement,
  options: MountOptions,
) => Promise<RuntimeHandle>;
export type CaseDefinition = {
  id: string;
  durationSeconds?: number;
  title: string;
  englishTitle: string;
  summary: string;
  primary: string;
  supporting?: { id: string; role: string }[];
  capabilities: string[];
  module: string;
  variant: string;
  renderer: string;
  interaction: string[];
  direction: string;
  rationale: string;
  why: string;
  uses: string[];
  nonUses: string[];
  instructions: string;
  limitations: string[];
  fallback: string;
  visual: {
    background: string;
    foreground: string;
    accent: string;
    font: string;
  };
  locked: string[];
  editable: string[];
  adaptation: string;
  dependencies: string[];
  assets: {
    path: string;
    source: string;
    license: string;
    attribution: string;
  }[];
  video:
    | "frame-driven"
    | "adapter-required"
    | "recorded-live"
    | "unsupported"
    | "unverified";
  complexity: "low" | "medium" | "high";
  comparison?: string;
};
