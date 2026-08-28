import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OgTemplate, type OgTemplateProps } from "./template";
import {
  getDefaultOgImagePath,
  getStaticPageOgImagePath,
  OG_IMAGE_DIMENSIONS,
  type OgPageKey,
} from "./paths";
import type { Locale } from "@/i18n/config";

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const PUBLIC_FONT_DIR = path.join(PUBLIC_DIR, "fonts", "og");
const NODE_FONT_DIR = path.join(
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

function resolveFontFile(filename: string): string | null {
  const candidates = [
    path.join(PUBLIC_FONT_DIR, filename),
    path.join(NODE_FONT_DIR, filename),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function loadFonts() {
  if (fontsCache) return fontsCache;

  // One file per weight — duplicate name/weight entries crash Satori.
  const regular =
    resolveFontFile("inter-tight-latin-400-normal.woff") ??
    resolveFontFile("inter-tight-latin-ext-400-normal.woff");
  const medium =
    resolveFontFile("inter-tight-latin-500-normal.woff") ??
    resolveFontFile("inter-tight-latin-ext-500-normal.woff");

  if (!regular || !medium) {
    throw new Error("OG fonts missing (Inter Tight 400/500)");
  }

  fontsCache = [
    {
      name: "Inter Tight",
      weight: 400,
      style: "normal",
      data: fs.readFileSync(regular),
    },
    {
      name: "Inter Tight",
      weight: 500,
      style: "normal",
      data: fs.readFileSync(medium),
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
      const jpeg = await sharp(buffer)
        .resize(1200, 630, { fit: "cover" })
        .jpeg({ quality: 82 })
        .toBuffer();
      return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    } catch {
      return undefined;
    }
  }

  const filePath = resolvePublicImagePath(source);
  if (!filePath) return undefined;

  const jpeg = await sharp(filePath)
    .resize(1200, 630, { fit: "cover" })
    .jpeg({ quality: 82 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function readStaticOgPng(
  locale: Locale,
  pageKey: OgPageKey | "default",
): Buffer | null {
  const relative =
    pageKey === "default"
      ? getDefaultOgImagePath()
      : getStaticPageOgImagePath(locale, pageKey);
  const absolute = path.join(PUBLIC_DIR, relative.replace(/^\//, ""));
  if (!fs.existsSync(absolute)) return null;
  return fs.readFileSync(absolute);
}

export function staticOgPngResponse(
  buffer: Buffer,
  cacheControl =
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
): Response {
  const body = new Uint8Array(buffer);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": cacheControl,
      "Content-Length": String(body.byteLength),
    },
  });
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

/** Same visual as public `/og` routes — PNG bytes for CMS generate / preview. */
export async function renderOgPngBuffer(
  props: Omit<OgTemplateProps, "logoDataUrl"> & { logoDataUrl?: string },
): Promise<Buffer> {
  const response = await renderOgImageResponse(props);
  const bytes = Buffer.from(await response.arrayBuffer());
  try {
    return await sharp(bytes).png().toBuffer();
  } catch {
    return bytes;
  }
}

export function ogPngBufferToDataUrl(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
