import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const DEFAULT_PASSWORD = "Cpa@12345";

export async function POST() {
    try {
        const supabase = createServerClient();

        // 1. Get all CPAs that don't have a user account yet
        const { data: cpas, error: cpaError } = await supabase
            .from('cpa_centers')
            .select('cpa_id, cpa_name, email');

        if (cpaError) throw cpaError;

        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('email');

        if (userError) throw userError;

        const userEmails = new Set((users || []).map(u => u.email?.toLowerCase()));
        const cpasToCreate = (cpas || []).filter(cpa => cpa.email && !userEmails.has(cpa.email.toLowerCase()));

        let createdCount = 0;
        const createdList: string[] = [];

        for (const cpa of cpasToCreate) {
            try {
                const { error: insertError } = await supabase
                    .from('Users')
                    .insert({
                        email: cpa.email,
                        password: DEFAULT_PASSWORD,
                        role: "CPA"
                    });

                if (insertError) throw insertError;

                createdCount++;
                createdList.push(cpa.email);
            } catch (insertErr: any) {
                console.error(`❌ Failed to create user for CPA ${cpa.email}:`, insertErr.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${createdCount} CPA(s) to Users table. Default password: ${DEFAULT_PASSWORD}`,
            created: createdCount,
            createdEmails: createdList,
            total: cpasToCreate.length
        });
    } catch (err: any) {
        console.error("CPA sync error:", err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

// Also allow GET for easy testing
export async function GET() {
    return POST();
}
