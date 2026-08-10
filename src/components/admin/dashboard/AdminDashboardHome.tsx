"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";
import { auditEntityLabel, useAdminT } from "@/i18n/admin";

type Card = { label: string; value?: string; href: string };

type AuditRow = {
  id: string;
  actor_email: string;
  action: string;
  created_at: string;
  entity_type: string | null;
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
          <Link key={card.label} href={card.href} className="admin-dash-card">
            <p className="admin-dash-card__label">{card.label}</p>
            <p className="admin-dash-card__value">{card.value}</p>
          </Link>
        ))}
      </div>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#aaa", fontWeight: 600 }}>
          {shortcutsTitle}
        </h2>
        <div className="admin-dash-grid">
          {shortcuts.map((card) => (
            <Link key={card.label} href={card.href} className="admin-dash-card">
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
