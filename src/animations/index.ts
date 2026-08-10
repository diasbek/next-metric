import {
  cancelScheduledScrollTriggerRefresh,
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  scheduleScrollTriggerRefresh,
  showAllRevealTargets,
} from "./gsap";
import { initGlobalReveals } from "./reveals";

export { showAllRevealTargets } from "./gsap";

type Cleanup = () => void;

/** Public Metric site — light reveals only (TIMSOL hero/logo motion removed). */
export function initAnimations(_pathname: string): Cleanup {
  if (typeof window === "undefined") return () => {};

  registerGsapPlugins();

  if (prefersReducedMotion()) {
    showAllRevealTargets();
    return () => {};
  }

  const cleanups: Cleanup[] = [];

  const ctx = gsap.context(() => {
    cleanups.push(initGlobalReveals());
  });

  requestAnimationFrame(() => scheduleScrollTriggerRefresh(0));

  const onLoad = () => scheduleScrollTriggerRefresh(0);
  window.addEventListener("load", onLoad);
  const resizeObserver = new ResizeObserver(() => scheduleScrollTriggerRefresh());
  resizeObserver.observe(document.body);

  return () => {
    cleanups.forEach((fn) => fn());
    ctx.revert();
    window.removeEventListener("load", onLoad);
    resizeObserver.disconnect();
    cancelScheduledScrollTriggerRefresh();
  };
}
