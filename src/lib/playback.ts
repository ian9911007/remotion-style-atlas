export type PlaybackMode = "wall" | "focus" | "still";
type Entry = {
  element: HTMLVideoElement;
  source: string;
  visible: boolean;
  priority: number;
  lastUsed: number;
  failed: boolean;
  pending: boolean;
  onFailure: () => void;
};
/** One observer and one scheduler for the wall; video elements never own timers. */
export class PlaybackScheduler {
  private entries = new Map<string, Entry>();
  private observer: IntersectionObserver | null = null;
  private mode: PlaybackMode = "wall";
  private paused = false;
  private blocked = false;
  private hidden = false;
  private active: string | null = null;
  private focusGroup = new Set<string>();
  private rotationTimer: ReturnType<typeof setInterval> | null = null;
  private serial = 0;
  private granted = new Set<string>();
  private rotationOffset = 0;
  readonly limit =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
      ? 2
      : 6;
  private visibility = () => {
    this.hidden = document.hidden;
    this.schedule();
  };
  start() {
    if (this.observer) return;
    this.hidden = document.hidden;
    this.observer = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          const entry = [...this.entries.values()].find(
            (e) => e.element === item.target,
          );
          if (entry) {
            const visible =
              item.isIntersecting && item.intersectionRatio >= 0.25;
            if (visible && !entry.visible) entry.priority = ++this.serial;
            entry.visible = visible;
          }
        }
        this.schedule();
      },
      { threshold: [0, 0.25] },
    );
    for (const e of this.entries.values()) this.observer.observe(e.element);
    document.addEventListener("visibilitychange", this.visibility);
    this.rotationTimer = setInterval(() => {
      const enabled =
        !this.paused && !this.blocked && !this.hidden && this.mode !== "still";
      const visibleCount = [...this.entries.values()].filter(
        (e) => e.visible && !e.failed,
      ).length;
      void visibleCount;
      this.releaseStaleSources();
    }, 5000);
  }
  register(
    id: string,
    element: HTMLVideoElement,
    source: string,
    onFailure: () => void,
  ) {
    const entry: Entry = {
      element,
      source,
      visible: false,
      priority: ++this.serial,
      lastUsed: 0,
      failed: false,
      pending: false,
      onFailure,
    };
    this.entries.set(id, entry);
    this.observer?.observe(element);
    return () => {
      this.observer?.unobserve(element);
      element.pause();
      element.removeAttribute("src");
      element.load();
      this.entries.delete(id);
      this.schedule();
    };
  }
  configure(mode: PlaybackMode, paused: boolean, blocked: boolean) {
    this.mode = mode;
    this.paused = paused;
    this.blocked = blocked;
    this.schedule();
  }
  interact(id: string | null, neighborhood: string[] = id ? [id] : []) {
    this.active = id;
    this.focusGroup = new Set(neighborhood);
    if (id) {
      const e = this.entries.get(id);
      if (e) e.priority = ++this.serial;
    }
    this.schedule();
  }
  retry(id: string) {
    const e = this.entries.get(id);
    if (e) {
      e.failed = false;
      this.active = id;
      this.schedule();
    }
  }
  mediaFailed(id: string) {
    const e = this.entries.get(id);
    if (e) this.fail(e);
  }
  private fail(e: Entry) {
    if (e.failed) return;
    e.failed = true;
    e.element.pause();
    e.element.removeAttribute("data-playing");
    e.onFailure();
    this.schedule();
  }
  private schedule() {
    const enabled =
      !this.paused && !this.blocked && !this.hidden && this.mode !== "still";
    const candidates = [...this.entries.entries()]
      .filter(
        ([id, e]) =>
          enabled &&
          (this.mode === "wall" || e.visible) &&
          !e.failed &&
          (this.mode === "wall" || this.focusGroup.has(id)),
      )
      .sort(
        ([a, x], [b, y]) =>
          Number(b === this.active) - Number(a === this.active) ||
          y.priority - x.priority,
      );
    const granted = new Set(candidates.map(([id]) => id));
    this.granted = granted;
    for (const [id, e] of this.entries) {
      if (granted.has(id)) {
        e.lastUsed = Date.now();
        if (!e.element.getAttribute("src")) {
          e.element.src = e.source;
          e.element.load();
        }
        if (e.element.paused && !e.pending) {
          e.pending = true;
          e.element
            .play()
            .then(() => {
              e.pending = false;
              if (this.entries.get(id) !== e) return;
              if (
                this.granted.has(id) &&
                !e.failed &&
                !this.paused &&
                !this.blocked &&
                !document.hidden
              )
                e.element.dataset.playing = "true";
              else e.element.pause();
            })
            .catch(() => {
              e.pending = false;
              if (this.entries.get(id) === e && this.granted.has(id))
                this.fail(e);
            });
        }
      } else {
        e.element.pause();
        e.element.removeAttribute("data-playing");
      }
    }
    const retained = [...this.entries.values()]
      .filter((e) => e.element.hasAttribute("src"))
      .sort((a, b) => b.lastUsed - a.lastUsed);
    for (const e of retained.slice(
      this.mode === "wall" ? retained.length : this.limit * 2,
    )) {
      e.element.pause();
      e.element.removeAttribute("src");
      e.element.load();
    }
  }
  private releaseStaleSources() {
    for (const [id, e] of this.entries) {
      if (
        !this.granted.has(id) &&
        e.element.hasAttribute("src") &&
        Date.now() - e.lastUsed >= 11000
      ) {
        e.element.removeAttribute("src");
        e.element.load();
      }
    }
  }
  snapshot() {
    return {
      limit: this.limit,
      playing: [...this.entries]
        .filter(([, e]) => !e.element.paused)
        .map(([id]) => id),
      sources: [...this.entries]
        .filter(([, e]) => e.element.hasAttribute("src"))
        .map(([id]) => id),
      mode: this.mode,
      paused: this.paused,
      blocked: this.blocked,
    };
  }
  destroy() {
    this.granted.clear();
    this.observer?.disconnect();
    this.observer = null;
    document.removeEventListener("visibilitychange", this.visibility);
    if (this.rotationTimer) clearInterval(this.rotationTimer);
    this.rotationTimer = null;
    for (const e of this.entries.values()) {
      e.element.pause();
      e.element.removeAttribute("src");
      e.element.load();
    }
  }
}
export function mediaUrl(path: string) {
  const env = import.meta.env;
  const base = env.VITE_ASSET_BASE || env.BASE_URL;
  return `${base.replace(/\/$/, "")}/${path}`;
}
