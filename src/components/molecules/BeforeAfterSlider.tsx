"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MediaImage } from "@/components/atoms/MediaImage";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  compareAriaLabel: string;
}

function updateSliderPosition(root: HTMLElement, pct: number) {
  const clamped = Math.max(0, Math.min(100, pct));
  const overlay = root.querySelector<HTMLElement>("[data-ba-overlay]");
  const handle = root.querySelector<HTMLElement>("[data-ba-handle]");
  const input = root.querySelector<HTMLInputElement>("[data-ba-input]");

  // Keep both images full-frame; reveal by clipping — never shrink the image box.
  if (overlay) {
    overlay.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
  }
  if (handle) handle.style.left = `${clamped}%`;
  if (input) input.value = String(clamped);
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  compareAriaLabel,
}: BeforeAfterSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root) updateSliderPosition(root, 50);
  }, []);

  return (
    <div ref={rootRef} data-before-after data-no-section-snap className="case-slider">
      <div className="case-slider__frame">
        <MediaImage
          src={afterImage}
          alt={afterLabel}
          fill
          className="case-slider__image object-cover"
          sizes="(max-width: 1512px) 100vw, (max-width: 3840px) 92vw, 3840px"
          quality={85}
        />
        <div data-ba-overlay className="case-slider__before">
          <MediaImage
            src={beforeImage}
            alt={beforeLabel}
            fill
            className="case-slider__image object-cover"
            sizes="(max-width: 1512px) 100vw, (max-width: 3840px) 92vw, 3840px"
            quality={85}
          />
        </div>

        <div data-ba-handle className="case-slider__handle">
          <span className="case-slider__handle-line" aria-hidden />
          <span className="case-slider__handle-knob" aria-hidden>
            <Image
              src="/images/decor/ba-handle-knob.svg"
              alt=""
              width={48}
              height={48}
              className="case-slider__handle-icon"
              aria-hidden
            />
          </span>
        </div>

        <input
          data-ba-input
          type="range"
          min={0}
          max={100}
          defaultValue={50}
          onChange={(event) => {
            const root = rootRef.current;
            if (root) updateSliderPosition(root, Number(event.target.value));
          }}
          aria-label={compareAriaLabel}
          className="case-slider__input"
        />
      </div>

      <span className="case-slider__label case-slider__label--before">
        {beforeLabel}
      </span>
      <span className="case-slider__label case-slider__label--after">
        {afterLabel}
      </span>
    </div>
  );
}
