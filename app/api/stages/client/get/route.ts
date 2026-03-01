import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID required" }, { status: 400 });
    }

    // RBAC check: Non-admins can only see their own client's stages
    if (session?.role === 'CLIENT') {
      const secureClientId = req.cookies.get("clienthub_clientId")?.value;
      if (Number(secureClientId) !== Number(clientId)) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot access another client's stages" }, { status: 403 });
      }
    }

    const supabase = createServerClient();

    // 1. Fetch Stages
    const { data: stages, error: stagesError } = await supabase
      .from('client_stages')
      .select('*')
      .eq('client_id', Number(clientId))
      .order('order_number', { ascending: true });

    if (stagesError) throw stagesError;

    // 2. Fetch Subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('client_stage_subtasks')
      .select(`
        *,
        client_stage:client_stages!inner(client_id)
      `)
      .eq('client_stage.client_id', Number(clientId))
      .order('order_number', { ascending: true });

    if (subtasksError) throw subtasksError;

    return NextResponse.json({
      success: true,
      data: stages,
      subtasks: subtasks.map(s => {
        const { client_stage, ...rest } = s;
        return rest;
      }),
    });

  } catch (err: any) {
    console.error("GET /api/stages/client/get error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
