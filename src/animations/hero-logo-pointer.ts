import {
  applyBlurOffsets,
  buildBlurCycleTimeline,
  createBlurProxy,
  queryBlurGrads,
} from "./progressive-blur-cycle";
import { gsap, MOTION_OK, registerGsapPlugins } from "./gsap";

/** Hero METRIC viewBox letter frame (matches HeroLogoSvg). */
const SPACE = { x: 0, y: 0, width: 1200, height: 280 };

/**
 * Progressive blur on hero METRIC — Figma autoplay cycle while undocked + in view.
 * No pointer / hover scrubbing.
 */
export function initHeroLogoPointer(): () => void {
  registerGsapPlugins();

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    const asset = document.querySelector<HTMLElement>("[data-hero-logo-asset]");
    const brush = document.querySelector<HTMLElement>("[data-hero-logo-brush]");
    const sharp = document.querySelector<HTMLElement>("[data-hero-logo-blue]");
    if (!asset || !brush || !sharp) return;

    const grads = queryBlurGrads(brush, "data-hero-blur-grad");
    const proxy = createBlurProxy();
    let active = false;
    let inView = true;
    let raf = 0;
    let loop: gsap.core.Timeline | null = null;

    const paint = () => applyBlurOffsets(grads, proxy, SPACE);

    const isDocked = () => asset.classList.contains("is-hero-logo-docked");
    const isFlying = () => asset.classList.contains("is-hero-logo-flying");
    const canRun = () => !document.hidden && !isDocked() && !isFlying() && inView;

    const ensureLoop = () => {
      if (!loop) loop = buildBlurCycleTimeline(proxy, paint);
      return loop;
    };

    const setVisible = (on: boolean) => {
      if (on) {
        gsap.set(brush, { display: "block", visibility: "visible" });
      }

      gsap.to(brush, {
        opacity: on ? 1 : 0,
        duration: on ? 0.22 : 0.3,
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
        duration: on ? 0.22 : 0.3,
        ease: on ? "power2.out" : "power2.inOut",
        overwrite: "auto",
      });
    };

    const setActive = (on: boolean) => {
      const next = on && canRun();
      if (next === active) return;
      active = next;

      const tl = ensureLoop();
      if (next) tl.play();
      else {
        tl.pause(0);
        paint();
      }

      setVisible(next);
    };

    const sync = () => setActive(canRun());

    const scheduleSync = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    paint();
    gsap.set(brush, { opacity: 0, visibility: "hidden", display: "none" });
    gsap.set(sharp, { opacity: 1 });

    const classObserver = new MutationObserver(scheduleSync);
    classObserver.observe(asset, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.35, rootMargin: "-8% 0px" },
    );
    io.observe(asset);
    sync();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      classObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
      loop?.kill();
      loop = null;
      gsap.killTweensOf([brush, sharp, proxy]);
      gsap.set(sharp, { clearProps: "opacity" });
      gsap.set(brush, { clearProps: "opacity,visibility,display" });
    };
  });

  return () => mm.revert();
}
