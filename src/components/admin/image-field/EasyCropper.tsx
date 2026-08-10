"use client";

import dynamic from "next/dynamic";
import type { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

const Cropper = dynamic(() => import("react-easy-crop"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        color: "#666",
        fontSize: 13,
        background: "#050505",
      }}
    >
      …
    </div>
  ),
});

type EasyCropperProps = {
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  aspect?: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  showGrid?: boolean;
  objectFit?: "contain" | "cover" | "horizontal-cover" | "vertical-cover";
  style?: {
    containerStyle?: React.CSSProperties;
    cropAreaStyle?: React.CSSProperties;
    mediaStyle?: React.CSSProperties;
  };
};

export function EasyCropper(props: EasyCropperProps) {
  // react-easy-crop props are mostly optional at runtime; keep a narrow local type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Cropper as any;
  return <Comp {...props} />;
}
