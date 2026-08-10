"use client";

export function TestimonialNavButtons({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="agency-testimonials__nav">
      <button
        type="button"
        onClick={onPrev}
        aria-label={prevLabel}
        className="agency-testimonials__nav-btn"
      >
        ←
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className="agency-testimonials__nav-btn"
      >
        →
      </button>
    </div>
  );
}
