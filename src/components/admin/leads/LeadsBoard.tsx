"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import {
  isAdminFailure,
  isAdminSuccess,
} from "@/lib/cms/admin-redirect";
import type { DbLead, LeadStatus } from "@/lib/cms/types";
import { setLeadStatusAction } from "@/app/admin/(dashboard)/leads/actions";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";
import type { AdminMessages } from "@/i18n/admin/types";
import { adminBtn, adminBtnPrimary } from "@/components/admin/ui/styles";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";

const STATUSES: LeadStatus[] = ["new", "read", "archived"];

function parseStatusParam(raw: string | null): LeadStatus | "all" {
  if (raw === "new" || raw === "read" || raw === "archived" || raw === "all") {
    return raw;
  }
  return "all";
}

const COLUMN_META: Record<LeadStatus, { accent: string }> = {
  new: { accent: "#2600ff" },
  read: { accent: "#3d3" },
  archived: { accent: "#888" },
};

function telegramDeepLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return null;
  return `https://t.me/+${digits}`;
}

function relativeTime(iso: string, leads: AdminMessages["leads"]): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return leads.justNow;
  if (min < 60) return formatAdminMessage(leads.minutesAgo, { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return formatAdminMessage(leads.hoursAgo, { n: h });
  const d = Math.floor(h / 24);
  if (d < 14) return formatAdminMessage(leads.daysAgo, { n: d });
  return new Date(iso).toLocaleDateString();
}

function groupByStatus(leads: DbLead[]): Record<LeadStatus, DbLead[]> {
  const map: Record<LeadStatus, DbLead[]> = {
    new: [],
    read: [],
    archived: [],
  };
  for (const lead of leads) {
    map[lead.status]?.push(lead);
  }
  return map;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

type Props = {
  leads: DbLead[];
};

export function LeadsBoard({ leads: initialLeads }: Props) {
  const t = useAdminT();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState(initialLeads);
  const [synced, setSynced] = useState(initialLeads);
  if (initialLeads !== synced) {
    setSynced(initialLeads);
    setLeads(initialLeads);
  }

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilterState] = useState<LeadStatus | "all">(() =>
    parseStatusParam(searchParams.get("status")),
  );
  const statusFromUrl = parseStatusParam(searchParams.get("status"));
  const [statusUrlSnapshot, setStatusUrlSnapshot] = useState(statusFromUrl);
  if (statusFromUrl !== statusUrlSnapshot) {
    setStatusUrlSnapshot(statusFromUrl);
    setStatusFilterState(statusFromUrl);
  }
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const snapshotRef = useRef(leads);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${ADMIN_MD_BREAKPOINT}px)`);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const setStatusFilter = (status: LeadStatus | "all") => {
    setStatusFilterState(status);
    const url = new URL(window.location.href);
    if (status === "all") url.searchParams.delete("status");
    else url.searchParams.set("status", status);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) => {
      const hay =
        `${lead.name} ${lead.phone} ${lead.message} ${lead.locale ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [leads, q]);

  const columns = useMemo(() => groupByStatus(filtered), [filtered]);
  const activeLead = activeId
    ? (leads.find((lead) => lead.id === activeId) ?? null)
    : null;
  const selected = selectedId
    ? (leads.find((lead) => lead.id === selectedId) ?? null)
    : null;

  const csvHref = useMemo(() => {
    const header = [
      "id",
      "name",
      "phone",
      "message",
      "status",
      "locale",
      "created_at",
      "attachment_url",
    ];
    const rows = leads.map((lead) =>
      [
        lead.id,
        lead.name,
        lead.phone,
        lead.message,
        lead.status,
        lead.locale ?? "",
        lead.created_at,
        lead.attachment_url ?? "",
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
    return `data:text/csv;charset=utf-8,${encodeURIComponent(
      [header.join(","), ...rows].join("\n"),
    )}`;
  }, [leads]);

  const statusLabel = (status: LeadStatus) => {
    if (status === "new") return t.leads.statusNew;
    if (status === "read") return t.leads.statusRead;
    return t.leads.statusArchived;
  };

  const persistStatus = (id: string, status: LeadStatus, rollback: DbLead[]) => {
    startTransition(async () => {
      try {
        const result = await setLeadStatusAction(id, status);
        if (isAdminFailure(result)) {
          adminToastError(result.error);
          setLeads(rollback);
          setSynced(rollback);
          return;
        }
        if (isAdminSuccess(result)) {
          adminToastSuccess(result.message ?? t.leads.statusUpdated);
        }
        setSynced((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
        );
      } catch (err) {
        adminToastError(
          err instanceof Error ? err.message : t.leads.moveFailed,
        );
        setLeads(rollback);
        setSynced(rollback);
      }
    });
  };

  const moveLead = (id: string, status: LeadStatus) => {
    const current = leads.find((lead) => lead.id === id);
    if (!current || current.status === status) return;
    const rollback = leads;
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
    );
    persistStatus(id, status, rollback);
  };

  const resolveStatus = (overId: string): LeadStatus | null => {
    if (STATUSES.includes(overId as LeadStatus)) return overId as LeadStatus;
    return leads.find((l) => l.id === overId)?.status ?? null;
  };

  const onDragStart = (event: DragStartEvent) => {
    snapshotRef.current = leads;
    setActiveId(String(event.active.id));
  };

  const onDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    const id = activeId;
    if (!overId || !id) return;
    const overStatus = resolveStatus(overId);
    if (!overStatus) return;
    setLeads((prev) => {
      const active = prev.find((l) => l.id === id);
      if (!active || active.status === overStatus) return prev;
      return prev.map((lead) =>
        lead.id === id ? { ...lead, status: overStatus } : lead,
      );
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id);
    setActiveId(null);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) {
      setLeads(snapshotRef.current);
      return;
    }
    const nextStatus = resolveStatus(overId);
    const original = snapshotRef.current.find((l) => l.id === id);
    if (!nextStatus || !original) {
      setLeads(snapshotRef.current);
      return;
    }
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status: nextStatus } : lead,
      ),
    );
    if (original.status === nextStatus) return;
    persistStatus(id, nextStatus, snapshotRef.current);
  };

  const statusList = useMemo(() => {
    if (statusFilter === "all") return filtered;
    return filtered.filter((lead) => lead.status === statusFilter);
  }, [filtered, statusFilter]);

  const visibleStatuses = useMemo(
    () =>
      statusFilter === "all"
        ? STATUSES
        : STATUSES.filter((status) => status === statusFilter),
    [statusFilter],
  );

  const statusChips = (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        marginBottom: 14,
        paddingBottom: 2,
      }}
    >
      {(["all", ...STATUSES] as const).map((status) => {
        const active = statusFilter === status;
        const label = status === "all" ? t.leads.total : statusLabel(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            style={{
              ...adminBtn,
              flexShrink: 0,
              background: active ? "#fff" : "#1a1a1a",
              color: active ? "#000" : "#fff",
              fontWeight: active ? 600 : 400,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title={t.leads.title}
        description={
          <>
            {t.leads.description}
            {pending ? (
              <span style={{ display: "block", color: "#aaa", marginTop: 6 }}>
                {t.leads.saving}
              </span>
            ) : null}
          </>
        }
        actions={
          <a
            href={csvHref}
            download={`leads-${new Date().toISOString().slice(0, 10)}.csv`}
            style={{ ...adminBtn, textDecoration: "none" }}
          >
            {t.leads.exportCsv}
          </a>
        }
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.leads.search}
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            padding: 12,
            minHeight: 44,
            background: "#111",
            border: "1px solid #333",
            color: "#fff",
            boxSizing: "border-box",
          }}
        />
        <span style={{ fontSize: 12, color: "#666" }}>
          {t.leads.total}: {leads.length}
        </span>
      </div>

      {statusChips}

      {isDesktop === null ? (
        <div
          aria-hidden
          style={{
            minHeight: 240,
            border: "1px solid #222",
            borderRadius: 0,
            background: "#0a0a0a",
          }}
        />
      ) : !isDesktop ? (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {statusList.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedId(lead.id)}
                style={{
                  textAlign: "left",
                  border: "1px solid #2a2a2a",
                  background: selectedId === lead.id ? "#161616" : "#0f0f0f",
                  color: "#fff",
                  borderRadius: 0,
                  padding: 14,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                <LeadCardFace lead={lead} />
              </button>
            ))}
            {statusList.length === 0 ? (
              <p style={{ color: "#888", margin: 0 }}>{t.leads.empty}</p>
            ) : null}
          </div>
        </>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={() => {
            setActiveId(null);
            setLeads(snapshotRef.current);
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                visibleStatuses.length === 1
                  ? "minmax(0, 420px)"
                  : "repeat(3, minmax(0, 1fr))",
              gap: 14,
              alignItems: "start",
            }}
          >
            {visibleStatuses.map((status) => (
              <LeadColumn
                key={status}
                status={status}
                title={statusLabel(status)}
                hint={
                  status === "new"
                    ? t.leads.hintNew
                    : status === "read"
                      ? t.leads.hintRead
                      : t.leads.hintArchived
                }
                accent={COLUMN_META[status].accent}
                items={columns[status]}
                selectedId={selectedId}
                onOpen={(id) => setSelectedId(id)}
                emptyLabel={t.leads.dropHere}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <div style={{ width: 280, opacity: 0.95 }}>
                <LeadCardFace lead={activeLead} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {isDesktop && statusList.length === 0 ? (
        <p style={{ color: "#888", marginTop: 24 }}>{t.leads.empty}</p>
      ) : null}

      <LeadDetailPanel
        lead={selected}
        statusLabel={statusLabel}
        onClose={() => setSelectedId(null)}
        onStatus={(status) => {
          if (selected) moveLead(selected.id, status);
        }}
      />
    </div>
  );
}

function LeadColumn({
  status,
  title,
  hint,
  accent,
  items,
  selectedId,
  onOpen,
  emptyLabel,
}: {
  status: LeadStatus;
  title: string;
  hint: string;
  accent: string;
  items: DbLead[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  emptyLabel: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      style={{
        minHeight: 420,
        background: isOver ? "#12121a" : "#0a0a0a",
        border: `1px solid ${isOver ? accent : "#333"}`,
        display: "flex",
        flexDirection: "column",
        minWidth: 240,
      }}
    >
      <header
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #222",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 0,
                background: accent,
                display: "inline-block",
              }}
            />
            {title}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>
            {hint}
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#aaa",
            border: "1px solid #333",
            padding: "2px 8px",
            minWidth: 28,
            textAlign: "center",
          }}
        >
          {items.length}
        </span>
      </header>

      <div
        style={{
          padding: 10,
          display: "grid",
          gap: 10,
          flex: 1,
          alignContent: "start",
        }}
      >
        {items.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            selected={lead.id === selectedId}
            onOpen={() => onOpen(lead.id)}
          />
        ))}
        {items.length === 0 ? (
          <p
            style={{
              margin: "24px 8px",
              textAlign: "center",
              fontSize: 12,
              color: "#555",
            }}
          >
            {emptyLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function DraggableLeadCard({
  lead,
  selected,
  onOpen,
}: {
  lead: DbLead;
  selected?: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id, data: { status: lead.status } });
  const dragMoved = useRef(false);

  useEffect(() => {
    if (isDragging) dragMoved.current = true;
  }, [isDragging]);

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    outline: selected ? "2px solid #2600ff" : "1px solid transparent",
    outlineOffset: 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (dragMoved.current) {
          dragMoved.current = false;
          return;
        }
        onOpen();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <LeadCardFace lead={lead} />
    </div>
  );
}

function LeadCardFace({
  lead,
  dragging,
}: {
  lead: DbLead;
  dragging?: boolean;
}) {
  const t = useAdminT();
  return (
    <article
      style={{
        border: "1px solid #333",
        background: dragging ? "#161622" : "#111",
        padding: 12,
        display: "grid",
        gap: 8,
        boxShadow: dragging ? "0 12px 40px rgba(0,0,0,0.45)" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "start",
        }}
      >
        <strong
          style={{
            fontSize: 14,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {lead.name}
        </strong>
        {lead.attachment_url ? (
          <span
            style={{
              fontSize: 10,
              color: "#8cf",
              flexShrink: 0,
              border: "1px solid #345",
              padding: "2px 6px",
            }}
          >
            {t.common.file}
          </span>
        ) : null}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#8ab4f8" }}>{lead.phone}</p>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "#999",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.35,
          minHeight: "2.7em",
        }}
      >
        {lead.message.trim() || "—"}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          fontSize: 11,
          color: "#666",
          borderTop: "1px solid #222",
          paddingTop: 8,
        }}
      >
        <span>{relativeTime(lead.created_at, t.leads)}</span>
        <span>{lead.locale?.toUpperCase() || "—"}</span>
      </div>
    </article>
  );
}

function LeadDetailPanel({
  lead,
  statusLabel,
  onClose,
  onStatus,
}: {
  lead: DbLead | null;
  statusLabel: (status: LeadStatus) => string;
  onClose: () => void;
  onStatus: (status: LeadStatus) => void;
}) {
  const t = useAdminT();
  const tg = lead ? telegramDeepLink(lead.phone) : null;

  return (
    <AdminDrawer
      open={Boolean(lead)}
      onClose={onClose}
      title={t.leads.detailTitle}
      footer={
        lead ? (
          <>
            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                {t.leads.moveTo}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatus(status)}
                    style={{
                      ...adminBtn,
                      flex: "1 1 auto",
                      ...(lead.status === status
                        ? {
                            background: "#fff",
                            color: "#000",
                            fontWeight: 600,
                          }
                        : null),
                    }}
                  >
                    {statusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
            {tg ? (
              <a
                href={tg}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...adminBtnPrimary,
                  textDecoration: "none",
                  width: "100%",
                }}
              >
                {t.leads.openTelegram}
              </a>
            ) : null}
          </>
        ) : null
      }
    >
      {lead ? (
        <div style={{ display: "grid", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
            {statusLabel(lead.status)} ·{" "}
            {new Date(lead.created_at).toLocaleString()}
          </p>
          <Field label={t.leads.name}>{lead.name}</Field>
          <Field label={t.leads.phone}>
            <a href={`tel:${lead.phone}`} style={{ color: "#8cf" }}>
              {lead.phone}
            </a>
          </Field>
          <Field label={t.leads.message}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#ddd" }}>
              {lead.message || "—"}
            </p>
          </Field>
          {lead.attachment_url ? (
            <Field label={t.leads.attachment}>
              <a
                href={lead.attachment_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#8cf" }}
              >
                {t.leads.openAttachment} ↗
              </a>
            </Field>
          ) : null}
          <Field label={t.leads.locale}>
            {(lead.locale || "—").toUpperCase()}
          </Field>
        </div>
      ) : null}
    </AdminDrawer>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>{label}</p>
      <div style={{ fontSize: 14, color: "#fff" }}>{children}</div>
    </div>
  );
}
