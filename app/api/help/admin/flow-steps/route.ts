import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST - Add new flow step
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { role_id, title, description, icon_name, step_type, display_order } = body;

        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('help_flow_steps')
            .insert({
                role_id,
                title,
                description,
                icon_name: icon_name || null,
                step_type: step_type || "action",
                display_order: display_order || 0
            })
            .select('step_id')
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            step_id: data?.step_id,
        });
    } catch (err: any) {
        console.error("POST /api/help/admin/flow-steps error:", err);
        return NextResponse.json({ success: false, error: "Failed to add flow step" }, { status: 500 });
    }
}

// PUT - Update flow step
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { step_id, title, description, icon_name, step_type, display_order } = body;

        const supabase = createServerClient();

        const { error } = await supabase
            .from('help_flow_steps')
            .update({
                title,
                description,
                icon_name: icon_name || null,
                step_type: step_type || "action",
                display_order
            })
            .eq('step_id', step_id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Flow step updated successfully" });
    } catch (err: any) {
        console.error("PUT /api/help/admin/flow-steps error:", err);
        return NextResponse.json({ success: false, error: "Failed to update flow step" }, { status: 500 });
    }
}

// DELETE - Remove flow step
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const step_id = searchParams.get("id");

        if (!step_id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        const supabase = createServerClient();

        const { error } = await supabase
            .from('help_flow_steps')
            .delete()
            .eq('step_id', parseInt(step_id));

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Flow step deleted successfully" });
    } catch (err: any) {
        console.error("DELETE /api/help/admin/flow-steps error:", err);
        return NextResponse.json({ success: false, error: "Failed to delete flow step" }, { status: 500 });
    }
}
