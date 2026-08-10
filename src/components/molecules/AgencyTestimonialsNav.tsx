"use client";

export function AgencyTestimonialsNav({
  trackId,
  prevLabel,
  nextLabel,
}: {
  trackId: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const scrollTestimonials = (direction: "left" | "right") => {
    const track = document.getElementById(trackId);
    if (!track) return;

    const card = track.querySelector<HTMLElement>(".agency-testimonials__card");
    if (!card) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const amount = card.getBoundingClientRect().width + gap;

    track.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="agency-testimonials__nav">
      <button
        type="button"
        onClick={() => scrollTestimonials("left")}
        aria-label={prevLabel}
        className="agency-testimonials__nav-btn"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => scrollTestimonials("right")}
        aria-label={nextLabel}
        className="agency-testimonials__nav-btn"
      >
        →
      </button>
    </div>
  );
}
