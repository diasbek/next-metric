"use client";

import { hardNavCreate } from "@/components/admin/HardNavForm";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";
import { useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createProjectAction,
  reorderProjectsAction,
} from "@/app/admin/(dashboard)/works/actions";
import { adminBtn, adminBtnPrimary } from "@/components/admin/ui/styles";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { useAdminT } from "@/i18n/admin";

export type ProjectListItem = {
  id: string;
  slug: string;
  status: string;
  cover_image: string;
  title: string;
};

type Props = { projects: ProjectListItem[]; embedded?: boolean };
type StatusFilter = "all" | "published" | "draft";

function parseWorksStatus(raw: string | null): StatusFilter {
  if (raw === "published" || raw === "draft" || raw === "all") return raw;
  return "all";
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  const t = useAdminT();
  const statusLabel =
    project.status === "published" ? t.common.published : t.common.draft;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #333",
        color: "#fff",
        background: "#0a0a0a",
        overflow: "hidden",
        minHeight: 220,
        height: "100%",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 10",
          background: "#161616",
          borderBottom: "1px solid #222",
        }}
      >
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              color: "#555",
              fontSize: 12,
            }}
          >
            {t.pages.works.noCover}
          </div>
        )}
      </div>
      <div style={{ padding: 14, display: "grid", gap: 6, flex: 1 }}>
        <strong style={{ fontSize: 15 }}>{project.title || project.slug}</strong>
        <span style={{ fontSize: 12, color: "#777" }}>{project.slug}</span>
        <span
          style={{
            marginTop: "auto",
            fontSize: 11,
            fontWeight: 600,
            color: project.status === "published" ? "#8c8" : "#a86",
          }}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

export function ProjectsList({ projects, embedded = false }: Props) {
  const t = useAdminT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilterState] = useState<StatusFilter>(() =>
    parseWorksStatus(searchParams.get("status")),
  );
  const filterFromUrl = parseWorksStatus(searchParams.get("status"));
  const [filterUrlSnapshot, setFilterUrlSnapshot] = useState(filterFromUrl);
  if (filterFromUrl !== filterUrlSnapshot) {
    setFilterUrlSnapshot(filterFromUrl);
    setFilterState(filterFromUrl);
  }
  const [q, setQ] = useState("");
  const [ordered, setOrdered] = useOrderedItems(projects);
  const { pending, saved, onDragEnd } = usePersistReorder(
    projects,
    ordered,
    setOrdered,
    reorderProjectsAction,
  );

  const setFilter = (next: StatusFilter) => {
    setFilterState(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("status");
    else url.searchParams.set("status", next);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const filtering = filter !== "all" || Boolean(q.trim());

  const filtered = useMemo(() => {
    return ordered.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      const hay = `${p.title} ${p.slug}`.toLowerCase();
      if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
      return true;
    });
  }, [ordered, filter, q]);

  const openProject = (id: string) => {
    router.push(`/admin/works/${id}/`);
  };

  const hint: CSSProperties = { color: "#888", margin: "8px 0 0" };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {!embedded ? (
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <AdminPageHeader
              title={t.pages.works.title}
              description={t.pages.works.description}
            />
            <ReorderStatus pending={pending} saved={saved} />
          </div>
        ) : (
          <div>
            {filtering ? (
              <p style={{ ...hint, margin: 0 }}>{t.pages.works.filterReorderOff}</p>
            ) : null}
            <ReorderStatus pending={pending} saved={saved} />
          </div>
        )}
        <form
          action={hardNavCreate(createProjectAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={adminBtnPrimary}>
            {t.pages.works.newItem}
          </button>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(["all", "published", "draft"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            style={{
              ...adminBtn,
              background: filter === item ? "#fff" : "#1a1a1a",
              color: filter === item ? "#000" : "#fff",
            }}
          >
            {item === "all"
              ? t.common.all
              : item === "published"
                ? t.common.published
                : t.common.draft}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.pages.works.searchPlaceholder}
          style={{
            flex: "1 1 180px",
            minWidth: 160,
            padding: 10,
            background: "#111",
            border: "1px solid #333",
            color: "#fff",
          }}
        />
      </div>

      <SortableCardGrid
        items={filtering ? filtered : ordered}
        onDragEnd={onDragEnd}
        disabled={filtering}
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
        renderItem={(project) =>
          filtering ? (
            <a
              href={`/admin/works/${project.id}/`}
              style={{ display: "block", height: "100%", textDecoration: "none" }}
            >
              <ProjectCard project={project} />
            </a>
          ) : (
            <SortableCard
              id={project.id}
              onActivate={() => openProject(project.id)}
            >
              <ProjectCard project={project} />
            </SortableCard>
          )
        }
      />
      {filtered.length === 0 ? (
        <p style={{ color: "#888", marginTop: 24 }}>{t.common.emptyList}</p>
      ) : null}
    </div>
  );
}
