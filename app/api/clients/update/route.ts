import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAudit, AuditActions } from "@/lib/audit";
import { sendUpdateNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      clientId,
      client_name,
      code,
      primary_contact_first_name,
      primary_contact_last_name,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      service_center_id,
      cpa_id,
    } = body;

    const fullContactName = primary_contact_name || `${primary_contact_first_name || ''} ${primary_contact_last_name || ''}`.trim();
    const trimmedClientName = client_name?.trim();
    const finalClientName = trimmedClientName || fullContactName;

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID missing" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check for duplicate client name
    if (finalClientName) {
      const { data: existingClient } = await supabase
        .from('Clients')
        .select('client_id, client_name')
        .ilike('client_name', finalClientName)
        .neq('client_id', Number(clientId))
        .limit(1)
        .single();

      if (existingClient) {
        return NextResponse.json({ success: false, error: `A client named "${existingClient.client_name}" already exists` }, { status: 409 });
      }
    }

    // 2. Check for duplicate email
    if (primary_contact_email && primary_contact_email.trim()) {
      const lowerEmail = primary_contact_email.trim().toLowerCase();
      // Check Clients excluding current, and check CPAs/SC (no exclusion needed there usually)
      const { data: existingInClients } = await supabase
        .from('Clients')
        .select('client_name')
        .eq('primary_contact_email', lowerEmail)
        .neq('client_id', Number(clientId))
        .limit(1)
        .single();
      
      if (existingInClients) {
        return NextResponse.json({ success: false, error: `This email is already used by client: "${existingInClients.client_name}"` }, { status: 409 });
      }
    }

    // 3. Get old email for sync
    const { data: oldClientData } = await supabase
      .from('Clients')
      .select('primary_contact_email')
      .eq('client_id', Number(clientId))
      .single();
    
    const oldEmail = oldClientData?.primary_contact_email;

    // 4. Update Client
    const { error: updateError } = await supabase
      .from('Clients')
      .update({
        client_name: finalClientName,
        code: code || null,
        primary_contact_first_name: primary_contact_first_name || null,
        primary_contact_last_name: primary_contact_last_name || null,
        primary_contact_name: fullContactName,
        primary_contact_email: primary_contact_email,
        primary_contact_phone: primary_contact_phone || null,
        service_center_id: service_center_id || null,
        cpa_id: cpa_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', Number(clientId));

    if (updateError) throw updateError;

    // 5. Sync User Email
    if (primary_contact_email && primary_contact_email.trim() && oldEmail &&
      primary_contact_email.toLowerCase() !== oldEmail.toLowerCase()) {
      await supabase
        .from('Users')
        .update({ email: primary_contact_email })
        .eq('email', oldEmail)
        .eq('role', 'CLIENT');
    }

    // 6. Audit Logging
    logAudit({
      clientId: Number(clientId),
      action: AuditActions.CLIENT_UPDATED,
      actorRole: "ADMIN",
      details: finalClientName,
    });

    // 7. Email Notification
    if (primary_contact_email) {
      try {
        await sendUpdateNotification({
          recipientEmail: primary_contact_email,
          recipientName: primary_contact_name || finalClientName,
          updateType: 'profile_updated',
          details: {
            title: 'Your Profile Has Been Updated',
            description: `Your client profile "${finalClientName}" has been updated by the administrator.`,
            actionUrl: 'https://legacy.hubonesystems.net/login',
            actionLabel: 'View Your Profile',
          },
        });
      } catch (emailErr) {
        console.error("Profile update email failed:", emailErr);
      }
    }

    // 8. Associated Users
    const associatedUsers = body.associatedUsers;
    if (Array.isArray(associatedUsers)) {
      await supabase.from('client_users').delete().eq('client_id', Number(clientId));
      
      const usersToInsert = associatedUsers
        .filter(u => u.name && u.email)
        .map(u => ({
          client_id: Number(clientId),
          user_name: u.name,
          email: u.email,
          role: u.role || "Client User",
          phone: u.phone || null,
          created_at: new Date().toISOString()
        }));

      if (usersToInsert.length > 0) {
        await supabase.from('client_users').insert(usersToInsert);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("UPDATE CLIENT ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to update client" }, { status: 500 });
  }
}
