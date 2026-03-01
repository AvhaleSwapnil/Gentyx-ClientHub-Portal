import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const { session, response: authResponse } = await verifySession(req, ["ADMIN", "SERVICE_CENTER"]);
    if (authResponse) return authResponse;

    const { searchParams } = new URL(req.url);
    const serviceCenterId = searchParams.get("serviceCenterId");

    if (!serviceCenterId) {
      return NextResponse.json({ success: false, error: "serviceCenterId is required" }, { status: 400 });
    }

    // RBAC check: SC can only see their own clients
    if (session?.role === 'SERVICE_CENTER') {
      const secureScId = req.cookies.get("clienthub_serviceCenterId")?.value;
      if (secureScId !== serviceCenterId) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot access another Service Center's data" }, { status: 403 });
      }
    }

    const supabase = createServerClient();

    // 1. Fetch Clients assigned to this SC
    const { data: clients, error: clientsError } = await supabase
      .from('Clients')
      .select(`
        client_id,
        client_name,
        code,
        status,
        client_status,
        created_at,
        primary_contact_email
      `)
      .eq('service_center_id', Number(serviceCenterId))
      .order('created_at', { ascending: false });

    if (clientsError) throw clientsError;

    // 2. Fetch last message for each client
    const clientIds = (clients || []).map(c => c.client_id);

    if (clientIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('client_id, message_text, created_at, sender_role')
      .in('client_id', clientIds)
      .or(`service_center_id.eq.${serviceCenterId},service_center_id.is.null`)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;

    // Map last message to client
    const lastMessageByClient: Record<number, any> = {};
    for (const msg of (messages || [])) {
      if (!lastMessageByClient[msg.client_id]) {
        lastMessageByClient[msg.client_id] = msg;
      }
    }

    const result = (clients || []).map(c => ({
      ...c,
      last_message_at: lastMessageByClient[c.client_id]?.created_at || null,
      last_message_body: lastMessageByClient[c.client_id]?.message_text || null,
      last_message_sender_role: lastMessageByClient[c.client_id]?.sender_role || null
    }));

    // Re-sort by last message date
    result.sort((a, b) => {
      const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
      const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("GET CLIENTS BY SERVICE CENTER ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch assigned clients" }, { status: 500 });
  }
}
