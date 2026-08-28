import type { ResolvedTag } from "@/lib/cms/tags";

export function resolveTagDisplays(
  slugs: readonly string[],
  taxonomy: readonly ResolvedTag[],
): Array<{ slug: string; label: string }> {
  const bySlug = new Map(
    taxonomy.map((tag) => [tag.slug.toLowerCase(), tag.label]),
  );
  return slugs
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((slug) => ({
      slug,
      label: bySlug.get(slug.toLowerCase()) ?? slug,
    }));
}
