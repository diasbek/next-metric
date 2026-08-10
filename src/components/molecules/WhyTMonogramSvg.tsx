"use client";

import { useId } from "react";

/** Geometric M monogram for Why Us section. */
const M_PATH =
  "M100 893V100H250L343.5 520L437 100H587V893H450V360L360 720H327L237 360V893H100Z";

const ARTBOARD = { width: 687, height: 993 };
const MAX_BLUR = 26;
const BLEED = MAX_BLUR * 3.5;

const FILTER = {
  x: -BLEED,
  y: -BLEED,
  width: ARTBOARD.width + BLEED * 2,
  height: ARTBOARD.height + BLEED * 2,
};

const LETTER_LEFT = 100;
const LETTER_MID = 343;

const PROGRESSIVE_BLUR_LAYERS = [
  {
    key: "heavy",
    stdDeviation: MAX_BLUR,
    xFadeEnd: LETTER_LEFT + (LETTER_MID - LETTER_LEFT) * 0.55,
  },
  {
    key: "mid",
    stdDeviation: MAX_BLUR * 0.35,
    xFadeEnd: LETTER_MID,
  },
] as const;

type WhyTMonogramSvgProps = {
  /** Progressive-blur hover layer (Figma cycle). Rest is a sharp solid M. */
  showBlur?: boolean;
  idPrefix?: string;
  color?: string;
};

function SoftFadeStops({ invert }: { invert?: boolean }) {
  const left = invert ? 0 : 1;
  const right = invert ? 1 : 0;
  const midA = invert ? 0.15 : 0.85;
  const midB = invert ? 0.55 : 0.45;
  const midC = invert ? 0.85 : 0.15;

  return (
    <>
      <stop offset="0%" stopColor="white" stopOpacity={left} />
      <stop offset="20%" stopColor="white" stopOpacity={left} />
      <stop offset="40%" stopColor="white" stopOpacity={midA} />
      <stop offset="55%" stopColor="white" stopOpacity={midB} />
      <stop offset="75%" stopColor="white" stopOpacity={midC} />
      <stop offset="100%" stopColor="white" stopOpacity={right} />
    </>
  );
}

function ProgressiveBlurM({
  idPrefix,
  color,
}: {
  idPrefix: string;
  color: string;
}) {
  const sharpGradId = `${idPrefix}-sharp-mask-grad`;
  const sharpMaskId = `${idPrefix}-sharp-mask`;

  return (
    <>
      <defs>
        <linearGradient
          id={sharpGradId}
          data-why-t-blur-grad="sharp"
          gradientUnits="userSpaceOnUse"
          x1={LETTER_LEFT}
          y1={0}
          x2={LETTER_MID}
          y2={0}
        >
          <SoftFadeStops invert />
        </linearGradient>
        <mask
          id={sharpMaskId}
          maskUnits="userSpaceOnUse"
          x={FILTER.x}
          y={FILTER.y}
          width={FILTER.width}
          height={FILTER.height}
        >
          <rect
            x={FILTER.x}
            y={FILTER.y}
            width={FILTER.width}
            height={FILTER.height}
            fill={`url(#${sharpGradId})`}
          />
        </mask>

        {PROGRESSIVE_BLUR_LAYERS.map((layer) => {
          const filterId = `${idPrefix}-progressive-blur-${layer.key}`;
          const gradientId = `${idPrefix}-progressive-mask-${layer.key}`;
          const maskId = `${idPrefix}-progressive-mask-${layer.key}-applied`;

          return (
            <g key={layer.key}>
              <filter
                id={filterId}
                x={FILTER.x}
                y={FILTER.y}
                width={FILTER.width}
                height={FILTER.height}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation={layer.stdDeviation} />
              </filter>

              <linearGradient
                id={gradientId}
                data-why-t-blur-grad={layer.key}
                gradientUnits="userSpaceOnUse"
                x1={FILTER.x}
                y1={0}
                x2={layer.xFadeEnd}
                y2={0}
              >
                <SoftFadeStops />
              </linearGradient>

              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x={FILTER.x}
                y={FILTER.y}
                width={FILTER.width}
                height={FILTER.height}
              >
                <rect
                  x={FILTER.x}
                  y={FILTER.y}
                  width={FILTER.width}
                  height={FILTER.height}
                  fill={`url(#${gradientId})`}
                />
              </mask>
            </g>
          );
        })}
      </defs>

      <g fill={color} mask={`url(#${sharpMaskId})`}>
        <path d={M_PATH} />
      </g>

      <g className="why-t-monogram__glow" pointerEvents="none">
        {PROGRESSIVE_BLUR_LAYERS.map((layer) => (
          <g
            key={`${idPrefix}-blur-layer-${layer.key}`}
            fill={color}
            filter={`url(#${idPrefix}-progressive-blur-${layer.key})`}
            mask={`url(#${idPrefix}-progressive-mask-${layer.key}-applied)`}
          >
            <path d={M_PATH} />
          </g>
        ))}
      </g>
    </>
  );
}

export function WhyTMonogramSvg({
  showBlur = false,
  idPrefix,
  color = "#FFFFFF",
}: WhyTMonogramSvgProps) {
  const reactId = useId().replace(/:/g, "");
  const uid = idPrefix || reactId || "why-m";

  return (
    <svg
      aria-hidden
      className="why-t-monogram__svg block h-auto w-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${ARTBOARD.width} ${ARTBOARD.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {showBlur ? (
        <ProgressiveBlurM idPrefix={uid} color={color} />
      ) : (
        <path d={M_PATH} fill={color} />
      )}
    </svg>
  );
}
