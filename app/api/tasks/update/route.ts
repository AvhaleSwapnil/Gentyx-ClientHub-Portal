import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { calculateClientProgress } from "@/lib/progress";
import { logAudit, AuditActions } from "@/lib/audit";
import { sendTaskNotificationEmail, sendAdminTaskCompletionEmail, getAdminsWithNotificationsEnabled } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      taskId,
      taskTitle,
      dueDate,
      status,
      assignedToRole,
      documentRequired,
      sendNotification = false,
      completedByRole,
      completedByName,
    } = body;

    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch task details and client info BEFORE update
    const { data: taskData, error: fetchError } = await supabase
      .from('onboarding_tasks')
      .select(`
        task_id,
        task_title,
        due_date,
        status,
        assigned_to_role,
        document_required,
        client_id,
        client:Clients(
          client_name,
          primary_contact_name,
          primary_contact_email,
          cpa:cpa_centers(cpa_name, email),
          service_center:service_centers(center_name, email)
        )
      `)
      .eq('task_id', taskId)
      .single();

    if (fetchError || !taskData) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const clientId = taskData.client_id;
    const previousStatus = taskData.status;

    // Track fields for notification
    const updatedFields: string[] = [];
    if (taskTitle && taskTitle !== taskData.task_title) updatedFields.push(`Title changed to "${taskTitle}"`);
    if (dueDate && new Date(dueDate).toDateString() !== new Date(taskData.due_date).toDateString()) {
      updatedFields.push(`Due date changed to ${new Date(dueDate).toLocaleDateString()}`);
    }
    if (status && status !== taskData.status) updatedFields.push(`Status changed to "${status}"`);
    if (assignedToRole && assignedToRole !== taskData.assigned_to_role) updatedFields.push(`Assigned to ${assignedToRole.replace('_', ' ')}`);

    // 2. Update the task
    const { error: updateError } = await supabase
      .from('onboarding_tasks')
      .update({
        task_title: taskTitle || taskData.task_title,
        due_date: dueDate || taskData.due_date,
        status: status || taskData.status,
        assigned_to_role: assignedToRole || taskData.assigned_to_role,
        document_required: documentRequired !== undefined ? documentRequired : taskData.document_required,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', taskId);

    if (updateError) throw updateError;

    // 3. Progress and Audit
    if (clientId) {
      await calculateClientProgress(clientId);
      const isCompleted = status === "Completed";
      logAudit({
        clientId,
        action: isCompleted ? AuditActions.TASK_COMPLETED : AuditActions.TASK_UPDATED,
        actorRole: "CLIENT",
        details: taskTitle || taskData.task_title || `Task #${taskId}`,
      });
    }

    // 4. Admin completion email
    const isNewlyCompleted = status === "Completed" && previousStatus !== "Completed";
    if (isNewlyCompleted) {
      const admins = await getAdminsWithNotificationsEnabled();
      if (admins.length > 0) {
        const client = taskData.client as any;
        const cpa = Array.isArray(client.cpa) ? client.cpa[0] : client.cpa;
        const sc = Array.isArray(client.service_center) ? client.service_center[0] : client.service_center;

        const whoRole = (completedByRole || taskData.assigned_to_role || "CLIENT").toUpperCase();
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
            taskTitle: taskTitle || taskData.task_title,
            clientName: client.client_name || "Unknown Client",
            completedByRole: whoRole as any,
            completedByName: whoName,
            taskType: "ASSIGNED",
          });
        }
      }
    }

    // 5. Assignee update email
    if (sendNotification && updatedFields.length > 0) {
      const targetRole = assignedToRole || taskData.assigned_to_role || "CLIENT";
      const client = taskData.client as any;
      const cpa = Array.isArray(client.cpa) ? client.cpa[0] : client.cpa;
      const sc = Array.isArray(client.service_center) ? client.service_center[0] : client.service_center;

      let recipientEmail: string | null = null;
      let recipientName: string = "";
      let recipientRole: "CLIENT" | "CPA" | "SERVICE_CENTER" = "CLIENT";

      switch (targetRole.toUpperCase()) {
        case "CLIENT":
          recipientEmail = client.primary_contact_email;
          recipientName = client.primary_contact_name || client.client_name;
          recipientRole = "CLIENT";
          break;
        case "CPA":
          recipientEmail = cpa?.email;
          recipientName = cpa?.cpa_name || "CPA";
          recipientRole = "CPA";
          break;
        case "SERVICE_CENTER":
          recipientEmail = sc?.email;
          recipientName = sc?.center_name || "Service Center";
          recipientRole = "SERVICE_CENTER";
          break;
      }

      if (recipientEmail) {
        await sendTaskNotificationEmail({
          recipientEmail,
          recipientName,
          recipientRole,
          taskTitle: taskTitle || taskData.task_title,
          dueDate: dueDate || taskData.due_date,
          clientName: client.client_name,
          notificationType: "updated",
          updatedFields,
          assignedByName: "Admin",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/tasks/update error:", err);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}
