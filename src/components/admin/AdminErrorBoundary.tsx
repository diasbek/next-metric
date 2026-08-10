"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { adminToastError } from "@/components/admin/toast/AdminToaster";
import { useAdminT } from "@/i18n/admin";

type Props = {
  children: ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
  message: string;
};

function ErrorFallback({
  title,
  message,
  onReset,
}: {
  title?: string;
  message: string;
  onReset: () => void;
}) {
  const t = useAdminT();

  return (
    <div
      style={{
        border: "1px solid #633",
        background: "#140a0a",
        padding: 24,
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
        {title ?? t.error.boundaryTitle}
      </h2>
      <p style={{ color: "#f88", margin: "0 0 16px", fontSize: 14 }}>{message}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onReset}
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
        <button
          type="button"
          onClick={() => window.location.assign("/admin/")}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            background: "#1a1a1a",
            border: "1px solid #444",
            color: "#fff",
          }}
        >
          {t.error.backDashboard}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            background: "#1a1a1a",
            border: "1px solid #444",
            color: "#fff",
          }}
        >
          {t.common.reload}
        </button>
      </div>
    </div>
  );
}

/**
 * Catches render errors in admin UI so a bad panel doesn't blank the whole CMS.
 */
export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "UI error",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[admin ui]", error, info.componentStack);
    adminToastError(error.message || "Admin UI error");
  }

  private reset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ErrorFallback
        title={this.props.title}
        message={this.state.message}
        onReset={this.reset}
      />
    );
  }
}
