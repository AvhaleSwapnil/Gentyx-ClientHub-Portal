import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cpaId = searchParams.get("cpaId");

    if (!cpaId) {
      return NextResponse.json({ success: false, error: "CPA ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch Clients assigned to this CPA
    const { data: clients, error: clientsError } = await supabase
      .from('Clients')
      .select(`
        client_id,
        client_name,
        code,
        client_status,
        status,
        primary_contact_email
      `)
      .eq('cpa_id', Number(cpaId))
      .order('client_name', { ascending: true });

    if (clientsError) throw clientsError;

    // 2. Fetch last message for each client (to simulate the conversation list)
    // We'll do this in a batch or per-client if list is small. 
    // For efficiency, we can fetch all recent messages for these clients.
    
    const clientIds = (clients || []).map(c => c.client_id);
    
    if (clientIds.length === 0) {
        return NextResponse.json({ success: true, data: [] });
    }

    const { data: messages, error: messagesError } = await supabase
        .from('onboarding_messages')
        .select('client_id, body, created_at, sender_role')
        .in('client_id', clientIds)
        .or(`cpa_id.eq.${cpaId},cpa_id.is.null`)
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
        last_message_body: lastMessageByClient[c.client_id]?.body || null,
        last_message_sender_role: lastMessageByClient[c.client_id]?.sender_role || null
    }));

    // Re-sort by last message date
    result.sort((a, b) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("GET BY CPA ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
