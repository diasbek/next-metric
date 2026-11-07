"use client";

import { useEffect } from "react";

/**
 * Route error UI — keep this dependency-free. If this boundary itself throws
 * (e.g. broken atom imports), Next escalates to global-error and looks like a
 * full site outage on /de and other soft navigations.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
        color: "#090909",
        background: "#fff",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#ff3c82",
          }}
        >
          METRIC
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 600 }}>
          Couldn’t load the page
        </h1>
        <p
          style={{
            margin: "0 0 24px",
            color: "rgba(9,9,9,0.6)",
            maxWidth: 360,
          }}
        >
          Something went wrong while loading this page. Try again, or go back
          home.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "12px 20px",
              border: "none",
              background: "#ff3c82",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              padding: "12px 20px",
              border: "1px solid #090909",
              color: "#090909",
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
