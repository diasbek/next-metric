import { initBeforeAfterSliders } from "./before-after";
import { initBlobAnimations } from "./blobs";
import {
  cancelScheduledScrollTriggerRefresh,
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  scheduleScrollTriggerRefresh,
  showAllRevealTargets,
} from "./gsap";
import { initHeaderAnimations } from "./header";
import { initHeroAnimations } from "./hero";
import { initHeroLogoPointer } from "./hero-logo-pointer";
import { initHeroLogoScroll } from "./hero-logo-scroll";
import { initWhyTPointer } from "./why-t-pointer";
import { initMenuAnimations } from "./menu";
import { initAgencyAnimations } from "./pages/agency";
import { initCaseStudyAnimations } from "./pages/case-study";
import { initContactsAnimations } from "./pages/contacts";
import { initHomeAnimations } from "./pages/home";
import { initServicesAnimations } from "./pages/services";
import { initWorksAnimations } from "./pages/works";
import { initGlobalReveals } from "./reveals";
import { initSplitTitles } from "./titles";

export { showAllRevealTargets } from "./gsap";

type Cleanup = () => void;

import { stripLocalePrefix } from "@/i18n/paths";

function getPageKey(pathname: string): string {
  const { path } = stripLocalePrefix(pathname);

  if (path === "/" || path === "") return "home";
  if (path.startsWith("/agency")) return "agency";
  if (path.match(/^\/works\/[^/]+/)) return "case-study";
  if (path.startsWith("/works")) return "works";
  if (path.startsWith("/services")) return "services";
  if (path.startsWith("/contacts")) return "contacts";
  if (path.startsWith("/404")) return "404";
  return "home";
}

export function initAnimations(pathname: string): Cleanup {
  if (typeof window === "undefined") return () => {};

  registerGsapPlugins();

  if (prefersReducedMotion()) {
    showAllRevealTargets();
    document
      .querySelectorAll<HTMLElement>('[data-site-header][data-header-variant="hero"]')
      .forEach((header) => {
        header.classList.add("is-scrolled", "is-logo-docked");
      });
    document
      .querySelectorAll<HTMLElement>("[data-hero-logo-asset]")
      .forEach((asset) => {
        asset.style.visibility = "hidden";
        asset.style.opacity = "0";
      });
    return () => {};
  }

  const cleanups: Cleanup[] = [];

  const ctx = gsap.context(() => {
    cleanups.push(initSplitTitles());
    cleanups.push(initGlobalReveals());
    cleanups.push(initHeaderAnimations());
    cleanups.push(initMenuAnimations());
    cleanups.push(initBlobAnimations());
    cleanups.push(initBeforeAfterSliders());

    const page = getPageKey(pathname);

    if (page === "home") {
      cleanups.push(initHeroAnimations());
      cleanups.push(initHeroLogoScroll());
      cleanups.push(initHeroLogoPointer());
      cleanups.push(initWhyTPointer());
      cleanups.push(initHomeAnimations());
    } else if (page === "agency") {
      cleanups.push(initAgencyAnimations());
      cleanups.push(initWhyTPointer());
    } else if (page === "works") {
      cleanups.push(initWorksAnimations());
    } else if (page === "case-study") {
      cleanups.push(initCaseStudyAnimations());
    } else if (page === "services") {
      cleanups.push(initServicesAnimations());
    } else if (page === "contacts") {
      cleanups.push(initContactsAnimations());
    }
  });

  requestAnimationFrame(() => scheduleScrollTriggerRefresh(0));

  const onLoad = () => scheduleScrollTriggerRefresh(0);
  window.addEventListener("load", onLoad);
  const resizeObserver = new ResizeObserver(() => scheduleScrollTriggerRefresh());
  resizeObserver.observe(document.body);

  return () => {
    cleanups.forEach((fn) => fn());
    ctx.revert();
    window.removeEventListener("load", onLoad);
    resizeObserver.disconnect();
    cancelScheduledScrollTriggerRefresh();
  };
}
