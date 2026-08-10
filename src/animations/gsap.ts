import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;
let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_MQ = "(min-width: 1024px)";
export const TOUCH_MQ = "(max-width: 1023px), (hover: none), (pointer: coarse)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
/** Do not clear visibility — CSS keeps [data-reveal] hidden until GSAP reveals them. */
export const CLEAR_MOTION_PROPS = "opacity,transform";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function showAllRevealTargets(): void {
  document
    .querySelectorAll<HTMLElement>(
      "[data-reveal], [data-reveal-group] > *, [data-split-title], [data-clip-reveal], [data-border-draw], [data-counter]",
    )
    .forEach((el) => {
      el.classList.add("is-revealed");
      el.style.visibility = "visible";
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.clipPath = "none";
      el.style.scale = "1";
    });

  document.querySelectorAll<HTMLElement>(".js-parallax img").forEach((img) => {
    img.style.transform = "none";
  });

  document.querySelectorAll<HTMLElement>("[data-header-logo]").forEach((logo) => {
    const header = logo.closest<HTMLElement>("[data-site-header]");
    // Hero page: navbar mark stays hidden until `.is-logo-docked` — never force a dual logo.
    if (
      header?.getAttribute("data-header-variant") === "hero" &&
      !header.classList.contains("is-logo-docked")
    ) {
      return;
    }
    logo.style.visibility = "visible";
    logo.style.opacity = "1";
    logo.style.pointerEvents = "";
  });
}

export function registerGsapPlugins(): typeof gsap {
  if (typeof window === "undefined") return gsap;
  if (!registered) {
    gsap.registerPlugin(
      ScrollTrigger,
      SplitText,
      Flip,
      Draggable,
      Observer,
      ScrollToPlugin,
    );
    registered = true;
  }
  return gsap;
}

export function refreshScrollTriggers(): void {
  if (typeof window === "undefined") return;
  ScrollTrigger.refresh();
}

/** Debounced refresh — avoids storms from ResizeObserver / accordion / swiper. */
export function scheduleScrollTriggerRefresh(debounceMs = 120): void {
  if (typeof window === "undefined") return;
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(() => {
    refreshTimeout = undefined;
    ScrollTrigger.refresh();
  }, debounceMs);
}

export function cancelScheduledScrollTriggerRefresh(): void {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = undefined;
  }
}

/** Run gsap.matchMedia query and return a revert cleanup. */
export function runMatchMedia(
  query: string,
  setup: () => void | (() => void),
): () => void {
  const mm = gsap.matchMedia();
  mm.add(query, setup);
  return () => mm.revert();
}

export { gsap, ScrollTrigger, Flip, Draggable, Observer, ScrollToPlugin, SplitText };
