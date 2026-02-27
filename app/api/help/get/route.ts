import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
    try {
        const supabase = createServerClient();

        const { data: records, error } = await supabase
            .from('help_content')
            .select('role_name, help_items');

        if (error || !records || records.length === 0) {
            // Return default if empty or error (table may not exist)
            return NextResponse.json({
                success: true,
                data: {
                    ADMIN: ["Create a client", "Assign Service Center and CPA", "Set initial stage or tasks"],
                    CLIENT: ["Check Inbox and Tasks", "Upload required documents", "Ask a question if blocked"],
                    SERVICE_CENTER: ["Review client uploads", "Assign tasks to client", "Leave feedback notes"],
                    CPA: ["Review documents", "Set stage for assigned clients", "Create CPA tasks"],
                }
            });
        }

        const helpData: Record<string, string[]> = {};
        for (const row of records) {
            helpData[row.role_name] = Array.isArray(row.help_items) ? row.help_items : JSON.parse(row.help_items as any);
        }

        return NextResponse.json({ success: true, data: helpData });

    } catch (err: any) {
        console.error("GET /api/help/get error:", err);
        return NextResponse.json({
            success: true,
            data: {
                ADMIN: ["Create a client", "Assign Service Center and CPA", "Set initial stage or tasks"],
                CLIENT: ["Check Inbox and Tasks", "Upload required documents", "Ask a question if blocked"],
                SERVICE_CENTER: ["Review client uploads", "Assign tasks to client", "Leave feedback notes"],
                CPA: ["Review documents", "Set stage for assigned clients", "Create CPA tasks"],
            }
        });
    }
}
