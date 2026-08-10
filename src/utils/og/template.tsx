import React, { type ReactElement } from "react";

export interface OgTemplateProps {
  title: string;
  description: string;
  eyebrow: string;
  /** Real METRIC wordmark as data URL (PNG/SVG). */
  logoDataUrl: string;
  imageDataUrl?: string;
  siteUrl?: string;
}

export function OgTemplate({
  title,
  description,
  eyebrow,
  logoDataUrl,
  imageDataUrl,
  siteUrl = "metric.agency",
}: OgTemplateProps): ReactElement {
  const titleSize = title.length > 42 ? 46 : title.length > 28 ? 54 : 60;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#000000",
        fontFamily: "Inter Tight",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: "1 1 55%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 56px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDataUrl}
          alt="METRIC"
          width={280}
          height={86}
          style={{
            width: 280,
            height: 86,
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: 20,
              fontSize: 20,
              fontWeight: 500,
              color: "#2600FF",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              marginBottom: 20,
              fontSize: titleSize,
              fontWeight: 500,
              color: "#FAFAFA",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              maxWidth: 520,
              fontSize: 24,
              fontWeight: 400,
              color: "rgba(255,255,255,0.68)",
              lineHeight: 1.35,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {siteUrl}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flex: "1 1 45%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#2600FF",
        }}
      >
        {imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageDataUrl}
            alt=""
            width={540}
            height={630}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoDataUrl}
            alt=""
            width={380}
            height={116}
            style={{
              width: 380,
              height: 116,
              objectFit: "contain",
              opacity: 0.18,
            }}
          />
        )}
      </div>
    </div>
  );
}
