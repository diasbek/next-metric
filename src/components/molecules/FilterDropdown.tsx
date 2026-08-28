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
import { useIsClient } from "@/hooks/use-is-client";

export type FilterDropdownOption = {
  value: string;
  label: string;
};

interface FilterDropdownProps {
  label: string;
  options: readonly (string | FilterDropdownOption)[];
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
}

function normalizeOption(
  option: string | FilterDropdownOption,
  allLabel: string,
  groupLabel: string,
): FilterDropdownOption {
  if (typeof option === "string") {
    return {
      value: option,
      label: option === allLabel ? groupLabel : option,
    };
  }
  return {
    value: option.value,
    label: option.value === allLabel ? groupLabel : option.label,
  };
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  allLabel,
}: FilterDropdownProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const normalized = options.map((option) =>
    normalizeOption(option, allLabel, label),
  );
  const selected = normalized.find((option) => option.value === value);
  const displayValue = value === allLabel ? label : (selected?.label ?? value);

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
      minWidth: rect.width,
      zIndex: 80,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    const frame = requestAnimationFrame(() => updatePosition());

    const onLayout = () => updatePosition();

    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, updatePosition, options.length]);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      const selectedBtn = menuRef.current?.querySelector<HTMLButtonElement>(
        '[role="option"][aria-selected="true"]',
      );
      const first = menuRef.current?.querySelector<HTMLButtonElement>('[role="option"]');
      (selectedBtn ?? first)?.focus();
    });

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
        return;
      }

      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

      const buttons = Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
      );
      if (!buttons.length) return;

      event.preventDefault();
      const currentIndex = buttons.findIndex((button) => button === document.activeElement);
      let nextIndex = currentIndex;

      if (event.key === "ArrowDown") {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
      } else if (event.key === "ArrowUp") {
        nextIndex =
          currentIndex < 0
            ? buttons.length - 1
            : (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = buttons.length - 1;
      }

      buttons[nextIndex]?.focus();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
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
            className="ui-select__menu"
            role="listbox"
            aria-label={label}
            style={menuStyle}
          >
            {normalized.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value} className="ui-select__menu-option" role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`ui-select__menu-item ${
                      isSelected ? "is-active" : ""
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
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
      className={`ui-select ${open ? "is-open" : ""}`.trim()}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ui-select__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="ui-select__value">{displayValue}</span>
        <span className="ui-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {menu}
    </div>
  );
}
