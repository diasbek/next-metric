import {
  cancelScheduledScrollTriggerRefresh,
  CLEAR_MOTION_PROPS,
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  scheduleScrollTriggerRefresh,
  showAllRevealTargets,
} from "./gsap";
import { initGlobalReveals } from "./reveals";

export { showAllRevealTargets } from "./gsap";

type Cleanup = () => void;

function initHeroEntrance(): Cleanup {
  const hero = document.querySelector<HTMLElement>(".metric-hero");
  if (!hero) return () => {};

  const copy = hero.querySelector(".metric-hero__copy");
  const visual = hero.querySelector(".metric-hero__visual");
  const trust = hero.querySelector(".metric-hero__trust");
  const targets = [copy, visual, trust].filter(Boolean) as HTMLElement[];
  if (!targets.length) return () => {};

  const tween = gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 28 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.95,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: CLEAR_MOTION_PROPS,
      onComplete: () => {
        targets.forEach((el) => el.classList.add("is-revealed"));
      },
    },
  );

  return () => {
    tween.kill();
  };
}

function initCtaHovers(): Cleanup {
  const links = Array.from(
    document.querySelectorAll<HTMLElement>(".metric-cta--skew"),
  );
  if (!links.length) return () => {};

  const cleanups: Cleanup[] = [];
  links.forEach((el) => {
    const onEnter = () =>
      gsap.to(el, { x: 4, duration: 0.25, ease: "power2.out", overwrite: true });
    const onLeave = () =>
      gsap.to(el, { x: 0, duration: 0.3, ease: "power2.out", overwrite: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

/** Public Metric site — hero entrance, scroll reveals, CTA hover. */
export function initAnimations(_pathname: string): Cleanup {
  if (typeof window === "undefined") return () => {};

  registerGsapPlugins();

  if (prefersReducedMotion()) {
    showAllRevealTargets();
    return () => {};
  }

  const cleanups: Cleanup[] = [];

  const ctx = gsap.context(() => {
    cleanups.push(initHeroEntrance());
    cleanups.push(initGlobalReveals());
    cleanups.push(initCtaHovers());
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
