import type { CaseBlock, CaseGalleryImage } from "@/data/projects";

export type CaseStripImage = {
  src: string;
  width?: number | null;
  height?: number | null;
  alt?: string;
};

/** Flatten gallery blocks into an ordered strip (public + admin preview). */
export function caseStripFromBlocks(
  blocks: CaseBlock[],
  fallbacks: { heroImage?: string; coverImage?: string } = {},
): CaseStripImage[] {
  const seen = new Set<string>();
  const images: CaseStripImage[] = [];
  const push = (image?: Partial<CaseGalleryImage> & { url?: string; alt?: string }) => {
    const url = image?.url?.trim();
    if (!url || !image || seen.has(url)) return;
    seen.add(url);
    images.push({
      src: url,
      width: image.width,
      height: image.height,
      alt: image.alt,
    });
  };

  for (const block of blocks) {
    if (block.type === "gallery") {
      for (const image of block.images) {
        push(image);
      }
    }
  }

  if (!images.length) {
    push({ url: fallbacks.heroImage });
    push({ url: fallbacks.coverImage });
  }

  return images;
}

export type DraftMediaLike = {
  id: string;
  kind: string;
  url: string;
  alt?: string;
  sort_order: number;
  block_id: string | null;
  width?: number | null;
  height?: number | null;
};

export type DraftBlockLike = {
  id: string;
  type: string;
  sort_order: number;
  youtube_url?: string;
};

/** Build ordered content blocks for preview/public from CMS draft shape. */
export function orderedCaseContentBlocks(
  blocks: DraftBlockLike[],
  media: DraftMediaLike[],
): Array<
  | { id: string; type: "gallery"; images: CaseStripImage[] }
  | {
      id: string;
      type: "before_after";
      beforeImage?: string;
      afterImage?: string;
      beforeAlt?: string;
      afterAlt?: string;
    }
  | { id: string; type: "youtube"; youtubeUrl: string }
> {
  return blocks
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((block) => {
      if (block.type === "youtube") {
        const youtubeUrl = (block.youtube_url ?? "").trim();
        if (!youtubeUrl) return null;
        return { id: block.id, type: "youtube" as const, youtubeUrl };
      }
      if (block.type === "before_after") {
        const before = media.find(
          (m) => m.block_id === block.id && m.kind === "before",
        );
        const after = media.find(
          (m) => m.block_id === block.id && m.kind === "after",
        );
        return {
          id: block.id,
          type: "before_after" as const,
          beforeImage: before?.url,
          afterImage: after?.url,
          beforeAlt: before?.alt,
          afterAlt: after?.alt,
        };
      }
      const images = media
        .filter((m) => m.block_id === block.id && m.kind === "gallery")
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m) => ({
          src: m.url,
          width: m.width,
          height: m.height,
          alt: m.alt,
        }));
      return { id: block.id, type: "gallery" as const, images };
    })
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
}
