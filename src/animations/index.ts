import {
  cancelScheduledScrollTriggerRefresh,
  CLEAR_MOTION_PROPS,
  FINE_POINTER,
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  runMatchMedia,
  scheduleScrollTriggerRefresh,
  showAllRevealTargets,
} from "./gsap";
import { initBlobAnimations } from "./blobs";
import { initGlobalReveals } from "./reveals";
import { initBeforeAfterSliders } from "./before-after";
import { initCaseStudySteps } from "./case-studies";

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

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => targets.forEach((el) => el.classList.add("is-revealed")),
  });
  const copyDetails = copy?.querySelectorAll(
    ".metric-hero__subtitle, .metric-cta",
  );
  const trustCards = trust?.querySelectorAll(":scope > *");

  // Title + visual stay in the first paint for LCP. GSAP only finishes
  // subtitle/CTA/trust.
  timeline
    .fromTo(
      copyDetails ?? [],
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        clearProps: CLEAR_MOTION_PROPS,
      },
    )
    .fromTo(
      trustCards ?? [],
      { autoAlpha: 0, y: 20, scale: 0.96 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.06,
        clearProps: CLEAR_MOTION_PROPS,
      },
      "-=0.28",
    );

  return () => {
    timeline.kill();
  };
}

function initCtaHovers(): Cleanup {
  const links = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".metric-cta--primary, .metric-cta--skew, .metric-cta--dark-fill, .metric-cta--skew-dark, .metric-cta--outline-dark, .metric-cta--skew-outline, .metric-cta--outline, .metric-cta--on-accent, .metric-cta--solid",
    ),
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

function initFaqHovers(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>(".faq-item__trigger").forEach((trigger) => {
    const onEnter = () =>
      gsap.to(trigger, {
        x: 8,
        duration: 0.24,
        ease: "power2.out",
        overwrite: true,
      });
    const onLeave = () =>
      gsap.to(trigger, {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    trigger.addEventListener("pointerenter", onEnter);
    trigger.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      trigger.removeEventListener("pointerenter", onEnter);
      trigger.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(trigger);
      gsap.set(trigger, { clearProps: "transform" });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

/** Public Metric site — hero entrance, scroll reveals, CTA hover, before/after. */
export function initAnimations(_pathname: string): Cleanup {
  if (typeof window === "undefined") return () => {};
  void _pathname;

  registerGsapPlugins();

  if (prefersReducedMotion()) {
    showAllRevealTargets();
    return () => {};
  }

  const cleanups: Cleanup[] = [];

  const ctx = gsap.context(() => {
    cleanups.push(initHeroEntrance());
    cleanups.push(initBlobAnimations());
    cleanups.push(initGlobalReveals());
    cleanups.push(initCaseStudySteps());
    cleanups.push(initBeforeAfterSliders());
    cleanups.push(
      runMatchMedia(FINE_POINTER, () => {
        const hoverCleanups = [initCtaHovers(), initFaqHovers()];
        return () => hoverCleanups.forEach((cleanup) => cleanup());
      }),
    );
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
