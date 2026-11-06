import { ProtoBtn } from "@/components/proto/ProtoBtn";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { MetricHomeContent } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  resolveTagDisplays,
  type TagDisplaySource,
} from "@/utils/tag-labels";
import type { FAQItem } from "@/data/faq";
import type { ReactNode } from "react";

const PROTO_CATS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"] as const;

const PROC = [
  { h: "Brief", p: "A short brief on the product, the audience and the result you want." },
  { h: "Concept", p: "A visual direction for the whole listing before production starts." },
  { h: "Production", p: "3D, photo work, infographics and copy built as one system." },
  { h: "Revisions", p: "Structured feedback rounds against clear milestones." },
  { h: "Final delivery", p: "Files ready for Seller Central." },
];
const PROC_DE = [
  { h: "Briefing", p: "Ein kurzes Briefing zu Produkt, Zielgruppe und gewünschtem Ergebnis." },
  { h: "Konzept", p: "Eine visuelle Richtung für das gesamte Listing, bevor die Produktion beginnt." },
  { h: "Produktion", p: "3D, Fotoarbeit, Infografiken und Texte als ein System umgesetzt." },
  { h: "Korrekturen", p: "Strukturierte Feedbackrunden entlang klarer Meilensteine." },
  { h: "Finale Lieferung", p: "Dateien bereit für Seller Central." },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Stars() {
  return (
    <span className="stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 41 39">
          <path d="M20.5 0L25.6946 14.4077L41 14.8967L28.905 24.2901L33.1697 39L20.5 30.3977L7.8303 39L12.095 24.2901L0 14.8967L15.3054 14.4077L20.5 0Z" />
        </svg>
      ))}
    </span>
  );
}

function Laurel() {
  return (
    <svg className="lau" viewBox="0 0 94 81" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M70.1224 15.3994C69.038 14.5494 67.9076 13.7582 66.736 13.0293L66.7063 13.0691C63.4899 13.875 59.0004 14.1471 52.7966 8.57442C54.262 8.02824 60.7034 5.76547 63.2968 7.51728C66.2251 9.49347 66.72 10.4246 67.0896 11.1153C67.1758 11.2762 67.254 11.4241 67.3549 11.5691C69.3314 12.7795 71.1988 14.1622 72.9348 15.7057C71.9899 14.2825 70.7075 12.9007 69.4203 11.5141C66.1295 7.96897 62.807 4.39113 65.0299 0C73.5067 5.43707 76.7272 9.46299 74.4009 17.0855C76.8936 19.5094 79.0477 22.2601 80.7997 25.2624C80.5542 24.1546 80.1379 23.0458 79.665 21.9441C79.4193 21.3698 79.159 20.7968 78.9003 20.2271C77.1157 16.3121 75.3888 12.5205 78.9768 9.16428C85.1155 17.1711 86.4596 20.4959 81.6066 26.7528C82.1309 27.7569 82.6017 28.786 83.0206 29.8336C83.2905 30.5115 83.5377 31.1987 83.7622 31.8936C84.199 33.2412 84.5483 34.6182 84.8087 36.0147C84.8156 35.6715 84.8162 35.325 84.8119 34.9752C84.8029 34.2047 84.7748 33.4194 84.7467 32.6325C84.5678 27.756 84.3896 22.8281 88.9441 21.0646C91.59 30.5419 91.653 35.9355 85.2673 40.0123C85.4303 43.3219 85.0501 46.6328 84.145 49.8147C86.484 44.5857 87.8194 37.6666 93.829 37.892C92.5452 47.7209 91.4816 53.5305 83.7918 54.7119C82.9594 56.6313 81.4592 58.1778 79.8656 59.8195C79.009 60.7023 78.1245 61.6137 77.303 62.626L76.8988 63.1225C77.454 62.6557 77.454 62.6557 77.454 62.6557Z"
      />
    </svg>
  );
}

function MetricMark({ className = "mk" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 123 95" aria-hidden="true">
      <path d="M123 2.43899V92.5924C123 93.9091 121.94 94.9625 120.614 94.9625H96.1379C94.8125 94.9625 93.7521 93.9091 93.7521 92.5924V63.7117C93.7521 61.6927 91.3664 60.5515 89.8642 61.8682L66.2716 81.0927L49.8362 94.4358C48.2457 95.7526 45.9483 94.6114 45.9483 92.5924V65.204C45.9483 63.8873 44.8879 62.8338 43.5625 62.8338C43.0323 62.8338 42.5022 63.0094 42.0603 63.3606C41.972 63.3606 41.972 63.4483 41.972 63.4483L18.2026 82.8484L3.88794 94.4358C2.29742 95.7526 0 94.6114 0 92.5924V81.0927V61.2538C0 60.5515 0.353448 59.8492 0.883621 59.4103L42.1487 25.7893C43.7392 24.4726 46.0366 25.6138 46.0366 27.6328V55.0211C46.0366 56.3379 47.097 57.3913 48.4224 57.3913C48.9526 57.3913 49.4828 57.2157 49.8362 56.9524C49.9246 56.9524 49.9246 56.8646 50.0129 56.7768L93.8405 21.1368L119.112 0.507766C120.614 -0.721199 123 0.41998 123 2.43899Z" />
    </svg>
  );
}

function accentTitle(title: string, accent?: string): ReactNode {
  const a = accent?.trim();
  if (!a || !title.includes(a)) return title;
  const i = title.indexOf(a);
  return (
    <>
      {title.slice(0, i)}
      <em>{a}</em>
      {title.slice(i + a.length)}
    </>
  );
}

type TitleLine =
  | string
  | {
      prefix?: string;
      accent?: string;
      suffix?: string;
      icon?: boolean;
    };

function renderTitleLines(lines: readonly TitleLine[]): ReactNode {
  return lines.map((line, i) => {
    if (typeof line === "string") {
      return (
        <span key={i}>
          {i > 0 ? " " : null}
          {line}
        </span>
      );
    }
    return (
      <span key={i}>
        {i > 0 ? " " : null}
        {line.icon ? <Laurel /> : null}
        {line.prefix || ""}
        {line.accent ? <em>{line.accent}</em> : null}
        {line.suffix || ""}
      </span>
    );
  });
}

function parseStatNum(card: {
  num?: number;
  value?: string;
}): number | null {
  if (typeof card.num === "number" && Number.isFinite(card.num)) return card.num;
  const digits = String(card.value || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

export function MetricHeroSection({
  locale,
  home,
}: {
  locale: Locale;
  home: MetricHomeContent;
}) {
  const hint =
    home.hero.hint ||
    (locale === "de"
      ? "Tippen Sie die Ergebnisse, um den Blick zu steuern"
      : "Move the cursor: your gaze leaves heat");
  return (
    <section className="hero dk" id="top" data-dark aria-label="METRIC">
      <div className="hero-cvh" />
      <canvas className="hero-sp" aria-hidden="true" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-ui wrap">
        <div className="hero-top">
          <p className="cap" data-in="fade">
            Amazon listing images · A+ Content
          </p>
          <p className="cap hint" data-in="fade">
            <i aria-hidden="true" />
            {hint}
          </p>
        </div>
        <h1 className="d1 hero-h" data-in="chars">
          {home.hero.titleLine1}{" "}
          <em>{home.hero.titleLine2}</em>
        </h1>
        <div className="hero-row" data-in="stagger">
          <p className="lead">{home.hero.subtitle}</p>
          <div className="hero-cta">
            <ProtoBtn brief locale={locale} className="">
              {home.hero.cta}
            </ProtoBtn>
          </div>
        </div>
      </div>
    </section>
  );
}

type TrustCard = {
  kind?: string;
  label?: string;
  labelLine1?: string;
  labelLine2?: string;
  text?: string;
  value?: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
  num?: number;
};

export function MetricProofSection({
  home,
}: {
  locale: Locale;
  home: MetricHomeContent;
}) {
  const cards = (home.trust?.length ? home.trust : []) as TrustCard[];
  return (
    <section className="proof wrap" aria-label="METRIC in numbers">
      {cards.map((card, index) => {
        const delay = index === 0 ? undefined : String(index * 80);
        const kind = card.kind;
        const fallbackLabel = [card.labelLine1, card.labelLine2]
          .filter(Boolean)
          .join(" ");
        if (kind === "spn") {
          return (
            <div
              className="pf"
              data-reveal="up"
              data-d={delay}
              key={`trust-${index}`}
            >
              <span className="cap">{card.label}</span>
              <b>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="spn-lg"
                  src={card.icon || "/images/metric/icons/spn.svg"}
                  alt="Amazon SPN"
                  width={180}
                  height={40}
                />
              </b>
              <p>{card.text}</p>
            </div>
          );
        }
        if (kind === "reviews" || kind === "rating") {
          return (
            <div
              className="pf"
              data-reveal="up"
              data-d={delay}
              key={`trust-${index}`}
            >
              <span className="cap">{card.label || fallbackLabel}</span>
              <b>
                {card.value || "5.0"} <Stars />
              </b>
              <p>{card.text || fallbackLabel}</p>
            </div>
          );
        }
        const num = parseStatNum(card);
        const prefix = card.prefix || "";
        const suffix = card.suffix || "";
        return (
          <div
            className="pf"
            data-reveal={num != null ? "count" : "up"}
            data-d={delay}
            key={`trust-${index}`}
          >
            <span className="cap">{card.label || fallbackLabel}</span>
            <b>
              {prefix}
              {num != null ? (
                <span className="num" data-n={String(num)}>
                  {num}
                </span>
              ) : (
                card.value
              )}
              {suffix ? <small>{suffix}</small> : null}
            </b>
            <p>{card.text || fallbackLabel}</p>
          </div>
        );
      })}
    </section>
  );
}

export function MetricCtrSection({
  locale,
  home,
}: {
  locale: Locale;
  home: MetricHomeContent;
}) {
  const ctr = home.ctr ?? {
    kicker: "Same product · new visuals",
    title: "Better images. More clicks.",
    titleAccent: "More clicks.",
    body: "The same listing before and after a Metric redesign: the click-through rate went from 9.5% to 22%. Shoppers decide in the search results, long before they read a bullet point.",
    beforeLabel: locale === "de" ? "Vorher" : "Before",
    afterLabel: locale === "de" ? "Metric-Redesign" : "Metric redesign",
  };
  return (
    <section className="ctr wrap" aria-labelledby="ctr-h">
      <div className="ctr-hd">
        <p className="cap">{ctr.kicker}</p>
        <h2 className="d2" id="ctr-h" data-reveal="chars">
          {accentTitle(ctr.title || "", ctr.titleAccent)}
        </h2>
        <p className="lead" data-reveal="lines">
          {ctr.body}
        </p>
        <div data-reveal="up">
          <ProtoBtn brief locale={locale} className="ink">
            {home.hero.cta}
          </ProtoBtn>
        </div>
      </div>
      <div
        className="ctr-ch"
        data-ctr
        role="img"
        aria-label="Click-through rate 9.5% before and 22% after the Metric redesign, plus 132%"
      >
        <div className="ctr-g" aria-hidden="true" />
        <div className="bar b0" aria-hidden="true">
          <i />
          <b className="bv num">0%</b>
          <span className="cap">
            {ctr.beforeLabel || (locale === "de" ? "Vorher" : "Before")}
          </span>
        </div>
        <div className="bar b1" aria-hidden="true">
          <i />
          <b className="bv num">0%</b>
          <span className="cap">
            {ctr.afterLabel ||
              (locale === "de" ? "Metric-Redesign" : "Metric redesign")}
          </span>
        </div>
        <div className="ctr-up" aria-hidden="true">
          +132% <span>CTR</span>
        </div>
      </div>
    </section>
  );
}

export function MetricBandSection({
  home,
}: {
  home?: MetricHomeContent;
}) {
  const rowA = home?.band?.rowA?.length
    ? home.band.rowA
    : ["Listing images", "A+ Content", "Brand Store", "Ad banners", "3D modeling"];
  const rowB = home?.band?.rowB?.length
    ? home.band.rowB
    : [
        "Main images",
        "Infographics",
        "Lifestyle scenes",
        "A+ modules",
        "Brand Store",
        "Ad creatives",
        "3D renders",
        "Ready for Seller Central",
      ];
  const a = [...rowA, ...rowA, ...rowA].map((x, i) => (
    <span className="b2-big" key={`a-${i}`}>
      {x}
      <i />
    </span>
  ));
  const b = [...rowB, ...rowB, ...rowB].map((x, i) => (
    <span className="b2-sm" key={`b-${i}`}>
      <em>{pad((i % rowB.length) + 1)}</em>
      {x}
    </span>
  ));
  return (
    <div className="band2" aria-hidden="true">
      <div className="b2-row" data-dir="1" data-sp="1">
        <div className="b2-t">{a}</div>
      </div>
      <div className="b2-row" data-dir="-1" data-sp=".7">
        <div className="b2-t">{b}</div>
      </div>
    </div>
  );
}

export function MetricCategoriesSection({
  home,
}: {
  locale: Locale;
  home: MetricHomeContent;
}) {
  const images =
    home.categories.images.length >= 5
      ? home.categories.images
      : PROTO_CATS.map((n) => `/images/metric/proto/${n}.webp`);
  const lead =
    "lead" in home.categories && typeof home.categories.lead === "string"
      ? home.categories.lead
      : "Main images from Metric projects in home, beauty, automotive, apparel, sports and more. Drag the ring, or just scroll.";
  return (
    <section className="best dk" data-dark aria-labelledby="best-h" id="projects">
      <div className="best-hd wrap">
        <h2 className="d2" id="best-h" data-reveal="lines">
          {renderTitleLines(home.categories.titleLines as unknown as TitleLine[])}
        </h2>
        <p className="lead" data-reveal="lines">
          {lead}
        </p>
      </div>
      <div className="ring-w" data-cur="Drag" role="group" aria-label="Main image examples">
        <div className="ring">
          {images.slice(0, 9).map((src, i) => (
            <figure className="rc" key={`${src}-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Amazon main image example ${i + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricCaseStudiesSection({
  locale,
  home,
  taxonomy = [],
}: {
  locale: Locale;
  home: MetricHomeContent;
  taxonomy?: readonly TagDisplaySource[];
}) {
  const { caseStudies } = home;
  if (!caseStudies.items.length) return null;
  const de = locale === "de";

  return (
    <section className="wrap" id="cases" aria-labelledby="cs-h">
      <div className="cs-hd">
        <div className="sec-hd">
          <p className="cap">
            {de ? "Fallstudien" : "Case studies"} · {pad(caseStudies.items.length)}
          </p>
          <h2 className="d2" id="cs-h" data-reveal="chars">
            {accentTitle(caseStudies.title, caseStudies.titleAccent)}
          </h2>
        </div>
        <p className="lead" data-reveal="lines">
          {caseStudies.subtitle}
        </p>
      </div>
      <div className="stack">
        {caseStudies.items.map((item, i) => {
          const tags = resolveTagDisplays(item.tags, taxonomy);
          const name = item.title?.trim() || item.author || item.slug;
          const href = localePath(locale, `/works/${item.slug}/`);
          const categoryLabel = item.category?.trim()
            ? resolveTagDisplays([item.category], taxonomy)[0]?.label ||
              item.category
            : "";
          const cap = categoryLabel || tags[0]?.label || item.tags[0] || "";
          return (
            <article className="sc" style={{ ["--i" as string]: i }} key={item.slug}>
              <div className="sc-in">
                <div className="sc-tx">
                  <div className="sc-n">
                    <span className="cap">
                      {pad(i + 1)} / {pad(caseStudies.items.length)}
                    </span>
                    <span className="cap">{cap}</span>
                  </div>
                  <h3>{name}</h3>
                  <div className="tags">
                    {tags.map((tag) => (
                      <span className="tg" key={tag.slug}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <p>{item.description}</p>
                  <ProtoBtn href={href} className="ink">
                    {caseStudies.viewLabel}
                  </ProtoBtn>
                </div>
                <figure className="sc-m">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={name} loading="lazy" decoding="async" />
                </figure>
              </div>
            </article>
          );
        })}
      </div>
      <div className="cs-more">
        <ProtoBtn href={localePath(locale, "/works/")} className="ghost">
          {caseStudies.moreLabel}
        </ProtoBtn>
      </div>
    </section>
  );
}

export function MetricServicesSection({
  locale,
  home,
}: {
  locale: Locale;
  home: MetricHomeContent;
}) {
  const de = locale === "de";
  const { services } = home;
  const also =
    "also" in services && Array.isArray(services.also) && services.also.length
      ? services.also
      : de
        ? [
            "3D-Produktvisualisierung",
            "Redesign bestehender Listings",
            "Komplettes Amazon-Markendesign",
            "Laufende Design-Betreuung",
          ]
        : [
            "3D product visualization",
            "Existing listing redesign",
            "Complete Amazon brand design",
            "Ongoing design support",
          ];
  const alsoLabel =
    "alsoLabel" in services && services.alsoLabel
      ? services.alsoLabel
      : de
        ? "Auf Anfrage"
        : "Also on request";
  const tellUs =
    "tellUs" in services && services.tellUs
      ? services.tellUs
      : de
        ? "Erzählen Sie uns von Ihrem Produkt"
        : "Tell us about your product";
  const titleLines = Array.from(services.titleLines || []).map(String);
  const titleJoined = titleLines.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const suffixRaw = services.titleSuffix?.trim() ?? "";
  // Avoid "…to convert to convert" when CMS suffix duplicates the title end.
  const suffix =
    suffixRaw &&
    !titleJoined.toLowerCase().endsWith(suffixRaw.toLowerCase())
      ? suffixRaw
      : "";
  const bracketRaw = (services.titleBracket || "").replace(/^\[|\]$/g, "").trim();

  return (
    <section className="svc" id="services" aria-labelledby="svc-h">
      <div className="svc-pin">
        <div className="svc-st">
          <div className="svc-hd wrap">
            <div className="sec-hd">
              <p className="cap" style={{ color: "rgba(255,255,255,.78)" }}>
                {de ? "Leistungen · ein visuelles System" : "Services · one visual system"}
              </p>
              <h2 className="d2" id="svc-h">
                {titleJoined}
                {suffix ? ` ${suffix}` : ""}{" "}
                {bracketRaw ? (
                  <span className="br">
                    <i aria-hidden="true">[</i>
                    {bracketRaw}
                    <i aria-hidden="true">]</i>
                  </span>
                ) : null}
              </h2>
            </div>
            <div className="sec-hd">
              <p className="lead">{services.subtitle}</p>
              <div>
                <ProtoBtn brief locale={locale} className="wh">
                  {services.cta}
                </ProtoBtn>
              </div>
            </div>
          </div>
          <div className="svc-tk">
            {services.items.map((s, i) => (
              <article className="sv" key={s.title}>
                <div className="sv-h">
                  <span className="no">{i + 1}</span>
                  <h3>{s.title}</h3>
                </div>
                <div className="sv-im">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" loading="lazy" decoding="async" />
                </div>
                <p>
                  {"body" in s && s.body
                    ? s.body
                    : de
                      ? "Teil eines konsistenten visuellen Systems für Amazon."
                      : "Built as one consistent visual system for Amazon."}
                </p>
              </article>
            ))}
            <article className="sv end">
              <div>
                <p className="cap" style={{ color: "var(--on-n2)", marginBottom: 18 }}>
                  {alsoLabel}
                </p>
                <ul>
                  {also.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <ProtoBtn brief locale={locale}>
                  {tellUs}
                </ProtoBtn>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MetricWorkflowSection({
  locale,
  home,
}: {
  locale: Locale;
  home: MetricHomeContent;
}) {
  const process = home.process;
  const steps =
    process?.steps?.length
      ? process.steps
      : locale === "de"
        ? PROC_DE
        : PROC;
  const accent = process?.titleAccent?.trim();
  const procTitle = process?.title || "";
  const procTitleNode =
    accent && procTitle.includes(accent) ? (
      accentTitle(procTitle, accent)
    ) : (
      procTitle || (
        <>
          From brief to final files in <em>7 business days</em>
        </>
      )
    );
  return (
    <section className="wf wrap" id="workflow" aria-labelledby="wf-h">
      <div className="wf-hd">
        <div className="sec-hd">
          <p className="cap">Workflow</p>
          <h2 className="d2" id="wf-h">
            {home.workflow.titleLine1} <MetricMark /> {home.workflow.titleLine2}
          </h2>
        </div>
        <p className="lead" data-reveal="lines">
          {home.workflow.subtitle}
        </p>
      </div>
      <div className="wf-g" data-reveal="stagger">
        {home.workflow.cards.map((w) => (
          <article className="wc" key={w.title}>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.image} alt="" loading="lazy" decoding="async" />
            </figure>
            <div>
              {"k" in w && w.k ? (
                <p className="k">
                  {w.k}{" "}
                  {"kl" in w && w.kl ? <small>{w.kl}</small> : null}
                </p>
              ) : null}
              <h3>{w.title}</h3>
              <p style={{ marginTop: 10 }}>{w.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="proc">
        <div className="proc-hd">
          <h3 className="d3">{procTitleNode}</h3>
          <p className="cap">{process?.note}</p>
        </div>
        <ol className="proc-l">
          {steps.map((p, i) => (
            <li className="ps" key={p.h}>
              <span className="cap">{pad(i + 1)}</span>
              <b>{p.h}</b>
              <p>{p.p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export type HomeReview = {
  slug: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
};

export function MetricReviewsSection({
  locale,
  reviews,
}: {
  locale: Locale;
  reviews: HomeReview[];
}) {
  if (!reviews.length) return null;
  const de = locale === "de";
  return (
    <section className="rv dk" data-dark aria-labelledby="rv-h">
      <div className="rv-hd wrap">
        <div className="sec-hd">
          <p className="cap">{de ? "Kundenstimmen" : "Client reviews"}</p>
          <h2 className="d2" id="rv-h" data-reveal="chars">
            {de ? (
              <>
                Seller kommen für das <em>nächste Listing</em> zurück.
              </>
            ) : (
              <>
                Sellers come back for the <em>next listing.</em>
              </>
            )}
          </h2>
        </div>
        <div className="sec-hd" style={{ justifyItems: "start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Stars />
            <span className="cap">5.0 · Excellent</span>
          </div>
          <div className="rv-nav">
            <button type="button" data-rv="-1" aria-label="Previous review">
              ←
            </button>
            <button type="button" data-rv="1" aria-label="Next review">
              →
            </button>
          </div>
        </div>
      </div>
      <div className="rv-sc" id="rv-sc" tabIndex={0} aria-label="Reviews">
        {reviews.map((r) => (
          <figure className="rq" key={`${r.slug}-${r.author}`}>
            <blockquote>{r.quote}</blockquote>
            <figcaption>
              <footer>
                <span className="av" aria-hidden="true">
                  {r.initials}
                </span>
                <span>
                  <b>{r.author}</b>
                  <span className="cap">{r.role}</span>
                </span>
                <TransitionLink
                  className="lnk"
                  style={{ marginLeft: "auto" }}
                  href={localePath(locale, `/works/${r.slug}/`)}
                >
                  Case <span className="ar" aria-hidden="true">→</span>
                </TransitionLink>
              </footer>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function MetricFaqSection({
  locale,
  items,
  faq,
}: {
  locale: Locale;
  items: FAQItem[];
  faq: MetricHomeContent["faq"];
}) {
  const de = locale === "de";
  if (!items.length) return null;
  return (
    <section className="fq wrap" id="faq" aria-labelledby="fq-h">
      <div className="fq-hd">
        <p className="cap">{de ? "Fragen" : "Questions"}</p>
        <h2 className="d2" id="fq-h" data-reveal="chars">
          {faq.title}
        </h2>
        <p className="lead" data-reveal="lines">
          {faq.subtitle}
        </p>
      </div>
      <div className="fq-l" data-reveal="stagger">
        {items.map((f, i) => (
          <div className="fq-i" key={f.question}>
            <button
              className="fq-q"
              type="button"
              aria-expanded={false}
              aria-controls={`fa-${i}`}
            >
              <span className="no">{pad(i + 1)}</span>
              <b>{f.question}</b>
              <span className="pm" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
            <div className="fq-a" id={`fa-${i}`} hidden>
              <p>{f.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** @deprecated kept for admin preview imports */
export { MetricBandSection as MetricCategoriesMarquee };
