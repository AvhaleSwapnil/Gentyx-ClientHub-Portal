import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: tasks, error } = await supabase
      .from('onboarding_tasks')
      .select('task_id, task_title, assigned_to_role, due_date, status')
      .eq('client_id', Number(clientId))
      .order('task_id', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: tasks
    });

  } catch (err: any) {
    console.error("GET /api/tasks/client error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
