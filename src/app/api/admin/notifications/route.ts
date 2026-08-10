import { NextResponse } from "next/server";
import { leadToNotification } from "@/components/admin/chrome/notifications";
import { canAccess, getAdminSession } from "@/lib/cms/auth";
import type { LeadStatus } from "@/lib/cms/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || !canAccess(admin.role, "leads")) {
    return NextResponse.json({ items: [], unreadCount: 0 }, { status: 401 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [recent, newCount] = await Promise.all([
      supabase
        .from("leads")
        .select("id, name, phone, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
    ]);

    const items = (recent.data ?? []).map((row) =>
      leadToNotification({
        id: row.id as string,
        name: (row.name as string) ?? "",
        phone: (row.phone as string) ?? "",
        message: (row.message as string) ?? "",
        status: row.status as LeadStatus,
        created_at: row.created_at as string,
      }),
    );

    return NextResponse.json({
      items,
      unreadCount: newCount.count ?? 0,
    });
  } catch {
    return NextResponse.json({ items: [], unreadCount: 0 });
  }
}
