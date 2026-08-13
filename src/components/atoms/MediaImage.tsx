"use client";

import Image, { type ImageProps } from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

export type MediaImageProps = ImageProps & {
  /** Photo skeleton. Off for transparent / blend-mode assets. */
  skeleton?: boolean;
};

function isDecoded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

export function MediaImage({
  alt,
  className = "",
  fill,
  loading,
  onError,
  onLoad,
  priority,
  skeleton = true,
  src,
  ...rest
}: MediaImageProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<ImageProps["src"] | null>(null);
  const loaded = loadedSrc === src;

  useLayoutEffect(() => {
    const img = rootRef.current?.querySelector("img");
    if (img && isDecoded(img)) setLoadedSrc(src);
  }, [src]);

  const showSkeleton = skeleton && !loaded;

  return (
    <span
      ref={rootRef}
      className={`media-image${fill ? " media-image--fill" : ""}${loaded ? " is-loaded" : ""}`}
    >
      {skeleton ? (
        <span
          className="media-image__skeleton"
          aria-hidden
          data-visible={showSkeleton ? "true" : "false"}
        />
      ) : null}
      <Image
        {...rest}
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        priority={priority}
        loading={priority ? undefined : (loading ?? "lazy")}
        onLoad={(event) => {
          setLoadedSrc(src);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoadedSrc(src);
          onError?.(event);
        }}
      />
    </span>
  );
}
