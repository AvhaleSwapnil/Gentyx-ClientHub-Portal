import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
    try {
        const { session, response: authResponse } = await verifySession(req, ["ADMIN"]);
        if (authResponse) return authResponse;

        const body = await req.json();
        const { clientId, archive } = body;

        if (!clientId) {
            return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get client info for logging
        const { data: client, error: fetchError } = await supabase
            .from('Clients')
            .select('client_name')
            .eq('client_id', Number(clientId))
            .single();

        if (fetchError || !client) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }

        // 2. Update the is_archived flag
        const isArchived = archive === true;
        const { error: updateError } = await supabase
            .from('Clients')
            .update({
                is_archived: isArchived,
                updated_at: new Date().toISOString()
            })
            .eq('client_id', Number(clientId));

        if (updateError) throw updateError;

        const action = isArchived ? "archived" : "restored";
        console.log(`✅ Client "${client.client_name}" (ID: ${clientId}) has been ${action}`);

        return NextResponse.json({
            success: true,
            message: `Client "${client.client_name}" has been ${action} successfully.`,
            clientId,
            clientName: client.client_name,
            isArchived,
        });

    } catch (error: any) {
        console.error("Archive client error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to archive client" }, { status: 500 });
    }
}
