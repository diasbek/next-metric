import { CLEAR_MOTION_PROPS, DESKTOP_MQ, gsap, MOTION_OK, registerGsapPlugins, runMatchMedia } from "./gsap";

function markRevealed(targets: HTMLElement | HTMLElement[]): void {
  const list = Array.isArray(targets) ? targets : [targets];
  list.forEach((el) => el.classList.add("is-revealed"));
}

/** True when the element has already crossed a reveal "top XX%" start. */
function isPastRevealStart(el: HTMLElement, viewportPct = 88): boolean {
  const top = el.getBoundingClientRect().top;
  return top < (window.innerHeight * viewportPct) / 100;
}

function showImmediately(targets: HTMLElement | HTMLElement[]): void {
  const list = Array.isArray(targets) ? targets : [targets];
  gsap.set(list, { autoAlpha: 1, y: 0, scale: 1, clearProps: CLEAR_MOTION_PROPS });
  markRevealed(list);
}

/**
 * Fires `onEnter` once `el` scrolls into view.
 *
 * Deliberately NOT GSAP ScrollTrigger here: ScrollTrigger caches each
 * trigger's start position and only recalculates it on an explicit
 * refresh(). If a layout shift (responsive breakpoint change, image load,
 * font swap) happens between that cache and the real scroll position, a
 * `once: true` tween can miss its window entirely and never fire — leaving
 * the element stuck at its pre-reveal faded/low-opacity state forever (the
 * "some cards show up gray/pale" bug). IntersectionObserver has no such
 * cache; it always reflects real DOM intersection, so it can't get stuck.
 */
function revealOnceVisible(el: HTMLElement, onEnter: () => void, viewportPct = 88): void {
  if (isPastRevealStart(el, viewportPct)) {
    onEnter();
    return;
  }
  const rootMargin = `0px 0px -${100 - viewportPct}% 0px`;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        onEnter();
        observer.disconnect();
      });
    },
    { rootMargin, threshold: 0 },
  );
  observer.observe(el);
}

export function createReveals(): void {
  document
    // Skip items owned by a reveal-group — group tween handles them.
    // Skip already-revealed items (e.g. force-shown for a hash jump) —
    // re-animating them would flash them invisible again.
    .querySelectorAll<HTMLElement>(
      "[data-reveal]:not(.is-revealed):not([data-split-title]):not([data-reveal-group] > [data-reveal])",
    )
    .forEach((el) => {
      if (isPastRevealStart(el, 88)) {
        showImmediately(el);
        return;
      }

      const y = Number(el.dataset.revealY ?? 40);
      const delay = Number(el.dataset.revealDelay ?? 0);
      gsap.set(el, { autoAlpha: 0, y });
      revealOnceVisible(
        el,
        () => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay,
            ease: "power3.out",
            clearProps: CLEAR_MOTION_PROPS,
            onComplete: () => markRevealed(el),
          });
        },
        88,
      );
    });
}

export function createRevealGroups(): void {
  document
    // Skip already-revealed groups (e.g. force-shown for a hash jump).
    .querySelectorAll<HTMLElement>("[data-reveal-group]:not(.is-revealed)")
    .forEach((group) => {
      const items = Array.from(group.children) as HTMLElement[];
      if (!items.length) return;

      if (isPastRevealStart(group, 85)) {
        showImmediately(items);
        group.classList.add("is-revealed");
        return;
      }

      const pop = group.dataset.revealGroup === "pop";
      const stagger = Number(group.dataset.revealStagger ?? (pop ? 0.08 : 0.1));
      // Whole card/item appears as one unit — no separate sub-element
      // (e.g. its media) animating in on its own timing, so it can't look
      // like it's assembling itself in pieces.
      gsap.set(items, pop ? { autoAlpha: 0, y: 26, scale: 0.8 } : { autoAlpha: 0, y: 48 });
      revealOnceVisible(
        group,
        () => {
          gsap.to(items, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: pop ? 0.7 : 0.9,
            ease: pop ? "back.out(1.7)" : "power3.out",
            stagger,
            clearProps: CLEAR_MOTION_PROPS,
            onComplete: () => {
              markRevealed(items);
              group.classList.add("is-revealed");
            },
          });
        },
        85,
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
  document
    .querySelectorAll<HTMLElement>("[data-counter]:not(.is-revealed)")
    .forEach((el) => {
      const raw = el.textContent?.trim() ?? "";
      const match = /^(\d+)(.*)$/.exec(raw);
      if (!match) return;
      const target = Number(match[1]);
      const suffix = match[2] ?? "";
      const state = { value: 0 };

      gsap.set(el, { scale: 0.7, autoAlpha: 0 });
      revealOnceVisible(
        el,
        () => {
          el.textContent = `0${suffix}`;
          gsap.to(state, {
            value: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate() {
              el.textContent = `${Math.round(state.value)}${suffix}`;
            },
            onComplete() {
              el.textContent = raw;
            },
          });
          gsap.to(el, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.7,
            ease: "back.out(1.8)",
            clearProps: CLEAR_MOTION_PROPS,
            onComplete: () => markRevealed(el),
          });
        },
        90,
      );
    });
}

export function createBorderDraws(): void {
  document.querySelectorAll<HTMLElement>("[data-border-draw]:not(.is-revealed)").forEach((el) => {
    gsap.set(el, { scaleX: 0, transformOrigin: "left center" });
    revealOnceVisible(
      el,
      () => {
        gsap.to(el, {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => markRevealed(el),
        });
      },
      88,
    );
  });
}

export function initGlobalReveals(): () => void {
  registerGsapPlugins();

  return runMatchMedia(MOTION_OK, () => {
    createReveals();
    createRevealGroups();
    createCounters();
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
