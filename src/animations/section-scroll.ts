import { Observer } from "gsap/Observer";
import {
  DESKTOP_MQ,
  gsap,
  MOTION_OK,
  registerGsapPlugins,
} from "./gsap";

const SECTION_TOLERANCE = 8;

function getHeroScrollDistance() {
  return window.innerWidth >= 1024 ? 820 : 560;
}

function getHeaderOffset() {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  return Number.parseFloat(value) || 0;
}

function getSections(root: ParentNode) {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-scroll-section]"),
  );
}

function getSectionTop(section: HTMLElement) {
  return section.getBoundingClientRect().top + window.scrollY;
}

function getActiveIndex(sections: HTMLElement[]) {
  if (!sections.length) return 0;

  const marker = window.scrollY + getHeaderOffset() + SECTION_TOLERANCE;
  let active = 0;

  sections.forEach((section, index) => {
    if (getSectionTop(section) <= marker) {
      active = index;
    }
  });

  return active;
}

function isMenuOpen() {
  return Boolean(
    document.querySelector<HTMLElement>(
      ".site-header__menu-btn[aria-expanded='true']",
    ),
  );
}

function isInteractiveZone(target?: EventTarget | null): boolean {
  if (document.querySelector(".agency-testimonials__swiper.swiper-dragging")) {
    return true;
  }
  if (document.querySelector(".ui-select.is-open")) return true;

  const focus = document.activeElement;
  if (
    focus instanceof Element &&
    focus.closest(".contact-form, textarea, input, select, [contenteditable='true']")
  ) {
    return true;
  }

  const el = target instanceof Element ? target : null;
  if (!el) return false;

  return Boolean(
    el.closest(
      "[data-no-section-snap], [data-before-after], [data-mobile-menu], .contact-form, .faq-accordion, .ui-select, .agency-testimonials__swiper, [data-hero-section]",
    ),
  );
}

function isHeroFreeScroll(sections: HTMLElement[], activeIndex: number) {
  const hero = sections[0];
  if (!hero?.hasAttribute("data-hero-section")) return false;
  if (activeIndex !== 0) return false;
  return window.scrollY < getHeroScrollDistance() - SECTION_TOLERANCE;
}

export function initSectionScroll(): () => void {
  registerGsapPlugins();

  const root = document.querySelector("[data-scroll-sections]");
  if (!root) return () => {};

  let locked = false;
  let scrollTween: gsap.core.Tween | null = null;
  let observer: Observer | null = null;
  let wheelHandler: ((event: WheelEvent) => void) | null = null;
  let keyHandler: ((event: KeyboardEvent) => void) | null = null;

  const unlock = () => {
    locked = false;
    scrollTween = null;
  };

  const scrollToIndex = (sections: HTMLElement[], index: number) => {
    const target = sections[index];
    if (!target || locked) return;

    scrollTween?.kill();
    locked = true;
    scrollTween = gsap.to(window, {
      scrollTo: {
        y: Math.max(0, getSectionTop(target) - getHeaderOffset()),
        autoKill: true,
      },
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: unlock,
      onInterrupt: unlock,
    });
  };

  const navigate = (direction: 1 | -1, target?: EventTarget | null) => {
    if (locked || isMenuOpen() || isInteractiveZone(target)) return;

    const sections = getSections(root);
    if (sections.length < 2) return;

    const active = getActiveIndex(sections);
    const current = sections[active];
    if (!current) return;

    if (isHeroFreeScroll(sections, active)) return;

    const rect = current.getBoundingClientRect();

    if (direction > 0) {
      if (rect.bottom > window.innerHeight + SECTION_TOLERANCE) return;
      if (active >= sections.length - 1) return;
      scrollToIndex(sections, active + 1);
      return;
    }

    if (rect.top < -SECTION_TOLERANCE) return;
    if (active <= 0) return;
    scrollToIndex(sections, active - 1);
  };

  const mm = gsap.matchMedia();

  mm.add(`${MOTION_OK} and ${DESKTOP_MQ}`, () => {
    observer = Observer.create({
      type: "touch,pointer",
      tolerance: 80,
      onUp: (self) => navigate(-1, self.target),
      onDown: (self) => navigate(1, self.target),
    });

    wheelHandler = (event: WheelEvent) => {
      if (locked || isMenuOpen() || isInteractiveZone(event.target)) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const sections = getSections(root);
      if (sections.length < 2) return;

      const active = getActiveIndex(sections);
      const current = sections[active];
      if (!current) return;

      if (isHeroFreeScroll(sections, active)) return;

      const rect = current.getBoundingClientRect();
      let shouldSnap = false;

      if (direction > 0) {
        shouldSnap =
          rect.bottom <= window.innerHeight + SECTION_TOLERANCE &&
          active < sections.length - 1;
      } else {
        shouldSnap =
          rect.top >= -SECTION_TOLERANCE && active > 0;
      }

      if (!shouldSnap) return;

      event.preventDefault();
      navigate(direction, event.target);
    };

    keyHandler = (event: KeyboardEvent) => {
      if (isInteractiveZone(event.target)) return;
      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "PageDown" &&
        event.key !== "PageUp"
      ) {
        return;
      }

      const sections = getSections(root);
      if (sections.length < 2) return;

      const active = getActiveIndex(sections);
      const current = sections[active];
      if (!current) return;

      const direction =
        event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;

      if (isHeroFreeScroll(sections, active)) return;

      const rect = current.getBoundingClientRect();
      const canSnapDown =
        direction > 0 &&
        rect.bottom <= window.innerHeight + SECTION_TOLERANCE &&
        active < sections.length - 1;
      const canSnapUp =
        direction < 0 &&
        rect.top >= -SECTION_TOLERANCE &&
        active > 0;

      if (!canSnapDown && !canSnapUp) return;

      event.preventDefault();
      navigate(direction, event.target);
    };

    window.addEventListener("wheel", wheelHandler, { passive: false });
    window.addEventListener("keydown", keyHandler);

    return () => {
      observer?.kill();
      if (wheelHandler) {
        window.removeEventListener("wheel", wheelHandler);
      }
      if (keyHandler) {
        window.removeEventListener("keydown", keyHandler);
      }
    };
  });

  return () => {
    scrollTween?.kill();
    unlock();
    mm.revert();
  };
}
