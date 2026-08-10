import {
  CLEAR_MOTION_PROPS,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
} from "./gsap";

export function initHeroAnimations(): () => void {
  registerGsapPlugins();

  return runMatchMedia(MOTION_OK, () => {
    const logo = document.querySelector<HTMLElement>("[data-hero-logo-blue]");
    if (logo) {
      gsap.fromTo(
        logo,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1.1,
          ease: "power3.out",
          clearProps: "opacity",
        },
      );
    }

    const cta = document.querySelector<HTMLElement>("[data-hero-cta]");
    if (cta) {
      gsap.fromTo(
        cta,
        { autoAlpha: 0, scale: 0.9 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.6,
          ease: "back.out(1.4)",
          clearProps: CLEAR_MOTION_PROPS,
        },
      );
    }
  });
}
