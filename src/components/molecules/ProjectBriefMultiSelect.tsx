"use client";

import { useCallback } from "react";
import type { ProjectBriefServiceId } from "@/data/project-brief";

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

/** Concept brief chips (`.chs` / `.ch-o`). */
export function ProjectBriefMultiSelect({
  label,
  options,
  value,
  onChange,
}: ProjectBriefMultiSelectProps) {
  const toggle = useCallback(
    (id: ProjectBriefServiceId) => {
      onChange(
        value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
      );
    },
    [onChange, value],
  );

  return (
    <div className="chs" role="group" aria-label={label}>
      {options.map((option) => {
        const pressed = value.includes(option.id);
        return (
          <button
            key={option.id}
            className="ch-o"
            type="button"
            aria-pressed={pressed}
            onClick={() => toggle(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
