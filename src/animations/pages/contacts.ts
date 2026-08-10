import {
  DESKTOP_MQ,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
} from "../gsap";

export function initContactsAnimations(): () => void {
  registerGsapPlugins();
  const map = document.querySelector<HTMLElement>("[data-map-frame]");
  if (!map) return () => {};

  const revertReveal = runMatchMedia(MOTION_OK, () => {
    const tween = gsap.fromTo(
      map,
      { scale: 1.08, autoAlpha: 0.6 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: map, start: "top 85%", once: true },
      },
    );

    return () => tween.kill();
  });

  const revertParallax = runMatchMedia(`${MOTION_OK} and ${DESKTOP_MQ}`, () => {
    const tween = gsap.to(map, {
      y: -24,
      ease: "none",
      scrollTrigger: {
        trigger: map,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    return () => {
      tween.kill();
      gsap.set(map, { y: 0 });
    };
  });

  return () => {
    revertReveal();
    revertParallax();
  };
}
