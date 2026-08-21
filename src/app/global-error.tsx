"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#090909",
          padding: 24,
          textAlign: "center",
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
            Something went wrong. Try again, or reload the site.
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
      </body>
    </html>
  );
}
