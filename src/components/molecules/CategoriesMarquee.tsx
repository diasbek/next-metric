"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type CategoriesMarqueeProps = {
  images: string[];
};

function CardStrip({
  images,
  keyPrefix,
  inert,
}: {
  images: string[];
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

/**
 * Infinite horizontal card loop for the categories strip.
 * Two identical sequences + CSS translate(-50%) keep the seam invisible.
 * Falls back to a normal overflow scroller when reduced-motion is on.
 */
export function CategoriesMarquee({ images }: CategoriesMarqueeProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

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
      <div className="metric-categories__track metric-categories__track--marquee">
        <CardStrip images={images} keyPrefix="a" />
        <CardStrip images={images} keyPrefix="b" inert />
      </div>
    </div>
  );
}
