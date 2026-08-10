"use client";

import { useEffect } from "react";
import { adminToastError } from "@/components/admin/toast/AdminToaster";
import { useAdminT } from "@/i18n/admin";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useAdminT();

  useEffect(() => {
    console.error("[admin route error]", error);
    adminToastError(error.message || t.error.loadFailed);
  }, [error, t.error.loadFailed]);

  return (
    <div>
      <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>{t.error.sectionTitle}</h1>
      <p style={{ color: "#f88", marginBottom: 20 }}>
        {error.message || t.error.sectionBody}
      </p>
      {error.digest ? (
        <p style={{ color: "#666", fontSize: 12, marginBottom: 16 }}>
          digest: {error.digest}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            background: "#2600ff",
            border: "1px solid #2600ff",
            color: "#fff",
          }}
        >
          {t.common.retry}
        </button>
        <a
          href="/admin/"
          style={{
            padding: "10px 14px",
            border: "1px solid #444",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          {t.error.backDashboard}
        </a>
      </div>
    </div>
  );
}
