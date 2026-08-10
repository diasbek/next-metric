import {
  DESKTOP_MQ,
  FINE_POINTER,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
} from "../gsap";

export function initCaseStudyAnimations(): () => void {
  registerGsapPlugins();

  return runMatchMedia(`${MOTION_OK} and ${DESKTOP_MQ} and ${FINE_POINTER}`, () => {
    const cards = document.querySelectorAll<HTMLElement>(
      ".case-study__next-grid [data-work-item]",
    );
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const onEnter = () => {
        gsap.to(card, { y: -6, duration: 0.35, ease: "power2.out" });
      };
      const onLeave = () => {
        gsap.to(card, { y: 0, duration: 0.35, ease: "power2.out" });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        gsap.set(card, { y: 0 });
      });
    });

    return () => cleanups.forEach((fn) => fn());
  });
}
