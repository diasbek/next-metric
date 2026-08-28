"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { PayloadImageInput } from "@/components/admin/metric-home/PayloadImageInput";
import {
  asArray,
  asRecord,
  patchSection,
  readString,
  readStringArray,
  replaceSection,
} from "@/components/admin/metric-home/helpers";
import {
  cardBox,
  fieldset,
  label,
  legend,
  row,
} from "@/components/admin/metric-home/fieldStyles";
import { useAdminT } from "@/i18n/admin";

export type ProjectOption = {
  id: string;
  slug: string;
  title: string;
  status: string;
  cover_image: string;
  /** Locale-keyed card fields from the case editor. */
  byLocale: Record<
    string,
    {
      title: string;
      description: string;
      tags: string[];
      author: string;
      role: string;
      quote: string;
    }
  >;
};

type LocalePayloadProps = {
  locale: "en" | "de";
  current: Record<string, unknown>;
  update: (next: Record<string, unknown>) => void;
};

function Field({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <label style={label}>
      <span>{title}</span>
      {children}
    </label>
  );
}

function projectCardForLocale(
  project: ProjectOption | undefined,
  locale: string,
): {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  quote: string;
  author: string;
  role: string;
  image: string;
} | null {
  if (!project) return null;
  const tr = project.byLocale[locale];
  const en = project.byLocale.en;
  const title = (tr?.title || en?.title || project.title || project.slug).trim();
  return {
    id: project.id,
    slug: project.slug,
    title,
    tags: (tr?.tags?.length ? tr.tags : en?.tags) ?? [],
    quote: (tr?.quote || en?.quote || title).trim(),
    author: (tr?.author || en?.author || title).trim(),
    role: (tr?.role || en?.role || tr?.description || en?.description || "").trim(),
    image: project.cover_image,
  };
}

export function HeroSectionEditor({ locale, current, update }: LocalePayloadProps) {
  const hero = asRecord(current.hero);
  const patch = (partial: Record<string, unknown>) =>
    update(patchSection(current, "hero", partial));

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>Hero ({locale.toUpperCase()})</legend>
      <Field title="Title line 1">
        <input
          style={adminInput}
          value={readString(hero, "titleLine1")}
          onChange={(e) => patch({ titleLine1: e.target.value })}
        />
      </Field>
      <Field title="Title line 2">
        <input
          style={adminInput}
          value={readString(hero, "titleLine2")}
          onChange={(e) => patch({ titleLine2: e.target.value })}
        />
      </Field>
      <Field title="Subtitle">
        <textarea
          style={{ ...adminInput, minHeight: 80 }}
          value={readString(hero, "subtitle")}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>
      <Field title="CTA">
        <input
          style={adminInput}
          value={readString(hero, "cta")}
          onChange={(e) => patch({ cta: e.target.value })}
        />
      </Field>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Field title="Badge value">
          <input
            style={adminInput}
            value={readString(hero, "badgeValue")}
            onChange={(e) => patch({ badgeValue: e.target.value })}
          />
        </Field>
        <Field title="Badge label">
          <input
            style={adminInput}
            value={readString(hero, "badgeLabel")}
            onChange={(e) => patch({ badgeLabel: e.target.value })}
          />
        </Field>
      </div>
      <Field title="Redesign label">
        <input
          style={adminInput}
          value={readString(hero, "redesignLabel")}
          onChange={(e) => patch({ redesignLabel: e.target.value })}
        />
      </Field>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Field title="Redesign value">
          <input
            style={adminInput}
            value={readString(hero, "redesignValue")}
            onChange={(e) => patch({ redesignValue: e.target.value })}
          />
        </Field>
        <Field title="Redesign delta">
          <input
            style={adminInput}
            value={readString(hero, "redesignDelta")}
            onChange={(e) => patch({ redesignDelta: e.target.value })}
          />
        </Field>
        <Field title="Redesign caption">
          <input
            style={adminInput}
            value={readString(hero, "redesignCaption")}
            onChange={(e) => patch({ redesignCaption: e.target.value })}
          />
        </Field>
      </div>
      <PayloadImageInput
        label="Product image 1"
        value={readString(hero, "product1")}
        folder="metric-home/hero"
        onChange={(url) => patch({ product1: url })}
      />
      <PayloadImageInput
        label="Product image 2"
        value={readString(hero, "product2")}
        folder="metric-home/hero"
        onChange={(url) => patch({ product2: url })}
      />
    </fieldset>
  );
}

export function TrustSectionEditor({ locale, current, update }: LocalePayloadProps) {
  const cards = asArray(current.trust).map((item) => asRecord(item));

  function setCards(next: Record<string, unknown>[]) {
    update(replaceSection(current, "trust", next));
  }

  function patchCard(index: number, partial: Record<string, unknown>) {
    const next = cards.map((card, i) => (i === index ? { ...card, ...partial } : card));
    setCards(next);
  }

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>Trust cards ({locale.toUpperCase()})</legend>
      {cards.map((card, index) => {
        const kind = readString(card, "kind") || "stat";
        return (
          <div key={`${kind}-${index}`} style={cardBox}>
            <div style={row}>
              <strong style={{ color: "#fff", fontSize: 13 }}>
                Card {index + 1} · {kind}
              </strong>
            </div>
            {kind === "spn" ? (
              <>
                <Field title="Label">
                  <input
                    style={adminInput}
                    value={readString(card, "label")}
                    onChange={(e) => patchCard(index, { label: e.target.value })}
                  />
                </Field>
                <Field title="Text">
                  <textarea
                    style={{ ...adminInput, minHeight: 72 }}
                    value={readString(card, "text")}
                    onChange={(e) => patchCard(index, { text: e.target.value })}
                  />
                </Field>
                <PayloadImageInput
                  label="Icon"
                  value={readString(card, "icon")}
                  folder="metric-home/trust"
                  onChange={(url) => patchCard(index, { icon: url })}
                />
              </>
            ) : null}
            {kind === "reviews" ? (
              <>
                <Field title="Label">
                  <input
                    style={adminInput}
                    value={readString(card, "label")}
                    onChange={(e) => patchCard(index, { label: e.target.value })}
                  />
                </Field>
                <PayloadImageInput
                  label="Icon"
                  value={readString(card, "icon")}
                  folder="metric-home/trust"
                  onChange={(url) => patchCard(index, { icon: url })}
                />
              </>
            ) : null}
            {kind === "rating" || kind === "stat" ? (
              <>
                <Field title="Value">
                  <input
                    style={adminInput}
                    value={readString(card, "value")}
                    onChange={(e) => patchCard(index, { value: e.target.value })}
                  />
                </Field>
                <Field title="Label line 1">
                  <input
                    style={adminInput}
                    value={readString(card, "labelLine1")}
                    onChange={(e) =>
                      patchCard(index, { labelLine1: e.target.value })
                    }
                  />
                </Field>
                <Field title="Label line 2">
                  <input
                    style={adminInput}
                    value={readString(card, "labelLine2")}
                    onChange={(e) =>
                      patchCard(index, { labelLine2: e.target.value })
                    }
                  />
                </Field>
                {kind === "rating" ? (
                  <PayloadImageInput
                    label="Icon"
                    value={readString(card, "icon")}
                    folder="metric-home/trust"
                    onChange={(url) => patchCard(index, { icon: url })}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}
    </fieldset>
  );
}

export function CategoriesSectionEditor({
  locale,
  current,
  update,
}: LocalePayloadProps) {
  const categories = asRecord(current.categories);
  const titleLines = asArray(categories.titleLines);
  const images = readStringArray(categories, "images");

  function patch(partial: Record<string, unknown>) {
    update(patchSection(current, "categories", partial));
  }

  function setTitleLine(index: number, value: unknown) {
    const next = titleLines.map((line, i) => (i === index ? value : line));
    patch({ titleLines: next });
  }

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>Categories ({locale.toUpperCase()})</legend>
      {titleLines.map((line, index) => {
        if (typeof line === "string") {
          return (
            <Field key={`line-${index}`} title={`Title line ${index + 1}`}>
              <input
                style={adminInput}
                value={line}
                onChange={(e) => setTitleLine(index, e.target.value)}
              />
            </Field>
          );
        }
        const obj = asRecord(line);
        return (
          <div key={`line-${index}`} style={cardBox}>
            <strong style={{ color: "#fff", fontSize: 13 }}>
              Accent line {index + 1}
            </strong>
            <Field title="Prefix">
              <input
                style={adminInput}
                value={readString(obj, "prefix")}
                onChange={(e) =>
                  setTitleLine(index, { ...obj, prefix: e.target.value })
                }
              />
            </Field>
            <Field title="Accent">
              <input
                style={adminInput}
                value={readString(obj, "accent")}
                onChange={(e) =>
                  setTitleLine(index, { ...obj, accent: e.target.value })
                }
              />
            </Field>
            <Field title="Suffix">
              <input
                style={adminInput}
                value={readString(obj, "suffix")}
                onChange={(e) =>
                  setTitleLine(index, { ...obj, suffix: e.target.value })
                }
              />
            </Field>
            <label style={{ ...row, color: "#ccc", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={Boolean(obj.icon)}
                onChange={(e) =>
                  setTitleLine(index, { ...obj, icon: e.target.checked })
                }
              />
              Show icon
            </label>
          </div>
        );
      })}
      {images.map((src, index) => (
        <PayloadImageInput
          key={`img-${index}`}
          label={`Category image ${index + 1}`}
          value={src}
          folder="metric-home/categories"
          onChange={(url) => {
            const next = [...images];
            next[index] = url;
            patch({ images: next });
          }}
        />
      ))}
      <button
        type="button"
        style={adminBtn}
        onClick={() => patch({ images: [...images, ""] })}
      >
        Add image
      </button>
    </fieldset>
  );
}

export function CaseStudiesSectionEditor({
  locale,
  current,
  update,
  projects,
  onLineupChange,
}: LocalePayloadProps & {
  projects: ProjectOption[];
  /** Keep EN/DE case lineup in sync (card copy comes from projects). */
  onLineupChange?: (items: Array<{ slug: string }>) => void;
}) {
  const t = useAdminT();
  const section = asRecord(current.caseStudies);
  const items = asArray(section.items).map((item) => asRecord(item));
  const projectsBySlug = new Map<string, ProjectOption>(
    projects.map((p) => [p.slug, p]),
  );

  function patch(partial: Record<string, unknown>) {
    update(patchSection(current, "caseStudies", partial));
  }

  function setLineup(nextItems: Array<Record<string, unknown>>) {
    const normalized = nextItems.map((item) => ({
      slug: String(item.slug ?? "").trim(),
    }));
    if (onLineupChange) onLineupChange(normalized);
    else patch({ items: normalized });
  }

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>
        {t.pages.home.caseStudiesLegend} ({locale.toUpperCase()})
      </legend>
      <p style={{ margin: 0, fontSize: 12, color: "#888", lineHeight: 1.45 }}>
        {t.pages.home.caseStudiesHint}{" "}
        <Link href="/admin/works/" style={{ color: "#8af" }}>
          {t.pages.home.caseStudiesWorksLink}
        </Link>
      </p>
      <Field title={t.pages.home.caseStudiesTitle}>
        <input
          style={adminInput}
          value={readString(section, "title")}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </Field>
      <Field title={t.pages.home.caseStudiesTitleAccent}>
        <input
          style={adminInput}
          value={readString(section, "titleAccent")}
          onChange={(e) => patch({ titleAccent: e.target.value })}
        />
      </Field>
      <Field title={t.pages.home.caseStudiesSubtitle}>
        <textarea
          style={{ ...adminInput, minHeight: 80 }}
          value={readString(section, "subtitle")}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Field title={t.pages.home.caseStudiesMoreLabel}>
          <input
            style={adminInput}
            value={readString(section, "moreLabel")}
            onChange={(e) => patch({ moreLabel: e.target.value })}
          />
        </Field>
        <Field title={t.pages.home.caseStudiesViewLabel}>
          <input
            style={adminInput}
            value={readString(section, "viewLabel")}
            onChange={(e) => patch({ viewLabel: e.target.value })}
          />
        </Field>
      </div>

      {items.map((item, index) => {
        const slug = readString(item, "slug");
        const card = projectCardForLocale(projectsBySlug.get(slug), locale);
        return (
          <div key={`case-${index}`} style={cardBox}>
            <div style={row}>
              <strong style={{ color: "#fff", fontSize: 13 }}>
                {t.pages.home.caseStudiesItemLabel} {index + 1}
              </strong>
              <button
                type="button"
                style={adminBtn}
                onClick={() => setLineup(items.filter((_, i) => i !== index))}
              >
                {t.common.delete}
              </button>
            </div>
            <Field title={t.pages.home.caseStudiesPickProject}>
              <select
                style={adminInput}
                value={slug}
                onChange={(e) => {
                  const next = items.map((row, i) =>
                    i === index
                      ? { slug: e.target.value }
                      : { slug: readString(row, "slug") },
                  );
                  setLineup(next);
                }}
              >
                <option value="">{t.pages.home.caseStudiesSelectPlaceholder}</option>
                {projects.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.title} ({project.slug})
                    {project.status !== "published" ? ` · ${project.status}` : ""}
                  </option>
                ))}
                {slug && !projects.some((p) => p.slug === slug) ? (
                  <option value={slug}>
                    {slug} ({t.pages.home.caseStudiesMissing})
                  </option>
                ) : null}
              </select>
            </Field>
            {card ? (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  padding: 12,
                  background: "#111",
                  border: "1px solid #2a2a2a",
                }}
              >
                <p style={{ margin: 0, fontSize: 11, color: "#777" }}>
                  {t.pages.home.caseStudiesFromCase}
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.image}
                      alt=""
                      style={{
                        width: 96,
                        height: 75,
                        objectFit: "cover",
                        background: "#000",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 96,
                        height: 75,
                        background: "#1a1a1a",
                        color: "#555",
                        fontSize: 11,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      —
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                    <strong style={{ fontSize: 13, overflowWrap: "anywhere" }}>
                      «{card.quote}»
                    </strong>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{card.author}</span>
                    <span style={{ fontSize: 12, color: "#777" }}>{card.role}</span>
                    {card.tags.length ? (
                      <span style={{ fontSize: 11, color: "#666" }}>
                        {card.tags.join(" · ")}
                      </span>
                    ) : null}
                    <Link
                      href={`/admin/works/${card.id}/`}
                      style={{ fontSize: 12, color: "#8af", marginTop: 4 }}
                    >
                      {t.pages.home.caseStudiesEditCase} →
                    </Link>
                  </div>
                </div>
              </div>
            ) : slug ? (
              <p style={{ margin: 0, fontSize: 12, color: "#a86" }}>
                {t.pages.home.caseStudiesMissingHint}
              </p>
            ) : null}
          </div>
        );
      })}
      <button
        type="button"
        style={adminBtn}
        onClick={() =>
          setLineup([
            ...items.map((row) => ({ slug: readString(row, "slug") })),
            { slug: "" },
          ])
        }
      >
        {t.pages.home.caseStudiesAdd}
      </button>
    </fieldset>
  );
}

export function HomeServicesSectionEditor({
  locale,
  current,
  update,
}: LocalePayloadProps) {
  const services = asRecord(current.services);
  const titleLines = readStringArray(services, "titleLines");
  const items = asArray(services.items).map((item) => asRecord(item));

  function patch(partial: Record<string, unknown>) {
    update(patchSection(current, "services", partial));
  }

  function patchItem(index: number, partial: Record<string, unknown>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...partial } : item));
    patch({ items: next });
  }

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>
        Home services block ({locale.toUpperCase()})
      </legend>
      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
        Homepage “Everything your Amazon brand needs” block — not a separate
        services catalog page.
      </p>
      <Field title="Title line 1">
        <input
          style={adminInput}
          value={titleLines[0] ?? ""}
          onChange={(e) => {
            const lines = [...titleLines];
            lines[0] = e.target.value;
            patch({ titleLines: lines });
          }}
        />
      </Field>
      <Field title="Title line 2">
        <input
          style={adminInput}
          value={titleLines[1] ?? ""}
          onChange={(e) => {
            const lines = [...titleLines];
            lines[1] = e.target.value;
            patch({ titleLines: lines });
          }}
        />
      </Field>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <Field title="Title suffix">
          <input
            style={adminInput}
            value={readString(services, "titleSuffix")}
            onChange={(e) => patch({ titleSuffix: e.target.value })}
          />
        </Field>
        <Field title="Title bracket">
          <input
            style={adminInput}
            value={readString(services, "titleBracket")}
            onChange={(e) => patch({ titleBracket: e.target.value })}
          />
        </Field>
      </div>
      <Field title="Subtitle">
        <textarea
          style={{ ...adminInput, minHeight: 80 }}
          value={readString(services, "subtitle")}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>
      <Field title="CTA">
        <input
          style={adminInput}
          value={readString(services, "cta")}
          onChange={(e) => patch({ cta: e.target.value })}
        />
      </Field>
      {items.map((item, index) => (
        <div key={`svc-${index}`} style={cardBox}>
          <div style={row}>
            <strong style={{ color: "#fff", fontSize: 13 }}>
              Item {index + 1}
            </strong>
            <button
              type="button"
              style={adminBtn}
              onClick={() =>
                patch({ items: items.filter((_, i) => i !== index) })
              }
            >
              Remove
            </button>
          </div>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "80px 1fr" }}>
            <Field title="N">
              <input
                style={adminInput}
                value={readString(item, "n")}
                onChange={(e) => patchItem(index, { n: e.target.value })}
              />
            </Field>
            <Field title="Title">
              <input
                style={adminInput}
                value={readString(item, "title")}
                onChange={(e) => patchItem(index, { title: e.target.value })}
              />
            </Field>
          </div>
          <PayloadImageInput
            label="Image"
            value={readString(item, "image")}
            folder="metric-home/services"
            onChange={(url) => patchItem(index, { image: url })}
          />
        </div>
      ))}
      <button
        type="button"
        style={adminBtn}
        onClick={() =>
          patch({
            items: [
              ...items,
              { n: String(items.length + 1), title: "", image: "" },
            ],
          })
        }
      >
        Add service item
      </button>
    </fieldset>
  );
}

export function WorkflowSectionEditor({
  locale,
  current,
  update,
}: LocalePayloadProps) {
  const workflow = asRecord(current.workflow);
  const cards = asArray(workflow.cards).map((item) => asRecord(item));

  function patch(partial: Record<string, unknown>) {
    update(patchSection(current, "workflow", partial));
  }

  function patchCard(index: number, partial: Record<string, unknown>) {
    const next = cards.map((card, i) => (i === index ? { ...card, ...partial } : card));
    patch({ cards: next });
  }

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>Workflow ({locale.toUpperCase()})</legend>
      <Field title="Title line 1">
        <input
          style={adminInput}
          value={readString(workflow, "titleLine1")}
          onChange={(e) => patch({ titleLine1: e.target.value })}
        />
      </Field>
      <Field title="Title line 2">
        <input
          style={adminInput}
          value={readString(workflow, "titleLine2")}
          onChange={(e) => patch({ titleLine2: e.target.value })}
        />
      </Field>
      <Field title="Subtitle">
        <input
          style={adminInput}
          value={readString(workflow, "subtitle")}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>
      <Field title="CTA">
        <input
          style={adminInput}
          value={readString(workflow, "cta")}
          onChange={(e) => patch({ cta: e.target.value })}
        />
      </Field>
      <Field title="Note">
        <textarea
          style={{ ...adminInput, minHeight: 64 }}
          value={readString(workflow, "note")}
          onChange={(e) => patch({ note: e.target.value })}
        />
      </Field>
      {cards.map((card, index) => (
        <div key={`wf-${index}`} style={cardBox}>
          <div style={row}>
            <strong style={{ color: "#fff", fontSize: 13 }}>
              Card {index + 1}
            </strong>
            <button
              type="button"
              style={adminBtn}
              onClick={() =>
                patch({ cards: cards.filter((_, i) => i !== index) })
              }
            >
              Remove
            </button>
          </div>
          <Field title="Title">
            <input
              style={adminInput}
              value={readString(card, "title")}
              onChange={(e) => patchCard(index, { title: e.target.value })}
            />
          </Field>
          <Field title="Body">
            <textarea
              style={{ ...adminInput, minHeight: 72 }}
              value={readString(card, "body")}
              onChange={(e) => patchCard(index, { body: e.target.value })}
            />
          </Field>
          <Field title="Layout">
            <select
              style={adminInput}
              value={readString(card, "layout") || "media-top"}
              onChange={(e) => patchCard(index, { layout: e.target.value })}
            >
              <option value="media-top">media-top</option>
              <option value="media-bottom">media-bottom</option>
            </select>
          </Field>
          <PayloadImageInput
            label="Image"
            value={readString(card, "image")}
            folder="metric-home/workflow"
            onChange={(url) => patchCard(index, { image: url })}
          />
        </div>
      ))}
      <button
        type="button"
        style={adminBtn}
        onClick={() =>
          patch({
            cards: [
              ...cards,
              {
                title: "",
                body: "",
                image: "",
                layout: "media-top",
              },
            ],
          })
        }
      >
        Add workflow card
      </button>
    </fieldset>
  );
}

export function FaqChromeEditor({ locale, current, update }: LocalePayloadProps) {
  const faq = asRecord(current.faq);
  const patch = (partial: Record<string, unknown>) =>
    update(patchSection(current, "faq", partial));

  return (
    <fieldset style={fieldset}>
      <legend style={legend}>FAQ chrome ({locale.toUpperCase()})</legend>
      <Field title="Title">
        <input
          style={adminInput}
          value={readString(faq, "title")}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </Field>
      <Field title="Subtitle">
        <textarea
          style={{ ...adminInput, minHeight: 80 }}
          value={readString(faq, "subtitle")}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>
      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
        Chrome is title and subtitle only. Questions and answers are edited in
        the FAQ list below.
      </p>
    </fieldset>
  );
}

export function NavFooterSectionEditor({
  locale,
  current,
  update,
}: LocalePayloadProps) {
  const t = useAdminT();
  const nav = asArray(current.nav).map((item) => asRecord(item));
  const footer = asRecord(current.footer);
  const links = asArray(footer.links).map((item) => asRecord(item));
  const social = asArray(footer.social).map((item) => asRecord(item));
  const cities = readStringArray(footer, "cities");

  function setNav(next: Record<string, unknown>[]) {
    update(replaceSection(current, "nav", next));
  }

  function patchFooter(partial: Record<string, unknown>) {
    update(patchSection(current, "footer", partial));
  }

  return (
    <>
      <fieldset style={fieldset}>
        <legend style={legend}>Nav ({locale.toUpperCase()})</legend>
        {nav.map((item, index) => (
          <div key={`nav-${index}`} style={cardBox}>
            <div style={row}>
              <strong style={{ color: "#fff", fontSize: 13 }}>
                Link {index + 1}
              </strong>
              <button
                type="button"
                style={adminBtn}
                onClick={() => setNav(nav.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field title="Label">
                <input
                  style={adminInput}
                  value={readString(item, "label")}
                  onChange={(e) => {
                    const next = nav.map((row, i) =>
                      i === index ? { ...row, label: e.target.value } : row,
                    );
                    setNav(next);
                  }}
                />
              </Field>
              <Field title="Href">
                <input
                  style={adminInput}
                  value={readString(item, "href")}
                  onChange={(e) => {
                    const next = nav.map((row, i) =>
                      i === index ? { ...row, href: e.target.value } : row,
                    );
                    setNav(next);
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
        <button
          type="button"
          style={adminBtn}
          onClick={() => setNav([...nav, { label: "", href: "/" }])}
        >
          Add nav link
        </button>
      </fieldset>

      <fieldset style={fieldset}>
        <legend style={legend}>Footer ({locale.toUpperCase()})</legend>
        <Field title="Cities (comma-separated)">
          <input
            style={adminInput}
            value={cities.join(", ")}
            onChange={(e) =>
              patchFooter({
                cities: e.target.value
                  .split(",")
                  .map((part) => part.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
        <Field title="Start CTA">
          <input
            style={adminInput}
            value={readString(footer, "startCta")}
            onChange={(e) => patchFooter({ startCta: e.target.value })}
          />
        </Field>
        {links.map((item, index) => (
          <div key={`fl-${index}`} style={cardBox}>
            <div style={row}>
              <strong style={{ color: "#fff", fontSize: 13 }}>
                Footer link {index + 1}
              </strong>
              <button
                type="button"
                style={adminBtn}
                onClick={() =>
                  patchFooter({ links: links.filter((_, i) => i !== index) })
                }
              >
                Remove
              </button>
            </div>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field title="Label">
                <input
                  style={adminInput}
                  value={readString(item, "label")}
                  onChange={(e) => {
                    const next = links.map((row, i) =>
                      i === index ? { ...row, label: e.target.value } : row,
                    );
                    patchFooter({ links: next });
                  }}
                />
              </Field>
              <Field title="Href">
                <input
                  style={adminInput}
                  value={readString(item, "href")}
                  onChange={(e) => {
                    const next = links.map((row, i) =>
                      i === index ? { ...row, href: e.target.value } : row,
                    );
                    patchFooter({ links: next });
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
        <button
          type="button"
          style={adminBtn}
          onClick={() =>
            patchFooter({ links: [...links, { label: "", href: "/" }] })
          }
        >
          Add footer link
        </button>
        {social.map((item, index) => (
          <div key={`soc-${index}`} style={cardBox}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
              <Field title="Social label">
                <input
                  style={adminInput}
                  value={readString(item, "label")}
                  onChange={(e) => {
                    const next = social.map((row, i) =>
                      i === index ? { ...row, label: e.target.value } : row,
                    );
                    patchFooter({ social: next });
                  }}
                />
              </Field>
              <Field title="Key (instagram / linkedin / x / facebook)">
                <input
                  style={adminInput}
                  value={readString(item, "key")}
                  onChange={(e) => {
                    const next = social.map((row, i) =>
                      i === index ? { ...row, key: e.target.value } : row,
                    );
                    patchFooter({ social: next });
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
          {t.pages.home.contactsSettingsHint}{" "}
          <Link href="/admin/contacts/" style={{ color: "#8cf" }}>
            Contacts
          </Link>
          {" · "}
          <Link href="/admin/settings/" style={{ color: "#8cf" }}>
            Settings
          </Link>
        </p>
      </fieldset>
    </>
  );
}

export function AdvancedJsonEditor({
  locale,
  value,
  onChange,
}: {
  locale: "en" | "de";
  value: string;
  onChange: (text: string, parsed?: Record<string, unknown>) => void;
}) {
  return (
    <fieldset style={fieldset}>
      <legend style={legend}>
        Full payload JSON ({locale.toUpperCase()}) — advanced
      </legend>
      <textarea
        style={{
          ...adminInput,
          minHeight: 360,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
        }}
        value={value}
        onChange={(e) => {
          const text = e.target.value;
          try {
            const parsed = JSON.parse(text) as unknown;
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              onChange(text, parsed as Record<string, unknown>);
              return;
            }
          } catch {
            // keep typing
          }
          onChange(text);
        }}
        spellCheck={false}
      />
    </fieldset>
  );
}

export function PublishBar({
  status,
  onChange,
}: {
  status: "draft" | "published";
  onChange: (status: "draft" | "published") => void;
}) {
  const t = useAdminT();
  return (
    <fieldset style={fieldset}>
      <legend style={legend}>{t.common.status}</legend>
      <select
        style={adminInput}
        value={status}
        onChange={(e) =>
          onChange(e.target.value === "published" ? "published" : "draft")
        }
      >
        <option value="draft">{t.common.draft}</option>
        <option value="published">{t.common.published}</option>
      </select>
      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
        Draft keeps the public site on static defaults; published applies this
        CMS payload.
      </p>
    </fieldset>
  );
}

export function SaveButton() {
  const t = useAdminT();
  return (
    <button type="submit" style={adminBtnPrimary}>
      {t.common.save}
    </button>
  );
}
