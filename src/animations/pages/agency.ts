import {
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
  scheduleScrollTriggerRefresh,
} from "../gsap";

export function initAgencyAnimations(): () => void {
  registerGsapPlugins();

  return runMatchMedia(MOTION_OK, () => {
    const track = document.querySelector<HTMLElement>("[data-testimonials-track]");
    if (!track) return;

    const tween = gsap.fromTo(
      track,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: track, start: "top 85%", once: true },
        onComplete: () => scheduleScrollTriggerRefresh(),
      },
    );

    return () => tween.kill();
  });
}
