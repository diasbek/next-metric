import { Flip } from "gsap/Flip";
import {
  CLEAR_MOTION_PROPS,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
} from "../gsap";

const WORKS_FILTER_EVENT = "metric:works-filter";

export function initWorksAnimations(): () => void {
  registerGsapPlugins();
  const cleanups: Array<() => void> = [];

  const grid = document.querySelector<HTMLElement>("[data-works-grid]");
  if (grid) {
    let isFirstMutation = true;

    const observer = new MutationObserver(() => {
      if (isFirstMutation) {
        isFirstMutation = false;
        return;
      }
      if (!grid.children.length) return;

      const state = Flip.getState(grid.children);
      // Avoid absolute-mode Flip — it can leave squashed widths on lead/cards.
      // Never clearProps:"all" — that drops visibility and re-hides [data-reveal] CSS.
      Flip.from(state, {
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.04,
        clearProps: "transform,width,height,top,left,right,bottom,position",
      });
    });

    const onFilter = () => {
      const visible = Array.from(
        grid.querySelectorAll<HTMLElement>("[data-work-item]"),
      ).filter((item) => item.style.display !== "none");

      gsap.fromTo(
        visible,
        { autoAlpha: 0.35, scale: 0.98 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.out",
          clearProps: CLEAR_MOTION_PROPS,
        },
      );
    };

    if (typeof window !== "undefined" && window.matchMedia(MOTION_OK).matches) {
      observer.observe(grid, { childList: true });
      window.addEventListener(WORKS_FILTER_EVENT, onFilter);
    }

    cleanups.push(() => {
      observer.disconnect();
      window.removeEventListener(WORKS_FILTER_EVENT, onFilter);
    });
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
