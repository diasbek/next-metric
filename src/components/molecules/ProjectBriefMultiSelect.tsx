"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ProjectBriefServiceId } from "@/data/project-brief";
import { useIsClient } from "@/hooks/use-is-client";

type Option = {
  id: ProjectBriefServiceId;
  label: string;
};

type ProjectBriefMultiSelectProps = {
  label: string;
  hint: string;
  options: Option[];
  value: ProjectBriefServiceId[];
  onChange: (value: ProjectBriefServiceId[]) => void;
};

export function ProjectBriefMultiSelect({
  label,
  hint,
  options,
  value,
  onChange,
}: ProjectBriefMultiSelectProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedLabels = options
    .filter((option) => value.includes(option.id))
    .map((option) => option.label);
  const displayValue = selectedLabels.length
    ? selectedLabels.join(", ")
    : hint;
  const isEmpty = selectedLabels.length === 0;

  const toggle = useCallback(
    (id: ProjectBriefServiceId) => {
      onChange(
        value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
      );
    },
    [onChange, value],
  );

  const updatePosition = useCallback(() => {
    const anchor = rootRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const viewportPadding = 8;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const openAbove =
      menuHeight > 0 &&
      spaceBelow < menuHeight + gap &&
      spaceAbove > spaceBelow;

    setMenuStyle({
      position: "fixed",
      top: openAbove ? rect.top - menuHeight - gap : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      zIndex: 260,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    const frame = requestAnimationFrame(() => updatePosition());

    const handleLayoutChange = () => updatePosition();

    window.addEventListener("resize", handleLayoutChange);
    window.addEventListener("scroll", handleLayoutChange, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleLayoutChange);
      window.removeEventListener("scroll", handleLayoutChange, true);
    };
  }, [open, updatePosition, options.length, value.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const menu =
    open && mounted
      ? createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            className="project-brief__multiselect-menu"
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            style={menuStyle}
          >
            {options.map((option) => {
              const checked = value.includes(option.id);

              return (
                <li
                  key={option.id}
                  className="project-brief__multiselect-option"
                  role="none"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    className={`project-brief__multiselect-item${
                      checked ? " is-active" : ""
                    }`}
                    onClick={() => toggle(option.id)}
                  >
                    <span
                      className={`project-brief__multiselect-check${
                        checked ? " is-checked" : ""
                      }`}
                      aria-hidden
                    />
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={`project-brief__multiselect${open ? " is-open" : ""}${
        isEmpty ? " is-empty" : ""
      }`.trim()}
    >
      <button
        ref={triggerRef}
        type="button"
        className="project-brief__multiselect-trigger ui-input"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="project-brief__multiselect-value">{displayValue}</span>
      </button>
      {menu}
    </div>
  );
}
