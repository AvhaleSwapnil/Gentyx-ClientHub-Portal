import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { calculateClientProgress } from "@/lib/progress";
import { logAudit, AuditActions } from "@/lib/audit";
import { sendOnboardingOverviewEmail } from "@/lib/email";

// Server-side stage status calculation
function computeFinalStageStatus(subtasks: any[]) {
  if (!subtasks || subtasks.length === 0) return "Not Started";
  const allCompleted = subtasks.every((t) => (t.status || "").toLowerCase() === "completed");
  return allCompleted ? "Completed" : "In Progress";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, sendEmailNotification = true } = body;
    const stages = Array.isArray(body.stages) 
      ? [...body.stages].sort((a, b) => (a.order || 0) - (b.order || 0)) 
      : [];

    if (!clientId) {
      return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch client details
    const { data: clientData, error: clientError } = await supabase
      .from('Clients')
      .select('client_id, client_name, primary_contact_name, primary_contact_email')
      .eq('client_id', clientId)
      .single();

    if (clientError) throw clientError;

    // 2. Prepare stages for RPC (handling status and dates)
    const processedStages = stages.map(stage => ({
      ...stage,
      status: computeFinalStageStatus(stage.subtasks || []),
      isRequired: !!stage.isRequired,
      document_required: !!stage.document_required,
    }));

    // 3. Call Atomic Save RPC
    const { error: saveError } = await supabase.rpc('save_client_onboarding_data', {
      p_client_id: clientId,
      p_stages: processedStages
    });

    if (saveError) throw saveError;

    // 4. Post-save actions (Audit, Progress, Email)
    processedStages.forEach(stage => {
      if (stage.status === "Completed") {
        logAudit({ clientId, action: AuditActions.STAGE_COMPLETED, actorRole: "ADMIN", details: stage.name });
      }
    });

    try {
      await calculateClientProgress(clientId);
    } catch (progErr) {
      console.error("Progress calc failed:", progErr);
    }

    if (sendEmailNotification && clientData?.primary_contact_email && stages.length > 0) {
      try {
        await sendOnboardingOverviewEmail({
          recipientEmail: clientData.primary_contact_email,
          recipientName: clientData.primary_contact_name || clientData.client_name,
          clientName: clientData.client_name,
          stages: processedStages.map(s => ({
              name: s.name,
              status: s.status,
              subtasks: (s.subtasks || []).map((st: any) => ({
                  title: st.title,
                  status: st.status || 'Not Started',
                  due_date: st.due_date
              }))
          })),
        });
      } catch (emailErr) {
        console.error("Email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SAVE STAGE ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

