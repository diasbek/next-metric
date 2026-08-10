import { gsap, MOTION_OK, registerGsapPlugins, runMatchMedia } from "./gsap";

/**
 * Figma Frame 26 blob motion (145:3283 / 3287 / 3291).
 * timelineDurationMs = 8000, loopMode = boomerang, ease = linear.
 * Deltas are in the 1512×982 artboard space.
 */
const DESIGN_W = 1512;
const DESIGN_H = 982;
const DURATION = 8;

const BLOB_TRAVEL = [
  { x: -489, y: 811 },
  { x: -618.024, y: -865.681 },
  { x: 1121.933, y: -61.568 },
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
            x: travel.x * sx,
            y: travel.y * sy,
            duration: DURATION,
            ease: "none",
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
