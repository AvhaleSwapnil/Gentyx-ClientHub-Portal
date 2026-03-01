import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendMessageNotification, sendAdminMessageNotification, getAdminsWithNotificationsEnabled } from "@/lib/email";
import { logAudit, AuditActions } from "@/lib/audit";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const bodyData = await req.json();
    const { client_id, sender_role, receiver_role, body, parent_message_id, attachment_url, attachment_name, service_center_id, cpa_id } = bodyData;

    // Prevent role spoofing
    if (session?.role !== sender_role?.toUpperCase()) {
      return NextResponse.json({ success: false, error: "Forbidden: Sender role mismatch" }, { status: 403 });
    }

    const supabase = createServerClient();

    // Handle ID normalization
    const parsedClientId = client_id ? parseInt(client_id) : 0;
    const validClientId = parsedClientId > 0 ? parsedClientId : null;
    const parsedServiceCenterId = service_center_id ? parseInt(service_center_id) : null;
    const parsedCpaId = cpa_id ? parseInt(cpa_id) : null;

    console.log("📨 Adding message:", { client_id, sender_role, receiver_role, service_center_id: parsedServiceCenterId, cpa_id: parsedCpaId });

    // 1. Insert the message
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        client_id: validClientId,
        sender_role,
        receiver_role,
        message_text: body,
        attachment_url: attachment_url || null,
        attachment_name: attachment_name || null,
        service_center_id: parsedServiceCenterId,
        cpa_id: parsedCpaId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log("✅ Message inserted successfully");

    // 2. Trigger async email notification
    handleEmailNotifications({
      supabase,
      clientId: validClientId,
      senderRole: sender_role,
      receiverRole: receiver_role,
      serviceCenterId: parsedServiceCenterId,
      cpaId: parsedCpaId,
      messageBody: body
    }).catch(err => console.error("❌ Email notification failed:", err));

    // 3. Audit log
    if (validClientId) {
      logAudit({
        clientId: validClientId,
        action: AuditActions.MESSAGE_SENT,
        actorRole: sender_role === "ADMIN" ? "ADMIN" : "CLIENT",
        details: body.substring(0, 50) + (body.length > 50 ? "..." : ""),
      });
    }

    return NextResponse.json({ success: true, messageId: newMessage.id });

  } catch (err: any) {
    console.error("POST /api/messages/add error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

interface EmailNotificationParams {
  supabase: any;
  clientId: number | null;
  senderRole: string;
  receiverRole: string;
  serviceCenterId: number | null;
  cpaId: number | null;
  messageBody: string;
}

async function handleEmailNotifications(params: EmailNotificationParams) {
  const { supabase, clientId, senderRole, receiverRole, serviceCenterId, cpaId, messageBody } = params;

  const isValidName = (name: string | null | undefined): boolean => {
    if (!name) return false;
    const trimmed = name.trim();
    if (!trimmed || /^\d+$/.test(trimmed)) return false;
    return true;
  };

  try {
    // SCENARIO 1: Admin/Support messaging a Client
    if ((senderRole === "ADMIN" || senderRole === "SUPPORT") && receiverRole === "CLIENT" && clientId) {
      const { data: client } = await supabase
        .from('Clients')
        .select('client_name, primary_contact_email, primary_contact_name')
        .eq('client_id', clientId)
        .single();

      if (client?.primary_contact_email) {
        let recipientName = isValidName(client.primary_contact_name) ? client.primary_contact_name : (isValidName(client.client_name) ? client.client_name : "Valued Client");
        await sendMessageNotification({
          recipientEmail: client.primary_contact_email,
          recipientName,
          senderName: "Your Account Manager",
          messagePreview: messageBody,
          clientId
        });
      }
    }

    // SCENARIO 2: Admin messaging a Service Center
    if (senderRole === "ADMIN" && receiverRole === "SERVICE_CENTER" && serviceCenterId) {
      const { data: sc } = await supabase
        .from('service_centers')
        .select('center_name, email')
        .eq('service_center_id', serviceCenterId)
        .single();

      if (sc?.email) {
        await sendMessageNotification({
          recipientEmail: sc.email,
          recipientName: sc.center_name || "Service Center",
          senderName: "Admin - ClientHub",
          messagePreview: messageBody,
          clientId: clientId || 0
        });
      }
    }

    // SCENARIO 3: Admin messaging a CPA
    if (senderRole === "ADMIN" && receiverRole === "CPA" && cpaId) {
      const { data: cpa } = await supabase
        .from('cpa_centers')
        .select('cpa_name, email')
        .eq('cpa_id', cpaId)
        .single();

      if (cpa?.email) {
        await sendMessageNotification({
          recipientEmail: cpa.email,
          recipientName: cpa.cpa_name || "CPA",
          senderName: "Admin - ClientHub",
          messagePreview: messageBody,
          clientId: clientId || 0
        });
      }
    }

    // SCENARIO 4: Client messaging ADMIN
    if (senderRole === "CLIENT" && receiverRole === "ADMIN" && clientId) {
      const { data: client } = await supabase
        .from('Clients')
        .select('client_name, primary_contact_name')
        .eq('client_id', clientId)
        .single();

      const clientName = client?.client_name || "Client";
      const senderName = isValidName(client?.primary_contact_name) ? client.primary_contact_name : clientName;

      const admins = await getAdminsWithNotificationsEnabled();
      for (const admin of admins) {
        await sendAdminMessageNotification({
          adminEmail: admin.email,
          adminName: admin.name || "Admin",
          senderName,
          senderRole: "CLIENT",
          messagePreview: messageBody,
          clientName
        });
      }
    }

    // SCENARIO 5: Client messaging SC
    if (senderRole === "CLIENT" && receiverRole === "SERVICE_CENTER" && clientId) {
      const { data: client } = await supabase
        .from('Clients')
        .select(`
                client_name,
                service_center:service_centers(center_name, email)
            `)
        .eq('client_id', clientId)
        .single();

      const sc = Array.isArray(client?.service_center) ? client.service_center[0] : client.service_center;
      if (sc?.email) {
        await sendMessageNotification({
          recipientEmail: sc.email,
          recipientName: sc.center_name || "Service Center",
          senderName: client.client_name || "Client",
          messagePreview: messageBody,
          clientId
        });
      }
    }

  } catch (err) {
    console.error("Email notification handler error:", err);
  }
}
