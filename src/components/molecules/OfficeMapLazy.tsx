"use client";

import dynamic from "next/dynamic";

const OfficeMapImpl = dynamic(
  () => import("./OfficeMap").then((m) => m.OfficeMap),
  {
    ssr: false,
    loading: () => (
      <div
        data-map-frame
        className="office-map office-map--loading"
        aria-hidden
      />
    ),
  },
);

export function OfficeMap(props: {
  className?: string;
  ariaLabel: string;
}) {
  return <OfficeMapImpl {...props} />;
}
