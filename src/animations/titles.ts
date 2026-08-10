import { SplitText } from "gsap/SplitText";
import { gsap, MOTION_OK, registerGsapPlugins, runMatchMedia } from "./gsap";

export function initSplitTitles(): () => void {
  registerGsapPlugins();
  const splits: SplitText[] = [];

  return runMatchMedia(MOTION_OK, () => {
    document.querySelectorAll<HTMLElement>("[data-split-title]").forEach((el) => {
      const isHero = el.closest("[data-hero-section]") !== null;
      const isTouch = window.matchMedia("(max-width: 1023px), (hover: none), (pointer: coarse)").matches;

      if (isHero && isTouch) {
        gsap.set(el, { visibility: "visible" });
        return;
      }

      gsap.set(el, { visibility: "visible" });

      const split = SplitText.create(el, {
        type: "words",
        mask: "words",
        autoSplit: true,
        onSplit(self) {
          const isHero = el.closest("[data-hero-section]") !== null;
          return gsap.from(self.words, {
            // 100% avoids mask cropping descenders / cyrillic bottoms.
            yPercent: 100,
            duration: 0.85,
            ease: "power4.out",
            stagger: 0.045,
            delay: isHero ? 0.3 : 0.1,
            scrollTrigger: isHero
              ? undefined
              : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      splits.push(split);
    });

    return () => {
      splits.forEach((split) => split.revert());
      splits.length = 0;
    };
  });
}
