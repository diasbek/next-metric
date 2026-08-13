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
            sizes="(max-width: 767px) 72vw, (max-width: 1799px) 320px, 420px"
            quality={75}
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
 * Infinite loop via `translate3d` on the track — not `scrollLeft`.
 * iOS Safari often ignores programmatic `scrollLeft` on nested overflow
 * containers (especially under a GSAP `data-reveal` transform), so the
 * marquee looked frozen on phones. Transform animation runs everywhere;
 * a finger/mouse drag pauses it, then it resumes after things go quiet.
 */
function useAutoScrollLoop(trackRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let lastTime = 0;
    let loopWidth = 0;
    let offset = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const seq = track.querySelector<HTMLElement>(".metric-categories__seq");
    const wrap = track.closest<HTMLElement>(".metric-categories__track-wrap");
    let inView = true;

    const measure = () => {
      loopWidth = seq?.offsetWidth ?? 0;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    if (seq) resizeObserver.observe(seq);

    const apply = () => {
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const tick = (time: number) => {
      if (lastTime && !paused && inView && loopWidth > 0) {
        const dt = Math.min(time - lastTime, 48);
        offset += (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
        if (offset >= loopWidth) offset -= loopWidth;
        apply();
      }
      lastTime = inView ? time : 0;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView) lastTime = 0;
      },
      { rootMargin: "80px" },
    );
    intersection.observe(wrap ?? track);

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

    track.addEventListener("pointerdown", pause);
    track.addEventListener("wheel", pause, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersection.disconnect();
      if (resumeTimer) clearTimeout(resumeTimer);
      track.style.transform = "";
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("wheel", pause);
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
                sizes="(max-width: 767px) 72vw, (max-width: 1799px) 320px, 420px"
                quality={75}
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
