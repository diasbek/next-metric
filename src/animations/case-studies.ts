import { CLEAR_MOTION_PROPS, gsap } from "./gsap";

type Cleanup = () => void;

function isPastRevealStart(el: HTMLElement, viewportPct = 88): boolean {
  const top = el.getBoundingClientRect().top;
  return top < (window.innerHeight * viewportPct) / 100;
}

function markRevealed(el: HTMLElement): void {
  el.classList.add("is-revealed");
}

function playCard(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: "back.out(1.7)",
      clearProps: CLEAR_MOTION_PROPS,
      onComplete: () => {
        markRevealed(el);
        resolve();
      },
    });
  });
}

/**
 * Homepage #case-studies cards: play one after another once each card
 * is in view. Avoids the list-level stagger that finishes off-screen.
 */
export function initCaseStudySteps(): Cleanup {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(
      "#case-studies [data-case-steps] > .metric-case-card",
    ),
  );
  if (!cards.length) return () => {};

  cards.forEach((el) => {
    if (el.classList.contains("is-revealed")) return;
    gsap.set(el, { autoAlpha: 0, y: 26, scale: 0.96 });
  });

  let nextIndex = 0;
  let playing = false;
  const ready = new Set<HTMLElement>();
  const observers: IntersectionObserver[] = [];
  let cancelled = false;

  const tryPlayNext = () => {
    if (cancelled || playing) return;

    while (nextIndex < cards.length) {
      const card = cards[nextIndex];
      if (card.classList.contains("is-revealed")) {
        nextIndex += 1;
        continue;
      }
      const canPlay = ready.has(card) || isPastRevealStart(card, 88);
      if (!canPlay) return;

      playing = true;
      nextIndex += 1;
      void playCard(card).then(() => {
        playing = false;
        tryPlayNext();
      });
      return;
    }
  };

  const rootMargin = "0px 0px -12% 0px";
  cards.forEach((card) => {
    if (card.classList.contains("is-revealed")) return;
    if (isPastRevealStart(card, 88)) {
      ready.add(card);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          ready.add(card);
          observer.disconnect();
          tryPlayNext();
        });
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(card);
    observers.push(observer);
  });

  tryPlayNext();

  return () => {
    cancelled = true;
    observers.forEach((observer) => observer.disconnect());
    gsap.killTweensOf(cards);
  };
}
