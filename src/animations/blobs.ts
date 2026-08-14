import { gsap, MOTION_OK, registerGsapPlugins, runMatchMedia } from "./gsap";

/**
 * Soft ambient blob drift inside the hero.
 * Shorter travel + longer duration so the pink/coral wash floats
 * within the section instead of sweeping across it.
 */
const DESIGN_W = 1512;
const DESIGN_H = 982;
const DURATION = 9;
const TRAVEL_SCALE = 0.55;

const BLOB_TRAVEL = [
  { x: -220, y: 280 },
  { x: -260, y: -240 },
  { x: 180, y: -160 },
] as const;

export function initBlobAnimations(): () => void {
  registerGsapPlugins();

  return runMatchMedia(MOTION_OK, () => {
    const section = document.querySelector<HTMLElement>("[data-blobs-section]");
    if (!section) return;

    const blobs = Array.from(
      section.querySelectorAll<HTMLElement>("[data-blob]"),
    );
    if (!blobs.length) return;

    const tweens: gsap.core.Tween[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let inView = true;

    const start = () => {
      tweens.splice(0).forEach((t) => t.kill());
      if (!inView || document.hidden) return;

      const sx = section.offsetWidth / DESIGN_W;
      const sy = Math.max(section.offsetHeight, DESIGN_H * 0.5) / DESIGN_H;

      blobs.forEach((blob, i) => {
        const travel = BLOB_TRAVEL[i] ?? BLOB_TRAVEL[0];
        gsap.set(blob, { x: 0, y: 0, force3D: true });
        tweens.push(
          gsap.to(blob, {
            x: travel.x * sx * TRAVEL_SCALE,
            y: travel.y * sy * TRAVEL_SCALE,
            duration: DURATION + i * 1.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }),
        );
      });
    };

    const stop = () => {
      tweens.splice(0).forEach((t) => t.kill());
    };

    const sync = () => {
      if (inView && !document.hidden) start();
      else stop();
    };

    start();

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = undefined;
        sync();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.05, rootMargin: "10% 0px" },
    );
    io.observe(section);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (resizeTimer) clearTimeout(resizeTimer);
      io.disconnect();
      stop();
      blobs.forEach((blob) => gsap.set(blob, { clearProps: "transform" }));
    };
  });
}
