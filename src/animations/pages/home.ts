import {
  CLEAR_MOTION_PROPS,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
} from "../gsap";

export function initHomeAnimations(): () => void {
  registerGsapPlugins();

  const revertLines = runMatchMedia(MOTION_OK, () => {
    const lines = document.querySelectorAll<HTMLElement>("[data-hero-services] span");
    if (!lines.length) return;

    const tween = gsap.fromTo(
      lines,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.45,
        ease: "power3.out",
        clearProps: CLEAR_MOTION_PROPS,
      },
    );

    return () => tween.kill();
  });

  return () => {
    revertLines();
  };
}
