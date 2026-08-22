"use client";

import { useState } from "react";
import { Divider } from "@/components/atoms";

interface FAQAccordionProps {
  items: { question: string; answer: string }[];
  variant?: "default" | "agency";
}

export function FAQAccordion({
  items,
  variant = "default",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isAgency = variant === "agency";

  if (isAgency) {
    return (
      <div className="faq-agency">
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
                className={`faq-accordion__panel faq-agency__answer${isOpen ? " faq-accordion__panel--open" : ""}`}
              >
                <div className="faq-accordion__panel-inner">
                  <p className="faq-agency__answer-text">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[716px] flex-col gap-0">
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
              className={`faq-accordion__panel overflow-hidden${isOpen ? " faq-accordion__panel--open" : ""}`}
            >
              <div className="faq-accordion__panel-inner">
                <p className="pb-10 text-body-lg text-white/70">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
