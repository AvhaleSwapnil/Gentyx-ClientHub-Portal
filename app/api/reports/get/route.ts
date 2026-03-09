import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req, ["ADMIN"]);
    if (authResponse) return authResponse;

    const body = await req.json();

    const {
      fromDate = null,
      toDate = null,
      serviceCenter = null,
      cpa = null,
      stage = null,
      status = null,
    } = body;

    const supabase = createServerClient();

    // 1. Build Query with relational joins
    let query = supabase
      .from('Clients')
      .select(`
        client_id,
        client_name,
        code,
        client_status,
        stage_id,
        progress,
        created_at,
        stage:onboarding_stages!stage_id(stage_name),
        service_center:service_centers(center_name),
        cpa:cpa_centers(cpa_name),
        tasks:onboarding_tasks(status)
      `);

    // 2. Apply Filters
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);
    if (serviceCenter) query = query.eq('service_center_id', serviceCenter);
    if (cpa) query = query.eq('cpa_id', cpa);
    if (stage) query = query.eq('stage_id', stage);
    if (status) query = query.eq('client_status', status);

    const { data: rawClients, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 3. Process aggregates in JS
    const processedClients = (rawClients || []).map(c => {
      const tasks = c.tasks || [];
      const pending_tasks = tasks.filter((t: any) => t.status === 'Pending').length;
      const inreview_tasks = tasks.filter((t: any) => t.status === 'In Review').length;
      const approved_tasks = tasks.filter((t: any) => t.status === 'Approved').length;
      const rejected_tasks = tasks.filter((t: any) => t.status === 'Rejected').length;

      const stageData = Array.isArray(c.stage) ? c.stage[0] : c.stage;
      const scData = Array.isArray(c.service_center) ? c.service_center[0] : c.service_center;
      const cpaData = Array.isArray(c.cpa) ? c.cpa[0] : c.cpa;

      return {
        client_id: c.client_id,
        client_name: c.client_name,
        code: c.code,
        client_status: c.client_status,
        stage_id: c.stage_id,
        stage_name: (stageData as any)?.stage_name || 'N/A',
        progress: c.progress,
        service_center: (scData as any)?.center_name || 'N/A',
        cpa: (cpaData as any)?.cpa_name || 'N/A',
        created_at: c.created_at,
        pending_tasks,
        inreview_tasks,
        approved_tasks,
        rejected_tasks
      };
    });

    return NextResponse.json({
      success: true,
      clients: processedClients,
    });
  } catch (err: any) {
    console.error("GET REPORT ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
