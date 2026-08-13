import type { ReactNode } from "react";

/** Admin must never inherit the public Full Route Cache. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
