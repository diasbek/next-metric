import { requirePermission } from "@/lib/cms/auth";
import { getPublicMediaUrl, listMediaFiles } from "@/lib/cms/storage";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import Link from "next/link";

const PAGE_SIZE = 72;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string; error?: string; page?: string }>;
}) {
  await requirePermission("media");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const fetchLimit = page * PAGE_SIZE + 1;
  const paths = await listMediaFiles({ maxFiles: fetchLimit });
  const hasMore = paths.length > page * PAGE_SIZE;
  const pagePaths = paths.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <MediaLibrary
      files={pagePaths.map((path) => ({
        path,
        url: getPublicMediaUrl(path),
      }))}
      flash={{
        uploaded: Boolean(params.uploaded),
        error: params.error,
      }}
      pager={
        <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
          {page > 1 ? (
            <Link href={`/admin/media/?page=${page - 1}`} style={{ color: "#8cf" }}>
              ← Prev
            </Link>
          ) : null}
          <span style={{ color: "#777", fontSize: 13 }}>Page {page}</span>
          {hasMore ? (
            <Link href={`/admin/media/?page=${page + 1}`} style={{ color: "#8cf" }}>
              Next →
            </Link>
          ) : null}
        </div>
      }
    />
  );
}
