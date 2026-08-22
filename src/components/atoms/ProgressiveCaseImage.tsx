"use client";

import { useState } from "react";
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

export function ProgressiveCaseImage({
  previewQuality = 50,
  previewSizes = CASE_GALLERY_PREVIEW_SIZES,
  quality = 90,
  sizes = CASE_GALLERY_SIZES,
  className = "",
  onLoad,
  skeleton = true,
  priority,
  ...rest
}: ProgressiveCaseImageProps) {
  const [previewReady, setPreviewReady] = useState(false);
  const [fullReady, setFullReady] = useState(false);

  return (
    <span
      className={`progressive-case-image${fullReady ? " is-full" : ""}`.trim()}
    >
      <MediaImage
        {...rest}
        priority={priority}
        quality={previewQuality}
        sizes={previewSizes}
        className={`progressive-case-image__preview ${className}`.trim()}
        skeleton={false}
        aria-hidden={fullReady}
        onLoad={() => setPreviewReady(true)}
      />
      {previewReady ? (
        <MediaImage
          {...rest}
          quality={quality}
          sizes={sizes}
          className={`progressive-case-image__full ${className}`.trim()}
          skeleton={skeleton && !fullReady}
          loading={priority ? undefined : "lazy"}
          onLoad={(event) => {
            setFullReady(true);
            onLoad?.(event);
          }}
        />
      ) : null}
    </span>
  );
}
