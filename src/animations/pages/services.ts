import {
  CLEAR_MOTION_PROPS,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
} from "../gsap";

export function initServicesAnimations(): () => void {
  registerGsapPlugins();

  return runMatchMedia(MOTION_OK, () => {
    const items = document.querySelectorAll<HTMLElement>("[data-service-item]");
    if (!items.length) return;

    const tween = gsap.fromTo(
      items,
      { autoAlpha: 0, x: -24 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: CLEAR_MOTION_PROPS,
        scrollTrigger: {
          trigger: items[0]?.parentElement ?? items[0],
          start: "top 82%",
          once: true,
        },
      },
    );

    return () => tween.kill();
  });
}
