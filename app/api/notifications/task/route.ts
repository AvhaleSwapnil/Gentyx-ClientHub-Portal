import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendTaskNotificationEmail, sendOnboardingTaskNotificationEmail } from "@/lib/email";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
    try {
        const { session, response: authResponse } = await verifySession(req, ["ADMIN", "CPA", "SERVICE_CENTER"]);
        if (authResponse) return authResponse;

        const body = await req.json();
        console.log("📧 Task notification request:", body);

        const {
            taskId,
            taskTitle,
            taskDescription,
            dueDate,
            clientId,
            assignedToRole,
            notificationType = "assigned", // 'assigned' | 'updated'
            taskType = "ASSIGNED", // 'ASSIGNED' | 'ONBOARDING'
            stageName, // For onboarding tasks
            updatedFields, // For updates
            assignedByName,
        } = body;

        // Validate required fields
        if (!clientId) {
            return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
        }

        if (!taskTitle) {
            return NextResponse.json({ success: false, error: "taskTitle is required" }, { status: 400 });
        }

        if (!assignedToRole) {
            return NextResponse.json({ success: false, error: "assignedToRole is required" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. FETCH CLIENT DETAILS
        const { data: client, error: clientError } = await supabase
            .from('Clients')
            .select(`
                client_id,
                client_name,
                primary_contact_name,
                primary_contact_email,
                cpa:cpa_centers(cpa_name, email),
                service_center:service_centers(center_name, email)
            `)
            .eq('client_id', clientId)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }

        const cpa = Array.isArray(client.cpa) ? client.cpa[0] : client.cpa;
        const sc = Array.isArray(client.service_center) ? client.service_center[0] : client.service_center;

        // 2. DETERMINE RECIPIENT
        let recipientEmail: string | null = null;
        let recipientName: string = "";
        let recipientRole: "CLIENT" | "CPA" | "SERVICE_CENTER" = "CLIENT";

        switch (assignedToRole.toUpperCase()) {
            case "CLIENT":
                recipientEmail = client.primary_contact_email;
                recipientName = client.primary_contact_name || client.client_name;
                recipientRole = "CLIENT";
                break;

            case "CPA":
                recipientEmail = (cpa as any)?.email;
                recipientName = (cpa as any)?.cpa_name || "CPA";
                recipientRole = "CPA";
                break;

            case "SERVICE_CENTER":
                recipientEmail = (sc as any)?.email;
                recipientName = (sc as any)?.center_name || "Service Center";
                recipientRole = "SERVICE_CENTER";
                break;

            default:
                return NextResponse.json({ success: false, error: `Unknown assignedToRole: ${assignedToRole}` }, { status: 400 });
        }

        // Check if we have a valid email
        if (!recipientEmail) {
            console.warn(`⚠️ No email found for ${assignedToRole} role`);
            return NextResponse.json({
                success: false,
                error: `No email address found for ${assignedToRole}.`,
                skipped: true,
            });
        }

        console.log(`📧 Sending ${notificationType} notification to ${recipientRole}: ${recipientEmail}`);

        // 3. SEND EMAIL NOTIFICATION
        let emailResult;
        if (taskType === "ONBOARDING" && stageName) {
            emailResult = await sendOnboardingTaskNotificationEmail({
                recipientEmail,
                recipientName,
                recipientRole,
                stageName,
                subtaskTitle: taskTitle,
                clientName: client.client_name,
                notificationType: notificationType as any,
                dueDate,
                assignedByName,
            });
        } else {
            emailResult = await sendTaskNotificationEmail({
                recipientEmail,
                recipientName,
                recipientRole,
                taskTitle,
                taskDescription,
                dueDate,
                clientName: client.client_name,
                notificationType: notificationType as any,
                updatedFields,
                assignedByName,
            });
        }

        if (emailResult.success) {
            return NextResponse.json({
                success: true,
                message: `Notification sent to ${recipientRole} (${recipientEmail})`,
                messageId: emailResult.messageId,
            });
        } else {
            return NextResponse.json({ success: false, error: emailResult.error || "Failed to send notification email" }, { status: 500 });
        }

    } catch (err: any) {
        console.error("POST /api/notifications/task error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to send task notification" }, { status: 500 });
    }
}
