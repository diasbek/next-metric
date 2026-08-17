import Image from "next/image";
import type { FAQItem } from "@/data/faq";

export function MetricFaqList({ items }: { items: FAQItem[] }) {
  return (
    <div
      className="metric-faq__list"
      data-reveal-group="pop"
      data-reveal-stagger="0.08"
    >
      {items.map((item, index) => (
        <details
          key={item.question}
          className="faq-item"
          name="metric-faq"
          {...(index === 0 ? { open: true } : {})}
          data-reveal
        >
          <summary className="faq-item__trigger">
            <span>{item.question}</span>
            <span className="faq-item__icon faq-item__icon--minus" aria-hidden>
              <span className="mt-2 block h-[3px] w-6 bg-white" />
            </span>
            <span className="faq-item__icon faq-item__icon--plus relative mt-1 size-6 shrink-0">
              <Image
                src="/images/metric/icons/plus.svg"
                alt=""
                fill
                sizes="24px"
                className="object-contain"
              />
            </span>
          </summary>
          <div className="faq-item__panel">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
