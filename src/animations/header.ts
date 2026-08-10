import {
  CLEAR_MOTION_PROPS,
  DESKTOP_MQ,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  runMatchMedia,
  ScrollTrigger,
} from "./gsap";

export function initHeaderAnimations(): () => void {
  registerGsapPlugins();
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const nav = document.querySelector<HTMLElement>(".site-nav--header");
  if (!header) return () => {};

  const revertMotion = runMatchMedia(MOTION_OK, () => {
    if (nav) {
      gsap.fromTo(
        nav.children,
        { autoAlpha: 0, y: -12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          delay: 0.2,
          ease: "power2.out",
          clearProps: CLEAR_MOTION_PROPS,
        },
      );
    }

    document
      .querySelectorAll<HTMLElement>(".site-nav__link--active.site-nav__link--header")
      .forEach((link) => {
        gsap.fromTo(
          link,
          { "--nav-line": 0 },
          {
            "--nav-line": 1,
            duration: 0.5,
            ease: "power2.out",
          },
        );
      });
  });

  const revertDesktop = runMatchMedia(`${MOTION_OK} and ${DESKTOP_MQ}`, () => {
    if (header.dataset.headerVariant === "hero") {
      return () => {};
    }

    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top -80",
      onUpdate(self) {
        header.classList.toggle("is-scrolled", self.progress > 0);
      },
    });

    return () => {
      header.classList.remove("is-scrolled");
    };
  });

  return () => {
    revertMotion();
    revertDesktop();
  };
}
