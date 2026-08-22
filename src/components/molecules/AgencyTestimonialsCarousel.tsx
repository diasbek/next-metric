"use client";

import { useRef } from "react";
import { MediaImage } from "@/components/atoms/MediaImage";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { SectionTitle } from "@/components/atoms";
import { TestimonialNavButtons } from "@/components/molecules/TestimonialsCarousel";
import type { Testimonial } from "@/data/agency";
import "swiper/css";

interface AgencyTestimonialsCarouselProps {
  title: string;
  prevLabel: string;
  nextLabel: string;
  testimonials: Testimonial[];
}

export function AgencyTestimonialsCarousel({
  title,
  prevLabel,
  nextLabel,
  testimonials,
}: AgencyTestimonialsCarouselProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
    <section className="agency-testimonials">
      <div className="agency-testimonials__head">
        <SectionTitle>{title}</SectionTitle>
        <TestimonialNavButtons
          prevLabel={prevLabel}
          nextLabel={nextLabel}
          onPrev={() => swiperRef.current?.slidePrev()}
          onNext={() => swiperRef.current?.slideNext()}
        />
      </div>

      <Swiper
        className="agency-testimonials__swiper"

        data-testimonials-track
        data-no-section-snap
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView={1}
        spaceBetween={16}
        grabCursor
        watchOverflow
        breakpoints={{
          768: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
      >
        {testimonials.map((item) => (
          <SwiperSlide key={item.role} className="agency-testimonials__slide">
            <article className="agency-testimonials__card">
              <div className="agency-testimonials__copy">
                <p className="agency-testimonials__role">{item.role}</p>
                <p className="agency-testimonials__quote">«{item.quote}»</p>
              </div>

              <div className="agency-testimonials__author">
                <div className="agency-testimonials__avatar agency-testimonials__avatar--person">
                  <MediaImage
                    src={item.personImage}
                    alt={item.role}
                    fill
                    className="object-cover"
                    style={
                      item.personObjectPosition
                        ? { objectPosition: item.personObjectPosition }
                        : undefined
                    }
                    sizes="80px"
                  />
                </div>
                <div
                  className={[
                    "agency-testimonials__avatar agency-testimonials__avatar--logo",
                    item.logoRounded === "full" &&
                      "agency-testimonials__avatar--full",
                    item.logoRounded === "lg" &&
                      "agency-testimonials__avatar--lg",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <MediaImage
                    src={item.logoImage}
                    alt={
                      item.role.includes(",")
                        ? `${item.role.split(",").pop()?.trim()} logo`
                        : `${item.role} logo`
                    }
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
