"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";
import { auditEntityLabel, formatAdminMessage, useAdminT } from "@/i18n/admin";

type Card = { label: string; value?: string; href: string };

type AuditRow = {
  id: string;
  actor_email: string;
  action: string;
  created_at: string;
  entity_type: string | null;
};

export type DashboardHomeCase = {
  id: string;
  slug: string;
  title: string;
  status: string;
  homeOrder: number;
};

type Props = {
  title: string;
  kpi: Card[];
  shortcuts: Card[];
  shortcutsTitle: string;
  auditTitle: string;
  noAudit: string;
  auditRows: AuditRow[] | null;
  locale: Locale;
  homeCases: DashboardHomeCase[];
};

export function AdminDashboardHome({
  title,
  kpi,
  shortcuts,
  shortcutsTitle,
  auditTitle,
  noAudit,
  auditRows,
  locale,
  homeCases,
}: Props) {
  const t = useAdminT();

  return (
    <div>
      <style>{`
        .admin-dash-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .admin-dash-card {
          border: 1px solid #333;
          padding: 16px;
          text-decoration: none;
          color: #fff;
          display: block;
          border-radius: 0;
          min-height: 88px;
          box-sizing: border-box;
        }
        .admin-dash-card:focus-visible {
          outline: 2px solid #2600ff;
          outline-offset: 2px;
        }
        .admin-dash-card__label {
          margin: 0;
          color: #888;
          font-size: 13px;
          line-height: 1.3;
        }
        .admin-dash-card__value {
          margin: 8px 0 0;
          font-size: 26px;
          font-weight: 500;
          line-height: 1.1;
        }
        .admin-dash-card__go {
          margin: 10px 0 0;
          font-size: 20px;
          color: #aaa;
        }
        .admin-dash-audit-row {
          border: 1px solid #222;
          padding: 10px 12px;
          font-size: 13px;
          color: #ccc;
          border-radius: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 4px 8px;
          align-items: baseline;
        }
        .admin-dash-home-case {
          border: 1px solid #2a2a55;
          padding: 12px 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          color: #fff;
          background: #0a0a12;
        }
        .admin-dash-home-case:hover {
          border-color: #2600ff;
        }
        @media (min-width: ${ADMIN_MD_BREAKPOINT}px) {
          .admin-dash-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
          }
          .admin-dash-card {
            padding: 20px;
          }
          .admin-dash-card__value {
            font-size: 32px;
          }
        }
      `}</style>

      <AdminPageHeader title={title} />

      <div className="admin-dash-grid">
        {kpi.map((card) => (
          <Link key={card.label} href={card.href} prefetch={false} className="admin-dash-card">
            <p className="admin-dash-card__label">{card.label}</p>
            <p className="admin-dash-card__value">{card.value}</p>
          </Link>
        ))}
      </div>

      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <h2 style={{ fontSize: 16, margin: 0, color: "#aaa", fontWeight: 600 }}>
            {t.dashboard.homeCasesTitle}
          </h2>
          <Link
            href="/admin/home/?section=case-studies"
            prefetch={false}
            style={{ fontSize: 12, color: "#8af", textDecoration: "none" }}
          >
            {t.dashboard.homeCasesEdit} →
          </Link>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#777", lineHeight: 1.4 }}>
          {t.dashboard.homeCasesHint}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {homeCases.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/works/${item.id}/`}
                prefetch={false}
                className="admin-dash-home-case"
              >
                <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <strong style={{ fontSize: 14, overflowWrap: "anywhere" }}>
                    {item.title}
                  </strong>
                  <span style={{ fontSize: 12, color: "#777" }}>{item.slug}</span>
                </span>
                <span
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      background: "#2600ff",
                      color: "#fff",
                    }}
                  >
                    {formatAdminMessage(t.dashboard.homeCasesOrder, {
                      n: String(item.homeOrder),
                    })}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: item.status === "published" ? "#8c8" : "#a86",
                    }}
                  >
                    {item.status === "published" ? t.common.published : t.common.draft}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {homeCases.length === 0 ? (
            <li style={{ color: "#888", fontSize: 13 }}>{t.dashboard.homeCasesEmpty}</li>
          ) : null}
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#aaa", fontWeight: 600 }}>
          {shortcutsTitle}
        </h2>
        <div className="admin-dash-grid">
          {shortcuts.map((card) => (
            <Link key={card.label} href={card.href} prefetch={false} className="admin-dash-card">
              <p className="admin-dash-card__label">{card.label}</p>
              <p className="admin-dash-card__go">→</p>
            </Link>
          ))}
        </div>
      </section>

      {auditRows ? (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px", fontWeight: 600 }}>
            {auditTitle}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {auditRows.map((row) => (
              <li key={row.id} className="admin-dash-audit-row">
                <strong style={{ color: "#fff" }}>{row.action}</strong>
                <span style={{ overflowWrap: "anywhere" }}>{row.actor_email}</span>
                {row.entity_type ? (
                  <span>· {auditEntityLabel(row.entity_type, t.audit)}</span>
                ) : null}
                <span style={{ color: "#666", flexBasis: "100%", marginTop: 2 }}>
                  {new Date(row.created_at).toLocaleString(locale)}
                </span>
              </li>
            ))}
            {auditRows.length === 0 ? (
              <li style={{ color: "#888" }}>{noAudit}</li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
