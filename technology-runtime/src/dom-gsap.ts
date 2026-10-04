import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import Lenis from "lenis";
import type { Mount } from "./types";
import { surface, handle, wave } from "./dom-kit";
const mount: Mount = async (root, { variant, signal }) => {
  await document.fonts.ready;
  if (variant === "scroll") {
    gsap.registerPlugin(ScrollTrigger);
    const s = surface(
      root,
      `.scroller{height:395px;overflow:auto;margin-top:15px;background:#e3dfd4}.content{height:1300px;padding:40px}.visual{position:sticky;top:40px;height:290px}.number{font-size:190px;line-height:1;font-weight:800;color:#b44730}.route{height:8px;background:#213c32;transform-origin:left}.caption{font-size:27px}.chapter{margin-top:30px;font-size:17px}`,
      `<div class="label">LANDSCAPE / THREE CHAPTERS</div><div class="scroller" tabindex="0" aria-label="捲動章節"><div class="content"><div class="visual"><div class="number">01</div><div class="route"></div><p class="caption">LOWLAND — RIDGE — HORIZON</p></div><p class="chapter">捲動或使用方向鍵探索敘事</p></div></div>`,
    );
    const scroller = s.querySelector<HTMLElement>(".scroller")!,
      content = s.querySelector<HTMLElement>(".content")!;
    const lenis = new Lenis({
      wrapper: scroller,
      content,
      autoRaf: false,
      lerp: 0.12,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tl = gsap
      .timeline({ paused: true })
      .fromTo(
        s.querySelector(".route"),
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "none" },
      )
      .fromTo(
        s.querySelector(".number"),
        { x: 0 },
        { x: 500, duration: 1, ease: "none" },
        0,
      );
    const st = ScrollTrigger.create({
      scroller,
      trigger: content,
      start: "top top",
      end: "bottom bottom",
      animation: tl,
      scrub: true,
      onUpdate: (self) => {
        s.querySelector(".number")!.textContent = String(
          1 + Math.min(2, Math.floor(self.progress * 3)),
        ).padStart(2, "0");
      },
    });
    let manual = false;
    for (const e of ["wheel", "touchstart", "keydown"])
      scroller.addEventListener(e, () => (manual = true), { signal });
    st.refresh();
    return handle(
      root,
      (t) => {
        lenis.raf(t * 1000);
        if (!manual) lenis.scrollTo(wave(t) * 900, { immediate: true });
        ScrollTrigger.update();
      },
      () => {
        st.kill();
        tl.kill();
        lenis.destroy();
      },
    );
  }
  if (variant === "mask") {
    const s = surface(
      root,
      `.headline{font-size:105px;line-height:.95;letter-spacing:-7px;font-weight:900;width:870px;margin-top:55px}.char{display:inline-block}.mask{overflow:hidden}.band{position:absolute;bottom:55px;left:40px;height:25px;background:#d33325;width:870px;transform-origin:left}.small{position:absolute;right:40px;bottom:25px;font-size:16px}`,
      `<div class="label">TYPE / EXPERIMENT 01</div><div class="mask"><h1 class="headline" aria-label="MOVE WITH INTENT">MOVE WITH<br>INTENT</h1></div><div class="band"></div><p class="small">A rhythm built from individual letters.</p>`,
    );
    const split = new SplitType(s.querySelector<HTMLElement>(".headline")!, {
      types: "chars",
    });
    split.chars?.forEach((el) => el.setAttribute("aria-hidden", "true"));
    const tl = gsap
      .timeline({ paused: true })
      .fromTo(
        split.chars,
        { yPercent: 125, rotate: 8 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
        },
        0,
      )
      .fromTo(
        s.querySelector(".band"),
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "power4.inOut" },
        0.4,
      )
      .to(
        split.chars,
        { yPercent: -130, duration: 0.65, stagger: 0.035, ease: "power3.in" },
        2.8,
      )
      .to(s.querySelector(".band"), { scaleX: 0, duration: 0.7 }, 3.2);
    return handle(
      root,
      (t) => {
        tl.seek(t, false);
      },
      () => {
        tl.kill();
        split.revert();
      },
    );
  }
  const s = surface(
    root,
    `.product{position:absolute;left:415px;top:120px;width:145px;height:310px;background:linear-gradient(90deg,#899697,#e1e8e6 40%,#899697);border-radius:65px 65px 40px 40px;box-shadow:30px 20px 20px #0002}.cap{position:absolute;top:-15px;left:34px;width:77px;height:40px;background:#324c46;border-radius:8px}.labelmark{position:absolute;top:120px;left:35px;font-size:28px;line-height:1.05;color:#21342f}.annotation{position:absolute;font-size:22px;left:70px;top:180px;width:250px;border-top:1px solid;padding-top:15px}.annotation.right{left:650px;top:300px}.ring{position:absolute;left:295px;top:120px;width:380px;height:310px;border:1px solid #8b9d92;border-radius:50%}`,
    `<div class="label">OBJECT / ASSEMBLY STUDY</div><div class="ring"></div><div class="product"><div class="cap"></div><div class="labelmark">FORM<br>01</div></div><div class="annotation">01 / Shell<br>Single surface</div><div class="annotation right">02 / Closure<br>Controlled separation</div>`,
  );
  // Initialize future tween transforms before the first render so a backward
  // seek has the same compositing state as the initial visit to that frame.
  gsap.set(s.querySelector(".cap"), { y: 0 });
  gsap.set(s.querySelector(".ring"), { scaleY: 1, rotate: 0 });
  const tl = gsap
    .timeline({ paused: true })
    .fromTo(
      s.querySelector(".product"),
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" },
    )
    .fromTo(
      s.querySelectorAll(".annotation"),
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.25, duration: 0.6 },
      0.6,
    )
    .to(
      s.querySelector(".cap"),
      { y: -55, duration: 0.7, ease: "power2.inOut" },
      1.7,
    )
    .to(
      s.querySelector(".ring"),
      { scaleY: 0.45, rotate: -12, duration: 0.8 },
      1.7,
    )
    .to(s.querySelector(".cap"), { y: 0, duration: 0.7 }, 2.9);
  return handle(
    root,
    (t) => {
      tl.seek(t, false);
    },
    () => tl.kill(),
  );
};
export default mount;
