import { ProgressiveCaseImage } from "@/components/atoms/ProgressiveCaseImage";
import { getCaseImageMeta } from "@/data/case-image-meta";

const VJM_CASE_FRAMES = [
  {
    src: "/images/metric/case-detail/vjm-store/1.jpg",
    alt: "VJM-STORE Amazon listing on iPhone displayed on a drill brush attachment",
  },
  {
    src: "/images/metric/case-detail/vjm-store/2.jpg",
    alt: "VJM-STORE project overview and conversion metrics",
  },
  {
    src: "/images/metric/case-detail/vjm-store/3.jpg",
    alt: "VJM-STORE hero product visual — drill brush set in a workshop",
  },
  {
    src: "/images/metric/case-detail/vjm-store/4.jpg",
    alt: "VJM-STORE complete set overview — six brush attachments and extension",
  },
  {
    src: "/images/metric/case-detail/vjm-store/5.jpg",
    alt: "VJM-STORE bristle recovery and multi-surface cleaning visuals",
  },
  {
    src: "/images/metric/case-detail/vjm-store/6.jpg",
    alt: "VJM-STORE extended cleaning reach and performance benefits",
  },
  {
    src: "/images/metric/case-detail/vjm-store/7.jpg",
    alt: "VJM-STORE lifestyle and brand trust Amazon listing visual",
  },
  {
    src: "/images/metric/case-detail/vjm-store/8.jpg",
    alt: "VJM-STORE EBC and A+ Content design in use",
  },
  {
    src: "/images/metric/case-detail/vjm-store/9.jpg",
    alt: "VJM-STORE A+ Content mobile modules on brand background",
  },
  {
    src: "/images/metric/case-detail/vjm-store/10.jpg",
    alt: "VJM-STORE landing page mockup on laptop",
  },
] as const;

export function VjmStoreCaseBody() {
  return (
    <div className="vjm-case">
      {VJM_CASE_FRAMES.map((frame, index) => {
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
