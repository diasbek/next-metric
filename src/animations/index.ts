import {
  cancelScheduledScrollTriggerRefresh,
  CLEAR_MOTION_PROPS,
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  scheduleScrollTriggerRefresh,
  showAllRevealTargets,
} from "./gsap";
import { initBlobAnimations } from "./blobs";
import { initGlobalReveals } from "./reveals";
import { initBeforeAfterSliders } from "./before-after";

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
    { autoAlpha: 0, y: 16 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.05,
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

/** Quick GSAP jiggle on category marquee cards. */
function initCategoryCardHovers(): Cleanup {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(".metric-categories__card"),
  );
  if (!cards.length) return () => {};

  const cleanups: Cleanup[] = [];
  cards.forEach((el) => {
    const onEnter = () => {
      gsap.killTweensOf(el);
      gsap
        .timeline({ defaults: { overwrite: "auto" } })
        .to(el, {
          y: -10,
          scale: 1.045,
          rotation: gsap.utils.random(-2.4, -1.2),
          duration: 0.18,
          ease: "power2.out",
        })
        .to(el, {
          rotation: gsap.utils.random(1.2, 2.4),
          duration: 0.12,
          ease: "power1.inOut",
        })
        .to(el, {
          rotation: 0,
          duration: 0.22,
          ease: "power2.out",
        });
    };
    const onLeave = () => {
      gsap.killTweensOf(el);
      gsap.to(el, {
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

/** Measure title height and collapse sticky pin offset once title scrolls away. */
function initServicesTitlePin(): Cleanup {
  const section = document.getElementById("services");
  const title = section?.querySelector<HTMLElement>(".metric-services__title");
  if (!section || !title) return () => {};

  const headerOffset =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height",
      ),
    ) || 88;

  const measure = () => {
    section.style.setProperty(
      "--services-title-h",
      `${Math.ceil(title.getBoundingClientRect().height)}px`,
    );
  };

  const update = () => {
    const away = title.getBoundingClientRect().bottom < headerOffset + 8;
    section.classList.toggle("is-services-title-away", away);
  };

  measure();
  update();

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("resize", update);

  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", measure);
    window.removeEventListener("resize", update);
    section.classList.remove("is-services-title-away");
    section.style.removeProperty("--services-title-h");
  };
}

/** Soft lift + nudge on Services glass cards. */
function initServiceCardHovers(): Cleanup {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(".metric-services-card"),
  );
  if (!cards.length) return () => {};

  const cleanups: Cleanup[] = [];
  cards.forEach((el) => {
    const onEnter = () => {
      gsap.killTweensOf(el);
      gsap.to(el, {
        y: -6,
        scale: 1.015,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });
    };
    const onLeave = () => {
      gsap.killTweensOf(el);
      gsap.to(el, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

/** Public Metric site — hero entrance, scroll reveals, CTA hover, before/after. */
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
    cleanups.push(initBlobAnimations());
    cleanups.push(initGlobalReveals());
    cleanups.push(initCtaHovers());
    cleanups.push(initCategoryCardHovers());
    cleanups.push(initServiceCardHovers());
    cleanups.push(initServicesTitlePin());
    cleanups.push(initBeforeAfterSliders());
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
