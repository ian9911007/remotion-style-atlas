import { useEffect, useRef, useState } from "react";
import type {
  CaseDefinition,
  Mount,
  RuntimeHandle,
} from "../../technology-runtime/src/types";
const modules = import.meta.glob<{ default: Mount }>([
  "../../technology-runtime/src/*.{ts,tsx}",
  "!../../technology-runtime/src/*-cases.ts",
  "!../../technology-runtime/src/types.ts",
  "!../../technology-runtime/src/*-common.ts",
  "!../../technology-runtime/src/*-shared.ts",
  "!../../technology-runtime/src/*-kit.ts",
  "!../../technology-runtime/src/native-worker.ts",
]);
export const runtimeMetrics = { active: 0, mounts: 0, disposals: 0, frames: 0 };
async function mountRealm(
  root: HTMLElement,
  c: CaseDefinition,
  signal: AbortSignal,
): Promise<RuntimeHandle> {
  // Measured package-global retention in p5 2.3.4 / tsParticles 4.4.0 justifies
  // a disposable realm for these families only. No additional gallery is created.
  const frame = document.createElement("iframe");
  const url = new URL(location.href);
  url.search = `?capture=${c.id}&realm=1`;
  url.hash = "";
  frame.title = c.title;
  frame.style.cssText =
    "display:block;width:960px;height:540px;border:0;background:transparent";
  frame.src = url.href;
  root.append(frame);
  const dispose = () => {
    frame.remove();
  };
  signal.addEventListener("abort", dispose, { once: true });
  try {
    await new Promise<void>((resolve, reject) => {
      const started = performance.now();
      const poll = () => {
        if (signal.aborted) {
          reject(new Error("Aborted"));
          return;
        }
        const element = frame.contentDocument?.querySelector(
          ".technology-runtime",
        );
        const error = element?.getAttribute("data-error");
        if (error) {
          reject(new Error(error));
          return;
        }
        if (element?.getAttribute("data-ready") === "true") {
          resolve();
          return;
        }
        if (performance.now() - started > 45000) {
          reject(new Error("隔離執行器啟動逾時"));
          return;
        }
        setTimeout(poll, 30);
      };
      poll();
    });
  } catch (e) {
    dispose();
    throw e;
  }
  return {
    async seek(t) {
      await (
        frame.contentWindow as unknown as {
          __atlasRuntime: { seek: (time: number) => Promise<void> };
        }
      ).__atlasRuntime.seek(t);
    },
    dispose,
  };
}
export function RuntimeView({
  definition: c,
  capture = false,
  onActivity,
}: {
  definition: CaseDefinition;
  capture?: boolean;
  onActivity?: (active: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    handle = useRef<RuntimeHandle | null>(null),
    scrubber = useRef<HTMLInputElement>(null),
    clock = useRef(0);
  const active = true;
  const duration = c.durationSeconds ?? 4;
  const [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [playing, setPlaying] = useState(
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const play = useRef(playing);
  play.current = playing;
  useEffect(() => {
    onActivity?.(active);
    return () => onActivity?.(false);
  }, [active, onActivity]);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => {
      if (preference.matches) setPlaying(false);
    };
    preference.addEventListener("change", changed);
    return () => preference.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    if (!active || !host.current) return;
    setReady(false);
    setError("");
    const node = host.current,
      shadow = node.shadowRoot ?? node.attachShadow({ mode: "open" }),
      abort = new AbortController();
    let disposed = false,
      frame = 0,
      last = 0,
      instance: RuntimeHandle | undefined;
    const reset = document.createElement("style");
    reset.textContent = `:host{all:initial;display:block;width:100%;height:100%;contain:content;color-scheme:light}*{box-sizing:border-box}.case-root{all:initial;display:block;position:relative;width:960px;height:540px;overflow:hidden;transform-origin:top left;--paper:${c.visual.background};--ink:${c.visual.foreground};--accent:${c.visual.accent};--face:${c.visual.font};background:var(--paper);color:var(--ink);font-family:var(--face);font-size:16px;line-height:1.35}button{font:inherit;color:inherit}canvas{display:block}`;
    const root = document.createElement("div");
    root.className = "case-root";
    root.dataset.caseId = c.id;
    shadow.replaceChildren(reset, root);
    const resize = () => {
      root.style.transform = `scale(${node.clientWidth / 960})`;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    resize();
    let visible = true;
    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (!visible) instance?.pause?.();
      },
      { threshold: 0.05 },
    );
    intersection.observe(node);
    const visibility = () => {
      last = 0;
      if (document.hidden) instance?.pause?.();
    };
    document.addEventListener("visibilitychange", visibility);
    const seek = async (t: number) => {
      const bounded = Math.max(0, Math.min(duration, t));
      clock.current = bounded;
      if (scrubber.current && document.activeElement !== scrubber.current)
        scrubber.current.value = String(bounded);
      await instance?.seek(bounded);
      runtimeMetrics.frames++;
    };
    const api = {
      seek,
      root: () => root,
      time: () => clock.current,
      metrics: runtimeMetrics,
    };
    Object.assign(window, { __atlasRuntime: api });
    async function start() {
      try {
        const loader = modules[`../../technology-runtime/src/${c.module}`];
        if (!loader) throw new Error(`Missing runtime: ${c.module}`);
        await document.fonts.ready;
        const needsRealm =
          ["p5js", "tsparticles"].includes(c.primary) &&
          new URLSearchParams(location.search).get("realm") !== "1";
        if (needsRealm) instance = await mountRealm(root, c, abort.signal);
        else {
          const { default: mount } = await loader();
          if (disposed) return;
          instance = await mount(root, {
            variant: c.variant,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)")
              .matches,
            signal: abort.signal,
          });
        }
        if (disposed) {
          instance.dispose();
          return;
        }
        handle.current = instance;
        runtimeMetrics.active++;
        runtimeMetrics.mounts++;
        await seek(0);
        if (disposed) return;
        setReady(true);
        const tick = async (now: number) => {
          if (disposed) return;
          try {
            if (!capture && play.current && !document.hidden && visible) {
              instance?.resume?.();
              if (last)
                await seek(
                  (clock.current + Math.min((now - last) / 1000, 0.1)) %
                    duration,
                );
              last = now;
            } else {
              last = 0;
              instance?.pause?.();
            }
            if (!disposed) frame = requestAnimationFrame(tick);
          } catch (e) {
            setError(String(e));
          }
        };
        frame = requestAnimationFrame(tick);
      } catch (e) {
        if (!disposed) setError(e instanceof Error ? e.message : String(e));
      }
    }
    void start();
    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      if (instance && handle.current === instance) {
        instance.dispose();
        runtimeMetrics.active--;
        runtimeMetrics.disposals++;
      }
      handle.current = null;
      shadow.replaceChildren();
      delete (window as unknown as Record<string, unknown>).__atlasRuntime;
    };
  }, [active, c, capture]);
  return (
    <section
      className="technology-runtime"
      data-ready={ready}
      data-error={error}
      aria-busy={!ready}
    >
      <div className="runtime-stage" ref={host} />
      {error && (
        <p role="alert" className="warning">
          執行器無法啟動：{error}。{c.fallback}
        </p>
      )}
      {!capture && (
        <div className="runtime-controls">
          <button disabled={!ready} onClick={() => setPlaying((v) => !v)}>
            {playing ? "暫停互動" : "播放互動"}
          </button>
          <label>
            時間
            <input
              ref={scrubber}
              type="range"
              min="0"
              max={duration}
              step="0.01"
              defaultValue="0"
              aria-label="案例時間"
              disabled={!ready}
              onChange={(e) => {
                setPlaying(false);
                clock.current = Number(e.target.value);
                void handle.current?.seek(clock.current);
              }}
            />
          </label>
          <button
            disabled={!ready}
            onClick={() => {
              setError("");
              const runtime = handle.current;
              if (runtime) {
                void (async () => {
                  try {
                    clock.current = 0;
                    if (scrubber.current) scrubber.current.value = "0";
                    await runtime.seek(0);
                    setPlaying(
                      !matchMedia("(prefers-reduced-motion: reduce)").matches,
                    );
                  } catch (e) {
                    setError(String(e));
                  }
                })();
              }
            }}
          >
            重播／重設
          </button>
        </div>
      )}
    </section>
  );
}
