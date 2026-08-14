import React, { type ReactElement } from "react";

export interface OgTemplateProps {
  title: string;
  description: string;
  eyebrow: string;
  /** Real METRIC wordmark as PNG data URL. */
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
  siteUrl = "metric.graphics",
}: OgTemplateProps): ReactElement {
  const titleSize = title.length > 42 ? 46 : title.length > 28 ? 54 : 60;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#ffffff",
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
          height={64}
          style={{
            width: 280,
            height: 64,
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
              fontSize: 18,
              fontWeight: 500,
              color: "#ff3c82",
              letterSpacing: "0.12em",
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
              color: "#090909",
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
              color: "rgba(9,9,9,0.62)",
              lineHeight: 1.35,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            fontSize: 20,
            color: "rgba(9,9,9,0.45)",
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
          background: "#ff3c82",
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
            width={320}
            height={72}
            style={{
              width: 320,
              height: 72,
              objectFit: "contain",
              opacity: 0.25,
            }}
          />
        )}
      </div>
    </div>
  );
}
