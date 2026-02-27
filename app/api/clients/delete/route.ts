import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId } = body;

        if (!clientId) {
            return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get client info before deletion
        const { data: client, error: fetchError } = await supabase
            .from('Clients')
            .select('client_name, primary_contact_email')
            .eq('client_id', Number(clientId))
            .single();

        if (fetchError || !client) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }

        console.log(`🗑️ Starting deletion of client: ${client.client_name} (ID: ${clientId})`);

        // Perform deletions (individual calls since we don't have a cascade RPC yet)
        
        // a. Delete client messages
        await supabase.from('onboarding_messages').delete().eq('client_id', Number(clientId));
        
        // b. Delete manual onboarding tasks
        await supabase.from('onboarding_tasks').delete().eq('client_id', Number(clientId));
        
        // c. Delete client stage subtasks (requires joining or finding IDs)
        const { data: stages } = await supabase.from('client_stages').select('client_stage_id').eq('client_id', Number(clientId));
        if (stages && stages.length > 0) {
            const stageIds = stages.map(s => s.client_stage_id);
            await supabase.from('client_stage_subtasks').delete().in('client_stage_id', stageIds);
        }
        
        // d. Delete client stages
        await supabase.from('client_stages').delete().eq('client_id', Number(clientId));
        
        // e. Delete client users
        await supabase.from('client_users').delete().eq('client_id', Number(clientId));
        
        // f. Delete audit logs
        await supabase.from('audit_logs').delete().eq('client_id', Number(clientId));
        
        // g. Delete user credentials
        if (client.primary_contact_email) {
            await supabase.from('Users').delete().eq('email', client.primary_contact_email).eq('role', 'CLIENT');
        }

        // h. Delete the client record itself
        const { error: deleteError } = await supabase.from('Clients').delete().eq('client_id', Number(clientId));

        if (deleteError) throw deleteError;

        console.log(`✅ Successfully deleted client: ${client.client_name} (ID: ${clientId})`);

        return NextResponse.json({
            success: true,
            message: `Client "${client.client_name}" and all associated data have been deleted successfully.`,
            deletedClientId: clientId,
            deletedClientName: client.client_name,
        });

    } catch (error: any) {
        console.error("Delete client error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to delete client" }, { status: 500 });
    }
}
