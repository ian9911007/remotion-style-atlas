import assert from "node:assert/strict";
import { test } from "node:test";
import { PlaybackScheduler } from "../src/lib/playback";

test("global wall mode plays every registered card without a visibility budget", async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousObserver = globalThis.IntersectionObserver;
  const previousSetInterval = globalThis.setInterval;
  const previousClearInterval = globalThis.clearInterval;
  let observe: ((items: IntersectionObserverEntry[]) => void) | undefined;
  let rotate: (() => void) | undefined;

  class FakeObserver {
    constructor(callback: IntersectionObserverCallback) {
      observe = callback as (items: IntersectionObserverEntry[]) => void;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const videos = Array.from({ length: 8 }, () => {
    let source: string | null = null;
    let paused = true;
    return {
      get paused() {
        return paused;
      },
      dataset: {} as DOMStringMap,
      play() {
        paused = false;
        return Promise.resolve();
      },
      pause() {
        paused = true;
      },
      load() {},
      getAttribute(name: string) {
        return name === "src" ? source : null;
      },
      hasAttribute(name: string) {
        return name === "src" && source !== null;
      },
      removeAttribute(name: string) {
        if (name === "src") source = null;
      },
      set src(value: string) {
        source = value;
      },
    } as unknown as HTMLVideoElement;
  });

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { matchMedia: () => ({ matches: false }) },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      hidden: false,
      addEventListener() {},
      removeEventListener() {},
    },
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: FakeObserver,
  });
  globalThis.setInterval = ((callback: () => void) => {
    rotate = callback;
    return 1 as unknown as ReturnType<typeof setInterval>;
  }) as typeof setInterval;
  globalThis.clearInterval = (() => {}) as typeof clearInterval;

  try {
    const scheduler = new PlaybackScheduler();
    videos.forEach((video, index) =>
      scheduler.register(
        "SA-" + String(index + 1).padStart(3, "0"),
        video,
        "/media/" + (index + 1) + ".mp4",
        () => {},
      ),
    );
    scheduler.start();
    observe!(
      videos.map(
        (target) =>
          ({
            target,
            isIntersecting: true,
            intersectionRatio: 1,
          }) as unknown as IntersectionObserverEntry,
      ),
    );
    assert.equal(scheduler.snapshot().playing.length, videos.length);
    assert.equal(scheduler.snapshot().sources.length, videos.length);
    scheduler.destroy();
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previousDocument,
    });
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: previousObserver,
    });
    globalThis.setInterval = previousSetInterval;
    globalThis.clearInterval = previousClearInterval;
  }
});
