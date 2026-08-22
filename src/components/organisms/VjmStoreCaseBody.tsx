import { ProgressiveCaseImage } from "@/components/atoms/ProgressiveCaseImage";
import { getCaseImageMeta } from "@/data/case-image-meta";
import { VJM_STORE_FRAMES } from "@/data/vjm-store-frames";

export function VjmStoreCaseBody() {
  return (
    <div className="vjm-case">
      {VJM_STORE_FRAMES.map((frame, index) => {
        const { width, height } = getCaseImageMeta(frame.src);
        return (
          <figure key={frame.src} className="vjm-case__frame">
            <ProgressiveCaseImage
              src={frame.src}
              alt={frame.alt}
              width={width}
              height={height}
              className="vjm-case__img"
              priority={index === 0}
            />
          </figure>
        );
      })}
    </div>
  );
}
