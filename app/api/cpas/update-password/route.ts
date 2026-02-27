import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cpaId, newPassword } = body;

        if (!cpaId) {
            return NextResponse.json({ success: false, error: "Missing cpaId" }, { status: 400 });
        }

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get the CPA's email
        const { data: cpa, error: cpaError } = await supabase
            .from('cpa_centers')
            .select('email')
            .eq('cpa_id', cpaId)  // Fixed: was .eq('id', cpaId) — 'id' column does not exist
            .single();

        if (cpaError || !cpa) {
            return NextResponse.json({ success: false, error: "CPA not found" }, { status: 404 });
        }

        const email = cpa.email;

        if (!email) {
            return NextResponse.json({ success: false, error: "CPA email not found" }, { status: 400 });
        }

        // 2. Update the password in Users table
        const { error: updateError } = await supabase
            .from('Users')  // Fixed: was 'users' (wrong casing)
            .update({ password: newPassword })
            .eq('email', email);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err: any) {
        console.error("POST /api/cpas/update-password error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to update password" }, { status: 500 });
    }
}
