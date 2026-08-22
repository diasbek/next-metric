"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { MediaImage } from "@/components/atoms/MediaImage";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeMobileLayout(onStoreChange: () => void) {
  const mq = window.matchMedia("(max-width: 1023px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileLayout() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

type CategoriesMarqueeProps = {
  images: readonly string[];
};

function categoryAlt(index: number) {
  return `Amazon product listing photography example ${index + 1}`;
}

function StaticTrack({ images }: { images: readonly string[] }) {
  return (
    <div className="metric-categories__track-wrap">
      <div className="metric-categories__track">
        {images.map((src, index) => (
          <div key={`${src}-${index}`} className="metric-categories__card">
            <MediaImage
              src={src}
              alt={categoryAlt(index)}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 72vw, (max-width: 1799px) 320px, (max-width: 2559px) min(18vw, 520px), min(16vw, 640px)"
              quality={75}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

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
          <MediaImage
            src={src}
            alt={categoryAlt(index)}
            fill
            className="object-cover"
            sizes="(max-width: 767px) 72vw, (max-width: 1799px) 320px, (max-width: 2559px) min(18vw, 520px), min(16vw, 640px)"
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

/** Desktop-only auto loop via translate3d — phones use native horizontal scroll. */
function useAutoScrollLoop(
  trackRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

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
    let inView = false;

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
  }, [trackRef, enabled]);
}

export function CategoriesMarquee({ images }: CategoriesMarqueeProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const mobileLayout = useSyncExternalStore(
    subscribeMobileLayout,
    getMobileLayout,
    () => true,
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const useStaticTrack = reducedMotion || mobileLayout;

  useAutoScrollLoop(trackRef, !useStaticTrack);

  if (useStaticTrack) {
    return <StaticTrack images={images} />;
  }

  return (
    <div className="metric-categories__track-wrap metric-categories__track-wrap--marquee">
      <div ref={trackRef} className="metric-categories__track metric-categories__track--marquee">
        <CardStrip images={images} keyPrefix="a" />
        <CardStrip images={images} keyPrefix="b" inert />
      </div>
    </div>
  );
}
