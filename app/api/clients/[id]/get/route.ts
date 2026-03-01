import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const { id } = await context.params;
    const clientId = Number(id);

    if (!clientId || Number.isNaN(clientId)) {
      return NextResponse.json({ success: false, error: "Invalid client ID" }, { status: 400 });
    }

    // RBAC check: Non-admins can only see their own client data (if applicable)
    if (session?.role === 'CLIENT') {
      const clientToken = req.cookies.get("clienthub_clientId")?.value;
      if (Number(clientToken) !== clientId) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot access this client's data" }, { status: 403 });
      }
    }

    const supabase = createServerClient();

    // 1. Fetch client details with joins
    const { data: client, error: clientError } = await supabase
      .from('Clients')
      .select(`
        *,
        service_center:service_centers(center_name, email),
        cpa:cpa_centers(cpa_name, email),
        stages:client_stages(
          client_stage_id,
          stage_name,
          order_number,
          status,
          is_required,
          total_subtasks:client_stage_subtasks(count),
          completed_subtasks:client_stage_subtasks(count)
        )
      `)
      .eq('client_id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    // Supabase can't do complex status checks easily in one select for children.
    // We'll calculate progress in JS.
    const stages = client.stages || [];
    const totalStages = stages.length;
    let completedStagesCount = 0;

    for (const stage of stages) {
      // In a real app we'd fetch the counts differently or use the aggregate feature
      // But for simplicity here, we'll assume most UI logic will re-calculate anyway.
      if (stage.status === 'Completed') completedStagesCount++;
    }

    const progress = totalStages > 0 ? Math.round((completedStagesCount / totalStages) * 100) : 0;

    // 2. Fetch associated users
    const { data: associatedUsers } = await supabase
      .from('client_users')
      .select('id, user_name, email, role, phone, created_at')
      .eq('client_id', clientId)
      .order('id', { ascending: true });

    const sc = Array.isArray(client.service_center) ? client.service_center[0] : client.service_center;
    const cpa = Array.isArray(client.cpa) ? client.cpa[0] : client.cpa;

    const responseData = {
      ...client,
      status: client.client_status,
      service_center_name: sc?.center_name,
      service_center_email: sc?.email,
      cpa_name: cpa?.cpa_name,
      cpa_email: cpa?.email,
      progress,
      total_stages: totalStages,
      completed_stages: completedStagesCount,
      associated_users: associatedUsers || []
    };

    return NextResponse.json({ success: true, data: responseData });

  } catch (err: any) {
    console.error("GET client error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch client" }, { status: 500 });
  }
}
