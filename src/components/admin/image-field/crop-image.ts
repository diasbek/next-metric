import type { Area } from "react-easy-crop";
import type { ImagePreset } from "./presets";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Failed to load image")));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

function supportsWebp(): boolean {
  try {
    return document
      .createElement("canvas")
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function rad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Crop + optional rotation (react-easy-crop pixel area), then downscale & encode.
 * Rotation uses the safe-area technique from the library docs.
 */
export async function cropAndCompress(options: {
  imageSrc: string;
  crop: Area;
  preset: ImagePreset;
  fileNameHint?: string;
  rotation?: number;
}): Promise<{ file: File; previewUrl: string; width: number; height: number; bytes: number }> {
  const image = await loadImage(options.imageSrc);
  const rotation = options.rotation ?? 0;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  const { width: cropW, height: cropH, x, y } = options.crop;

  if (rotation % 360 === 0) {
    canvas.width = Math.max(1, Math.round(cropW));
    canvas.height = Math.max(1, Math.round(cropH));
    ctx.drawImage(image, x, y, cropW, cropH, 0, 0, canvas.width, canvas.height);
  } else {
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(rad(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5,
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);
    canvas.width = Math.max(1, Math.round(cropW));
    canvas.height = Math.max(1, Math.round(cropH));
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - y),
    );
  }

  let targetW = canvas.width;
  let targetH = canvas.height;
  const maxW = options.preset.maxWidth;
  const maxH = options.preset.maxHeight;
  // Fixed-aspect presets (cover, OG, team…): always export at master size
  // so CMS uploads match the site frame one-to-one.
  const exactMaster =
    options.preset.aspect != null &&
    Number.isFinite(maxW) &&
    Number.isFinite(maxH) &&
    maxW > 0 &&
    maxH > 0;

  if (exactMaster) {
    targetW = maxW;
    targetH = maxH;
  } else {
    const scale = Math.min(1, maxW / targetW, maxH / targetH);
    if (scale < 1) {
      targetW = Math.max(1, Math.round(targetW * scale));
      targetH = Math.max(1, Math.round(targetH * scale));
    }
  }

  if (targetW !== canvas.width || targetH !== canvas.height) {
    const resized = document.createElement("canvas");
    resized.width = targetW;
    resized.height = targetH;
    const rctx = resized.getContext("2d");
    if (!rctx) throw new Error("Canvas not available");
    rctx.imageSmoothingEnabled = true;
    rctx.imageSmoothingQuality = "high";
    rctx.drawImage(canvas, 0, 0, targetW, targetH);
    canvas.width = targetW;
    canvas.height = targetH;
    ctx.drawImage(resized, 0, 0);
  }

  const useWebp = options.preset.preferWebp && supportsWebp();
  const mime = useWebp ? "image/webp" : "image/jpeg";
  const quality = options.preset.quality;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) reject(new Error("Encode failed"));
        else resolve(result);
      },
      mime,
      quality,
    );
  });

  const base =
    (options.fileNameHint || "image")
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-]+/g, "-")
      .slice(0, 60) || "image";
  const ext = useWebp ? "webp" : "jpg";
  const file = new File([blob], `${base}.${ext}`, { type: mime });
  const previewUrl = URL.createObjectURL(blob);

  return {
    file,
    previewUrl,
    width: targetW,
    height: targetH,
    bytes: blob.size,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
