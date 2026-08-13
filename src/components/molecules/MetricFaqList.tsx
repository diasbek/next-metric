"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import type { FAQItem } from "@/data/faq";

export function MetricFaqList({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const faqItems = Array.from(
        list.querySelectorAll<HTMLElement>(".faq-item"),
      );
      const gap =
        Number.parseFloat(
          getComputedStyle(list).rowGap || getComputedStyle(list).gap,
        ) || 20;

      let triggersH = 0;
      let maxPanelH = 0;

      faqItems.forEach((item) => {
        const trigger = item.querySelector<HTMLElement>(".faq-item__trigger");
        const panel = item.querySelector<HTMLElement>(".faq-item__panel");
        if (trigger) triggersH += trigger.getBoundingClientRect().height;
        if (panel) maxPanelH = Math.max(maxPanelH, panel.scrollHeight);
      });

      const gaps = Math.max(0, faqItems.length - 1) * gap;
      const buffer = 48;
      list.style.minHeight = `${Math.ceil(triggersH + maxPanelH + gaps + buffer)}px`;
    };

    measure();
    void document.fonts?.ready?.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      list.style.removeProperty("min-height");
    };
  }, [items]);

  return (
    <div
      ref={listRef}
      className="metric-faq__list"
      data-reveal-group="pop"
      data-reveal-stagger="0.08"
    >
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div
            key={item.question}
            className={`faq-item${isOpen ? " is-open" : ""}`}
            data-reveal
          >
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
            <div className="faq-item__collapse" aria-hidden={!isOpen}>
              <div className="faq-item__collapse-inner">
                <div className="faq-item__panel">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
