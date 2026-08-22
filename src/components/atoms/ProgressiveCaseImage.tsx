"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaImage, type MediaImageProps } from "@/components/atoms/MediaImage";
import {
  CASE_GALLERY_PREVIEW_SIZES,
  CASE_GALLERY_SIZES,
} from "@/data/case-image-meta";

type ProgressiveCaseImageProps = Omit<MediaImageProps, "quality" | "sizes"> & {
  /** Fast first paint — smaller file from the image optimizer. */
  previewQuality?: number;
  previewSizes?: string;
  /** Final gallery quality once the preview is visible. */
  quality?: number;
  sizes?: string;
};

function isDecoded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

function useImageReady(
  rootRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  onReady: () => void,
) {
  useEffect(() => {
    if (!enabled) return;

    const img = rootRef.current?.querySelector("img");
    if (!img) return;

    if (isDecoded(img)) {
      onReady();
      return;
    }

    const markReady = () => onReady();
    img.addEventListener("load", markReady);
    img.addEventListener("error", markReady);
    return () => {
      img.removeEventListener("load", markReady);
      img.removeEventListener("error", markReady);
    };
  }, [enabled, onReady, rootRef]);
}

export function ProgressiveCaseImage({
  previewQuality = 50,
  previewSizes = CASE_GALLERY_PREVIEW_SIZES,
  quality = 90,
  sizes = CASE_GALLERY_SIZES,
  className = "",
  onLoad,
  skeleton = false,
  priority,
  ...rest
}: ProgressiveCaseImageProps) {
  const previewRef = useRef<HTMLSpanElement>(null);
  const fullRef = useRef<HTMLSpanElement>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  const markPreviewReady = useCallback(() => setPreviewReady(true), []);
  const markFullReady = useCallback(() => setFullReady(true), []);

  useImageReady(previewRef, !previewReady, markPreviewReady);
  useImageReady(fullRef, previewReady && !fullReady, markFullReady);

  return (
    <span
      className={`progressive-case-image${fullReady ? " is-full" : ""}`.trim()}
    >
      {!fullReady ? (
        <span ref={previewRef} className="progressive-case-image__preview">
          <MediaImage
            {...rest}
            priority={priority}
            quality={previewQuality}
            sizes={previewSizes}
            className={className}
            skeleton={skeleton}
            onLoad={() => markPreviewReady()}
          />
        </span>
      ) : null}
      {previewReady ? (
        <span ref={fullRef} className="progressive-case-image__full">
          <MediaImage
            {...rest}
            quality={quality}
            sizes={sizes}
            className={className}
            skeleton={false}
            loading={priority ? undefined : "lazy"}
            onLoad={(event) => {
              markFullReady();
              onLoad?.(event);
            }}
          />
        </span>
      ) : null}
    </span>
  );
}
