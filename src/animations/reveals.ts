import {
  CLEAR_MOTION_PROPS,
  DESKTOP_MQ,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
} from "./gsap";

function markRevealed(targets: HTMLElement | HTMLElement[]): void {
  const list = Array.isArray(targets) ? targets : [targets];
  list.forEach((el) => el.classList.add("is-revealed"));
}

export function createReveals(): void {
  document
    // Skip items owned by a reveal-group — group tween handles them.
    .querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-split-title]):not([data-reveal-group] > [data-reveal])",
    )
    .forEach((el) => {
      const y = Number(el.dataset.revealY ?? 40);
      const delay = Number(el.dataset.revealDelay ?? 0);
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          clearProps: CLEAR_MOTION_PROPS,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onComplete: () => markRevealed(el),
        },
      );
    });
}

export function createRevealGroups(): void {
  document
    .querySelectorAll<HTMLElement>("[data-reveal-group]")
    .forEach((group) => {
      const items = Array.from(group.children) as HTMLElement[];
      if (!items.length) return;
      const pop = group.dataset.revealGroup === "pop";
      const stagger = Number(group.dataset.revealStagger ?? (pop ? 0.08 : 0.1));
      gsap.fromTo(
        items,
        pop ? { autoAlpha: 0, y: 26, scale: 0.8 } : { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: pop ? 0.7 : 0.9,
          ease: pop ? "back.out(1.7)" : "power3.out",
          stagger,
          clearProps: CLEAR_MOTION_PROPS,
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
          onComplete: () => markRevealed(items),
        },
      );
    });
}

function setupParallax(): gsap.core.Tween[] {
  const tweens: gsap.core.Tween[] = [];

  document.querySelectorAll<HTMLElement>(".js-parallax").forEach((frame) => {
    const img = frame.querySelector("img");
    if (!img) return;
    gsap.set(img, { scale: 1.12, yPercent: -5, force3D: true });
    const tween = gsap.to(img, {
      yPercent: 5,
      ease: "none",
      scrollTrigger: {
        trigger: frame,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.4,
      },
    });
    tweens.push(tween);
  });

  return tweens;
}

export function createCounters(): void {
  document.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
    const raw = el.textContent?.trim() ?? "";
    const match = /^(\d+)(.*)$/.exec(raw);
    if (!match) return;
    const target = Number(match[1]);
    const suffix = match[2] ?? "";
    const state = { value: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate() {
        el.textContent = `${Math.round(state.value)}${suffix}`;
      },
      onComplete() {
        el.textContent = raw;
      },
    });
    gsap.fromTo(
      el,
      { scale: 0.7, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.7,
        ease: "back.out(1.8)",
        clearProps: CLEAR_MOTION_PROPS,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
  });
}

export function createClipReveals(): void {
  document.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.2,
        ease: "power3.inOut",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
        onComplete: () => {
          el.classList.add("is-revealed");
          gsap.set(el, { clearProps: "clipPath" });
        },
      },
    );
  });
}

export function createBorderDraws(): void {
  document.querySelectorAll<HTMLElement>("[data-border-draw]").forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  });
}

export function initGlobalReveals(): () => void {
  registerGsapPlugins();

  return runMatchMedia(MOTION_OK, () => {
    createReveals();
    createRevealGroups();
    createCounters();
    createClipReveals();
    createBorderDraws();

    const parallaxRevert = runMatchMedia(
      `${MOTION_OK} and ${DESKTOP_MQ}`,
      () => {
        const tweens = setupParallax();
        return () => tweens.forEach((t) => t.kill());
      },
    );

    return parallaxRevert;
  });
}
