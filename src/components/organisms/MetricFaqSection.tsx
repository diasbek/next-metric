"use client";

import Image from "next/image";
import { useState } from "react";
import { PageContainer } from "@/components/atoms/PageContainer";
import { getMetricHome } from "@/data/metric-home";
import type { FAQItem } from "@/data/faq";
import type { Locale } from "@/i18n/config";

export function MetricFaqSection({
  locale,
  items,
}: {
  locale: Locale;
  items: FAQItem[];
}) {
  const [open, setOpen] = useState(0);
  const { faq } = getMetricHome(locale);

  return (
    <section id={faq.id} className="metric-gradient-pink metric-section metric-faq">
      <PageContainer>
        <div
          className="metric-faq__grid"
          data-reveal-group
        >
          <div data-reveal>
            <h2 className="metric-faq__title font-display text-white">
              {faq.title}
            </h2>
            <p className="metric-faq__subtitle">
              {faq.subtitle}
            </p>
          </div>
          <div className="metric-faq__list" data-reveal>
            {items.map((item, index) => {
              const isOpen = open === index;
              return (
                <div key={item.question} className="faq-item">
                  <button
                    type="button"
                    className="faq-item__trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <span className="mt-2 block h-[3px] w-6 shrink-0 bg-white" />
                    ) : (
                      <span className="relative mt-1 size-6 shrink-0">
                        <Image
                          src="/images/metric/icons/plus.svg"
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </span>
                    )}
                  </button>
                  {isOpen ? (
                    <div className="faq-item__panel">{item.answer}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
