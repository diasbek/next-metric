import { MediaImage } from "@/components/atoms/MediaImage";
import { getCaseImageMeta } from "@/data/case-image-meta";
import { VJM_STORE_FRAMES } from "@/data/vjm-store-frames";

export function VjmStoreCaseBody() {
  return (
    <div className="vjm-case">
      {VJM_STORE_FRAMES.map((frame, index) => {
        const { width, height } = getCaseImageMeta(frame.src);
        return (
          <figure key={frame.src} className="vjm-case__frame">
            <MediaImage
              src={frame.src}
              alt={frame.alt}
              width={width}
              height={height}
              className="vjm-case__img"
              priority={index === 0}
              unoptimized
              skeleton={false}
            />
          </figure>
        );
      })}
    </div>
  );
}
