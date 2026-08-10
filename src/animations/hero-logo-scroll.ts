import {
  gsap,
  MOTION_OK,
  registerGsapPlugins,
  ScrollTrigger,
} from "./gsap";

type LogoBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Above header bar (z-50), below header tools (z-90). */
const FLIGHT_Z_INDEX = 60;

/**
 * `.hero-logo__asset` bleed relative to `.hero-logo__frame`
 * (see globals.css `inset: -6% -3% -4%`).
 */
const ASSET_BLEED = {
  top: 0.06,
  right: 0.03,
  bottom: 0.04,
  left: 0.03,
} as const;

type MotionProfile = {
  handoffAt: number;
  arriveAt: number;
  motionEnd: number;
  verticalEnd: number;
  scaleEnd: number;
  scrolledAt: number;
  taglineFadeEnd: number;
  taglineHideAt: number;
};

const DESKTOP_PROFILE: MotionProfile = {
  handoffAt: 0.58,
  arriveAt: 0.9,
  motionEnd: 0.58,
  verticalEnd: 0.42,
  scaleEnd: 0.58,
  scrolledAt: 0.75,
  taglineFadeEnd: 0.3,
  taglineHideAt: 0.26,
};

/** Logo docks early so the hero title stays visible below the navbar. */
const MOBILE_PROFILE: MotionProfile = {
  handoffAt: 0.24,
  arriveAt: 0.34,
  motionEnd: 0.26,
  verticalEnd: 0.22,
  scaleEnd: 0.26,
  scrolledAt: 0.2,
  taglineFadeEnd: 0.1,
  taglineHideAt: 0.08,
};

function getMotionProfile(): MotionProfile {
  return window.innerWidth >= 1024 ? DESKTOP_PROFILE : MOBILE_PROFILE;
}

function verticalProgress(progress: number, profile: MotionProfile): number {
  return gsap.utils.clamp(0, 1, progress / profile.verticalEnd);
}

function scaleProgress(progress: number, profile: MotionProfile): number {
  return gsap.utils.clamp(0, 1, progress / profile.scaleEnd);
}

function motionProgress(progress: number, profile: MotionProfile): number {
  return gsap.utils.clamp(0, 1, progress / profile.motionEnd);
}

function snapPx(value: number): number {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

function readBounds(el: HTMLElement): LogoBounds {
  const rect = el.getBoundingClientRect();
  return {
    top: snapPx(rect.top),
    left: snapPx(rect.left),
    width: snapPx(rect.width),
    height: snapPx(rect.height),
  };
}

/** Map letter-frame bounds → bled asset box (absolute inset). */
function assetBoxFromLetter(letter: LogoBounds): LogoBounds {
  const left = letter.left - letter.width * ASSET_BLEED.left;
  const top = letter.top - letter.height * ASSET_BLEED.top;
  const width =
    letter.width * (1 + ASSET_BLEED.left + ASSET_BLEED.right);
  const height =
    letter.height * (1 + ASSET_BLEED.top + ASSET_BLEED.bottom);
  return {
    left: snapPx(left),
    top: snapPx(top),
    width: snapPx(width),
    height: snapPx(height),
  };
}

/** Inverse of `assetBoxFromLetter` — recover letter box from a flying asset. */
function letterBoundsFromAsset(asset: LogoBounds): LogoBounds {
  const width =
    asset.width / (1 + ASSET_BLEED.left + ASSET_BLEED.right);
  const height =
    asset.height / (1 + ASSET_BLEED.top + ASSET_BLEED.bottom);
  return {
    left: snapPx(asset.left + width * ASSET_BLEED.left),
    top: snapPx(asset.top + height * ASSET_BLEED.top),
    width: snapPx(width),
    height: snapPx(height),
  };
}

function getScrollDistance(): number {
  return window.innerWidth >= 1024 ? 820 : 560;
}

function lerpBounds(a: LogoBounds, b: LogoBounds, t: number): LogoBounds {
  const k = gsap.utils.clamp(0, 1, t);
  return {
    left: snapPx(a.left + (b.left - a.left) * k),
    top: snapPx(a.top + (b.top - a.top) * k),
    width: snapPx(a.width + (b.width - a.width) * k),
    height: snapPx(a.height + (b.height - a.height) * k),
  };
}

export function initHeroLogoScroll(): () => void {
  registerGsapPlugins();

  const header = document.querySelector<HTMLElement>(
    '[data-site-header][data-header-variant="hero"]',
  );
  const heroSection = document.querySelector<HTMLElement>("[data-hero-section]");
  const heroFrame = document.querySelector<HTMLElement>("[data-hero-logo-frame]");
  const heroAsset = document.querySelector<HTMLElement>("[data-hero-logo-asset]");
  const heroBlue = document.querySelector<HTMLElement>("[data-hero-logo-blue]");
  const heroWhite = document.querySelector<HTMLElement>("[data-hero-logo-white]");
  const headerLogo = header?.querySelector<HTMLElement>("[data-header-logo]");
  const tagline = header?.querySelector<HTMLElement>("[data-hero-tagline]");

  if (
    !header ||
    !heroSection ||
    !heroFrame ||
    !heroAsset ||
    !heroBlue ||
    !heroWhite ||
    !headerLogo ||
    !tagline
  ) {
    return () => {};
  }

  const heroTitle = document.querySelector<HTMLElement>(
    "[data-hero-section] [data-split-title]",
  );
  const hoverGlow = heroAsset.querySelector<HTMLElement>(
    "[data-hero-logo-brush]",
  );

  const headerLogoMark =
    headerLogo.querySelector<HTMLElement>("[data-header-logo-mark]") ?? headerLogo;

  let headerBounds: LogoBounds | null = null;
  let flyStartBounds: LogoBounds | null = null;
  /** Asset box at flight start — fixed size; motion uses x/y/scale only. */
  let flightBase: LogoBounds | null = null;
  let titleStartTop: number | null = null;
  let flightHost: HTMLElement | null = null;
  let flightNext: ChildNode | null = null;
  let isFlying = false;
  let trigger: ScrollTrigger | null = null;
  let isSwapped = false;
  let flyerShown = true;
  let lastScrolled = false;
  let lastTaglineHidden = false;
  let lastBlueOp = -1;
  let cachedProfile = getMotionProfile();
  let cachedScrollDistance = getScrollDistance();

  const setFlyingFlag = (on: boolean) => {
    heroAsset.classList.toggle("is-hero-logo-flying", on);
  };

  const hideFlyer = () => {
    heroAsset.classList.add("is-hero-logo-docked");
    setFlyingFlag(false);
    if (flyerShown) {
      gsap.set(heroAsset, {
        opacity: 0,
        visibility: "hidden",
        pointerEvents: "none",
      });
      flyerShown = false;
    }
    if (hoverGlow) {
      gsap.set(hoverGlow, { opacity: 0, visibility: "hidden", display: "none" });
    }
  };

  const showFlyer = () => {
    heroAsset.classList.remove("is-hero-logo-docked");
    if (!flyerShown) {
      gsap.set(heroAsset, {
        opacity: 1,
        visibility: "visible",
        pointerEvents: "none",
        zIndex: FLIGHT_Z_INDEX,
      });
      flyerShown = true;
    }
  };

  /** Compositor-friendly flight pose (x/y/scale, not top/left/width/height). */
  const placeAssetForLetter = (letter: LogoBounds) => {
    if (!flightBase) return;
    const box = assetBoxFromLetter(letter);
    gsap.set(heroAsset, {
      x: box.left,
      y: box.top,
      scaleX: box.width / flightBase.width,
      scaleY: box.height / flightBase.height,
      force3D: true,
    });
  };

  const lockFlightBase = (letter: LogoBounds) => {
    flightBase = assetBoxFromLetter(letter);
    gsap.set(heroAsset, {
      position: "fixed",
      top: 0,
      left: 0,
      width: flightBase.width,
      height: flightBase.height,
      x: flightBase.left,
      y: flightBase.top,
      scaleX: 1,
      scaleY: 1,
      margin: 0,
      inset: "auto",
      zIndex: FLIGHT_Z_INDEX,
      transformOrigin: "0% 0%",
      pointerEvents: "none",
      force3D: true,
    });
  };

  const mountFlightLayer = () => {
    if (flightHost) return;
    flightHost = heroAsset.parentElement;
    flightNext = heroAsset.nextSibling;
    document.body.appendChild(heroAsset);
  };

  const restoreFlightLayer = () => {
    if (!flightHost) return;

    if (flightNext && flightNext.parentNode === flightHost) {
      flightHost.insertBefore(heroAsset, flightNext);
    } else {
      flightHost.appendChild(heroAsset);
    }

    flightHost = null;
    flightNext = null;
  };

  const resetVisualState = () => {
    restoreFlightLayer();
    heroAsset.classList.remove("is-hero-logo-docked");
    setFlyingFlag(false);
    gsap.set(heroAsset, { clearProps: "all" });
    gsap.set(heroBlue, { clearProps: "opacity" });
    gsap.set(heroWhite, { clearProps: "opacity" });
    if (hoverGlow) {
      gsap.set(hoverGlow, { clearProps: "opacity,visibility,display" });
    }
    gsap.set(headerLogo, { clearProps: "opacity,visibility,pointerEvents" });
    gsap.set(tagline, { clearProps: "opacity,visibility" });
    header.classList.remove("is-scrolled", "is-logo-docked");
    isFlying = false;
    flyStartBounds = null;
    flightBase = null;
    titleStartTop = null;
    isSwapped = false;
    flyerShown = true;
    lastScrolled = false;
    lastTaglineHidden = false;
    lastBlueOp = -1;
  };

  const setRestChrome = () => {
    gsap.set(headerLogo, { opacity: 0, visibility: "hidden", pointerEvents: "none" });
    gsap.set(tagline, { opacity: 1, visibility: "visible" });
    gsap.set(heroBlue, { opacity: 1 });
    gsap.set(heroWhite, { opacity: 0 });
    header.classList.remove("is-scrolled", "is-logo-docked");
  };

  /** Measure dock slot without toggling header classes (no layout blink). */
  const measureTargets = () => {
    headerBounds = readBounds(headerLogoMark);
  };

  const enterFlight = () => {
    if (isFlying) return;

    gsap.killTweensOf(heroAsset);

    const alreadyMounted = heroAsset.parentElement === document.body;
    flyStartBounds = alreadyMounted
      ? letterBoundsFromAsset(readBounds(heroAsset))
      : readBounds(heroFrame);
    titleStartTop = heroTitle?.getBoundingClientRect().top ?? null;
    isFlying = true;
    setFlyingFlag(true);
    heroAsset.classList.remove("is-hero-logo-docked");
    if (hoverGlow) {
      gsap.set(hoverGlow, { opacity: 0, visibility: "hidden", display: "none" });
    }
    mountFlightLayer();

    lockFlightBase(flyStartBounds);
    showFlyer();
  };

  const dockInNavbar = () => {
    measureTargets();
    if (!headerBounds) return;

    // Hard cut: header mark takes over; flyer fully suppressed.
    hideFlyer();
    gsap.set(heroBlue, { opacity: 0 });
    gsap.set(heroWhite, { opacity: 0 });

    gsap.set(headerLogo, {
      opacity: 1,
      visibility: "visible",
      pointerEvents: "auto",
    });

    restoreFlightLayer();
    // Clear flight layout props only — keep flyer suppressed so it cannot
    // reappear under the docked navbar logo (esp. filter/compositor ghosts).
    gsap.set(heroAsset, {
      clearProps:
        "position,top,left,width,height,x,y,scale,scaleX,scaleY,margin,inset,zIndex,transformOrigin,transform,force3D",
    });
    hideFlyer();
    gsap.set(heroBlue, { opacity: 1 });
    gsap.set(heroWhite, { opacity: 0 });
    lastBlueOp = -1;

    // Asset is back in the hero tree, but keep flyStartBounds for scrub-reverse.
    isFlying = false;
    setFlyingFlag(false);
    header.classList.add("is-scrolled", "is-logo-docked");
    lastScrolled = true;
  };

  const undockFromNavbar = () => {
    gsap.set(headerLogo, { opacity: 0, visibility: "hidden", pointerEvents: "none" });
    header.classList.remove("is-logo-docked");
    isSwapped = false;

    if (!flyStartBounds) {
      enterFlight();
      return;
    }

    isFlying = true;
    setFlyingFlag(true);
    mountFlightLayer();
    // Re-lock after dock clearProps wiped fixed positioning.
    lockFlightBase(flyStartBounds);
    showFlyer();
  };

  const applyProgress = (progress: number) => {
    if (!headerBounds) return;

    const profile = cachedProfile;
    const p = gsap.utils.clamp(0, 1, progress);

    if (!isFlying) {
      if (p <= 0) {
        setRestChrome();
        return;
      }

      // Already docked past the handoff — keep flyer suppressed.
      if (isSwapped && p >= profile.arriveAt) {
        hideFlyer();
        return;
      }

      enterFlight();
    }

    if (!flyStartBounds || !headerBounds || !flightBase) return;

    const taglineHidden = p > profile.taglineHideAt;
    if (taglineHidden !== lastTaglineHidden) {
      gsap.set(tagline, {
        opacity: taglineHidden ? 0 : 1 - Math.min(p / profile.taglineFadeEnd, 1),
        visibility: taglineHidden ? "hidden" : "visible",
      });
      lastTaglineHidden = taglineHidden;
    } else if (!taglineHidden) {
      gsap.set(tagline, {
        opacity: 1 - Math.min(p / profile.taglineFadeEnd, 1),
      });
    }

    if (p >= profile.arriveAt) {
      if (!isSwapped) {
        dockInNavbar();
        isSwapped = true;
      } else {
        hideFlyer();
      }
      return;
    }

    if (isSwapped) {
      undockFromNavbar();
    }

    // Keep header logo invisible until the hard swap — avoids offset double-logo.
    const scrolled = p >= profile.scrolledAt;
    if (scrolled !== lastScrolled) {
      header.classList.toggle("is-scrolled", scrolled);
      lastScrolled = scrolled;
    }
    if (header.classList.contains("is-logo-docked")) {
      header.classList.remove("is-logo-docked");
    }

    const moveP = motionProgress(p, profile);
    const scaleP = scaleProgress(p, profile);
    const sizeP = scaleP;
    const yP = verticalProgress(moveP, profile);

    const targetLetter: LogoBounds = {
      left: snapPx(
        flyStartBounds.left + (headerBounds.left - flyStartBounds.left) * moveP,
      ),
      top: snapPx(
        flyStartBounds.top + (headerBounds.top - flyStartBounds.top) * yP,
      ),
      width: snapPx(
        flyStartBounds.width +
          (headerBounds.width - flyStartBounds.width) * sizeP,
      ),
      height: snapPx(
        flyStartBounds.height +
          (headerBounds.height - flyStartBounds.height) * sizeP,
      ),
    };

    if (titleStartTop !== null) {
      const titleTopNow = titleStartTop - p * cachedScrollDistance;
      const clearance = 24;
      const maxTop = titleTopNow - clearance - targetLetter.height;
      targetLetter.top = snapPx(Math.min(targetLetter.top, maxTop));
    }

    // Never fly above the navbar letter slot.
    targetLetter.top = snapPx(
      Math.max(targetLetter.top, headerBounds.top),
    );

    // Snap into the exact dock rect near the end (no crossfade drift).
    const settleT =
      p >= profile.handoffAt
        ? gsap.utils.mapRange(profile.handoffAt, profile.arriveAt, 0, 1, p)
        : 0;
    const letter =
      settleT > 0 ? lerpBounds(targetLetter, headerBounds, settleT) : targetLetter;

    placeAssetForLetter(letter);
    showFlyer();

    const blueOp = 1 - Math.max(scaleP, settleT);
    if (Math.abs(blueOp - lastBlueOp) > 0.01) {
      gsap.set(heroBlue, { opacity: blueOp });
      gsap.set(heroWhite, { opacity: 1 - blueOp });
      lastBlueOp = blueOp;
    }
  };

  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    gsap.set(headerLogo, { opacity: 0, visibility: "hidden", pointerEvents: "none" });
    gsap.set(tagline, { opacity: 1, visibility: "visible" });
    gsap.set(heroBlue, { opacity: 1 });
    gsap.set(heroWhite, { opacity: 0 });

    const setup = () => {
      if ((trigger?.progress ?? 0) > 0.001) return;
      measureTargets();
    };

    setup();
    gsap.delayedCall(1.2, setup);

    trigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: () => `+=${cachedScrollDistance}`,
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh(self) {
        cachedProfile = getMotionProfile();
        cachedScrollDistance = getScrollDistance();
        measureTargets();
        if (self.progress <= 0) return;
        if (trigger) applyProgress(self.progress);
      },
      onUpdate(self) {
        applyProgress(self.progress);
      },
      onLeaveBack() {
        resetVisualState();
        setRestChrome();
      },
    });

    const onResize = () => {
      cachedProfile = getMotionProfile();
      cachedScrollDistance = getScrollDistance();
      measureTargets();

      if ((trigger?.progress ?? 0) <= 0) {
        if (isFlying) {
          resetVisualState();
          setRestChrome();
        } else {
          // Layout may have changed — recapture start on next scroll.
          flyStartBounds = null;
          flightBase = null;
        }
        return;
      }

      // Keep the original flight origin; only retarget the dock slot.
      if (trigger) applyProgress(trigger.progress);
    };

    ScrollTrigger.addEventListener("refreshInit", onResize);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", onResize);
      trigger?.kill();
      resetVisualState();
    };
  });

  return () => mm.revert();
}
