import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ success: false, error: "templateId required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch template stages
    const { data: stages, error: stagesError } = await supabase
      .from('default_stages')
      .select('*')
      .eq('template_id', Number(templateId))
      .order('order_number', { ascending: true });

    if (stagesError) throw stagesError;

    // 2. Fetch subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('default_stage_subtasks')
      .select('*')
      .in('default_stage_id', (stages || []).map(s => s.default_stage_id))
      .order('order_number', { ascending: true });

    if (subtasksError) throw subtasksError;

    // 3. Merge subtasks into stages
    const data = stages?.map(s => ({
      ...s,
      subtasks: subtasks?.filter(st => st.default_stage_id === s.default_stage_id) || [],
    })) || [];

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/default-stages/list error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
