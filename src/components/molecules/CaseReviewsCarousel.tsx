"use client";

import { MediaImage } from "@/components/atoms/MediaImage";
import type { ProjectReview } from "@/data/projects";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type Props = {
  reviews: ProjectReview[];
  /** Fallback when a review has no personImage (usually project cover). */
  fallbackImage: string;
  fallbackAuthor: string;
};

export function CaseReviewsCarousel({
  reviews,
  fallbackImage,
  fallbackAuthor,
}: Props) {
  const desktopSlides = Math.min(3, Math.max(1, reviews.length));

  return (
    <Swiper
      className="metric-case__reviews"
      slidesPerView={1}
      spaceBetween={16}
      grabCursor
      watchOverflow
      breakpoints={{
        768: {
          slidesPerView: desktopSlides,
          spaceBetween: 20,
        },
      }}
    >
      {reviews.map((review, index) => {
        const name = review.author?.trim() || fallbackAuthor;
        const avatar = review.personImage?.trim() || fallbackImage;
        return (
          <SwiperSlide
            key={review.id || `${index}-${name}`}
            className="metric-case__review-slide"
          >
            <article className="metric-case__review">
              {review.quote ? (
                <p className="metric-case__review-quote">{review.quote}</p>
              ) : null}
              <div className="metric-case__review-author">
                <div className="metric-case__review-avatar">
                  {avatar ? (
                    <MediaImage
                      src={avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="metric-case__review-name">{name}</p>
                  {review.role ? (
                    <p className="metric-case__review-role">{review.role}</p>
                  ) : null}
                </div>
              </div>
            </article>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
