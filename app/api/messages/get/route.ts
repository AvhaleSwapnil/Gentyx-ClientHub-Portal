import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const conversationBetween = url.searchParams.get("conversationBetween");
    const serviceCenterId = url.searchParams.get("serviceCenterId");
    const cpaId = url.searchParams.get("cpaId");

    console.log("📨 Fetching messages:", { clientId, conversationBetween, serviceCenterId, cpaId });

    const supabase = createServerClient();

    // Parse conversation roles
    let role1 = "";
    let role2 = "";
    if (conversationBetween) {
      const roles = conversationBetween.split(",");
      role1 = roles[0] || "";
      role2 = roles[1] || "";
    }

    // Parse IDs
    const parsedClientId = clientId ? parseInt(clientId) : null;
    const parsedServiceCenterId = serviceCenterId ? parseInt(serviceCenterId) : null;
    const parsedCpaId = cpaId ? parseInt(cpaId) : null;

    let query = supabase
      .from('messages')
      .select(`
        *,
        client:clients(name)
      `);

    // Build filters
    if (parsedClientId) {
      query = query.eq('client_id', parsedClientId);
    } else {
      // If no clientId, usually looking for entity-specific messages (Admin <-> SC/CPA)
      query = query.or('client_id.is.null,client_id.eq.0');
    }

    if (parsedServiceCenterId) {
      query = query.eq('service_center_id', parsedServiceCenterId);
    }

    if (parsedCpaId) {
      query = query.eq('cpa_id', parsedCpaId);
    }

    // Role filtering (Conversation between two specific roles)
    if (role1 && role2) {
      query = query.or(`and(sender_role.eq.${role1},receiver_role.eq.${role2}),and(sender_role.eq.${role2},receiver_role.eq.${role1})`);
    }

    const { data: messages, error } = await query
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Flatten client_name from join
    const processedMessages = (messages || []).map(m => ({
        ...m,
        client_name: Array.isArray(m.client) ? m.client[0]?.name : (m.client as any)?.name || null
    }));

    return NextResponse.json({
      success: true,
      data: processedMessages,
    });
  } catch (err: any) {
    console.error("GET /api/messages/get error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
