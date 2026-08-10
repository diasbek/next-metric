"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Divider } from "@/components/atoms";
import { MOTION_OK, scheduleScrollTriggerRefresh } from "@/animations/gsap";

interface FAQAccordionProps {
  items: { question: string; answer: string }[];
  variant?: "default" | "agency";
}

export function FAQAccordion({
  items,
  variant = "default",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAgency = variant === "agency";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia(MOTION_OK).matches) return;

    answerRefs.current.forEach((el, index) => {
      if (!el) return;
      const isOpen = openIndex === index;
      gsap.to(el, {
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => scheduleScrollTriggerRefresh(),
      });
    });
  }, [openIndex]);

  if (isAgency) {
    return (
      <div
        className="faq-agency"
        data-reveal-group
        data-no-section-snap
      >
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="faq-agency__item">
              {index > 0 && <Divider className="faq-agency__rule" />}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`faq-agency__trigger${index > 0 ? " faq-agency__trigger--ruled" : ""}`}
              >
                <span className="faq-agency__question">{item.question}</span>
                <span className="faq-agency__icon" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[index] = el;
                }}
                className="faq-agency__answer overflow-hidden"
                style={{ height: isOpen ? "auto" : 0 }}
              >
                <p className="faq-agency__answer-text">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex max-w-[716px] flex-col gap-0"
      data-reveal-group
      data-no-section-snap
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            {index > 0 && <Divider className="my-0" />}
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-start justify-between gap-6 py-10 text-left"
            >
              <span className="text-h4 text-white">{item.question}</span>
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-2xl text-white">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              ref={(el) => {
                answerRefs.current[index] = el;
              }}
              className="overflow-hidden"
              style={{ height: isOpen ? "auto" : 0 }}
            >
              <p className="pb-10 text-body-lg text-white/70">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
