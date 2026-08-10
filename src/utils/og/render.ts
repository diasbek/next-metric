import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OgTemplate, type OgTemplateProps } from "./template";
import { OG_IMAGE_DIMENSIONS } from "./paths";

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const FONT_DIR = path.join(
  ROOT_DIR,
  "node_modules",
  "@fontsource",
  "inter-tight",
  "files",
);

const LOGO_PNG_PATH = path.join(
  PUBLIC_DIR,
  "images",
  "metric",
  "logo",
  "metric-wordmark-og.png",
);

let logoDataUrlCache: string | null = null;
let fontsCache: Array<{
  name: string;
  data: Buffer;
  weight: 400 | 500;
  style: "normal";
}> | null = null;

function loadFonts() {
  if (fontsCache) return fontsCache;

  fontsCache = [
    {
      name: "Inter Tight",
      weight: 400,
      style: "normal",
      data: fs.readFileSync(path.join(FONT_DIR, "inter-tight-cyrillic-400-normal.woff")),
    },
    {
      name: "Inter Tight",
      weight: 500,
      style: "normal",
      data: fs.readFileSync(path.join(FONT_DIR, "inter-tight-cyrillic-500-normal.woff")),
    },
    {
      name: "Inter Tight",
      weight: 400,
      style: "normal",
      data: fs.readFileSync(path.join(FONT_DIR, "inter-tight-latin-400-normal.woff")),
    },
    {
      name: "Inter Tight",
      weight: 500,
      style: "normal",
      data: fs.readFileSync(path.join(FONT_DIR, "inter-tight-latin-500-normal.woff")),
    },
  ];

  return fontsCache;
}

/** Load pre-rasterized METRIC wordmark for OG chrome. */
export async function getOgLogoDataUrl(): Promise<string> {
  if (logoDataUrlCache) return logoDataUrlCache;

  const png = fs.readFileSync(LOGO_PNG_PATH);
  logoDataUrlCache = `data:image/png;base64,${png.toString("base64")}`;
  return logoDataUrlCache;
}

function resolvePublicImagePath(relativePath: string): string | undefined {
  const cleanPath = relativePath.replace(/^\//, "");
  const candidates = [
    path.join(PUBLIC_DIR, cleanPath),
    path.join(PUBLIC_DIR, cleanPath.replace(/\.jpg$/i, ".webp")),
    path.join(PUBLIC_DIR, cleanPath.replace(/\.webp$/i, ".jpg")),
    path.join(PUBLIC_DIR, cleanPath.replace(/\.png$/i, ".webp")),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

export async function getImageDataUrl(
  source: string | undefined | null,
): Promise<string | undefined> {
  if (!source) return undefined;

  if (source.startsWith("data:")) return source;

  if (source.startsWith("http://") || source.startsWith("https://")) {
    try {
      const res = await fetch(source, { next: { revalidate: 3600 } });
      if (!res.ok) return undefined;
      const buffer = Buffer.from(await res.arrayBuffer());
      const jpeg = await sharp(buffer).jpeg({ quality: 86 }).toBuffer();
      return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    } catch {
      return undefined;
    }
  }

  const filePath = resolvePublicImagePath(source);
  if (!filePath) return undefined;

  const jpeg = await sharp(filePath).jpeg({ quality: 86 }).toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function renderOgImageResponse(
  props: Omit<OgTemplateProps, "logoDataUrl"> & { logoDataUrl?: string },
): Promise<ImageResponse> {
  const logoDataUrl = props.logoDataUrl ?? (await getOgLogoDataUrl());

  return new ImageResponse(
    OgTemplate({
      ...props,
      logoDataUrl,
      title: truncateText(props.title, 72),
      description: truncateText(props.description, 140),
    }),
    {
      width: OG_IMAGE_DIMENSIONS.width,
      height: OG_IMAGE_DIMENSIONS.height,
      fonts: loadFonts(),
    },
  );
}
