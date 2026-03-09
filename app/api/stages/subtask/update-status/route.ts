import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendAdminTaskCompletionEmail, getAdminsWithNotificationsEnabled } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subtaskId, status, completedByRole, completedByName } = body;

        if (!subtaskId) {
            return NextResponse.json({ success: false, error: "Missing subtaskId" }, { status: 400 });
        }

        if (!status) {
            return NextResponse.json({ success: false, error: "Missing status" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Fetch subtask details BEFORE update
        const { data: subtaskData, error: fetchError } = await supabase
            .from('client_stage_subtasks')
            .select(`
                subtask_id,
                subtask_title,
                status,
                client_stage:client_stages (
                    stage_name,
                    client_id,
                    Clients (
                        client_name,
                        primary_contact_name,
                        cpa:cpa_centers(cpa_name),
                        service_center:service_centers(center_name)
                    )
                )
            `)
            .eq('subtask_id', subtaskId)
            .single();

        if (fetchError || !subtaskData) {
            console.error("Subtask fetch error:", fetchError);
            return NextResponse.json({
                success: false,
                error: "Subtask not found",
                details: fetchError?.message || "No data"
            }, { status: 404 });
        }

        const previousStatus = subtaskData.status;

        // 2. Update subtask status
        const { error: updateError } = await supabase
            .from('client_stage_subtasks')
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('subtask_id', subtaskId);

        if (updateError) throw updateError;

        // 3. Email Notification on NEW completion
        const isNewlyCompleted = status === "Completed" && previousStatus !== "Completed";
        if (isNewlyCompleted) {
            try {
                const admins = await getAdminsWithNotificationsEnabled();
                if (admins.length > 0) {
                    const stage = subtaskData.client_stage as any;
                    const client = stage?.Clients as any || {};
                    const cpa = Array.isArray(client.cpa) ? client.cpa[0] : client.cpa;
                    const sc = Array.isArray(client.service_center) ? client.service_center[0] : client.service_center;

                    const whoRole = (completedByRole || "CLIENT").toUpperCase();
                    let whoName = completedByName || "";
                    if (!whoName) {
                        if (whoRole === "CLIENT") whoName = client.primary_contact_name || client.client_name || "Client";
                        else if (whoRole === "CPA") whoName = cpa?.cpa_name || "CPA";
                        else if (whoRole === "SERVICE_CENTER") whoName = sc?.center_name || "Service Center";
                        else whoName = "User";
                    }

                    for (const admin of admins) {
                        await sendAdminTaskCompletionEmail({
                            adminEmail: admin.email,
                            adminName: admin.name || "Admin",
                            taskTitle: subtaskData.subtask_title,
                            clientName: client.client_name || "Unknown Client",
                            completedByRole: whoRole as any,
                            completedByName: whoName,
                            taskType: "ONBOARDING",
                            stageName: stage?.stage_name || "Unknown Stage",
                        });
                    }
                }
            } catch (emailErr) {
                console.error("❌ Admin onboarding task completion email error:", emailErr);
            }
        }

        return NextResponse.json({ success: true, message: "Subtask status updated" });

    } catch (err: any) {
        console.error("POST /api/stages/subtask/update-status error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to update subtask status" }, { status: 500 });
    }
}
