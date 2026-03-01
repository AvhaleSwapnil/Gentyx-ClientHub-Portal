import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
    try {
        const { session, response: authResponse } = await verifySession(req);
        if (authResponse) return authResponse;

        const body = await req.json();
        const { clientId, newPassword } = body;

        if (!clientId) {
            return NextResponse.json({ success: false, error: "Missing clientId" }, { status: 400 });
        }

        // RBAC Check
        if (session?.role === 'CLIENT') {
            const secureClientId = req.cookies.get("clienthub_clientId")?.value;
            if (clientId && secureClientId !== String(clientId)) {
                return NextResponse.json({ success: false, error: "Forbidden: You cannot update another client's password" }, { status: 403 });
            }
        } else if (session?.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: "Forbidden: Only admins or the client themselves can update the password" }, { status: 403 });
        }

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get the client's email first
        const { data: client, error: clientError } = await supabase
            .from('Clients')
            .select('primary_contact_email')
            .eq('client_id', clientId)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }

        const clientEmail = client.primary_contact_email;

        if (!clientEmail) {
            return NextResponse.json({ success: false, error: "Client email not found" }, { status: 400 });
        }

        // 2. Update the password in Users table
        const { error: updateError } = await supabase
            .from('Users')
            .update({ password: newPassword })
            .eq('email', clientEmail);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err: any) {
        console.error("POST /api/clients/update-password error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to update password" }, { status: 500 });
    }
}
