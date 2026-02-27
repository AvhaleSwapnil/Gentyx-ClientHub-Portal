import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendTaskNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔍 Incoming /api/tasks/add body:", body);

    const {
      clientId: rawClientId,
      taskTitle,
      title,
      description = "",
      dueDate,
      assignedToRole,
      assigneeRole,
      documentRequired = true,
      sendNotification = true,
    } = body;

    const clientId = Number(rawClientId);
    const finalTitle = taskTitle || title;
    const role = assignedToRole || assigneeRole || "CLIENT";
    const docRequired = documentRequired === true || documentRequired === 1;

    if (!clientId || !finalTitle) {
      return NextResponse.json({ success: false, error: "clientId and taskTitle are required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Get client details for notification
    const { data: client, error: clientError } = await supabase
      .from('Clients')
      .select(`
        client_id,
        client_name,
        primary_contact_name,
        primary_contact_email,
        cpa_id,
        service_center_id,
        cpa:cpa_centers(cpa_name, email),
        service_center:service_centers(center_name, email)
      `)
      .eq('client_id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ success: false, error: "Invalid clientId" }, { status: 404 });
    }

    // 2. Determine Stage ID (Default to the first onboarding stage if none found)
    const { data: stageData, error: stageError } = await supabase
      .from('onboarding_stages')
      .select('stage_id')
      .order('stage_id', { ascending: true })
      .limit(1);

    if (stageError || !stageData || stageData.length === 0) {
      console.error("❌ No onboarding stages found:", stageError || "Empty table");
      return NextResponse.json({
        success: false,
        error: "System Configuration Error: No onboarding stages found. Please ensure onboarding stages are configured in the database."
      }, { status: 500 });
    }

    const stage = stageData[0];

    // 3. Auto-increment order number
    const { data: maxOrderData, error: orderError } = await supabase
      .from('onboarding_tasks')
      .select('order_number')
      .eq('client_id', clientId)
      .order('order_number', { ascending: false })
      .limit(1);

    if (orderError) throw orderError;
    const orderNumber = (maxOrderData && maxOrderData[0]?.order_number || 0) + 1;

    // 4. Insert task
    const { data: newTask, error: insertError } = await supabase
      .from('onboarding_tasks')
      .insert({
        stage_id: stage.stage_id,
        client_id: clientId,
        task_title: finalTitle,
        description: description,
        assigned_to_role: role,
        due_date: dueDate || null,
        status: 'Not Started',
        order_number: orderNumber,
        document_required: docRequired,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('task_id')
      .single();

    if (insertError) throw insertError;

    // 5. Email Notification
    if (sendNotification) {
      try {
        let recipientEmail: string | null = null;
        let recipientName: string = "";
        let recipientRole: "CLIENT" | "CPA" | "SERVICE_CENTER" = "CLIENT";

        const cpa = Array.isArray(client.cpa) ? client.cpa[0] : client.cpa;
        const sc = Array.isArray(client.service_center) ? client.service_center[0] : client.service_center;

        switch (role.toUpperCase()) {
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
            taskTitle: finalTitle,
            taskDescription: description,
            dueDate,
            clientName: client.client_name,
            notificationType: "assigned",
            assignedByName: "Admin",
          });
        }
      } catch (emailError) {
        console.error("❌ Task notification email error:", emailError);
      }
    }

    return NextResponse.json({ success: true, taskId: newTask.task_id });

  } catch (err: any) {
    console.error("POST /api/tasks/add error:", err);
    return NextResponse.json({ success: false, error: "Failed to add task" }, { status: 500 });
  }
}
