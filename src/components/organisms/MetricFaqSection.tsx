"use client";

import Image from "next/image";
import { useState } from "react";
import { PageContainer } from "@/components/atoms/PageContainer";
import { metricHome } from "@/data/metric-home";
import type { FAQItem } from "@/data/faq";

export function MetricFaqSection({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState(1);
  const { faq } = metricHome;

  return (
    <section id={faq.id} className="metric-gradient-pink py-16 md:py-24">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="font-display text-[clamp(64px,10vw,120px)] text-white">
              {faq.title}
            </h2>
            <p className="mt-6 max-w-[453px] text-[clamp(16px,1.5vw,24px)] leading-[1.2] tracking-[-0.02em] text-white">
              {faq.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-5">
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
