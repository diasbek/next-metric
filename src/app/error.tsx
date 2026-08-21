"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";

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
    <div className="metric-error-page">
      <PageContainer className="metric-error-page__inner">
        <p className="metric-error-page__brand">METRIC</p>
        <h1 className="metric-error-page__title font-display">
          Couldn’t load the page
        </h1>
        <p className="metric-error-page__body">
          Something went wrong while loading this page. Try again, or go back
          home.
        </p>
        <div className="metric-error-page__actions">
          <Button type="button" onClick={reset} variant="primary">
            Try again
          </Button>
          <Button href="/" variant="outline">
            Home
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}
