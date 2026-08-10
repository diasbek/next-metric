import type { HTMLAttributes } from "react";

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  className?: string;
}

export function Divider({ className = "", ...rest }: DividerProps) {
  return (
    <hr className={`border-0 border-t border-white/20 ${className}`} {...rest} />
  );
}
