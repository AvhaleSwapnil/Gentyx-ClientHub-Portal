import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");

    const supabase = createServerClient();

    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        client_id,
        action,
        actor_role,
        details,
        created_at
      `);

    if (clientId) {
      query = query.eq('client_id', Number(clientId));
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (err: any) {
    console.error("GET /api/audit/get error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
