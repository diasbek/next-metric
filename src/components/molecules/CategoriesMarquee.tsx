"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type CategoriesMarqueeProps = {
  images: readonly string[];
};

function CardStrip({
  images,
  keyPrefix,
  inert,
}: {
  images: readonly string[];
  keyPrefix: string;
  inert?: boolean;
}) {
  return (
    <div className="metric-categories__seq" aria-hidden={inert || undefined}>
      {images.map((src, index) => (
        <div key={`${keyPrefix}-${src}-${index}`} className="metric-categories__card">
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="320px"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

const AUTO_SCROLL_PX_PER_SEC = 34;
const RESUME_AFTER_MS = 1200;

/**
 * Drives the infinite loop by nudging the track's real `scrollLeft` on a
 * rAF loop and wrapping it once a full sequence has passed — NOT a CSS
 * `transform: translate` keyframe on a duplicated track. That older
 * approach fought with the browser's own touch/drag scrolling (nothing
 * responded to a swipe, so cards could look like they were bunching up
 * mid-gesture) and needed a brittle `:hover`-based pause that could get
 * stuck on touch. Because this is a genuine scroll container, a finger
 * drag or mouse wheel just scrolls it natively — we only need to pause our
 * own nudging while that's happening and resume a moment after it ends.
 *
 * iOS Safari keeps gliding on momentum well after the finger lifts, so a
 * fixed "resume N ms after pointerup" timer isn't enough — the rAF loop
 * would start forcing scrollLeft again while the browser is still
 * decelerating, fighting it and producing a stutter/jump. Instead, every
 * native `scroll` event that happens *while paused* (i.e. one we didn't
 * cause ourselves) pushes the resume timer back out, so we only resume
 * once scrolling has actually gone quiet.
 */
function useAutoScrollLoop(trackRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let lastTime = 0;
    let loopWidth = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      // Two identical sequences back to back — half of the scrollable width
      // is exactly one full loop.
      loopWidth = track.scrollWidth / 2;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const tick = (time: number) => {
      if (lastTime && !paused && loopWidth > 0) {
        const dt = time - lastTime;
        let next = track.scrollLeft + (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
        if (next >= loopWidth) next -= loopWidth;
        track.scrollLeft = next;
      }
      lastTime = time;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const scheduleResume = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        resumeTimer = null;
        lastTime = 0;
        paused = false;
      }, RESUME_AFTER_MS);
    };
    const pause = () => {
      paused = true;
      scheduleResume();
    };
    const onNativeScroll = () => {
      // Only a user/momentum-driven scroll gets here — while we're
      // auto-scrolling ourselves `paused` is false, so our own writes to
      // scrollLeft don't re-trigger this and fight the timer.
      if (paused) scheduleResume();
    };

    track.addEventListener("pointerdown", pause);
    track.addEventListener("wheel", pause, { passive: true });
    track.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (resumeTimer) clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("wheel", pause);
      track.removeEventListener("scroll", onNativeScroll);
    };
  }, [trackRef]);
}

export function CategoriesMarquee({ images }: CategoriesMarqueeProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const trackRef = useRef<HTMLDivElement>(null);

  useAutoScrollLoop(trackRef);

  if (reducedMotion) {
    return (
      <div className="metric-categories__track-wrap" data-reveal>
        <div className="metric-categories__track">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="metric-categories__card">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="320px"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="metric-categories__track-wrap metric-categories__track-wrap--marquee"
      data-reveal
    >
      <div ref={trackRef} className="metric-categories__track metric-categories__track--marquee">
        <CardStrip images={images} keyPrefix="a" />
        <CardStrip images={images} keyPrefix="b" inert />
      </div>
    </div>
  );
}
