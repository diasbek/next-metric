type HeroLogoSvgProps = {
  color?: string;
  idPrefix?: string;
  showBlur?: boolean;
};

/** Letter bounds for METRIC wordmark — keep in sync with hero-logo-pointer SPACE. */
const VIEWBOX = { x: 0, y: 0, width: 1200, height: 280 };

const LOGO_LEFT = 0;
const LOGO_MID = 520;
const LOGO_AFTER_LEFT = 280;

/** Lighter filter budget — 2 layers, smaller radius/bleed for scroll + hover FPS. */
const MAX_BLUR_STD_DEV = 28;
const BLEED = MAX_BLUR_STD_DEV * 3.5;

const FILTER_REGION = {
  x: VIEWBOX.x - BLEED,
  y: VIEWBOX.y - BLEED,
  width: VIEWBOX.width + BLEED * 2,
  height: VIEWBOX.height + BLEED * 2,
};

/**
 * Soft L→R progressive blur. Full word is blurred; masks fade softly into mid-word
 * so there is no hard seam. Sharp layer uses the inverse fade.
 */
const PROGRESSIVE_BLUR_LAYERS = [
  {
    key: "heavy",
    stdDeviation: MAX_BLUR_STD_DEV,
    xFadeEnd: LOGO_AFTER_LEFT,
  },
  {
    key: "mid",
    stdDeviation: MAX_BLUR_STD_DEV * 0.35,
    xFadeEnd: LOGO_LEFT + (LOGO_MID - LOGO_LEFT) * 0.72,
  },
] as const;

function LogoLetters() {
  return (
    <text
      x={0}
      y={230}
      fontFamily="var(--font-inter-tight), 'Inter Tight', system-ui, sans-serif"
      fontSize={240}
      fontWeight={500}
      letterSpacing="-0.04em"
    >
      METRIC
    </text>
  );
}

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

export function HeroLogoSvg({
  color = "#2600FF",
  idPrefix = "hero-blue",
  showBlur = false,
}: HeroLogoSvgProps) {
  const sharpGradId = `${idPrefix}-sharp-mask-grad`;
  const sharpMaskId = `${idPrefix}-sharp-mask`;

  return (
    <svg
      aria-hidden
      className="block h-full w-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={sharpGradId}
          data-hero-blur-grad="sharp"
          gradientUnits="userSpaceOnUse"
          x1={LOGO_LEFT}
          y1={0}
          x2={LOGO_MID}
          y2={0}
        >
          <SoftFadeStops invert />
        </linearGradient>
        <mask
          id={sharpMaskId}
          maskUnits="userSpaceOnUse"
          x={FILTER_REGION.x}
          y={FILTER_REGION.y}
          width={FILTER_REGION.width}
          height={FILTER_REGION.height}
        >
          <rect
            x={FILTER_REGION.x}
            y={FILTER_REGION.y}
            width={FILTER_REGION.width}
            height={FILTER_REGION.height}
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
                x={FILTER_REGION.x}
                y={FILTER_REGION.y}
                width={FILTER_REGION.width}
                height={FILTER_REGION.height}
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation={layer.stdDeviation} />
              </filter>

              <linearGradient
                id={gradientId}
                data-hero-blur-grad={layer.key}
                gradientUnits="userSpaceOnUse"
                x1={FILTER_REGION.x}
                y1={0}
                x2={layer.xFadeEnd}
                y2={0}
              >
                <SoftFadeStops />
              </linearGradient>

              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x={FILTER_REGION.x}
                y={FILTER_REGION.y}
                width={FILTER_REGION.width}
                height={FILTER_REGION.height}
              >
                <rect
                  x={FILTER_REGION.x}
                  y={FILTER_REGION.y}
                  width={FILTER_REGION.width}
                  height={FILTER_REGION.height}
                  fill={`url(#${gradientId})`}
                />
              </mask>
            </g>
          );
        })}
      </defs>

      {showBlur ? (
        <>
          <g fill={color} mask={`url(#${sharpMaskId})`}>
            <LogoLetters />
          </g>

          <g className="hero-logo__glow" pointerEvents="none">
            {PROGRESSIVE_BLUR_LAYERS.map((layer) => (
              <g
                key={`${idPrefix}-blur-layer-${layer.key}`}
                fill={color}
                filter={`url(#${idPrefix}-progressive-blur-${layer.key})`}
                mask={`url(#${idPrefix}-progressive-mask-${layer.key}-applied)`}
              >
                <LogoLetters />
              </g>
            ))}
          </g>
        </>
      ) : (
        <g fill={color}>
          <LogoLetters />
        </g>
      )}
    </svg>
  );
}
