import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { logAudit, AuditActions } from "@/lib/audit";
import { sendUpdateNotification } from "@/lib/email";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req);
    if (authResponse) return authResponse;

    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID missing" }, { status: 400 });
    }

    // RBAC check: Non-admins can only update their own data
    if (session?.role === 'CLIENT') {
      const secureClientId = req.cookies.get("clienthub_clientId")?.value;
      if (Number(secureClientId) !== Number(clientId)) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot update another client's data" }, { status: 403 });
      }
    }
    const {
      client_name,
      code,
      primary_contact_first_name,
      primary_contact_last_name,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      service_center_id,
      cpa_id,
      associatedUsers,
    } = body;

    const supabase = createServerClient();

    // ── 1. Resolve the contact name only if contact fields were provided ──
    const hasContactFields =
      client_name !== undefined ||
      primary_contact_first_name !== undefined ||
      primary_contact_last_name !== undefined ||
      primary_contact_name !== undefined;

    const fullContactName = hasContactFields
      ? primary_contact_name ||
      `${primary_contact_first_name || ""} ${primary_contact_last_name || ""}`.trim()
      : undefined;

    const trimmedClientName = client_name?.trim();
    const finalClientName = trimmedClientName || fullContactName;

    // ── 2. Duplicate client-name check (only if a name was sent) ──
    if (finalClientName) {
      const { data: existingClient } = await supabase
        .from("Clients")
        .select("client_id, client_name")
        .ilike("client_name", finalClientName)
        .neq("client_id", Number(clientId))
        .limit(1)
        .single();

      if (existingClient) {
        return NextResponse.json(
          { success: false, error: `A client named "${existingClient.client_name}" already exists` },
          { status: 409 }
        );
      }
    }

    // ── 3. Duplicate email check (only if email was sent) ──
    let lowerEmail: string | undefined;
    if (primary_contact_email && primary_contact_email.trim()) {
      lowerEmail = primary_contact_email.trim().toLowerCase();

      const { data: existingInClients } = await supabase
        .from("Clients")
        .select("client_name")
        .eq("primary_contact_email", lowerEmail)
        .neq("client_id", Number(clientId))
        .limit(1)
        .single();

      if (existingInClients) {
        return NextResponse.json(
          {
            success: false,
            error: `This email is already used by client: "${existingInClients.client_name}"`,
          },
          { status: 409 }
        );
      }
    }

    // ── 4. Get old email for Users sync (only needed if email is changing) ──
    let oldEmail: string | undefined;
    if (lowerEmail) {
      const { data: oldClientData } = await supabase
        .from("Clients")
        .select("primary_contact_email")
        .eq("client_id", Number(clientId))
        .single();
      oldEmail = oldClientData?.primary_contact_email;
    }

    // ── 5. Build a dynamic update payload — only include fields that were sent ──
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (finalClientName) updatePayload.client_name = finalClientName;
    if (code !== undefined) updatePayload.code = code || null;
    if (primary_contact_first_name !== undefined) updatePayload.primary_contact_first_name = primary_contact_first_name || null;
    if (primary_contact_last_name !== undefined) updatePayload.primary_contact_last_name = primary_contact_last_name || null;
    if (fullContactName !== undefined) updatePayload.primary_contact_name = fullContactName;
    if (lowerEmail !== undefined) updatePayload.primary_contact_email = lowerEmail;
    if (primary_contact_phone !== undefined) updatePayload.primary_contact_phone = primary_contact_phone || null;
    if (service_center_id !== undefined) updatePayload.service_center_id = service_center_id || null;
    if (cpa_id !== undefined) updatePayload.cpa_id = cpa_id || null;

    const { error: updateError } = await supabase
      .from("Clients")
      .update(updatePayload)
      .eq("client_id", Number(clientId));

    if (updateError) throw updateError;

    // ── 6. Sync Users email if it changed ──
    if (lowerEmail && oldEmail && lowerEmail !== oldEmail.toLowerCase()) {
      await supabase
        .from("Users")
        .update({ email: lowerEmail })
        .eq("email", oldEmail)
        .eq("role", "CLIENT");
    }

    // ── 7. Audit log ──
    logAudit({
      clientId: Number(clientId),
      action: AuditActions.CLIENT_UPDATED,
      actorRole: "ADMIN",
      details: finalClientName || `Client ${clientId} updated`,
    });

    // ── 8. Email notification (only if a full profile update with email) ──
    if (lowerEmail && finalClientName) {
      try {
        await sendUpdateNotification({
          recipientEmail: lowerEmail,
          recipientName: fullContactName || finalClientName,
          updateType: "profile_updated",
          details: {
            title: "Your Profile Has Been Updated",
            description: `Your client profile "${finalClientName}" has been updated by the administrator.`,
            actionUrl: "https://legacy.hubonesystems.net/login",
            actionLabel: "View Your Profile",
          },
        });
      } catch (emailErr) {
        console.error("Profile update email failed (non-blocking):", emailErr);
      }
    }

    // ── 9. Associated users (only if sent) ──
    if (Array.isArray(associatedUsers)) {
      await supabase.from("client_users").delete().eq("client_id", Number(clientId));

      const usersToInsert = associatedUsers
        .filter((u) => u.name && u.email)
        .map((u) => ({
          client_id: Number(clientId),
          user_name: u.name,
          email: u.email,
          role: u.role || "Client User",
          phone: u.phone || null,
          created_at: new Date().toISOString(),
        }));

      if (usersToInsert.length > 0) {
        await supabase.from("client_users").insert(usersToInsert);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("UPDATE CLIENT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update client" },
      { status: 500 }
    );
  }
}
