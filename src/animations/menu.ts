import { gsap, MOTION_OK, registerGsapPlugins } from "./gsap";

let menuTimeline: gsap.core.Timeline | null = null;

/**
 * Mobile menu: opacity-only open/close.
 * Avoids full-viewport xPercent slides + per-link transforms that cause
 * compositor flicker under the fixed black panel on iOS/Android.
 */
export function initMenuAnimations(): () => void {
  registerGsapPlugins();

  const finishClose = (panel: HTMLElement) => {
    gsap.set(panel, { clearProps: "opacity,visibility,pointerEvents" });
    window.dispatchEvent(new CustomEvent("metric:menu-closed"));
  };

  const handleOpen = (e: Event) => {
    const panel = (e as CustomEvent<{ panel: HTMLElement }>).detail.panel;
    menuTimeline?.kill();

    if (!window.matchMedia(MOTION_OK).matches) {
      gsap.set(panel, { autoAlpha: 1, pointerEvents: "auto" });
      return;
    }

    gsap.set(panel, { autoAlpha: 0, force3D: true });
    panel.style.pointerEvents = "none";
    menuTimeline = gsap.timeline({
      defaults: { ease: "power2.out", force3D: true },
    });
    menuTimeline.to(panel, {
      autoAlpha: 1,
      duration: 0.28,
      onStart: () => {
        panel.style.pointerEvents = "auto";
      },
    });
  };

  const handleClose = (e: Event) => {
    const panel = (e as CustomEvent<{ panel: HTMLElement }>).detail.panel;
    menuTimeline?.kill();

    if (!window.matchMedia(MOTION_OK).matches) {
      finishClose(panel);
      return;
    }

    panel.style.pointerEvents = "none";
    menuTimeline = gsap.timeline({
      defaults: { ease: "power2.in", force3D: true },
      onComplete: () => finishClose(panel),
    });
    menuTimeline.to(panel, {
      autoAlpha: 0,
      duration: 0.2,
    });
  };

  window.addEventListener("metric:menu-open", handleOpen);
  window.addEventListener("metric:menu-close", handleClose);

  return () => {
    menuTimeline?.kill();
    menuTimeline = null;
    window.removeEventListener("metric:menu-open", handleOpen);
    window.removeEventListener("metric:menu-close", handleClose);
  };
}

export function dispatchMenuOpen(panel: HTMLElement): void {
  window.dispatchEvent(
    new CustomEvent("metric:menu-open", { detail: { panel } }),
  );
}

export function dispatchMenuClose(panel: HTMLElement): void {
  window.dispatchEvent(
    new CustomEvent("metric:menu-close", { detail: { panel } }),
  );
}
