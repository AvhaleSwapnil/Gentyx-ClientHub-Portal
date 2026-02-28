import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendClientWelcomeEmail } from "@/lib/email";

type AssociatedUser = {
  name: string;
  email: string;
  role?: string;
  phone?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      clientName,
      code,
      slaNumber,
      primaryContactFirstName,
      primaryContactLastName,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      serviceCenterId,
      cpaId,
      stageId, // Template ID or initial stage ID
      associatedUsers,
    } = body;

    const fullContactName = primaryContactName || `${primaryContactFirstName || ''} ${primaryContactLastName || ''}`.trim();
    const trimmedClientName = clientName?.trim();
    const finalClientName = trimmedClientName || fullContactName;

    if (!finalClientName || !primaryContactEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Check for duplicate client name
    const { data: existingClient } = await supabase
      .from('Clients')
      .select('client_id, client_name')
      .ilike('client_name', finalClientName)
      .limit(1)
      .single();

    if (existingClient) {
      return NextResponse.json({ success: false, error: `A client named "${existingClient.client_name}" already exists` }, { status: 409 });
    }

    // 2. Check for duplicate email across Users
    const lowerEmail = primaryContactEmail.trim().toLowerCase();
    const { data: existingUser } = await supabase
      .from('Users')
      .select('id')
      .eq('email', lowerEmail)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, error: `This email is already used by an existing user` }, { status: 409 });
    }

    // 3. Insert Client
    const { data: client, error: clientError } = await supabase
      .from('Clients')
      .insert({
        client_name: finalClientName,
        code: code || null,
        client_status: 'Active',
        sla_number: slaNumber || null,
        primary_contact_first_name: primaryContactFirstName || null,
        primary_contact_last_name: primaryContactLastName || null,
        primary_contact_name: fullContactName,
        primary_contact_email: primaryContactEmail,
        primary_contact_phone: primaryContactPhone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 0,
        status: 'Active',
        is_archived: false,
        cpa_id: cpaId || null,
        service_center_id: serviceCenterId || null
      })
      .select('client_id')
      .single();

    if (clientError || !client) throw clientError;

    const clientId = client.client_id;

    // 4. Create User for client login
    const { error: userError } = await supabase
      .from('Users')
      .insert({
        email: lowerEmail,
        password: "ClientHub@2025", // Default password – should be hashed in production
        role: "client",
      });

    if (userError) {
      console.error("Failed to insert user into Users table:", userError);
      throw new Error(`User creation failed: ${userError.message}`);
    }

    try {
      await sendClientWelcomeEmail(primaryContactEmail, fullContactName, finalClientName, code || undefined);
    } catch (emailErr) {
      console.error("Welcome email failed (non-blocking):", emailErr);
    }

    // 5. Associated Users
    if (Array.isArray(associatedUsers)) {
      const usersToInsert = associatedUsers
        .filter((u: AssociatedUser) => u.name && u.email)
        .map((u: AssociatedUser) => ({
          client_id: clientId,
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

    // 6. Seed default tasks/stages if template provided
    // In our new architecture, we usually have a dedicated "apply template" call.
    // But we'll attempt a basic seed here if templateId (passed as stageId) exists.
    if (stageId) {
      try {
        // Fetch template stages and subtasks
        const { data: templateStages } = await supabase
          .from('default_stages')
          .select('*, default_stage_subtasks(*)')
          .eq('template_id', stageId)
          .order('order_number', { ascending: true });

        if (templateStages && templateStages.length > 0) {
          for (const ts of templateStages) {
            const { data: cs, error: csError } = await supabase
              .from('client_stages')
              .insert({
                client_id: clientId,
                stage_name: ts.stage_name,
                order_number: ts.order_number,
                is_required: ts.is_required,
                status: 'Not Started',
                created_at: new Date().toISOString()
              })
              .select('client_stage_id')
              .single();

            if (!csError && cs && ts.default_stage_subtasks) {
              const subtasks = ts.default_stage_subtasks.map((st: any) => ({
                client_stage_id: cs.client_stage_id,
                subtask_title: st.title || st.subtask_title,
                status: 'Not Started',
                order_number: st.order_number,
                document_required: st.document_required || false,
                created_at: new Date().toISOString()
              }));
              await supabase.from('client_stage_subtasks').insert(subtasks);
            }
          }
        }
      } catch (seedErr) {
        console.error("Template seeding failed during client add:", seedErr);
      }
    }

    return NextResponse.json({ success: true, clientId });

  } catch (err: any) {
    console.error("POST /api/clients/add error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create client" }, { status: 500 });
  }
}
