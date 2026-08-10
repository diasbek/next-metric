import { gsap } from "./gsap";

/**
 * Figma progressive-blur cycle — node 2036:112 (Vector) in Metric file.
 * timelineDurationMs = 2000; positions = timelinePosition / 8_000_000 * 2s.
 * Site plays at half speed (4s one-way / 8s yoyo round-trip).
 */
export const BLUR_CYCLE_DURATION = 2;
export const BLUR_CYCLE_TIME_SCALE = 0.5;
export const BLUR_CYCLE_EASE = "power1.inOut"; // ≈ cubic-bezier(0.5, 0, 0.5, 1)

export type BlurTrackKey = { t: number; v: number };

/** START_OFFSET_X */
export const BLUR_START_X: BlurTrackKey[] = [
  { t: 0, v: 0.2703045606613159 },
  { t: 0.67222675, v: 0.8219264149665833 },
  { t: 0.99416175, v: 0.046438492834568024 },
  { t: 1.33277725, v: 0.05481836944818497 },
  { t: 1.66805675, v: 0.7412700653076172 },
  { t: 2, v: 0.6550271511077881 },
];

/** START_OFFSET_Y */
export const BLUR_START_Y: BlurTrackKey[] = [
  { t: 0, v: 0.02864259108901024 },
  { t: 0.67222675, v: 0.14124003052711487 },
  { t: 0.99416175, v: 0.07175905257463455 },
  { t: 1.33277725, v: 0.7996008396148682 },
  { t: 1.66805675, v: 0.7734031081199646 },
  { t: 2, v: 0.20274779200553894 },
];

/** END_OFFSET_X */
export const BLUR_END_X: BlurTrackKey[] = [
  { t: 0, v: -0.4818348288536072 },
  { t: 0.3352795, v: 0.24860306084156036 },
  { t: 0.67222675, v: 0.8111023902893066 },
  { t: 0.99416175, v: 0.8704598546028137 },
  { t: 1.33277725, v: 0.9699708819389343 },
  { t: 1.66805675, v: 0 },
  { t: 2, v: -0.32751357555389404 },
];

/** END_OFFSET_Y */
export const BLUR_END_Y: BlurTrackKey[] = [
  { t: 0, v: 1.3094592094421387 },
  { t: 0.3352795, v: 1.2563529014587402 },
  { t: 0.67222675, v: 1.300775170326233 },
  { t: 0.99416175, v: 1.1777596473693848 },
  { t: 1.33277725, v: 0.3086778223514557 },
  { t: 1.66805675, v: 0.4988962411880493 },
  { t: 2, v: 2.5389034748077393 },
];

export type BlurProxy = { sx: number; sy: number; ex: number; ey: number };

export type BlurSpace = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BlurGradSet = {
  sharp: SVGLinearGradientElement | null;
  heavy: SVGLinearGradientElement | null;
  mid: SVGLinearGradientElement | null;
  light: SVGLinearGradientElement | null;
};

function setGrad(
  el: SVGLinearGradientElement | null,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  if (!el) return;
  el.setAttribute("x1", String(x1));
  el.setAttribute("y1", String(y1));
  el.setAttribute("x2", String(x2));
  el.setAttribute("y2", String(y2));
}

/** Map Figma START/END offsets onto mask gradients in user space. */
export function applyBlurOffsets(
  grads: BlurGradSet,
  p: BlurProxy,
  space: BlurSpace,
) {
  // SoftFadeStops: white@0% → black@100%. Figma progressive blur is stronger
  // toward END_OFFSET (left-soft / right-sharp at t=0), so put END at x1.
  const x1 = space.x + p.ex * space.width;
  const y1 = space.y + p.ey * space.height;
  const x2 = space.x + p.sx * space.width;
  const y2 = space.y + p.sy * space.height;

  setGrad(grads.sharp, x1, y1, x2, y2);
  setGrad(grads.heavy, x1, y1, x2, y2);
  setGrad(grads.mid, x1, y1, x2, y2);
  setGrad(grads.light, x1, y1, x2, y2);
}

function addTrack(
  tl: gsap.core.Timeline,
  proxy: BlurProxy,
  prop: keyof BlurProxy,
  keys: BlurTrackKey[],
) {
  keys.forEach((key, i) => {
    if (i === 0) {
      proxy[prop] = key.v;
      return;
    }
    const prev = keys[i - 1];
    tl.to(
      proxy,
      {
        [prop]: key.v,
        duration: Math.max(key.t - prev.t, 0.001),
        ease: BLUR_CYCLE_EASE,
      },
      prev.t,
    );
  });
}

export function createBlurProxy(): BlurProxy {
  return {
    sx: BLUR_START_X[0].v,
    sy: BLUR_START_Y[0].v,
    ex: BLUR_END_X[0].v,
    ey: BLUR_END_Y[0].v,
  };
}

/** Forward + yoyo loop of the Figma progressive-blur tracks. */
export function buildBlurCycleTimeline(
  proxy: BlurProxy,
  onUpdate: () => void,
): gsap.core.Timeline {
  // Single timeline onUpdate — avoids painting 4× per tick from parallel tracks.
  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    paused: true,
    defaults: { ease: BLUR_CYCLE_EASE },
    onUpdate,
  });

  addTrack(tl, proxy, "sx", BLUR_START_X);
  addTrack(tl, proxy, "sy", BLUR_START_Y);
  addTrack(tl, proxy, "ex", BLUR_END_X);
  addTrack(tl, proxy, "ey", BLUR_END_Y);

  if (tl.duration() < BLUR_CYCLE_DURATION) {
    tl.to({}, { duration: BLUR_CYCLE_DURATION - tl.duration() }, tl.duration());
  }

  tl.timeScale(BLUR_CYCLE_TIME_SCALE);
  onUpdate();
  return tl;
}

export function queryBlurGrads(
  root: ParentNode,
  attr: string,
): BlurGradSet {
  return {
    sharp: root.querySelector<SVGLinearGradientElement>(
      `[${attr}="sharp"]`,
    ),
    heavy: root.querySelector<SVGLinearGradientElement>(
      `[${attr}="heavy"]`,
    ),
    mid: root.querySelector<SVGLinearGradientElement>(`[${attr}="mid"]`),
    light: root.querySelector<SVGLinearGradientElement>(
      `[${attr}="light"]`,
    ),
  };
}
