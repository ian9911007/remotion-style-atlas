import assert from "node:assert/strict";
import { test } from "node:test";
import { PlaybackScheduler } from "../src/lib/playback";

/** Created: 2026-10-04. Filtering must not churn native sessions for poster-only cards. */
test("filter teardown releases acquired media without loading untouched poster cards", async () => {
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    observer: globalThis.IntersectionObserver,
  };
  let visibility: IntersectionObserverCallback;
  class Observer {
    constructor(callback: IntersectionObserverCallback) {
      visibility = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const media = Array.from({ length: 178 }, () => {
    let source: string | null = null;
    let paused = true;
    const calls = { load: 0, pause: 0 };
    const video = {
      get paused() {
        return paused;
      },
      dataset: {},
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
      play() {
        paused = false;
        return Promise.resolve();
      },
      pause() {
        calls.pause++;
        paused = true;
      },
      load() {
        calls.load++;
      },
    } as unknown as HTMLVideoElement;
    return { video, calls };
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { matchMedia: () => ({ matches: false }) },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { hidden: false, addEventListener() {}, removeEventListener() {} },
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: Observer,
  });
  const scheduler = new PlaybackScheduler();
  try {
    const unmount = media.map(({ video }, index) =>
      scheduler.register(
        `fixture-${index}`,
        video,
        `/media/fixture-${index}.mp4`,
        () => {},
      ),
    );
    scheduler.start();
    visibility!(
      [
        {
          target: media[0].video,
          isIntersecting: true,
          intersectionRatio: 1,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
    await Promise.resolve();
    assert.equal(
      media[0].calls.load,
      1,
      "Visible media acquires and loads its actual source.",
    );
    assert.equal(media[0].video.paused, false);
    for (const dispose of unmount) dispose();
    assert.equal(
      media[0].calls.pause,
      1,
      "A playing source is paused on unmount.",
    );
    assert.equal(
      media[0].calls.load,
      2,
      "Removing an acquired source still invokes load() to release its decoder.",
    );
    assert.equal(media[0].video.hasAttribute("src"), false);
    assert.ok(
      media
        .slice(1)
        .every(({ calls }) => calls.pause === 0 && calls.load === 0),
      "Filtering poster-only cards must not create native media-session updates.",
    );
    assert.deepEqual(scheduler.snapshot().sources, []);
  } finally {
    scheduler.destroy();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previous.window,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previous.document,
    });
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: previous.observer,
    });
  }
});

test("global wall mode plays every visible card and releases offscreen media", async () => {
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
    await Promise.resolve();
    rotate!();
    assert.equal(scheduler.snapshot().playing.length, videos.length);
    observe!(
      videos.map(
        (target) =>
          ({
            target,
            isIntersecting: false,
            intersectionRatio: 0,
          }) as unknown as IntersectionObserverEntry,
      ),
    );
    assert.equal(scheduler.snapshot().playing.length, 0);
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

/** Created: 2026-10-26. Delayed native play rejection after offscreen/onscreen handoff. */
for (const {name, errorName, withdraw} of [
  {name:"withdrawn pending play resumes after a cancelled native attempt",errorName:"AbortError",withdraw:true},
  {name:"withdrawn pending play still exposes a real autoplay denial",errorName:"NotAllowedError",withdraw:true},
  {name:"an unwithdrawn AbortError remains a real playback failure",errorName:"AbortError",withdraw:false},
]) {
  test(name, async () => {
    const originals = {window:globalThis.window,document:globalThis.document,observer:globalThis.IntersectionObserver};
    let observe: IntersectionObserverCallback;
    let rejectPending!: (reason: Error) => void;
    let source: string | null = null, paused = true, plays = 0, failures = 0;
    const video = {
      dataset:{}, get paused(){return paused;},
      getAttribute(name:string){return name === "src" ? source : null;},
      hasAttribute(name:string){return name === "src" && source !== null;},
      removeAttribute(name:string){if(name === "src")source=null;},
      set src(value:string){source=value;}, load(){}, pause(){paused=true;},
      play(){paused=false;plays++;return plays === 1 ? new Promise<void>((_,reject)=>{rejectPending=reject;}) : Promise.resolve();},
    } as unknown as HTMLVideoElement;
    class Observer {constructor(callback:IntersectionObserverCallback){observe=callback;} observe(){} unobserve(){} disconnect(){}}
    Object.defineProperty(globalThis,"window",{configurable:true,value:{matchMedia:()=>({matches:false})}});
    Object.defineProperty(globalThis,"document",{configurable:true,value:{hidden:false,addEventListener(){},removeEventListener(){}}});
    Object.defineProperty(globalThis,"IntersectionObserver",{configurable:true,value:Observer});
    const scheduler = new PlaybackScheduler();
    const visible = (value:boolean) => observe!([{target:video,isIntersecting:value,intersectionRatio:value ? 1 : 0} as unknown as IntersectionObserverEntry],{} as IntersectionObserver);
    try {
      scheduler.register("synthetic-delayed-play",video,"/media/synthetic.mp4",()=>{failures++;});
      scheduler.start(); visible(true); assert.equal(plays,1);
      if (withdraw) { visible(false); assert.equal(video.paused,true); visible(true); }
      assert.equal(plays,1,"One pending attempt at a time");
      rejectPending(new DOMException("controlled native rejection",errorName));
      for(let i=0;i<6;i++) await Promise.resolve();
      if(errorName === "AbortError" && withdraw) {
        assert.equal(failures,0,"A scheduler-cancelled attempt is not a media failure");
        assert.equal(plays,2,"Visible media resumes with a fresh native attempt");
        assert.deepEqual(scheduler.snapshot().playing,["synthetic-delayed-play"]);
      } else {
        assert.equal(failures,1,"Real autoplay denial keeps the failure/retry state");
        assert.equal(plays,1); assert.deepEqual(scheduler.snapshot().playing,[]);
      }
    } finally {
      scheduler.destroy();
      Object.defineProperty(globalThis,"window",{configurable:true,value:originals.window});
      Object.defineProperty(globalThis,"document",{configurable:true,value:originals.document});
      Object.defineProperty(globalThis,"IntersectionObserver",{configurable:true,value:originals.observer});
    }
  });
}
