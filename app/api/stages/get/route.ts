import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = Number(searchParams.get("clientId"));

    if (!clientId) {
      return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch client stages
    const { data: stages, error: stagesError } = await supabase
      .from('client_stages')
      .select('*')
      .eq('client_id', clientId)
      .order('order_number', { ascending: true });

    if (stagesError) throw stagesError;

    // 2. Fetch subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('client_stage_subtasks')
      .select('*, client_stages!inner(client_id)')
      .eq('client_stages.client_id', clientId)
      .order('order_number', { ascending: true });

    if (subtasksError) throw subtasksError;

    // 3. Group subtasks under stages
    const stagesWithTasks = stages?.map(stage => ({
      ...stage,
      tasks: subtasks?.filter((t: any) => t.client_stage_id === stage.id) || [],
    })) || [];

    return NextResponse.json({ success: true, data: stagesWithTasks });

  } catch (err: any) {
    console.error("GET /api/stages/get error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch stages" }, { status: 500 });
  }
}
