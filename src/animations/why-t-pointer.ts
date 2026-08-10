import {
  applyBlurOffsets,
  buildBlurCycleTimeline,
  createBlurProxy,
  queryBlurGrads,
} from "./progressive-blur-cycle";
import { gsap, MOTION_OK, registerGsapPlugins } from "./gsap";

/** Why-M artboard (matches WhyTMonogramSvg). */
const SPACE = { x: 0, y: 0, width: 687, height: 993 };

/**
 * Simplified progressive blur on Why Us / Agency M:
 * Figma autoplay cycle while in view (no pointer tracking).
 */
export function initWhyTPointer(): () => void {
  registerGsapPlugins();

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    const roots = document.querySelectorAll<HTMLElement>("[data-why-t-asset]");
    if (!roots.length) return;

    const cleanups: Array<() => void> = [];

    roots.forEach((asset) => {
      const brush = asset.querySelector<HTMLElement>("[data-why-t-brush]");
      const sharp = asset.querySelector<HTMLElement>("[data-why-t-sharp]");
      if (!brush || !sharp) return;

      const grads = queryBlurGrads(brush, "data-why-t-blur-grad");
      const proxy = createBlurProxy();
      let active = false;
      let inView = false;
      let loop: gsap.core.Timeline | null = null;

      const paint = () => applyBlurOffsets(grads, proxy, SPACE);
      const canRun = () => !document.hidden && inView;

      const setVisible = (on: boolean) => {
        if (on) {
          gsap.set(brush, { display: "block", visibility: "visible" });
        }

        gsap.to(brush, {
          opacity: on ? 1 : 0,
          duration: on ? 0.28 : 0.35,
          ease: on ? "power2.out" : "power2.inOut",
          overwrite: "auto",
          onComplete: () => {
            if (!on) {
              gsap.set(brush, { visibility: "hidden", display: "none" });
            }
          },
        });
        gsap.to(sharp, {
          opacity: on ? 0 : 1,
          duration: on ? 0.28 : 0.35,
          ease: on ? "power2.out" : "power2.inOut",
          overwrite: "auto",
        });
      };

      const setActive = (on: boolean) => {
        const next = on && canRun();
        if (next === active) return;
        active = next;

        if (next) {
          if (!loop) loop = buildBlurCycleTimeline(proxy, paint);
          else loop.play();
        } else {
          loop?.pause(0);
          paint();
        }

        setVisible(next);
      };

      const sync = () => setActive(canRun());

      paint();
      gsap.set(brush, { opacity: 0, visibility: "hidden", display: "none" });
      gsap.set(sharp, { opacity: 1 });

      const onVisibility = () => sync();
      document.addEventListener("visibilitychange", onVisibility);

      const io = new IntersectionObserver(
        ([entry]) => {
          inView = Boolean(entry?.isIntersecting);
          sync();
        },
        { threshold: 0.3, rootMargin: "-8% 0px" },
      );
      io.observe(asset);
      sync();

      cleanups.push(() => {
        document.removeEventListener("visibilitychange", onVisibility);
        io.disconnect();
        loop?.kill();
        loop = null;
        gsap.killTweensOf([brush, sharp, proxy]);
        gsap.set(sharp, { clearProps: "opacity" });
        gsap.set(brush, { clearProps: "opacity,visibility,display" });
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  });

  return () => mm.revert();
}
