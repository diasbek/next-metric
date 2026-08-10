"use client";

import { useState, type CSSProperties } from "react";
import { HardNavForm } from "@/components/admin/HardNavForm";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ADMIN_LOCALES, type AdminLocale } from "@/components/admin/ui/locales";
import {
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { saveMetricHomeAction } from "@/app/admin/(dashboard)/metric-home/actions";
import { useAdminT } from "@/i18n/admin";

type Props = {
  status: "draft" | "published";
  payloads: { en: Record<string, unknown>; de: Record<string, unknown> };
  saved?: boolean;
};

const fieldset: CSSProperties = {
  border: "1px solid #333",
  padding: 16,
  display: "grid",
  gap: 12,
  marginBottom: 16,
};

const label: CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#aaa",
  marginBottom: 4,
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

function readStringArray(obj: Record<string, unknown>, key: string): string[] {
  const v = obj[key];
  return Array.isArray(v) ? v.map((item) => String(item ?? "")) : [];
}

function patchSection(
  payload: Record<string, unknown>,
  section: string,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
    [section]: {
      ...asRecord(payload[section]),
      ...patch,
    },
  };
}

export function MetricHomeAdmin({ status, payloads, saved = false }: Props) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [publishStatus, setPublishStatus] = useState(status);
  const [drafts, setDrafts] = useState(payloads);
  const [jsonDraft, setJsonDraft] = useState(() =>
    JSON.stringify(payloads.en, null, 2),
  );

  const current = drafts[locale];
  const hero = asRecord(current.hero);
  const services = asRecord(current.services);
  const faq = asRecord(current.faq);
  const workflow = asRecord(current.workflow);
  const serviceTitleLines = readStringArray(services, "titleLines");

  function updateLocalePayload(next: Record<string, unknown>) {
    setDrafts((prev) => ({ ...prev, [locale]: next }));
    setJsonDraft(JSON.stringify(next, null, 2));
  }

  function switchLocale(next: AdminLocale) {
    setLocale(next);
    setJsonDraft(JSON.stringify(drafts[next], null, 2));
  }

  return (
    <div>
      <AdminPageHeader
        title={t.pages.home.title}
        description="Homepage hero, services, FAQ chrome, workflow, and full JSON payload."
      />

      {saved ? (
        <p style={{ color: "#7dffa0", marginBottom: 16 }}>{t.common.saved}</p>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {ADMIN_LOCALES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => switchLocale(item.code)}
            style={{
              ...adminBtnPrimary,
              background: locale === item.code ? "#2600ff" : "#1a1a1a",
              borderColor: locale === item.code ? "#2600ff" : "#444",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <HardNavForm action={saveMetricHomeAction}>
        <input type="hidden" name="status" value={publishStatus} />
        <input
          type="hidden"
          name="en_payload"
          value={JSON.stringify(drafts.en)}
        />
        <input
          type="hidden"
          name="de_payload"
          value={JSON.stringify(drafts.de)}
        />

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#fff" }}>Publish</legend>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={label}>Status</span>
            <select
              style={adminInput}
              value={publishStatus}
              onChange={(e) =>
                setPublishStatus(
                  e.target.value === "published" ? "published" : "draft",
                )
              }
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#fff" }}>
            Hero ({locale.toUpperCase()})
          </legend>
          <div>
            <span style={label}>Title line 1</span>
            <input
              style={adminInput}
              value={readString(hero, "titleLine1")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "hero", { titleLine1: e.target.value }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>Title line 2</span>
            <input
              style={adminInput}
              value={readString(hero, "titleLine2")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "hero", { titleLine2: e.target.value }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>Subtitle</span>
            <textarea
              style={{ ...adminInput, minHeight: 80 }}
              value={readString(hero, "subtitle")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "hero", { subtitle: e.target.value }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>CTA</span>
            <input
              style={adminInput}
              value={readString(hero, "cta")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "hero", { cta: e.target.value }),
                )
              }
            />
          </div>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#fff" }}>
            Services ({locale.toUpperCase()})
          </legend>
          <div>
            <span style={label}>Title line 1</span>
            <input
              style={adminInput}
              value={serviceTitleLines[0] ?? ""}
              onChange={(e) => {
                const lines = [...serviceTitleLines];
                lines[0] = e.target.value;
                updateLocalePayload(
                  patchSection(current, "services", { titleLines: lines }),
                );
              }}
            />
          </div>
          <div>
            <span style={label}>Title line 2</span>
            <input
              style={adminInput}
              value={serviceTitleLines[1] ?? ""}
              onChange={(e) => {
                const lines = [...serviceTitleLines];
                lines[1] = e.target.value;
                updateLocalePayload(
                  patchSection(current, "services", { titleLines: lines }),
                );
              }}
            />
          </div>
          <div>
            <span style={label}>Subtitle</span>
            <textarea
              style={{ ...adminInput, minHeight: 80 }}
              value={readString(services, "subtitle")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "services", {
                    subtitle: e.target.value,
                  }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>CTA</span>
            <input
              style={adminInput}
              value={readString(services, "cta")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "services", { cta: e.target.value }),
                )
              }
            />
          </div>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#fff" }}>
            FAQ chrome ({locale.toUpperCase()})
          </legend>
          <div>
            <span style={label}>Title</span>
            <input
              style={adminInput}
              value={readString(faq, "title")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "faq", { title: e.target.value }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>Subtitle</span>
            <textarea
              style={{ ...adminInput, minHeight: 80 }}
              value={readString(faq, "subtitle")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "faq", { subtitle: e.target.value }),
                )
              }
            />
          </div>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#fff" }}>
            Workflow ({locale.toUpperCase()})
          </legend>
          <div>
            <span style={label}>Title line 1</span>
            <input
              style={adminInput}
              value={readString(workflow, "titleLine1")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "workflow", {
                    titleLine1: e.target.value,
                  }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>Title line 2</span>
            <input
              style={adminInput}
              value={readString(workflow, "titleLine2")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "workflow", {
                    titleLine2: e.target.value,
                  }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>Subtitle</span>
            <input
              style={adminInput}
              value={readString(workflow, "subtitle")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "workflow", {
                    subtitle: e.target.value,
                  }),
                )
              }
            />
          </div>
          <div>
            <span style={label}>CTA</span>
            <input
              style={adminInput}
              value={readString(workflow, "cta")}
              onChange={(e) =>
                updateLocalePayload(
                  patchSection(current, "workflow", { cta: e.target.value }),
                )
              }
            />
          </div>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#fff" }}>
            Full payload JSON ({locale.toUpperCase()}) — advanced
          </legend>
          <textarea
            style={{
              ...adminInput,
              minHeight: 280,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
            }}
            value={jsonDraft}
            onChange={(e) => {
              const text = e.target.value;
              setJsonDraft(text);
              try {
                const parsed = JSON.parse(text) as unknown;
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                  setDrafts((prev) => ({
                    ...prev,
                    [locale]: parsed as Record<string, unknown>,
                  }));
                }
              } catch {
                // keep typing until JSON is valid
              }
            }}
            spellCheck={false}
          />
        </fieldset>

        <button type="submit" style={adminBtnPrimary}>
          {t.common.save}
        </button>
      </HardNavForm>
    </div>
  );
}
