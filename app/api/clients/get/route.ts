import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const pageSize = Math.max(parseInt(searchParams.get("pageSize") || "10"), 1);
    const q = (searchParams.get("q") || "").trim();
    const statusFilter = (searchParams.get("status") || "ALL").trim();
    const archiveFilter = (searchParams.get("archiveFilter") || "ALL").trim();

    const offset = (page - 1) * pageSize;

    const supabase = createServerClient();

    // 1. Build Base Query (Standardized snake_case)
    let query = supabase
      .from('Clients')
      .select(`
        *,
        service_center:service_centers(center_name, email),
        cpa_center:cpa_centers(cpa_name, email),
        stages:client_stages(stage_name, status, order_number, is_required)
      `, { count: 'exact' });

    // 2. Apply Filters
    if (archiveFilter !== 'ALL') {
      const isArchived = (archiveFilter === 'archived' || archiveFilter === 'true' || archiveFilter === '1');
      query = query.eq('is_archived', isArchived);
    }

    if (q) {
      query = query.or(`client_name.ilike.%${q}%,code.ilike.%${q}%,primary_contact_name.ilike.%${q}%`);
    }

    // 3. Fetch Data
    const { data: rawClients, count, error } = await query
      .order('is_archived', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    // 4. Process Status and Progress in JS
    const processedData = (rawClients || []).map(c => {
      const stages = c.stages || [];

      // Calculate status
      let status = 'Not Started';
      if (stages.length > 0) {
        const allCompleted = stages.every((s: any) => s.status === 'Completed');
        const someInProgress = stages.some((s: any) => s.status === 'In Progress' || s.status === 'Partially Completed');
        const someCompleted = stages.some((s: any) => s.status === 'Completed');

        if (allCompleted) status = 'Completed';
        else if (someInProgress || someCompleted) status = 'In Progress';
      }

      // Calculate progress
      const total = stages.length;
      const completed = stages.filter((s: any) => s.status === 'Completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Find current stage name
      const currentStage = stages.find((s: any) => s.status === 'In Progress')
        || stages.find((s: any) => s.status === 'Not Started' && s.is_required)
        || stages[0];

      return {
        ...c,
        status,
        progress,
        stage_name: currentStage?.stage_name || 'N/A'
      };
    });

    // 5. Apply Status Filter in memory
    let finalData = processedData;
    if (statusFilter !== 'ALL') {
      finalData = processedData.filter(c => c.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      data: finalData,
      page,
      pageSize,
      total: count || 0,
    });

  } catch (err: any) {
    console.error("GET /api/clients/get error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 });
  }
}
