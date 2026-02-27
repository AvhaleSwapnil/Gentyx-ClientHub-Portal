import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { calculateClientProgress } from "@/lib/progress";
import { logAudit, AuditActions } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task_id } = body;

    if (!task_id) {
      return NextResponse.json({ success: false, error: "task_id is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch clientId using task_id (before delete)
    const { data: task, error: fetchError } = await supabase
      .from('onboarding_tasks')
      .select('client_id')
      .eq('task_id', task_id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ success: false, error: "Client not found for this task" }, { status: 404 });
    }

    const clientId = task.client_id;

    // 2. DELETE the task
    const { error: deleteError } = await supabase
      .from('onboarding_tasks')
      .delete()
      .eq('task_id', task_id);

    if (deleteError) throw deleteError;

    // 3. Recalculate client progress
    if (clientId) {
      try {
        await calculateClientProgress(clientId);
      } catch (progressError) {
        console.error("Progress calculation failed after delete:", progressError);
      }

      // Audit log
      logAudit({
        clientId: clientId,
        action: AuditActions.TASK_DELETED,
        actorRole: "ADMIN",
        details: `Task #${task_id}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/tasks/delete error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
