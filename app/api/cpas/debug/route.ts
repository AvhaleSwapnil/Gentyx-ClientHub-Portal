import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
    try {
        const supabase = createServerClient();

        // 1. Get all CPAs
        const { data: cpaList, error: cpaError } = await supabase
            .from('cpa_centers')
            .select('id, code, name, email');

        if (cpaError) throw cpaError;

        // 2. Get all CPA users
        const { data: userList, error: userError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('role', 'CPA');

        if (userError) throw userError;

        // 3. Check which CPAs don't have matching users
        const userEmails = new Set((userList || []).map(u => u.email?.toLowerCase()));

        const unmatchedCpas = (cpaList || []).filter((cpa) => {
            if (!cpa.email) return true;
            return !userEmails.has(cpa.email.toLowerCase());
        });

        return NextResponse.json({
            cpas: cpaList,
            users: userList,
            unmatchedCpas,
            message: unmatchedCpas.length > 0
                ? `Found ${unmatchedCpas.length} CPA(s) without matching user accounts`
                : "All CPAs have user accounts"
        });
    } catch (err: any) {
        console.error("Debug error:", err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
