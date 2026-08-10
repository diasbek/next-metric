import { Flip } from "gsap/Flip";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "./gsap";
import { resetScrollPosition, resetScrollPositionAfterPaint } from "@/utils/scroll";

const FLIP_SELECTOR =
  "[data-flip-id], [data-header-logo-mark], [data-page-transition-root]";

let transitioning = false;
let pendingEnterTransition = false;
let pendingFlipState: ReturnType<typeof Flip.getState> | null = null;
let activeTweens: gsap.core.Animation[] = [];

// GSAP supports onKill at runtime; it is omitted from CallbackType in the bundled types.
const TWEEN_ON_KILL = "onKill" as gsap.CallbackType;

function getTransitionRoot(): HTMLElement | null {
  return document.querySelector("[data-page-transition-root]");
}

function clearTransitionRootStyles(): void {
  const root = getTransitionRoot();
  if (root) {
    gsap.set(root, { clearProps: "opacity,visibility,transform" });
  }
}

function trackTween(animation: gsap.core.Animation): gsap.core.Animation {
  activeTweens.push(animation);
  animation.eventCallback(TWEEN_ON_KILL, () => {
    activeTweens = activeTweens.filter((t) => t !== animation);
  });
  return animation;
}

/** Kill running tweens without discarding pending enter / FLIP state. */
export function killTransitionTweens(): void {
  activeTweens.forEach((t) => t.kill());
  activeTweens = [];
  transitioning = false;
}

export function resetPageTransition(): void {
  killTransitionTweens();
  pendingEnterTransition = false;
  pendingFlipState = null;
  clearTransitionRootStyles();
}

export function isTransitioning(): boolean {
  return transitioning;
}

export function captureTransitionState() {
  registerGsapPlugins();
  const targets = document.querySelectorAll<HTMLElement>(FLIP_SELECTOR);
  if (!targets.length) return null;
  return Flip.getState(targets);
}

export function stashTransitionState(state: ReturnType<typeof Flip.getState> | null): void {
  pendingFlipState = state;
}

export function playExitTransition(): Promise<void> {
  if (prefersReducedMotion()) return Promise.resolve();

  const root = getTransitionRoot();
  if (!root) return Promise.resolve();

  transitioning = true;
  pendingEnterTransition = true;

  return new Promise((resolve) => {
    trackTween(
      gsap.to(root, {
        autoAlpha: 0,
        y: 24,
        duration: 0.35,
        ease: "power2.in",
        onComplete: resolve,
      }),
    ).eventCallback(TWEEN_ON_KILL, resolve);
  });
}

export function playEnterTransition(): Promise<void> {
  try {
    if (prefersReducedMotion()) {
      resetPageTransition();
      return Promise.resolve();
    }

    const root = getTransitionRoot();
    const state = pendingFlipState;
    const shouldFadeRoot = pendingEnterTransition;
    pendingFlipState = null;
    pendingEnterTransition = false;

    const tasks: Promise<void>[] = [];

    if (state) {
      const liveTargets = document.querySelectorAll<HTMLElement>(FLIP_SELECTOR);
      if (liveTargets.length) {
        tasks.push(
          new Promise((resolve) => {
            trackTween(
              Flip.from(state, {
                targets: liveTargets,
                duration: 0.55,
                ease: "power2.inOut",
                absolute: true,
                nested: true,
                prune: true,
                clearProps: "transform,width,height,top,left,right,bottom,position",
                onComplete: resolve,
              }),
            );
          }),
        );
      }
    }

    if (root && shouldFadeRoot) {
      gsap.set(root, { autoAlpha: 0, y: 20 });
      tasks.push(
        new Promise((resolve) => {
          trackTween(
            gsap.to(root, {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              delay: state ? 0.08 : 0,
              ease: "power3.out",
              clearProps: "opacity,transform,visibility",
              onComplete: resolve,
              onInterrupt: resolve,
            }),
          );
        }),
      );
    } else {
      clearTransitionRootStyles();
    }

    return Promise.all(tasks).then(() => {
      transitioning = false;
      clearTransitionRootStyles();
      resetScrollPositionAfterPaint();
    });
  } catch {
    resetPageTransition();
    return Promise.resolve();
  }
}

export async function navigateWithTransition(
  _href: string,
  navigate: () => void,
): Promise<void> {
  if (transitioning) return;

  if (prefersReducedMotion()) {
    navigate();
    resetScrollPositionAfterPaint();
    return;
  }

  const state = captureTransitionState();
  stashTransitionState(state);
  await playExitTransition();
  resetScrollPosition();
  navigate();
  resetScrollPositionAfterPaint();
}
