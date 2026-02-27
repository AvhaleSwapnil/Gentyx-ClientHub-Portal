import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { helpData } = body;

        if (!helpData || typeof helpData !== "object") {
            return NextResponse.json({ success: false, error: "Invalid help data" }, { status: 400 });
        }

        const supabase = createServerClient();

        // Prepare data for upsert
        const upsertData = Object.entries(helpData).map(([roleName, items]) => ({
            role_name: roleName,
            help_items: items, // Supabase handles JSON types automatically if column is jsonb/json
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('help_content')
            .upsert(upsertData, { onConflict: 'role_name' });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Help content updated successfully" });

    } catch (err: any) {
        console.error("POST /api/help/update error:", err);
        return NextResponse.json({ success: false, error: err.message || "Failed to update help content" }, { status: 500 });
    }
}
