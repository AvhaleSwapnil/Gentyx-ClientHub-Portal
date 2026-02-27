import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const supabase = createServerClient();

    let query = supabase
      .from('onboarding_tasks')
      .select(`
        id:task_id,
        stageId:stage_id,
        clientId:client_id,
        clientName:public_Clients(client_name),
        title:task_title,
        assigneeRole:assigned_to_role,
        status,
        dueDate:due_date,
        created_at,
        documentRequired:document_required
      `)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', Number(clientId));
    }

    const { data, error } = await query;

    if (error) throw error;

    // Supabase returns the joined clientName as an object/array, so we need to flatten it
    const flattenedData = data?.map((task: any) => ({
      ...task,
      clientName: Array.isArray(task.clientName) ? task.clientName[0]?.client_name : task.clientName?.client_name || "Unknown Client"
    }));

    return NextResponse.json({
      success: true,
      data: flattenedData,
      total: flattenedData?.length || 0,
      page: 1,
      pageSize: flattenedData?.length || 0,
    });

  } catch (err: any) {
    console.error("GET /api/tasks/list error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
