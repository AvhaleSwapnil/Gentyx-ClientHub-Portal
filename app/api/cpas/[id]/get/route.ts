import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request, { params }: any) {
    try {
        const { id } = await params;
        const numericId = Number(id);
        
        const supabase = createServerClient();

        const { data: cpa, error } = await supabase
            .from('cpa_centers')
            .select('*')
            .eq('cpa_id', numericId)
            .single();

        if (error || !cpa) {
            return NextResponse.json({ success: false, message: "CPA not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: cpa,
        });
    } catch (err: any) {
        console.error("GET /api/cpas/[id]/get error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
