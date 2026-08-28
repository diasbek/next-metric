"use client";

import Image from "next/image";
import Link from "next/link";
import { HardNavForm } from "@/components/admin/HardNavForm";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";
import { CASE_CARD_MEDIA_ASPECT_CSS } from "@/components/admin/image-field/presets";
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
  /** True when this slug is listed under Home → Case studies. */
  onHome?: boolean;
  /** 1-based order on the homepage (null if not on home). */
  homeOrder?: number | null;
};

type Props = { projects: ProjectListItem[]; embedded?: boolean };
type StatusFilter = "all" | "published" | "draft" | "home";

function parseWorksStatus(raw: string | null): StatusFilter {
  if (raw === "published" || raw === "draft" || raw === "all" || raw === "home") {
    return raw;
  }
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
        border: project.onHome ? "1px solid #3a3a8a" : "1px solid #333",
        color: "#fff",
        background: "#0a0a0a",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: CASE_CARD_MEDIA_ASPECT_CSS,
          background: "#161616",
          borderBottom: "1px solid #222",
          overflow: "hidden",
        }}
      >
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt=""
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1200px) 40vw, 420px"
            quality={90}
            className="object-cover"
            style={{ objectPosition: "center" }}
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
        {project.onHome ? (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.02em",
              background: "#2600ff",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {project.homeOrder
              ? `${t.pages.works.onHomeBadge} · #${project.homeOrder}`
              : t.pages.works.onHomeBadge}
          </span>
        ) : null}
      </div>
      <div style={{ padding: 14, display: "grid", gap: 6, flex: 1 }}>
        <strong style={{ fontSize: 15 }}>{project.title || project.slug}</strong>
        <span style={{ fontSize: 12, color: "#777" }}>{project.slug}</span>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: project.status === "published" ? "#8c8" : "#a86",
            }}
          >
            {statusLabel}
          </span>
          {project.onHome ? (
            <Link
              href="/admin/home/?section=case-studies"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: 11,
                color: "#9af",
                textDecoration: "none",
              }}
            >
              {t.pages.works.onHomeEditLink}
            </Link>
          ) : null}
        </div>
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
      if (filter === "home") {
        if (!p.onHome) return false;
      } else if (filter !== "all" && p.status !== filter) {
        return false;
      }
      const hay = `${p.title} ${p.slug}`.toLowerCase();
      if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
      return true;
    });
  }, [ordered, filter, q]);

  const homeCount = useMemo(
    () => projects.filter((p) => p.onHome).length,
    [projects],
  );

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
        <HardNavForm
          action={createProjectAction}
          successMessage={t.common.created}
        >
          <button type="submit" style={adminBtnPrimary}>
            {t.pages.works.newItem}
          </button>
        </HardNavForm>
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
        {(
          [
            ["all", t.common.all],
            ["published", t.common.published],
            ["draft", t.common.draft],
            ["home", `${t.pages.works.onHomeFilter}${homeCount ? ` (${homeCount})` : ""}`],
          ] as const
        ).map(([item, label]) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            style={{
              ...adminBtn,
              background: filter === item ? "#fff" : "#1a1a1a",
              color: filter === item ? "#000" : "#fff",
              ...(item === "home" && filter !== item
                ? { borderColor: "#3a3a8a", color: "#bcb" }
                : {}),
            }}
          >
            {label}
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

      {filter === "home" ? (
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "#888", lineHeight: 1.4 }}>
          {t.pages.works.onHomeHint}{" "}
          <Link href="/admin/home/?section=case-studies" style={{ color: "#8af" }}>
            {t.pages.works.onHomeEditLink}
          </Link>
        </p>
      ) : null}

      <SortableCardGrid
        items={filtering ? filtered : ordered}
        onDragEnd={onDragEnd}
        disabled={filtering}
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
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
        <p style={{ color: "#888", marginTop: 24 }}>
          {projects.length === 0
            ? t.pages.works.empty
            : filter === "home"
              ? t.pages.works.onHomeEmpty
              : t.common.emptyList}
        </p>
      ) : null}
    </div>
  );
}
